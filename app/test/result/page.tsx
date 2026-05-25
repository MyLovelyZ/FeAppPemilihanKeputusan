"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendResultEmail } from "@/lib/api";

function getGrade(score: number, total: number): string {
  return score / total >= 0.55 ? "Kuliah" : "Kerja";
}

function ResultContent() {
  const params = useSearchParams();
  const score = parseInt(params.get("score") ?? "0", 10);
  const total = parseInt(params.get("total") ?? "20", 10);
  const grade = getGrade(score, total);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await sendResultEmail({ email: email.trim(), score, total, grade });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Gagal mengirim email. Coba lagi nanti.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-8 py-16 gap-12">
      {/* Congratulations */}
      <div className="text-center">
        <p className="text-[24px] font-bold text-brand-blue">Selamat!</p>
        <p className="text-[24px] text-brand-blue">Kamu sudah menyelesaikan tes-nya!</p>
      </div>

      {/* Email form / success state */}
      {status === "success" ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-[18px] text-brand-blue">
            Hasil tes telah dikirim! Cek email kamu.
          </p>
          <Link
            href="/"
            className="w-[180px] h-[56px] bg-brand-gradient text-white rounded-2xl flex items-center justify-center text-[16px] hover:opacity-90 transition-opacity"
          >
            Kembali ke Home
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-brand-blue">
            Isi E-mail kamu untuk mendapatkan hasil tes-nya.
          </p>
          <div className="flex items-stretch gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="E-mail kamu"
              disabled={status === "loading"}
              className="w-[300px] border border-brand-blue/30 rounded-xl px-4 py-3 text-brand-blue bg-transparent outline-none focus:border-brand-blue placeholder:text-brand-blue/40 disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || !email.trim()}
              className="w-[100px] bg-brand-gradient text-white text-[20px] font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "..." : "Kirim"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-red-500 text-[14px]">{errorMsg}</p>
          )}
        </div>
      )}
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
