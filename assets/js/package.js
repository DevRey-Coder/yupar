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
            row.innerHTML = `
                <td colspan="7" style="text-align: center;">No packages available</td>
            `;
            packageTable.appendChild(row);
            return;
        }

        packages.forEach((pkg, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${pkg.title}</td>
                <td>${pkg.population}</td>
                <td>${pkg.location}</td>
                <td>${pkg.starRating}</td>
                <td>${pkg.price}</td>
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

        const packageData = {
            title: document.getElementById("title").value,
            image: document.getElementById("image").value,
            description: document.getElementById("description").value,
            population: parseInt(document.getElementById("population").value),
            pax: parseInt(document.getElementById("pax").value),
            duration: document.getElementById("duration").value,
            location: document.getElementById("location").value,
            review: parseInt(document.getElementById("review").value),
            starRating: parseInt(document.getElementById("starRating").value),
            price: parseInt(document.getElementById("price").value)
        };

        if (editingIndex === -1) {
            // Add a new package via the API
            try {
                const response = await fetch("http://localhost:3000/package", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packageData)
                });
                const newPackage = await response.json();
                packages.push(newPackage);
            } catch (error) {
                console.error("Error adding package:", error);
            }
        } else {
            // Update an existing package via the API
            const packageId = packages[editingIndex].id;
            try {
                const response = await fetch(`http://localhost:3000/package/${packageId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packageData)
                });
                packages[editingIndex] = await response.json();
                editingIndex = -1;
            } catch (error) {
                console.error("Error updating package:", error);
            }
        }

        // Reset form and re-render table
        packageForm.reset();
        renderTable();
    });

    // Edit package
    window.editPackage = function (index) {
        editingIndex = index;
        const pkg = packages[index];
        document.getElementById("title").value = pkg.title;
        document.getElementById("image").value = pkg.image;
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
