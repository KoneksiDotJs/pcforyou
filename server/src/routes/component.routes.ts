import { Router } from 'express';
import { createComponent, getComponents } from '../controllers/component.controller';

const router = Router();

// Endpoint: POST /api/components
router.post('/', createComponent);

router.get('/', getComponents); 

export default router;