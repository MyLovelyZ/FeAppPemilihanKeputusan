"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";
import { adminLogout } from "@/lib/api";

export default function AdminSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      try { await adminLogout(token); } catch {}
    }
    removeToken();
    router.push("/");
  };

  return (
    <aside className="w-[300px] min-h-screen flex-shrink-0 flex flex-col border-r border-gray-100">
      {/* Header */}
      <div className="bg-brand-gradient px-7 py-6">
        <p className="text-white font-bold text-[22px]">Pemilihan</p>
        <p className="text-white/70 italic text-[15px]">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="px-7 py-7 flex-1">
        <Link
          href="/admin"
          className="flex items-center justify-between text-brand-blue font-bold text-[18px] border-b-2 border-brand-blue pb-2 hover:opacity-80 transition-opacity"
        >
          <span>Quizzes</span>
          <span>→</span>
        </Link>
      </nav>

      {/* Bottom actions */}
      <div className="px-7 pb-7 flex flex-col gap-3">
        <Link href="/superadmin/login" className="text-brand-blue text-[13px] underline">
          To Superadmin Login
        </Link>
        <button
          onClick={handleLogout}
          className="w-full h-[70px] bg-brand-gradient text-white rounded-2xl flex items-center justify-between px-5 hover:opacity-90 transition-opacity"
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
