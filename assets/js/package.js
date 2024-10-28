document.addEventListener("DOMContentLoaded", function () {
    const packageForm = document.getElementById("packageForm");
    const packageTable = document.getElementById("packageTable").querySelector("tbody");
    let packages = [];
    let editingIndex = -1;

    // Fetch packages from the API and render the table
    async function fetchPackages() {
        try {
            const response = await fetch("http://localhost:3000/package");
            packages = await response.json();
            renderTable();
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    }

    // Function to render packages in the table
    function renderTable() {
        packageTable.innerHTML = "";

        if (packages.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="7" style="text-align: center;">No packages available</td>`;
            packageTable.appendChild(row);
            return;
        }

        packages.forEach((pkg, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${pkg.title || ''}</td>
                <td>${pkg.population || ''}</td>
                <td>${pkg.location || ''}</td>
                <td>${pkg.starRating || ''}</td>
                <td>${pkg.pax * pkg.price || ''}</td>
                <td>
                    <button class="action-button update-button" onclick="editPackage(${index})">Update</button>
                    <button class="action-button delete-button" onclick="deletePackage(${index})">Delete</button>
                </td>
            `;
            packageTable.appendChild(row);
        });
    }

    // Handle form submission for adding or updating packages
    packageForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(packageForm); // Use FormData to handle file input
        const packageData = {
            title: formData.get("title"),
            description: formData.get("description"),
            population: parseInt(formData.get("population")),
            pax: parseInt(formData.get("pax")),
            duration: formData.get("duration"),
            location: formData.get("location"),
            review: parseInt(formData.get("review")),
            starRating: parseInt(formData.get("starRating")),
            price: parseInt(formData.get("price"))
        };

        // Handling image file if present
        if (formData.get("image").size > 0) {
            packageData.image = formData.get("image"); // Directly add file to FormData
        }

        // Condition to add or update package
        const url = editingIndex === -1 ? "http://localhost:3000/package" : `http://localhost:3000/package/${packages[editingIndex].id}`;
        const method = editingIndex === -1 ? "POST" : "PATCH";

        try {
            const response = await fetch(url, {
                method: method,
                body: formData, // Directly send FormData
            });
            const result = await response.json();

            if (editingIndex === -1) {
                packages.push(result);
            } else {
                packages[editingIndex] = result;
                editingIndex = -1;
            }

            packageForm.reset();
            renderTable();
        } catch (error) {
            console.error("Error submitting package:", error);
        }
    });

    // Edit package
    window.editPackage = function (index) {
        editingIndex = index;
        const pkg = packages[index];
        document.getElementById("title").value = pkg.title;
        document.getElementById("description").value = pkg.description || "";
        document.getElementById("population").value = pkg.population;
        document.getElementById("pax").value = pkg.pax;
        document.getElementById("duration").value = pkg.duration;
        document.getElementById("location").value = pkg.location;
        document.getElementById("review").value = pkg.review;
        document.getElementById("starRating").value = pkg.starRating;
        document.getElementById("price").value = pkg.price;
    };

    // Delete package
    window.deletePackage = async function (index) {
        const packageId = packages[index].id;
        try {
            await fetch(`http://localhost:3000/package/${packageId}`, {
                method: "DELETE"
            });
            packages.splice(index, 1);
            renderTable();
        } catch (error) {
            console.error("Error deleting package:", error);
        }
    };

    // Reset form and clear editing index
    window.resetForm = function () {
        packageForm.reset();
        editingIndex = -1;
    };

    // Initial fetch and render
    fetchPackages();
});