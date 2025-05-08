import { Router } from 'express';
import { updateStock, getLowStockItems, logInventoryChange } from '../controllers/inventoryController';

const router = Router();

router.put('/stock/:id', updateStock);
router.get('/low-stock', getLowStockItems);
router.post('/log', logInventoryChange);

export default router; 