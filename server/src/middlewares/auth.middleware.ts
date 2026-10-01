import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Memperluas interface Request Express agar mengenali properti .user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Ambil token dari cookie
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ status: 'error', message: 'Akses ditolak. Silakan login terlebih dahulu.' });
      return;
    }

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Sematkan payload ke dalam request
    req.user = decoded;
    
    // Lanjut ke controller berikutnya
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};