const express = require('express');
const router = express.Router();
const {addToCart,getMyCart} = require('../controllers/cartController');
const {protect} = require('../middlewares/authMiddleware');
//@route Get /api/cart
//DESC Xem giỏ hàng(ai đăng nhập thì xem của người đó)
router.get('/',protect,getMyCart);
//@route Post /api/cart/add
//DESC Thêm sản phẩm vào giỏ hàng
router.post('/add',protect,addToCart);
module.exports = router;