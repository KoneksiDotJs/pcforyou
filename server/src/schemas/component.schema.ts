import { z } from 'zod';

export const createComponentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.enum([
    'CPU',
    'MOTHERBOARD',
    'RAM',
    'GPU',
    'PSU',
    'STORAGE',
    'CASE',
    'COOLER',
  ]),
  imageUrl: z.string().url().optional(),
  
  // Detail opsional, bergantung pada kategori
  cpuDetail: z
    .object({
      socket: z.string(),
      cores: z.number().int(),
      threads: z.number().int(),
      tdp: z.number().int(),
      hasGraphics: z.boolean().default(false),
    })
    .optional(),
    
  motherboardDetail: z
    .object({
      socket: z.string(),
      formFactor: z.string(),
      memoryType: z.string(),
      maxMemory: z.number().int(),
    })
    .optional(),
}).refine(
  (data) => {
    // Validasi kondisional: pastikan detail sesuai dengan kategori
    if (data.category === 'CPU' && !data.cpuDetail) return false;
    if (data.category === 'MOTHERBOARD' && !data.motherboardDetail) return false;
    return true;
  },
  {
    message: 'Payload detail tidak sesuai dengan spesifikasi kategori.',
    path: ['category'],
  }
);