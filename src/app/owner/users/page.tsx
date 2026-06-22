"use client";

import { useState, useEffect } from "react";
import { useUserStore, User } from "@/store/useUserStore";

export default function OwnerUsersPage() {
  const { 
    users, branches, tier, maxUsers, loading, errorMsg, 
    fetchUsers 
  } = useUserStore();

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "KASIR",
    branchId: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: "KASIR", branchId: "" });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);
    setEditId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      branchId: user.branch?.id || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setFormLoading(true);

    try {
      const url = isEditMode ? `/api/owner/users/${editId}` : "/api/owner/users";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        fetchUsers(); // Refresh data
      } else {
        alert(data.message || "Gagal menyimpan data pengguna");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

    try {
      const res = await fetch(`/api/owner/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.message || "Gagal menghapus pengguna");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    }
  };

  const isLimitReached = maxUsers !== -1 && users.length >= maxUsers;

  return (
    <>
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Manajemen Pengguna
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Kelola akses akun tim Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              disabled={isLimitReached}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              <span>+</span> Tambah Pengguna
            </button>
            <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold shadow-sm">
              Owner Mode
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                Kuota Paket: <span className="text-brand-600">{tier}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda telah menggunakan {users.length} dari {maxUsers === -1 ? "Tak Terbatas" : maxUsers} kuota pengguna.
              </p>
            </div>
            
            <div className="w-full sm:w-1/3 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isLimitReached ? "bg-red-500" : "bg-brand-500"} transition-all`}
                style={{ width: maxUsers === -1 ? "100%" : `${Math.min((users.length / maxUsers) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Memuat daftar pengguna...</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${user.role === 'OWNER' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">{user.phone || "-"}</p>
                    
                    {user.branch && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 border border-purple-100">
                        <span className="text-xs">🏪</span>
                        <span className="text-[10px] font-bold text-purple-700">{user.branch.name}</span>
                      </div>
                    )}


                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-display font-extrabold text-slate-800">
                  {isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Email (Username)</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">No. WhatsApp</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
                    <input type={isEditMode ? "text" : "password"} required={!isEditMode} placeholder={isEditMode ? "Biarkan kosong jika tidak diubah" : ""} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                      <option value="KASIR">Kasir</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  </div>
                </div>
                
                {tier === "ENTERPRISE" && formData.role === "KASIR" && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tugaskan ke Cabang (Opsional)</label>
                    <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                      <option value="">-- Pusat / Semua Cabang --</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-purple-600 mt-1 font-medium">Khusus pengguna Enterprise, Anda dapat mengelompokkan Kasir ke outlet tertentu.</p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Batal</button>
                  <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2">
                    {formLoading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
