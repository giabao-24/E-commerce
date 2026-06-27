const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: { // Lưu cứng tên để chống mất dữ liệu
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true }
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    status: { // Kéo ra ngoài cùng
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], // Giới hạn các từ được phép nhập
      default: 'Pending'
    }
  }, 
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);