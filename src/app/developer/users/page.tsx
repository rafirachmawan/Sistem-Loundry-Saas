"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "KASIR" | "DEVELOPER";
  createdAt: string;
  tenantName: string;
  plainPassword?: string | null;
}

export default function DeveloperUsersPage() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [currentDevEmail, setCurrentDevEmail] = useState("");

  // States untuk Modal Ganti Password
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  // State untuk show/hide password per user
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentDevEmail(parsed.email || "");
      }

      const res = await fetch("/api/developer/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat daftar user.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan jaringan saat memuat data user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (id: string, email: string) => {
    if (email === currentDevEmail) {
      alert("Gagal: Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }

    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus akun user "${email}"?\n\nTransaksi kasir yang diinput oleh user ini juga akan ikut dihapus secara bersih.`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/developer/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message);
        loadUsers();
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    }
  };

  // Handler Ganti Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setUpdatingPass(true);

    try {
      const res = await fetch("/api/developer/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setIsModalOpen(false);
        setSelectedUser(null);
        setNewPassword("");
      } else {
        alert(data.message || "Gagal mengubah password.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    } finally {
      setUpdatingPass(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.tenantName.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />

      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/85 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-650"></span>
              Kelola Users
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Manajemen seluruh akun pengguna (Owner, Kasir, Developer) dalam ekosistem platform
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-purple-550/10 text-purple-650 border border-purple-500/20 font-bold shadow-sm">
            Platform Users
          </span>
        </header>

        {/* Main Panel */}
        <main className="flex-1 p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-650 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-700">
                  Daftar Pengguna Sistem
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gunakan kolom pencarian untuk memfilter data berdasarkan nama, email, role, atau tenant
                </p>
              </div>
              <input
                type="text"
                placeholder="Cari user (nama, email, role, tenant)..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none transition duration-200 font-semibold w-full md:w-64"
              />
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <span className="w-6 h-6 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin"></span>
                <p className="text-slate-400 text-xs font-semibold">Memuat log pengguna...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4">Nama Pengguna</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Password</th>
                      <th className="p-4">Peran (Role)</th>
                      <th className="p-4">Tenant / Laundry</th>
                      <th className="p-4">Tanggal Dibuat</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-normal">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                          Tidak ada pengguna terdaftar.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="p-4 text-slate-800">{usr.name}</td>
                          <td className="p-4 text-slate-500 font-mono">{usr.email}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 font-mono text-slate-600">
                              <span>{visiblePasswords[usr.id] ? (usr.plainPassword || "—") : "••••••"}</span>
                              <button
                                onClick={() => togglePasswordVisibility(usr.id)}
                                className="text-slate-400 hover:text-slate-600 focus:outline-none ml-1 cursor-pointer"
                                title={visiblePasswords[usr.id] ? "Sembunyikan sandi" : "Tampilkan sandi"}
                              >
                                {visiblePasswords[usr.id] ? (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 text-[9px] rounded-full font-medium uppercase border ${
                                usr.role === "DEVELOPER"
                                  ? "bg-purple-50 text-purple-600 border-purple-250/30"
                                  : usr.role === "OWNER"
                                  ? "bg-blue-50 text-blue-600 border-blue-250/30"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-250/30"
                              }`}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{usr.tenantName}</td>
                          <td className="p-4 text-slate-400">
                            {new Date(usr.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedUser(usr);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg text-[10px] cursor-pointer transition shadow-2xs mr-2 animate-wiggle-hover"
                            >
                              Ganti Password
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.email)}
                              disabled={usr.email === currentDevEmail}
                              className="p-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg text-[10px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Modal Ganti Password */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in-up">
            <div className="mb-4">
              <h3 className="text-sm font-display font-bold text-slate-800">
                🔑 Ganti Password User
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Mengubah kata sandi untuk pengguna: <br />
                <span className="font-mono font-bold text-purple-650">{selectedUser.email}</span>
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-[10px] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingPass}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer disabled:opacity-50"
                >
                  {updatingPass ? "Menyimpan..." : "Simpan Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
