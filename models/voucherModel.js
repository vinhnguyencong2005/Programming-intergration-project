const conn = require('../config/db');

const voucherModel = {
    // Get all vouchers
    getAllVouchers: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    Code,
                    Reduction,
                    StartDate,
                    EndDate,
                    Quantity,
                    Conditions
                FROM Voucher
                ORDER BY EndDate DESC
            `;
            
            conn.query(sql, (err, results) => {
                if (err) {
                    console.error('Error getting all vouchers:', err);
                    return reject(err);
                }
                console.log('Vouchers retrieved:', results.length);
                resolve(results);
            });
        });
    },
    
    // Get voucher by code
    getVoucherByCode: (code) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Voucher WHERE Code = ?';
            
            conn.query(sql, [code], (err, results) => {
                if (err) {
                    console.error('Error getting voucher by code:', err);
                    return reject(err);
                }
                console.log('Voucher found:', results[0] ? 'Yes' : 'No');
                resolve(results[0] || null);
            });
        });
    },
    
    // Create new voucher
    createVoucher: (voucherData) => {
        return new Promise((resolve, reject) => {
            const { code, reduction, startDate, endDate, quantity, conditions } = voucherData;
            const sql = 'INSERT INTO Voucher (Code, Reduction, StartDate, EndDate, Quantity, Conditions) VALUES (?, ?, ?, ?, ?, ?)';
            
            conn.query(sql, [code, reduction, startDate, endDate, quantity, conditions], (err, results) => {
                if (err) {
                    console.error('Error creating voucher:', err);
                    return reject(err);
                }
                console.log('Voucher created:', results.affectedRows > 0);
                resolve(results.affectedRows > 0);
            });
        });
    },
    
    // Update voucher
    updateVoucher: (code, voucherData) => {
        return new Promise((resolve, reject) => {
            // Check if voucher exists first
            const checkSql = 'SELECT Code FROM Voucher WHERE Code = ?';
            
            conn.query(checkSql, [code], (err, results) => {
                if (err) {
                    console.error('Error checking voucher existence:', err);
                    return reject(err);
                }
                
                if (results.length === 0) {
                    console.log('Voucher not found:', code);
                    return resolve(false);
                }
                
                // Update voucher
                const { reduction, startDate, endDate, quantity, conditions } = voucherData;
                const updateSql = 'UPDATE Voucher SET Reduction = ?, StartDate = ?, EndDate = ?, Quantity = ?, Conditions = ? WHERE Code = ?';
                
                conn.query(updateSql, [reduction, startDate, endDate, quantity, conditions, code], (err, results) => {
                    if (err) {
                        console.error('Error updating voucher:', err);
                        return reject(err);
                    }
                    console.log('Voucher updated:', results.affectedRows > 0);
                    resolve(results.affectedRows > 0);
                });
            });
        });
    },
    
    // Delete voucher
    deleteVoucher: (code) => {
        return new Promise((resolve, reject) => {
            // Check if voucher exists first
            const checkSql = 'SELECT Code FROM Voucher WHERE Code = ?';
            
            conn.query(checkSql, [code], (err, results) => {
                if (err) {
                    console.error('Error checking voucher existence:', err);
                    return reject(err);
                }
                
                if (results.length === 0) {
                    console.log('Voucher not found:', code);
                    return resolve(false);
                }
                
                // Delete voucher
                const deleteSql = 'DELETE FROM Voucher WHERE Code = ?';
                
                conn.query(deleteSql, [code], (err, results) => {
                    if (err) {
                        console.error('Error deleting voucher:', err);
                        return reject(err);
                    }
                    console.log('Voucher deleted:', results.affectedRows > 0);
                    resolve(results.affectedRows > 0);
                });
            });
        });
    }
};

module.exports = voucherModel;
