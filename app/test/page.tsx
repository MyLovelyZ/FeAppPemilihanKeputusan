"use client";

import { useState, useRef, useEffect } from "react";

const TOTAL = 20;

type Question = {
  text: string;
  options: [string, string];
};

// Questions — swap fetch from Laravel API when endpoints are ready
const questions: Question[] = [
  // Dimensi 1 — Self-Efficacy
  {
    text: "Saat memikirkan masa depan, saya lebih yakin...",
    options: ["Mampu menempuh pendidikan lebih lanjut", "Mampu langsung masuk dunia kerja"],
  },
  {
    text: "Saat menghadapi pilihan besar, saya biasanya...",
    options: ["Percaya diri merencanakan jalur pendidikan", "Percaya diri mengambil peluang kerja"],
  },
  {
    text: "Saya merasa kemampuan saya lebih siap untuk...",
    options: ["Tantangan akademik", "Tantangan pekerjaan nyata"],
  },
  {
    text: "Jika ada hambatan biaya/waktu, saya cenderung...",
    options: ["Mencari cara agar tetap bisa kuliah", "Mencari cara agar bisa segera bekerja"],
  },
  {
    text: "Saya paling percaya berkembang lewat...",
    options: ["Pendidikan lanjutan", "Pengalaman kerja langsung"],
  },
  // Dimensi 2 — Career Maturity
  {
    text: "Saya lebih sering memikirkan masa depan secara...",
    options: ["Jangka panjang", "Berdasarkan peluang yang ada sekarang"],
  },
  {
    text: "Saya lebih tertarik menyiapkan karier melalui...",
    options: ["Tahapan pendidikan", "Pengalaman kerja bertahap"],
  },
  {
    text: "Saat memilih masa depan, saya lebih mempertimbangkan...",
    options: ["Kesesuaian minat dan tujuan jangka panjang", "Kesiapan terjun kerja sekarang"],
  },
  {
    text: "Saya lebih siap berkomitmen pada...",
    options: ["Proses belajar beberapa tahun ke depan", "Rutinitas dan tanggung jawab kerja"],
  },
  {
    text: "Bagi saya perkembangan karier dimulai dari...",
    options: ["Pendidikan yang kuat", "Pengalaman kerja sejak dini"],
  },
  // Dimensi 3 — Pengaruh Lingkungan / Social Support
  {
    text: "Dukungan yang paling mendorong saya adalah untuk...",
    options: ["Melanjutkan pendidikan", "Memulai bekerja"],
  },
  {
    text: "Saya lebih terpengaruh oleh lingkungan yang menghargai...",
    options: ["Prestasi akademik", "Pengalaman kerja"],
  },
  {
    text: "Jika mentor memberi saran, saya lebih condong memilih...",
    options: ["Kuliah", "Kerja"],
  },
  {
    text: "Saya melihat orang sekitar lebih berhasil lewat...",
    options: ["Pendidikan tinggi", "Masuk kerja lebih cepat"],
  },
  {
    text: "Nilai yang paling sesuai dengan lingkungan saya adalah...",
    options: ["Belajar lebih lanjut", "Mandiri lewat bekerja"],
  },
  // Dimensi 4 — Behavioral Intention
  {
    text: "Jika harus daftar hari ini, saya lebih memilih...",
    options: ["Kampus", "Lowongan kerja"],
  },
  {
    text: "Jika ada kesempatan besok, saya lebih terdorong untuk...",
    options: ["Ikut seleksi kuliah", "Ikut rekrutmen kerja"],
  },
  {
    text: "Langkah pertama yang ingin saya ambil adalah...",
    options: ["Menyiapkan pendidikan lanjut", "Menyiapkan masuk kerja"],
  },
  {
    text: "Prioritas saya saat ini lebih dekat ke...",
    options: ["Mengembangkan kompetensi akademik", "Mengembangkan pengalaman kerja"],
  },
  {
    text: "Kalau harus memutuskan sekarang, saya pilih...",
    options: ["Kuliah", "Kerja"],
  },
];

export default function TestPage() {
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState<Record<number, 0 | 1>>({});
  const [showDropdown, setShowDropdown] = useState(false);

  const badgeRef = useRef<HTMLDivElement>(null);
  const q = questions[current - 1];

  // Non-passive wheel listener on the badge so preventDefault works
  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCurrent((c) =>
        e.deltaY > 0 ? Math.min(c + 1, TOTAL) : Math.max(c - 1, 1)
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleAnswer = (idx: 0 | 1) => {
    setAnswers((prev) => ({ ...prev, [current]: idx }));
    if (current < TOTAL) setCurrent((c) => c + 1);
    // TODO: on last question, POST answers to Laravel endpoint and navigate to results
  };

  return (
    <main className="flex flex-col items-center pt-16 px-8 flex-1">

      {/* Question selector */}
      <div className="flex items-center gap-3 mb-10 text-[24px] font-bold text-brand-blue select-none">
        <span>Question</span>

        {/* Clickable + scrollable badge */}
        <div className="relative">
          {/* Backdrop to close dropdown on outside click */}
          {showDropdown && (
            <div
              className="fixed inset-0 z-[10]"
              onClick={() => setShowDropdown(false)}
            />
          )}

          <div
            ref={badgeRef}
            className="relative z-[11] flex items-stretch bg-brand-gradient rounded-xl cursor-pointer"
            onClick={() => setShowDropdown((v) => !v)}
          >
            {/* Current question number */}
            <span className="px-4 py-2 text-white font-bold text-[24px] min-w-[44px] text-center">
              {current}
            </span>
            {/* Divider */}
            <span className="w-px bg-white/30 my-[6px]" />
            {/* Chevron */}
            <span className="px-3 flex items-center text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {/* Dropdown list */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl overflow-y-auto max-h-52 z-[11] min-w-full">
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(n);
                    setShowDropdown(false);
                  }}
                  className={`block w-full px-5 py-2 text-left text-[16px] transition-colors hover:bg-gray-100 ${
                    n === current
                      ? "text-brand-blue font-bold"
                      : answers[n] !== undefined
                      ? "text-brand-blue/70"
                      : "text-gray-600"
                  }`}
                >
                  {n}
                  {answers[n] !== undefined && (
                    <span className="ml-2 text-xs opacity-60">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <span>of {TOTAL}</span>
      </div>

      {/* Question text */}
      <h2 className="text-[24px] text-brand-blue text-center mb-12 max-w-xl">
        {q.text}
      </h2>

      {/* Answer cards */}
      <div className="flex flex-col sm:flex-row gap-5">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i as 0 | 1)}
            className={`w-full sm:w-[220px] h-[220px] bg-brand-gradient text-white text-[16px] rounded-2xl flex items-center justify-center text-center px-6 transition-all duration-150 hover:opacity-90 hover:scale-[1.02] ${
              answers[current] === i
                ? "ring-4 ring-white ring-offset-2 ring-offset-brand-bg"
                : ""
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </main>
  );
}
