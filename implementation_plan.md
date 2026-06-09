# Rencana Implementasi: Pemisahan Backend (BE) & Frontend (FE)
## Aplikasi Laundry SaaS Multi-Tenant

Rencana ini menjabarkan pemisahan arsitektur monolitik full-stack Next.js sebelumnya menjadi dua layanan terpisah yang berjalan secara independen:
1. **Backend (BE)**: Menggunakan Node.js + Express.js + TypeScript + Prisma ORM (Port 3001).
2. **Frontend (FE)**: Menggunakan Next.js App Router sebagai aplikasi client-only (Port 3000).

---

## User Review Required

> [!IMPORTANT]
> **Struktur Folder Monorepo**
> Kami akan menstrukturkan kode di repositori ini menjadi dua subdirektori utama:
> - `backend/`: Berisi seluruh kode Express API, skema Prisma database, migrasi, dan seed data.
> - `frontend/`: Berisi halaman visual kasir, owner dashboard, dan login Next.js.
>
> **Keamanan JWT & Cookie Cross-Origin**
> Karena FE dan BE berjalan di port yang berbeda (3000 vs 3001), autentikasi JWT akan diatur agar dikirimkan di header otorisasi (`Authorization: Bearer <Token>`) atau menggunakan CORS kredensial jika menggunakan HTTP-Only Cookie. Kami mengusulkan metode **Authorization Bearer Header** karena sangat andal untuk pemisahan FE-BE dan mempermudah integrasi mobile-app masa depan.

---

## Open Questions

> [!WARNING]
> **1. Pemindahan File Prisma**
> Skema Prisma dan SQLite `dev.db` akan dipindahkan sepenuhnya ke folder `backend/`. Apakah Anda setuju?
>
> **2. Pembersihan File Root Lama**
> Apakah Anda ingin saya menghapus berkas-berkas Next.js yang ada di root saat ini (seperti `src/`, `postcss.config.mjs`, `eslint.config.mjs`, dll.) setelah migrasi pemisahan folder selesai dilakukan agar repositori tetap bersih?

---

## Proposed Changes

### 1. Struktur Folder Baru

```
/ (Workspace Root)
├── backend/            <-- Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/           <-- Next.js Client App
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── tsconfig.json
```

---

### Component 1: Backend API (`backend/`)

#### [NEW] [package.json](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/backend/package.json)
Dependensi backend: `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `@prisma/client`, `better-sqlite3`, `@prisma/adapter-better-sqlite3`.

#### [NEW] [schema.prisma](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/backend/prisma/schema.prisma)
Skema Prisma SQLite (sama seperti sebelumnya, dipindahkan ke direktori backend).

#### [NEW] [auth.middleware.ts](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/backend/src/middleware/auth.middleware.ts)
Middleware Express untuk mengekstrak JWT token dari header `Authorization: Bearer <Token>`, melakukan verifikasi, dan menyematkan `tenantId` dan `user` ke request object (`req.user`).

#### [NEW] [routes & controllers](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/backend/src/routes/)
Pecah modul API menjadi sub-rute Express terstruktur:
- `/routes/auth.ts` -> Registrasi & Login (controller memproses bcrypt & jwt sign).
- `/routes/customers.ts` -> Lookup & Pendaftaran Pelanggan (menyaring otomatis dengan `req.user.tenantId`).
- `/routes/services.ts` -> Mengambil & Mengedit Master Tarif Layanan.
- `/routes/orders.ts` -> Pembuatan Order (Anti-Fraud Engine) & Pembaruan Status Produksi/Pembayaran (Pickup Gatekeeper Lock).
- `/routes/analytics.ts` -> Metrik Dashboard Finansial & Tren Volume Volume Mingguan.

#### [NEW] [index.ts](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/backend/src/index.ts)
Entrypoint server Express.js yang mengaktifkan middleware CORS dan me-mount semua rute API di bawah `/api/v1/*`.

---

### Component 2: Frontend App (`frontend/`)

#### [NEW] [package.json](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/frontend/package.json)
Next.js 16 client dependencies, membuang database Prisma dan better-sqlite3 dari sisi frontend.

#### [NEW] [apiClient.ts](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/frontend/src/lib/apiClient.ts)
Helper API client (menggunakan Fetch API) untuk mengirim permintaan HTTP ke `http://localhost:3001/api/v1` secara otomatis menyematkan JWT Token di header otorisasi.

#### [MODIFY] Halaman-Halaman Frontend
- `/login/page.tsx`: Memanggil backend login, menyimpan JWT token di Cookie client-side, dan mengarahkan rute.
- `/kasir/page.tsx`: Menggunakan `apiClient` untuk lookup pelanggan, load master layanan, dan mengirim order POS.
- `/kasir/tracker/page.tsx`: Polling otomatis ke backend API untuk memperbarui board visual.
- `/owner/dashboard/page.tsx`: Load analitik keuangan dan memicu remind notifikasi WhatsApp.
- `/owner/services/page.tsx`: Menu kelola harga master layanan.

#### [NEW] [proxy.ts](file:///d:/Rafi/Project/Aplikasi%20Loundry%20Saas/frontend/src/proxy.ts)
Proxy Next.js 16 untuk memvalidasi keberadaan token di Cookie client sebelum membiarkan user mengakses rute `/owner/*` atau `/kasir/*`.

---

## Verification Plan

### Automated Tests
- Menulis unit-test integrasi menggunakan supertest di backend untuk memastikan endpoint `/api/v1/orders` menghitung subtotal secara akurat (Anti-Fraud).
- Memastikan build di kedua direktori berhasil dengan `npm run build`.

### Manual Verification
1. **Pemisahan Port**: Menjalankan backend di port 3001 dan frontend di port 3000.
2. **CORS Verification**: Mencoba melakukan login dari frontend ke backend port 3001 dan memverifikasi CORS Header mengizinkan akses.
3. **Multi-Tenancy Verification**: Melakukan pengujian login Tenant A dan memastikan panggilan ke `/api/v1/customers` di port 3001 hanya mengembalikan data pelanggan milik Tenant A.
