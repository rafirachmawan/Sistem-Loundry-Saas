"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

interface TenantStats {
  id: string;
  name: string;
  tier: string;
  createdAt: string;
  expiredAt?: string | null;
  userCount: number;
  customerCount: number;
  orderCount: number;
  revenue: number;
  ownerName?: string;
  ownerPhone?: string;
}

export default function DeveloperTenantsPage() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");
  const [currentDevEmail, setCurrentDevEmail] = useState("");

  const loadTenants = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentDevEmail(parsed.email || "");
      }

      const res = await fetch("/api/developer/tenants");
      const data = await res.json();
      if (res.ok && data.success) {
        setTenants(data.tenants);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat daftar tenant.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan jaringan saat memuat data tenant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleDeleteTenant = async (id: string, name: string) => {
    const confirmDelete = confirm(
      `PERHATIAN! Apakah Anda yakin ingin menghapus Tenant "${name}" secara permanen?\n\nTindakan ini tidak dapat dibatalkan dan akan menghapus:\n- Seluruh Akun User (Owner & Kasir)\n- Seluruh Data Pelanggan\n- Seluruh Master Layanan\n- Seluruh Riwayat Transaksi (Order & OrderItems)`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/developer/tenants?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message);
        loadTenants();
      } else {
        alert(data.message || "Gagal menghapus tenant.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(tenantSearch.toLowerCase())
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
              Kelola Tenants
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Manajemen dan pantau mitra outlet laundry yang terdaftar
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-purple-550/10 text-purple-650 border border-purple-500/20 font-bold shadow-sm">
            Platform Tenants
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
                  Daftar Tenant Laundry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan statistik agregat transaksi dan pengguna per tenant
                </p>
              </div>
              <input
                type="text"
                placeholder="Cari nama tenant atau ID..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none transition duration-200 font-semibold w-full md:w-64"
              />
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <span className="w-6 h-6 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin"></span>
                <p className="text-slate-400 text-xs font-semibold">Memuat log tenant...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4">Nama Laundry / Tenant</th>
                      <th className="p-4">Owner / Kontak</th>
                      <th className="p-4">Tipe Paket</th>
                      <th className="p-4">Masa Berlaku</th>
                      <th className="p-4">Tanggal Gabung</th>
                      <th className="p-4 text-center">User</th>
                      <th className="p-4 text-center">Customer</th>
                      <th className="p-4 text-center">Order</th>
                      <th className="p-4 text-right">Omset Aktual</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                          Tidak ada tenant laundry yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((ten) => (
                        <tr key={ten.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="p-4">
                            <span className="block font-black text-slate-800">{ten.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{ten.id}</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold text-slate-850">{ten.ownerName || "-"}</span>
                            {ten.ownerPhone && ten.ownerPhone !== "N/A" ? (
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-semibold">
                                📞 {ten.ownerPhone}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block mt-0.5 italic">
                                Belum ada kontak
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {ten.tier === "PRO" ? (
                              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold uppercase shadow-sm">
                                🌟 PRO
                              </span>
                            ) : ten.tier === "ENTERPRISE" ? (
                              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-purple-50 text-purple-650 border border-purple-200 text-[10px] font-extrabold uppercase shadow-sm">
                                👑 Enterprise
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-slate-55/70 text-slate-500 border border-slate-200/80 text-[10px] font-extrabold uppercase shadow-sm">
                                Starter
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {ten.expiredAt ? (
                              (() => {
                                const expiryDate = new Date(ten.expiredAt);
                                const isExpired = expiryDate.getTime() < Date.now();
                                return isExpired ? (
                                  <span className="inline-flex items-center py-1 px-2.5 rounded-full bg-red-50 text-red-650 border border-red-200 text-[10px] font-extrabold uppercase shadow-sm">
                                    🔴 Expired / Habis
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center py-1 px-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-extrabold shadow-sm">
                                    ⏳ s.d. {expiryDate.toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="inline-flex items-center py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold uppercase shadow-sm">
                                ♾️ Selamanya
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(ten.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-center text-slate-600 font-bold">{ten.userCount}</td>
                          <td className="p-4 text-center text-slate-600 font-bold">{ten.customerCount}</td>
                          <td className="p-4 text-center text-slate-600 font-bold">{ten.orderCount}</td>
                          <td className="p-4 text-right text-emerald-600 font-mono font-bold">
                            {ten.revenue.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteTenant(ten.id, ten.name)}
                              className="p-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs"
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
    </div>
  );
}
