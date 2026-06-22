"use client";

import { useState, useEffect } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [subStatus, setSubStatus] = useState<"TRIAL" | "ACTIVE">("TRIAL");
  const [activePlanId, setActivePlanId] = useState<string>("trial");
  const [expiryDate, setExpiryDate] = useState<Date>(() => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  // Modal & Loading States
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "VA">("QRIS");
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        // Cek data langganan dari backend (saat login) jika ada
        if (parsed.tenantTier) {
          const isStarter = parsed.tenantTier === "STARTER";
          
          setActivePlanId(isStarter ? "trial" : parsed.tenantTier.toLowerCase());
          setSubStatus(isStarter ? "TRIAL" : "ACTIVE");
          
          let expiredAt;
          if (parsed.tenantCreatedAt) {
            const createdAt = new Date(parsed.tenantCreatedAt);
            expiredAt = isStarter
              ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
              : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
          } else {
            // Fallback default 7 / 30 days from now if createdAt is missing
            expiredAt = new Date(Date.now() + (isStarter ? 7 : 30) * 24 * 60 * 60 * 1000);
          }
          
          setExpiryDate(expiredAt);
        } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
          // Fallback ke mock jika data backend lama (sebelum update auth) belum ada
          setActivePlanId("pro");
          setSubStatus("ACTIVE");
          setExpiryDate(new Date("2026-07-17T10:00:00"));
        }
        
        // Tetap cek apakah ada data override langganan tersimpan di localStorage dari simulasi bayar
        const savedSub = localStorage.getItem(`sub_${parsed.email}`);
        if (savedSub) {
          const sub = JSON.parse(savedSub);
          setActivePlanId(sub.planId);
          setSubStatus(sub.status);
          setExpiryDate(new Date(sub.expiryDate));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const plans: Plan[] = [
    {
      id: "trial",
      name: "Paket Uji Coba (Free Trial)",
      price: 0,
      period: "7 Hari",
      features: [
        "✓ 1 Outlet Cabang",
        "✓ 1 Kasir per Outlet",
        "✓ Max 3 Master Layanan",
        "✗ Uang Masuk & Keluar",
        "✗ Struk Langsung ke WA",
        "✗ Jalin WA (Save Kontak)",
        "✗ Backup Harian & Excel",
        "✓ Support 24/7 (SLA Standar)",
      ],
    },
    {
      id: "pro",
      name: "Paket Pro Bulanan",
      price: 49000,
      period: "Bulan",
      popular: true,
      features: [
        "✓ Max 2 Outlet Cabang",
        "✓ 1 Kasir per Outlet",
        "✓ Max 10 Master Layanan",
        "✓ Uang Masuk & Keluar",
        "✓ Struk Langsung ke WA",
        "✓ Jalin WA (Save Kontak)",
        "✗ Backup Harian & Excel",
        "✓ Support 24/7",
      ],
    },
    {
      id: "enterprise",
      name: "Paket Enterprise Bulanan",
      price: 149000,
      period: "Bulan",
      features: [
        "✓ Outlet Cabang Unl.",
        "✓ User Kasir Unl.",
        "✓ Master Layanan Unl.",
        "✓ Uang Masuk & Keluar",
        "✓ Struk WA Custom Logo",
        "✓ Jalin WA (Save Kontak)",
        "✓ Backup Harian & Excel",
        "✓ Support Prioritas 24/7",
      ],
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "trial") return; // Trial sudah aktif bawaan
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleSimulatePayment = () => {
    setConfirming(true);
    // Simulasi verifikasi uang masuk 1.5 detik
    setTimeout(() => {
      setConfirming(false);
      setSubStatus("ACTIVE");
      if (selectedPlan) {
        setActivePlanId(selectedPlan.id);
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30); // 30 days for monthly plan
        setExpiryDate(newExpiry);

        // Simpan langganan ke localStorage agar tidak hilang saat direfresh
        if (user) {
          localStorage.setItem(
            `sub_${user.email}`,
            JSON.stringify({
              planId: selectedPlan.id,
              status: "ACTIVE",
              expiryDate: newExpiry.toISOString(),
            })
          );
        }
      }
      setShowModal(false);
      setSuccessMsg(`Berhasil! Langganan Anda diperbarui ke "${selectedPlan?.name}"`);
      // Sembunyikan pesan sukses setelah 4 detik
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        
        {/* Header section */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Billing & Langganan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Kelola langganan bulanan outlet laundry Anda</p>
          </div>
          <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold shadow-sm">
            Billing Portal
          </span>
        </header>

        {/* Billing Panel */}
        <main className="flex-1 p-6 space-y-8">
          
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-extrabold text-center shadow-md animate-fade-in-up flex items-center justify-center gap-2">
              <span className="text-lg">🎉</span> {successMsg}
            </div>
          )}

          {/* 1. STATUS LANGGANAN CARD */}
          <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-400 rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${subStatus === "ACTIVE" ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"}`}></span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Akun Saat Ini</span>
                </div>
                <h2 className="text-2xl font-display font-black text-slate-800">
                  {plans.find((p) => p.id === activePlanId)?.name || "Masa Uji Coba Gratis (Free Trial)"}
                </h2>
                <p className="text-xs text-slate-400 font-semibold">
                  Status: <span className="text-slate-700 font-bold">{subStatus === "TRIAL" ? "Free Trial" : "Berlangganan Aktif"}</span> | Akun Owner: <span className="text-slate-700">{user?.email || "owner@spindo.com"}</span>
                </p>
              </div>

              {/* Status Badge Action */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center md:text-right min-w-[200px] shadow-inner">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Masa Berlaku Aktif</span>
                <span className={`text-xl font-black font-mono ${subStatus === "ACTIVE" ? "text-emerald-600" : "text-amber-600"}`}>
                  Sisa {daysRemaining} Hari
                </span>
                <span className="text-[9px] text-slate-400 block font-semibold mt-1">Hingga: {expiryDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </section>

          {/* 2. CHOOSE PLAN SECTION */}
          <section className="space-y-6">
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                Pilih Paket Langganan Outlet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Beralih ke Paket Pro untuk membuka seluruh fitur dasbor owner dan integrasi WhatsApp</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === activePlanId;
                
                return (
                  <div
                    key={plan.id}
                    className={`glass-panel rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 border ${
                      plan.popular ? "border-brand-500/50 shadow-md shadow-brand-500/5" : "border-slate-200"
                    } ${isCurrentPlan ? "border-emerald-500/50 bg-emerald-50/10" : ""}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-6 py-1 px-3.5 rounded-full bg-brand-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                        Terpopuler
                      </span>
                    )}

                    {isCurrentPlan && (
                      <span className="absolute -top-3 left-6 py-1 px-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                        Aktif Saat Ini
                      </span>
                    )}

                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 mt-3">
                          <span className="text-2xl font-black font-mono text-slate-900">
                            {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-xs text-slate-400 font-bold">/ {plan.period}</span>
                          )}
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-2 text-xs text-slate-650 font-semibold border-t border-slate-100 pt-4 min-h-[175px]">
                        {plan.features.map((feat, idx) => {
                          const isExcluded = feat.startsWith("✗");
                          return (
                            <li key={idx} className={`flex items-center gap-2 ${isExcluded ? "text-slate-300 line-through decoration-slate-200" : ""}`}>
                              <span className={isExcluded ? "text-slate-350" : "text-emerald-500 font-bold"}>
                                {isExcluded ? "✗" : "✓"}
                              </span>
                              <span>{feat.substring(2)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isCurrentPlan || plan.id === "trial"}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm ${
                          isCurrentPlan
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : plan.id === "trial"
                            ? "bg-slate-150 text-slate-400 cursor-not-allowed"
                            : "bg-brand-600 hover:bg-brand-500 text-white active:bg-brand-700"
                        }`}
                      >
                        {isCurrentPlan ? "Paket Aktif" : plan.id === "trial" ? "Sudah Digunakan" : "Pilih Paket & Bayar"}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>

        </main>
      </div>

      {/* 🔴 MOCK PAYMENT MODAL (Simulasi Midtrans/Xendit) */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-base font-display font-extrabold text-slate-800">
                Simulasi Gerbang Pembayaran
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plan Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex justify-between items-center text-xs shadow-inner">
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider">Paket Dipilih</span>
                <span className="font-extrabold text-slate-800">{selectedPlan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-bold uppercase tracking-wider">Total Pembayaran</span>
                <span className="font-black font-mono text-brand-600">Rp {selectedPlan.price.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Pilih Metode Transfer</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    paymentMethod === "QRIS"
                      ? "bg-brand-50 border-brand-500/50 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Scan QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("VA")}
                  className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    paymentMethod === "VA"
                      ? "bg-brand-50 border-brand-500/50 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Virtual Account
                </button>
              </div>
            </div>

            {/* Payment Graphic Placeholder */}
            <div className="p-6 rounded-xl bg-white border border-slate-150 flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[220px]">
              {paymentMethod === "QRIS" ? (
                <>
                  {/* Mock QRIS Visual */}
                  <div className="w-32 h-32 border-4 border-slate-800 rounded-lg p-2 flex flex-col justify-between items-center relative bg-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest leading-none font-mono">QRIS BRAND</span>
                    {/* Simulated QR block code squares */}
                    <div className="grid grid-cols-4 gap-2.5 w-24 h-24 p-1">
                      <div className="bg-slate-800 rounded"></div>
                      <div className="bg-slate-850 rounded"></div>
                      <div className="bg-slate-900 rounded"></div>
                      <div className="bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    Silakan scan kode QRIS di atas dengan aplikasi m-banking atau e-wallet Anda (Gopay, OVO, ShopeePay).
                  </p>
                </>
              ) : (
                <div className="w-full space-y-4 py-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Nomor Rekening VA (BCA)</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-black font-mono text-slate-800">88019 28392 8172</span>
                      <button
                        onClick={() => alert("Nomor VA berhasil disalin!")}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer text-[10px]"
                      >
                        Salin
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold max-w-[280px] mx-auto">
                    Gunakan menu Transfer Virtual Account pada mobile banking BCA Anda untuk menyelesaikan transfer.
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Payment Trigger */}
            <button
              onClick={handleSimulatePayment}
              disabled={confirming}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              {confirming ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Memverifikasi Pembayaran...
                </>
              ) : (
                "Saya Sudah Transfer (Simulasi)"
              )}
            </button>

          </div>
        </div>
      )}

    </>
  );
}
