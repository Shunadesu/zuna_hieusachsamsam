import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as bankAccountController from '../controllers/bankAccountController.js';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: path.join(__dirname, '../../public/uploads') });

const router = express.Router();

router.get('/', bankAccountController.getBankAccounts);
router.post('/', requireAdmin, upload.single('qrImage'), bankAccountController.createBankAccount);
router.put('/:id', requireAdmin, upload.single('qrImage'), bankAccountController.updateBankAccount);
router.delete('/:id', requireAdmin, bankAccountController.deleteBankAccount);

export default router;
