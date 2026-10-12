import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Memperluas interface Request Express agar mengenali properti .user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    
    // Sematkan payload ke dalam request
    req.user = decoded;
    
    // Lanjut ke controller berikutnya
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      status: 'error', 
      message: 'Akses ditolak. Fitur ini hanya untuk Admin.' 
    });
  }
};