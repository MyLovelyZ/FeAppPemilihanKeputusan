"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicQuizzes } from "@/lib/api";
import type { PublicQuizListItem } from "@/lib/api";

export default function TestListPage() {
  const [quizzes, setQuizzes] = useState<PublicQuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicQuizzes()
      .then(setQuizzes)
      .catch(() => setError("Gagal memuat daftar quiz."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex flex-col flex-1 px-4 sm:px-8 py-10">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-brand-blue font-bold text-[28px] sm:text-[32px]">Quiz Tersedia</h1>
          <p className="text-brand-blue/60 mt-2 text-[15px]">
            Pilih quiz di bawah ini dan temukan jalanmu.
          </p>
        </div>

        {loading && (
          <p className="text-center text-brand-blue/40 py-12">Memuat quiz...</p>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-2xl px-5 py-4 text-center">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <p className="text-center text-brand-blue/40 py-12">Belum ada quiz yang tersedia.</p>
        )}

        <div className="flex flex-col gap-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/test/${quiz.id}`}
              className="w-full bg-brand-gradient text-white rounded-2xl px-6 py-5 flex items-center justify-between hover:opacity-90 transition-opacity"
            >
              <div className="flex flex-col gap-1">
                <p className="text-[18px] font-bold">{quiz.title}</p>
                {quiz.description && (
                  <p className="text-white/70 text-[13px] line-clamp-1">{quiz.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/60 text-[12px]">{quiz.questions_count} pertanyaan</span>
                  {quiz.has_grades && (
                    <span className="text-white/80 text-[12px] font-medium">Ada penilaian</span>
                  )}
                </div>
              </div>
              <span className="text-[22px] shrink-0 ml-4">→</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
