import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, orderController.createOrder);

router.get('/my', authMiddleware, orderController.getMyOrders);

router.get('/', requireAdmin, orderController.getAllOrders);
router.get('/:id', requireAdmin, orderController.getOrderById);
router.patch('/:id', requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/confirm-payment', requireAdmin, orderController.confirmPayment);

export default router;
