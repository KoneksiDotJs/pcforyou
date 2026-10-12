import { Router } from 'express';
import { createComponent, getComponentById, getComponents } from '../controllers/component.controller';
import { isAdmin, requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/components
router.post('/', requireAuth, isAdmin, createComponent);

router.get('/', getComponents);
router.get('/:id', getComponentById);

export default router;