"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  superadminGetAdmin,
  superadminGetAdminQuizzes,
  superadminToggleBan,
  superadminDeleteAdmin,
  superadminDeleteAdminQuiz,
  extractErrorMessage,
} from "@/lib/api";
import { getToken, isSuperadmin } from "@/lib/auth";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quizDeleteTarget, setQuizDeleteTarget] = useState<Quiz | null>(null);
  const [quizDeleteLoading, setQuizDeleteLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    if (!isSuperadmin()) { router.push("/superadmin/login"); return; }

    Promise.all([
      superadminGetAdmin(token, adminId),
      superadminGetAdminQuizzes(token, adminId),
    ])
      .then(([a, q]) => {
        setAdmin(a);
        setQuizzes(q);
      })
      .catch((err) => setError(extractErrorMessage(err, "Admin tidak ditemukan.")))
      .finally(() => setLoading(false));
  }, [adminId, router]);

  const handleBan = async () => {
    const token = getToken();
    if (!token || !admin) return;
    setBanLoading(true);
    try {
      const updated = await superadminToggleBan(token, adminId);
      setAdmin(updated);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal mengubah status ban."));
    } finally {
      setBanLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return;
    setDeleteLoading(true);
    try {
      await superadminDeleteAdmin(token, adminId);
      router.push("/superadmin/admins");
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal menghapus admin."));
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizDeleteTarget) return;
    const token = getToken();
    if (!token) return;
    setQuizDeleteLoading(true);
    try {
      await superadminDeleteAdminQuiz(token, quizDeleteTarget.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizDeleteTarget.id));
      setQuizDeleteTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal menghapus quiz."));
    } finally {
      setQuizDeleteLoading(false);
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

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus Admin"
        message={`Akun admin "${admin?.name}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteLoading}
      />
      <ConfirmDialog
        open={!!quizDeleteTarget}
        title="Hapus Quiz Admin"
        message={`Quiz "${quizDeleteTarget?.title}" milik admin ini akan dihapus.`}
        confirmLabel="Hapus"
        tone="danger"
        onConfirm={handleDeleteQuiz}
        onCancel={() => setQuizDeleteTarget(null)}
        loading={quizDeleteLoading}
      />

      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/superadmin/admins" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>
              <h1 className="text-brand-blue font-bold text-[28px] mt-1">{admin?.name}</h1>
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
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                Hapus Admin
              </button>
            </div>
          </div>

          <Alert type="error" message={error} />

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
                          onClick={() => setQuizDeleteTarget(quiz)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
