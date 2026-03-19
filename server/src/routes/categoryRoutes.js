import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as categoryController from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: path.join(__dirname, '../../public/uploads') });

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', requireAdmin, upload.single('image'), categoryController.createCategory);
router.put('/:id', requireAdmin, upload.single('image'), categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;
