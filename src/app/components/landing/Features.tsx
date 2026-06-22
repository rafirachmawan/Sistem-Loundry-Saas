"use client";

import { useState } from "react";

export default function Features() {
  const [activeTab, setActiveTab] = useState<"kasir" | "owner" | "wa">("kasir");

  return (
    <section id="fitur" className="bg-white py-24 border-y border-slate-200/60 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-brand-600 uppercase">Fitur Lengkap Aplikasi</h2>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Didesain Khusus untuk Bisnis Laundry Anda
          </p>
          <p className="text-slate-600 text-base sm:text-lg">
            Klik menu di bawah ini untuk melihat bagaimana Spindo mempercepat pekerjaan harian kasir dan membantu owner menganalisis performa bisnis.
          </p>
        </div>

        {/* Feature Selector Tabs */}
        <div className="mt-12 flex justify-center border-b border-slate-100 max-w-2xl mx-auto">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab("kasir")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "kasir" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              🖥️ POS Kasir Cepat
            </button>
            <button 
              onClick={() => setActiveTab("owner")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "owner" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              📊 Dasbor Laporan Owner
            </button>
            <button 
              onClick={() => setActiveTab("wa")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "wa" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              💬 Otomatis WhatsApp
            </button>
          </div>
        </div>

        {/* Interactive Feature Showcases */}
        <div className="mt-12 max-w-5xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-10 shadow-inner">
          {activeTab === "kasir" && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center text-xl font-bold">
                  01
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">Kasir Point-Of-Sale (POS) Ekstra Cepat</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Mencatat pesanan laundry kini tidak lagi rumit. Dengan grid layanan pintar (tanpa drop-down manual), kasir Anda cukup menekan tombol layanan, mengisi berat kilogram atau kuantitas, memilih pelanggan, dan pesanan langsung tersimpan ke sistem database cloud dalam hitungan detik.
                </p>
                <ul className="space-y-2 text-slate-700 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Pencarian data pelanggan secepat kilat.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Kalkulasi harga otomatis untuk diskon & layanan tambahan.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Pencetakan nota kertas fisik atau pengiriman nota digital.
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                {/* Mini-mockup POS Order Creation */}
                <p className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-4">Mulai Transaksi Baru</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-[11px] text-slate-600 font-semibold">👤 Pelanggan: Budi Santoso</span>
                    <span className="px-3 py-2 rounded-lg bg-brand-50 text-[11px] text-brand-700 font-semibold border border-brand-100">Member Aktif</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-800">Cuci Setrika Reguler x 4.5 Kg</span>
                      <span className="font-bold text-slate-900">Rp31.500</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-800">Parfum Premium Lavender</span>
                      <span className="font-bold text-brand-600">Rp0 (Promo)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 text-sm pt-2">
                    <span>Total Bayar</span>
                    <span>Rp31.500</span>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/10 cursor-pointer">
                    Simpan & Kirim Nota WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "owner" && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center text-xl font-bold">
                  02
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">Laporan Analitik Bisnis Real-time</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tidak perlu lagi datang langsung ke outlet untuk menanyakan omset hari ini. Masuk ke Dasbor Owner dari laptop Anda di mana saja untuk melihat laporan pendapatan harian, performa tiap cabang outlet laundry Anda, status produksi yang sedang antri, dan tren pelanggan terpopuler.
                </p>
                <ul className="space-y-2 text-slate-700 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Grafik pertumbuhan pendapatan bulanan.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Manajemen tarif layanan laundry yang fleksibel.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Export data laporan kasir lengkap ke format file.
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                {/* Mini-mockup Owner Analytics */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-sm">Grafik Pendapatan Juni 2026</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[9px] font-bold">+24% Bulan Ini</span>
                </div>
                <div className="h-28 flex items-end justify-between gap-2 pt-4 border-b border-slate-100 pb-2">
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-200 h-14 rounded" />
                    <span className="text-[9px] text-slate-400">Minggu 1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-200 h-20 rounded" />
                    <span className="text-[9px] text-slate-400">Minggu 2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-brand-500 h-24 rounded shadow-lg shadow-brand-500/20" />
                    <span className="text-[9px] text-brand-600 font-bold">Minggu 3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-200 h-16 rounded" />
                    <span className="text-[9px] text-slate-400">Minggu 4</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-medium">Layanan Favorit</p>
                    <p className="font-bold text-slate-800 text-xs">Cuci Kiloan Setrika</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-medium">Beban Cucian Hari Ini</p>
                    <p className="font-bold text-slate-800 text-xs">84.2 Kg</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wa" && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center text-xl font-bold">
                  03
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">WhatsApp Notification Auto-Sender</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Kurangi biaya cetak kertas nota fisik yang mudah robek atau hilang. Aplikasi ini secara otomatis mengirimkan pesan WhatsApp ke nomor pelanggan ketika pakaian mereka selesai diproses atau jika kasir ingin mengonfirmasi detail pesanan awal.
                </p>
                <ul className="space-y-2 text-slate-700 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Mengirim link nota digital interaktif.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Mengingatkan pengambilan jika pakaian mengendap lama.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Meningkatkan rasa percaya pelanggan dengan notifikasi profesional.
                  </li>
                </ul>
              </div>
              <div className="bg-[#e5ddd5] rounded-2xl p-4 shadow-sm border border-slate-200/80 relative overflow-hidden font-sans text-xs">
                {/* WhatsApp Chat simulator */}
                <div className="bg-[#075e54] text-white p-2.5 rounded-t-xl -mx-4 -mt-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">🟢</div>
                  <div>
                    <p className="font-bold text-[10px]">Laundrease Auto-Notif</p>
                    <p className="text-[7px] text-emerald-100">Official Business Assistant</p>
                  </div>
                </div>
                <div className="space-y-3 pt-3">
                  <div className="bg-white p-2.5 rounded-lg max-w-[85%] shadow-sm relative text-[10px] text-slate-800 animate-fade-in-up">
                    <p className="font-semibold text-brand-700 mb-1">Halo Kak Budi Santoso!</p>
                    <p>Pakaian Anda dengan order <strong>#ORD-089</strong> telah selesai dicuci, disetrika, dan dikemas rapi. Siap untuk diambil di outlet.</p>
                    <p className="mt-1 text-slate-500">Detail Nota: <span className="text-blue-600 underline">spindo.com/nota/89</span></p>
                    <p className="mt-2 text-slate-600 font-medium">Terima kasih atas kepercayaannya 🙏</p>
                    <span className="block text-right text-[7px] text-slate-400 mt-1">10:42 AM ✔✔</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
