Đúng rồi, phần bối cảnh phía trên tập trung vào luồng nghiệp vụ (Business Logic). Để bạn có một "bản thiết kế" (Blueprint) hoàn chỉnh và dùng làm checklist trong quá trình code, mình sẽ bổ sung toàn bộ cấu trúc các **Thực thể (Models)** và danh sách **API Routes** cho toàn bộ hệ thống nhé.

Đây là bức tranh kỹ thuật chi tiết nhất cho dự án của bạn:

### I. CẤU TRÚC CÁC THỰC THỂ (MODELS)

Trong MongoDB, chúng ta sẽ có 4 Collections chính. Sự liên kết giữa chúng được thực hiện qua `ObjectId` (khóa ngoại trong NoSQL).

**1. Model Người dùng (User)**

* `name` (String): Tên hiển thị.
* `email` (String): Dùng để đăng nhập (Unique, kiểm tra bằng Regex).
* `password` (String): Mật khẩu đã được mã hóa bằng bcrypt.
* `role` (String): Phân quyền người dùng (`customer` hoặc `admin`).

**2. Model Sản phẩm (Product)**

* `name`, `description` (String): Thông tin cơ bản.
* `price` (Number): Giá bán.
* `category` (String): Phân loại hàng (VD: Điện thoại, Laptop).
* `stock` (Number): Số lượng tồn kho (rất quan trọng để xử lý đặt hàng).
* `imageUrl` (String): Đường dẫn ảnh sản phẩm.

**3. Model Giỏ hàng (Cart)**

* `userId` (ObjectId): Trỏ tới Model **User** (Xác định giỏ hàng này của ai).
* `items` (Array): Một mảng chứa các object sản phẩm. Mỗi object gồm:
  * `productId` (ObjectId): Trỏ tới Model  **Product** .
  * `quantity` (Number): Số lượng cần mua của món đó.
* `totalPrice` (Number): Tổng số tiền tạm tính (Tính bằng = Giá sản phẩm **$\times$** Số lượng).

**4. Model Đơn hàng (Order)**

* `userId` (ObjectId): Trỏ tới Model **User** (Người đặt mua).
* `orderItems` (Array): Danh sách các món đã chốt mua. Lưu ý: Phải lưu trữ lại `price` tại thời điểm mua (Tránh lỗi shop đổi giá sản phẩm làm sai lệch tổng tiền của hóa đơn cũ).
* `shippingAddress` (String/Object): Địa chỉ giao hàng.
* `totalAmount` (Number): Tổng tiền thanh toán cuối cùng.
* `status` (String): Trạng thái đơn hàng (`Pending` - Chờ xử lý, `Processing` - Đang chuẩn bị, `Shipped` - Đang giao, `Delivered` - Đã giao, `Cancelled` - Đã hủy).

### II. DANH SÁCH API ROUTES (BẢN ĐỒ ĐƯỜNG DẪN)

Dưới đây là toàn bộ các API bạn cần viết. Cột "Quyền truy cập" rất quan trọng để bạn biết chỗ nào cần chèn Middleware bảo mật (JWT Token).

#### 1. API Xác thực & Người dùng (User Routes)

* `POST /api/users/register`: Tạo tài khoản mới (Public).
* `POST /api/users/login`: Đăng nhập, nhận về JWT Token (Public).
* `GET /api/users/profile`: Lấy thông tin cá nhân (Cần Token của Customer/Admin).

#### 2. API Quản lý Sản phẩm (Product Routes)

* `GET /api/products`: Lấy toàn bộ danh sách sản phẩm, có hỗ trợ search/filter (Public).
* `GET /api/products/:id`: Lấy chi tiết một sản phẩm theo ID (Public).
* `POST /api/products`: Thêm sản phẩm mới (Chỉ Admin).
* `PUT /api/products/:id`: Cập nhật thông tin/giá/số lượng tồn kho (Chỉ Admin).
* `DELETE /api/products/:id`: Xóa sản phẩm (Chỉ Admin).

#### 3. API Giỏ hàng (Cart Routes)

*Về cơ bản, mọi thao tác với giỏ hàng đều yêu cầu phải có Token đăng nhập.*

