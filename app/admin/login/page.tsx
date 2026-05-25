"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const { token } = await adminLogin(email, password);
      setToken(token);
      router.push("/admin");
    } catch {
      setError("Kredensial akun salah atau belum terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px] rounded-3xl overflow-hidden shadow-lg">
        {/* Gradient header */}
        <div className="bg-brand-gradient px-10 py-8 text-center">
          <h1 className="text-white font-bold text-[32px]">Pemilihan</h1>
          <p className="text-white/75 italic text-[18px]">Admin Panel</p>
        </div>

        {/* Form body */}
        <div className="bg-white px-10 py-8 flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Username</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-brand-blue transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan Email"
                className="flex-1 outline-none text-[14px] text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-brand-blue transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan Password"
                className="flex-1 outline-none text-[14px] text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full h-[54px] bg-brand-gradient text-white rounded-2xl flex items-center justify-center gap-3 text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {loading ? "Masuk..." : "Masuk sebagai admin"}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
              <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-red-600 text-[14px]">{error}</p>
            </div>
          )}
        </div>
      </div>

      <Link href="/superadmin/login" className="mt-6 text-brand-blue text-[14px] underline hover:opacity-70 transition-opacity">
        To Superadmin Login
      </Link>
    </div>
  );
}
