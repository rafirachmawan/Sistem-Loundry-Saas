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
  }, []);

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
          <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold shadow-sm">
            Owner Mode
          </span>
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
          ) : (
            
            /* Card Grid Layout for Services (Terang) */
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
                        
                        <button
                          onClick={() => handleStartEdit(svc)}
                          className="px-4 py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 border border-slate-200/80 hover:border-brand-200/60 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Tarif
                        </button>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
