import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Email sudah terdaftar' });
      return;
    }

    // Hash password (10 adalah nilai salt rounds yang standar & aman)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }, // Jangan kembalikan password!
    });

    res.status(201).json({ status: 'success', data: newUser });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ status: 'error', errors: error.errors });
      return;
    }
    console.error('[AuthController Register]', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Email atau password salah' });
      return;
    }

    // Cocokkan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ status: 'error', message: 'Email atau password salah' });
      return;
    }

    // Buat JWT Token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d', // Token berlaku 7 hari
    });

    // Set token ke dalam HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true, // Tidak bisa diakses oleh JavaScript frontend (Mencegah XSS)
      secure: process.env.NODE_ENV === 'production', // Harus HTTPS jika di production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Proteksi CSRF standar
      maxAge: 24 * 60 * 60 * 1000, // 7 hari dalam milidetik
    });

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ status: 'error', errors: error.errors });
      return;
    }
    console.error('[AuthController Login]', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Logout berhasil' });
};