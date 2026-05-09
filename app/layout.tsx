import type { Metadata } from "next";
import { Jua } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pilih Jalanmu",
  description: "Tes pemilihan jurusan dan karir untuk siswa SMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jua.className}>
      <body className="min-h-screen flex flex-col bg-brand-bg text-brand-blue">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
