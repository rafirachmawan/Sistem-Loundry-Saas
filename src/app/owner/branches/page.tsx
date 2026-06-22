"use client";

import { useState, useEffect } from "react";

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function OwnerBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", manager: "" });

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/owner/branches");
      const data = await res.json();
      if (res.ok && data.success) {
        setBranches(data.branches);
      } else {
        alert(data.message || "Gagal memuat cabang");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.address) return;

    try {
      const res = await fetch("/api/owner/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBranches([data.branch, ...branches]);
        setShowAddModal(false);
        setNewBranch({ name: "", address: "", manager: "" });
        alert("Cabang berhasil ditambahkan");
      } else {
        alert(data.message || "Gagal menambah cabang");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus cabang ini?")) {
      try {
        const res = await fetch(`/api/owner/branches/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setBranches(branches.filter(b => b.id !== id));
        } else {
          alert(data.message || "Gagal menghapus cabang");
        }
      } catch (err) {
        alert("Kesalahan jaringan");
      }
    }
  };

  return (
    <>
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Manajemen Cabang (Outlet)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Kelola jaringan outlet laundry Anda di berbagai lokasi</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>+</span> Tambah Cabang
            </button>
            <span className="text-xs py-1 px-3 rounded-full bg-purple-50 text-purple-600 border border-purple-200/50 font-bold shadow-sm uppercase">
              Enterprise
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xl shrink-0">
              🏢
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-800 uppercase tracking-widest mb-1">
                Fitur Enterprise Eksklusif
              </h3>
              <p className="text-xs text-purple-600 leading-relaxed font-semibold">
                Karena Anda berada di paket Enterprise, Anda dapat menambah cabang (outlet) tanpa batas. Semua data pelanggan, order, dan layanan di setiap cabang dapat dikontrol melalui dashboard utama Anda.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Memuat daftar cabang...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center text-xl shadow-sm">
                        🏪
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800">{branch.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${branch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {branch.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alamat Outlet</p>
                      <p className="text-sm font-semibold text-slate-700">{branch.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kepala Toko / Manager</p>
                      <p className="text-sm font-semibold text-slate-700">{branch.manager}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl transition">
                      Edit Info
                    </button>
                    <button onClick={() => handleDelete(branch.id)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-xl transition">
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal Tambah Cabang */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-display font-extrabold text-slate-800">Tambah Cabang Baru</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateBranch} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama Cabang / Outlet</label>
                  <input type="text" required value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} placeholder="Contoh: Cabang Antasari" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
                  <textarea required value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} placeholder="Jl. Antasari Raya No. 45..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Penanggung Jawab (Opsional)</label>
                  <input type="text" value={newBranch.manager} onChange={e => setNewBranch({...newBranch, manager: e.target.value})} placeholder="Nama Manager..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-600/20">
                    Simpan Cabang
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
