PRODUCT REQUIREMENT DOCUMENT (PRD)
Project Name: [Insert Project Name] – MVP Version
Author: PM Freelancer Senior
Date: Juni 2026
Status: APPROVED / PRODUCTION-READY
Architecture: SaaS Multi-Tenant (Cross-Platform Mobile & Web)
Target Segment: Laundry Rumahan / Kiloan

1. EXECUTIVE SUMMARY & OBJECTIVES
   1.1 Background
   Banyak UMKM laundry kiloan masih menggunakan pencatatan manual atau aplikasi POS generik yang tidak mengakomodasi karakteristik unik operasional laundry. Masalah utama yang sering terjadi adalah risiko pakaian tertukar/hilang dan fleksibilitas termin pembayaran (banyak pelanggan yang baru membayar saat cucian diambil/postpaid). Sistem ini dirancang berbasis SaaS Multi-Tenant agar dapat digunakan oleh banyak pemilik laundry (tenant) secara massal dengan data yang terisolasi aman.

1.2 Objectives
Membangun sistem POS yang memproses input order kurang dari 1 menit secara real-time.
Menyediakan visual tracking status produksi untuk menekan angka pakaian hilang atau tertukar hingga 0%.
Mengunci celah kecurangan (fraud) kasir melalui validasi status pembayaran ketat saat proses pengambilan cucian (pickup).

2. USER PERSONA & ROLES
   Aplikasi ini membatasi hak akses pengguna secara ketat melalui dua role utama:
   Role
   Deskripsi
   Hak Akses Utama
   Kasir / Operator
   Staf operasional di gerai laundry (Menggunakan Mobile App).
   Input order, filter pelanggan, update status tracker, terima pelunasan uang, cetak struk bluetooth, kirim nota WA.
   Owner (Super Admin)
   Pemilik laundry yang memantau bisnis (Menggunakan Web App & Mobile App).
   Seluruh hak akses Kasir + melihat dashboard grafik keuangan, melihat alert piutang, mengubah master harga layanan, serta otorisasi modifikasi/pembatalan order.

3. DETAILED FEATURE REQUIREMENTS (MVP SCOPE)
   3.1 Module: Super Fast POS Kasir (Epic 2)
   FR-POS-01: Customer Lookup & Registration
   Deskripsi: Kasir dapat mencari data pelanggan lama atau mendaftarkan yang baru di halaman yang sama tanpa perlu reload halaman.
   Alur Sistem: Input nomor WA/Nama $\rightarrow$ Trigger backend /api/v1/customers?search= $\rightarrow$ Jika data ditemukan, sistem melakukan autocomplete. Jika tidak ditemukan, sistem membuka form input instan (Nama & No WA).
   FR-POS-02: Auto-Calculator Engine
   Deskripsi: Sistem menghitung total harga secara real-time di frontend untuk mempercepat transaksi, namun kalkulasi final tetap divalidasi oleh backend saat disimpan.
   Logika Bisnis:
   $$\text{Subtotal} = \text{Kuantitas (Kg/Pcs)} \times \text{Harga Master Layanan}$$
   FR-POS-03: Dual Payment Termination
   Deskripsi: Mengakomodasi karakteristik perilaku konsumen laundry yang fleksibel (bayar di awal atau di belakang).
   Kondisi Sistem (payment_term):
   Jika Prepaid (Bayar di Muka): Kolom payment_status = PAID, kasir wajib memilih opsi payment_method (Cash/QRIS/Transfer).
   Jika Postpaid (Bayar di Belakang): Kolom payment_status = UNPAID, kolom payment_method secara otomatis di-set NONE.
   FR-POS-04: Digital Receipt via WhatsApp API
   Deskripsi: Begitu transaksi sukses disimpan (POST /api/v1/orders), sistem memicu pengiriman ringkasan nota digital ke WhatsApp pelanggan secara asynchronous (antrean latar belakang) agar aplikasi mobile kasir tidak membeku (freezing).
   3.2 Module: Visual Status Tracker (Epic 2)
   FR-TRACK-01: Linear Status Workflow
   Deskripsi: Dasbor internal kasir/operator untuk memantau dan mengubah status posisi pakaian dari hulu ke hilir.
   Workflow: ANTREAN $\rightarrow$ DICUCI $\rightarrow$ DIKERINGKAN $\rightarrow$ SETRIKA $\rightarrow$ SELESAI $\rightarrow$ DIAMBIL.
   FR-TRACK-02: Pickup Gatekeeper Lock (Anti-Fraud & Anti-Lost)
   Deskripsi: Menghindari kasir menyerahkan pakaian kepada pelanggan tanpa menerima uang pada skema postpaid.

