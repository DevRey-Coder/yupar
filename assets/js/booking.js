document.addEventListener("DOMContentLoaded", function () {
  const bookingTable = document
    .getElementById("sampleTable")
    .querySelector("tbody");
  let bookings = [];
  let editingIndex = -1;

  // Fetch bookings from the API and render the table
  async function fetchBookings() {
    try {
      const token = localStorage.getItem("accessToken"); // Get token if needed
      const response = await fetch("http://localhost:3000/booking", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        bookings = await response.json();
        renderTable();
      } else {
        console.error("Failed to fetch bookings:", response.statusText);
        alert("Please log in to view bookings.");
        window.location.href = "login.html"; // Redirect if unauthorized
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    }
  }

  // Function to render bookings in the table
  function renderTable() {
    bookingTable.innerHTML = ""; // Clear existing rows

    if (bookings.length === 0) {
      // Display message when there are no bookings
      const row = document.createElement("tr");
      row.innerHTML = `
                <td colspan="8" style="text-align: center;">No bookings available</td>
            `;
      bookingTable.appendChild(row);
      return;
    }

    bookings.forEach((booking, index) => {
      const row = document.createElement("tr");

      // Determine the action button HTML based on booking state
      const confirmButton =
        booking.bookingState === "PENDING"
          ? `<button class="action-button update-button" onclick="updateBooking(${index})">Confirm</button>`
          : "";

      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${booking.user.name}</td>
                <td>${booking.package.title}</td>
                <td>${booking.package.pax}</td>
                <td>${booking.package.location}</td>
                <td>${booking.package.price * booking.package.pax}</td>
                <td>${booking.bookingState}</td>
                <td>
                    ${confirmButton}
                    <button class="action-button delete-button" onclick="deleteBooking(${index})">Delete</button>
                </td>
            `;

      // Append the row to the table body
      bookingTable.appendChild(row);
    });
  }

  // Update booking state to "CONFIRMED"
  window.updateBooking = async function (index) {
    const bookingId = bookings[index].id;
    const token = localStorage.getItem("accessToken"); // Authorization token

    try {
      const response = await fetch(
        `http://localhost:3000/booking/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingState: "CONFIRMED" }),
        }
      );

      if (response.ok) {
        // Update the local booking state and re-render the table
        bookings[index].bookingState = "CONFIRMED";
        renderTable();
        alert("Booking confirmed successfully!");
      } else {
        console.error("Failed to update booking:", response.statusText);
        alert("Failed to confirm the booking. Please try again.");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("An error occurred while confirming the booking.");
    }
  };

  // Delete booking
  window.deleteBooking = async function (index) {
    const bookingId = bookings[index].id;
    try {
      const token = localStorage.getItem("accessToken"); // Authorization token
      await fetch(`http://localhost:3000/booking/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      bookings.splice(index, 1);
      renderTable();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  // Initial fetch and render
  fetchBookings();
});
