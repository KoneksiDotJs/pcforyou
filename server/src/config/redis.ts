import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { ConnectionOptions } from 'bullmq';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ merekomendasikan maxRetriesPerRequest di-set ke null
export const redisConnection = new Redis(redisUrl, {
  // Tambahkan opsi yang direkomendasikan BullMQ
  maxRetriesPerRequest: null,
  
  // Matikan rejectUnauthorized agar tidak error saat konek ke Upstash Redis
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

redisConnection.on('connect', () => {
  console.log('🟢 Terhubung ke Redis');
});

redisConnection.on('error', (err) => {
  console.error('🔴 Kesalahan koneksi Redis:', err);
});