import { Router } from 'express';
import { createSync } from '../controllers/sync.controller';
import { isAdmin, requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/trigger', requireAuth, isAdmin, createSync)

export default router;