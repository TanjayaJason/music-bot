import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
export const dynamic = "force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){let user;try{user=await requireAdmin()}catch{redirect("/login")}return <AdminShell email={user.email??"Administrator"}>{children}</AdminShell>}
