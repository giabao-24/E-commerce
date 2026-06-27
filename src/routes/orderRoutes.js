const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// 1. Đặt hàng (POST /api/orders) - Chỉ User
router.post('/', protect, placeOrder);
// 2. Xem danh sách đơn hàng của TÔI (GET /api/orders/myorders) - Chỉ User
router.get('/myorders', protect, getMyOrders);
// 3. Xem toàn bộ đơn hàng trên hệ thống (GET /api/orders) - Chỉ Admin
router.get('/', protect, admin, getAllOrders);
//4. CẬP NHẬT TRẠNG THÁI ĐƠN (PUT /api/orders/:id/status) - Chỉ Admin
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;