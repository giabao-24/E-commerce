const Cart = require('../models/Cart');
const Product = require('../models/Product');

//@route   POST /api/cart/add
//@desc    Thêm sản phẩm vào giỏ hàng
const addToCart = async (req,res)=> {
  const {productId,quantity} = req.body;
  const userId = req.user._id;
  try {
    const product = await Product.findById(productId);
    if(!product) {
      return res.status(404).json({message: 'Product not found'});
    }
    
    let cart = await Cart.findOne({userId});
    if (cart) {
      // TRƯỜNG HỢP 1: ĐÃ CÓ GIỎ HÀNG
      let itemIndex = -1; // Bắt đầu giả định là chưa tìm thấy (-1)
      
      // Dùng vòng lặp for để duyệt qua từng mặt hàng trong giỏ
      for (let i = 0; i < cart.items.length; i++) {
        // Phải dùng .toString() vì productId trong DB đang ở dạng ObjectId
        if (cart.items[i].productId.toString() === productId) {
          itemIndex = i; // Đã tìm thấy! Lưu lại cái vị trí (index)
          break; // Tìm thấy rồi thì ngắt vòng lặp luôn để tối ưu hiệu năng
        }
      }

      if (itemIndex > -1) {
        // Nếu vị trí lớn hơn -1 (nghĩa là đã tìm thấy) -> Tăng số lượng lên
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Nếu vòng lặp chạy xong mà vẫn là -1 (chưa tìm thấy) -> Nhét thêm mới vào mảng
        cart.items.push({ productId, quantity });
      }
      
      // Cộng thêm tiền vào tổng bill
      cart.totalPrice += product.price * quantity;
      
      // Lưu lại thay đổi xuống DB
      cart = await cart.save();
      return res.status(200).json(cart);

    } else {
      // TRƯỜNG HỢP 2: CHƯA CÓ GIỎ HÀNG -> TẠO MỚI
      const newCart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
        totalPrice: product.price * quantity,
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @route   GET /api/cart
// @desc    Xem giỏ hàng của tôi
const getMyCart = async (req, res) => {
  try {
    // populate('items.productId') sẽ tự động chạy sang bảng Product, 
    // lấy tên và ảnh của sản phẩm đắp vào kết quả trả về cho Front-end hiển thị
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name price imageUrl');
    //Dùng populate để nối các bảng(lấy thông tin từ bảng khác)
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng đang trống' });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getMyCart };