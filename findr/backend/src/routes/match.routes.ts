import { Router } from 'express';
import { findMatches } from '../controllers/match.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', requireAuth, findMatches);

export default router;
