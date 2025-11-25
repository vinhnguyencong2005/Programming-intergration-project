import { readCustomer } from "../Jsproject/usermodel.js";
import { readVehicle } from "../Jsproject/vehiclemodel.js";
import { deleteVehicle } from "../Jsproject/vehiclemodel.js";
import { updateVehicle } from "../Jsproject/vehiclemodel.js";
import { createCartItem } from "../Jsproject/cartItemmodel.js"; 
import { readCartItem } from "../Jsproject/cartItemmodel.js";
import { updateCartItem } from "../Jsproject/cartItemmodel.js";
import { deleteCartItem } from "../Jsproject/cartItemmodel.js";
import { createCustomer } from "../Jsproject/usermodel.js";
import { readImages } from "../Jsproject/imagemodel.js"
import { readVoucher } from "../Jsproject/vouchermodel.js";
import { createVoucher } from "../Jsproject/vouchermodel.js";
import { updateVoucher } from "../Jsproject/vouchermodel.js";
import { createOrder } from "../Jsproject/ordermodel.js";
import { readOrder } from "../Jsproject/ordermodel.js";
import { createOrderItem } from "../Jsproject/orderItemmodel.js";
import { readOrderItem } from "../Jsproject/orderItemmodel.js";
import { createApply } from "../Jsproject/applymodel.js";
import { readApply } from "../Jsproject/applymodel.js";
import { createWishlist } from "../Jsproject/wishlistmodel.js";
import { deleteWishlist } from "../Jsproject/wishlistmodel.js";
import { readWishlist } from "../Jsproject/wishlistmodel.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Trang chủ!!!!");
})

app.get("/api/login", async (req, res) => {
  res.send("<h1>Trang API Login!!!!</h1>");
}) 


// API login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await readCustomer("Username", username);
    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];
    if (user.Password === password) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ message: "Wrong password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//API customer register
