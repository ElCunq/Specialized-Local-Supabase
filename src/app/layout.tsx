import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "db.orfa.dev - Lightweight Multi-Tenant BaaS Control Plane",
  description: "Self-Hosted Multi-Tenant BaaS Orchestration platform & Traefik Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="antialiased bg-[#080c14] text-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
