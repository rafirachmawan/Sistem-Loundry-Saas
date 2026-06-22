export default function DeveloperLoading() {
  return (
    <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <span className="w-12 h-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin block shadow-sm"></span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 bg-brand-500 rounded-full animate-pulse"></span>
        </div>
      </div>
      <p className="text-slate-400 text-xs font-bold animate-pulse">Memuat halaman...</p>
    </div>
  );
}
