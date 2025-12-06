const conn = require('../config/db');

// Admin Model
const adminModel = {
    // Get dashboard statistics
    getDashboardStats: () => {
        return new Promise((resolve, reject) => {
            // Total revenue from accepted orders
            const revenueSql = 'SELECT SUM(GrandTotal) as totalRevenue FROM Orders WHERE Status = "Accepted"';
            
            conn.query(revenueSql, (err, revenueResult) => {
                if (err) {
                    console.error('Error getting revenue:', err.message);
                    reject(err);
                    return;
                }
                
                // Total orders by status
                const ordersSql = `
                    SELECT 
                        COUNT(*) as totalOrders,
                        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
                        SUM(CASE WHEN Status = 'Accepted' THEN 1 ELSE 0 END) as acceptedOrders,
                        SUM(CASE WHEN Status = 'Cancel' THEN 1 ELSE 0 END) as canceledOrders
                    FROM Orders
                `;
                
                conn.query(ordersSql, (err, ordersResult) => {
                    if (err) {
                        console.error('Error getting orders:', err.message);
                        reject(err);
                        return;
                    }
                    
                    // Total customers
                    const customersSql = 'SELECT COUNT(*) as totalCustomers FROM Customer';
                    
                    conn.query(customersSql, (err, customersResult) => {
                        if (err) {
                            console.error('Error getting customers:', err.message);
                            reject(err);
                            return;
                        }
                        
                        // Total products
                        const productsSql = 'SELECT COUNT(*) as totalProducts FROM Vehicle';
                        
                        conn.query(productsSql, (err, productsResult) => {
                            if (err) {
                                console.error('Error getting products:', err.message);
                                reject(err);
                                return;
                            }
                            
                            const stats = {
                                totalRevenue: revenueResult[0].totalRevenue || 0,
                                totalOrders: ordersResult[0].totalOrders || 0,
                                pendingOrders: ordersResult[0].pendingOrders || 0,
                                acceptedOrders: ordersResult[0].acceptedOrders || 0,
                                canceledOrders: ordersResult[0].canceledOrders || 0,
                                totalCustomers: customersResult[0].totalCustomers || 0,
                                totalProducts: productsResult[0].totalProducts || 0
                            };
                            
                            console.log('Dashboard stats retrieved successfully');
                            resolve(stats);
                        });
                    });
                });
            });
        });
    },
    
    // Get all orders with customer info
    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    o.OrderID,
                    o.Status,
                    o.CreateDate,
                    o.Total,
                    o.GrandTotal,
                    o.CustomerID,
                    c.Name as customerName,
                    c.Phone as customerPhone,
                    c.Email as customerEmail,
                    c.Address as customerAddress
                FROM Orders o
                JOIN Customer c ON o.CustomerID = c.ID
                ORDER BY o.CreateDate DESC
            `;
            
            conn.query(sql, (err, results) => {
                if (err) {
                    console.error('Error getting orders:', err.message);
                    reject(err);
                } else {
                    console.log(`Retrieved ${results.length} orders`);
                    resolve(results);
                }
            });
        });
    },
    
    // Get inventory (vehicles with stock info)
    getInventory: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    v.VehicleID,
                    v.Name,
                    v.Brand,
                    v.Type,
                    v.Price,
                    v.Discount,
                    v.Stock,
                    v.WarehouseID,
                    w.Address as warehouseAddress,
                    (SELECT ImageLink FROM Images WHERE VehicleID = v.VehicleID AND ImagePriority = 1 LIMIT 1) as imageUrl
                FROM Vehicle v
                LEFT JOIN Warehouse w ON v.WarehouseID = w.WarehouseID
                ORDER BY v.Stock ASC
            `;
            
            conn.query(sql, (err, results) => {
                if (err) {
                    console.error('Error getting inventory:', err.message);
                    reject(err);
                } else {
                    console.log(`Retrieved ${results.length} vehicles`);
                    resolve(results);
                }
            });
        });
    },
    
    // Update vehicle stock
    updateStock: (vehicleId, newStock) => {
        return new Promise((resolve, reject) => {
            // Check if vehicle exists first
            const checkSql = 'SELECT * FROM Vehicle WHERE VehicleID = ?';
            
            conn.query(checkSql, [vehicleId], (err, results) => {
                if (err) {
                    console.error('Error checking vehicle:', err.message);
                    reject(err);
                    return;
                }
                
                if (results.length === 0) {
                    const error = new Error(`Vehicle with ID ${vehicleId} does not exist`);
                    console.error(error.message);
                    reject(error);
                    return;
                }
                
                // Update stock
                const updateSql = 'UPDATE Vehicle SET Stock = ? WHERE VehicleID = ?';
                
                conn.query(updateSql, [newStock, vehicleId], (err, result) => {
                    if (err) {
                        console.error('Update stock failed:', err.message);
                        reject(err);
                    } else {
                        console.log(`Vehicle ${vehicleId} stock updated to ${newStock}`);
                        resolve(result);
                    }
                });
            });
        });
    }
};

module.exports = adminModel;
