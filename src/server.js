const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 1. Import Routes
const userRoutes = require('./routes/userRoutes'); // Nhớ import userRoutes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();
connectDB();
const app = express();

// 2. Phiên dịch viên JSON
app.use(express.json());

// 3. Tổng đài định tuyến (Chỉ dùng app.use)
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// 4. Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port: ${PORT}`);
});
//.