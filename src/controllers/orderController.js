const Order = require('../models/Order'); 
const Cart = require('../models/Cart');      
const Product = require('../models/Product');

// 1. KHÁCH HÀNG CHỐT ĐƠN (POST /api/orders)
const placeOrder = async (req,res) => {
  const userId = req.user._id; // Lấy ID người dùng từ token đã được giải mã
  const { shippingAddress, paymentMethod } = req.body;
  try {
    // Bước A: Lấy giỏ hàng của người dùng
   const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' });
    }

    // Bước B: Kiểm tra kho (Stock Validation) & Chuẩn bị mảng hàng hóa cho Order
    const orderItems = [];
    for(const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
      }
      // Giảm số lượng sản phẩm trong kho
      product.stock -= item.quantity;
      await product.save();
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    //Buoc C tao don hang moi
    const newOrder = await Order.create({
      userId,
      productItems: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalPrice: cart.totalPrice,
      status: 'Pending'
    });
    // Bước D: Trừ Stock trong kho
    // Dùng toán tử $inc (Increment) cực mạnh của MongoDB để trừ nhanh số lượng
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity } // Truyền số âm vào $inc là nó tự trừ!
      });
    }
    // Bước E: Xóa sổ cái Giỏ hàng cũ
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      message: 'Đặt hàng thành công!',
      order: newOrder
    });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
}

// =====================================================================
// 2. CẬP NHẬT TRẠNG THÁI ĐƠN (PUT /api/orders/:id/status) - Chỉ Admin
// =====================================================================
const updateOrderStatus = async (req, res) => {
  const { status } = req.body; // Ví dụ gửi lên: { "status": "Shipped" }
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng này' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xem danh sách đơn hàng của TÔI
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
 // lấy ID trực tiếp từ Token đã được giải mã
  const userId = req.user._id; 
  try {
    const orders = await Order.find({ userId: userId }).populate('productItems.productId');
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Bạn chưa có đơn hàng nào' });
    }
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xem toàn bộ đơn hàng trên hệ thống (Chỉ dành cho Admin)
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    // Populate userId để Admin biết ai là người đặt, populate productItems.productId để xem chi tiết sản phẩm
    // Khuyến nghị: Chỉ lấy name và email của user cho nhẹ dữ liệu
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('productItems.productId', 'name image price');
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyOrders, getAllOrders, placeOrder, updateOrderStatus };