import { Router } from 'express';
import { getUserBuilds, saveBuild, validateBuild } from '../controllers/build.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/builds/validate
router.post('/validate', validateBuild);

router.post('/save', requireAuth, saveBuild);
router.get('/my-builds', requireAuth, getUserBuilds);

export default router;