import { Request, Response } from 'express';
import { createComponentSchema } from '../schemas/component.schema';
import { prisma } from '../lib/prisma';

export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validasi payload request
    const validatedData = createComponentSchema.parse(req.body);

    const { name, brand, category, imageUrl, cpuDetail, motherboardDetail } = validatedData;

    // 2. Simpan ke database menggunakan Prisma Nested Create
    const newComponent = await prisma.component.create({
      data: {
        name,
        brand,
        category,
        imageUrl,
        // Insert conditionally berdasarkan kategori
        ...(category === 'CPU' && cpuDetail && {
          cpuDetail: { create: cpuDetail }
        }),
        ...(category === 'MOTHERBOARD' && motherboardDetail && {
          motherboardDetail: { create: motherboardDetail }
        }),
      },
      include: {
        // Kembalikan data beserta detailnya sebagai response
        cpuDetail: true,
        motherboardDetail: true,
      }
    });

    res.status(201).json({
      status: 'success',
      data: newComponent
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ status: 'error', errors: error.errors });
      return;
    }
    console.error('[ComponentController Error]', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};