"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { adminGetQuizzes, adminGetQuestions, superadminGetAdmins } from "@/lib/api";
import { getToken, removeToken, isSuperadmin } from "@/lib/auth";

function StatCard({ label, value, to, loading }: { label: string; value: number; to: string; loading: boolean }) {
  return (
    <Link href={to} className="h-[140px] bg-brand-gradient text-white rounded-2xl px-6 py-5 flex flex-col justify-between hover:opacity-90 transition-opacity">
      <p className="text-white/70 text-[14px]">{label}</p>
      <p className="text-[48px] font-bold leading-none">
        {loading ? "—" : value}
      </p>
    </Link>
  );
}

export default function SuperadminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ quizzes: 0, questions: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    if (!isSuperadmin()) { router.push("/superadmin/login"); return; }

    const load = async () => {
      try {
        const [quizzes, questions, admins] = await Promise.all([
          adminGetQuizzes(token),
          adminGetQuestions(token),
          superadminGetAdmins(token),
        ]);
        setStats({ quizzes: quizzes.length, questions: questions.length, admins: admins.length });
      } catch {
        removeToken();
        router.push("/superadmin/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-brand-blue font-bold text-[28px]">Dashboard</h1>
          <p className="text-brand-blue/50 text-[15px] mt-1">Selamat datang di Sistem Quiz Pemilihan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <StatCard label="Total Quiz" value={stats.quizzes} to="/superadmin/quizzes" loading={loading} />
          <StatCard label="Total Pertanyaan" value={stats.questions} to="/superadmin/questions" loading={loading} />
          <StatCard label="Total Admin" value={stats.admins} to="/superadmin/admins" loading={loading} />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-brand-blue font-bold text-[18px] mb-4">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/superadmin/quizzes/create"
              className="px-5 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity"
            >
              Buat Quiz Baru
            </Link>
            <Link
              href="/superadmin/questions/create"
              className="px-5 py-2.5 border-2 border-brand-blue/30 text-brand-blue rounded-xl text-[14px] hover:border-brand-blue transition-colors"
            >
              Buat Pertanyaan
            </Link>
            <Link
              href="/superadmin/admins/create"
              className="px-5 py-2.5 border-2 border-brand-blue/30 text-brand-blue rounded-xl text-[14px] hover:border-brand-blue transition-colors"
            >
              Tambah Admin
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
