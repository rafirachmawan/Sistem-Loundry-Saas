"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeveloperOnboardPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [tier, setTier] = useState("STARTER");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOnboardTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/developer/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          ownerName,
          ownerEmail,
          ownerPhone,
          ownerPassword,
          tier,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Sukses mendaftarkan tenant "${tenantName}" beserta owner-nya!`);
        setTenantName("");
        setOwnerName("");
        setOwnerEmail("");
        setOwnerPhone("");
        setOwnerPassword("");
        setTier("STARTER");
        
        // Arahkan ke daftar tenant setelah 2 detik
        setTimeout(() => {
          router.push("/developer/tenants");
        }, 2000);
      } else {
        setErrorMsg(data.message || "Gagal melakukan onboarding tenant baru.");
      }
    } catch (err) {
      setErrorMsg("Kesalahan koneksi jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>

      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/85 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Onboard Tenant
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Daftarkan laundry baru dan owner-nya secara langsung ke dalam platform
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold shadow-sm">
            Quick Onboarding
          </span>
        </header>

        {/* Main Panel */}
        <main className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
            
            <div className="bg-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <h3 className="text-xl font-display font-black tracking-tight mb-2 text-white">
                ✨ Registrasi Tenant Baru
              </h3>
              <p className="text-emerald-100 text-sm max-w-xl">
                Lengkapi formulir di bawah ini untuk mendaftarkan outlet laundry baru. Akun Owner dan 3 layanan master default akan dibuat secara otomatis.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3 shadow-sm">
                <span className="text-lg">⚠️</span>
                <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 text-sm bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-xl flex items-center gap-3 shadow-sm">
                <span className="text-lg">✅</span>
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleOnboardTenant} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bagian Kiri: Informasi Tenant */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Informasi Laundry</h4>
                  </div>

                  {/* Tenant Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Nama Laundry / Outlet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Contoh: Clean & Fresh Laundry"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 font-semibold"
                    />
                  </div>

                  {/* Tenant Tier / Paket */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Paket Langganan (Tier) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all duration-200 font-semibold cursor-pointer"
                    >
                      <option value="STARTER">🌟 Starter (Trial 7 Hari)</option>
                      <option value="PRO">🚀 Pro (Standar)</option>
                      <option value="ENTERPRISE">🏢 Enterprise (Premium)</option>
                    </select>
                  </div>
                </div>

                {/* Bagian Kanan: Informasi Owner */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Akun Utama (Owner)</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Owner Name */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Nama pemilik laundry"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 font-semibold"
                      />
                    </div>

                    {/* Owner Email */}
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Email Login <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@laundry.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 font-semibold"
                      />
                    </div>

                    {/* Owner Phone */}
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        No. WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="0812..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 font-semibold"
                      />
                    </div>

                    {/* Owner Password */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Kata Sandi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 font-semibold"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[240px]"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Daftarkan Tenant Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
