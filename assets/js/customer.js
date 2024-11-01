document.addEventListener("DOMContentLoaded", function () {
    const destinationForm = document.getElementById("destinationForm");
    const destinationTable = document.getElementById("sampleTable").querySelector("tbody");
    let destinations = [];
    let editingIndex = -1;

    // Fetch destinations from the API and render the table
    async function fetchDestinations() {
        try {
            const response = await fetch("http://localhost:3000/destination");
            destinations = await response.json();
            renderTable();
        } catch (error) {
            console.error("Error fetching destinations:", error);
        }
    }

    // Function to render destinations in the table
    function renderTable() {
        destinationTable.innerHTML = "";

        if (destinations.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="7" style="text-align: center;">No destinations available</td>`;
            destinationTable.appendChild(row);
            return;
        }

        destinations.forEach((destination, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${destination.city}</td>
                <td>${destination.country}</td>
                <td>${destination.description || "Such a beatiful place"}</td>
                <td>${destination.starRating}</td>
                <td>
                    <button class="action-button update-button" onclick="editDestination(${index})">Update</button>
                    <button class="action-button delete-button" onclick="deleteDestination(${index})">Delete</button>
                </td>
            `;
            destinationTable.appendChild(row);
        });
    }

    // Handle form submission for adding or updating destinations
    destinationForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const city = document.getElementById("city").value;
        const country = document.getElementById("country").value;
        const description = document.getElementById("description").value;
        const starRating = document.getElementById("starRating").value;
        const imageFile = document.getElementById("image").files[0];

        const formData = new FormData();
        formData.append("city", city);
        formData.append("country", country);
        formData.append("description", description);
        formData.append("starRating", parseInt(starRating));
        if (imageFile) {
            formData.append("image", imageFile);
        }

        if (editingIndex === -1) {
            // Add a new destination via the API
            try {
                const response = await fetch("http://localhost:3000/destination", {
                    method: "POST",
                    body: formData
                });
                const newDestination = await response.json();
                destinations.push(newDestination);
            } catch (error) {
                console.error("Error adding destination:", error);
            }
        } else {
            // Update an existing destination via the API
            const destinationId = destinations[editingIndex].id;
            try {
                const response = await fetch(`http://localhost:3000/destination/${destinationId}`, {
                    method: "PATCH",
                    body: formData
                });
                destinations[editingIndex] = await response.json();
                editingIndex = -1;
            } catch (error) {
                console.error("Error updating destination:", error);
            }
        }

        // Reset form and re-render table
        destinationForm.reset();
        renderTable();
    });

    // Edit destination
    window.editDestination = function (index) {
        editingIndex = index;
        const destination = destinations[index];
        document.getElementById("city").value = destination.city;
        document.getElementById("country").value = destination.country;
        document.getElementById("description").value = destination.description || "";
        document.getElementById("starRating").value = destination.starRating;
    };

    // Delete destination
    window.deleteDestination = async function (index) {
        const destinationId = destinations[index].id;
        try {
            await fetch(`http://localhost:3000/destination/${destinationId}`, {
                method: "DELETE"
            });
            destinations.splice(index, 1);
            renderTable();
        } catch (error) {
            console.error("Error deleting destination:", error);
        }
    };

    // Reset form and clear editing index
    window.resetForm = function () {
        destinationForm.reset();
        editingIndex = -1;
    };

    // Initial fetch and render
    fetchDestinations();
});
