"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import {
  superadminGetAdmin,
  superadminGetAdminQuizzes,
  superadminToggleBan,
  superadminDeleteAdmin,
  superadminDeleteAdminQuiz,
} from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import type { AdminEntry, Quiz } from "@/lib/api";

export default function AdminDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const adminId = parseInt(id);

  const [admin, setAdmin] = useState<AdminEntry | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banLoading, setBanLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quizDeleteId, setQuizDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }

    Promise.all([
      superadminGetAdmin(token, adminId),
      superadminGetAdminQuizzes(token, adminId),
    ])
      .then(([a, q]) => {
        setAdmin(a);
        setQuizzes(q);
      })
      .catch(() => { clearAuth(); router.push("/superadmin/login"); })
      .finally(() => setLoading(false));
  }, [adminId, router]);

  const handleBan = async () => {
    if (!admin) return;
    const token = getToken();
    if (!token) return;
    setBanLoading(true);
    try {
      const updated = await superadminToggleBan(token, adminId);
      setAdmin(updated);
    } catch {
      setError("Gagal mengubah status ban.");
    } finally {
      setBanLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Hapus akun admin "${admin?.name}" secara permanen?`)) return;
    const token = getToken();
    if (!token) return;
    setDeleteLoading(true);
    try {
      await superadminDeleteAdmin(token, adminId);
      router.push("/superadmin/admins");
    } catch {
      setError("Gagal menghapus admin.");
      setDeleteLoading(false);
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!window.confirm(`Hapus quiz "${quiz.title}" milik admin ini?`)) return;
    const token = getToken();
    if (!token) return;
    setQuizDeleteId(quiz.id);
    try {
      await superadminDeleteAdminQuiz(token, quiz.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
    } catch {
      setError("Gagal menghapus quiz.");
    } finally {
      setQuizDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SuperadminSidebar />
        <main className="flex-1 p-8"><p className="text-brand-blue/40">Memuat...</p></main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <Link href="/superadmin/admins" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mt-4 mb-8">
          <div>
            <h1 className="text-brand-blue font-bold text-[28px]">{admin?.name}</h1>
            <p className="text-brand-blue/50 text-[14px]">{admin?.email}</p>
            <div className="mt-2">
              {admin?.banned_at ? (
                <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                  Di-ban sejak {new Date(admin.banned_at).toLocaleDateString("id-ID")}
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">Aktif</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleBan}
              disabled={banLoading}
              className={`px-4 py-2 text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50 ${
                admin?.banned_at
                  ? "text-green-700 bg-green-50 hover:bg-green-100"
                  : "text-orange-600 bg-orange-50 hover:bg-orange-100"
              }`}
            >
              {banLoading ? "..." : admin?.banned_at ? "Unban" : "Ban"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? "Menghapus..." : "Hapus Admin"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-brand-blue font-bold text-[18px]">Quiz Milik Admin Ini</h2>
          </div>

          {quizzes.length === 0 ? (
            <div className="px-6 py-10 text-center text-brand-blue/40 text-[14px]">
              Admin ini belum memiliki quiz.
            </div>
          ) : (
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60">Judul</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60 hidden md:table-cell">Pertanyaan</th>
                  <th className="text-right px-5 py-3 font-medium text-brand-blue/60">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-brand-blue">{quiz.title}</td>
                    <td className="px-5 py-3 text-brand-blue/50 hidden md:table-cell">
                      {quiz.questions_count ?? quiz.questions?.length ?? 0} soal
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteQuiz(quiz)}
                        disabled={quizDeleteId === quiz.id}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {quizDeleteId === quiz.id ? "..." : "Hapus"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
