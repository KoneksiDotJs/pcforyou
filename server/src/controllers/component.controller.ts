import { Request, Response } from 'express';
import { createComponentSchema } from '../schemas/component.schema';
import { prisma } from '../lib/prisma';
import { ComponentCategory } from '../../generated/prisma/client';

export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validasi payload request
    const validatedData = createComponentSchema.parse(req.body);

    const { name, brand, category, imageUrl, cpuDetail, motherboardDetail, ramDetail, gpuDetail, psuDetail } = validatedData;

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
        ...(category === 'RAM' && ramDetail && { ramDetail: { create: ramDetail } }),
        ...(category === 'GPU' && gpuDetail && { gpuDetail: { create: gpuDetail } }),
        ...(category === 'PSU' && psuDetail && { psuDetail: { create: psuDetail } }),
      },
      include: {
        // Kembalikan data beserta detailnya sebagai response
        cpuDetail: true,
        motherboardDetail: true,
        ramDetail: true,
        gpuDetail: true,
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

export const getComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const components = await prisma.component.findMany({
      where: {
        ...(category && { category: category as ComponentCategory }),
      },
      include: {
        cpuDetail: true,
        motherboardDetail: true,
        ramDetail: true,
        gpuDetail: true,
        psuDetail: true,
        // TAMBAHAN BARU: Ambil data harga
        listings: {
          where: { isAvailable: true },
          orderBy: { price: 'asc' },
          take: 5
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: components.length,
      data: components,
    });
  } catch (error) {
    console.error('[ComponentController Error - GET]', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data komponen' });
  }
};

export const getComponentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        cpuDetail: true,
        motherboardDetail: true,
        ramDetail: true,
        gpuDetail: true,
        psuDetail: true,
        listings: {
          include: {
            // Mengambil riwayat harga, diurutkan dari yang paling lama ke terbaru
            priceHistories: {
              orderBy: { recordedAt: 'asc' },
            },
          },
        },
      },
    });

    if (!component) {
      res.status(404).json({ status: 'error', message: 'Komponen tidak ditemukan' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: component,
    });
  } catch (error) {
    console.error('[ComponentController Error - GET BY ID]', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil detail komponen' });
  }
};