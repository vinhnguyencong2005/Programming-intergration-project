# BKMotor - Motorcycle E-commerce Website

Website bán xe máy trực tuyến với đầy đủ tính năng giỏ hàng, thanh toán, quản lý đơn hàng.

## Yêu Cầu Hệ Thống

- Node.js (v14 trở lên)
- MySQL (v8.0 trở lên)
- npm hoặc yarn

## Cài Đặt

### 1. Clone hoặc tải project về

```bash
cd "New App"
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Database

#### a. Tạo database trong MySQL:

```sql
CREATE DATABASE DATH_DB;
```

#### b. Import database:

```bash
mysql -u root -p DATH_DB < SCRIPDB_7-12.sql
```

Hoặc sử dụng MySQL Workbench để import file `SCRIPDB_7-12.sql`

### 4. Cấu hình file .env

Tạo file `.env` trong thư mục root với nội dung:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=DATH_DB
DB_PORT=3306

**Lưu ý:** Thay `your_password_here` bằng mật khẩu MySQL của bạn.

## Chạy Ứng Dụng

### Development mode (với nodemon):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## Tài Khoản Mặc Định

Sau khi import database, bạn có thể đăng nhập với các tài khoản có sẵn hoặc đăng ký tài khoản mới.

### Admin:
- URL: `http://localhost:3000/admin-login`
- Kiểm tra trong database bảng `Admin`

### Customer:
- URL: `http://localhost:3000/login`
- Hoặc đăng ký tài khoản mới tại: `http://localhost:3000/register`

## Cấu Trúc Thư Mục

```
New App/
├── config/          # Cấu hình database
├── controllers/     # Xử lý logic
├── models/          # Models database
├── routes/          # API routes
├── public/          # Static files (CSS, JS, images)
├── views/           # HTML files
├── server.js        # Entry point
└── .env            # Environment variables
```

## Tính Năng Chính

- 🛒 Giỏ hàng
- 💳 Thanh toán (COD, Chuyển khoản)
- 🎫 Áp dụng voucher
- ❤️ Danh sách yêu thích
- 📦 Quản lý đơn hàng
- ⭐ Đánh giá sản phẩm
- 🚩 Báo cáo sản phẩm
- 👤 Quản lý tài khoản
- 🔐 Xác thực & phân quyền

## Troubleshooting

### Lỗi kết nối database:
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin đăng nhập trong file `.env`
- Kiểm tra database `DATH_DB` đã được tạo chưa

### Port 3000 đã được sử dụng:
- Đổi PORT trong file `.env` thành port khác (vd: 3001)

### Lỗi "Cannot find module":
- Chạy lại `npm install`
