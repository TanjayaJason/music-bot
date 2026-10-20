import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Musica Liturgia AI", template: "%s · Musica Liturgia AI" },
  description: "Asisten pengetahuan musik liturgi berbasis dokumen terverifikasi.",
};

export const viewport: Viewport = { themeColor: "#b4232d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
