"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
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
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const handleSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (currentIdx < totalQuestions - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const optionIds = Object.values(answers);
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
        <p className="text-brand-blue/50 text-[18px]">Memuat quiz...</p>
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

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-10 gap-8">

      {totalQuestions === 0 ? (
        <div className="bg-brand-gradient text-white rounded-2xl p-8 text-center max-w-sm w-full">
          Quiz ini belum memiliki pertanyaan.
        </div>
      ) : (
        <>
          {/* Question selector */}
          <div className="flex items-center gap-2 text-brand-blue text-[16px]">
            <span>Question</span>
            <select
              value={currentIdx}
              onChange={(e) => setCurrentIdx(Number(e.target.value))}
              className="bg-brand-blue text-white rounded-lg px-2 py-1 text-[14px] font-bold cursor-pointer outline-none"
            >
              {questions.map((_, i) => (
                <option key={i} value={i}>{i + 1}</option>
              ))}
            </select>
            <span>of {totalQuestions}</span>
          </div>

          {/* Question text */}
          <p className="text-brand-blue text-[22px] text-center max-w-xl leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* Option cards */}
          <div
            className={`grid gap-4 w-full max-w-2xl ${
              currentQuestion.options.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {currentQuestion.options.map((opt) => {
              const selected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(currentQuestion.id, opt.id)}
                  className={`min-h-[200px] rounded-2xl p-6 text-white text-[16px] text-center flex items-center justify-center leading-snug bg-brand-gradient transition-all duration-200 ${
                    selected
                      ? "ring-4 ring-brand-blue/50 opacity-100"
                      : "opacity-60 hover:opacity-80"
                  }`}
                >
                  {opt.option_text}
                </button>
              );
            })}
          </div>

          {/* Submit area */}
          <div className="flex flex-col items-center gap-3">
            {submitError && (
              <p className="text-red-500 text-[14px]">{submitError}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-12 py-3.5 bg-brand-gradient text-white text-[16px] font-bold rounded-2xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting
                ? "Mengirim..."
                : allAnswered
                  ? "Lihat Hasil"
                  : `${answeredCount}/${totalQuestions} terjawab`}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
