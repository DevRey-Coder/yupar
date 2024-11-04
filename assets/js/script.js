document.addEventListener("DOMContentLoaded", async function () {
  const destinationList = document.getElementById("popular-list");

  if (!destinationList) {
    console.error("Error: destinationList element not found.");
    return; // Exit if the element isn't found
  }

  let destinations = [];

  // Fetch destinations from the API and render them
  async function fetchDestinations() {
    try {
      const response = await fetch("http://localhost:3000/destination");
      destinations = await response.json();
      renderDestinations();
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  }

  // Function to render destinations in the UI
  function renderDestinations() {
    destinationList.innerHTML = "";

    if (destinations.length === 0) {
      destinationList.innerHTML = `
                <li style="text-align: center;">No destinations available</li>
            `;
      return;
    }

    destinations.forEach((destination) => {
      const starRating = destination.starRating || 0;

      // Create the star icons based on star rating
      let starIcons = "";
      for (let i = 0; i < 5; i++) {
        starIcons += `<ion-icon name="${
          i < starRating ? "star" : "star-outline"
        }"></ion-icon>`;
      }

      // Destination card
      const destinationCard = document.createElement("li");
      destinationCard.innerHTML = `
                <div class="popular-card">
                    <figure class="card-img">
                        <img src="${
                          destination.image || "./assets/img/default-image.jpg"
                        }" 
                             alt="${destination.country}" 
                             loading="lazy">
                    </figure>
                    <div class="card-content">
                        <div class="card-rating">${starIcons}</div>
                        <p class="card-subtitle"><a href="#">${
                          destination.country
                        }</a></p>
                        <h3 class="h3 card-title"><a href="#">${
                          destination.city
                        }</a></h3>
                        <p class="card-text">${
                          destination.description || "No description available."
                        }</p>
                    </div>
                </div>
            `;

      destinationList.appendChild(destinationCard);
    });
  }

  // Initial fetch and render
  fetchDestinations();
});

document.addEventListener("DOMContentLoaded", async function () {
  const packageList = document.getElementById("packageList");
  const paymentModal = document.getElementById("paymentModal");
  const closeModal = document.querySelector(".close");
  const paymentForm = document.getElementById("paymentForm");

  if (!packageList) {
    console.error("Error: packageList element not found.");
    return;
  }

  let selectedPackageId = null; // Store selected package ID
  let packages = [];
  let userBookings = [];

  // Fetch package data from the API
  async function fetchPackages() {
    try {
      const response = await fetch("http://localhost:3000/package");
      packages = await response.json();
      await fetchUserBookings();
      renderPackages();
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  }

  // Fetch user's booking data from the API
  async function fetchUserBookings() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return; // User is not authenticated
    }

    try {
      const response = await fetch("http://localhost:3000/booking", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        userBookings = await response.json();
      } else {
        console.error("Error fetching user bookings:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  }

  // Render packages in the UI
  function renderPackages() {
    packageList.innerHTML = "";

    if (packages.length === 0) {
      packageList.innerHTML = `<li style="text-align: center;">No packages available</li>`;
      return;
    }

    packages.forEach((pkg) => {
      const starRating = pkg.starRating || 0;

      // Generate stars based on the star rating
      let starIcons = "";
      for (let i = 0; i < 5; i++) {
        starIcons += `<ion-icon name="${
          i < starRating ? "star" : "star-outline"
        }"></ion-icon>`;
      }

      // Check the booking state for this package
      const booking = userBookings.find((b) => b.packageId === pkg.id);
      let buttonText = "Book now";
      let buttonClass = "btn btn-secondary book-now-btn";

      if (booking) {
        if (booking.bookingState === "PENDING") {
          buttonText = "Pending";
          buttonClass = "btn btn-warning";
        } else if (booking.bookingState === "CONFIRMED") {
          buttonText = "Booked";
          buttonClass = "btn btn-success";
        }
      }

      // Create the package card
      const packageCard = document.createElement("li");
      packageCard.innerHTML = `
                <div class="package-card">
                    <figure class="card-banner">
                        <img src="${
                          pkg.image || "./assets/img/default-package.jpg"
                        }" 
                             alt="${pkg.title}" 
                             loading="lazy" />
                    </figure>
                    <div class="card-content">
                        <h3 class="h3 card-title">${
                          pkg.title || "Untitled Package"
                        }</h3>
                        <p class="card-text">${
                          pkg.description || "No description available."
                        }</p>
                        <ul class="card-meta-list">
                            <li class="card-meta-item">
                                <div class="meta-box">
                                    <ion-icon name="time"></ion-icon>
                                    <p class="text">${pkg.duration || "N/A"}</p>
                                </div>
                            </li>
                            <li class="card-meta-item">
                                <div class="meta-box">
                                    <ion-icon name="people"></ion-icon>
                                    <p class="text">pax: ${pkg.pax || "N/A"}</p>
                                </div>
                            </li>
                            <li class="card-meta-item">
                                <div class="meta-box">
                                    <ion-icon name="location"></ion-icon>
                                    <p class="text">${
                                      pkg.location || "Location Unknown"
                                    }</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card-price">
                        <div class="wrapper">
                            <p class="reviews">(${pkg.review || 0} reviews)</p>
                            <div class="card-rating">${starIcons}</div>
                        </div>
                        <p class="price">$${
                          pkg.price || "N/A"
                        } <span>/ per person</span></p>
                        <button class="${buttonClass}" data-package-id="${
        pkg.id
      }">${buttonText}</button>
                    </div>
                </div>
            `;
      packageList.appendChild(packageCard);
    });

    // Add event listeners to "Book now" buttons
    document.querySelectorAll(".book-now-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        selectedPackageId = event.target.getAttribute("data-package-id");
        openPaymentModal();
      });
    });
  }

  // Function to handle booking a package
  async function handleBooking(packageId, paymentMethod) {
    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!accessToken || !user || !user.id) {
      showToast("Please log in to book a package.", "error");
      window.location.href = "./login.html";
      return;
    }

    if (!paymentMethod) {
      showToast("Please select a payment method.", "error");
      openPaymentModal(); // Ensure the modal is opened if payment method is not selected
      return;
    }

    // Include bookingState in the booking data
    const bookingData = {
      userId: user.id,
      packageId: +packageId,
      paymentMethod,
      bookingState: "PENDING", // Set the initial booking state to "PENDING"
    };

    try {
      const response = await fetch("http://localhost:3000/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        showToast("Booking is pending. Please wait for admin confirmation.", "warning");
        await fetchPackages(); // Re-fetch packages to update booking state
      } else if (response.status === 401) {
        showToast("Unauthorized: Please log in again.", "error");
        window.location.href = "./login.html";
      } else {
        const errorData = await response.json();
        showToast(
          `Booking failed: ${errorData.message || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error during booking:", error);
      showToast("An error occurred while booking. Please try again.", "error");
    }
  }

  // Open the payment method modal
  function openPaymentModal() {
    paymentModal.style.display = "block";
  }

  // Close the payment method modal
  closeModal.addEventListener("click", () => {
    paymentModal.style.display = "none";
  });

  // Handle the payment form submission
  paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    await handleBooking(selectedPackageId, paymentMethod);
    paymentModal.style.display = "none"; // Close the modal
  });

  // Initial fetch and render
  fetchPackages();
});

document
  .getElementById("tourSearchForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const destination = document.getElementById("destination").value;
    const pax = document.getElementById("people").value;

    try {
      // Fetch search results from the API
      const response = await fetch(
        `http://localhost:3000/package?title=${destination}&pax=${pax}`
      );
      const results = await response.json();

      // Display results in the UI
      const resultsContainer = document.getElementById("resultsContainer");
      const resultsList = document.getElementById("resultsList");
      resultsList.innerHTML = ""; // Clear previous results

      if (results.length > 0) {
        resultsContainer.style.display = "block";
        results.forEach((result) => {
          const resultItem = document.createElement("li");
          resultItem.className = "result-item";
          resultItem.innerHTML = `
            <h4>${result.title}</h4>
            <p>Pax: ${result.pax}</p>
            <p>Description: ${
              result.description || "No description available"
            }</p>
          `;
          resultsList.appendChild(resultItem);
        });
      } else {
        resultsContainer.style.display = "block";
        resultsList.innerHTML = "<li>No results found</li>";
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  });

// Toast function
function showToast(message, type) {
  const toast = document.getElementById("custom-toast");
  toast.textContent = message;
  toast.className = `custom-toast ${type} show`; // Add type and show class

  // Make the toast visible
  toast.classList.remove("hidden");

  // Hide the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 300); // Wait for the fade-out transition
  }, 3000);
}
