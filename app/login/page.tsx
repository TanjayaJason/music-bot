import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { getAdmin } from "@/lib/auth/admin";
import { hasPublicSupabaseConfig } from "@/lib/config";
export default async function LoginPage(){if(hasPublicSupabaseConfig()&&await getAdmin())redirect("/admin");return <main className="paper-grid grid min-h-screen place-items-center p-5"><div className="w-full max-w-md rounded-[2rem] border border-[#ded4c1] bg-white p-7 shadow-[0_24px_80px_rgba(55,43,26,.12)] sm:p-9"><BrandMark/><h1 className="serif mt-9 text-3xl font-semibold">Masuk sebagai administrator</h1><p className="mt-2 text-sm leading-6 text-[#756f65]">Kelola dokumen, peninjauan ekstraksi, dan publikasi basis pengetahuan.</p><LoginForm configured={hasPublicSupabaseConfig()}/></div></main>}
