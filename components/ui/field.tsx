import * as React from "react";
import { cn } from "@/lib/utils";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={cn("h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm shadow-sm placeholder:text-[#98a2b3]",props.className)}/>; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={cn("w-full rounded-xl border border-[#d0d5dd] bg-white px-3 py-3 text-sm shadow-sm placeholder:text-[#98a2b3]",props.className)}/>; }
export function Label({ children, htmlFor }: { children:React.ReactNode; htmlFor?:string }) { return <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-[#344054]">{children}</label>; }
