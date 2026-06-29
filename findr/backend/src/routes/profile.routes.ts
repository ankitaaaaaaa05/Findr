import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profile.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, validate(updateProfileSchema), updateMyProfile);

export default router;
