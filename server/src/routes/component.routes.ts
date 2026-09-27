import { Router } from 'express';
import { createComponent } from '../controllers/component.controller';

const router = Router();

// Endpoint: POST /api/components
router.post('/', createComponent);

export default router;