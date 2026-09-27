import { Router } from 'express';
import { validateBuild } from '../controllers/build.controller';

const router = Router();

// Endpoint: POST /api/builds/validate
router.post('/validate', validateBuild);

export default router;