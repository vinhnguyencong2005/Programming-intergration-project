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

# Cấu hình thanh toán Sepay (tùy chọn)
SEPAY_API_KEY=your_sepay_api_key
BANK_ACCOUNT_NO=your_bank_account_number
BANK_ACCOUNT_NAME=YOUR BANK ACCOUNT NAME
BANK_ID=YOUR BANK ID
BANK_NAME=YOUR BANK NAME
```

**Lưu ý:** 
- Thay `your_password_here` bằng mật khẩu MySQL của bạn
- Để sử dụng thanh toán QR tự động, cần cấu hình Sepay API (xem phần Thanh Toán QR bên dưới)

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
- URL: `http://localhost:3000/admin`
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
- 💳 Thanh toán (COD, Chuyển khoản QR tự động)
- 🎫 Áp dụng voucher
- ❤️ Danh sách yêu thích
- 📦 Quản lý đơn hàng
- ⭐ Đánh giá sản phẩm
- 🚩 Báo cáo sản phẩm
- 👤 Quản lý tài khoản
- 🔐 Xác thực & phân quyền

## Thanh Toán QR Tự Động (Sepay Integration)

Hệ thống hỗ trợ thanh toán chuyển khoản ngân hàng với QR code tự động xác nhận.

### Cách Hoạt Động:

1. **Khách hàng đặt hàng** và chọn phương thức "Chuyển khoản ngân hàng"
2. **Hiển thị QR code** với thông tin chuyển khoản
3. **Khách hàng quét mã QR** và chuyển khoản qua app ngân hàng
4. **Server tự động kiểm tra** giao dịch từ Sepay API mỗi 10 giây
5. **Tự động xác nhận** đơn hàng khi phát hiện giao dịch khớp
6. **Chuyển hướng** khách hàng đến trang thành công

### Cài Đặt Sepay:

#### 1. Đăng ký tài khoản Sepay:
- Truy cập: https://my.sepay.vn/
- Đăng ký tài khoản và liên kết tài khoản ngân hàng

#### 2. Lấy API Key:
- Đăng nhập vào Sepay
- Vào mục **API Settings** hoặc **Developer**
- Copy **API Key**

#### 3. Cấu hình .env:

```env
# Sepay API
SEPAY_API_KEY=your_sepay_api_key_here

# Thông tin ngân hàng
BANK_ACCOUNT_NO=your_bank_account_number
BANK_ACCOUNT_NAME=YOUR BANK ACCOUNT NAME
BANK_ID=YOUR BANK ID
BANK_NAME=YOUR BANK NAME
```

**Các ngân hàng hỗ trợ:**
- Vietinbank (970415)
- Vietcombank (970436)
- Techcombank (970407)
- BIDV (970418)
- ACB (970416)
- VPBank (970432)
- MB Bank (970422)
- Và nhiều ngân hàng khác...

#### 4. Test thanh toán:

1. Đặt hàng với phương thức "Chuyển khoản ngân hàng"
2. QR code sẽ hiển thị với nội dung: `HOrderID{id}H`
3. Chuyển khoản theo đúng số tiền và nội dung
4. Đợi 5-10 giây, hệ thống sẽ tự động xác nhận
5. Chuyển đến trang "Đặt hàng thành công"

### Lưu Ý:

- ⏱️ Thời gian timeout: **10 phút**
- 🔄 Server kiểm tra giao dịch mỗi: **10 giây**
- 📱 Frontend polling mỗi: **5 giây**
- 💰 Hệ thống tự động khớp: **OrderID + Số tiền**
- 📝 Định dạng nội dung CK: `HOrderID{id}H` (VD: HOrderID123H)

### Nếu không dùng Sepay:

Hệ thống vẫn hoạt động bình thường với thanh toán COD. Thanh toán chuyển khoản sẽ hiển thị thông tin ngân hàng tĩnh và cần admin xác nhận thủ công.

## Troubleshooting

### Lỗi kết nối database:
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin đăng nhập trong file `.env`
- Kiểm tra database `DATH_DB` đã được tạo chưa

### Port 3000 đã được sử dụng:
- Đổi PORT trong file `.env` thành port khác (vd: 3001)

### Lỗi "Cannot find module":
- Chạy lại `npm install`
