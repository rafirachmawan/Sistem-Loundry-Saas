# [Goal Description]

Rencana ini bertujuan untuk merancang arsitektur pembuatan aplikasi mobile mandiri untuk Android menggunakan **React Native (via Expo)**. Aplikasi ini akan berintegrasi langsung dengan API Sistem Laundry SaaS (Next.js) yang sudah ada. 

Selain itu, rencana ini juga mencakup persiapan di sisi web Next.js untuk menambahkan fitur agar *user* bisa mengunduh file `.apk` secara otomatis dan langsung dari website.

## User Review Required

> [!IMPORTANT]
> Karena kita akan menginisialisasi tumpukan teknologi baru (React Native), struktur *codebase* akan terpengaruh. Tolong periksa bagian "Open Questions" untuk menentukan strategi penempatan kode.

## Open Questions

> [!WARNING]
> Beberapa keputusan teknis ini akan menentukan bagaimana kita memulai:
> 1. **Struktur Repositori:** Apakah Anda ingin *project* mobile ini dibuat di folder terpisah dari *project* Next.js saat ini, atau disatukan dalam satu folder besar (*monorepo*)? (Saran: Untuk tahap awal, membuat *project* di folder terpisah akan lebih mudah dikelola).
> 2. **Penyimpanan File `.apk`:** File aplikasi Android berukuran sekitar 30MB-60MB. Apakah tidak masalah jika kita simpan sementara di dalam folder `/public` Next.js Anda? (Ini adalah cara paling mudah untuk langsung memunculkan fitur unduhan otomatis).

## Proposed Changes

### [Tahap 1: Pembuatan Aplikasi Mobile (React Native + Expo)]
Kita akan membuat aplikasi mobile terpisah yang berfungsi sebagai "konsumen" data dari API Next.js Anda.

#### [NEW] `laundry-mobile-app/App.tsx`
- Titik awal (entry point) aplikasi React Native.
- Konfigurasi sistem navigasi (misal: React Navigation) untuk perpindahan layar.

#### [NEW] `laundry-mobile-app/src/services/apiClient.ts`
- Modul khusus untuk menangani request `fetch` ke backend.
- Mengatur URL tujuan (*base URL*) ke server Next.js Anda (contoh: `https://laundrysaas.com/api`).
- Menyertakan token otentikasi (jika ada sistem login) di setiap request.

#### [NEW] `laundry-mobile-app/src/screens/DashboardScreen.tsx`
- Layar contoh yang mengambil data dari endpoint `/api/developer/stats` atau API kasir lainnya.
- Menerjemahkan tata letak web menjadi komponen antarmuka *native* (`<View>`, `<Text>`, `<ScrollView>`).

### [Tahap 2: Distribusi Aplikasi via Web (Next.js)]
Menyiapkan website Anda saat ini agar bisa mendistribusikan aplikasi secara langsung kepada pengguna Android.

#### [NEW] `public/downloads/spindo-app.apk`
- Folder baru di proyek Next.js Anda sebagai tempat menyimpan file `.apk` yang sudah berhasil di-*build* dari Expo.
- File ini siap untuk diunduh publik.

#### [MODIFY] Komponen Navigasi / Sidebar Web
- Menambahkan tombol "Unduh Aplikasi Android (.apk)" pada dashboard pengguna/kasir.
- **Logika Deteksi (Opsional):** Kita bisa menambahkan skrip kecil untuk mengecek jika pengunjung menggunakan Android (`navigator.userAgent`), tombol akan muncul. Jika menggunakan laptop/iPhone, tombol disembunyikan.
- Tombol ini akan otomatis memicu pengunduhan file `/downloads/spindo-app.apk`.

## Verification Plan

### Automated Tests
- Menjalankan `expo start` untuk menguji aplikasi secara lokal menggunakan Emulator Android atau aplikasi Expo Go di HP fisik.
- Memastikan tidak ada masalah *Cross-Origin Resource Sharing* (CORS) ketika aplikasi mobile menembak API Next.js.

### Manual Verification
- Melakukan proses *build* pertama dari Expo untuk menghasilkan file `spindo-app.apk`.
- Memindahkan file tersebut ke folder `public/downloads/` di Next.js.
- Mengakses website menggunakan HP Android, mengklik tombol unduh, dan memastikan sistem Android memproses unduhan (serta instalasi *sideloading*) dengan lancar tanpa terdeteksi sebagai malware.
- Membuka aplikasi di HP dan memastikan data berhasil dimuat dari server.
