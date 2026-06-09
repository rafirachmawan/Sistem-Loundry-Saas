"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface OrderItemInput {
  serviceId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function KasirPOSPage() {
  const router = useRouter();

  // States Pelanggan
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  // States Layanan & POS
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [paymentTerm, setPaymentTerm] = useState<"PREPAID" | "POSTPAID">("PREPAID");
  
  // Submit & UI States
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil data master layanan saat mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (res.ok && data.success) {
          setServices(data.services);
          if (data.services.length > 0) {
            setSelectedServiceId(data.services[0].id);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Gagal mengambil master layanan:", err);
      }
    };

    fetchServices();
  }, [router]);

  // Handler Pencarian Pelanggan (Real-time lookup)
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowRegForm(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSearchResults(data.customers);
          setShowRegForm(data.customers.length === 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCustomerLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Daftarkan Pelanggan Baru (Inline Registration)
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;

    setCustomerLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustomerName, phone: newCustomerPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedCustomer(data.customer);
        setSearchQuery("");
        setNewCustomerName("");
        setNewCustomerPhone("");
        setShowRegForm(false);
      } else {
        setErrorMsg(data.message || "Gagal mendaftarkan pelanggan");
      }
    } catch (err) {
      setErrorMsg("Kesalahan koneksi saat mendaftarkan pelanggan");
    } finally {
      setCustomerLoading(false);
    }
  };

  // Tambahkan item layanan ke daftar transaksi (Auto-Calc)
  const handleAddItem = (service: Service) => {
    const existingIndex = orderItems.findIndex((item) => item.serviceId === service.id);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += quantityInput;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          unit: service.unit,
          quantity: quantityInput,
        },
      ]);
    }
    setQuantityInput(1);
  };

  // Hapus item dari list
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Hitung total harga real-time di frontend
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Simpan Transaksi (POST Order)
  const handleSaveOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      customerId: selectedCustomer.id,
      paymentTerm,
      items: orderItems.map((item) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessOrder(data.order);
        setSelectedCustomer(null);
        setOrderItems([]);
        setSearchQuery("");
      } else {
        setErrorMsg(data.message || "Gagal menyimpan transaksi");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan saat menyimpan order");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = services.filter((svc) =>
    svc.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6">
        
        {/* Header section (Terang) */}
        <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">
              Kasir POS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Input order baru dengan cepat dan akurat</p>
          </div>
          <span className="text-xs py-1 px-3 rounded-full bg-brand-50 text-brand-600 border border-brand-200/50 font-bold">
            Terminal POS Aktif
          </span>
        </header>

        {/* POS Grid Layout */}
        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
          
          {/* LEFT COLUMN: INPUT FORMS (xl:col-span-7) */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* 1. PELANGGAN SECTION */}
            <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <h2 className="text-sm font-display font-bold uppercase tracking-wider mb-4 text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                1. Hubungkan Pelanggan
              </h2>

              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-200/60 glow-emerald animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-extrabold font-display shadow-sm">
                      {selectedCustomer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{selectedCustomer.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">WhatsApp: {selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                  >
                    Ganti Pelanggan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari berdasarkan nama pelanggan atau nomor WhatsApp..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200 font-semibold shadow-sm"
                    />
                    {customerLoading && (
                      <span className="absolute right-4 top-4.5 w-4 h-4 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></span>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-xl animate-fade-in-up">
                      {searchResults.map((cust) => (
                        <button
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setSearchQuery("");
                          }}
                          className="w-full px-5 py-3.5 text-left text-sm hover:bg-brand-50 transition duration-150 flex justify-between items-center cursor-pointer font-semibold text-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {cust.name[0].toUpperCase()}
                            </div>
                            <span>{cust.name}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{cust.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Inline Form Registrasi Pelanggan Baru */}
                  {showRegForm && !customerLoading && (
                    <form
                      onSubmit={handleRegisterCustomer}
                      className="p-5 rounded-xl border border-slate-150 bg-slate-50/50 space-y-4 animate-fade-in-up"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <p className="text-xs text-slate-500 font-semibold">Pelanggan tidak ditemukan. Daftarkan baru di bawah ini:</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nama lengkap pelanggan..."
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          required
                          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="No WhatsApp (contoh: 08123456...)"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                          required
                          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 font-semibold"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-755 text-white text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-md shadow-brand-600/10 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Simpan & Pilih Pelanggan
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>

            {/* 2. LAYANAN GRID SECTION */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-sm font-display font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                  2. Pilih Layanan & Kuantitas
                </h2>

                <input
                  type="text"
                  placeholder="Cari nama layanan..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 w-full sm:w-48 font-semibold"
                />
              </div>

              <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-150">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kuantitas Input:</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantityInput((prev) => Math.max(0.1, parseFloat((prev - 1).toFixed(1))))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer font-bold"
                    >
                      －
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(parseFloat(e.target.value) || 1)}
                      className="w-12 bg-transparent text-center text-sm font-black border-none focus:outline-none focus:ring-0 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantityInput((prev) => parseFloat((prev + 1).toFixed(1)))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer font-bold"
                    >
                      ＋
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic font-medium">Klik kartu layanan di bawah untuk menambahkan</p>
              </div>

              {/* Service Cards Grid (Terang) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredServices.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400 text-xs font-semibold italic">
                    Layanan tidak ditemukan
                  </div>
                ) : (
                  filteredServices.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => handleAddItem(svc)}
                      className="text-left p-4 rounded-xl border border-slate-200/60 bg-white hover:bg-brand-50 hover:border-brand-500/30 transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-sm"
                    >
                      <div className="absolute -right-3 -bottom-3 w-12 h-12 text-slate-100 group-hover:text-brand-500/5 transition duration-300">
                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </div>

                      <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-widest font-mono block mb-1">
                        / {svc.unit}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-brand-600 transition truncate mb-2">
                        {svc.name}
                      </h3>
                      <p className="text-base font-black text-slate-800 font-mono">
                        Rp {svc.price.toLocaleString("id-ID")}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SHOPPING CART RECEIPT (Terang, xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-6">
            <section className="glass-panel rounded-2xl p-6 flex flex-col min-h-[480px] relative">
              <h2 className="text-sm font-display font-bold uppercase tracking-wider mb-4 text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                3. Ringkasan Transaksi
              </h2>

              {selectedCustomer && (
                <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pelanggan</span>
                    <span className="font-extrabold text-slate-800">{selectedCustomer.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Kontak</span>
                    <span className="font-mono font-bold text-slate-600">{selectedCustomer.phone}</span>
                  </div>
                </div>
              )}

              {/* Receipt Cart List */}
              <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[260px] pr-1 no-scrollbar">
                {orderItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-xs font-semibold italic">Keranjang kosong. Pilih layanan di kiri.</p>
                  </div>
                ) : (
                  orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs hover:border-slate-200 transition shadow-sm animate-fade-in-up"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 mb-0.5">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">
                          {item.quantity} {item.unit} x Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-slate-800">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center transition cursor-pointer text-[10px] font-bold"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment details & checkout */}
              <div className="pt-5 border-t border-dashed border-slate-200 space-y-4">
                
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Metode Bayar</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
                    <button
                      onClick={() => setPaymentTerm("PREPAID")}
                      className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        paymentTerm === "PREPAID"
                          ? "bg-brand-600 text-white shadow-md shadow-brand-600/10"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      LUNAS (Prepaid)
                    </button>
                    <button
                      onClick={() => setPaymentTerm("POSTPAID")}
                      className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        paymentTerm === "POSTPAID"
                          ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      NANTI (Postpaid)
                    </button>
                  </div>
                </div>

                {/* Struk pricing details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-3 shadow-inner">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Status Pembayaran</span>
                    <span className={`font-black uppercase tracking-wide ${paymentTerm === "PREPAID" ? "text-emerald-600" : "text-amber-600"}`}>
                      {paymentTerm === "PREPAID" ? "Lunas (Paid)" : "Piutang (Unpaid)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500 uppercase font-bold">Total Pembayaran</span>
                    <span className="text-2xl font-black font-mono text-brand-600 tracking-tight">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-bold animate-fade-in-up">
                    {errorMsg}
                  </div>
                )}

                {/* Checkout Trigger */}
                <button
                  onClick={handleSaveOrder}
                  disabled={submitting || !selectedCustomer || orderItems.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:from-slate-200 disabled:to-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-sm transition duration-300 cursor-pointer shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Simpan Order & Kirim Nota WA
                    </>
                  )}
                </button>

              </div>
            </section>
          </div>

        </main>
      </div>

      {/* 🟢 SUCCESS DIALOG MODAL */}
      {successOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 glow-emerald shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-2xl font-bold shadow-md shadow-emerald-500/5">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-slate-800">Transaksi Berhasil</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Invoice: {successOrder.invoiceNumber}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-left text-xs space-y-2.5 shadow-sm">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="text-slate-800">{successOrder.customer.name}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Termin Bayar:</span>
                <span className={`uppercase ${successOrder.paymentTerm === "PREPAID" ? "text-emerald-600" : "text-amber-600"}`}>
                  {successOrder.paymentTerm}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-400">Total Tagihan:</span>
                <span className="text-brand-600 font-mono text-sm">Rp {successOrder.totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <p className="text-[10px] text-slate-400 italic border-t border-slate-200 pt-2 leading-relaxed">
                Notifikasi ringkasan nota digital telah dikirim via antrean WhatsApp Gateway latar belakang (cek terminal log backend untuk mock output).
              </p>
            </div>

            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
            >
              Buat Transaksi Baru
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
