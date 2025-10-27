DROP DATABASE IF EXISTS DATH_DB;
CREATE DATABASE DATH_DB;
USE DATH_DB;

CREATE TABLE Customer (
    ID INT AUTO_INCREMENT,
    Password VARCHAR(255) NOT NULL, -- Increased size for hashed passwords
    Username VARCHAR(20) NOT NULL UNIQUE,
    Name VARCHAR(50) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO Customer(Password, Username, Name, Phone, Email, Address) VALUES
('matkhau1', 'toilaVinhne', 'Nguyễn Công Vinh', '01234567809', 'vinh.nguyencong@hcmut.edu.vn', 'Việt Nam'),
('matkhau2', 'toilaChatgptne', 'Nguyễn Văn Chatgpt', '0918273645', 'chat.gpt@hcmut.edu.vn', 'Việt Nam');

CREATE TABLE Administrator (
    ID INT AUTO_INCREMENT,
    Password VARCHAR(255) NOT NULL, -- Increased size for hashed passwords
    Username VARCHAR(20) NOT NULL UNIQUE,
    Name VARCHAR(50) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE Report (
	ReportID INT AUTO_INCREMENT,
    Information VARCHAR(1000) NOT NULL,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    Title VARCHAR(50),
    CustomerID INT NOT NULL,
    PRIMARY KEY (ReportID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID) ON DELETE CASCADE
);

CREATE TABLE Warehouse (
	WarehouseID INT NOT NULL,
    Address VARCHAR(100),
    PRIMARY KEY (WarehouseID)
);

INSERT INTO Warehouse(WarehouseID, Address) VALUES
(1, 'Thành Phố Hồ Chí Minh');

CREATE TABLE Vehicle (
	VehicleID VARCHAR(20) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Price INT NOT NULL,
    Summary VARCHAR(1000),
    Rating FLOAT,
    Discount FLOAT DEFAULT 0,
    Slug VARCHAR(100),
    Brand VARCHAR(20) NOT NULL,
    Stock INT NOT NULL,
    Type VARCHAR(20),
    WarehouseID INT NOT NULL,
    PRIMARY KEY (VehicleID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouse(WarehouseID) ON DELETE CASCADE
);

INSERT INTO Vehicle(VehicleID, Name, Price, Summary, Brand, Type, Stock, WarehouseID) VALUES
('CBR150R_BAC', "Honda CBR150R bạc", 100000000, 'Honda CBR150R 2023 nổi bật với bộ ly hợp hỗ trợ và chống trượt hai chiều, giúp sang số mượt mà và hạn chế trượt hay khóa bánh khi về số đột ngột, mang lại sự an tâm cho người lái. Xe được thiết kế thể thao với tem và phối màu mới bắt mắt, đặc biệt phiên bản Thể thao sở hữu tông đỏ chủ đạo cùng mặt nạ trắng và vành vàng, tạo hình ảnh năng động và khỏe khoắn. CBR150R sử dụng động cơ DOHC 150cc xy-lanh đơn, hộp số 6 cấp, làm mát bằng dung dịch, cho mô-men xoắn cực đại 14,4 Nm tại 7.000 vòng/phút, mang lại cảm giác vận hành mạnh mẽ và phấn khích. Ngoài ra, hệ thống chống bó cứng phanh ABS hai kênh được trang bị trên cả hai bánh giúp tăng độ an toàn và tự tin khi xử lý các tình huống trên đường.', 'Honda', 'Clutch', 99, 1),
('RS150R_TXD', 'Honda RS150R Trắng xanh đỏ', 70000000, 'Honda RS150R được trang bị động cơ xi-lanh đơn DOHC 4 thì 4 van, làm mát bằng chất lỏng, với dung tích 149,2 cm³, tỷ số nén 11.3:1, cho công suất tối đa 11,8 kW tại 9.000 vòng/phút và mô-men xoắn cực đại 13,6 Nm tại 7.000 vòng/phút. Động cơ sử dụng hệ thống phun xăng điện tử PGM-FI tiết kiệm nhiên liệu, kết hợp bình xăng dung tích 4,5 lít và dung tích dầu máy 1,1–1,3 lít tùy mức xả. Xe khởi động bằng điện, dùng hệ thống ACG 12V, đi kèm ly hợp ướt và hộp số 6 cấp cho khả năng sang số mượt mà. Khung sườn dạng Twin Tube chắc chắn, với kích thước tổng thể 2.020 x 727 x 1.128 mm, chiều dài cơ sở 1.278 mm, yên cao 786 mm, khoảng sáng gầm 149 mm và trọng lượng chỉ 119 kg, giúp xe linh hoạt và dễ điều khiển. Hệ thống treo gồm phuộc ống lồng phía trước và monoshock phía sau, bánh xe không săm kích thước 90/80–17M/C và 120/70–17M/C, cùng phanh đĩa đơn thủy lực ở cả hai bánh mang lại khả năng vận hành ổn định và an toàn trên mọi hành trình.', 'Honda', 'Clutch', 99, 1),
('Vario125_BD', 'Honda Vario 125 Bạc đen', 50000000, 'Honda Vario 125 ghi điểm với thiết kế tổng thể thon gọn, linh hoạt nhưng vẫn toát lên vẻ cá tính nhờ các đường nét góc cạnh được trau chuốt tỉ mỉ. Phiên bản mới mang phong cách thể thao nổi bật hơn với màu đỏ rực rỡ bên cạnh hai tùy chọn đen và xanh đen, phù hợp với nhiều phong cách người dùng. Phần đầu xe được thiết kế mạnh mẽ và hầm hố, với các chi tiết khí động học và cụm đèn LED sắc sảo vuốt nhọn về phía trước, tạo nên diện mạo hiện đại và năng động. Vario 125 sở hữu động cơ 125cc tích hợp hệ thống ngắt động cơ tạm thời Idling Stop, giúp giảm tiếng ồn, tiết kiệm nhiên liệu và thân thiện với môi trường. Ngoài ra, xe còn được trang bị cổng sạc USB loại A 2.1A tiện lợi ở hộc chứa đồ phía trước, giúp người dùng dễ dàng sạc điện thoại khi di chuyển.', 'Honda', 'Automatic', 99, 1),
('Wave_D', 'Honda Wave Alpha Đen', 25000000, 'Honda Wave Alpha nổi bật với thiết kế tem hoàn toàn mới mang phong cách "retro" cổ điển nhưng vẫn hiện đại, với logo "Wave Alpha" cách điệu cùng tông xám nhạt tạo điểm nhấn thời trang cho người dùng. Xe được trang bị động cơ 110cc mạnh mẽ, bền bỉ, mang lại hiệu suất cao và khả năng tiết kiệm nhiên liệu vượt trội, giúp tối ưu chi phí vận hành mà vẫn đem đến cảm giác lái hứng khởi. Ngoài ra, Wave Alpha còn được tích hợp chế độ đèn chiếu sáng phía trước luôn bật, giúp người lái có tầm nhìn tốt hơn và tăng khả năng nhận diện của xe ngay cả ban ngày, mang lại sự an toàn và yên tâm trên mọi hành trình.', 'Honda', 'Manual', 99, 1),

('EX155_XDN', 'Yamaha Exciter 155 VVA Xanh Đen', 52000000, 'Yamaha Exciter 155 VVA định nghĩa lại phân khúc xe côn tay thể thao với động cơ 155cc mạnh mẽ, tích hợp công nghệ van biến thiên VVA cho khả năng tăng tốc vượt trội ở mọi dải tua. Xe được trang bị bộ ly hợp A&S (Assist & Slipper) giúp côn nhẹ, chống trượt bánh khi dồn số gấp. Hộp số 6 cấp, thiết kế lấy cảm hứng từ YZF-R1 và hệ thống chìa khóa thông minh Smart Key mang lại trải nghiệm lái thể thao và tiện ích tối đa.', 'Yamaha', 'Clutch', 99, 1),
('SIRIUS_DB', 'Yamaha Sirius FI Đỏ Bạc', 21000000, 'Yamaha Sirius FI là mẫu xe số phổ thông được ưa chuộng nhờ sự bền bỉ, tiết kiệm nhiên liệu vượt trội với hệ thống phun xăng điện tử FI. Động cơ 115cc vận hành êm ái, ổn định. Thiết kế nhỏ gọn, linh hoạt, phù hợp di chuyển trong đô thị đông đúc. Cốp xe dưới yên đủ chứa áo mưa và vật dụng cá nhân, là lựa chọn kinh tế và đáng tin cậy cho nhu cầu đi lại hàng ngày.', 'Yamaha', 'Manual', 99, 1),
('GRANDE_T', 'Yamaha Grande Hybrid Trắng', 48000000, 'Yamaha Grande Hybrid là mẫu xe tay ga cao cấp hướng đến phái nữ, nổi bật với thiết kế châu Âu thanh lịch và sang trọng. Xe được trang bị động cơ Blue Core Hybrid 125cc, kết hợp trợ lực điện giúp tăng tốc mượt mà và tiết kiệm nhiên liệu ấn tượng. Cốp xe siêu rộng (27 lít) có đèn LED, nắp bình xăng phía trước tiện lợi và hệ thống khóa thông minh Smart Key là những điểm cộng lớn về tiện ích.', 'Yamaha', 'Automatic', 99, 1),

-- Dữ liệu cho SYM
('ATTILA125_D', 'SYM Attila 125 Đỏ', 35000000, 'SYM Attila 125 sở hữu thiết kế bo tròn cổ điển, mang đậm vẻ đẹp thanh lịch và thời trang. Đèn pha và đèn hậu LED hiện đại, mặt đồng hồ kết hợp analog và LCD hiển thị rõ ràng. Động cơ 125cc vận hành mượt mà, êm ái, phù hợp cho việc di chuyển trong thành phố. Nắp bình xăng được đặt phía trước giúp đổ xăng tiện lợi mà không cần mở yên xe.', 'SYM', 'Automatic', 99, 1),
('ELEGANT110_X', 'SYM Elegant 110 Xanh', 17500000, 'SYM Elegant 110 là lựa chọn hàng đầu trong phân khúc xe số giá rẻ, hướng đến đối tượng học sinh, sinh viên hoặc người cần một phương tiện cơ bản, bền bỉ. Xe có thiết kế đơn giản, gọn nhẹ, động cơ 110cc tiết kiệm xăng và chi phí bảo dưỡng thấp. Dù giá rẻ, xe vẫn đảm bảo khả năng vận hành ổn định cho nhu cầu đi lại cơ bản hàng ngày.', 'SYM', 'Manual', 99, 1),
('SHARK125_DN', 'SYM Shark 125 Đen Nhám', 41000000, 'SYM Shark 125 mang phong cách thiết kế thể thao, hầm hố với các đường nét góc cạnh, mạnh mẽ. Xe được trang bị động cơ 125cc cho khả năng vận hành khá bốc và ổn định ở tốc độ cao. Sàn để chân phẳng và rộng rãi tạo tư thế ngồi thoải mái. Hệ thống đèn LED toàn diện và phanh đĩa trước đảm bảo an toàn và tính hiện đại cho xe.', 'SYM', 'Automatic', 99, 1);
CREATE TABLE Images (
    VehicleID VARCHAR(20) NOT NULL,
    ImagePriority INT NOT NULL, -- To know how to arrange images in web pages.
    ImageLink VARCHAR(700) NOT NULL,
    PRIMARY KEY (VehicleID, ImageLink),
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
);

INSERT INTO Images(VehicleID, ImagePriority, ImageLink) VALUES
('CBR150R_BAC', 1, 'https://i.postimg.cc/7LR9Y9VW/1.webp'),
('CBR150R_BAC', 2, 'https://i.postimg.cc/cJzh4hm5/2.webp'),
('CBR150R_BAC', 3, 'https://i.postimg.cc/N0nDfD4V/3.webp'),
('CBR150R_BAC', 4, 'https://i.postimg.cc/0N4n2nfF/4.webp'),
('CBR150R_BAC', 5, 'https://i.postimg.cc/VNhgLgg8/5.webp'),
('CBR150R_BAC', 6, 'https://i.postimg.cc/NMr4yXCq/6.webp'),
('RS150R_TXD', 1, 'https://i.postimg.cc/MHHjMJpQ/1.webp'),
('RS150R_TXD', 2, 'https://i.postimg.cc/T11WLv3j/2.webp'),
('RS150R_TXD', 3, 'https://i.postimg.cc/C52nbrRC/3.webp'),
('RS150R_TXD', 4, 'https://i.postimg.cc/MHHjMJpn/4.webp'),
('RS150R_TXD', 5, 'https://i.postimg.cc/qqqChHvR/5.webp'),
('RS150R_TXD', 6, 'https://i.postimg.cc/PJJ8pn5Y/6.webp'),
('Vario125_BD', 1, 'https://i.postimg.cc/7YL3Sq9y/1.webp'),
('Vario125_BD', 2, 'https://i.postimg.cc/9Ffdycb2/2.webp'),
('Vario125_BD', 3, 'https://i.postimg.cc/m26QwKXv/3.webp'),
('Vario125_BD', 4, 'https://i.postimg.cc/RVbcR2pz/4.webp'),
('Vario125_BD', 5, 'https://i.postimg.cc/HsLwbTzG/5.webp'),
('Vario125_BD', 6, 'https://i.postimg.cc/CLKGbw7g/6.webp'),
('Wave_D', 1, 'https://i.postimg.cc/FK1cJpVN/1.webp'),
('Wave_D', 2, 'https://i.postimg.cc/YCdY9ZgX/2.webp'),
('Wave_D', 3, 'https://i.postimg.cc/k5D8tsvJ/3.webp'),
('Wave_D', 4, 'https://i.postimg.cc/Gp9YsKxm/4.webp'),
('Wave_D', 5, 'https://i.postimg.cc/tg7PVkNg/5.webp'),
('Wave_D', 6, 'https://i.postimg.cc/k5ZSNSTb/6.webp');

CREATE TABLE Voucher ( -- Voucher are like "HAPPYINDEPENDENCEDAY"
    Code VARCHAR(40) NOT NULL,
    Reduction INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Quantity INT NOT NULL,
    Conditions INT NOT NULL,
    PRIMARY KEY (Code)
);

INSERT INTO Voucher(Code, Reduction, StartDate, EndDate, Quantity, Conditions) VALUES('MOTTRIEU', 1000000, '2025-10-23 00:00:00', '2025-11-23 00:00:00', 50, 15000000);

CREATE TABLE Orders (
	OrderID INT AUTO_INCREMENT,
    Status VARCHAR(20), -- Pending, Accepted, Cancel
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    Total INT NOT NULL,
    GrandTotal INT NOT NULL,
    CustomerID INT NOT NULL,
    PRIMARY KEY (OrderID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID)
);

CREATE TABLE Apply (
    OrderID INT NOT NULL,
    VoucherCode VARCHAR(40) NOT NULL,
    PRIMARY KEY (OrderID),
    FOREIGN KEY (VoucherCode) REFERENCES Voucher(Code),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

CREATE TABLE CartItem (
    CartItemID INT AUTO_INCREMENT,
    Quantity INT NOT NULL,
    Price INT NOT NULL,
    Discount FLOAT DEFAULT(0),
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CustomerID INT NOT NULL,
    VehicleID VARCHAR(20) NOT NULL,
    PRIMARY KEY (CartItemID),
    UNIQUE (CustomerID, VehicleID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID) ON DELETE CASCADE,
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
);

CREATE TABLE OrderItem (
    OrderItemID INT AUTO_INCREMENT,
    Quantity INT NOT NULL,
    Price INT NOT NULL,
    Discount FLOAT,
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    OrderID INT NOT NULL,
    VehicleID VARCHAR(20) NOT NULL,
    PRIMARY KEY (OrderItemID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
);

CREATE TABLE Payment (
	PaymentID INT AUTO_INCREMENT,
    Content VARCHAR(100),
    Type BOOLEAN NOT NULL,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    Amount INT NOT NULL,
    OrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    PRIMARY KEY (PaymentID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID) ON DELETE CASCADE
);

CREATE TABLE Rating (
    CustomerID INT NOT NULL,
    VehicleID VARCHAR(20) NOT NULL,
    Information VARCHAR(100),
    Star INT NOT NULL,
    CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (CustomerID, VehicleID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID) ON DELETE CASCADE,
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
);

CREATE TABLE AddToWishlist ( -- This is like a wishlist for user
    CustomerID INT NOT NULL,
    VehicleID VARCHAR(20) NOT NULL,
    PRIMARY KEY (CustomerID, VehicleID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(ID) ON DELETE CASCADE,
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
);