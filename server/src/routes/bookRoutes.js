import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as bookController from '../controllers/bookController.js';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: path.join(__dirname, '../../public/uploads') });

const router = express.Router();

router.post('/upload', requireAdmin, upload.array('images', 10), bookController.uploadBookImages);

router.get('/', bookController.getBooks);
router.get('/slug/:slug', bookController.getBookBySlug);
router.get('/:id', bookController.getBookById);

router.post('/', requireAdmin, bookController.createBook);
router.put('/:id', requireAdmin, bookController.updateBook);
router.delete('/:id', requireAdmin, bookController.deleteBook);

export default router;
