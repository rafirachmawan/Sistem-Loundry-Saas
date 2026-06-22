"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  invoiceNumber: string;
  status: "QUEUED" | "IN_PROGRESS" | "READY" | "COMPLETED";
  paymentTerm: "PREPAID" | "POSTPAID";
  paymentStatus: "PAID" | "UNPAID";
  totalPrice: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    service: {
      name: string;
      unit: string;
    };
  }>;
}

export default function VisualTrackerPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil data orders dari API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat tracker data");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil data awal & polling
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Handler update status order
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`${orderId}-status`);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus as any } : ord))
        );
      } else {
        alert(data.message || "Gagal memperbarui status");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler pelunasan pembayaran postpaid (Terima Pelunasan)
  const handleCollectPayment = async (orderId: string) => {
    setActionLoading(`${orderId}-pay`);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: "PAID" } : ord))
        );
      } else {
        alert(data.message || "Gagal mencatat pelunasan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter order berdasarkan status kolom tracker
  const queuedOrders = orders.filter((o) => o.status === "QUEUED");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");
  const readyOrders = orders.filter((o) => o.status === "READY");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        
        {/* Header visual */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Visual Status Tracker
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Pantau status pengerjaan pakaian real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
              Auto-Sync (30s)
            </span>
          </div>
        </header>

        {/* Tracker Kanban Container */}
        <main className="flex-1 p-6 flex flex-col">
          {errorMsg && (
            <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="text-slate-400 text-xs font-semibold">Menyelaraskan papan produksi...</p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              
              {/* 1. KOLOM ANTREAN */}
              <TrackerColumn
                title="Antrean Masuk"
                count={queuedOrders.length}
                orders={queuedOrders}
                indicatorColor="bg-slate-400"
                renderCard={(order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    actionLoading={actionLoading}
                    actions={
                      <button
                        onClick={() => handleUpdateStatus(order.id, "IN_PROGRESS")}
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md shadow-brand-500/10"
                      >
                        Mulai Cuci
                      </button>
                    }
                  />
                )}
              />

              {/* 2. KOLOM DIPROSES */}
              <TrackerColumn
                title="Sedang Diproses"
                count={inProgressOrders.length}
                orders={inProgressOrders}
                indicatorColor="bg-brand-500"
                renderCard={(order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    actionLoading={actionLoading}
                    actions={
                      <button
                        onClick={() => handleUpdateStatus(order.id, "READY")}
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md shadow-brand-500/10"
                      >
                        Selesai Produksi
                      </button>
                    }
                  />
                )}
              />

              {/* 3. KOLOM SIAP DIAMBIL */}
              <TrackerColumn
                title="Siap Diambil"
                count={readyOrders.length}
                orders={readyOrders}
                indicatorColor="bg-emerald-500"
                renderCard={(order) => {
                  const isUnpaidPostpaid = order.paymentTerm === "POSTPAID" && order.paymentStatus === "UNPAID";

                  return (
                    <OrderCard
                      key={order.id}
                      order={order}
                      actionLoading={actionLoading}
                      actions={
                        <div className="space-y-2">
                          {isUnpaidPostpaid && (
                            <button
                              onClick={() => handleCollectPayment(order.id)}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white rounded-lg text-xs font-black cursor-pointer transition shadow-md shadow-amber-500/15 flex items-center justify-center gap-1"
                            >
                              💵 Terima Pelunasan
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                            disabled={isUnpaidPostpaid}
                            className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              isUnpaidPostpaid
                                ? "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-600/10"
                            }`}
                          >
                            {isUnpaidPostpaid ? (
                              <>
                                🔒 Ambil (Lunasi Dulu)
                              </>
                            ) : (
                              "Konfirmasi Diambil"
                            )}
                          </button>
                        </div>
                      }
                    />
                  );
                }}
              />

              {/* 4. KOLOM DIAMBIL */}
              <TrackerColumn
                title="Selesai / Diambil"
                count={completedOrders.length}
                orders={completedOrders}
                indicatorColor="bg-slate-600"
                renderCard={(order) => (
                  <OrderCard key={order.id} order={order} actionLoading={actionLoading} />
                )}
              />

            </div>
          )}
        </main>
      </div>
    </>
  );
}

// Sub-komponen Kolom Kanban
interface ColumnProps {
  title: string;
  count: number;
  orders: Order[];
  indicatorColor: string;
  renderCard: (order: Order) => React.ReactNode;
}
function TrackerColumn({ title, count, orders, indicatorColor, renderCard }: ColumnProps) {
  return (
    <div className="flex flex-col max-h-[78vh] bg-slate-100/40 border border-slate-200/80 rounded-2xl p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-250 bg-white font-mono text-slate-500 shadow-sm">
          {count}
        </span>
      </div>

      {/* Scrollable Card list */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 no-scrollbar">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-[10px] text-slate-400 font-semibold italic border border-dashed border-slate-200 rounded-xl">
            Tidak ada cucian
          </div>
        ) : (
          orders.map((ord) => renderCard(ord))
        )}
      </div>
    </div>
  );
}

// Sub-komponen Kartu Order Kanban (Terang)
function OrderCard({ order, actions, actionLoading }: { order: Order; actions?: React.ReactNode; actionLoading?: string | null }) {
  const isPayLoading = actionLoading === `${order.id}-pay`;
  const isStatusLoading = actionLoading === `${order.id}-status`;

  const getProgressStyles = () => {
    switch (order.status) {
      case "QUEUED":
        return { width: "15%", color: "bg-slate-400" };
      case "IN_PROGRESS":
        return { width: "50%", color: "bg-brand-500 animate-pulse" };
      case "READY":
        return { width: "90%", color: "bg-emerald-500" };
      case "COMPLETED":
        return { width: "100%", color: "bg-slate-500" };
    }
  };

  const progress = getProgressStyles();
  const isUnpaidPostpaid = order.paymentTerm === "POSTPAID" && order.paymentStatus === "UNPAID";
  const shouldGlow = order.status === "READY" && isUnpaidPostpaid;

  return (
    <div className={`p-4 rounded-xl bg-white border hover:border-slate-300 transition-all duration-300 group relative overflow-hidden shadow-sm ${
      shouldGlow ? "border-amber-400 glow-amber" : "border-slate-200/80"
    }`}>
      
      {shouldGlow && (
        <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-amber-500 animate-pulse"></div>
      )}

      {/* Card Header info */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-xs font-black text-slate-800 group-hover:text-brand-600 transition truncate max-w-[120px]">
            {order.customer.name}
          </h4>
          <span className="text-[9px] text-slate-400 block font-mono font-bold mt-0.5">{order.invoiceNumber}</span>
        </div>
        <span
          className={`text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${
            order.paymentStatus === "PAID"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
              : "bg-red-50 text-red-600 border border-red-200/50"
          }`}
        >
          {order.paymentStatus === "PAID" ? "LUNAS" : "PIUTANG"}
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-1 text-[11px] text-slate-600 border-t border-b border-slate-100 py-2.5 my-2.5 font-semibold">
        {order.items.map((item) => (
          <p key={item.id} className="truncate text-[10px]">
            • {item.service.name} <span className="text-slate-400 font-medium">({item.quantity} {item.service.unit})</span>
          </p>
        ))}
        <div className="flex justify-between items-center pt-1.5 text-xs text-slate-800">
          <span className="font-bold">Total:</span>
          <span className="font-black font-mono text-brand-600">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[8px] text-slate-400 uppercase tracking-wider font-bold">
          <span>Progress</span>
          <span className="font-mono">{progress.width}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div style={{ width: progress.width }} className={`h-full rounded-full transition-all duration-500 ${progress.color}`}></div>
        </div>
      </div>

      {/* Action overlay loading */}
      {actions && (
        <div className="pt-1.5 relative">
          {(isPayLoading || isStatusLoading) && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10 rounded-lg">
              <span className="w-4 h-4 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
            </div>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
