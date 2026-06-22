"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  quantity: number;
  priceSnap: number;
  service: {
    name: string;
    unit: string;
  };
}

interface Customer {
  name: string;
  phone: string;
}

interface Order {
  id: string;
  invoiceNumber: string;
  status: string;
  paymentTerm: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
}

export default function TransactionsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat data transaksi");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase();
    return (
      order.invoiceNumber.toLowerCase().includes(term) ||
      order.customer.name.toLowerCase().includes(term) ||
      order.customer.phone.includes(term)
    );
  });

  return (
    <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Pantau semua pesanan dan status pembayaran</p>
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
              placeholder="Cari invoice, pelanggan, atau WA..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200 font-semibold shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
            <p className="text-slate-400 text-xs font-semibold">Memuat transaksi...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400 font-semibold italic">
                Belum ada data transaksi yang sesuai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Invoice / Waktu</th>
                      <th className="px-6 py-4">Pelanggan</th>
                      <th className="px-6 py-4">Status Pesanan</th>
                      <th className="px-6 py-4">Total & Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-brand-600 font-mono mb-1">{order.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{order.customer.name}</div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">{order.customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            order.status === "DONE" ? "bg-emerald-100 text-emerald-700" :
                            order.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black font-mono text-slate-800 mb-1">
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                          </div>
                          <div className="flex gap-1.5">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                              order.paymentStatus === "PAID" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-slate-100 text-slate-500">
                              {order.paymentTerm}
                            </span>
                          </div>
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
