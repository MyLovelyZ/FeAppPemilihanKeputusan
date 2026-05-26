"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { adminGetQuestions, adminDeleteQuestion } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import type { Question } from "@/lib/api";

export default function QuestionListPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }

    adminGetQuestions(token)
      .then(setQuestions)
      .catch(() => { removeToken(); router.push("/superadmin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (q: Question) => {
    if (!window.confirm("Hapus pertanyaan ini beserta semua opsi jawabannya?")) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(q.id);
    try {
      await adminDeleteQuestion(token, q.id);
      setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    } catch {
      setError("Gagal menghapus pertanyaan.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-brand-blue font-bold text-[28px]">Pertanyaan</h1>
          <Link
            href="/superadmin/questions/create"
            className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity"
          >
            Buat Pertanyaan <span className="text-[18px] font-bold">+</span>
          </Link>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-brand-blue/40">Memuat...</p>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-brand-blue/40">
            Belum ada pertanyaan.{" "}
            <Link href="/superadmin/questions/create" className="text-brand-blue underline">Buat pertanyaan pertama.</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60">Pertanyaan</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60 hidden md:table-cell">Quiz</th>
                  <th className="text-right px-5 py-3 font-medium text-brand-blue/60">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-brand-blue max-w-sm">
                      <p className="truncate">{q.question_text}</p>
                    </td>
                    <td className="px-5 py-3 text-brand-blue/50 hidden md:table-cell">
                      {q.quiz?.title || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/superadmin/questions/${q.id}/edit`}
                          className="px-3 py-1 text-xs font-medium text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(q)}
                          disabled={deletingId === q.id}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === q.id ? "..." : "Hapus"}
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
