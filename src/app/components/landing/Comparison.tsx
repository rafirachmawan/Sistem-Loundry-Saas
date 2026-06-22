export default function Comparison() {
  return (
    <section id="kelebihan" className="py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-sm font-bold tracking-widest text-brand-600 uppercase">Perbandingan Jujur</h2>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Mengapa Memilih Spindo?
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            Kami menyajikan kelebihan dan batasan sistem kami secara terbuka agar Anda dapat mengambil keputusan bisnis yang paling tepat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Kelebihan (Pros) - Green Theme */}
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🟢</span>
              <h3 className="text-xl font-display font-bold text-slate-900">Kelebihan Utama</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Multi-Tenant Cabang Tanpa Batas</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Kelola puluhan outlet laundry dalam satu database terpusat yang aman, tanpa khawatir data antar cabang tercampur.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Biaya Operasional Murah</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Tanpa perlu instalasi server fisik mahal di toko. Cukup gunakan browser internet, sistem langsung siap pakai.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Hemat Kertas & Nota Digital Gratis</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Notifikasi status order otomatis terkirim langsung ke nomor WhatsApp pelanggan secara cuma-cuma.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Isolasi Keamanan Data Tenant</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Setiap tenant laundry memiliki enkripsi unik dan batasan hak akses yang ketat sehingga data keuangan dijamin aman.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Kekurangan / Keterbatasan (Cons) - Grey Theme */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">ℹ️</span>
              <h3 className="text-xl font-display font-bold text-slate-900">Kekurangan / Batasan</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Memerlukan Akses Internet Stabil</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Karena seluruh pencatatan data tersimpan di sistem cloud terpusat, kasir membutuhkan koneksi internet stabil (bisa menggunakan kuota tethering HP).</p>
                </div>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Fokus Mobile App Android (Saat Ini)</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Aplikasi mobile native yang siap diunduh saat ini baru didesain untuk perangkat Android. Pemilik perangkat iOS (iPhone) disarankan mengakses aplikasi melalui browser web.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Belum Mendukung Pembayaran EDC Kartu Kredit</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Pembayaran cashless saat ini difokuskan melalui sistem QRIS dinamis/statis dan Virtual Account perbankan, belum mendukung mesin gesek kartu fisik.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
