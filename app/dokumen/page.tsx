import type { Metadata } from "next";
import { BookOpenText, CalendarDays, FileText } from "lucide-react";
import { Footer } from "@/components/footer";
import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { hasPublicSupabaseConfig } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dokumen Rujukan" };
interface PublicDocument { id:string; title:string; category:string; description:string|null; document_type:string; document_date:string|null; revision_label:string|null }

export default async function DocumentsPage() {
  let documents: PublicDocument[] = [];
  if (hasPublicSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.from("documents")
      .select("id,title,category,description,document_type,document_date,revision_label")
      .eq("publication_status", "published").eq("extraction_status", "completed")
      .order("document_date", { ascending: false });
    documents = result.data ?? [];
  }
  return <><PublicNav/><main className="shell min-h-[70vh] py-14 sm:py-20">
    <div className="max-w-2xl"><Badge>Perpustakaan sumber</Badge><h1 className="serif mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Dokumen rujukan terbit</h1><p className="mt-4 text-base leading-7 text-[#716b61]">Dokumen yang tampil di sini telah diproses, ditinjau, dan diterbitkan oleh administrator.</p></div>
    {documents.length === 0 ? <Card className="mt-12 flex flex-col items-center p-12 text-center"><span className="grid size-16 place-items-center rounded-3xl bg-[#f2ead9] text-[#84652f]"><BookOpenText className="size-7"/></span><h2 className="serif mt-5 text-2xl font-semibold">Belum ada dokumen terbit</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#746e64]">Administrator perlu mengunggah, meninjau, dan menerbitkan dokumen sebelum dapat digunakan oleh asisten.</p></Card> :
      <div className="mt-10 grid gap-4 md:grid-cols-2">{documents.map((doc) => <Card key={doc.id} className="p-6"><div className="flex items-start justify-between gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f3ead7] text-[#87662f]"><FileText className="size-5"/></span><Badge>{doc.category}</Badge></div><h2 className="serif mt-5 text-2xl font-semibold leading-tight">{doc.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#746e64]">{doc.description || "Dokumen rujukan Musica Liturgia."}</p><div className="mt-5 flex items-center gap-2 border-t border-[#eee8dc] pt-4 text-xs text-[#80786c]"><CalendarDays className="size-3.5"/>{formatDate(doc.document_date)}{doc.revision_label && <span>· {doc.revision_label}</span>}</div></Card>)}</div>}
  </main><Footer/></>;
}
