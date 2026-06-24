const express = require('express');
const router = express.Router();
const { protect,admin } = require('../middlewares/authMiddleware');

// Đừng quên import thêm deleteProduct nhé
const { 
  getProducts, 
  createProduct, 
  deleteProduct 
} = require('../controllers/productController');

// 1. Các endpoint tác động lên TOÀN BỘ danh sách (không cần ID)
// Đường dẫn: /api/products
router.route('/')
  .get(getProducts)
  .post(protect,admin,createProduct);

// 2. Các endpoint tác động lên MỘT sản phẩm cụ thể (bắt buộc truyền ID)
// Đường dẫn: /api/products/:id
router.route('/:id')
  .delete(protect,admin,deleteProduct);
  // Sau này bạn có thể nối thêm .put(updateProduct) hoặc .get(getProductById) vào đây rất tiện!

module.exports = router;