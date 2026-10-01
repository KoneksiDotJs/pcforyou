import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { prisma } from '../lib/prisma';
import { fetchMarketplacePrices } from '../services/scraper.service';

// Worker mendengarkan antrean 'price-sync'
export const priceWorker = new Worker(
  'price-sync',
  async (job: Job) => {
    const { componentId, keyword } = job.data;

    // 1. Ambil data dari Scraper Service (Adapter Pattern)
    const scrapedDataList = await fetchMarketplacePrices(keyword);

    // 2. Loop setiap hasil marketplace (Tokopedia, Shopee, dll)
    for (const data of scrapedDataList) {
      // Cek apakah listing dari toko ini sudah pernah disimpan untuk komponen ini
      const existingListing = await prisma.productListing.findFirst({
        where: {
          componentId,
          marketplace: data.marketplace,
        }
      });

      let listingId;

      if (existingListing) {
        // Jika sudah ada: Update harga terakhir dan waktu sinkronisasi
        const updated = await prisma.productListing.update({
          where: { id: existingListing.id },
          data: {
            price: data.price,
            lastSyncedAt: new Date(),
            isAvailable: data.isAvailable
          }
        });
        listingId = updated.id;
      } else {
        // Jika belum ada: Buat listing baru
        const created = await prisma.productListing.create({
          data: {
            componentId,
            marketplace: data.marketplace,
            sellerName: data.sellerName,
            productUrl: data.productUrl,
            price: data.price,
            isAvailable: data.isAvailable
          }
        });
        listingId = created.id;
      }

      // 3. SIMPAN RIWAYAT HARGA
      await prisma.priceHistory.create({
        data: {
          productListingId: listingId,
          price: data.price,
        }
      });
    }

    return `Tersinkronisasi ${scrapedDataList.length} sumber untuk ${keyword}`;
  },
  { connection: redisConnection }
);

priceWorker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] ✅ Selesai! ${returnvalue}`);
});

priceWorker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Gagal memproses ${job?.data.keyword}:`, err.message);
});