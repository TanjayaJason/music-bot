import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { PublicNav } from "@/components/public-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return <>
    <PublicNav />
    <main id="main-content">
      <section className="paper-grid relative overflow-hidden border-b border-[#e5e7eb] py-10 sm:py-16 lg:py-24">
        <div className="absolute -right-20 top-8 size-72 rounded-full bg-[#fee4e2]/60 blur-3xl sm:left-1/2 sm:right-auto sm:size-96 sm:-translate-x-1/2" aria-hidden="true" />
        <div className="shell relative grid items-center gap-9 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <div className="animate-rise">
            <Badge><Sparkles className="mr-1.5 size-3.5" />Pengetahuan yang bersumber jelas</Badge>
            <h1 className="serif mt-4 max-w-3xl text-[clamp(2.25rem,8vw,3.25rem)] font-semibold leading-[1.1] tracking-[-.035em] text-[#172033] sm:mt-6 sm:text-6xl lg:text-[4.25rem]">
              Menemukan pedoman musik liturgi, <span className="italic text-[#b4232d]">tanpa menebak.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#475467] sm:mt-7 sm:text-lg sm:leading-8">
              Tanyakan jadwal, rekomendasi nyanyian, dan pedoman pelayanan. Jawaban disusun dari dokumen Musica Liturgia yang telah ditinjau dan diterbitkan.
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row sm:mt-9">
              <Link href="/chat" className="tap-target inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b4232d] px-6 font-semibold text-white shadow-lg shadow-[#b4232d]/15 transition hover:-translate-y-0.5 hover:bg-[#8f1721]">Mulai bertanya <ArrowRight className="size-4" /></Link>
              <Link href="/dokumen" className="tap-target inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-6 font-semibold text-[#102a43] transition hover:-translate-y-0.5 hover:bg-[#f2f4f7]"><BookOpenText className="size-4" />Lihat dokumen</Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#475467]"><ShieldCheck className="size-4 shrink-0 text-[#102a43]" />Sumber jawaban dapat diperiksa kembali.</p>
          </div>

          <Card className="animate-rise-delay relative overflow-hidden border-[#e3d9d6] p-3 sm:p-5">
            <div className="music-staff pointer-events-none absolute -right-12 -top-9 size-48 rotate-[-12deg] rounded-full opacity-60" aria-hidden="true"><span className="absolute right-12 top-12 font-serif text-7xl text-[#b4232d]/20">♪</span></div>
            <div className="relative rounded-2xl bg-[#f8fafc] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#b4232d] text-white"><MessageCircle className="size-4" /></span><div><p className="text-sm font-bold">Contoh percakapan</p><p className="text-xs text-[#475467]">Lihat cara CHORD menjawab</p></div></div>
                <span className="rounded-full border border-[#ead5d7] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9f1d29]">Ilustrasi</span>
              </div>
              <div className="ml-auto max-w-[89%] rounded-2xl rounded-br-md bg-[#b4232d] px-4 py-3 text-sm leading-6 text-white">Apa pedoman pemilihan nyanyian pembuka?</div>
              <div className="mt-3 max-w-[96%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[#344054] shadow-sm">CHORD menelusuri dokumen terbit, merangkum bagian yang relevan, lalu menunjukkan halaman yang menjadi dasar jawaban.</div>
              <div className="mt-3 rounded-xl border border-[#dbe3eb] bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#a61b29]">Rujukan pada jawaban</p><p className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-[#344054]">Judul dokumen · nomor halaman <ArrowUpRight className="size-3.5 shrink-0 text-[#b4232d]" /></p></div>
              <p className="mt-3 text-[11px] leading-4 text-[#667085]">Ilustrasi alur. Kutipan dan halaman asli muncul ketika dokumen tersedia.</p>
            </div>
          </Card>
        </div>
      </section>
      <section className="border-b border-[#e5e7eb] bg-white" aria-labelledby="chord-name"><div className="shell flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:gap-8"><p id="chord-name" className="serif shrink-0 text-2xl font-bold tracking-[.08em] text-[#b4232d] sm:text-3xl">CHORD</p><div className="h-px w-full bg-[#e5e7eb] sm:h-10 sm:w-px"/><div><p className="text-sm font-bold text-[#172033]">Catholic Hymn Options, Rules, &amp; Directives</p><p className="mt-1 text-sm leading-6 text-[#667085]">Asisten untuk menelusuri pilihan nyanyian, pedoman, dan ketentuan musik liturgi dari dokumen yang telah ditinjau.</p></div></div></section>
      <section className="shell py-16 sm:py-20"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#b4232d]">Cara kerja</p><h2 className="serif mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sederhana bagi pengguna, teliti di belakang layar</h2></div><div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">{[[BookOpenText,"Dokumen ditinjau","Hanya dokumen yang sudah diperiksa admin dapat menjadi sumber jawaban."],[CalendarDays,"Pencarian yang tepat","Tanggal, nama perayaan, dan nomor lagu dicari dengan gabungan kata kunci dan makna."],[CheckCircle2,"Sumber dapat diperiksa","Setiap jawaban menyertakan dokumen dan halaman agar mudah diverifikasi."]].map(([Icon,title,description])=><Card key={String(title)} className="interactive-card p-6 sm:p-7"><span className="grid size-11 place-items-center rounded-2xl bg-[#fff1f2] text-[#b4232d]"><Icon className="size-5"/></span><h3 className="serif mt-5 text-2xl font-semibold">{title as string}</h3><p className="mt-3 text-sm leading-7 text-[#667085]">{description as string}</p></Card>)}</div></section>
      <section className="bg-[#102a43] py-16 text-white"><div className="shell flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#fda4af]">Siap mencari?</p><h2 className="serif mt-2 max-w-xl text-3xl font-semibold sm:text-4xl">Ajukan pertanyaan dan periksa sumbernya.</h2></div><Link href="/chat" className="tap-target inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-[#a61b29] transition hover:bg-[#fff1f2]">Buka asisten <ArrowRight className="size-4"/></Link></div></section>
    </main>
    <Footer />
  </>;
}
