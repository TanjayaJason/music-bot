begin;

create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('admin');
create type public.extraction_status as enum ('pending','processing','ready_for_review','completed','failed');
create type public.publication_status as enum ('draft','published','archived','superseded');
create type public.document_type as enum ('table','long_form','mixed');
create type public.review_status as enum ('needs_review','approved');
create type public.message_role as enum ('user','assistant');
create type public.feedback_rating as enum ('helpful','not_helpful');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  original_filename text not null,
  category text not null,
  description text,
  document_type public.document_type not null default 'mixed',
  document_date date,
  effective_date date,
  effective_until date,
  revision_label text,
  authority_rank smallint not null default 0 check (authority_rank between 0 and 100),
  supersedes_document_id uuid references public.documents(id) on delete set null,
  storage_path text not null unique,
  page_count integer check (page_count is null or page_count > 0),
  extraction_status public.extraction_status not null default 'pending',
  publication_status public.publication_status not null default 'draft',
  extraction_error text,
  extraction_warnings jsonb not null default '[]'::jsonb,
  uploaded_by uuid not null references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_until is null or effective_date is null or effective_until >= effective_date),
  check (supersedes_document_id is null or supersedes_document_id <> id)
);

create table public.document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_start integer not null check (page_start > 0),
  page_end integer not null check (page_end >= page_start),
  section_title text,
  section_type text not null check (section_type in ('heading','paragraph','table','mixed')),
  structured_content jsonb,
  extracted_text text not null,
  review_status public.review_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  section_id uuid not null references public.document_sections(id) on delete cascade,
  page_start integer not null,
  page_end integer not null,
  chunk_index integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(768) not null,
  search_vector tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  rating public.feedback_rating not null,
  comment text,
  created_at timestamptz not null default now(),
  unique(message_id)
);

create table public.rate_limits (
  client_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  primary key(client_key, window_start)
);

create index documents_publication_idx on public.documents(publication_status, extraction_status);
create index documents_effective_idx on public.documents(effective_date, effective_until);
create index sections_document_idx on public.document_sections(document_id, page_start);
create index chunks_document_idx on public.document_chunks(document_id);
create index chunks_search_idx on public.document_chunks using gin(search_vector);
create index chunks_embedding_idx on public.document_chunks using hnsw(embedding extensions.vector_cosine_ops);
create index messages_session_idx on public.chat_messages(session_id, created_at);
create index rate_limits_cleanup_idx on public.rate_limits(window_start);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger documents_updated before update on public.documents for each row execute function public.set_updated_at();
create trigger sections_updated before update on public.document_sections for each row execute function public.set_updated_at();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin');
$$;

