// Admin Reports JavaScript

let allReports = [];
let currentReportId = null;
const reportDetailsModal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));

// Logout function - make it global
window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
    }
};

// Load reports on page load
window.addEventListener('DOMContentLoaded', () => {
    loadReports();
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredReports = allReports.filter(report => 
        report.Title.toLowerCase().includes(searchTerm) ||
        report.customerName.toLowerCase().includes(searchTerm) ||
        report.Information.toLowerCase().includes(searchTerm)
    );
    displayReports(filteredReports);
});

async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        if (data.success) {
            allReports = data.data;
            displayReports(allReports);
            updateStatistics(allReports);
        }
    } catch (error) {
        console.error('Load reports error:', error);
    }
}

function updateStatistics(reports) {
    // Total reports
    document.getElementById('totalReports').textContent = reports.length;
    
    // Today's reports
    // const today = new Date().toDateString();
    // const todayReports = reports.filter(r => new Date(r.Date).toDateString() === today);
    // document.getElementById('todayReports').textContent = todayReports.length;
    
    // Unique customers
    const uniqueCustomers = new Set(reports.map(r => r.CustomerID)).size;
    document.getElementById('uniqueCustomers').textContent = uniqueCustomers;
}

function displayReports(reports) {
    const tbody = document.getElementById('reportsTable');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có báo cáo</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td><strong>#${report.ReportID}</strong></td>
            <td>
                <strong>${report.Title}</strong><br>
                <small class="text-muted">${truncateText(report.Information, 50)}</small>
            </td>
            <td>
                <strong>${report.customerName}</strong><br>
                <small class="text-muted">ID: ${report.CustomerID}</small>
            </td>
            <td>
                <small>
                    <i class="fas fa-phone me-1"></i>${report.customerPhone || 'N/A'}<br>
                    <i class="fas fa-envelope me-1"></i>${report.customerEmail || 'N/A'}
                </small>
            </td>
            <td>${formatDateTime(report.Date)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewReportDetails(${report.ReportID})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteReport(${report.ReportID})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewReportDetails(reportId) {
    try {
        const response = await fetch(`/api/reports/${reportId}`);
        const data = await response.json();
        
        if (data.success) {
            currentReportId = reportId;
            displayReportDetails(data.data);
            reportDetailsModal.show();
        }
    } catch (error) {
        console.error('View report details error:', error);
        alert('Có lỗi xảy ra');
    }
}

function displayReportDetails(report) {
    document.getElementById('reportDetailsContent').innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Mã báo cáo:</strong> #${report.ReportID}</p>
                <p><strong>Ngày gửi:</strong> ${formatDateTime(report.Date)}</p>
                <p><strong>Tiêu đề:</strong> ${report.Title}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Khách hàng:</strong> ${report.customerName}</p>
                <p><strong>Số điện thoại:</strong> ${report.customerPhone || 'N/A'}</p>
                <p><strong>Email:</strong> ${report.customerEmail || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${report.customerAddress || 'N/A'}</p>
            </div>
        </div>
        
        <hr>
        
        <h6 class="mb-3">Nội dung báo cáo:</h6>
        <div class="p-3 bg-light rounded">
            <p class="mb-0" style="white-space: pre-wrap;">${report.Information}</p>
        </div>
    `;
}

function confirmDeleteReport(reportId) {
    if (confirm('Bạn có chắc muốn xóa báo cáo này?')) {
        deleteReport(reportId);
    }
}

document.getElementById('deleteReportBtn').addEventListener('click', () => {
    if (currentReportId && confirm('Bạn có chắc muốn xóa báo cáo này?')) {
        deleteReport(currentReportId);
    }
});

async function deleteReport(reportId) {
    try {
        const response = await fetch(`/api/reports/${reportId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Xóa báo cáo thành công');
            reportDetailsModal.hide();
            loadReports(); // Reload the list
        } else {
            alert('Có lỗi xảy ra: ' + (data.message || 'Vui lòng thử lại'));
        }
    } catch (error) {
        console.error('Delete report error:', error);
        alert('Có lỗi xảy ra khi xóa báo cáo');
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
