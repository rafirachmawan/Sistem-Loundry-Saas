# Dokumentasi Fitur Aplikasi Laundry SaaS Multi-Tenant

> Dokumen ini menjelaskan seluruh fitur dari dua perspektif pengguna: **Kasir** dan **Owner**.
> Dibuat sebagai referensi pembangunan MVP sebelum masuk ke tahap implementasi kode.

---

## Daftar Isi

1. [Fitur Kasir](#1-fitur-kasir)
   - [1.1 POS — Transaksi Order Baru](#11-pos--transaksi-order-baru)
   - [1.2 Visual Tracker](#12-visual-tracker)
   - [1.3 Pickup Gatekeeper](#13-pickup-gatekeeper)
2. [Fitur Owner](#2-fitur-owner)
   - [2.1 Dashboard Analitik](#21-dashboard-analitik)
   - [2.2 Unpaid Alert System](#22-unpaid-alert-system)
   - [2.3 Manajemen Master Harga](#23-manajemen-master-harga)
3. [Alur Lengkap Transaksi](#3-alur-lengkap-transaksi)
4. [Status & Lifecycle Order](#4-status--lifecycle-order)
5. [Aturan Bisnis Penting](#5-aturan-bisnis-penting)

---

## 1. Fitur Kasir

Kasir adalah pengguna yang paling sering berinteraksi dengan sistem — rata-rata puluhan transaksi per hari. Semua fitur dirancang untuk **kecepatan**: seminimal mungkin klik, tanpa reload halaman.

---

### 1.1 POS — Transaksi Order Baru

Halaman utama kasir. Satu halaman menangani seluruh alur dari lookup pelanggan hingga order tersimpan.

#### Lookup Pelanggan Real-Time

| Aspek    | Detail                                                          |
| -------- | --------------------------------------------------------------- |
| Endpoint | `GET /api/customers?search={query}`                             |
| Trigger  | Kasir mulai mengetik nama atau nomor WA                         |
| Hasil    | Dropdown muncul instan, tanpa reload halaman                    |
| Filter   | Hanya menampilkan pelanggan milik `tenant_id` yang sedang login |

#### Registrasi Inline Pelanggan Baru

Jika pelanggan tidak ditemukan di hasil pencarian, form registrasi muncul di tempat (inline) tanpa pindah halaman.

| Field          | Keterangan                              |
| -------------- | --------------------------------------- |
| Nama lengkap   | Wajib diisi                             |
| Nomor WhatsApp | Wajib diisi, digunakan untuk notifikasi |

Setelah disimpan, pelanggan baru langsung terpilih dan kasir bisa melanjutkan input order.

#### Auto-Kalkulator Harga

| Aspek               | Detail                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| Input kasir         | `service_id` + kuantitas (kg atau pcs)                                  |
| Perhitungan UI      | Subtotal muncul real-time saat kuantitas diubah                         |
| Perhitungan backend | Backend menghitung ulang subtotal dari harga master saat order disimpan |
| Tujuan              | Mencegah manipulasi harga dari sisi frontend (anti-fraud)               |

> **Aturan penting:** Harga yang berlaku adalah harga yang ada di tabel `Service` pada database saat transaksi terjadi, bukan harga yang dikirim dari frontend.

#### Pilihan Metode Bayar

| Metode       | Perilaku                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Prepaid**  | Kasir menerima pembayaran di tempat. Status order langsung `PAID`.                       |
| **Postpaid** | Order dicatat sebagai piutang. Status order `UNPAID`. Pelanggan bayar saat ambil cucian. |

---

### 1.2 Visual Tracker

Halaman terpisah untuk memantau status semua cucian yang sedang berjalan. Dirancang agar kasir bisa melihat kondisi seluruh antrian dalam satu pandangan.

#### Tampilan Papan

| Kolom            | Deskripsi                              |
| ---------------- | -------------------------------------- |
| **Antrean**      | Order baru masuk, belum mulai diproses |
| **Diproses**     | Sedang dicuci/disetrika                |
| **Siap Diambil** | Selesai, menunggu pelanggan datang     |
| **Diambil**      | Sudah diambil pelanggan, order selesai |

#### Informasi per Kartu Order

| Info                | Keterangan                                      |
| ------------------- | ----------------------------------------------- |
| ID Order            | Nomor unik order (contoh: `#LDR-0041`)          |
| Nama pelanggan      | Ditampilkan jelas                               |
| Layanan & kuantitas | Contoh: "Cuci kiloan · 3 kg"                    |
| Status bayar        | Badge `PAID` (hijau) atau `UNPAID` (merah)      |
| Tombol aksi         | Muncul sesuai kondisi (lihat Pickup Gatekeeper) |

#### Auto-Refresh

- Halaman melakukan polling otomatis ke server setiap **30 detik**.
- Menggunakan **React Query** dengan opsi `refetchInterval: 30000`.
- Tidak perlu reload manual — kasir cukup membuka halaman dan data selalu terkini.

---

### 1.3 Pickup Gatekeeper

Mekanisme pengaman untuk mencegah kasir menyerahkan cucian kepada pelanggan postpaid yang belum membayar.

#### Logika Kunci

```
Jika order.paymentType === "POSTPAID" && order.paymentStatus === "UNPAID"
  → tombol "Konfirmasi Diambil" = disabled (terkunci)

Jika order.paymentStatus === "PAID"
  → tombol "Konfirmasi Diambil" = aktif (bisa diklik)
```

#### Alur Pelunasan Postpaid

```
1. Kasir menekan tombol "Terima Pelunasan"
2. Sistem mencatat pembayaran → status berubah menjadi PAID
3. Tombol "Konfirmasi Diambil" otomatis terbuka
4. Kasir menekan "Konfirmasi Diambil"
5. Status order berubah menjadi COMPLETED
```

| Kondisi                           | Tampilan Tombol                              |
| --------------------------------- | -------------------------------------------- |
| Postpaid + UNPAID                 | `Terkunci — lunasi dulu` (disabled, abu-abu) |
| Postpaid + PAID setelah pelunasan | `Konfirmasi Diambil` (aktif, hijau)          |
| Prepaid + PAID                    | `Konfirmasi Diambil` (aktif, hijau)          |

---

## 2. Fitur Owner

Owner tidak melakukan transaksi harian, tetapi membutuhkan visibilitas penuh atas performa bisnis. Semua data yang ditampilkan otomatis difilter berdasarkan `tenant_id` — owner hanya melihat data laundry miliknya.

---

### 2.1 Dashboard Analitik

Halaman utama owner. Menampilkan ringkasan performa bisnis hari ini dan tren 7 hari terakhir.

#### Kartu Metrik Ringkasan

| Kartu                     | Sumber Data                                            | Keterangan                                                |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| **Omset aktual hari ini** | `SUM(payment.amount)` di mana `payment.paidAt = today` | Hanya order yang sudah PAID. Piutang belum terhitung.     |
| **Piutang berjalan**      | `SUM(order.total)` di mana `paymentStatus = UNPAID`    | Total rupiah yang belum diterima dari pelanggan postpaid. |
| **Order masuk hari ini**  | `COUNT(order)` di mana `createdAt = today`             | Dipecah menjadi: sudah selesai dan sedang diproses.       |

#### Grafik Volume Kilogram

| Aspek         | Detail                                                  |
| ------------- | ------------------------------------------------------- |
| Data          | Total kilogram dari semua order per hari                |
| Rentang waktu | 7 hari terakhir                                         |
| Tujuan        | Melihat pola hari ramai/sepi, membantu perencanaan staf |
| Implementasi  | Bar chart dengan highlight khusus untuk hari ini        |

---

### 2.2 Unpaid Alert System

Daftar semua order postpaid yang belum dibayar, diurutkan dari yang paling lama.

#### Informasi per Baris

| Kolom          | Keterangan                                             |
| -------------- | ------------------------------------------------------ |
| Nama pelanggan | Nama lengkap                                           |
| Umur piutang   | Berapa hari sejak order dibuat (contoh: "3 hari lalu") |
| ID Order       | Nomor referensi order                                  |
| Jumlah tagihan | Total rupiah yang harus dibayar                        |
| Tombol aksi    | "Ingatkan via WA"                                      |

#### Tombol "Ingatkan via WA"

| Aspek          | Detail                                                              |
| -------------- | ------------------------------------------------------------------- |
| MVP (saat ini) | Mencatat event ke backend log — simulasi pengiriman                 |
| Produksi       | Memanggil API Fonnte/Wablas dengan nomor WA pelanggan dan teks nota |
| Isi pesan WA   | Nama pelanggan, ID order, total tagihan, nama laundry               |

Arsitektur NotificationService dirancang dengan **interface yang dapat diganti** (mock ↔ provider asli) tanpa mengubah logika bisnis.

---

### 2.3 Manajemen Master Harga

Owner dapat mengubah harga layanan kapan saja melalui halaman pengaturan.

#### Aturan Penting: Snapshot Harga

> Perubahan harga **tidak berdampak** pada order yang sudah ada. Harga lama tetap tersimpan di tabel `OrderItem` sebagai snapshot pada saat transaksi terjadi.

| Tabel       | Field       | Fungsi                                     |
| ----------- | ----------- | ------------------------------------------ |
| `Service`   | `price`     | Harga master yang berlaku untuk order baru |
| `OrderItem` | `unitPrice` | Snapshot harga pada saat order dibuat      |

Dengan desain ini, laporan keuangan historis tetap akurat meskipun harga layanan berubah berkali-kali.

---

## 3. Alur Lengkap Transaksi

```
[Kasir membuka halaman POS]
        │
        ▼
[Lookup pelanggan by nama/WA]
        │
        ├─ Tidak ditemukan ──► [Registrasi inline: nama + WA] ──► lanjut
        │
        └─ Ditemukan ──────────────────────────────────────────► lanjut
        │
        ▼
[Pilih layanan + input kuantitas (kg/pcs)]
[Subtotal dihitung real-time di UI]
        │
        ▼
[Pilih metode bayar]
        │
        ├─ Prepaid ──► [Terima pembayaran] ──► Status: PAID
        │
        └─ Postpaid ─────────────────────── ► Status: UNPAID (piutang)
        │
        ▼
[Klik "Simpan Order"]
[Backend hitung ulang subtotal dari harga master]
[Order tersimpan ke database]
[WA mock log terpicu secara async]
        │
        ▼
[Order masuk ke Visual Tracker — kolom: ANTREAN]
        │
        ▼
[Staf update status: ANTREAN → DIPROSES → SIAP DIAMBIL]
        │
        ▼
[Pelanggan datang untuk ambil cucian]
        │
        ├─ PAID ──────────────────────► [Konfirmasi Diambil] ──► COMPLETED
        │
        └─ UNPAID (postpaid) ─► [Terima Pelunasan] ──► PAID ──► [Konfirmasi Diambil] ──► COMPLETED
```

---

## 4. Status & Lifecycle Order

| Status       | Kode          | Deskripsi                        |
| ------------ | ------------- | -------------------------------- |
| Antrean      | `QUEUED`      | Order baru masuk, belum diproses |
| Diproses     | `IN_PROGRESS` | Sedang dicuci atau disetrika     |
| Siap diambil | `READY`       | Selesai, menunggu pelanggan      |
| Diambil      | `COMPLETED`   | Order selesai sepenuhnya         |

| Status Bayar | Kode     | Deskripsi                   |
| ------------ | -------- | --------------------------- |
| Lunas        | `PAID`   | Pembayaran sudah diterima   |
| Belum lunas  | `UNPAID` | Postpaid yang belum dibayar |

---

## 5. Aturan Bisnis Penting

| #   | Aturan                                                       | Alasan                                                                |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| 1   | Backend selalu menghitung ulang subtotal saat order disimpan | Mencegah manipulasi harga dari frontend (anti-fraud)                  |
| 2   | Tombol "Konfirmasi Diambil" terkunci jika status `UNPAID`    | Memastikan tidak ada cucian yang keluar tanpa pembayaran              |
| 3   | Harga tersimpan sebagai snapshot di `OrderItem.unitPrice`    | Laporan historis tetap akurat meski harga master berubah              |
| 4   | Semua query database difilter otomatis by `tenant_id`        | Isolasi data antar tenant — Tenant A tidak bisa melihat data Tenant B |
| 5   | Notifikasi WA dikirim secara async (non-blocking)            | Kegagalan WA tidak mengganggu proses penyimpanan order                |
| 6   | Lookup pelanggan hanya menampilkan data tenant sendiri       | Menjaga privasi data antar bisnis laundry yang berbeda                |