create function public.check_public_rate_limit(client_key_input text, hourly_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_window timestamptz := date_trunc('hour', now()); current_count integer;
begin
  delete from public.rate_limits where window_start < now() - interval '2 hours';
  insert into public.rate_limits(client_key, window_start, request_count)
  values (client_key_input, current_window, 1)
  on conflict(client_key, window_start) do update set request_count = public.rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= greatest(1, hourly_limit);
end $$;

create function public.hybrid_search_published_chunks(
  query_text text,
  query_embedding extensions.vector(768),
  match_count integer default 7,
  filter_date date default null
) returns table (
  document_id uuid, document_title text, page_start integer, page_end integer,
  section_title text, content text, metadata jsonb, combined_score real
) language sql stable security definer set search_path = '' as $$
  with ranked as (
    select c.document_id, d.title document_title, c.page_start, c.page_end,
      s.section_title, c.content, c.metadata,
      (1 - (c.embedding OPERATOR(extensions.<=>) query_embedding))::real vector_score,
      ts_rank_cd(c.search_vector, websearch_to_tsquery('simple', query_text))::real text_score,
      d.authority_rank
    from public.document_chunks c
    join public.documents d on d.id = c.document_id
    join public.document_sections s on s.id = c.section_id
    where d.publication_status = 'published'
      and d.extraction_status = 'completed'
      and (d.effective_date is null or d.effective_date <= current_date)
      and (d.effective_until is null or d.effective_until >= current_date)
      and not exists (
        select 1 from public.documents replacement
        where replacement.supersedes_document_id = d.id
          and replacement.publication_status = 'published'
          and replacement.extraction_status = 'completed'
      )
      and (filter_date is null or d.document_date = filter_date or d.effective_date = filter_date
        or c.metadata->>'celebration_date' = filter_date::text
        or c.content ilike '%' || to_char(filter_date, 'DD FMMonth YYYY') || '%')
  )
  select document_id, document_title, page_start, page_end, section_title, content, metadata,
    (vector_score * .62 + least(text_score, 1) * .33 + authority_rank::real / 2000)::real combined_score
  from ranked order by combined_score desc limit least(greatest(match_count, 1), 12);
$$;

create function public.replace_document_index(target_document_id uuid, section_payload jsonb, chunk_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare section_item jsonb; chunk_item jsonb; section_ids uuid[] := '{}'; new_section_id uuid; index_counter integer := 0;
begin
  delete from public.document_sections where document_id = target_document_id;
  for section_item in select value from jsonb_array_elements(section_payload) loop
    insert into public.document_sections(document_id,page_start,page_end,section_title,section_type,structured_content,extracted_text,review_status)
    values(target_document_id,(section_item->>'pageStart')::integer,(section_item->>'pageEnd')::integer,section_item->>'title',section_item->>'type',section_item->'structuredContent',section_item->>'text',case when coalesce((section_item->>'needsReview')::boolean,false) then 'needs_review'::public.review_status else 'approved'::public.review_status end)
    returning id into new_section_id;
    section_ids := array_append(section_ids,new_section_id);
  end loop;
  for chunk_item in select value from jsonb_array_elements(chunk_payload) loop
    insert into public.document_chunks(document_id,section_id,page_start,page_end,chunk_index,content,metadata,embedding)
    values(target_document_id,section_ids[(chunk_item->>'sectionIndex')::integer+1],(chunk_item->>'pageStart')::integer,(chunk_item->>'pageEnd')::integer,index_counter,chunk_item->>'content',coalesce(chunk_item->'metadata','{}'::jsonb),(chunk_item->>'embedding')::extensions.vector);
    index_counter := index_counter + 1;
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.feedback enable row level security;
alter table public.rate_limits enable row level security;

create policy "profile sendiri dapat dibaca" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "admin kelola dokumen" on public.documents for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "publik baca dokumen terbit" on public.documents for select to anon,authenticated using (publication_status='published' and extraction_status='completed');
create policy "admin kelola bagian" on public.document_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "publik baca bagian terbit" on public.document_sections for select to anon,authenticated using (exists(select 1 from public.documents d where d.id=document_id and d.publication_status='published' and d.extraction_status='completed'));
create policy "admin kelola chunk" on public.document_chunks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin lihat sesi" on public.chat_sessions for select to authenticated using (public.is_admin());
create policy "admin lihat pesan" on public.chat_messages for select to authenticated using (public.is_admin());
create policy "admin lihat masukan" on public.feedback for select to authenticated using (public.is_admin());

revoke all on function public.hybrid_search_published_chunks(text,extensions.vector,integer,date) from public,anon,authenticated;
revoke all on function public.check_public_rate_limit(text,integer) from public,anon,authenticated;
revoke all on function public.replace_document_index(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.hybrid_search_published_chunks(text,extensions.vector,integer,date) to service_role;
grant execute on function public.check_public_rate_limit(text,integer) to service_role;
grant execute on function public.replace_document_index(uuid,jsonb,jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('documents','documents',false,8388608,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "admin unggah pdf" on storage.objects for insert to authenticated with check (bucket_id='documents' and public.is_admin());
create policy "admin baca pdf" on storage.objects for select to authenticated using (bucket_id='documents' and public.is_admin());
create policy "admin hapus pdf" on storage.objects for delete to authenticated using (bucket_id='documents' and public.is_admin());

commit;

-- Bootstrap admin (jalankan manual setelah membuat user Supabase Auth):
-- insert into public.profiles(user_id, role) values ('UUID_USER_AUTH', 'admin');
