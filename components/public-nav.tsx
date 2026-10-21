"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";

const links = [["/chat","Konsultasi"],["/dokumen","Dokumen"]] as const;

export function PublicNav(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const isActive=(href:string)=>pathname===href||pathname.startsWith(`${href}/`);
  return <header className="sticky top-0 z-40 border-b border-[#e5e7eb]/90 bg-white/92 backdrop-blur-xl" style={{viewTransitionName:"site-header"}}>
    <nav className="shell flex min-h-18 items-center justify-between gap-3 py-2" aria-label="Navigasi utama">
      <Link href="/" aria-label="Beranda CHORD" onClick={()=>setOpen(false)}><BrandMark/></Link>
      <div className="hidden items-center gap-1 text-sm font-semibold text-[#475467] sm:flex">{links.map(([href,label])=><Link key={href} aria-current={isActive(href)?"page":undefined} className={`tap-target inline-flex items-center rounded-full px-4 transition hover:bg-[#fff1f2] hover:text-[#a61b29] ${isActive(href)?"bg-[#fff1f2] text-[#a61b29]":""}`} href={href}>{label}</Link>)}<Link aria-current={isActive("/login")?"page":undefined} className="tap-target inline-flex items-center rounded-full border border-[#b4232d] px-5 text-[#a61b29] transition hover:bg-[#fff1f2]" href="/login">Admin</Link></div>
      <button type="button" className="tap-target grid place-items-center rounded-full border border-[#e5e7eb] bg-white text-[#102a43] shadow-sm sm:hidden" aria-label={open?"Tutup menu":"Buka menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen((value)=>!value)}>{open?<X className="size-5"/>:<Menu className="size-5"/>}</button>
    </nav>
    <div id="mobile-menu" className={`border-t border-[#e5e7eb] bg-white px-3 pb-3 pt-2 shadow-lg sm:hidden ${open?"block":"hidden"}`}><div className="mx-auto grid max-w-lg gap-1">{links.map(([href,label])=><Link key={href} aria-current={isActive(href)?"page":undefined} onClick={()=>setOpen(false)} className={`tap-target flex items-center rounded-xl px-4 text-sm font-semibold ${isActive(href)?"bg-[#fff1f2] text-[#a61b29]":"text-[#344054] hover:bg-[#f8fafc]"}`} href={href}>{label}</Link>)}<Link onClick={()=>setOpen(false)} className="tap-target mt-1 flex items-center justify-center rounded-xl bg-[#b4232d] px-4 text-sm font-bold text-white" href="/login">Masuk sebagai admin</Link></div></div>
  </header>;
}
