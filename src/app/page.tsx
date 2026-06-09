import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Comparison from "./components/landing/Comparison";
import Pricing from "./components/landing/Pricing";
import Faq from "./components/landing/Faq";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
      
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-brand-50/70 to-transparent pointer-events-none -z-10 rounded-3xl" />
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-100/40 rounded-full filter blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-brand-100/30 rounded-full filter blur-3xl pointer-events-none -z-10" />

      {/* Floating Header Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Comparison Section (Kelebihan & Kekurangan) */}
      <Comparison />

      {/* Pricing Packages Section */}
      <Pricing />

      {/* FAQ Section */}
      <Faq />

      {/* Footer Banner & Details */}
      <Footer />

    </div>
  );
}
