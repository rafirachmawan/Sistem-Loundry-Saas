"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UnpaidAlert {
  id: string;
  invoiceNumber: string;
  totalPrice: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
}

interface ChartData {
  date: string;
  volume: number;
  rawDate: string;
}

interface LowStockAlert {
  id: string;
  name: string;
  stock: number;
  unit: string;
  branch: {
    name: string;
  };
}

interface AnalyticsData {
  omsetToday: number;
  omsetTotal: number;
  piutangBerjalan: number;
  ordersTodayCount: number;
  unpaidAlerts: UnpaidAlert[];
  chartData: ChartData[];
  lowStockAlerts: LowStockAlert[];
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [remindLoading, setRemindLoading] = useState<string | null>(null);
  const [remindSuccess, setRemindSuccess] = useState<string | null>(null);

  // Ambil data dashboard owner dari API
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/owner/analytics");
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalytics(data.data);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat analitik");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan koneksi jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Kirim WhatsApp Reminder
  const handleSendReminder = async (orderId: string) => {
    setRemindLoading(orderId);
    setRemindSuccess(null);
    try {
      const res = await fetch("/api/owner/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRemindSuccess(`Pengingat WA sukses dikirim!`);
        setTimeout(() => setRemindSuccess(null), 3000);
      } else {
        alert(data.message || "Gagal mengirim pengingat");
      }
    } catch (err) {
      alert("Kesalahan koneksi");
    } finally {
      setRemindLoading(null);
    }
  };

  // Test Kirim WA Langsung ke Gateway
  const handleTestWA = async () => {
    const phone = window.prompt("Masukkan nomor WA Anda (contoh: 081234567890):");
    if (!phone) return;

    try {
      const res = await fetch("http://localhost:3001/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: phone,
          message: "Halo! Ini adalah pesan TEST dari Sistem Spindo. WhatsApp Gateway Lokal Anda sudah berfungsi dengan sangat baik! 🎉"
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.alert("✅ Pesan berhasil dikirim! Silakan cek WA di HP Anda.");
      } else {
        window.alert("❌ Gagal mengirim: " + data.message);
      }
    } catch (err) {
      window.alert("❌ Error: Pastikan server Terminal ke-2 (wa-gateway) masih menyala.");
    }
  };

  // Hitung selisih hari untuk umur piutang
  const getDaysAgo = (dateStr: string) => {
    const created = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Hari ini" : `${diffDays} hari lalu`;
  };

  const maxVolume = analytics?.chartData 
    ? Math.max(...analytics.chartData.map((d) => d.volume), 10) 
    : 10;

