import { Router } from 'express';
import { createComponent, getComponentById, getComponents } from '../controllers/component.controller';

const router = Router();

// Endpoint: POST /api/components
router.post('/', createComponent);

router.get('/', getComponents);
router.get('/:id', getComponentById);

export default router;