"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";

interface TenantStats {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  customerCount: number;
  orderCount: number;
  revenue: number;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "KASIR" | "DEVELOPER";
  createdAt: string;
  tenantName: string;
}

interface PlatformStats {
  tenantCount: number;
  userCount: number;
  orderCount: number;
  totalRevenue: number;
}

export default function DeveloperDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<TenantStats[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/developer/stats");
      const statsData = await statsRes.json();

      // Fetch tenants
      const tenantsRes = await fetch("/api/developer/tenants");
      const tenantsData = await tenantsRes.json();

      // Fetch users
      const usersRes = await fetch("/api/developer/users");
      const usersData = await usersRes.json();

      if (statsData.success && tenantsData.success && usersData.success) {
        setStats(statsData.data);
        // Ambil 5 data terbaru saja untuk overview dashboard
        setRecentTenants(tenantsData.tenants.slice(0, 5));
        setRecentUsers(usersData.users.slice(0, 5));
        setErrorMsg("");
      } else {
        setErrorMsg("Gagal memuat data ringkasan developer.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan koneksi saat menghubungi server API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header section (Light & Clean) */}
        <header className="border-b border-slate-200/85 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
              Dasbor Developer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Super Administrator - Ringkasan performa platform laundry secara global
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-purple-50 text-purple-650 border border-purple-250/30 font-bold shadow-sm">
            Developer Mode
          </span>
        </header>

        {/* Dashboard Grid Panel */}
        <main className="flex-1 p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-650 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {loading || !stats ? (
            <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-purple-600 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Mengambil metrik ringkasan platform...</p>
            </div>
          ) : (
            <>
              {/* 📊 PLATFORM STATISTICS (Light Theme Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stats Card: Tenants */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 rounded-full filter blur-3xl opacity-5 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Total Tenants (Laundry)
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      🏢
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {stats.tenantCount}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Jumlah outlet laundry terdaftar dalam ekosistem SaaS.
                  </p>
                </div>

                {/* Stats Card: Users */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full filter blur-3xl opacity-5 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Total Akun Pengguna
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      👥
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {stats.userCount}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Akumulasi Owner, Kasir, dan Developer aktif.
                  </p>
                </div>

                {/* Stats Card: Orders */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full filter blur-3xl opacity-5 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Transaksi Platform
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      🧺
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {stats.orderCount}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Jumlah total order cucian masuk di seluruh outlet.
                  </p>
                </div>

                {/* Stats Card: Total Revenue */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500 rounded-full filter blur-3xl opacity-5 -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Total Omset Platform
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-sm shadow-sm font-bold">
                      💰
                    </div>
                  </div>
                  <span className="text-3xl font-display font-black text-slate-800">
                    {stats.totalRevenue.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                    Total pendapatan PAID yang sukses dilunasi pada platform.
                  </p>
                </div>
              </div>

              {/* 📑 RECENT DATA OVERVIEWS (Clean Light UI) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tenants Section */}
                <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-650 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-purple-650"></span>
                        Tenants Baru Terdaftar
                      </h3>
                      <Link href="/developer/tenants" className="text-xs text-purple-600 hover:text-purple-750 font-bold">
                        Kelola Semua →
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      {recentTenants.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">Belum ada tenant laundry terdaftar.</p>
                      ) : (
                        recentTenants.map((ten) => (
                          <div key={ten.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
                            <div>
                              <span className="text-xs font-black text-slate-800 block">{ten.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {new Date(ten.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <span className="text-[10px] py-1 px-2.5 rounded-full bg-slate-200/50 text-slate-600 font-bold font-mono">
                              {ten.orderCount} Order
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Users Section */}
                <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-650 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-purple-650"></span>
                        Pengguna Baru Bergabung
                      </h3>
                      <Link href="/developer/users" className="text-xs text-purple-600 hover:text-purple-750 font-bold">
                        Kelola Semua →
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      {recentUsers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">Belum ada pengguna terdaftar.</p>
                      ) : (
                        recentUsers.map((usr) => (
                          <div key={usr.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
                            <div>
                              <span className="text-xs font-black text-slate-800 block">{usr.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{usr.email}</span>
                            </div>
                            <span className={`text-[9px] py-1 px-2.5 rounded-full font-bold border uppercase ${
                              usr.role === "DEVELOPER"
                                ? "bg-purple-50 text-purple-600 border-purple-200/50"
                                : usr.role === "OWNER"
                                ? "bg-blue-50 text-blue-600 border-blue-200/50"
                                : "bg-emerald-50 text-emerald-600 border-emerald-200/50"
                            }`}>
                              {usr.role}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips banner */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                <span className="text-lg">💡</span>
                <div>
                  <h4 className="font-bold text-slate-700 mb-0.5">Navigasi Admin Developer</h4>
                  <p>Gunakan menu-menu di <strong>sidebar sebelah kiri</strong> untuk mengelola data secara penuh, melakukan pendaftaran laundry tenant baru, serta melihat detail data pengguna terdaftar.</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