* `GET /api/cart`: Xem giỏ hàng hiện tại của mình.
* `POST /api/cart/add`: Thêm một sản phẩm vào giỏ (Gửi lên `productId` và `quantity`).
* `PUT /api/cart/update`: Chỉnh sửa số lượng của một mặt hàng trong giỏ.
* `DELETE /api/cart/remove/:productId`: Xóa hẳn một món đồ ra khỏi giỏ.

#### 4. API Đặt hàng (Order Routes)

* `POST /api/orders`: Khách hàng chốt đơn. (Hệ thống sẽ lấy dữ liệu từ Cart **$\rightarrow$** Trừ Stock của Product **$\rightarrow$** Tạo Order **$\rightarrow$** Xóa Cart). (Cần Token Customer).
* `GET /api/orders/my-orders`: Khách hàng xem lịch sử đơn hàng của chính mình (Cần Token Customer).
* `GET /api/orders`: Xem danh sách tất cả đơn hàng trên hệ thống (Chỉ Admin).
* `PUT /api/orders/:id/status`: Cập nhật trạng thái đơn hàng (Ví dụ: Từ `Pending` sang `Shipped`) (Chỉ Admin).

Tuyệt vời! Dự án **Backend cho E-commerce Mini** là một bước đệm hoàn hảo để bạn vừa làm quen với kiến trúc hệ thống thực tế, vừa làm chủ cách tư duy lưu trữ dữ liệu dạng Document-oriented của MongoDB.

Dưới đây là thiết kế chi tiết toàn bộ bối cảnh, thực thể, phương thức và cấu trúc thư mục chuẩn để bạn có thể bắt tay vào code ngay.

### I. BỐI CẢNH DỰ ÁN (PROJECT CONTEXT)

Bạn sẽ xây dựng một hệ thống **RESTful API** cho một trang web bán hàng (ví dụ: bán đồ công nghệ hoặc quần áo). Hệ thống này không tập trung vào giao diện (Frontend) mà tập trung tối đa vào xử lý logic ở Server:

* **Đối với Khách hàng (Customer):** Xem sản phẩm, tìm kiếm, thêm hàng vào giỏ, quản lý giỏ hàng và tiến hành đặt hàng (Checkout).
* **Đối với Quản trị viên (Admin):** Thêm, sửa, xóa sản phẩm, cập nhật số lượng tồn kho và quản lý trạng thái các đơn hàng của khách.

### II. CÁC THỰC THỂ (MODELS) VÀ PHƯƠNG THỨC (ROUTES/CONTROLLERS)

Trong MongoDB + Mongoose, chúng ta sẽ thiết kế 4 thực thể chính dưới dạng các  **Collection** . Dưới đây là các trường dữ liệu cần thiết (Schema) và các phương thức API tương ứng:

#### 1. Người dùng (User)

* **Các trường dữ liệu (Schema):**
  * `name` (String): Tên người dùng.
  * `email` (String, Unique): Dùng để đăng nhập.
  * `password` (String): Mật khẩu (phải được mã hóa bằng `bcrypt`).
  * `role` (String): Phân quyền, gồm `customer` hoặc `admin`.
* **Các phương thức cần xử lý:**
  * `POST /api/users/register`: Đăng ký tài khoản mới.
  * `POST /api/users/login`: Đăng nhập (trả về JWT Token để xác thực).
  * `GET /api/users/profile`: Lấy thông tin cá nhân (yêu cầu Login).

#### 2. Sản phẩm (Product)

* **Các trường dữ liệu (Schema):**
  * `name` (String), `description` (String).
  * `price` (Number): Giá tiền.
  * `category` (String): Danh mục (ví dụ: Laptop, Phone).
  * `stock` (Number): Số lượng còn lại trong kho.
  * `imageUrl` (String): Link ảnh sản phẩm.
* **Các phương thức cần xử lý:**
  * `GET /api/products`: Lấy danh sách sản phẩm (hỗ trợ lọc theo `category`, tìm kiếm theo tên).
  * `GET /api/products/:id`: Xem chi tiết một sản phẩm.
  * `POST /api/products` (Admin Only): Thêm sản phẩm mới.
  * `PUT /api/products/:id` (Admin Only): Cập nhật thông tin/số lượng sản phẩm.
  * `DELETE /api/products/:id` (Admin Only): Xóa sản phẩm.

#### 3. Giỏ hàng (Cart)

* **Các trường dữ liệu (Schema):**
  * `userId` (ObjectId, ref: 'User'): Giỏ hàng này thuộc về ai.
  * `items`: Một mảng gồm các object `{ productId (ref: 'Product'), quantity (Number) }`.
  * `totalPrice` (Number): Tổng số tiền tạm tính của giỏ hàng.
