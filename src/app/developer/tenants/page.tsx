"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

interface TenantStats {
  id: string;
  name: string;
  tier: string;
  createdAt: string;
  expiredAt?: string | null;
  userCount: number;
  customerCount: number;
  orderCount: number;
  revenue: number;
  ownerName?: string;
  ownerPhone?: string;
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "KASIR" | "DEVELOPER";
  createdAt: string;
  tenantName: string;
  plainPassword?: string | null;
  phone?: string | null;
}

export default function DeveloperTenantsPage() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");
  const [currentDevEmail, setCurrentDevEmail] = useState("");

  // States untuk Kelola Users per Tenant
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantStats | null>(null);
  const [tenantUsers, setTenantUsers] = useState<UserDetails[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Form states untuk Tambah User
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"OWNER" | "KASIR">("KASIR");
  const [newUserPhone, setNewUserPhone] = useState("");

  // Form states untuk Edit User
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<"OWNER" | "KASIR">("KASIR");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");

  const loadTenants = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentDevEmail(parsed.email || "");
      }

      const res = await fetch("/api/developer/tenants");
      const data = await res.json();
      if (res.ok && data.success) {
        setTenants(data.tenants);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat daftar tenant.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan jaringan saat memuat data tenant.");
    } finally {
      setLoading(false);
    }
  };

  const loadTenantUsers = async (tenantId: string) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/developer/users?tenantId=${tenantId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTenantUsers(data.users);
      } else {
        alert(data.message || "Gagal memuat user tenant.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan saat memuat user.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenEditModal = (ten: TenantStats) => {
    setSelectedTenant(ten);
    setIsEditModalOpen(true);
    setShowCreateUserForm(false);
    setEditingUser(null);
    loadTenantUsers(ten.id);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      const res = await fetch("/api/developer/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          phone: newUserPhone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "User berhasil ditambahkan.");
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("KASIR");
        setNewUserPhone("");
        setShowCreateUserForm(false);
        loadTenantUsers(selectedTenant.id);
        loadTenants();
      } else {
        alert(data.message || "Gagal menambahkan user.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !selectedTenant) return;
    try {
      const res = await fetch("/api/developer/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          phone: editUserPhone,
          newPassword: editUserPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Data user berhasil diperbarui.");
        setEditingUser(null);
        setEditUserName("");
        setEditUserEmail("");
        setEditUserRole("KASIR");
        setEditUserPhone("");
        setEditUserPassword("");
        loadTenantUsers(selectedTenant.id);
        loadTenants();
      } else {
        alert(data.message || "Gagal memperbarui user.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === currentDevEmail) {
      alert("Gagal: Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus akun user "${email}"?\n\nSeluruh aktivitas kasir dan transaksi oleh user ini akan dihapus secara bersih.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/developer/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        if (selectedTenant) {
          loadTenantUsers(selectedTenant.id);
          loadTenants();
        }
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const getWhatsAppLink = (ten: TenantStats) => {
    if (!ten.ownerPhone) return "#";
    
    let formattedPhone = ten.ownerPhone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }
    
    const expiryDateStr = ten.expiredAt
      ? new Date(ten.expiredAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Selamanya";

    const message = `Yth. Bapak/Ibu ${ten.ownerName || ""},
Pemilik Outlet ${ten.name}

Salam hangat dari LondriOS.

Kami ingin menginformasikan bahwa masa aktif layanan paket *${ten.tier}* untuk outlet laundry Anda akan segera berakhir pada tanggal *${expiryDateStr}*.

Untuk memastikan operasional POS kasir dan seluruh sistem transaksi laundry Anda tetap berjalan dengan lancar tanpa gangguan, kami menyarankan Bapak/Ibu untuk melakukan perpanjangan paket layanan tepat waktu melalui halaman Dashboard Owner.

Jika Bapak/Ibu membutuhkan bantuan atau memiliki pertanyaan mengenai proses perpanjangan ini, silakan hubungi kami kembali. Kami akan dengan senang hati membantu Anda.

Terima kasih banyak atas kerja sama dan kepercayaan Anda menggunakan layanan kami.

Hormat kami,
*Customer Support LondriOS*`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const getPhoneColorClass = (tier: string) => {
    if (tier === "ENTERPRISE") {
      return "text-[10px] text-purple-650 font-mono mt-1.5 block w-max";
    }
    if (tier === "PRO") {
      return "text-[10px] text-emerald-600 font-mono mt-1.5 block w-max";
    }
    return "text-[10px] text-slate-500 font-mono mt-1.5 block w-max";
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    const confirmDelete = confirm(
      `PERHATIAN! Apakah Anda yakin ingin menghapus Tenant "${name}" secara permanen?\n\nTindakan ini tidak dapat dibatalkan dan akan menghapus:\n- Seluruh Akun User (Owner & Kasir)\n- Seluruh Data Pelanggan\n- Seluruh Master Layanan\n- Seluruh Riwayat Transaksi (Order & OrderItems)`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/developer/tenants?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message);
        loadTenants();
      } else {
        alert(data.message || "Gagal menghapus tenant.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />

      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-6 animate-fade-in-up">
        {/* Header */}
        <header className="border-b border-slate-200/85 bg-white/70 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-650"></span>
              Kelola Tenants
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Manajemen dan pantau mitra outlet laundry yang terdaftar
            </p>
          </div>
          <span className="text-xs py-1.5 px-3.5 rounded-full bg-purple-550/10 text-purple-650 border border-purple-500/20 font-bold shadow-sm">
            Platform Tenants
          </span>
        </header>

        {/* Main Panel */}
        <main className="flex-1 p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-650 rounded-xl text-center font-bold">
              {errorMsg}
            </div>
          )}

          <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-700">
                  Daftar Tenant Laundry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan statistik agregat transaksi dan pengguna per tenant
                </p>
              </div>
              <input
                type="text"
                placeholder="Cari nama tenant atau ID..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none transition duration-200 font-semibold w-full md:w-64"
              />
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <span className="w-6 h-6 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin"></span>
                <p className="text-slate-400 text-xs font-semibold">Memuat log tenant...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4">Nama Laundry / Tenant</th>
                      <th className="p-4">Owner / Kontak</th>
                      <th className="p-4">Tipe Paket</th>
                      <th className="p-4">Masa Berlaku</th>
                      <th className="p-4 text-center">Hubungi WA</th>
                      <th className="p-4">Tanggal Gabung</th>
                      <th className="p-4 text-center">User</th>
                      <th className="p-4 text-center">Customer</th>
                      <th className="p-4 text-center">Order</th>
                      <th className="p-4 text-right">Omset Aktual</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-normal">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 italic">
                          Tidak ada tenant laundry yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((ten) => (
                        <tr key={ten.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="p-4">
                            <span className="block text-slate-800">{ten.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{ten.id}</span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-850">{ten.ownerName || "-"}</span>
                            {ten.ownerPhone && ten.ownerPhone !== "N/A" ? (
                              <span className={getPhoneColorClass(ten.tier)}>
                                {ten.ownerPhone}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block mt-1.5 italic">
                                Belum ada kontak
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {ten.tier === "PRO" ? (
                              <span className="text-[10px] tracking-wider text-emerald-600 uppercase">
                                PRO
                              </span>
                            ) : ten.tier === "ENTERPRISE" ? (
                              <span className="text-[10px] tracking-wider text-purple-650 uppercase">
                                Enterprise
                              </span>
                            ) : (
                              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                                Starter
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {ten.expiredAt ? (
                              (() => {
                                const expiryDate = new Date(ten.expiredAt);
                                const isExpired = expiryDate.getTime() < Date.now();
                                return isExpired ? (
                                  <span className="text-[10px] text-red-600 uppercase tracking-wider">
                                    EXPIRED
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-650 font-mono">
                                    s.d. {expiryDate.toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-[10px] text-slate-450">
                                Selamanya
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {ten.ownerPhone && ten.ownerPhone !== "N/A" ? (
                              <a
                                href={getWhatsAppLink(ten)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                                title="Kirim Pengingat WhatsApp"
                              >
                                Hubungi
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-350">-</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(ten.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-center text-slate-600">{ten.userCount}</td>
                          <td className="p-4 text-center text-slate-600">{ten.customerCount}</td>
                          <td className="p-4 text-center text-slate-600">{ten.orderCount}</td>
                          <td className="p-4 text-right text-emerald-600 font-mono">
                            {ten.revenue.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(ten)}
                                className="p-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg text-[10px] cursor-pointer transition shadow-2xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTenant(ten.id, ten.name)}
                                className="p-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] cursor-pointer transition shadow-2xs"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Kelola Users per Tenant */}
      {isEditModalOpen && selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200/85 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <header className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base font-display font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-650"></span>
                  Kelola Users — {selectedTenant.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Manajemen akun (Owner/Kasir) untuk laundry tier <span className="font-mono text-purple-600">{selectedTenant.tier}</span> (ID: {selectedTenant.id})
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTenant(null);
                  setTenantUsers([]);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Form Tambah User Baru */}
              {showCreateUserForm && (
                <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700">Tambah Akun Baru</h4>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Nama pengguna"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Nomor HP</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="Contoh: 085..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Password</label>
                      <input
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Min. 6 Karakter"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Peran / Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "OWNER" | "KASIR")}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 focus:outline-none transition font-medium"
                      >
                        <option value="KASIR">KASIR</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2 pt-2 md:pt-0 col-span-1 md:col-span-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowCreateUserForm(false)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-650 border border-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
                      >
                        Simpan Akun
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Form Edit User */}
              {editingUser && (
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-purple-750">Edit Akun User: {editingUser.email}</h4>
                  <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        placeholder="Nama pengguna"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Nomor HP</label>
                      <input
                        type="text"
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        placeholder="Contoh: 085..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Password Baru (Opsional)</label>
                      <input
                        type="password"
                        value={editUserPassword}
                        onChange={(e) => setEditUserPassword(e.target.value)}
                        placeholder="Kosongkan jika tidak diubah"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Peran / Role</label>
                      <select
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value as "OWNER" | "KASIR")}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-purple-500 rounded-lg text-xs text-slate-800 focus:outline-none transition font-medium"
                      >
                        <option value="KASIR">KASIR</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2 pt-2 md:pt-0 col-span-1 md:col-span-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(null);
                          setEditUserName("");
                          setEditUserEmail("");
                          setEditUserRole("KASIR");
                          setEditUserPhone("");
                          setEditUserPassword("");
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-650 border border-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-purple-650 hover:bg-purple-600 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-Header & Kontrol */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Cari user (nama/email/role)..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-3 py-1.5 bg-slate-55 border border-slate-200 focus:border-purple-550 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none transition duration-200 font-medium w-full md:w-56"
                  />
                </div>
                {!showCreateUserForm && !editingUser && (
                  <button
                    onClick={() => {
                      setShowCreateUserForm(true);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer w-max"
                  >
                    + Tambah User
                  </button>
                )}
              </div>

              {/* Tabel User */}
              {loadingUsers ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <span className="w-5 h-5 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin"></span>
                  <p className="text-slate-400 text-[10px] font-semibold">Memuat log user...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-3">Nama</th>
                        <th className="p-3">Email / Kontak</th>
                        <th className="p-3">Peran (Role)</th>
                        <th className="p-3">Password</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-normal">
                      {tenantUsers.filter(u => 
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.role.toLowerCase().includes(userSearch.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                            Tidak ada user untuk tenant ini.
                          </td>
                        </tr>
                      ) : (
                        tenantUsers
                          .filter(u => 
                            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.role.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map((usr) => {
                            const toggleUserPassVisibility = (userId: string) => {
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [userId]: !prev[userId],
                              }));
                            };

                            const handleEditClick = (u: UserDetails) => {
                              setEditingUser(u);
                              setEditUserName(u.name);
                              setEditUserEmail(u.email);
                              setEditUserRole(u.role === "DEVELOPER" ? "KASIR" : u.role);
                              setEditUserPhone(u.phone || "");
                              setEditUserPassword("");
                              setShowCreateUserForm(false);
                            };

                            return (
                              <tr key={usr.id} className="hover:bg-slate-50/30 transition duration-150">
                                <td className="p-3 text-slate-800">{usr.name}</td>
                                <td className="p-3 text-slate-500 font-mono">
                                  <span>{usr.email}</span>
                                  {usr.phone && (
                                    <span className="text-[10px] text-slate-450 block mt-0.5">{usr.phone}</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 text-[9px] rounded-full font-medium uppercase border ${
                                      usr.role === "DEVELOPER"
                                        ? "bg-purple-50 text-purple-650 border-purple-200/50"
                                        : usr.role === "OWNER"
                                        ? "bg-blue-50 text-blue-650 border-blue-200/50"
                                        : "bg-emerald-50 text-emerald-650 border-emerald-200/50"
                                    }`}
                                  >
                                    {usr.role}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5 font-mono text-slate-600">
                                    <span>{visiblePasswords[usr.id] ? (usr.plainPassword || "—") : "••••••"}</span>
                                    <button
                                      onClick={() => toggleUserPassVisibility(usr.id)}
                                      className="text-slate-400 hover:text-slate-600 focus:outline-none ml-1 cursor-pointer"
                                      title={visiblePasswords[usr.id] ? "Sembunyikan sandi" : "Tampilkan sandi"}
                                      type="button"
                                    >
                                      {visiblePasswords[usr.id] ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleEditClick(usr)}
                                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] cursor-pointer transition"
                                      type="button"
                                    >
                                      Ubah
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(usr.id, usr.email)}
                                      disabled={usr.email === currentDevEmail}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg text-[10px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                                      type="button"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTenant(null);
                  setTenantUsers([]);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-755 border border-slate-250/70 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </footer>

          </div>
        </div>
      )}
    </div>
  );
}
