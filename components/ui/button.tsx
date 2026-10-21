import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"danger"; size?: "sm"|"md"|"lg" };
export function Button({ className, variant="primary", size="md", ...props }: Props) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",size==="sm"&&"h-10 px-4 text-sm",size==="md"&&"h-11 px-5 text-sm",size==="lg"&&"h-13 px-6",variant==="primary"&&"bg-[#b4232d] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#8f1721] hover:shadow-md",variant==="secondary"&&"border border-[#d0d5dd] bg-white text-[#102a43] hover:bg-[#f2f4f7]",variant==="ghost"&&"text-[#475467] hover:bg-[#f2f4f7]",variant==="danger"&&"bg-red-700 text-white hover:bg-red-800",className)} {...props}/>;
}
