"use client";

import { useState, useEffect, useCallback } from "react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  unit: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // States untuk Tambah Barang Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // States untuk Penyesuaian Stok (Modal)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustQty, setAdjustQty] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Load Data
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat inventaris");
      }
    } catch (err) {
      setErrorMsg("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handler Tambah Barang
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUnit) return;

    setAddLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, sku: newSku, unit: newUnit }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems([...items, data.item].sort((a, b) => a.name.localeCompare(b.name)));
        setShowAddForm(false);
        setNewName("");
        setNewSku("");
        setNewUnit("");
      } else {
        alert(data.message || "Gagal menambahkan barang");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setAddLoading(false);
    }
  };

  // Handler Penyesuaian Stok
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustQty || Number(adjustQty) <= 0) return;

    setAdjustLoading(true);
    try {
      const res = await fetch(`/api/inventory/${adjustItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: adjustType,
          quantity: Number(adjustQty),
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(items.map(item => item.id === adjustItem.id ? data.item : item));
        setAdjustItem(null); // Tutup modal
        setAdjustQty("");
        setAdjustReason("");
      } else {
        alert(data.message || "Gagal memperbarui stok");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Manajemen Stok Gudang
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Pantau dan catat pemakaian bahan operasional</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Barang Baru
          </button>
        </header>

        <main className="flex-1 p-6 flex flex-col max-w-5xl mx-auto w-full">
          {errorMsg && (
            <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          {/* Form Tambah Barang Baru (Toggle) */}
          {showAddForm && (
            <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-brand-500 rounded-full"></span>
                Daftarkan Barang Baru
              </h2>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Barang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Deterjen Cair Rinso"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Satuan Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Liter, Kg, Botol"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5 flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU / Kode (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: DTJ-001"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="h-[42px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer self-end shadow-sm"
                  >
                    {addLoading ? "..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabel / Grid Inventaris */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-slate-500 font-bold mb-1">Gudang Kosong</p>
              <p className="text-xs text-slate-400">Belum ada barang terdaftar di cabang ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.sku || "NO-SKU"}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-base mb-1 pr-16 truncate">{item.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-bold">Satuan: {item.unit}</p>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Sisa Stok</p>
                      <p className={`text-3xl font-black font-mono tracking-tighter ${item.stock <= 5 ? "text-red-500" : "text-emerald-600"}`}>
                        {item.stock.toFixed(1)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setAdjustItem(item);
                        setAdjustType("IN");
                      }}
                      className="w-10 h-10 rounded-full bg-slate-50 hover:bg-brand-50 text-slate-400 hover:text-brand-600 border border-slate-200 hover:border-brand-200 flex items-center justify-center transition cursor-pointer"
                      title="Sesuaikan Stok"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {item.stock <= 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Penyesuaian Stok */}
      {adjustItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Penyesuaian Stok
              </h3>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-5 space-y-5">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Barang</p>
                <p className="font-bold text-slate-800">{adjustItem.name} <span className="text-slate-400 text-sm font-normal">({adjustItem.stock} {adjustItem.unit})</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType("IN")}
                  className={`py-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    adjustType === "IN" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">📥</span> Tambah (Restock)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("OUT")}
                  className={`py-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    adjustType === "OUT" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">📤</span> Kurangi (Pakai)
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kuantitas ({adjustItem.unit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="Misal: 5"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-800 focus:outline-none focus:border-brand-500 text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan / Alasan</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={adjustType === "IN" ? "Misal: Beli di pasar" : "Misal: Pakai untuk cucian reguler"}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={adjustLoading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition cursor-pointer flex justify-center items-center ${
                  adjustType === "IN" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                }`}
              >
                {adjustLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  adjustType === "IN" ? "Simpan Penambahan" : "Simpan Pemakaian"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
