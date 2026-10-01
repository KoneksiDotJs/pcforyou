import { z } from 'zod';

export const saveBuildSchema = z.object({
  buildName: z.string().min(1, 'Nama rakitan wajib diisi'),
  cpuId: z.uuid('Format ID tidak valid').optional(),
  motherboardId: z.uuid('Format ID tidak valid').optional(),
  ramId: z.uuid('Format ID tidak valid').optional(),
  gpuId: z.uuid('Format ID tidak valid').optional(),
  psuId: z.uuid('Format ID tidak valid').optional(),
});