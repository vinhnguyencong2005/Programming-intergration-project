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
                    <td>${item.Name}</td>
                    <td>${item.Price.toLocaleString()}</td>
                    <td>${item.Discount}</td>
                    <td>${item.Brand}</td>
                    <td>${item.Type}</td>
                    <td>${item.Stock}</td>
                    <td>Kho ${item.WarehouseID}</td>
                    <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    </td>
                </tr>
            `;
        })
        const htmls = stockItemArray.join("");
        stockTable.innerHTML = htmls;
    } else {
      console.log("No vehicles found");
    }
  } catch (error) {
    console.error("Error loading vehicles:", error);
  }
}

loadVehicles();