import express from 'express';
import * as sliderController from '../controllers/sliderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', sliderController.getSliders);
router.post('/', requireAdmin, sliderController.createSlider);
router.put('/:id', requireAdmin, sliderController.updateSlider);
router.delete('/:id', requireAdmin, sliderController.deleteSlider);

export default router;
