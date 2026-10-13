# TODO

[] Estimasi FPS per Game: Tambahkan fitur yang menampilkan perkiraan Frame Rate (FPS) dari rakitan PC untuk game-game populer.

[] "Build for My Game": Izinkan pengguna memilih game favorit mereka dan resolusi yang diinginkan (1080p, 1440p), lalu biarkan sistemmu memberikan rekomendasi rakitan paling budget-friendly.

[] Shareable Build Links: Buat agar setiap rakitan yang disimpan menghasilkan URL unik (misal: [pcbuilderos.com/build/xyz123](https://pcbuilderos.com/build/xyz123)). Pengguna bisa membagikan link ini ke forum atau media sosial untuk meminta pendapat orang lain.

[] Export to Image/PDF: Tambahkan tombol agar pengguna bisa mengunduh daftar spesifikasi dan total harga mereka menjadi gambar bergaya retro yang rapi untuk diunggah ke Instagram Story atau grup Facebook.

[] User Reviews & Ratings: Izinkan pengguna memberikan ulasan atau bintang pada komponen tertentu berdasarkan pengalaman pemakaian mereka.

[] Price Drop Alerts (Notifikasi Penurunan Harga): Pengguna dapat menyimpan wishlist rakitan mereka. Jika scraper-mu mendeteksi harga total komponen turun melewati batas tertentu (misal: turun 5%), sistem akan mengirimkan email notifikasi.

[] Redis Caching untuk API Komponen: Saat ini, setiap kali pengguna membuka halaman utama, sistem melakukan query ke database. Simpan hasil query /api/components ke Redis agar loading halaman utama menjadi instan dan meringankan beban database Prisma.

[] Auto-Sync Cron Job: Alih-alih hanya mengandalkan tombol sinkronisasi manual di Admin Dashboard, konfigurasikan BullMQ menggunakan Repeatable Jobs (Cron) agar scraper berjalan otomatis setiap tengah malam untuk memperbarui harga.