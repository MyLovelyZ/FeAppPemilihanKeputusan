"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import { superadminGetAdmins, superadminToggleBan, superadminDeleteAdmin, extractErrorMessage } from "@/lib/api";
import { getToken, isSuperadmin } from "@/lib/auth";
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
  const [banTarget, setBanTarget] = useState<AdminEntry | null>(null);
  const [banLoading, setBanLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/superadmin/login"); return; }
    if (!isSuperadmin()) { router.push("/superadmin/login"); return; }

    superadminGetAdmins(token)
      .then(setAdmins)
      .catch((err) => setError(extractErrorMessage(err, "Gagal memuat daftar admin.")))
      .finally(() => setLoading(false));
  }, [router]);

  const handleBan = async () => {
    if (!banTarget) return;
    const token = getToken();
    if (!token) return;
    setBanLoading(true);
    try {
      const updated = await superadminToggleBan(token, banTarget.id);
      setAdmins((prev) => prev.map((a) => a.id === updated.id ? { ...a, banned_at: updated.banned_at } : a));
      setBanTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal mengubah status ban."));
    } finally {
      setBanLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    if (!token) return;
    setDeleteLoading(true);
    try {
      await superadminDeleteAdmin(token, deleteTarget.id);
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal menghapus admin."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SuperadminSidebar />

      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.banned_at ? "Unban Admin" : "Ban Admin"}
        message={banTarget?.banned_at
          ? `Admin "${banTarget?.name}" akan di-unban dan dapat login kembali.`
          : `Admin "${banTarget?.name}" akan di-ban. Semua token aktifnya akan dicabut.`}
        confirmLabel={banTarget?.banned_at ? "Unban" : "Ban"}
        onConfirm={handleBan}
        onCancel={() => setBanTarget(null)}
        loading={banLoading}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Admin"
        message={`Akun admin "${deleteTarget?.name}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

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

        <div className="mb-4">
          <Alert type="error" message={error} />
        </div>

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
                          onClick={() => setBanTarget(admin)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            admin.banned_at
                              ? "text-green-700 bg-green-50 hover:bg-green-100"
                              : "text-orange-600 bg-orange-50 hover:bg-orange-100"
                          }`}
                        >
                          {admin.banned_at ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Hapus
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
