import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "Kasir POS - Spindo",
  description: "Aplikasi kasir dan point of sale untuk bisnis laundry.",
};

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
      <Sidebar />
      {children}
    </div>
  );
}
