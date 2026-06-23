"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
  const [isManualReg, setIsManualReg] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  // States Layanan & POS
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [paymentTerm, setPaymentTerm] = useState<"PREPAID" | "POSTPAID">("PREPAID");
  const [orderNotes, setOrderNotes] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  
  // Submit & UI States
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [midtransLoading, setMidtransLoading] = useState(false);

  // Modal Pembayaran States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"CASH" | "QRIS">("CASH");
  const [cashGiven, setCashGiven] = useState<string>("");

  // Helper Kirim WhatsApp
  const sendWhatsAppReceipt = (order: any, isPaid: boolean = false, cashAmount?: number) => {
    if (!order || !order.customer || !order.customer.phone) return;
    let phone = order.customer.phone;
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    
    const statusText = isPaid ? "*LUNAS*" : "*BELUM LUNAS*";
    
    let itemsText = "";
    if (order.items && order.items.length > 0) {
      itemsText = "%0A%0A*Detail Pesanan:*%0A";
      order.items.forEach((item: any) => {
        const itemName = item.service?.name || item.name || "Layanan";
        const itemPrice = item.priceSnap || item.price || 0;
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

  // Trigger Pembayaran Midtrans Snap
  const handleMidtransPayment = async (order: any) => {
    setMidtransLoading(true);
    try {
      const res = await fetch("/api/payments/midtrans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Panggil Snap Pop-up
        (window as any).snap.pay(data.token, {
          onSuccess: async function (result: any) {
            alert("Pembayaran berhasil!");
            setSuccessOrder({ ...order, paymentStatus: "PAID" });
            // Otomatis kirim nota WA setelah berhasil bayar
            sendWhatsAppReceipt(order, true);
            clearCart();
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
        body: JSON.stringify({ name: newCustomerName, phone: newCustomerPhone, address: newCustomerAddress }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedCustomer(data.customer);
        setSearchQuery("");
        setNewCustomerName("");
        setNewCustomerPhone("");
        setNewCustomerAddress("");
        setShowRegForm(false);
        setIsManualReg(false);
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
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          unit: service.unit,
          quantity: 1,
        },
      ]);
    }
  };

  // Hapus item dari list
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Update Kuantitas di Keranjang
  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    const newQty = parseFloat((updated[index].quantity + delta).toFixed(1));
    if (newQty >= 0.1) {
      updated[index].quantity = newQty;
      setOrderItems(updated);
    }
  };

  // Hitung total harga real-time di frontend
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper untuk membersihkan keranjang setelah sukses
  const clearCart = () => {
    setSelectedCustomer(null);
    setOrderItems([]);
    setSearchQuery("");
    setOrderNotes("");
    setEstimatedCompletionDate("");
    setCashGiven("");
    setPaymentMethodTab("CASH");
  };

  // Simpan Transaksi (POST Order)
  const handleSaveOrder = async (paymentMethodOverride?: "CASH" | "QRIS") => {
    if (!selectedCustomer || orderItems.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      customerId: selectedCustomer.id,
      paymentTerm,
      paymentMethod: paymentMethodOverride || null,
      notes: orderNotes,
      estimatedCompletionDate: estimatedCompletionDate || null,
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

      if (data.success) {
        setSubmitting(false);

        // Tutup modal pembayaran jika terbuka
        setShowPaymentModal(false);

        if (paymentTerm === "PREPAID") {
          if (paymentMethodOverride === "QRIS") {
            // Jangan setSuccessOrder dulu, tunggu Midtrans berhasil
            handleMidtransPayment(data.order);
          } else if (paymentMethodOverride === "CASH") {
            const parsedCash = parseFloat(cashGiven || "0");
            setSuccessOrder({ ...data.order, cashAmount: parsedCash });
            sendWhatsAppReceipt(data.order, true, parsedCash);
            clearCart();
          }
        } else {
          // Jika POSTPAID, langsung kirim WA karena bayar nanti
          setSuccessOrder(data.order);
          sendWhatsAppReceipt(data.order, false);
          clearCart();
        }
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
    <>
      {/* Midtrans Snap JS */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

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
                  <div className="flex gap-2">
                    <div className="relative flex-1">
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
                    <button
                      onClick={() => setIsManualReg(!isManualReg)}
                      className="px-4 py-3.5 bg-brand-50 text-brand-600 font-bold text-sm rounded-xl border border-brand-200 hover:bg-brand-100 transition whitespace-nowrap cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Baru
                    </button>
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
                  {(showRegForm || isManualReg) && !customerLoading && (
                    <form
                      onSubmit={handleRegisterCustomer}
                      className="p-5 rounded-xl border border-slate-150 bg-slate-50/50 space-y-4 animate-fade-in-up"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        <p className="text-xs text-slate-500 font-semibold">Daftarkan pelanggan baru:</p>
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
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-sm font-display font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-3 rounded bg-brand-500"></span>
                    2. Pilih Layanan
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Klik layanan di bawah untuk menambahkan ke keranjang</p>
                </div>

                <div className="relative w-full sm:w-72 h-[46px]">
                  <span className="absolute left-4 top-0 bottom-0 flex items-center justify-center text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari layanan..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full h-full pl-12 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200 font-semibold shadow-sm"
                  />
                </div>
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
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 h-full opacity-60">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2 shadow-inner">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold italic">Belum ada layanan terpilih</p>
                    <p className="text-slate-400 text-xs">Silakan pilih dari daftar layanan di sebelah kiri.</p>
                  </div>
                ) : (
                  orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3.5 rounded-xl bg-white border border-slate-200 text-xs hover:border-brand-300 hover:shadow-md transition-all duration-200 animate-fade-in-up"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-extrabold text-slate-800 mb-1">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-fit">
                            <button
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 transition font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-[10px] font-bold text-brand-600">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 transition font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.unit} x <span className="font-mono">Rp {item.price.toLocaleString("id-ID")}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 border-l border-slate-100 pl-3">
                        <span className="font-black font-mono text-brand-600 text-sm">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-0.5 transition"
                          title="Hapus"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment details & checkout */}
              <div className="pt-5 border-t-2 border-dashed border-slate-200 space-y-5">
                
                {/* Notes & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Catatan
                    </label>
                    <textarea
                      placeholder="Misal: Jangan pakai pewangi..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none h-14 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Estimasi Selesai
                    </label>
                    <input
                      type="datetime-local"
                      value={estimatedCompletionDate}
                      onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 h-14 shadow-sm"
                    />
                  </div>
                </div>

                {/* Struk pricing details */}
                <div className="p-5 rounded-2xl bg-brand-50 border border-brand-200 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Metode Bayar</span>
                    <div className="flex bg-white p-1 rounded-xl border border-brand-100 shadow-sm">
                      <button
                        onClick={() => setPaymentTerm("PREPAID")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                          paymentTerm === "PREPAID"
                            ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        LUNAS
                      </button>
                      <button
                        onClick={() => setPaymentTerm("POSTPAID")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                          paymentTerm === "POSTPAID"
                            ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        NANTI
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-3 border-t border-brand-200/60">
                    <div>
                      <span className="text-[10px] text-brand-500/80 uppercase font-bold tracking-wider block mb-0.5">Total Tagihan</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block ${paymentTerm === "PREPAID" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                        {paymentTerm === "PREPAID" ? "SUDAH DIBAYAR" : "BELUM DIBAYAR"}
                      </span>
                    </div>
                    <span className="text-3xl font-black font-mono text-brand-700 tracking-tight">
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
                  onClick={() => paymentTerm === "PREPAID" ? setShowPaymentModal(true) : handleSaveOrder()}
                  disabled={submitting || !selectedCustomer || orderItems.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-sm transition-all duration-300 cursor-pointer shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {paymentTerm === "PREPAID" ? "Bayar" : "Simpan Order (Bayar Nanti)"}
                    </>
                  )}
                </button>

              </div>
            </section>
          </div>

        </main>
      </div>

      {/* 🟢 PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-emerald-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-extrabold text-slate-800">Pilih Pembayaran</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Rincian Pesanan */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detail Pesanan</h4>
              <div className="max-h-[140px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-slate-200/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-700">{item.quantity}x {item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">@ Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-600">
                      Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Display */}
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 mb-6 flex justify-between items-center shadow-sm">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Total Tagihan</span>
              <span className="text-2xl font-black font-mono text-brand-700 tracking-tight">Rp {totalPrice.toLocaleString("id-ID")}</span>
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

                {parseFloat(cashGiven || "0") >= totalPrice && (
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kembalian:</span>
                    <span className="text-xl font-black font-mono text-emerald-700">
                      Rp {(parseFloat(cashGiven || "0") - totalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                
                {parseFloat(cashGiven || "0") > 0 && parseFloat(cashGiven || "0") < totalPrice && (
                  <p className="text-xs text-red-500 font-bold italic text-center">Uang tidak cukup!</p>
                )}

                <button
                  onClick={() => handleSaveOrder("CASH")}
                  disabled={submitting || parseFloat(cashGiven || "0") < totalPrice}
                  className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Konfirmasi & Simpan
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
                  onClick={() => handleSaveOrder("QRIS")}
                  disabled={submitting}
                  className="w-full py-4 mt-2 bg-[#00A1A2] hover:bg-[#008f90] text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00A1A2]/20 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Buat Transaksi QRIS"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🟢 SUCCESS DIALOG MODAL */}
      {successOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 glow-emerald shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-2xl font-bold shadow-md shadow-emerald-500/5">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-slate-800">
                {successOrder.paymentStatus === "PAID" ? "Pembayaran Berhasil" : "Order Disimpan"}
              </h3>
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
              
              {successOrder.cashAmount && successOrder.cashAmount >= successOrder.totalPrice && (
                <>
                  <div className="flex justify-between font-medium text-xs pt-1">
                    <span className="text-slate-400">Tunai Diterima:</span>
                    <span className="text-slate-600 font-mono">Rp {successOrder.cashAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-medium text-xs pt-1">
                    <span className="text-slate-400">Kembalian:</span>
                    <span className="text-emerald-600 font-mono">Rp {(successOrder.cashAmount - successOrder.totalPrice).toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}

              <div className="border-t border-slate-200 pt-2 space-y-1 mt-2">
                <span className="text-slate-400 font-semibold mb-1 block">Detail Pesanan:</span>
                <ul className="text-slate-700 font-medium space-y-1">
                  {successOrder.items?.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-start">
                      <span>{item.quantity}x {item.service?.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 mt-0.5">
                        Rp {(item.quantity * item.priceSnap).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[10px] text-slate-400 italic border-t border-slate-200 pt-2 leading-relaxed">
                Notifikasi ringkasan nota digital telah dikirim via antrean WhatsApp Gateway latar belakang (cek terminal log backend untuk mock output).
              </p>
            </div>

            {successOrder.paymentTerm === "PREPAID" && successOrder.paymentStatus !== "PAID" && (
              <button
                onClick={() => handleMidtransPayment(successOrder)}
                disabled={midtransLoading}
                className="w-full py-3.5 rounded-xl bg-[#00A1A2] hover:bg-[#008f90] text-white text-xs font-bold transition cursor-pointer border border-[#008f90] shadow-md flex justify-center items-center gap-2"
              >
                {midtransLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Bayar dengan QRIS / E-Wallet (Midtrans)
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
            >
              Buat Transaksi Baru
            </button>
          </div>
        </div>
      )}

    </>
  );
}
