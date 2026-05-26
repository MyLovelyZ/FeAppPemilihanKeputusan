"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import {
  adminGetQuiz,
  adminUpdateQuestion,
  adminUpdateOption,
  adminCreateQuestion,
  adminGetQuizGrades,
  adminCreateQuizGrade,
  adminUpdateQuizGrade,
  adminDeleteQuizGrade,
  adminDeleteQuestion,
  adminCreateOption,
  adminDeleteOption,
  adminUpdateQuiz,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Question } from "@/lib/api";

type GradeRow = { id?: number; label: string; min_point: number; max_point: number };

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

  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);
  const [gradesSaved, setGradesSaved] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin/login"); return; }

    Promise.all([
      adminGetQuiz(token, quizId),
      adminGetQuizGrades(token, quizId),
    ])
      .then(([quiz, fetchedGrades]) => {
        setQuizTitle(quiz.title);
        setQuestions(quiz.questions);
        setGrades(fetchedGrades.map(({ id, label, min_point, max_point }) => ({ id, label, min_point, max_point })));
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [quizId, router]);

  const q = questions[selected];

  // — Question handlers —

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

  const updateOptionPoint = (optIdx: number, point: number) => {
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== selected) return item;
        const options = item.options.map((o, oi) =>
          oi === optIdx ? { ...o, point } : o
        );
        return { ...item, options };
      })
    );
    setSaved(false);
  };

  const handleAddOption = async () => {
    const token = getToken();
    if (!token || !q) return;
    try {
      const newOpt = await adminCreateOption(token, { question_id: q.id, option_text: "", point: 0 });
      setQuestions((prev) =>
        prev.map((item, i) => i === selected ? { ...item, options: [...item.options, newOpt] } : item)
      );
    } catch {}
  };

  const handleDeleteOption = (optIdx: number) => {
    const opt = q?.options[optIdx];
    if (!opt) return;
    setQuestions((prev) =>
      prev.map((item, i) => i === selected ? { ...item, options: item.options.filter((_, oi) => oi !== optIdx) } : item)
    );
    const token = getToken();
    if (token) adminDeleteOption(token, opt.id).catch(() => {});
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token || !q) return;
    setSaving(true);
    try {
      await adminUpdateQuestion(token, q.id, { question_text: q.question_text });
      for (const opt of q.options) {
        await adminUpdateOption(token, opt.id, { option_text: opt.option_text, point: opt.point });
      }
      setSaved(true);
    } catch {}
    finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (i: number) => {
    if (!window.confirm("Hapus pertanyaan ini?")) return;
    const token = getToken();
    if (!token) return;
    const qId = questions[i].id;
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
    setSelected((prev) => Math.min(prev, questions.length - 2));
    adminDeleteQuestion(token, qId).catch(() => {});
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

  // — Grade handlers —

  const updateGrade = (i: number, field: keyof GradeRow, value: string | number) => {
    setGrades((prev) => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
    setGradesSaved(false);
  };

  const addGrade = () => {
    setGrades((prev) => [...prev, { label: "", min_point: 0, max_point: 0 }]);
    setGradesSaved(false);
  };

  const deleteGrade = (i: number) => {
    const grade = grades[i];
    setGrades((prev) => prev.filter((_, idx) => idx !== i));
    if (grade.id) {
      const token = getToken();
      if (token) adminDeleteQuizGrade(token, grade.id).catch(() => {});
    }
  };

  const saveGrades = async () => {
    const token = getToken();
    if (!token) return;
    setSavingGrades(true);
    try {
      const saved = await Promise.all(
        grades.map((g) =>
          g.id
            ? adminUpdateQuizGrade(token, g.id, { label: g.label, min_point: g.min_point, max_point: g.max_point })
            : adminCreateQuizGrade(token, { quiz_id: quizId, label: g.label, min_point: g.min_point, max_point: g.max_point })
        )
      );
      setGrades(saved.map(({ id, label, min_point, max_point }) => ({ id, label, min_point, max_point })));
      setGradesSaved(true);
    } catch {}
    finally { setSavingGrades(false); }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      {/* Questions list panel */}
      <div className="w-[280px] border-r border-gray-100 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-100">
          <input
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            onBlur={() => {
              const token = getToken();
              if (token && quizTitle.trim()) adminUpdateQuiz(token, quizId, { title: quizTitle }).catch(() => {});
            }}
            className="w-full text-brand-blue font-bold text-[20px] outline-none bg-transparent border-b-2 border-transparent focus:border-brand-blue transition-colors"
            placeholder="Quiz title..."
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {loading ? (
            <p className="text-brand-blue/40 text-[14px] px-2">Loading...</p>
          ) : questions.map((item, i) => (
            <div key={item.id} className="group flex items-center gap-1">
              <button
                onClick={() => { setSelected(i); setSaved(false); }}
                className={`flex-1 text-left px-4 py-2.5 rounded-xl text-[13px] transition-colors truncate ${
                  i === selected
                    ? "bg-brand-gradient text-white"
                    : "text-brand-blue hover:bg-brand-blue/10"
                }`}
              >
                {item.question_text}
              </button>
              <button
                onClick={() => handleDeleteQuestion(i)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-brand-blue/30 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
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
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <p className="text-brand-blue/40">Loading...</p>
        ) : (
          <div className="flex flex-col gap-10 max-w-[700px]">

            {/* Question editor */}
            {q ? (
              <div className="flex flex-col gap-8">
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

                <div className="flex gap-6 flex-wrap">
                  {q.options.map((opt, oi) => (
                    <div
                      key={opt.id}
                      className="w-[240px] border-2 border-brand-blue rounded-2xl flex flex-col p-5 gap-3"
                    >
                      <textarea
                        value={opt.option_text}
                        onChange={(e) => updateOptionText(oi, e.target.value)}
                        placeholder={`Answer ${oi + 1}`}
                        className="flex-1 min-h-[180px] resize-none outline-none text-center text-brand-blue/60 text-[15px] bg-transparent placeholder:text-brand-blue/30 leading-relaxed"
                      />
                      <div className="flex items-center justify-between border-t border-brand-blue/20 pt-3">
                        <button
                          onClick={() => handleDeleteOption(oi)}
                          className="text-brand-blue/30 hover:text-red-500 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-blue/50 text-[12px]">Score</span>
                          <input
                            type="number"
                            value={opt.point}
                            onChange={(e) => updateOptionPoint(oi, parseInt(e.target.value) || 0)}
                            className="w-16 text-right text-brand-blue font-bold text-[14px] outline-none bg-transparent border-b border-brand-blue/30 focus:border-brand-blue"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddOption}
                    className="w-[240px] h-[268px] border-2 border-dashed border-brand-blue/30 text-brand-blue/40 rounded-2xl flex items-center justify-center text-[13px] hover:border-brand-blue hover:text-brand-blue transition-colors"
                  >
                    + Tambah Opsi
                  </button>
                </div>

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
            ) : (
              <p className="text-brand-blue/40">Pilih pertanyaan di sebelah kiri.</p>
            )}

            {/* Grade ranges */}
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-8">
              <h3 className="text-brand-blue font-bold text-[18px]">Grade Ranges</h3>

              {grades.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-[1fr_80px_80px_36px] gap-3 px-1">
                    <span className="text-brand-blue/50 text-[12px]">Label</span>
                    <span className="text-brand-blue/50 text-[12px] text-center">Min</span>
                    <span className="text-brand-blue/50 text-[12px] text-center">Max</span>
                    <span />
                  </div>
                  {grades.map((g, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px_36px] gap-3 items-center">
                      <input
                        value={g.label}
                        onChange={(e) => updateGrade(i, "label", e.target.value)}
                        placeholder="Label..."
                        className="border border-brand-blue/20 rounded-lg px-3 py-2 text-brand-blue text-[14px] outline-none focus:border-brand-blue bg-transparent"
                      />
                      <input
                        type="number"
                        value={g.min_point}
                        onChange={(e) => updateGrade(i, "min_point", parseInt(e.target.value) || 0)}
                        className="border border-brand-blue/20 rounded-lg px-3 py-2 text-brand-blue text-[14px] outline-none focus:border-brand-blue bg-transparent text-center"
                      />
                      <input
                        type="number"
                        value={g.max_point}
                        onChange={(e) => updateGrade(i, "max_point", parseInt(e.target.value) || 0)}
                        className="border border-brand-blue/20 rounded-lg px-3 py-2 text-brand-blue text-[14px] outline-none focus:border-brand-blue bg-transparent text-center"
                      />
                      <button
                        onClick={() => deleteGrade(i)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-brand-blue/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addGrade}
                className="self-start px-4 py-2 border-2 border-dashed border-brand-blue/30 text-brand-blue/60 rounded-xl text-[13px] hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                + Tambah Grade
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={saveGrades}
                  disabled={savingGrades || grades.length === 0}
                  className="px-8 py-3 bg-brand-gradient text-white rounded-xl text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingGrades ? "Menyimpan..." : "Simpan Grades"}
                </button>
                {gradesSaved && <span className="text-green-600 text-[14px]">Tersimpan ✓</span>}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
