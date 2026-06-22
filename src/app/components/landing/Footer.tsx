import Link from "next/link";

export default function Footer() {
  return (
    <>
      {/* Call-to-Action Bottom Banner */}
      <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
        {/* Background decorations for banner */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full filter blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight">
            Siap Naikkan Level Bisnis Laundry Anda?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Hanya butuh 1 menit untuk mendaftar dan mencoba seluruh kemudahan POS kasir laundry modern kami. Coba gratis sekarang juga.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm sm:text-base text-center transition shadow-lg shadow-brand-600/30"
            >
              Coba Gratis 7 Hari (Tanpa Kartu Kredit)
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-sm sm:text-base text-center transition"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Details */}
      <footer className="bg-slate-950 text-slate-500 py-12 text-xs sm:text-sm border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-24 h-24 flex items-center justify-center -ml-4 -mt-4">
                <img src="/logo.png" alt="Spindo Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <p className="text-slate-500 text-xs">
              Sistem SaaS manajemen operasional laundry terlengkap untuk wirausahawan modern Indonesia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Navigasi Halaman</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#fitur" className="hover:text-white transition">Fitur Utama</a></li>
              <li><a href="#kelebihan" className="hover:text-white transition">Kelebihan & Kekurangan</a></li>
              <li><a href="#harga" className="hover:text-white transition">Paket Harga</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Tautan Cepat</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white transition">Halaman Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Pendaftaran Tenant</Link></li>
              <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Kontak Kami</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>📧 info@spindo.com</li>
              <li>📞 +62 821-2345-6789 (WhatsApp Support)</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>

        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
          © 2026 Spindo Corporation. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </>
  );
}
