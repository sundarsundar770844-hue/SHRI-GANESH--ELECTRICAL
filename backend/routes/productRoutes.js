import express from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct, updateStock } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/', getProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;
