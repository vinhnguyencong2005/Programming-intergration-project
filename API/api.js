
import { readCustomer } from "../Jsproject/usermodel.js";
import { readVehicle } from "../Jsproject/vehiclemodel.js";
import { createCartItem } from "../Jsproject/cartItemmodel.js"; 
import { readCartItem } from "../Jsproject/cartItemmodel.js";
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

app.get("/api/vehicle", async (req, res) => {
  res.send("<h1>Trang sản phẩm</h1>");
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




app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
