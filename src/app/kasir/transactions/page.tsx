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

  // Modal Pembayaran States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"CASH" | "QRIS">("CASH");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [midtransLoading, setMidtransLoading] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap Script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  // Helper Kirim WhatsApp
  const sendWhatsAppReceipt = (order: Order, isPaid: boolean = false, cashAmount?: number) => {
    if (!order || !order.customer || !order.customer.phone) return;
    let phone = order.customer.phone;
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    
    const statusText = isPaid ? "*LUNAS*" : "*BELUM LUNAS*";
    
    let itemsText = "";
    if (order.items && order.items.length > 0) {
      itemsText = "%0A%0A*Detail Pesanan:*%0A";
      order.items.forEach((item: any) => {
        const itemName = item.service?.name || "Layanan";
        const itemPrice = item.priceSnap || 0;
        const subTotal = item.quantity * itemPrice;
        itemsText += `- ${item.quantity}x ${itemName} (Rp ${subTotal.toLocaleString("id-ID")})%0A`;
      });
    }

    let paymentDetails = "";
    if (isPaid && cashAmount && cashAmount >= order.totalPrice) {
      paymentDetails = `%0A%0A*Pembayaran Tunai:*%0AUang Diterima: Rp ${cashAmount.toLocaleString("id-ID")}%0AKembalian: Rp ${(cashAmount - order.totalPrice).toLocaleString("id-ID")}`;
    }

    const message = `Halo ${order.customer.name},%0ATransaksi Loundry Anda (Invoice: *${order.invoiceNumber}*) telah dicatat.%0A%0AStatus Pembayaran: ${statusText}%0ATotal Tagihan: *Rp ${order.totalPrice.toLocaleString("id-ID")}*${paymentDetails}${itemsText}%0A%0ATerima kasih telah mempercayakan pakaian Anda pada kami!`;
    
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleMidtransPayment = async (order: Order) => {
    setMidtransLoading(true);
    try {
      const res = await fetch("/api/payments/midtrans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        (window as any).snap.pay(data.token, {
          onSuccess: async function (result: any) {
            alert("Pembayaran berhasil!");
            sendWhatsAppReceipt(order, true);
            setShowPaymentModal(false);
            fetchOrders();
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda!");
            setShowPaymentModal(true);
          },
          onError: function (result: any) {
            alert("Pembayaran gagal!");
            setShowPaymentModal(true);
          },
          onClose: function () {
            setShowPaymentModal(true);
          },
        });
      } else {
        alert("Gagal memuat Midtrans: " + data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setMidtransLoading(false);
    }
  };

  const handlePayOrder = async (method: "CASH" | "QRIS") => {
    if (!selectedOrder) return;
    
    if (method === "QRIS") {
      setShowPaymentModal(false);
      handleMidtransPayment(selectedOrder);
      return;
    }

    setSubmitting(true);
    try {
      const parsedCash = parseFloat(cashGiven || "0");
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "PAID",
          paymentMethod: "CASH",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Pembayaran berhasil dicatat!");
        setShowPaymentModal(false);
        sendWhatsAppReceipt(selectedOrder, true, parsedCash);
        fetchOrders();
      } else {
        alert("Gagal memproses pembayaran: " + data.message);
      }
    } catch (err) {
      alert("Kesalahan jaringan saat memproses pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethodTab("CASH");
    setCashGiven("");
    setShowPaymentModal(true);
  };

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
                      <th className="px-6 py-4">Aksi</th>
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
                        <td className="px-6 py-4 align-middle">
                          {order.paymentStatus === "UNPAID" ? (
                            <button
                              onClick={() => openPaymentModal(order)}
                              className="px-3 py-1.5 bg-[#00A1A2] hover:bg-[#008f90] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                            >
                              Lunasi Tagihan
                            </button>
                          ) : (
                            <button
                              onClick={() => sendWhatsAppReceipt(order, true)}
                              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 w-max"
                            >
                              Kirim Ulang WA
                            </button>
                          )}
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

      {/* 🟢 PAYMENT MODAL */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-emerald-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-extrabold text-slate-800">Pelunasan Tagihan</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Rincian Pesanan */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detail Pesanan</h4>
              <div className="max-h-[140px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-slate-200/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-700">{item.quantity}x {item.service?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">@ Rp {item.priceSnap?.toLocaleString("id-ID")}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-600">
                      Rp {(item.quantity * item.priceSnap).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Display */}
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 mb-6 flex justify-between items-center shadow-sm">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Total Tagihan</span>
              <span className="text-2xl font-black font-mono text-brand-700 tracking-tight">Rp {selectedOrder.totalPrice.toLocaleString("id-ID")}</span>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200 shadow-inner">
              <button
                onClick={() => setPaymentMethodTab("CASH")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethodTab === "CASH" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
              >
                Tunai (Cash)
              </button>
              <button
                onClick={() => setPaymentMethodTab("QRIS")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethodTab === "QRIS" ? "bg-white text-[#00A1A2] shadow-sm border border-[#00A1A2]/20" : "text-slate-500 hover:text-slate-700"}`}
              >
                QRIS / Midtrans
              </button>
            </div>

            {/* Content Cash */}
            {paymentMethodTab === "CASH" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uang Diterima (Rp)</label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="Masukkan nominal uang tunai..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none font-mono font-bold text-slate-800 text-lg shadow-sm transition-all"
                  />
                </div>

                {parseFloat(cashGiven || "0") >= selectedOrder.totalPrice && (
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kembalian:</span>
                    <span className="text-xl font-black font-mono text-emerald-700">
                      Rp {(parseFloat(cashGiven || "0") - selectedOrder.totalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                
                {parseFloat(cashGiven || "0") > 0 && parseFloat(cashGiven || "0") < selectedOrder.totalPrice && (
                  <p className="text-xs text-red-500 font-bold italic text-center">Uang tidak cukup!</p>
                )}

                <button
                  onClick={() => handlePayOrder("CASH")}
                  disabled={submitting || parseFloat(cashGiven || "0") < selectedOrder.totalPrice}
                  className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Lunasi & Simpan
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Content QRIS */}
            {paymentMethodTab === "QRIS" && (
              <div className="space-y-4 animate-fade-in-up text-center py-4">
                <div className="w-16 h-16 mx-auto bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-2 shadow-inner border border-brand-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Pembayaran akan dilanjutkan melalui secure payment gateway Midtrans (QRIS/E-Wallet).</p>
                <button
                  onClick={() => handlePayOrder("QRIS")}
                  disabled={midtransLoading}
                  className="w-full py-4 mt-2 bg-[#00A1A2] hover:bg-[#008f90] text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00A1A2]/20 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                >
                  {midtransLoading ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Bayar dengan QRIS"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
