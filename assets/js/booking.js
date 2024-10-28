document.addEventListener("DOMContentLoaded", function () {
    const bookingTable = document.getElementById("sampleTable").querySelector("tbody");
    let bookings = [];
    let editingIndex = -1;

    // Fetch destinations from the API and render the table
    async function fetchBookings() {
        try {
            const response = await fetch("http://localhost:3000/booking");
            bookings = await response.json();
            renderTable();
        } catch (error) {
            console.error("Error fetching booking:", error);
        }
    }

    // Function to render destinations in the table
    function renderTable() {
        bookingTable.innerHTML = "";
        bookings.forEach((booking, index) => {
            const row = document.createElement("tr");

            console.log(booking);

        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.user.name}</td>
            <td>${booking.package.title}</td>
            <td>${booking.package.pax}</td>
            <td>${booking.package.location}</td>
            <td>${booking.package.price}</td>
            <td>
                <button class="action-button delete-button" onclick="deleteBooking(${index})">Delete</button>
            </td>
        `;

        // Append the row to the table body
        bookingTable.appendChild(row);
        });
    }

    // Delete destination
    window.deleteDestination = async function (index) {
        const destinationId = destinations[index].id;
        try {
            await fetch(`http://localhost:3000/booking/${destinationId}`, {
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
    fetchBookings();
});

// Function to book a package
async function bookPackage(packageId) {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ packageId })
        });

        if (response.ok) {
            alert('Booking successful!');
        } else {
            alert('Booking failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Render the table when the page loads
document.addEventListener('DOMContentLoaded', renderTable);
