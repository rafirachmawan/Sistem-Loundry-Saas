"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  role: "OWNER" | "KASIR" | "DEVELOPER";
  tenantName?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePlanId, setActivePlanId] = useState<string>("trial");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        if (parsed.tenantTier) {
          setActivePlanId(parsed.tenantTier === "STARTER" ? "trial" : parsed.tenantTier.toLowerCase());
        } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
          setActivePlanId("pro");
        }
        
        const savedSub = localStorage.getItem(`sub_${parsed.email}`);
        if (savedSub) {
          const sub = JSON.parse(savedSub);
          setActivePlanId(sub.planId);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth");
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err) {
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const isOwner = user?.role === "OWNER";
  const isDeveloper = user?.role === "DEVELOPER";

  const menuItems = [
    ...(isDeveloper
      ? [
          {
            name: "CPanel Developer",
            href: "/developer/dashboard",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
            ),
          },
          {
            name: "Kelola Tenants",
            href: "/developer/tenants",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
          },
          {
            name: "Kelola Users",
            href: "/developer/users",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
          {
            name: "Onboard Tenant",
            href: "/developer/onboard",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            name: "Dashboard",
            href: "/owner/dashboard",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
            ),
          },
          {
            name: "Kelola Layanan",
            href: "/owner/services",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            name: "Kelola Cabang",
            href: "/owner/branches",
            locked: activePlanId !== "enterprise",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
          },
          {
            name: "Kelola Pengguna",
            href: "/owner/users",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
          {
            name: "Customasi Struk",
            href: "/owner/receipt",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },

        ]
      : []),
    ...(!isDeveloper
      ? [
          {
            name: "Kasir (POS)",
            href: "/kasir",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            name: "Visual Tracker",
            href: "/kasir/tracker",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            name: "Billing & Langganan",
            href: "/owner/billing",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* 🖥️ DESKTOP SIDEBAR (Terang) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between hidden md:flex z-30">
        <div>
          {/* Logo Brand */}
          <div className="p-4">
            <Link href="/" className="flex items-center justify-center w-28 h-28 group-hover:rotate-6 transition duration-300 mx-auto">
              <img src="/logo.png" alt="LondriOS Logo" className="w-full h-full object-contain" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-1">
            {menuItems.map((item: any) => {
              const active = pathname === item.href;
              
              if (item.locked) {
                return (
                  <button
                    key={item.name}
                    onClick={() => alert(
                      item.name === "Kelola Cabang" 
                      ? `Fitur ${item.name} hanya tersedia untuk Paket Enterprise. Silakan upgrade paket Anda di menu Billing & Langganan.`
                      : `Fitur ${item.name} tidak tersedia di paket Anda. Silakan upgrade paket Anda di menu Billing & Langganan.`
                    )}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed bg-slate-50/50 hover:bg-slate-100/50 border border-transparent transition-all"
                  >
                    <span className="text-slate-400">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left flex items-center justify-between">
                      {item.name}
                      <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    active
                      ? "bg-brand-50 text-brand-700 border border-brand-200/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 border border-transparent"
                  }`}
                >
                  <span className={`transition-colors duration-200 ${active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 border border-brand-200/50 flex items-center justify-center text-white font-extrabold font-display shadow-md">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.name || "Loading..."}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">{user?.tenantName || "SaaS Tenant"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200/60 hover:border-red-200/60 text-slate-600 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE FLOATING BOTTOM BAR (Terang) */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 bg-white/95 border border-slate-200/80 backdrop-blur-xl rounded-2xl flex md:hidden items-center justify-around px-4 shadow-[0_4px_25px_rgba(0,0,0,0.06)] z-40">
        {menuItems.map((item: any) => {
              const active = pathname === item.href;

              if (item.locked) {
                return (
                  <button
                    key={item.name}
                    onClick={() => alert(
                      item.name === "Kelola Cabang" 
                      ? `Fitur ${item.name} hanya tersedia untuk Paket Enterprise. Silakan upgrade paket Anda di menu Billing & Langganan.`
                      : `Fitur ${item.name} tidak tersedia di paket Anda. Silakan upgrade paket Anda di menu Billing & Langganan.`
                    )}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-400 opacity-80 cursor-not-allowed relative"
                  >
                    {item.icon}
                    <span className="text-[8px] mt-0.5 font-bold">{item.name.split(" ")[0]}</span>
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    active ? "text-brand-600 bg-brand-50" : "text-slate-500"
                  }`}
                >
                  {item.icon}
                  <span className="text-[8px] mt-0.5 font-bold">{item.name.split(" ")[0]}</span>
                </Link>
              );
            })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-500 hover:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[8px] mt-0.5 font-bold">Keluar</span>
        </button>
      </nav>
    </>
  );
}
