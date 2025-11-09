function ShowContent(id) {
    document.querySelectorAll('.content').forEach(div =>

        {div.style.display = "none";}
    );


    document.getElementById(id).style.display = "block";
}


function toggleAddForm() {
    document.getElementById("add-form").style.display = "block";
}


function Add_new_prod() {
    const id = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const discount = document.getElementById("discount").value;
    const brand = document.getElementById("brand").value;
    const category = document.getElementById("category").value;
    const quantity = document.getElementById("quantity").value;
    const warehouse = document.getElementById("warehouse").value;
    const description = document.getElementById("description").value;

    if(id&&name&&price&&brand&&category&&quantity&&warehouse&&description) {
        const body = document.getElementById("stock-body");
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${Number(price).toLocaleString()}</td>
            <td>${discount || 0}%</td>
            <td>${brand}</td>
            <td>${category}</td>
            <td>${quantity}</td>
            <td>${warehouse}</td>
            <td>${description}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        body.appendChild(newRow);

        document.getElementById("id").value = "";
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("discount").value = "";
        document.getElementById("brand").value = "";
        document.getElementById("category").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("warehouse").value = "";
        document.getElementById("description").value = "";

        alert("Add successfully");
    }

    else {
        alert("Warning! You need to fill out all information!");
    }

}

function NewURL() {
  const url_class = document.getElementById("url-image");

  // Tạo input mới
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.placeholder = "Enter the url of product's image";
 

  // Thêm vào div trước nút Add another image
  url_class.insertBefore(newInput, url_class.querySelector(".add-img-btn"));
}

async function loadVehicles() {
  try {
    const response = await fetch("http://localhost:3000/api/vehicle");
    const data = await response.json();

    if (data.success) {
        const stockTable = document.getElementById("stock-body");
        let count = 1;
        const stockItemArray = data.vehicles.map((item) => {
            return `
                <tr>
                    <td>${count++}</td>
                    <td>${item.VehicleID}</td>
                    <td>${item.Name}</td>
                    <td>${item.Price.toLocaleString()}</td>
                    <td>${item.Discount}</td>
                    <td>${item.Brand}</td>
                    <td>${item.Type}</td>
                    <td>${item.Stock}</td>
                    <td>Kho ${item.WarehouseID}</td>
                    <td>
                    <button class="edit-btn">Edit</button>
                    <button onclick="deleteVehicle('${item.VehicleID}',this)" class="delete-btn">Delete</button>
                    </td>
                </tr>
            `;
        })
        let htmls = stockItemArray.join("");
        stockTable.innerHTML = htmls;

    } else {
      console.log("No vehicles found");
    }
  } catch (error) {
    console.error("Error loading vehicles:", error);
  }
}

loadVehicles();

async function deleteVehicle(vehicleID, button) {
    if (!confirm("Bạn có chắc muốn xóa xe này không?")) return;
    try {
    const res = await fetch("http://localhost:3000/api/vehicle/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleID })
    });
        const result = await res.json();
        if (result.success) {
            button.parentElement.parentElement.remove();
            alert("Đã xóa thành công!")
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Không thể kết nối tới server!");
    }
}

async function loadCustomers() {
  try {
    const response = await fetch("http://localhost:3000/api/customers");
    const data = await response.json();

    if (data.success) {
        const customerTable = document.getElementById("customer-body");
        const customerArray = data.customers.map((item) => {
            return `
                <tr>
                    <td>${item.ID}</td>
                    <td>${item.Name}</td>
                    <td>${item.Phone}</td>
                    <td>${item.Address}</td>
                    <td>${item.CreateDate}</td>
                    <td> -- </td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                </tr>
            `;
        })
        let htmls = customerArray.join("");
        customerTable.innerHTML = htmls;

    } else {
      console.log("No customers found");
    }
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

loadCustomers();


async function loadVoucher() {
  try {
    const response = await fetch("http://localhost:3000/api/vouchers");
    const data = await response.json();

    if (data.success) {
        const voucherTable = document.getElementById("voucher-body");
        const voucherArray = data.vouchers.map((item) => {
            return `
                <tr>
                    <td>${item.Code}</td>
                    <td>${item.Reduction.toLocaleString()}</td>
                    <td>${item.StartDate}</td>
                    <td>${item.EndDate}</td>
                    <td>${item.Quantity}</td>
                    <td>${item.Conditions}</td>
                    <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    </td>
                </tr>
            `;
        })
        let htmls = voucherArray.join("");
        voucherTable.innerHTML = htmls;

    } else {
      console.log("No vouchers found");
    }
  } catch (error) {
    console.error("Error loading vouchers:", error);
  }
}

loadVoucher();

document.querySelector(".voucher-form .add-btn").addEventListener("click", async (event) => {
    event.preventDefault();
    const code = document.getElementById("voucher-code").value.trim();
    const reduction = document.getElementById("voucher-discount").value.trim();
    const startDate = document.getElementById("voucher-start").value.trim();
    const endDate = document.getElementById("voucher-end").value.trim();
    const quantity = document.getElementById("voucher-quantity").value.trim();
    const conditions = document.getElementById("voucher-min").value.trim();
    console.log(code, reduction, startDate, endDate, quantity, conditions);
    try {
    const response = await fetch("http://localhost:3000/api/voucher/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, reduction, startDate, endDate,  quantity, conditions })
    });
        const result = await response.json();
        if (result.success) {
            alert("Voucher created successfully!");
            loadVoucher(); // Reload voucher list
        } else {
            alert("Failed to create voucher: " + result.message);
        }
    } catch (error) {
        console.error("Error creating voucher:", error);
        alert("Could not connect to server!");
    }
});