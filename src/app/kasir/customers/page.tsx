"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?limit=all&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(data.customers);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat data pelanggan");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
            Data Pelanggan
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Kelola daftar nama pelanggan cabang Anda</p>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col">
        {errorMsg && (
          <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
            {errorMsg}
          </div>
        )}

        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau WhatsApp..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200 font-semibold shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
            <p className="text-slate-400 text-xs font-semibold">Memuat pelanggan...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {customers.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400 font-semibold italic">
                Belum ada data pelanggan yang sesuai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Nama Pelanggan</th>
                      <th className="px-6 py-4">WhatsApp</th>
                      <th className="px-6 py-4">Bergabung Sejak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-black text-brand-600 uppercase">
                              {cust.name[0]}
                            </div>
                            {cust.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold">{cust.phone}</td>
                        <td className="px-6 py-4">
                          {new Date(cust.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
