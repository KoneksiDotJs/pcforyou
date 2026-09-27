import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentRoutes from './routes/component.routes';
import buildRoutes from './routes/build.routes';
import syncRoutes from './routes/sync.routes';
import './workers/price.worker';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/components', componentRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/sync', syncRoutes);

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