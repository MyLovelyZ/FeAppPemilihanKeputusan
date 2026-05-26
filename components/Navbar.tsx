"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin")) return null;

  return (
    <>
        {/* Dim backdrop — pointer-events-none so page stays interactive */}
      <div
       className={`fixed inset-0 z-[25] bg-brand-bg/75 transition-opacity duration-200 pointer-events-none ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Mobile: tap anywhere outside navbar to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[26] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className="sticky top-0 z-[30]"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Centered logo */}
        <header className="flex justify-center py-4 px-8">
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle navigasi"
            className="cursor-pointer"
          >
            <Image
              src="/PemilihanLogo.png"
              alt="Pilih Jalanmu"
              width={70}
              height={58}
              priority
            />
          </button>
        </header>

        {/* Dropdown nav panel */}
        <div
          className={`absolute left-0 right-0 px-8 pb-6 transition-all duration-200 ${
            isOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-[260px] h-[150px] bg-brand-gradient text-white rounded-2xl flex items-center justify-center text-[20px] text-center hover:opacity-90 transition-opacity"
            >
              Back to
              <br />
              Homepage
            </Link>

            <div className="flex flex-col gap-4 w-full sm:w-[260px]">
              <Link
                href="/test/jurusan"
                onClick={() => setIsOpen(false)}
                className="h-[67px] bg-brand-gradient text-white rounded-2xl flex items-center px-5 text-[16px] hover:opacity-90 transition-opacity"
              >
                Tes Pemilihan Jurusan
              </Link>
              <Link
                href="/test/karir"
                onClick={() => setIsOpen(false)}
                className="h-[67px] bg-brand-gradient text-white rounded-2xl flex items-center px-5 text-[16px] hover:opacity-90 transition-opacity"
              >
                Tes Pemilihan Karir
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
