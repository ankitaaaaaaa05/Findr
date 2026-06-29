import { Router } from 'express';
import { fromImage, fromText } from '../controllers/ai.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/from-image', requireAuth, fromImage);
router.post('/from-text', requireAuth, fromText);

export default router;
