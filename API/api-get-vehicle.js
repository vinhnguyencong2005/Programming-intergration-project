import { readVehicle } from "../Jsproject/vehiclemodel.js";

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