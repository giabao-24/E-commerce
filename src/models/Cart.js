const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  }},
  {
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
)
module.exports = mongoose.model('Cart', cartSchema);
/** **Các trường dữ liệu (Schema):**
  * `userId` (ObjectId, ref: 'User'): Giỏ hàng này thuộc về ai.
  * `items`: Một mảng gồm các object `{ productId (ref: 'Product'), quantity (Number) }`.
  * `totalPrice` (Number): Tổng số tiền tạm tính của giỏ hàng.
* **Các phương thức cần xử lý:**
  * `GET /api/cart`: Xem giỏ hàng hiện tại của người dùng đang đăng nhập.
  * `POST /api/cart/add`: Thêm một sản phẩm vào giỏ (nếu sản phẩm đã có thì tăng `quantity`).
  * `PUT /api/cart/update`: Thay đổi số lượng của một sản phẩm trong giỏ.
  * `DELETE /api/cart/remove/:productId`: Xóa một sản phẩm ra khỏi giỏ.*/