import { Request, Response } from 'express';
import { checkCompatibility } from '../services/compatibility.service';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { saveBuildSchema } from '../schemas/build.schema';

export const validateBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpuId, motherboardId, ramId, gpuId, psuId } = req.body;

    // Memanggil Compatibility Engine
    const compatibilityResult = await checkCompatibility({ cpuId, motherboardId, ramId, gpuId, psuId });

    res.status(200).json({
      status: 'success',
      data: compatibilityResult,
    });
  } catch (error) {
    console.error('[BuildController Error]', error);
    res.status(500).json({ status: 'error', message: 'Gagal memvalidasi build PC' });
  }
};

export const saveBuild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'User tidak terautentikasi' });
      return;
    }

    // 1. Validasi format ID (UUID)
    const validatedData = saveBuildSchema.parse(req.body);

    // 2. TAMBAHAN: Validasi Kompatibilitas Hardware
    const compatibility = await checkCompatibility({
      cpuId: validatedData.cpuId,
      motherboardId: validatedData.motherboardId,
      ramId: validatedData.ramId,
      gpuId: validatedData.gpuId,
      psuId: validatedData.psuId,
    });

    // 3. Jika tidak kompatibel, tolak permintaan save
    if (!compatibility.isCompatible) {
      res.status(400).json({
        status: 'error',
        message: 'Tidak dapat menyimpan rakitan karena ada komponen yang bentrok/tidak kompatibel.',
        compatibilityErrors: compatibility.errors
      });
      return;
    }

    // 4. Jika kompatibel, simpan ke database
    const savedBuild = await prisma.savedBuild.create({
      data: {
        userId,
        ...validatedData
      },
    });

    res.status(201).json({
      status: 'success',
      data: savedBuild,
      // Kita kembalikan warning (jika ada, misalnya saran kapasitas PSU)
      warnings: compatibility.warnings
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ status: 'error', errors: error.errors });
      return;
    }
    console.error('[BuildController Save]', error);
    res.status(500).json({ status: 'error', message: 'Gagal menyimpan rakitan' });
  }
};

// TAMBAHAN: Fungsi mengambil daftar rakitan milik user
export const getUserBuilds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'User tidak terautentikasi' });
      return;
    }

    const builds = await prisma.savedBuild.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Tampilkan dari yang paling baru
    });

    res.status(200).json({ status: 'success', data: builds });
  } catch (error) {
    console.error('[BuildController GetUserBuilds]', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data rakitan' });
  }
};