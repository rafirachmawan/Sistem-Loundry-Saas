"use client";

import { useState } from "react";

export default function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200/60 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-bold tracking-widest text-brand-600 uppercase">Frequently Asked Questions</h2>
          <p className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </p>
        </div>

        <div className="space-y-4">
          
          {/* FAQ 1 */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition">
            <button 
              onClick={() => toggleFaq(1)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <span className="font-semibold text-slate-800 text-sm sm:text-base">Bagaimana cara mendaftarkan laundry baru saya?</span>
              <span className="text-slate-400 font-bold ml-4 text-lg">{openFaq === 1 ? "−" : "+"}</span>
            </button>
            {openFaq === 1 && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in-up">
                Cukup klik tombol &quot;Mulai Free Trial&quot; di bagian atas halaman ini. Anda akan diarahkan ke form pendaftaran. Isi nama laundry Anda, email aktif, nama lengkap Anda (sebagai Owner), dan password. Sistem kami akan langsung membuat akun owner, mencarikan 3 default layanan laundry instan, dan Anda bisa langsung login ke dashboard dalam waktu kurang dari 1 menit!
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition">
            <button 
              onClick={() => toggleFaq(2)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <span className="font-semibold text-slate-800 text-sm sm:text-base">Apakah data transaksi laundry saya aman dari tenant lain?</span>
              <span className="text-slate-400 font-bold ml-4 text-lg">{openFaq === 2 ? "−" : "+"}</span>
            </button>
            {openFaq === 2 && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in-up">
                Sangat aman. Sistem kami dibangun dengan arsitektur multi-tenant modern yang mengisolasi database setiap tenant secara logis. Data keuangan, transaksi pelanggan, serta tarif laundry Anda benar-benar terlindung dari akses tenant luar.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition">
            <button 
              onClick={() => toggleFaq(3)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <span className="font-semibold text-slate-800 text-sm sm:text-base">Bagaimana notifikasi WhatsApp dikirimkan?</span>
              <span className="text-slate-400 font-bold ml-4 text-lg">{openFaq === 3 ? "−" : "+"}</span>
            </button>
            {openFaq === 3 && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in-up">
                Setiap kali kasir Anda menyelesaikan status laundry Budi atau mencetak transaksi baru, sistem API kami akan otomatis mengirim pesan konfirmasi ke nomor WhatsApp pelanggan. Fitur ini sudah termasuk (built-in) dalam paket premium bulanan tanpa biaya pulsa tambahan.
              </div>
            )}
          </div>

          {/* FAQ 4 */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition">
            <button 
              onClick={() => toggleFaq(4)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <span className="font-semibold text-slate-800 text-sm sm:text-base">Bagaimana cara membayar setelah masa free trial 7 hari habis?</span>
              <span className="text-slate-400 font-bold ml-4 text-lg">{openFaq === 4 ? "−" : "+"}</span>
            </button>
            {openFaq === 4 && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in-up">
                Sebelum masa uji coba habis, Anda dapat masuk ke menu *Billing* di Dashboard Owner. Di sana Anda dapat memilih paket bulanan atau tahunan, lalu membayar dengan QRIS (Dana, OVO, ShopeePay, GoPay) atau Virtual Account BCA/Mandiri/BRI yang disimulasikan secara instan.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
