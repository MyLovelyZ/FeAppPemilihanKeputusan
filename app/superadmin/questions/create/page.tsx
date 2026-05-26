"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { adminGetQuizzes, adminCreateQuestion } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Quiz } from "@/lib/api";

type OptionDraft = { option_text: string; point: number };

function QuestionCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetQuizId = searchParams.get("quiz_id") || "";

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizId, setQuizId] = useState(presetQuizId);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<OptionDraft[]>([
    { option_text: "", point: 0 },
    { option_text: "", point: 0 },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    adminGetQuizzes(token).then(setQuizzes).catch(() => {});
  }, [router]);

  const updateOption = (idx: number, field: keyof OptionDraft, value: string | number) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const addOption = () => setOptions((prev) => [...prev, { option_text: "", point: 0 }]);

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    setError("");
    setSaving(true);
    try {
      await adminCreateQuestion(token, {
        quiz_id: parseInt(quizId),
        question_text: questionText,
        options,
      });
      router.push("/superadmin/questions");
    } catch {
      setError("Gagal membuat pertanyaan. Coba lagi.");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/superadmin/questions" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>
          <h1 className="text-brand-blue font-bold text-[28px]">Buat Pertanyaan Baru</h1>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-[14px]">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Quiz</label>
                <select
                  required
                  value={quizId}
                  onChange={(e) => setQuizId(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors bg-white"
                >
                  <option value="">-- Pilih Quiz --</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Teks Pertanyaan</label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Masukkan teks pertanyaan"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-brand-blue">Opsi Jawaban</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-[13px] text-brand-blue underline hover:opacity-70"
                  >
                    + Tambah Opsi
                  </button>
                </div>

                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[13px] text-brand-blue/40 w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      required
                      placeholder="Teks opsi"
                      value={opt.option_text}
                      onChange={(e) => updateOption(idx, "option_text", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                    />
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Poin"
                      value={opt.point}
                      onChange={(e) => updateOption(idx, "point", parseInt(e.target.value) || 0)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={options.length <= 2}
                      className="text-brand-blue/30 hover:text-red-500 disabled:opacity-30 text-xl leading-none w-6"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <p className="text-[12px] text-brand-blue/40">Minimal 2 opsi. &quot;Poin&quot; adalah nilai jika opsi ini dipilih.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !quizId || !questionText.trim()}
                  className="px-6 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Membuat..." : "Buat Pertanyaan"}
                </button>
                <Link
                  href="/superadmin/questions"
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

export default function QuestionCreatePage() {
  return (
    <Suspense>
      <QuestionCreateForm />
    </Suspense>
  );
}
