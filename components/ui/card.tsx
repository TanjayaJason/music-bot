import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-3xl border border-[#e5e7eb] bg-white shadow-[0_18px_60px_rgba(16,42,67,.07)]",className)} {...props}/>; }
