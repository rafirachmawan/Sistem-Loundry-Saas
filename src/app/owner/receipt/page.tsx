"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function ReceiptCustomizationPage() {
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string>("trial");
  
  // Settings State
  const [headerText, setHeaderText] = useState("Terima kasih telah mencuci di LondriOS!");
  const [footerText, setFooterText] = useState("Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami.");
  const [useCustomLogo, setUseCustomLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check user plan from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        let currentPlan = "trial";
        if (parsed.tenantTier) {
          currentPlan = parsed.tenantTier === "STARTER" ? "trial" : parsed.tenantTier.toLowerCase();
        }
        
        const savedSub = localStorage.getItem(`sub_${parsed.email}`);
        if (savedSub) {
          const sub = JSON.parse(savedSub);
          currentPlan = sub.planId;
        }
        
        setActivePlanId(currentPlan);

        if (currentPlan !== "enterprise") {
          setHeaderText("Terima kasih telah mencuci di LondriOS!");
          setFooterText("Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami. Cek riwayat laundry Anda melalui aplikasi LondriOS.");
        }
        
        // Mock loading data
        setTimeout(() => setLoading(false), 600);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Pengaturan struk WhatsApp berhasil disimpan!");
    }, 1000);
  };

  const isEnterprise = activePlanId === "enterprise";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />

      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Customasi Struk WhatsApp
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Atur format nota yang dikirimkan ke pelanggan</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs py-1 px-3 rounded-full font-bold shadow-sm uppercase ${
              isEnterprise 
                ? "bg-purple-50 text-purple-600 border border-purple-200/50" 
                : "bg-blue-50 text-blue-600 border border-blue-200/50"
            }`}>
              {activePlanId === "pro" ? "Pro Plan" : "Enterprise"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Memuat pengaturan...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                {!isEnterprise && (
                  <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">Template Struk Paten</h4>
                      <p className="text-xs text-blue-700 mt-1">Anda sedang menggunakan paket {activePlanId.toUpperCase()}. Struk WhatsApp akan menggunakan template standar kami. Upgrade ke Enterprise untuk mengkustomisasi isi dan logo struk.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Pengaturan Teks</h2>
                    <p className="text-xs text-slate-500">Sesuaikan pesan struk WA Anda</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Header Text */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                      Pesan Pembuka (Header)
                    </label>
                    <textarea 
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      disabled={!isEnterprise}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none transition-all ${!isEnterprise ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}`}
                      placeholder="Contoh: Halo Kak, terima kasih sudah laundry di tempat kami..."
                    />
                    <p className="text-[10px] text-slate-400">Pesan ini akan muncul di bagian atas nota WhatsApp.</p>
                  </div>

                  {/* Footer Text */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                      Pesan Penutup (Footer)
                    </label>
                    <textarea 
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      disabled={!isEnterprise}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none transition-all ${!isEnterprise ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}`}
                      placeholder="Syarat & ketentuan, jam buka toko, dsb..."
                    />
                    <p className="text-[10px] text-slate-400">Pesan ini akan muncul di bagian paling bawah nota WhatsApp.</p>
                  </div>

                  {/* Custom Logo (Enterprise Only) */}
                  <div className={`p-4 rounded-xl border ${isEnterprise ? 'border-purple-200 bg-purple-50/50' : 'border-slate-200 bg-slate-50'} relative overflow-hidden`}>
                    {!isEnterprise && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                          <span className="text-xs font-bold text-slate-600">Khusus Paket Enterprise</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-bold ${isEnterprise ? 'text-purple-900' : 'text-slate-700'}`}>Gunakan Logo Toko Sendiri</h4>
                        <p className={`text-xs mt-0.5 ${isEnterprise ? 'text-purple-600' : 'text-slate-500'}`}>
                          Tampilkan logo bisnis Anda di header pesan WA alih-alih logo default.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={useCustomLogo}
                          onChange={(e) => setUseCustomLogo(e.target.checked)}
                          disabled={!isEnterprise}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {isEnterprise && useCustomLogo && (
                      <div className="mt-4 pt-4 border-t border-purple-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white border border-purple-200 flex items-center justify-center shadow-sm">
                          <span className="text-xl">🏪</span>
                        </div>
                        <button type="button" className="text-xs font-bold text-purple-600 bg-white border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
                          Upload Logo
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSaving || !isEnterprise}
                      className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2 ${!isEnterprise ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 disabled:opacity-50'}`}
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          Menyimpan...
                        </>
                      ) : (
                        !isEnterprise ? "Terkunci" : "Simpan Pengaturan"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview UI */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-6">Preview Pesan WhatsApp</h3>
                
                {/* Mockup HP */}
                <div className="w-full max-w-[320px] rounded-[2.5rem] border-[8px] border-slate-800 bg-slate-100 overflow-hidden shadow-2xl relative h-[600px] flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10"></div>
                  
                  {/* WA Header */}
                  <div className="bg-[#075E54] px-4 pt-10 pb-3 flex items-center gap-3 text-white shadow-md z-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">👤</div>
                    <div>
                      <h4 className="text-sm font-bold leading-tight">LondriOS</h4>
                      <p className="text-[10px] opacity-80">Akun Bisnis</p>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto space-y-4">
                    {/* Date Bubble */}
                    <div className="flex justify-center">
                      <span className="bg-[#e1f3fb] text-[#54656f] text-[10px] px-3 py-1 rounded-lg shadow-sm">Hari Ini</span>
                    </div>

                    {/* Receipt Bubble */}
                    <div className="bg-white p-1 rounded-lg rounded-tl-none shadow-sm max-w-[95%] text-sm text-[#111b21] relative">
                      {/* Triangle */}
                      <div className="absolute -left-2.5 top-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                      
                      <div className="p-2 space-y-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                        {useCustomLogo && isEnterprise ? (
                          <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                            [LOGO TOKO ANDA]
                          </div>
                        ) : (
                          <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                            === NOTA LAUNDRY ===
                          </div>
                        )}
                        
                        <div>{headerText || "..."}</div>
                        
                        <div className="py-2 border-y border-dashed border-slate-300 text-slate-500">
                          (Rincian Transaksi, Layanan, Berat, Total Harga akan muncul otomatis di sini)
                        </div>
                        
                        <div className="italic text-slate-500">{footerText || "..."}</div>
                      </div>
                      
                      <div className="flex justify-end px-2 pb-1">
                        <span className="text-[9px] text-slate-400">10:45 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
