"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import {
  adminGetQuestion,
  adminUpdateQuestion,
  adminUpdateOption,
  adminDeleteOption,
  adminCreateOption,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Option } from "@/lib/api";

type OptionDraft = Option & { _delete?: boolean; _new?: boolean };

export default function QuestionEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qId = parseInt(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<OptionDraft[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }

    adminGetQuestion(token, qId)
      .then((q) => {
        setQuestionText(q.question_text);
        setOptions(q.options.map((o) => ({ ...o, _delete: false, _new: false })));
      })
      .catch(() => setError("Pertanyaan tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [qId, router]);

  const updateOptionField = (idx: number, field: keyof Option, value: string | number) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const markDelete = (idx: number) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, _delete: true } : o));
  };

  const unmarkDelete = (idx: number) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, _delete: false } : o));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { id: -Date.now(), option_text: "", point: 0, _new: true, _delete: false }]);
  };

  const removeNewOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const activeOptions = options.filter((o) => !o._delete);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }
    setError("");
    setSaving(true);

    try {
      await adminUpdateQuestion(token, qId, { question_text: questionText });

      for (const opt of options) {
        if (opt._delete && !opt._new) {
          await adminDeleteOption(token, opt.id);
        } else if (opt._new && !opt._delete) {
          await adminCreateOption(token, { question_id: qId, option_text: opt.option_text, point: opt.point });
        } else if (!opt._delete && !opt._new) {
          await adminUpdateOption(token, opt.id, { option_text: opt.option_text, point: opt.point });
        }
      }

      router.push("/admin/questions");
    } catch {
      setError("Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8"><p className="text-brand-blue/40">Memuat...</p></main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/questions" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>
          <h1 className="text-brand-blue font-bold text-[28px]">Edit Pertanyaan</h1>
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
                <label className="text-[13px] font-medium text-brand-blue">Teks Pertanyaan</label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
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
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${opt._delete ? "opacity-40" : ""}`}
                  >
                    <span className="text-[13px] text-brand-blue/40 w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      required={!opt._delete}
                      disabled={opt._delete}
                      placeholder="Teks opsi"
                      value={opt.option_text}
                      onChange={(e) => updateOptionField(idx, "option_text", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors disabled:bg-gray-50"
                    />
                    <input
                      type="number"
                      required={!opt._delete}
                      min={0}
                      disabled={opt._delete}
                      placeholder="Poin"
                      value={opt.point}
                      onChange={(e) => updateOptionField(idx, "point", parseInt(e.target.value) || 0)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors text-center disabled:bg-gray-50"
                    />
                    {opt._delete ? (
                      <button
                        type="button"
                        onClick={() => unmarkDelete(idx)}
                        className="text-[12px] text-brand-blue underline whitespace-nowrap"
                      >
                        Urungkan
                      </button>
                    ) : opt._new ? (
                      <button
                        type="button"
                        onClick={() => removeNewOption(idx)}
                        className="text-brand-blue/30 hover:text-red-500 text-xl leading-none w-6"
                      >
                        ×
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markDelete(idx)}
                        disabled={activeOptions.length <= 2}
                        className="text-brand-blue/30 hover:text-red-500 disabled:opacity-30 text-xl leading-none w-6"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-[12px] text-brand-blue/40">Opsi yang ditandai hapus akan dihapus saat menyimpan.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <Link
                  href="/admin/questions"
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
