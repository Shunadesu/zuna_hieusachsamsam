import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/sales', requireAdmin, reportController.getSalesReport);

export default router;
