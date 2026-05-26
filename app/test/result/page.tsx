"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResultContent() {
  const params = useSearchParams();
  const score = parseInt(params.get("score") ?? "0", 10);
  const total = parseInt(params.get("total") ?? "0", 10);
  const grade = params.get("grade") ?? "";

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-8 py-16 gap-12">
      <div className="text-center">
        <p className="text-[24px] font-bold text-brand-blue">Selamat!</p>
        <p className="text-[24px] text-brand-blue">Kamu sudah menyelesaikan tes-nya!</p>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[18px] text-brand-blue">
          Skor kamu: <span className="font-bold">{score} / {total}</span>
        </p>
        {grade && (
          <p className="text-[18px] text-brand-blue">
            Rekomendasi: <span className="font-bold">{grade}</span>
          </p>
        )}
      </div>

      <Link
        href="/"
        className="w-[180px] h-[56px] bg-brand-gradient text-white rounded-2xl flex items-center justify-center text-[16px] hover:opacity-90 transition-opacity"
      >
        Kembali ke Home
      </Link>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
