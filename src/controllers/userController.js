const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hàm hỗ trợ (Helper function) để tạo JWT Token
const generateToken = (id) => {
  // Hàm sign nhận vào 3 tham số: Dữ liệu muốn lưu (payload), Chuỗi bí mật (Secret Key), và Thời gian hết hạn
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token có hạn trong 30 ngày
  });
};

//@DESC Register a new user
//@route POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Kiểm tra xem user đã tồn tại trong Database chưa (dựa vào email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được đăng ký' });
    }

    // 2. Băm (Hash) mật khẩu trước khi lưu vào DB
    const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên (độ khó 10)
    const hashedPassword = await bcrypt.hash(password, salt); // Trộn password với salt

    // 3. Tạo user mới với mật khẩu đã băm
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Nếu tạo thành công, trả về thông tin user (kèm theo Token để login luôn)
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@Desc Login user
//@route POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body; // Đổi 'name' thành 'email'
  try {
    // 1. Tìm user theo email
    const user = await User.findOne({ email });

    // 2. Kiểm tra xem user có tồn tại VÀ mật khẩu nhập vào có khớp với mật khẩu đã băm trong DB không
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Đăng nhập thành công, trả về thông tin kèm Token mới
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@Desc Get user profile
//@route GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    // req.user được set trong middleware authMiddleware.js
    const user = await User.findById(req.user.id).select('-password'); // Loại bỏ trường password khỏi kết quả trả về
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};