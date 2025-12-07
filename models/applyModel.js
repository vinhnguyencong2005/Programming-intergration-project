const conn = require('../config/db');

// Apply Model - for applying vouchers to orders
const applyModel = {
    // CREATE - Apply voucher to order
    applyVoucherToOrder: (orderID, voucherCode) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Apply (OrderID, VoucherCode) VALUES (?, ?)';
            
            conn.query(sql, [orderID, voucherCode], (err, result) => {
                if (err) {
                    console.error('Error applying voucher to order:', err.message);
                    reject(err);
                } else {
                    console.log(`Voucher ${voucherCode} applied to Order ${orderID}`);
                    resolve(result);
                }
            });
        });
    },

    // READ - Get voucher for order
    getVoucherForOrder: (orderID) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT a.OrderID, a.VoucherCode, v.Reduction, v.Conditions
                FROM Apply a
                INNER JOIN Voucher v ON a.VoucherCode = v.Code
                WHERE a.OrderID = ?
            `;
            
            conn.query(sql, [orderID], (err, results) => {
                if (err) {
                    console.error('Error getting voucher for order:', err.message);
                    reject(err);
                } else {
                    resolve(results[0] || null);
                }
            });
        });
    },

    // DELETE - Remove voucher from order
    removeVoucherFromOrder: (orderID) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Apply WHERE OrderID = ?';
            
            conn.query(sql, [orderID], (err, result) => {
                if (err) {
                    console.error('Error removing voucher from order:', err.message);
                    reject(err);
                } else {
                    console.log(`Voucher removed from Order ${orderID}`);
                    resolve(result);
                }
            });
        });
    }
};

module.exports = applyModel;
