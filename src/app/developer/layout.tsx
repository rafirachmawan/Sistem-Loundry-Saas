import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CPanel Developer - LaundrSaaS",
  description: "Panel kontrol administrator sistem global Laundry SaaS Multi-Tenant.",
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
      {children}
    </div>
  );
}
