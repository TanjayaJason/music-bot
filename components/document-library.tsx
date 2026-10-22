"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpenText, CalendarDays, FileSearch, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface DocumentItem {
  id:string;
  title:string;
  category:string;
  description:string|null;
  document_type:string;
  document_date:string|null;
  revision_label:string|null;
  formattedDate:string;
}

export function DocumentLibrary({documents}:{documents:DocumentItem[]}) {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("Semua");
  const categories=useMemo(()=>["Semua",...Array.from(new Set(documents.map((document)=>document.category))).sort()], [documents]);
  const filtered=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase("id");
    return documents.filter((document)=>(category==="Semua"||document.category===category)&&(!normalized||`${document.title} ${document.description??""} ${document.category}`.toLocaleLowerCase("id").includes(normalized)));
  },[category,documents,query]);

  if(documents.length===0)return <Card className="mt-10 flex flex-col items-center p-8 text-center sm:mt-12 sm:p-12"><span className="grid size-16 place-items-center rounded-3xl bg-[#fff1f2] text-[#b4232d]"><BookOpenText className="size-7"/></span><h2 className="serif mt-5 text-2xl font-semibold">Belum ada dokumen terbit</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#475467]">Dokumen akan tampil di sini setelah ditinjau dan diterbitkan oleh administrator. CHORD memerlukan dokumen terbit untuk memberikan jawaban bersumber.</p><Link href="/" className="tap-target mt-6 inline-flex items-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-5 text-sm font-semibold text-[#102a43] transition hover:bg-[#f2f4f7]">Kembali ke beranda <ArrowRight className="size-4"/></Link></Card>;

  return <div className="mt-10">
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <label className="relative flex-1"><span className="sr-only">Cari dokumen</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]"/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Cari judul, kategori, atau isi ringkas…" className="h-12 w-full rounded-xl border border-[#d0d5dd] bg-[#fcfcfd] pl-10 pr-3 text-sm outline-none transition focus:border-[#b4232d] focus:ring-2 focus:ring-[#fee4e2]"/></label>
      <label><span className="sr-only">Filter kategori</span><select value={category} onChange={(event)=>setCategory(event.target.value)} className="h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#344054] sm:w-48">{categories.map((item)=><option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#667085]"><p><strong className="text-[#172033]">{filtered.length}</strong> dokumen ditemukan</p>{(query||category!=="Semua")&&<button type="button" onClick={()=>{setQuery("");setCategory("Semua")}} className="tap-target rounded-full px-3 text-sm font-semibold text-[#a61b29] hover:bg-[#fff1f2]">Atur ulang</button>}</div>
    {filtered.length?<div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.map((document)=><a key={document.id} href={`/api/documents/${document.id}/preview`} target="_blank" rel="noreferrer" className="group rounded-3xl focus:outline-none"><Card className="interactive-card flex h-full flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f3ead7] text-[#87662f]"><FileText className="size-5"/></span><Badge>{document.category}</Badge></div><h2 className="serif mt-5 text-2xl font-semibold leading-tight transition group-hover:text-[#a61b29]">{document.title}</h2><p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#746e64]">{document.description||"Dokumen rujukan Musica Liturgia."}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eee8dc] pt-4"><p className="flex min-w-0 items-center gap-2 text-xs text-[#80786c]"><CalendarDays className="size-3.5 shrink-0"/><span className="truncate">{document.formattedDate}{document.revision_label&&` · ${document.revision_label}`}</span></p><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#a61b29]">Buka <ArrowUpRight className="size-3.5"/></span></div></Card></a>)}</div>:<Card className="mt-5 flex flex-col items-center p-10 text-center"><FileSearch className="size-8 text-[#98a2b3]"/><h2 className="mt-4 font-bold">Dokumen tidak ditemukan</h2><p className="mt-1 text-sm text-[#667085]">Coba kata kunci atau kategori yang berbeda.</p></Card>}
  </div>;
}
