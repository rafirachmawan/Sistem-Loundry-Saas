import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 lg:grid lg:grid-cols-12 lg:gap-8 items-center">
      {/* Left Intro Text */}
      <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Sistem POS Multi-Tenant Modern #1 di Indonesia
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight leading-none text-slate-900">
          Kelola Banyak Cabang <br className="hidden sm:inline" />
          Laundry dalam <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">
            Satu Genggaman.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
          LondriOS membantu pemilik outlet laundry mencatat transaksi kasir &lt; 1 menit, memantau proses produksi cucian secara visual, dan menerima laporan keuangan otomatis.
        </p>

        {/* Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base text-center transition shadow-lg shadow-brand-600/20"
          >
            Mulai Free Trial 7 Hari
          </Link>
          <a 
            href="#fitur" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base text-center transition flex items-center justify-center gap-2"
          >
            Pelajari Fitur
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Quick Metrics */}
        <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-left">
          <div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900">500+</p>
            <p className="text-xs text-slate-500">Outlet Aktif</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Rp0</p>
            <p className="text-xs text-slate-500">Biaya Setup Awal</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900">99.9%</p>
            <p className="text-xs text-slate-500">Uptime Cloud Server</p>
          </div>
        </div>
      </div>

      {/* Right Dashboard Mockup (CSS Mockup) */}
      <div className="mt-16 lg:mt-0 lg:col-span-6 flex justify-center">
        <div className="relative w-full max-w-[520px] rounded-3xl bg-slate-900 p-3 shadow-2xl shadow-slate-950/20 border-4 border-slate-800">
          {/* Top camera hole mockup */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-24 h-4 bg-slate-800 rounded-b-xl z-20" />
          
          {/* Main Mockup Inside */}
          <div className="bg-slate-50 rounded-2xl overflow-hidden text-xs text-slate-900 font-sans h-[350px] relative flex flex-col">
            
            {/* Mockup Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-600 text-white font-bold flex items-center justify-center text-[10px]">
                  L
                </div>
                <div>
                  <p className="font-bold text-[10px] text-slate-800">Laundrease POS</p>
                  <p className="text-[8px] text-brand-600 font-semibold">Kasir Aktif - Outlet Pusat</p>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[8px] border border-emerald-100">
                ONLINE
              </div>
            </div>

            {/* Mockup Content Panels */}
            <div className="p-3 flex-1 flex gap-3 overflow-hidden">
              {/* Left Panel: Services list */}
              <div className="w-1/2 flex flex-col gap-2">
                <p className="font-bold text-[9px] text-slate-500 uppercase tracking-wider">Layanan Terlaris</p>
                
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[10px] text-slate-800">Cuci Setrika Reguler</p>
                    <p className="text-[9px] text-slate-500">Rp7.000 / kg</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center text-[10px] text-brand-600 font-bold">+</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[10px] text-slate-800">Cuci Selimut Besar</p>
                    <p className="text-[9px] text-slate-500">Rp25.000 / pcs</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center text-[10px] text-brand-600 font-bold">+</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[10px] text-slate-800">Express 6 Jam</p>
                    <p className="text-[9px] text-slate-500">Rp15.000 / kg</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center text-[10px] text-brand-600 font-bold">+</span>
                </div>
              </div>

              {/* Right Panel: Active Orders and visual statuses */}
              <div className="w-1/2 flex flex-col gap-2">
                <p className="font-bold text-[9px] text-slate-500 uppercase tracking-wider">Status Cucian Terkini</p>
                
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">#ORD-089 (Budi)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[8px] border border-amber-100">PROSES</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[60%]" />
                  </div>
                  <p className="text-[8px] text-slate-400">Status: Pencucian & Bilas</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">#ORD-088 (Siti)</span>
                    <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold text-[8px] border border-brand-100">SELESAI</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-full" />
                  </div>
                  <p className="text-[8px] text-slate-400">Status: Siap Diambil / Diantar</p>
                </div>
              </div>
            </div>

            {/* Floating Bottom Card: Sales stats graph representation */}
            <div className="absolute bottom-2 left-2 right-2 bg-gradient-to-r from-brand-600 to-emerald-600 rounded-xl p-3 text-white flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[8px] text-brand-100 font-medium uppercase tracking-wider">Total Omset Hari Ini</p>
                <p className="text-base font-bold">Rp1.850.000</p>
              </div>
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 bg-brand-200/40 h-2 rounded-t" />
                <div className="w-1.5 bg-brand-200/50 h-3 rounded-t" />
                <div className="w-1.5 bg-brand-200/70 h-4 rounded-t" />
                <div className="w-1.5 bg-white h-6 rounded-t animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
