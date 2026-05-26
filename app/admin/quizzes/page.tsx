"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import { adminGetQuizzes, adminDeleteQuiz } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import type { Quiz } from "@/lib/api";

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }

    adminGetQuizzes(token)
      .then(setQuizzes)
      .catch(() => { removeToken(); router.push("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (quiz: Quiz) => {
    if (!window.confirm(`Hapus quiz "${quiz.title}"? Semua pertanyaan dan opsinya juga akan dihapus.`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(quiz.id);
    try {
      await adminDeleteQuiz(token, quiz.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
    } catch {
      setError("Gagal menghapus quiz.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-brand-blue font-bold text-[28px]">Quiz</h1>
          <Link
            href="/admin/quizzes/create"
            className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity"
          >
            Buat Quiz <span className="text-[18px] font-bold">+</span>
          </Link>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-brand-blue/40">Memuat...</p>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16 text-brand-blue/40">
            Belum ada quiz.{" "}
            <Link href="/admin/quizzes/create" className="text-brand-blue underline">Buat quiz pertama.</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60">Judul</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60 hidden md:table-cell">Deskripsi</th>
                  <th className="text-right px-5 py-3 font-medium text-brand-blue/60">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-brand-blue">
                      <Link href={`/admin/quizzes/${quiz.id}`} className="hover:opacity-70">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-brand-blue/50 hidden md:table-cell max-w-xs truncate">
                      {quiz.description || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/quizzes/${quiz.id}`}
                          className="px-3 py-1 text-xs font-medium text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(quiz)}
                          disabled={deletingId === quiz.id}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === quiz.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
