import express from 'express';
import * as sellRequestController from '../controllers/sellRequestController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, sellRequestController.createSellRequest);
router.get('/', requireAdmin, sellRequestController.getSellRequests);
router.patch('/:id', requireAdmin, sellRequestController.updateSellRequestStatus);

export default router;
