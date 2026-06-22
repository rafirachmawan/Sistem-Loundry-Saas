import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Owner - Spindo",
  description: "Panel kontrol utama untuk pemilik bisnis laundry.",
};

export default function OwnerLayout({
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
