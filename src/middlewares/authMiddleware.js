const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra xem Token có nằm trong Header (Authorization: Bearer <token>) không
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Lấy token từ chuỗi "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 3. Giải mã token để lấy ID người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Tìm user trong DB bằng ID (nhưng không lấy password) và gán vào request
      // Để các hàm sau (Controller) có thể sử dụng thông tin user này
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
      res.status(401).json({ message: 'Token không hợp lệ, yêu cầu đăng nhập lại' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Bạn chưa đăng nhập, không có token' });
  }
};

// Middleware kiểm tra quyền Admin
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'systemadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Bạn không có quyền Admin để thực hiện hành động này' });
  }
};

module.exports = { protect, admin };