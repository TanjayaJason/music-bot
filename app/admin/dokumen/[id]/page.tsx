import { notFound } from "next/navigation";
import { DocumentDetail } from "@/components/document-detail";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export default async function DocumentDetailPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const supabase=createSupabaseAdminClient();const [{data:document},{data:sections},{data:documents}]=await Promise.all([supabase.from("documents").select("*").eq("id",id).single(),supabase.from("document_sections").select("*").eq("document_id",id).order("page_start"),supabase.from("documents").select("id,title").neq("id",id).order("title")]);if(!document)notFound();return <DocumentDetail document={document} sections={sections??[]} documents={documents??[]}/>}
