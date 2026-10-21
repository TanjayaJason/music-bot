import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { PublicNav } from "@/components/public-nav";
import { DocumentLibrary } from "@/components/document-library";
import { Badge } from "@/components/ui/badge";
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
  return <><PublicNav/><main id="main-content" className="shell min-h-[70vh] py-12 sm:py-20">
    <div className="max-w-2xl"><Badge>Perpustakaan sumber</Badge><h1 className="serif mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Dokumen rujukan terbit</h1><p className="mt-4 text-base leading-7 text-[#716b61]">Dokumen yang tampil di sini telah diproses, ditinjau, dan diterbitkan oleh administrator.</p></div>
    <DocumentLibrary documents={documents.map((doc)=>({...doc,formattedDate:formatDate(doc.document_date)}))}/>
  </main><Footer/></>;
}
