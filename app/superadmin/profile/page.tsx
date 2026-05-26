"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { getProfile, updateProfile, deleteProfile } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import type { AdminUser } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }

    getProfile(token)
      .then((u) => {
        setProfile(u);
        setForm((f) => ({ ...f, name: u.name, email: u.email }));
      })
      .catch(() => { clearAuth(); router.push("/superadmin/login"); });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setError("");
    setSuccess("");
    setSaving(true);

    const payload: Parameters<typeof updateProfile>[1] = { name: form.name, email: form.email };
    if (form.current_password) {
      payload.current_password = form.current_password;
      payload.new_password = form.new_password;
      payload.new_password_confirmation = form.new_password_confirmation;
    }

    try {
      const updated = await updateProfile(token, payload);
      setProfile(updated);
      setSuccess("Profil berhasil diperbarui.");
      setForm((f) => ({ ...f, current_password: "", new_password: "", new_password_confirmation: "" }));
    } catch {
      setError("Gagal memperbarui profil. Periksa data yang dimasukkan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    try {
      await deleteProfile(token);
      clearAuth();
      router.push("/");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen">
        <SuperadminSidebar />
        <main className="flex-1 p-8"><p className="text-brand-blue/40">Memuat profil...</p></main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-brand-blue font-bold text-[28px] mb-8">Profil Saya</h1>

        <div className="max-w-xl flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-[14px]">{success}</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-[14px]">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Nama</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <hr className="border-gray-100" />
              <p className="text-[12px] text-brand-blue/40">Isi bagian ini hanya jika ingin mengganti password.</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Password Saat Ini</label>
                <input
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Password Baru</label>
                <input
                  type="password"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-blue">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={form.new_password_confirmation}
                  onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-blue outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="self-start px-6 py-2.5 bg-brand-gradient text-white rounded-xl text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>

          <div className="bg-white border border-red-100 rounded-2xl p-6">
            <h2 className="text-red-600 font-bold text-[16px] mb-2">Zona Berbahaya</h2>
            <p className="text-brand-blue/50 text-[13px] mb-4">Hapus akun Anda secara permanen. Tindakan ini tidak dapat diurungkan.</p>

            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <p className="text-[13px] text-brand-blue/70">Yakin ingin menghapus akun?</p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-[13px] font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-[13px] font-medium text-brand-blue/60 border border-gray-200 rounded-xl hover:border-brand-blue/30"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-[13px] font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                Hapus Akun
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
