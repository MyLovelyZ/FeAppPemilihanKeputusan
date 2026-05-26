"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { adminCreateQuiz } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function QuizCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    setError("");
    setSaving(true);
    try {
      const quiz = await adminCreateQuiz(token, { title, description: description || undefined });
      router.push(`/superadmin/quizzes/${quiz.id}`);
    } catch {
      setError("Gagal membuat quiz. Coba lagi.");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/superadmin/quizzes" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>
          <h1 className="text-brand-blue font-bold text-[28px]">Buat Quiz Baru</h1>
        </div>

        <div className="max-w-xl">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-[14px]">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Judul Quiz</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul quiz"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Deskripsi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi quiz (opsional)"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="px-6 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Membuat..." : "Buat Quiz"}
                </button>
                <Link
                  href="/superadmin/quizzes"
                  className="px-6 py-2.5 border-2 border-gray-200 text-brand-blue/60 rounded-xl text-[14px] hover:border-brand-blue/30 transition-colors"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
