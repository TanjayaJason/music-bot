import Image from "next/image";

export function BrandMark({ compact=false }: { compact?:boolean }) {
  return <div className={compact?"flex items-center gap-2":"flex items-center gap-3"}>
    <span className="flex shrink-0 items-center gap-1.5" aria-label="Paroki Mangga Besar dan Seksi Liturgi">
      <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white p-0.5 shadow-sm">
        <Image src="/brand/logo-paroki.png" alt="Logo Paroki Mangga Besar" width={40} height={40} className="h-full w-full object-contain" priority/>
      </span>
      <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white p-0.5 shadow-sm">
        <Image src="/brand/logo-seksi-liturgi.png" alt="Logo Seksi Liturgi" width={40} height={40} className="h-full w-full object-contain" priority/>
      </span>
    </span>
    <span className={`serif block font-bold tracking-[.08em] text-[#b4232d] ${compact?"text-lg":"text-xl"}`}>CHORD</span>
  </div>;
}
