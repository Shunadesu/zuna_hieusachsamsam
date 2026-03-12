import express from 'express';
import * as siteConfigController from '../controllers/siteConfigController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', siteConfigController.getConfig);
router.put('/', requireAdmin, siteConfigController.updateConfig);

export default router;