  return (
    <>
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        
        {/* Header section */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Dashboard Owner
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Analitik performa finansial dan operasional outlet</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleTestWA}
              className="text-xs py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              🚀 Test Gateway WA
            </button>
            <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold shadow-sm">
              Owner Mode
            </span>
          </div>
        </header>

        {/* Dashboard Grid Panel */}
        <main className="flex-1 p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {loading || !analytics ? (
            <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Menghitung metrik finansial...</p>
            </div>
          ) : (
            <>
              {/* 1. KEY FINANCIAL METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Card Omset */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/20 transition-all duration-300 glow-emerald">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-400 rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Omset Hari Ini
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      💰
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {analytics.omsetToday.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Menghitung total pelunasan (Payment) yang masuk khusus di hari ini.
                  </p>
                </div>

                {/* Card Piutang */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300 glow-amber">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400 rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      Piutang Berjalan
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      ⚠️
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-amber-600">
                    {analytics.piutangBerjalan.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Rupiah tertahan dari pakaian selesai diproses tapi belum dilunasi.
                  </p>
                </div>

                {/* Card Total Order */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/20 transition-all duration-300 glow-emerald">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-400 rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Order Masuk Hari Ini
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 text-brand-650 flex items-center justify-center text-sm shadow-sm font-bold">
                      🧺
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {analytics.ordersTodayCount} <span className="text-sm font-normal text-slate-400">Order</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Jumlah total transaksi kasir yang berhasil diinput masuk hari ini.
                  </p>
                </div>

                {/* Card Omset Total (Keseluruhan) */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 glow-emerald">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Total Omset (Semua Waktu)
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      💎
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-emerald-600">
                    {analytics.omsetTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Total akumulasi pendapatan uang kas sejak pertama aplikasi digunakan.
                  </p>
                </div>

              </div>

              {/* 2. GRAPH & UNPAID ALERT SYSTEM */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual SVG Chart (Terang) */}
                <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                      Tren Volume Produksi (7 Hari Terakhir)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-6 font-semibold">
                      Akumulasi berat pakaian masuk berskala Kilogram (KG)
                    </p>
                  </div>

                  {/* Clean SVG Curve Chart with Emerald Green Gradient */}
                  <div className="pt-4 flex flex-col items-center">
                    <svg viewBox="0 0 500 200" className="w-full h-52">
                      <defs>
                        <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      {/* Grid Horizontal Lines */}
                      <line x1="10" y1="30" x2="490" y2="30" stroke="rgba(15,23,42,0.02)" strokeWidth="1" />
                      <line x1="10" y1="90" x2="490" y2="90" stroke="rgba(15,23,42,0.02)" strokeWidth="1" />
                      <line x1="10" y1="150" x2="490" y2="150" stroke="rgba(15,23,42,0.05)" strokeWidth="1.5" />

                      {/* Render Bars dynamically */}
                      {analytics.chartData.map((data, index) => {
                        const x = 30 + index * 64;
                        const height = maxVolume > 0 ? (data.volume / maxVolume) * 110 : 0;
                        const y = 150 - height;
                        const isToday = index === analytics.chartData.length - 1;

                        return (
                          <g key={data.rawDate} className="group cursor-pointer">
                            <rect
                              x={x}
                              y={y}
                              width="26"
                              height={height}
                              rx="5"
                              fill="url(#barGradientGreen)"
                              stroke={isToday ? "#10b981" : "transparent"}
                              strokeWidth="1.5"
                              className="transition-all duration-300 hover:fill-brand-500 hover:filter hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            />
                            
                            <text
                              x={x + 13}
                              y={y - 8}
                              fill="#059669"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono"
                            >
                              {data.volume.toFixed(1)}kg
                            </text>

                            <text
                              x={x + 13}
                              y="168"
                              fill={isToday ? "#059669" : "#64748b"}
                              fontSize="9"
                              fontWeight={isToday ? "bold" : "normal"}
                              textAnchor="middle"
                            >
                              {data.date}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Unpaid Alert System */}
                <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-display font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                      <span className="w-1.5 h-3 rounded bg-amber-500"></span>
                      ⚠️ Unpaid Alert System
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-6 font-semibold">
                      Pakaian selesai (READY) di rak yang belum dilunasi oleh pelanggan postpaid
                    </p>
                  </div>

                  {remindSuccess && (
                    <div className="mb-4 p-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-center animate-fade-in-up font-bold shadow-sm">
                      {remindSuccess}
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto max-h-[260px] space-y-3.5 pr-1 no-scrollbar">
                    {analytics.unpaidAlerts.length === 0 ? (
                      <div className="text-center py-16 text-xs text-slate-450 italic border border-dashed border-slate-200 rounded-xl font-semibold">
                        Tidak ada pakaian menumpuk di rak dengan tagihan tertunggak.
                      </div>
                    ) : (
                      analytics.unpaidAlerts.map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-150 hover:border-slate-250 transition duration-200 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                              {ord.customer.name[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{ord.customer.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5 font-bold">
                                <span className="text-[9px] text-slate-400 font-mono">{ord.invoiceNumber}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[9px] text-amber-600">{getDaysAgo(ord.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-amber-600 font-mono">
                              {ord.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                            </span>
                            <button
                              onClick={() => handleSendReminder(ord.id)}
                              disabled={remindLoading === ord.id}
                              className="text-[10px] py-1.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-lg cursor-pointer transition flex items-center gap-1 shadow-md shadow-amber-500/10 animate-wiggle-hover"
                            >
                              {remindLoading === ord.id ? (
                                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                  </svg>
                                  Ingatkan WA
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* 3. INVENTORY ALERTS */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                    <span className="w-1.5 h-3 rounded bg-red-500"></span>
                    🚨 Low Stock Alerts (Peringatan Stok Menipis)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 mb-6 font-semibold">
                    Barang operasional gudang dengan sisa stok 5 atau kurang di seluruh cabang.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.lowStockAlerts.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-xs text-slate-450 italic border border-dashed border-slate-200 rounded-xl font-semibold">
                      Aman. Tidak ada stok bahan baku yang menipis.
                    </div>
                  ) : (
                    analytics.lowStockAlerts.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cabang: {item.branch.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-red-400 font-bold uppercase mb-0.5">Sisa</p>
                          <p className="text-xl font-black font-mono text-red-600">{item.stock.toFixed(1)} <span className="text-[10px] font-bold text-red-500">{item.unit}</span></p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          )}
        </main>
      </div>
    </>
  );
}
