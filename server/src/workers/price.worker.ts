import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { prisma } from '../lib/prisma';

// Worker mendengarkan antrean 'price-sync'
export const priceWorker = new Worker(
  'price-sync',
  async (job: Job) => {
    const { componentId, keyword } = job.data;
    console.log(`[Worker] ⏳ Memulai pencarian harga untuk: ${keyword}`);

    // SIMULASI PROSES BERAT (Misal: Fetch API Marketplace yang butuh waktu 3 detik)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // SIMULASI DATA HASIL SCRAPING/API
    // Mengacak harga pura-pura dari Rp 1.500.000 s/d Rp 3.000.000
    const mockPrice = Math.floor(Math.random() * (3000000 - 1500000 + 1)) + 1500000;

    // Simpan ke database menggunakan skema Prisma yang sudah kita buat sebelumnya
    await prisma.productListing.create({
      data: {
        componentId,
        marketplace: 'TOKOPEDIA', 
        sellerName: 'Toko Komputer Simulasi',
        productUrl: `https://tokopedia.com/search?q=${encodeURIComponent(keyword)}`,
        price: mockPrice,
        isAvailable: true,
      },
    });

    return mockPrice;
  },
  { connection: redisConnection }
);

// Event Listeners untuk memantau status Worker
priceWorker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] ✅ Selesai! Harga ${job.data.keyword} diperbarui (Rp${returnvalue}).`);
});

priceWorker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Gagal memproses ${job?.data.keyword}:`, err.message);
});