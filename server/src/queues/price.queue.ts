import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Membuat antrean bernama 'price-sync'
export const priceQueue = new Queue('price-sync', {
  connection: redisConnection,
});

// Fungsi pembantu untuk menambahkan tugas ke antrean
export const addPriceSyncJob = async (componentId: string, keyword: string) => {
  await priceQueue.add(
    'sync-marketplace', 
    { componentId, keyword }, 
    {
      attempts: 3, // Coba ulang 3x jika gagal (misal API marketplace down)
      backoff: { type: 'exponential', delay: 2000 }, // Jeda waktu sebelum retry
      removeOnComplete: true, // Hapus tugas dari memori jika sukses
    }
  );
  console.log(`[Queue] Job ditambahkan untuk sinkronisasi: ${keyword}`);
};