"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import { adminGetQuizzes, adminCreateQuiz } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import type { Quiz } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }

    adminGetQuizzes(token)
      .then((data) => setQuizzes(data))
      .catch(() => { removeToken(); router.push("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleNewEntry = async () => {
    const token = getToken();
    if (!token) return;
    setCreating(true);
    try {
      const quiz = await adminCreateQuiz(token, { title: "Pemilihan Jurusan Atau Kuliah" });
      router.push(`/admin/quizzes/${quiz.id}`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <button
          onClick={handleNewEntry}
          disabled={creating}
          className="mb-8 flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          New Entry <span className="text-[18px] font-bold">+</span>
        </button>

        {loading ? (
          <p className="text-brand-blue/50">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-brand-blue/50">Belum ada quiz. Buat yang pertama!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} href={`/admin/quizzes/${quiz.id}`}>
                <div className="h-[280px] bg-brand-gradient text-white rounded-2xl p-6 flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer">
                  <h3 className="text-[20px] font-bold leading-tight">{quiz.title}</h3>
                  <div className="flex justify-end text-[22px]">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
