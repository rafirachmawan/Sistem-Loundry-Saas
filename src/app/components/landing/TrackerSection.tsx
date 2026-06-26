"use client";

import { useState } from "react";

export default function TrackerSection() {
  const [invoice, setInvoice] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice.trim()) return;

    setIsTracking(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const response = await fetch(
        `/api/track?invoice=${encodeURIComponent(invoice)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data resi");
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsTracking(false);
    }
  };

  const steps = [
    { key: "QUEUED", label: "Antrean", desc: "Masuk antrean cuci" },
    {
      key: "IN_PROGRESS",
      label: "Diproses",
      desc: "Sedang dicuci & disetrika",
    },
    { key: "READY", label: "Siap Ambil", desc: "Cucian sudah rapi" },
    { key: "COMPLETED", label: "Selesai", desc: "Sudah diambil" },
  ];

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <section
      id="cek-status"
      className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-50 rounded-full filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Pantau Cucian Anda
          </h2>
          <p className="text-slate-600">
            Masukkan nomor invoice yang tertera pada struk Anda untuk melihat
            status cucian secara real-time tanpa perlu login.
          </p>

          <form onSubmit={handleTrack} className="mt-8 max-w-lg mx-auto">
            <div className="flex items-center gap-2 p-2 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
              <div className="pl-3 text-slate-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="Contoh: INV-2026..."
                className="flex-1 py-2 px-2 bg-transparent focus:outline-none text-slate-900 font-semibold placeholder-slate-400"
                required
              />
              <button
                type="submit"
                disabled={isTracking}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isTracking ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Mencari...</span>
                  </>
                ) : (
                  "Lacak Status"
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errorMsg}
              </div>
            )}
          </form>
        </div>

        {/* Tracking Result */}
        {result && (
          <div className="relative z-10 mt-12 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {result.id}
                </h3>
                <p className="text-sm text-slate-500">
                  Pelanggan: {result.customer}
                </p>
              </div>
              <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Estimasi Selesai: {result.estimatedDone}
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="mb-12 mt-8">
              <div className="relative flex justify-between items-start">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2" />

                {/* Progress Line */}
                <div
                  className="absolute top-5 left-0 h-1 bg-brand-500 -z-10 -translate-y-1/2 transition-all duration-1000"
                  style={{
                    width: `${(getCurrentStepIndex(result.status) / (steps.length - 1)) * 100}%`,
                  }}
                />

                {steps.map((step, index) => {
                  const isActive = index <= getCurrentStepIndex(result.status);

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10 w-24 sm:w-32"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isActive ? "bg-brand-600 border-white text-white shadow-md" : "bg-slate-100 border-white text-slate-400"} transition-colors duration-500`}
                      >
                        {isActive ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-3 text-center bg-white px-2">
                        <p
                          className={`text-xs sm:text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4">Detail Pakaian</h4>
              <div className="space-y-3">
                {result.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="font-medium text-slate-700">
                        {item.name}{" "}
                        <span className="text-slate-400">({item.qty})</span>
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-500">Total Tagihan</span>
                <span className="font-bold text-lg text-brand-600">
                  Rp {result.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
