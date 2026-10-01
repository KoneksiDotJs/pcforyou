import { Router } from 'express';
import { createSync } from '../controllers/sync.controller';

const router = Router();

router.post('/trigger', createSync)

export default router;