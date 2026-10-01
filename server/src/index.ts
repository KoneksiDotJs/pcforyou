import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentRoutes from './routes/component.routes';
import buildRoutes from './routes/build.routes';
import syncRoutes from './routes/sync.routes';
import './workers/price.worker';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Port standar Vite frontend nanti
  credentials: true // Wajib diaktifkan agar frontend bisa mengirim dan menerima cookie
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/components', componentRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);

// Basic Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'PC Builder API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});