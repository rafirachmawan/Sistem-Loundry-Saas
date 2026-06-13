"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

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
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />

      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/85 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-650"></span>
              Onboard Tenant
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Daftarkan laundry baru dan owner-nya secara langsung ke dalam platform
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-purple-550/10 text-purple-650 border border-purple-500/20 font-bold shadow-sm">
            Quick Onboarding
          </span>
        </header>

        {/* Main Panel */}
        <main className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-xl bg-white border border-slate-200/85 rounded-2xl p-8 shadow-sm space-y-6 self-start">
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-700">
                ✨ Registrasi Tenant Baru
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Pendaftaran tenant baru akan otomatis menyertakan 3 layanan master default agar outlet langsung siap bertransaksi.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-xl text-center font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleOnboardTenant} className="space-y-4">
              {/* Tenant Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Nama Laundry / Tenant
                </label>
                <input
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Contoh: Rafi Clean Laundry"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              {/* Tenant Tier / Paket */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Paket Layanan / Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-850 focus:outline-none transition duration-200 font-semibold"
                >
                  <option value="STARTER">Starter (Trial 7 Hari / Rp0)</option>
                  <option value="PRO">Pro (Rp49.000 / bln)</option>
                  <option value="ENTERPRISE">Enterprise (Rp149.000 / bln)</option>
                </select>
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Nama Lengkap Owner
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Rudi Santoso"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              {/* Owner Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Nomor WhatsApp / HP Owner
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              {/* Owner Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Email Akun Owner (untuk Login)
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="Contoh: owner@raficlean.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              {/* Owner Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Kata Sandi Owner
                </label>
                <input
                  type="password"
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition duration-200 font-semibold"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-purple-600/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Mendaftarkan Tenant Baru...
                    </>
                  ) : (
                    "Daftarkan Tenant & Owner"
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