* **Các phương thức cần xử lý:**
  * `GET /api/cart`: Xem giỏ hàng hiện tại của người dùng đang đăng nhập.
  * `POST /api/cart/add`: Thêm một sản phẩm vào giỏ (nếu sản phẩm đã có thì tăng `quantity`).
  * `PUT /api/cart/update`: Thay đổi số lượng của một sản phẩm trong giỏ.
  * `DELETE /api/cart/remove/:productId`: Xóa một sản phẩm ra khỏi giỏ.

#### 4. Đơn hàng (Order)

* **Các trường dữ liệu (Schema):**
  * `userId` (ObjectId, ref: 'User').
  * `items`: Mảng chứa danh sách sản phẩm lúc mua (lưu cả `price` tại thời điểm mua để tránh việc sau này sản phẩm đổi giá làm sai lệch lịch sử đơn hàng).
  * `totalAmount` (Number): Tổng số tiền hóa đơn.
  * `shippingAddress` (String): Địa chỉ giao hàng.
  * `status` (String): Trạng thái đơn (`Pending`, `Processing`, `Shipped`, `Cancelled`).
* **Các phương thức cần xử lý:**
  * `POST /api/orders`: Tạo đơn hàng mới (Logic: Lấy dữ liệu từ Giỏ hàng chuyển qua -> Trừ số lượng `stock` của sản phẩm tương ứng -> Xóa trống giỏ hàng).
  * `GET /api/orders/my-orders`: Khách hàng xem lại lịch sử mua hàng cá nhân.
  * `PUT /api/orders/:id/status` (Admin Only): Admin cập nhật trạng thái đơn hàng.

### III. CÁCH CHIA FILE VÀ TỔ CHỨC THƯ MỤC (PROJECT STRUCTURE)

Để dự án dễ mở rộng và chuẩn hóa theo mô hình kiến trúc phân lớp (Layered Architecture), bạn nên chia thư mục theo cấu trúc dưới đây. Cấu trúc này giúp tách biệt rõ ràng giữa Định nghĩa dữ liệu (Models), Định nghĩa đường dẫn (Routes) và Logic xử lý (Controllers).

**Plaintext**

```
mini-ecommerce-backend/
├── src/
│   ├── config/
│   │   └── db.js                # Cấu hình kết nối tới MongoDB Atlas bằng Mongoose
│   ├── models/                  # Nơi định nghĩa các Mongoose Schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── controllers/             # Nơi xử lý logic nghiệp vụ (Business Logic)
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── routes/                  # Định nghĩa các endpoint API và gắn controller tương ứng
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── middlewares/             # Các hàm trung gian xử lý kiểm tra bảo mật/lỗi
│   │   ├── authMiddleware.js    # Kiểm tra JWT Token hợp lệ và kiểm tra quyền Admin
│   │   └── errorMiddleware.js   # Bắt các lỗi tập trung để server không bị crash
│   └── server.js                # File chạy chính, khởi tạo Express app và kết nối DB
├── .env                         # Lưu các biến môi trường bảo mật (PORT, MONGO_URI, JWT_SECRET)
├── .gitignore
├── package.json
└── README.md
```

### Hướng đi chi tiết cho luồng chạy (Data Flow Example):

Khi khách hàng gọi API `GET /api/products`:

1. Yêu cầu chạy vào file `server.js`, nhận diện prefix `/api/products` và chuyển tiếp sang file `src/routes/productRoutes.js`.
2. File `productRoutes.js` kiểm tra route `/` và gọi hàm tương ứng trong `src/controllers/productController.js`.
3. Hàm trong `productController.js` sẽ gọi đến `src/models/Product.js` để thực hiện câu lệnh truy vấn dữ liệu từ MongoDB (`Product.find()`), nhận kết quả và dùng `res.json()` trả dữ liệu về cho client.

### Bước tiếp theo bạn nên làm:

1. Tạo thư mục dự án, chạy lệnh `npm init -y` để khởi tạo.
2. Cài đặt các thư viện cốt lõi: `npm i express mongoose dotenv bcryptjs jsonwebtoken`.
3. Cài đặt công cụ hỗ trợ dev: `npm i -D nodemon` (để tự động reload server khi sửa code).
