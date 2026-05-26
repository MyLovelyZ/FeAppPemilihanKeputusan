"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicQuiz, submitPublicQuiz, sendResultEmail } from "@/lib/api";
import type { Quiz, PublicQuizResult } from "@/lib/api";

function ResultCard({
  score,
  result,
  totalQuestions,
  onRetry,
}: {
  score: number;
  result: PublicQuizResult;
  totalQuestions: number;
  onRetry: () => void;
}) {
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSending(true);
    try {
      const total = result.max_point ?? totalQuestions;
      const grade = result.grade_label ?? "Tidak ada penilaian";
      await sendResultEmail({ email, score, total, grade });
      setEmailSent(true);
    } catch {
      setEmailError("Gagal mengirim email. Coba lagi.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-8 py-16 gap-10">
      <div className="text-center">
        <p className="text-[28px] font-bold text-brand-blue">Selamat!</p>
        <p className="text-[18px] text-brand-blue/70 mt-1">Kamu sudah menyelesaikan tes-nya!</p>
      </div>

      <div className="w-full max-w-sm bg-brand-gradient text-white rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
        <p className="text-white/70 text-[14px]">Total Poin</p>
        <p className="text-[64px] font-bold leading-none">{score}</p>
        {result.grade_label ? (
          <div className="flex flex-col items-center gap-1">
            <span className="px-5 py-2 bg-white/20 rounded-full text-[16px] font-bold">
              {result.grade_label}
            </span>
            {result.min_point != null && result.max_point != null && (
              <p className="text-white/60 text-[12px]">
                Rentang: {result.min_point} – {result.max_point} poin
              </p>
            )}
          </div>
        ) : (
          <p className="text-white/60 text-[13px]">Tidak ada penilaian untuk skor ini.</p>
        )}
      </div>

      <div className="w-full max-w-sm">
        {emailSent ? (
          <p className="text-center text-brand-blue font-medium text-[14px]">Email berhasil dikirim!</p>
        ) : (
          <form onSubmit={handleSendEmail} className="flex flex-col gap-3">
            <p className="text-brand-blue/60 text-[13px] text-center">Kirim hasil ke email kamu:</p>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-brand-blue/20 rounded-xl px-4 py-2.5 text-[14px] text-brand-blue outline-none focus:border-brand-blue bg-transparent"
              />
              <button
                type="submit"
                disabled={emailSending}
                className="px-4 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                {emailSending ? "..." : "Kirim"}
              </button>
            </div>
            {emailError && <p className="text-red-500 text-[12px] text-center">{emailError}</p>}
          </form>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-6 py-2.5 border-2 border-brand-blue/30 text-brand-blue rounded-2xl text-[15px] hover:border-brand-blue transition-colors"
        >
          Coba Lagi
        </button>
        <Link
          href="/test"
          className="px-6 py-2.5 bg-brand-gradient text-white rounded-2xl text-[15px] hover:opacity-90 transition-opacity"
        >
          Quiz Lain
        </Link>
      </div>
    </main>
  );
}

export default function TestTakePage() {
  const { id } = useParams<{ id: string }>();
  const quizId = parseInt(id);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{ score: number; data: PublicQuizResult } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const badgeRef = useRef<HTMLDivElement>(null);

  const loadQuiz = () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    setCurrentIdx(0);
    getPublicQuiz(quizId)
      .then(setQuiz)
      .catch(() => setError("Quiz tidak ditemukan atau server tidak tersedia."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuiz(); }, [quizId]);

  const questions = quiz?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx];

  useEffect(() => {
    const el = badgeRef.current;
    if (!el || totalQuestions === 0) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCurrentIdx((c) => e.deltaY > 0 ? Math.min(c + 1, totalQuestions - 1) : Math.max(c - 1, 0));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [totalQuestions]);

  const navigateTo = (idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIdx(idx);
      setVisible(true);
    }, 200);
  };

  const handleSelect = async (questionId: number, optionId: number) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);

    if (currentIdx < totalQuestions - 1) {
      navigateTo(currentIdx + 1);
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      const optionIds = Object.values(updated);
      const data = await submitPublicQuiz(quizId, optionIds);
      setResult({ score: data.score, data });
    } catch {
      setSubmitError("Gagal mengirim jawaban. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <ResultCard
        score={result.score}
        result={result.data}
        totalQuestions={totalQuestions}
        onRetry={loadQuiz}
      />
    );
  }

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-8 py-16">
        <p className="text-brand-blue/50 text-[18px]">Memuat soal...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-8 py-16 gap-4">
        <p className="text-brand-blue text-[18px]">{error}</p>
        <Link href="/test" className="text-brand-blue underline text-[14px]">← Kembali ke daftar quiz</Link>
      </main>
    );
  }

  if (totalQuestions === 0) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-8 py-16">
        <p className="text-brand-blue text-[18px]">Quiz ini belum memiliki pertanyaan.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-16 px-8 flex-1">

      {/* Question selector */}
      <div className="flex items-center gap-3 mb-10 text-[24px] font-bold text-brand-blue select-none">
        <span>Question</span>

        <div className="relative">
          {showDropdown && (
            <div className="fixed inset-0 z-[10]" onClick={() => setShowDropdown(false)} />
          )}

          <div
            ref={badgeRef}
            className="relative z-[11] flex items-stretch bg-brand-gradient rounded-xl cursor-pointer"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <span className="px-4 py-2 text-white font-bold text-[24px] min-w-[44px] text-center">
              {currentIdx + 1}
            </span>
            <span className="w-px bg-white/30 my-[6px]" />
            <span className="px-3 flex items-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl overflow-y-auto max-h-52 z-[11] min-w-full">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(false); navigateTo(i); }}
                  className={`block w-full px-5 py-2 text-left text-[16px] transition-colors hover:bg-gray-100 ${
                    i === currentIdx ? "text-brand-blue font-bold" : answers[q.id] !== undefined ? "text-brand-blue/70" : "text-gray-600"
                  }`}
                >
                  {i + 1}{answers[q.id] !== undefined && <span className="ml-2 text-xs opacity-60">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <span>of {totalQuestions}</span>
      </div>

      {/* Fading content */}
      <div
        className="flex flex-col items-center gap-12 w-full transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <h2 className="text-[24px] text-brand-blue text-center max-w-xl">
          {currentQuestion.question_text}
        </h2>

        <div className="flex flex-row flex-wrap justify-center gap-5">
          {currentQuestion.options.map((opt) => {
            const selected = answers[currentQuestion.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(currentQuestion.id, opt.id)}
                disabled={submitting}
                className={`w-[220px] h-[220px] bg-brand-gradient text-white text-[16px] rounded-2xl flex items-center justify-center text-center px-6 transition-all duration-150 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                  selected ? "ring-4 ring-white ring-offset-2 ring-offset-brand-bg" : ""
                }`}
              >
                {submitting && selected ? "..." : opt.option_text}
              </button>
            );
          })}
        </div>

        {submitError && (
          <p className="text-red-500 text-[14px]">{submitError}</p>
        )}
      </div>
    </main>
  );
}
