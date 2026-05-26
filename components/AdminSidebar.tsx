"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken, clearAuth } from "@/lib/auth";
import { adminLogout } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/questions", label: "Pertanyaan" },
  { href: "/admin/profile", label: "Profil" },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      try { await adminLogout(token); } catch {}
    }
    clearAuth();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[260px] min-h-screen flex-shrink-0 flex flex-col border-r border-gray-100">
      <div className="bg-brand-gradient px-7 py-6">
        <p className="text-white font-bold text-[22px]">Pemilihan</p>
        <p className="text-white/70 italic text-[15px]">Admin Panel</p>
      </div>

      <nav className="px-5 py-5 flex-1 flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
              isActive(item.href)
                ? "bg-brand-gradient text-white"
                : "text-brand-blue hover:bg-brand-blue/10"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <button
          onClick={handleLogout}
          className="w-full h-[64px] bg-brand-gradient text-white rounded-2xl flex items-center justify-between px-5 hover:opacity-90 transition-opacity"
        >
          <span className="text-[15px] font-bold text-left leading-tight">
            Log Out &<br />Return to Site
          </span>
          <span className="text-[20px]">↗</span>
        </button>
      </div>
    </aside>
  );
}