app.post("/api/register", async (req, res) => {
  // Validate incoming fields
  const { username, password, name, phone, email, address } = req.body;
  if (!username || !password || !name || !phone || !email || !address) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    await createCustomer(username, password, name, phone, email, address);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    // Handle duplicate username (our createUser rejects with message)
    if (err.message && err.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//API lấy ảnh xe theo VehicleID
app.post("/api/vehicle/images", async (req, res) => {
  const { vehicleID } = req.body;
  try {
    const images = await readImages("VehicleID", vehicleID);
    res.json({ success: true, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//API lấy ảnh đầu tiên của xe theo VehicleID
app.post("/api/vehicle/first_images", async (req, res) => {
  const { vehicleID } = req.body;
  try {
    // Get the first image (priority order) for the vehicle
    const images = await readImages("VehicleID", vehicleID);
    const firstImage = images.length > 0 ? images[0].ImageLink : null;
    res.json({ success: true, imageUrl: firstImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API get vehicle
app.post("/api/vehicle", async (req, res) => {
  const { brand } = req.body;
  try {
    const vehicles = await readVehicle("Brand", brand);
    if (vehicles.length === 0) {
      return res.status(401).json({ message: "Vehicle not found" });
    }
    res.json({success: true, vehicles});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API get all vehicles
app.get("/api/vehicle", async (req, res) => {
  try {
    const vehicles = await readVehicle(); // không truyền gì hết
    res.json({ success: true, vehicles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API lấy chi tiết xe theo VehicleID
app.post("/api/vehicle/detail", async (req, res) => {
  const { vehicleID } = req.body;
  try {
    const vehicles = await readVehicle("VehicleID", vehicleID);
    if (vehicles.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json({ success: true, vehicle: vehicles[0] }); // chỉ trả về 1 xe
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE vehicle by VehicleID
app.post("/api/vehicle/delete", async (req, res) => {
  const vehicleID = req.body;
  try {
    const result = await deleteVehicle(vehicleID); 
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// API thêm Cart Item
app.post("/api/cartItem/add", async (req, res) => {
  const { vehicleID, currentUserID, vehiclePrice, discount } = req.body;
  try {
    const cartItem = createCartItem(1, vehiclePrice, discount, currentUserID, vehicleID);
    res.json({ success: true, cartItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API đọc cart items của user
app.post("/api/cartItem/get", async (req, res) => {
  const { currentUserID } = req.body;
  try {
    const cartItems = await readCartItem("CustomerID", currentUserID);
    res.json({ success: true, cartItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API cập nhật cart item
app.post("/api/cartItem/update", async (req, res) => {
  const { cartItemID, quantity } = req.body;
  if (!cartItemID || !quantity) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    await updateCartItem(cartItemID, { Quantity: quantity });
    res.json({ success: true, message: "Cart item updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API xóa cart item
app.post("/api/cartItem/delete", async (req, res) => {
  const { cartItemID } = req.body;
  if (!cartItemID) {
    return res.status(400).json({ success: false, message: "Missing cartItemID" });
  }
  try {
    await deleteCartItem(cartItemID);
    res.json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/voucher/read", async (req, res) => {
  const { code } = req.body;
  try {
    const vouchers = await readVoucher("Code", code);
    res.json({ success: true, vouchers });
  } catch (err) {
    console.error("Error reading vouchers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API lấy lịch sử đơn hàng
app.post("/api/order/history", async (req, res) => {
  const { customerID } = req.body;
  if (!customerID) {
    return res.status(400).json({ success: false, message: "Missing customerID" });
  }

  try {
    // Get all orders for this customer
    const orders = await readOrder("CustomerID", customerID);
    
    if (!orders || orders.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    // Enrich each order with order items and voucher info
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      // Get order items
      const orderItems = await readOrderItem("OrderID", order.OrderID);
      
      // Get vehicle details for each order item
      const itemsWithDetails = await Promise.all(orderItems.map(async (item) => {
        const vehicles = await readVehicle("VehicleID", item.VehicleID);
        const vehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;
        return {
          ...item,
          VehicleName: vehicle?.Name || 'Unknown Vehicle'
        };
      }));

      // Get voucher info if applied
      let voucherInfo = null;
      try {
        const applyRecord = await readApply("OrderID", order.OrderID);
        if (applyRecord) {
          const vouchers = await readVoucher("Code", applyRecord.VoucherCode);
          if (vouchers && vouchers.length > 0) {
            voucherInfo = {
              code: applyRecord.VoucherCode,
              reduction: vouchers[0].Reduction
            };
          }
        }
      } catch (err) {
        console.log(`No voucher applied for order ${order.OrderID}`);
      }

      return {
        ...order,
        orderItems: itemsWithDetails,
        voucher: voucherInfo
      };
    }));

    res.json({ success: true, orders: enrichedOrders });
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API tạo đơn hàng
app.post("/api/order/create", async (req, res) => {
  const { customerID, total, grandTotal, cartItems, voucherCode } = req.body;
  
  if (!customerID || !total || !grandTotal || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // 1. Create Order
    const orderResult = await createOrder("Pending", total, grandTotal, customerID);
    const orderID = orderResult.orderID;
    console.log(`Order created with ID: ${orderID}`);

    // 2. Create OrderItems for each cart item
    for (const item of cartItems) {
      await createOrderItem(
        item.Quantity,
        item.Price,
        item.Discount || 0,
        orderID,
        item.VehicleID
      );
      
      // 3. Update vehicle stock
      const vehicle = await readVehicle("VehicleID", item.VehicleID);
      if (vehicle && vehicle.length > 0) {
        const currentStock = vehicle[0].Stock;
        const newStock = currentStock - item.Quantity;
        await updateVehicle(item.VehicleID, { Stock: newStock });
        console.log(`Vehicle ${item.VehicleID} stock updated: ${currentStock} -> ${newStock}`);
      }
      
      // 4. Delete cart item
      await deleteCartItem(item.CartItemID);
      console.log(`CartItem ${item.CartItemID} deleted`);
    }

    // 5. Apply voucher if provided
    if (voucherCode) {
      await createApply(orderID, voucherCode);
      
      // Decrement voucher quantity
      const vouchers = await readVoucher("Code", voucherCode);
      if (vouchers && vouchers.length > 0) {
        const currentQuantity = vouchers[0].Quantity;
        await updateVoucher(voucherCode, { Quantity: currentQuantity - 1 });
        console.log(`Voucher ${voucherCode} quantity decremented`);
      }
    }

    res.json({ 
      success: true, 
      message: "Order created successfully",
      orderID: orderID 
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

//API add to wishlist
app.post("/api/wishlist/add", async (req, res) => {
  const {customerID, vehicleID} = req.body;
  try {
    await createWishlist(customerID, vehicleID);
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

//API remove from wishlist
app.post("/api/wishlist/remove", async (req, res) => {
  const {customerID, vehicleID} = req.body;
  try {
    await deleteWishlist(customerID, vehicleID);
    res.json({ success: true });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

//API read wishlist
app.post("/api/wishlist/read", async (req, res) => {
  const {customerID} = req.body;
  try {
    const wishlistItems = await readWishlist("CustomerID", customerID);
    res.json({ success: true, wishlistItems });
  } catch (err) {
    console.error("Error reading wishlist:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

//API get customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await readCustomer(); 
    res.json({success: true, customers });
  } catch (err) {
    console.error("Error reading customers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//API get vouchers
app.get("/api/vouchers", async (req, res) => {
  try {
    const vouchers = await readVoucher();
    res.json({success: true, vouchers });
  } catch (err) {
    console.error("Error reading vouchers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//API create voucher
app.post("/api/voucher/create", async (req, res) => {
  const { code, reduction, startDate, endDate, quantity, conditions } = req.body; 
  if (!code || !reduction || !startDate || !endDate || !quantity || !conditions) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    await createVoucher(code, reduction, startDate, endDate, quantity, conditions);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));