Aturan Sistem:
IF payment_term == 'POSTPAID' AND payment_status == 'UNPAID'
THEN Tombol aksi "Konfirmasi Diambil" pada antarmuka kasir wajib di-disable secara total (dikunci).
Kasir harus menekan tombol "Terima Pelunasan" terlebih dahulu. Setelah status pembayaran berubah menjadi PAID, tombol "Konfirmasi Diambil" baru terbuka otomatis.
3.3 Module: Basic Owner Dashboard & Analytics (Epic 3)
FR-DASH-01: Financial Metrics Aggregation
Deskripsi: Ringkasan performa keuangan yang bersih, ringkas, dan scannable di layar HP/Laptop Owner.
Metrik Wajib:
Omset Aktual Hari Ini: Akumulasi uang tunai/digital yang benar-benar sudah diterima masuk ke kasir.
Piutang Berjalan: Nilai rupiah dari pakaian yang sedang diproses tetapi belum dibayar oleh pelanggan.
Grafik Tren Kilogram: Grafik batang volume berat (Kg) cucian yang masuk selama 7 hari terakhir.
FR-DASH-02: Unpaid Alert System
Deskripsi: Daftar khusus untuk melacak pakaian yang sudah selesai menumpuk di rak produksi (status_tracker = SELESAI) tetapi belum ditebus oleh pelanggan (payment_status = UNPAID). Menyediakan tombol shortcut "Ingatkan via WA" untuk memicu chat template penagihan sopan secara otomatis.

4. NON-FUNCTIONAL REQUIREMENTS (NFR)
   Multi-Tenancy Security (Crucial): Setiap query database untuk transaksi, pelanggan, dan laporan WAJIB menyertakan klausul tenant_id atau owner_id yang diekstrak secara ketat dari JWT Token aktif. Tidak boleh ada kebocoran data atau tumpang tindih data antar-pemilik laundry.
   Performance: Proses input order dari awal ketik nama hingga nota WhatsApp terkirim harus bisa diselesaikan dalam waktu kurang dari 60 detik oleh kasir.
   Security: Data password pengguna wajib di-hash menggunakan algoritma bcrypt atau argon2 sebelum disimpan di database. Token JWT kedaluwarsa otomatis dalam waktu 24 jam.
   Reliability & Sync: Frontend menggunakan teknik Polling Interval setiap 30 detik untuk memperbarui halaman visual status tracker agar data tetap aktual tanpa membebani performa server cloud.
   Data Integrity: Akun dengan role Kasir tidak dibekali fungsi DELETE atau MODIFY pada transaksi yang sudah sah masuk ke database untuk menghindari manipulasi laporan keuangan.

5. REKOMENDASI TECH STACK RE-CAP
   Mobile App Framework (Kasir): React Native (Menggunakan library react-native-bluetooth-escpos-printer untuk kebutuhan integrasi cetak struk fisik thermal di gerai).
   Web App Framework (Owner Dashboard): React.js / Next.js (Berbagi ekosistem komponen yang sama dengan React Native Web untuk efisiensi codebase).
   Backend API Gateway: Node.js (TypeScript) dengan NestJS atau Express.js.
   Database Server: PostgreSQL / MySQL.
   Notification Integration: Third-party WhatsApp Gateway (Fonnte/Wablas) menggunakan antrean asynchronous.

6. RISK ASSESSMENT (ANALISIS RISIKO PM)
   Risiko Modifikasi Harga Sewenang-wenang: Potensi fraud kasir yang memanipulasi nilai subtotal dari komponen frontend sebelum dikirim ke database.
   Mitigasi: Backend wajib mengabaikan variabel harga yang dikirim oleh frontend. Backend harus melakukan kalkulasi ulang secara mandiri dengan mengambil nilai price_per_unit asli langsung dari tabel services berdasarkan service_id yang dipilih.
   Risiko Estimasi Selesai Melebihi Janji: Pelanggan komplain karena cucian selesai tidak tepat waktu.
   Mitigasi: Kolom estimated_hours pada master data layanan wajib terisi. Sistem secara otomatis menghitung waktu tenggat (order_date + estimated_hours) dan mencantumkannya secara transparan pada nota WhatsApp pelanggan.
   Risiko Pemblokiran Nomor WhatsApp Gateway: Pengiriman pesan massal nota digital berisiko diblokir oleh sistem Meta karena dianggap spam.
   Mitigasi: Tim developer wajib menerapkan spintax atau menyertakan string unik berupa timestamp waktu/nomor invoice di dalam pesan teks nota agar setiap pesan yang terkirim memiliki struktur data yang unik.
