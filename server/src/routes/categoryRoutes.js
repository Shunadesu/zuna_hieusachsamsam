import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;
