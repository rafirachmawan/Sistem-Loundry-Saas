"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [laundryName, setLaundryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laundryName,
          ownerName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Gagal melakukan pendaftaran");
        setLoading(false);
        return;
      }

      // Simpan info user ke localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Berhasil, arahkan langsung ke dashboard owner
      router.push("/owner/dashboard");
    } catch (err) {
      setError("Gagal menghubungi server. Pastikan server Next.js Anda aktif.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Background glow green */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500 rounded-full filter blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen z-10">
        
        {/* 🖥️ LEFT COLUMN: BRANDING SHOWCASE (VISIBLE ON DESKTOP) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 relative overflow-hidden">
          {/* Animated decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-300 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <Link href="/" className="text-xl font-display font-extrabold text-white tracking-tight">
              Laundr<span className="text-brand-300">SaaS</span>
            </Link>
          </div>

          {/* Showcase Copy */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-emerald-400/10 text-emerald-350 border border-emerald-400/20 text-xs font-bold uppercase tracking-wide">
                🎁 PROMO LAUNCHING
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
                Gratis Uji Coba <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-teal-300">
                  Full Akses 7 Hari!
                </span>
              </h1>
            </div>
            <p className="text-brand-100/70 text-sm leading-relaxed font-medium">
              Daftarkan outlet laundry Anda sekarang dan rasakan kemudahan pengelolaan POS kasir super cepat, pantau antrean visual pengerjaan cucian, serta notifikasi struk digital otomatis ke WhatsApp pelanggan.
            </p>

            {/* Trial Info Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 relative overflow-hidden shadow-2xl">
              <div className="flex gap-4 items-start">
                <div className="text-2xl">⚡</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Tanpa Kartu Kredit / Uang Muka</h4>
                  <p className="text-xs text-brand-100/60 leading-relaxed font-medium">
                    Uji coba gratis 1 minggu penuh. Anda bisa memutuskan untuk berlangganan Paket Pro bulanan setelah masa uji coba berakhir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <span className="text-xs text-brand-200/40 font-medium">
            © 2026 LaundrSaaS Corporation. All rights reserved.
          </span>
        </div>

        {/* 📝 RIGHT COLUMN: REGISTRATION FORM (Terang) */}
        <div className="flex lg:col-span-5 items-center justify-center p-8 bg-white relative border-l border-slate-100 shadow-2xl overflow-y-auto">
          <div className="w-full max-w-md space-y-6 py-6 animate-fade-in-up">
            
            <div>
              <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">
                Mulai Kelola Laundry Anda
              </h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                Hanya butuh 30 detik untuk mendaftarkan gerai Anda dan langsung menggunakan sistem POS.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Nama Bisnis Laundry
                </label>
                <input
                  type="text"
                  value={laundryName}
                  onChange={(e) => setLaundryName(e.target.value)}
                  placeholder="Contoh: Laundrease Jaya"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Nama Pemilik (Owner)
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama lengkap Anda..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@laundryanda.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-brand-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Mulai Uji Coba Gratis 7 Hari"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-slate-500 font-semibold">
                Sudah memiliki akun?{" "}
                <Link href="/login" className="text-brand-600 hover:text-brand-700 font-bold underline">
                  Masuk di sini
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
