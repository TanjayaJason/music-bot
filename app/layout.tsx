import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CHORD", template: "%s · CHORD" },
  description: "CHORD adalah asisten pengetahuan musik liturgi berbasis dokumen terverifikasi.",
};

export const viewport: Viewport = { themeColor: "#b4232d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" data-scroll-behavior="smooth"><body><a href="#main-content" className="skip-link">Lewati ke konten utama</a>{children}</body></html>;
}
