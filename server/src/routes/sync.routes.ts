import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addPriceSyncJob } from '../queues/price.queue';

const router = Router();

router.post('/trigger', async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.body;

    // Pastikan komponennya ada di database
    const component = await prisma.component.findUnique({
      where: { id: componentId }
    });

    if (!component) {
      res.status(404).json({ status: 'error', message: 'Komponen tidak ditemukan' });
      return;
    }

    // Masukkan ke antrean BullMQ (Proses berjalan di background)
    await addPriceSyncJob(component.id, component.name);

    // API Express langsung merespons TANPA menunggu Worker selesai
    res.status(200).json({
      status: 'success',
      message: `Pencarian harga untuk ${component.name} sedang diproses di background.`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;