import { Router } from 'express';
import {
  browse,
  createListing,
  deleteListing,
  getListing,
  listMine,
  updateListing,
} from '../controllers/listing.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { listingSchema, listingUpdateSchema } from '../validators/listing.validator';

const router = Router();

// Public read-only browsing
router.get('/', browse);
router.get('/mine/list', requireAuth, listMine);
router.get('/:id', getListing);

router.post('/', requireAuth, validate(listingSchema), createListing);
router.put('/:id', requireAuth, validate(listingUpdateSchema), updateListing);
router.delete('/:id', requireAuth, deleteListing);

export default router;
