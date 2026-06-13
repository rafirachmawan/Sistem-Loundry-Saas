"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [laundryName, setLaundryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState("STARTER");
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
          phone,
          password,
          tier,
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
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-16 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 relative overflow-hidden">
          {/* Animated decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500 rounded-full filter blur-[120px] opacity-15 animate-pulse-glow"></div>

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-300 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <Link
              href="/"
              className="text-xl font-display font-extrabold text-white tracking-tight"
            >
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
              Daftarkan outlet laundry Anda sekarang dan rasakan kemudahan
              pengelolaan POS kasir super cepat, pantau antrean visual
              pengerjaan cucian, serta notifikasi struk digital otomatis ke
              WhatsApp pelanggan.
            </p>

            {/* Trial Info Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 relative overflow-hidden shadow-2xl">
              <div className="flex gap-4 items-start">
                <div className="text-2xl">⚡</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Tanpa Kartu Kredit / Uang Muka
                  </h4>
                  <p className="text-xs text-brand-100/60 leading-relaxed font-medium">
                    Uji coba gratis 1 minggu penuh. Anda bisa memutuskan untuk
                    berlangganan Paket Pro bulanan setelah masa uji coba
                    berakhir.
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
        <div className="flex lg:col-span-6 items-center justify-center p-8 bg-white relative border-l border-slate-100 shadow-2xl overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6 py-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">
                Mulai Kelola Laundry Anda
              </h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                Hanya butuh 30 detik untuk mendaftarkan gerai Anda dan langsung
                menggunakan sistem POS.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              {/* Pricing Cards Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Pilih Paket Layanan
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Starter Tier Card */}
                    <div
                      onClick={() => setTier("STARTER")}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        tier === "STARTER"
                          ? "border-brand-500 bg-brand-50/10 glow-emerald scale-[1.01]"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-200 text-slate-700 uppercase tracking-wider">
                            Starter
                          </span>
                          {tier === "STARTER" && (
                            <span className="w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[8px] font-extrabold shadow-sm animate-fade-in-up">
                              ✓
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-800 mt-1 text-brand-650">
                          Trial 7 Hari
                        </h4>
                        <div className="mt-0.5">
                          <span className="text-xs font-black text-slate-900">
                            Rp 0
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            / 7 hari
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed font-semibold min-h-[30px] flex items-start">
                          Uji coba gratis selama 7 hari.
                        </p>
                      </div>
                      <div className="border-t border-slate-100 mt-2 pt-1 space-y-0.5 text-[9px] text-slate-500 font-bold">
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ 1 Outlet Cabang</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ 1 Kasir per Outlet</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 line-through decoration-slate-200">
                          <span>✗ Uang Masuk & Keluar</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 line-through decoration-slate-200">
                          <span>✗ Struk Langsung ke WA</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 line-through decoration-slate-200">
                          <span>✗ Jalin WA (Save Kontak)</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 line-through decoration-slate-200">
                          <span>✗ Backup Harian & Excel</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Support 24/7 (SLA Standar)</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tier Card */}
                    <div
                      onClick={() => setTier("PRO")}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        tier === "PRO"
                          ? "border-brand-500 bg-brand-50/10 glow-emerald scale-[1.01]"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="absolute top-0 right-3 bg-gradient-to-r from-brand-500 to-emerald-400 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-b uppercase tracking-wider">
                        Populer
                      </div>
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-brand-100 text-brand-700 uppercase tracking-wider">
                            Pro
                          </span>
                          {tier === "PRO" && (
                            <span className="w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[8px] font-extrabold shadow-sm animate-fade-in-up">
                              ✓
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-800 mt-1 text-brand-650">
                          1 Bulan
                        </h4>
                        <div className="mt-0.5">
                          <span className="text-xs font-black text-slate-900">
                            Rp 49.000
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            / bulan
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed font-semibold min-h-[30px] flex items-start">
                          Kelola cashflow & kirim nota WA otomatis. Laundry
                          makin profesional!
                        </p>
                      </div>
                      <div className="border-t border-slate-100 mt-2 pt-1 space-y-0.5 text-[9px] text-slate-500 font-bold">
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Max 2 Outlet Cabang</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ 1 Kasir per Outlet</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Uang Masuk & Keluar</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Struk Langsung ke WA</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Jalin WA (Save Kontak)</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 line-through decoration-slate-200">
                          <span>✗ Backup Harian & Excel</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Support 24/7</span>
                        </div>
                      </div>
                    </div>

                    {/* Enterprise Tier Card */}
                    <div
                      onClick={() => setTier("ENTERPRISE")}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        tier === "ENTERPRISE"
                          ? "border-brand-500 bg-brand-50/10 glow-emerald scale-[1.01]"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-100 text-purple-700 uppercase tracking-wider">
                            Enterprise
                          </span>
                          {tier === "ENTERPRISE" && (
                            <span className="w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[8px] font-extrabold shadow-sm animate-fade-in-up">
                              ✓
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-800 mt-1 text-purple-650">
                          1 Bulan
                        </h4>
                        <div className="mt-0.5">
                          <span className="text-xs font-black text-slate-900">
                            Rp 149.000
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            / bulan
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed font-semibold min-h-[30px] flex items-start">
                          Kapasitas tanpa batas untuk jaringan laundry besar.
                          Manajemen & kontrol maksimal!
                        </p>
                      </div>
                      <div className="border-t border-slate-100 mt-2 pt-1 space-y-0.5 text-[9px] text-slate-500 font-bold">
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Outlet Cabang Unl.</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ User Kasir Unl.</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Uang Masuk & Keluar</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Struk WA Custom Logo</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Jalin WA (Save Kontak)</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Backup Harian & Excel</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-850">
                          <span>✓ Support Prioritas 24/7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Nomor WhatsApp / HP Klien
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition duration-200 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-brand-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : tier === "STARTER" ? (
                  "Mulai Uji Coba 7 Hari (Paket Starter)"
                ) : tier === "PRO" ? (
                  "Daftar Paket Pro (1 Bulan)"
                ) : (
                  "Daftar Paket Enterprise (1 Bulan)"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-slate-500 font-semibold">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="text-brand-600 hover:text-brand-700 font-bold underline"
                >
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
