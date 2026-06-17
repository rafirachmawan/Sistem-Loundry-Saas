"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export default function OwnerServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // State untuk Tambah Layanan
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("KG");
  const [addLoading, setAddLoading] = useState(false);

  // State untuk Langganan
  const [activePlanId, setActivePlanId] = useState<string>("trial");

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(data.services);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat master layanan");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan koneksi jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    // Check subscription plan from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.tenantTier) {
          setActivePlanId(parsed.tenantTier === "STARTER" ? "trial" : parsed.tenantTier.toLowerCase());
        } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
          setActivePlanId("pro");
        }
        
        const savedSub = localStorage.getItem(`sub_${parsed.email}`);
        if (savedSub) {
          const sub = JSON.parse(savedSub);
          setActivePlanId(sub.planId);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Hitung batas layanan
  const getServiceLimit = () => {
    if (activePlanId === "enterprise") return Infinity;
    if (activePlanId === "pro") return 10;
    return 3; // trial / starter
  };
  
  const limit = getServiceLimit();
  const currentCount = services.length;
  const canAddMore = currentCount < limit;

  const handleStartEdit = (service: Service) => {
    setEditId(service.id);
    setEditPrice(service.price.toString());
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditPrice("");
  };

  const handleSavePrice = async (serviceId: string) => {
    if (!editPrice || isNaN(parseFloat(editPrice))) return;
    setEditLoading(true);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: editPrice }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(
          services.map((svc) =>
            svc.id === serviceId ? { ...svc, price: parseFloat(editPrice) } : svc
          )
        );
        setEditId(null);
        setEditPrice("");
      } else {
        alert(data.message || "Gagal memperbarui harga");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newUnit) return;
    setAddLoading(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, price: newPrice, unit: newUnit, planId: activePlanId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices([...services, data.service]);
        setShowAddModal(false);
        setNewName("");
        setNewPrice("");
        setNewUnit("KG");
      } else {
        alert(data.message || "Gagal menambah layanan");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(services.filter((svc) => svc.id !== serviceId));
      } else {
        alert(data.message || "Gagal menghapus layanan");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        
        {/* Header section */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Manajemen Layanan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Kelola jenis layanan cucian dan tarif master outlet Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (canAddMore) {
                  setShowAddModal(true);
                } else {
                  alert(`Batas maksimal layanan untuk paket ${activePlanId.toUpperCase()} telah tercapai (${limit} layanan). Upgrade paket Anda di menu Billing.`);
                }
              }}
              disabled={!canAddMore}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                canAddMore ? "bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 cursor-pointer" : "bg-slate-400 cursor-not-allowed opacity-70"
              }`}
            >
              <span>+</span> Tambah Layanan
            </button>
            <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold shadow-sm">
              Owner Mode
            </span>
          </div>
        </header>

        {/* Services Content Grid */}
        <main className="flex-1 p-6 space-y-6">
          
          <div className="p-5 rounded-2xl bg-slate-100/50 border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
              💡 Informasi Snapshot Harga
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Perubahan harga master tarif hanya akan berlaku untuk order baru yang akan datang. Transaksi yang sedang berjalan di visual tracker tetap menggunakan snapshot harga lama demi keamanan pencatatan keuangan (Anti-Fraud).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Mengambil tarif master...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 p-8 text-center glass-panel rounded-2xl border-dashed border-2 border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-2">
                📦
              </div>
              <h3 className="text-lg font-bold text-slate-800">Belum Ada Layanan</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Tambahkan master tarif layanan Anda untuk mulai menerima pesanan kasir. (Maksimal {limit === Infinity ? "Unlimited" : limit} layanan untuk paket Anda)
              </p>
              {canAddMore && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
                >
                  + Tambah Layanan Pertama
                </button>
              )}
            </div>
          ) : (
            
            /* Card Grid Layout for Services (Terang) */
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-500 flex justify-end">
                Layanan digunakan: <span className="font-bold text-slate-700 ml-1">{currentCount} / {limit === Infinity ? "Unlimited" : limit}</span>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="glass-panel rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-slate-800">{svc.name}</h3>
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded">
                        Satuan: {svc.unit}
                      </span>
                    </div>
                    
                    {/* Washing Icon Indicator */}
                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      {svc.unit === "KG" ? "⚖️" : "👔"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {editId === svc.id ? (
                      <div className="flex items-center gap-2 w-full animate-fade-in-up">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold font-mono">Rp</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500 font-extrabold font-mono"
                          />
                        </div>
                        <button
                          onClick={() => handleSavePrice(svc.id)}
                          disabled={editLoading}
                          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center shadow-md shadow-brand-600/15"
                        >
                          {editLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            "Simpan"
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-200"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Harga Master</span>
                          <span className="text-xl font-black text-brand-600 font-mono tracking-tight">
                            Rp {svc.price.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-slate-400">/ {svc.unit}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(svc)}
                            className="px-4 py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 border border-slate-200/80 hover:border-brand-200/60 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(svc.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              ))}
              </section>
            </div>
          )}

        </main>

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-display font-extrabold text-slate-800">Tambah Layanan Baru</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateService} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama Layanan</label>
                  <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Contoh: Cuci Sepatu" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Harga (Rp)</label>
                    <input type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Satuan</label>
                    <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                      <option value="KG">KG</option>
                      <option value="PCS">PCS</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Batal</button>
                  <button type="submit" disabled={addLoading} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2">
                    {addLoading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                    Simpan Layanan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
