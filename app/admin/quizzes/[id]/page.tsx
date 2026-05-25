"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import {
  adminGetQuiz,
  adminUpdateQuestion,
  adminUpdateOption,
  adminCreateQuestion,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Question } from "@/lib/api";

export default function QuizEditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const quizId = parseInt(id);

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }

    adminGetQuiz(token, quizId)
      .then((quiz) => {
        setQuizTitle(quiz.title);
        setQuestions(quiz.questions);
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [quizId, router]);

  const q = questions[selected];

  const updateQuestionText = (text: string) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === selected ? { ...item, question_text: text } : item))
    );
    setSaved(false);
  };

  const updateOptionText = (optIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== selected) return item;
        const options = item.options.map((o, oi) =>
          oi === optIdx ? { ...o, option_text: text } : o
        );
        return { ...item, options };
      })
    );
    setSaved(false);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token || !q) return;
    setSaving(true);
    try {
      await adminUpdateQuestion(token, q.id, { question_text: q.question_text });
      for (const opt of q.options) {
        await adminUpdateOption(token, opt.id, { option_text: opt.option_text });
      }
      setSaved(true);
    } catch {}
    finally { setSaving(false); }
  };

  const handleAddQuestion = async () => {
    const token = getToken();
    if (!token) return;
    setAddingQuestion(true);
    try {
      const newQ = await adminCreateQuestion(token, {
        quiz_id: quizId,
        question_text: "Pertanyaan baru",
        options: [
          { option_text: "Opsi A", point: 1 },
          { option_text: "Opsi B", point: 0 },
        ],
      });
      setQuestions((prev) => [...prev, newQ]);
      setSelected(questions.length);
    } catch {}
    finally { setAddingQuestion(false); }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      {/* Questions list panel */}
      <div className="w-[280px] border-r border-gray-100 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-brand-blue font-bold text-[20px]">Pertanyaan</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {loading ? (
            <p className="text-brand-blue/40 text-[14px] px-2">Loading...</p>
          ) : questions.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setSelected(i); setSaved(false); }}
              className={`text-left px-4 py-2.5 rounded-xl text-[13px] transition-colors truncate ${
                i === selected
                  ? "bg-brand-gradient text-white"
                  : "text-brand-blue hover:bg-brand-blue/10"
              }`}
            >
              {item.question_text}
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={handleAddQuestion}
            disabled={addingQuestion}
            className="w-full py-2.5 border-2 border-dashed border-brand-blue/30 text-brand-blue/60 rounded-xl text-[13px] hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-50"
          >
            {addingQuestion ? "Menambah..." : "+ Tambah Pertanyaan"}
          </button>
        </div>
      </div>

      {/* Editor panel */}
      <main className="flex-1 p-8">
        {loading ? (
          <p className="text-brand-blue/40">Loading...</p>
        ) : !q ? (
          <p className="text-brand-blue/40">Pilih pertanyaan di sebelah kiri.</p>
        ) : (
          <div className="flex flex-col gap-8 max-w-[700px]">
            {/* Question text input */}
            <div className="flex items-center gap-3 border-b-2 border-brand-blue pb-3">
              <input
                value={q.question_text}
                onChange={(e) => updateQuestionText(e.target.value)}
                className="flex-1 text-brand-blue font-bold text-[20px] outline-none bg-transparent"
                placeholder="Teks pertanyaan..."
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20319C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>

            {/* Answer cards */}
            <div className="flex gap-6 flex-wrap">
              {q.options.map((opt, oi) => (
                <div
                  key={opt.id}
                  className="w-[240px] h-[260px] border-2 border-brand-blue rounded-2xl flex items-center justify-center p-5"
                >
                  <textarea
                    value={opt.option_text}
                    onChange={(e) => updateOptionText(oi, e.target.value)}
                    placeholder={`Answer ${oi + 1}`}
                    className="w-full h-full resize-none outline-none text-center text-brand-blue/60 text-[15px] bg-transparent placeholder:text-brand-blue/30 leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* Save button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-brand-gradient text-white rounded-xl text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              {saved && <span className="text-green-600 text-[14px]">Tersimpan ✓</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
