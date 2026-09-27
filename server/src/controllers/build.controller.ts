import { Request, Response } from 'express';
import { checkCompatibility } from '../services/compatibility.service';

export const validateBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpuId, motherboardId } = req.body;

    // Memanggil Compatibility Engine
    const compatibilityResult = await checkCompatibility({ cpuId, motherboardId });

    res.status(200).json({
      status: 'success',
      data: compatibilityResult,
    });
  } catch (error) {
    console.error('[BuildController Error]', error);
    res.status(500).json({ status: 'error', message: 'Gagal memvalidasi build PC' });
  }
};