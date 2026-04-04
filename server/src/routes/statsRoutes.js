import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, getStats);

export default router;
