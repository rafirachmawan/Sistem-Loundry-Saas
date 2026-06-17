"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
      <nav className="mx-auto max-w-7xl glass-panel rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-brand-600 tracking-tight">LondriOS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <a href="#fitur" className="hover:text-brand-600 transition-colors">Fitur Utama</a>
          <a href="#kelebihan" className="hover:text-brand-600 transition-colors">Kelebihan & Kekurangan</a>
          <a href="#harga" className="hover:text-brand-600 transition-colors">Paket Harga</a>
          <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
          >
            Masuk Kasir / Owner
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold text-sm transition shadow-md shadow-brand-600/10"
          >
            Mulai Free Trial
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
          <a 
            href="#fitur" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-medium text-slate-700 hover:text-brand-600"
          >
            Fitur Utama
          </a>
          <a 
            href="#kelebihan" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-medium text-slate-700 hover:text-brand-600"
          >
            Kelebihan & Kekurangan
          </a>
          <a 
            href="#harga" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-medium text-slate-700 hover:text-brand-600"
          >
            Paket Harga
          </a>
          <a 
            href="#faq" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-medium text-slate-700 hover:text-brand-600"
          >
            FAQ
          </a>
          <hr className="border-slate-100 my-2" />
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md"
            >
              Mulai Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
