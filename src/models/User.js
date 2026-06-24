const mongoose = require('mongoose');

const usrSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng'],
      minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
      maxlength: [50, 'Tên người dùng không được vượt quá 50 ký tự'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true, // Tự động chuyển về chữ thường
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập một email hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'systemadmin'],
      default: 'customer', 
    },
  },
  {
    timestamps: true, // Tự động quản lý thời gian tạo/cập nhật
  }
);

// Export model để các file khác có thể require và sử dụng
module.exports = mongoose.model('User', usrSchema);