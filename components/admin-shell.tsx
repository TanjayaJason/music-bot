"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText,Home,LayoutDashboard,LogOut,Settings,Upload } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const links=[["/admin",LayoutDashboard,"Ringkasan"],["/admin/dokumen",BookOpenText,"Dokumen"],["/admin/dokumen/upload",Upload,"Unggah"],["/admin/pengaturan",Settings,"Pengaturan"]] as const;

export function AdminShell({children,email}:{children:React.ReactNode;email:string}){
  const pathname=usePathname();
  const active=(href:string)=>{
    if(href==="/admin")return pathname===href;
    if(href==="/admin/dokumen")return pathname===href||(pathname.startsWith(`${href}/`)&&!pathname.startsWith("/admin/dokumen/upload"));
    return pathname===href||pathname.startsWith(`${href}/`);
  };
  return <div className="min-h-screen bg-[#f8fafc]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e5e7eb] bg-white p-5 lg:flex lg:flex-col"><Link href="/" aria-label="Kembali ke beranda"><BrandMark/></Link><nav className="mt-10 space-y-1" aria-label="Navigasi administrator">{links.map(([href,Icon,label])=><Link key={href} href={href} aria-current={active(href)?"page":undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active(href)?"bg-[#fff1f2] text-[#a61b29]":"text-[#475467] hover:bg-[#f8fafc] hover:text-[#a61b29]"}`}><Icon className="size-4"/>{label==="Unggah"?"Unggah PDF":label}</Link>)}</nav><div className="mt-auto border-t border-[#e5e7eb] pt-4"><p className="truncate text-xs text-[#667085]">{email}</p><form action="/auth/signout" method="post"><button className="tap-target mt-1 flex items-center gap-2 rounded-lg text-sm font-semibold text-[#a61b29]"><LogOut className="size-4"/>Keluar</button></form></div></aside>
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#e5e7eb] bg-white/95 px-3 py-2 backdrop-blur lg:hidden"><Link href="/" aria-label="Kembali ke beranda"><BrandMark compact/></Link><div className="flex items-center gap-1"><Link href="/" aria-label="Beranda publik" className="tap-target grid place-items-center rounded-full text-[#102a43] hover:bg-[#f2f4f7]"><Home className="size-5"/></Link><form action="/auth/signout" method="post"><button aria-label="Keluar" className="tap-target grid place-items-center rounded-full text-[#a61b29] hover:bg-[#fff1f2]"><LogOut className="size-5"/></button></form></div></header>
    <main id="main-content" className="p-4 pb-28 sm:p-8 sm:pb-28 lg:ml-64 lg:p-10">{children}</main>
    <nav aria-label="Navigasi administrator mobile" className="safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white/95 p-1 shadow-[0_16px_48px_rgba(16,42,67,.18)] backdrop-blur lg:hidden">{links.map(([href,Icon,label])=><Link key={href} href={href} aria-current={active(href)?"page":undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition ${active(href)?"bg-[#fff1f2] text-[#a61b29]":"text-[#667085] hover:bg-[#f8fafc]"}`}><Icon className="size-4"/><span>{label}</span></Link>)}</nav>
  </div>;
}
