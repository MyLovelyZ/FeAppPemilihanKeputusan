"use client";

import Link from "next/link";

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideNav({ isOpen, onClose }: SideNavProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-brand-blue text-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-3xl leading-none text-white hover:opacity-70 transition-opacity"
            aria-label="Tutup navigasi"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-col gap-6 px-8 py-4">
          <Link href="/" onClick={onClose} className="text-lg hover:underline">
            Home
          </Link>
          <Link href="/test/jurusan" onClick={onClose} className="text-lg hover:underline">
            Tes Pemilihan Jurusan
          </Link>
          <Link href="/test/karir" onClick={onClose} className="text-lg hover:underline">
            Tes Pemilihan Karir
          </Link>
        </nav>
      </div>
    </>
  );
}
