import express from 'express';
import * as promotionController from '../controllers/promotionController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', promotionController.getPromotions);
router.post('/', requireAdmin, promotionController.createPromotion);
router.put('/:id', requireAdmin, promotionController.updatePromotion);
router.delete('/:id', requireAdmin, promotionController.deletePromotion);

export default router;
