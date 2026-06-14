"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Akun atau password salah");
        setLoading(false);
        return;
      }

      // Berhasil login, simpan info user ke localStorage
      const user = data.user;
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
      }

      // Arahkan berdasarkan role
      if (user.role === "DEVELOPER") {
        router.push("/developer/dashboard");
      } else if (user.role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/kasir");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Pastikan server aktif.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Background blobs untuk pendaran halus (Emerald Green) */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500 rounded-full filter blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen z-10">
        
        {/* 🖥️ LEFT COLUMN: BRANDING SHOWCASE (VISIBLE ON DESKTOP) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 relative overflow-hidden">
          {/* Animated decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-300 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xl font-display font-extrabold text-white tracking-tight">
              Laundr<span className="text-brand-300">SaaS</span>
            </span>
          </div>

          {/* Showcase Copy & Mockup Card */}
          <div className="space-y-8 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              Satu Dasbor untuk Kendali <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-teal-300">
                Operasional Laundry Anda
              </span>
            </h1>
            <p className="text-brand-100/70 text-sm leading-relaxed font-medium">
              Mulai pencatatan transaksi kasir POS instan, lacak alur produksi cucian dari visual Kanban, hingga ingatkan piutang postpaid pelanggan otomatis melalui WhatsApp.
            </p>

            {/* Glowing Interactive Stats Card Mockup */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 relative overflow-hidden shadow-2xl transition duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-400 rounded-full filter blur-2xl opacity-20"></div>
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] uppercase font-bold text-brand-200 tracking-wider">Live Monitor POS</span>
                </div>
                <span className="text-[10px] text-brand-200 font-mono">Invoice #INV-2026-004</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-brand-200 block uppercase font-medium">Omset Hari Ini</span>
                  <span className="text-xl font-display font-bold text-white">Rp 1.450.000</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-200 block uppercase font-medium">Status Produksi</span>
                  <span className="text-xl font-display font-bold text-emerald-300">92% Siap Ambil</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copy */}
          <span className="text-xs text-brand-200/40 font-medium">
            © 2026 LaundrSaaS Corporation. All rights reserved.
          </span>
        </div>

        {/* 🔐 RIGHT COLUMN: LOGIN FORM (Terang) */}
        <div className="flex lg:col-span-5 items-center justify-center p-8 bg-white relative border-l border-slate-100 shadow-2xl">
          <div className="w-full max-w-md space-y-8 animate-fade-in-up">
            
            {/* Header info */}
            <div>
              <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">
                Selamat datang kembali
              </h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                Silakan masuk ke akun Anda untuk mengelola transaksi POS dan memantau status laundry hari ini.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Email / Nama Pengguna
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email atau nama pengguna"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-600 bg-slate-50 border-slate-300 rounded focus:ring-brand-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-500 cursor-pointer">
                  Simpan Akun
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-brand-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Masuk ke Sistem"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 font-semibold pt-1">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-brand-650 hover:text-brand-555 font-bold transition duration-150">
                Daftar Akun Baru
              </Link>
            </p>

            {/* Demo Accounts List */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 block text-center">
                Akun Demo Pengujian:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-[9px] text-slate-600 space-y-0.5 shadow-sm">
                  <span className="font-extrabold text-purple-650 block">Developer</span>
                  <span className="block truncate font-semibold">dev@laundry.com</span>
                  <span className="text-slate-450 block font-medium">Pass: dev123</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-[9px] text-slate-600 space-y-0.5 shadow-sm">
                  <span className="font-extrabold text-brand-600 block">Owner A</span>
                  <span className="block truncate font-semibold">owner@laundrease.com</span>
                  <span className="text-slate-450 block font-medium">Pass: owner123</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-[9px] text-slate-600 space-y-0.5 shadow-sm">
                  <span className="font-extrabold text-emerald-600 block">Kasir A</span>
                  <span className="block truncate font-semibold">kasir@laundrease.com</span>
                  <span className="text-slate-450 block font-medium">Pass: kasir123</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
