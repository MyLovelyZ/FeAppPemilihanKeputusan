"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import { superadminGetAdmins, superadminToggleBan, superadminDeleteAdmin } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import type { AdminEntry } from "@/lib/api";

function StatusBadge({ bannedAt }: { bannedAt: string | null }) {
  if (!bannedAt) return (
    <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">Aktif</span>
  );
  return (
    <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">Di-ban</span>
  );
}

export default function AdminListPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banningId, setBanningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }

    superadminGetAdmins(token)
      .then(setAdmins)
      .catch(() => { clearAuth(); router.push("/superadmin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleBan = async (admin: AdminEntry) => {
    const action = admin.banned_at ? "unban" : "ban";
    if (!window.confirm(`${action === "ban" ? "Ban" : "Unban"} admin "${admin.name}"?`)) return;
    const token = getToken();
    if (!token) return;
    setBanningId(admin.id);
    try {
      const updated = await superadminToggleBan(token, admin.id);
      setAdmins((prev) => prev.map((a) => a.id === updated.id ? { ...a, banned_at: updated.banned_at } : a));
    } catch {
      setError("Gagal mengubah status ban.");
    } finally {
      setBanningId(null);
    }
  };

  const handleDelete = async (admin: AdminEntry) => {
    if (!window.confirm(`Hapus akun admin "${admin.name}" secara permanen?`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(admin.id);
    try {
      await superadminDeleteAdmin(token, admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } catch {
      setError("Gagal menghapus admin.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-brand-blue font-bold text-[28px]">Manajemen Admin</h1>
          <Link
            href="/superadmin/admins/create"
            className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-[15px] hover:opacity-90 transition-opacity"
          >
            Tambah Admin <span className="text-[18px] font-bold">+</span>
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-xl px-4 py-3">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-brand-blue/40">Memuat...</p>
        ) : admins.length === 0 ? (
          <div className="text-center py-16 text-brand-blue/40">
            Belum ada admin.{" "}
            <Link href="/superadmin/admins/create" className="text-brand-blue underline">Tambah admin pertama.</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60">Nama</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60 hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-blue/60">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-brand-blue/60">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-brand-blue">
                      <Link href={`/superadmin/admins/${admin.id}`} className="hover:opacity-70">
                        {admin.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-brand-blue/50 hidden md:table-cell">{admin.email}</td>
                    <td className="px-5 py-3">
                      <StatusBadge bannedAt={admin.banned_at} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          href={`/superadmin/admins/${admin.id}`}
                          className="px-3 py-1 text-xs font-medium text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => handleBan(admin)}
                          disabled={banningId === admin.id}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            admin.banned_at
                              ? "text-green-700 bg-green-50 hover:bg-green-100"
                              : "text-orange-600 bg-orange-50 hover:bg-orange-100"
                          }`}
                        >
                          {banningId === admin.id ? "..." : admin.banned_at ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          disabled={deletingId === admin.id}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === admin.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
