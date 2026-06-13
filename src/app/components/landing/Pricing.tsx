"use client";

import { useState } from "react";
import Link from "next/link";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="harga" className="py-24 bg-white border-t border-slate-200/60 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-sm font-bold tracking-widest text-brand-600 uppercase">Paket Berlangganan</h2>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Investasi Terjangkau untuk Pertumbuhan Bisnis Anda
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            Mulai gratis selama satu minggu penuh, lalu tingkatkan ke paket premium untuk membuka seluruh fitur tanpa batas.
          </p>

          {/* Billing Toggle */}
          <div className="pt-6 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold transition ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>Bulanan</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 rounded-full bg-brand-100 flex items-center p-0.5 transition duration-300 relative focus:outline-none cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-full bg-brand-600 transition duration-300 transform ${isYearly ? "translate-x-6" : ""}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition ${isYearly ? "text-slate-900" : "text-slate-400"}`}>Tahunan</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hemat 20%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          
          {/* Free Trial Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-700">Paket Starter</h3>
                <p className="text-slate-500 text-xs mt-1 min-h-[48px]">Uji kelayakan sistem secara gratis sebelum mulai berlangganan.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-black text-slate-900">Rp0</span>
                <span className="text-slate-400 text-xs">/ 7 Hari</span>
              </div>
              <hr className="border-slate-200" />
              <ul className="space-y-3 text-slate-600 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> 1 Outlet Cabang
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> 1 Kasir per Outlet
                </li>
                <li className="flex items-center gap-2 text-slate-300 line-through decoration-slate-200">
                  <span className="text-slate-350 text-xs">✕</span> Uang Masuk & Keluar
                </li>
                <li className="flex items-center gap-2 text-slate-300 line-through decoration-slate-200">
                  <span className="text-slate-350 text-xs">✕</span> Struk Langsung ke WA
                </li>
                <li className="flex items-center gap-2 text-slate-300 line-through decoration-slate-200">
                  <span className="text-slate-350 text-xs">✕</span> Jalin WA (Save Kontak)
                </li>
                <li className="flex items-center gap-2 text-slate-300 line-through decoration-slate-200">
                  <span className="text-slate-350 text-xs">✕</span> Backup Harian & Excel
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Support 24/7 (SLA Standar)
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link 
                href="/register" 
                className="block w-full py-3 text-center rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Mulai Uji Coba 7 Hari
              </Link>
            </div>
          </div>

          {/* Premium Card - Recommended */}
          <div className="bg-white border-2 border-brand-500 rounded-3xl p-8 flex flex-col justify-between shadow-lg relative">
            {/* Recommended Ribbon */}
            <div className="absolute -top-3 right-6 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Rekomendasi Utama
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Paket Laundry Pro</h3>
                <p className="text-brand-600 text-xs font-semibold mt-1 min-h-[48px]">Kelola cashflow & kirim nota WA otomatis. Laundry makin profesional!</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-black text-slate-900">
                  {isYearly ? "Rp490.000" : "Rp49.000"}
                </span>
                <span className="text-slate-400 text-xs">
                  {isYearly ? "/ Tahun" : "/ Bulan"}
                </span>
              </div>
              <hr className="border-slate-200" />
              <ul className="space-y-3 text-slate-700 text-xs">
                <li className="flex items-center gap-2 font-semibold">
                  <span className="text-brand-600 text-sm">✓</span> Maksimal 2 Outlet Cabang
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> 1 Kasir per Cabang/Outlet
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Catat Uang Masuk & Keluar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Kirim Nota/Struk Langsung ke WA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Jalin Hubungan WA (Save Kontak)
                </li>
                <li className="flex items-center gap-2 text-slate-300 line-through decoration-slate-200">
                  <span className="text-slate-350 text-xs">✕</span> Backup Harian & Excel
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Dukungan Support Layanan 24/7
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link 
                href="/register" 
                className="block w-full py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-md shadow-brand-600/10 cursor-pointer"
              >
                Mulai Berlangganan Sekarang
              </Link>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Paket Enterprise</h3>
                <p className="text-slate-500 text-xs mt-1 min-h-[48px]">Kapasitas tanpa batas untuk jaringan laundry besar. Manajemen & kontrol maksimal!</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-black text-slate-900">
                  {isYearly ? "Rp1.490.000" : "Rp149.000"}
                </span>
                <span className="text-slate-400 text-xs">
                  {isYearly ? "/ Tahun" : "/ Bulan"}
                </span>
              </div>
              <hr className="border-slate-200" />
              <ul className="space-y-3 text-slate-600 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Outlet Cabang Tanpa Batas (Unl.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> User Kasir Tanpa Batas (Unl.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Semua Fitur Pro Bebas Akses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Custom Branding Logo di Struk WA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Jalin WA (Save Kontak Pelanggan)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Backup Data Harian & Ekspor Excel
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600 text-sm">✓</span> Layanan Bantuan Prioritas 24/7
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link 
                href="/register" 
                className="block w-full py-3 text-center rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Mulai Berlangganan Sekarang
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
