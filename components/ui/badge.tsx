import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-semibold text-[#a61b29]",className)} {...props}/>; }
