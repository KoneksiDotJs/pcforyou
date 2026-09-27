import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ merekomendasikan maxRetriesPerRequest di-set ke null
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log('🟢 Terhubung ke Redis');
});

redisConnection.on('error', (err) => {
  console.error('🔴 Kesalahan koneksi Redis:', err);
});