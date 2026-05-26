"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import Alert from "@/components/Alert";
import { superadminCreateAdmin, extractErrorMessage } from "@/lib/api";
import { getToken, isSuperadmin } from "@/lib/auth";

export default function AdminCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.push("/superadmin/login"); return; }
    if (!isSuperadmin()) { router.push("/superadmin/login"); }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    setError("");
    setSaving(true);
    try {
      await superadminCreateAdmin(token, form);
      router.push("/superadmin/admins");
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal membuat admin."));
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/superadmin/admins" className="text-brand-blue/50 text-[14px] hover:text-brand-blue">← Kembali</Link>
            <h1 className="text-brand-blue font-bold text-[28px]">Tambah Admin Baru</h1>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Alert type="error" message={error} />

              {(["name", "email", "password", "password_confirmation"] as const).map((field) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-blue">
                    {field === "name" ? "Nama" : field === "email" ? "Email" : field === "password" ? "Password" : "Konfirmasi Password"}
                  </label>
                  <input
                    type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                    required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Membuat..." : "Buat Admin"}
                </button>
                <Link
                  href="/superadmin/admins"
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
