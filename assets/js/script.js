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
            let starIcons = '';
            for (let i = 0; i < 5; i++) {
                starIcons += `<ion-icon name="${i < starRating ? 'star' : 'star-outline'}"></ion-icon>`;
            }

            // Destination card
            const destinationCard = document.createElement("li");
            destinationCard.innerHTML = `
                <div class="popular-card">
                    <figure class="card-img">
                        <img src="${destination.image || './assets/img/default-image.jpg'}" 
                             alt="${destination.country}" 
                             loading="lazy">
                    </figure>
                    <div class="card-content">
                        <div class="card-rating">${starIcons}</div>
                        <p class="card-subtitle"><a href="#">${destination.country}</a></p>
                        <h3 class="h3 card-title"><a href="#">${destination.city}</a></h3>
                        <p class="card-text">${destination.description || 'No description available.'}</p>
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

    if (!packageList) {
        console.error("Error: packageList element not found.");
        return;
    }

    let packages = [];

    // Fetch package data from the API and render it
    async function fetchPackages() {
        try {
            const response = await fetch("http://localhost:3000/package");
            packages = await response.json();
            renderPackages();
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    }

    // Render packages in the UI
    function renderPackages() {
        packageList.innerHTML = "";

        if (packages.length === 0) {
            packageList.innerHTML = `
                <li style="text-align: center;">No packages available</li>
            `;
            return;
        }

        packages.forEach((pkg) => {
            const starRating = pkg.starRating || 0;

            // Generate stars based on the star rating
            let starIcons = '';
            for (let i = 0; i < 5; i++) {
                starIcons += `<ion-icon name="${i < starRating ? 'star' : 'star-outline'}"></ion-icon>`;
            }

            // Package card
            const packageCard = document.createElement("li");
            packageCard.innerHTML = `
                <div class="package-card">
                    <figure class="card-banner">
                        <img src="${pkg.image || './assets/img/default-package.jpg'}" 
                             alt="${pkg.title}" 
                             loading="lazy" />
                    </figure>
                    <div class="card-content">
                        <h3 class="h3 card-title">${pkg.title || "Untitled Package"}</h3>
                        <p class="card-text">${pkg.description || "No description available."}</p>
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
                                    <p class="text">pax: ${pkg.maxPeople || "N/A"}</p>
                                </div>
                            </li>
                            <li class="card-meta-item">
                                <div class="meta-box">
                                    <ion-icon name="location"></ion-icon>
                                    <p class="text">${pkg.location || "Location Unknown"}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card-price">
                        <div class="wrapper">
                            <p class="reviews">(${pkg.reviews || 0} reviews)</p>
                            <div class="card-rating">${starIcons}</div>
                        </div>
                        <p class="price">
                            $${pkg.price || "N/A"} <span>/ per person</span>
                        </p>
                        <button class="btn btn-secondary book-now-btn" data-package-id="${pkg.id}">Book now</button>
                    </div>
                </div>
            `;
            packageList.appendChild(packageCard);
        });

        // Add event listeners to "Book now" buttons
    document.querySelectorAll(".book-now-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const packageId = event.target.getAttribute("data-package-id");
            await handleBooking(packageId);
        });
    });
    }

    // Initial fetch and render
    fetchPackages();
});

async function handleBooking(packageId) {
    // Check if accessToken exists in localStorage
    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve and parse user object

    if (!accessToken || !user || !user.id) {
        alert("Please log in to book a package.");
        window.location.href = "./login.html"; // Redirect to login page if not authenticated
        return;
    }

    // Prepare booking data
    const bookingData = {
        userId: user.id, // Assuming `id` is the key for userId in the user object
        packageId: +packageId,
    };

    try {
        // Send booking request to the server
        const response = await fetch("http://localhost:3000/booking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include token in header
            },
            body: JSON.stringify(bookingData),
        });

        // Check response status
        if (response.ok) {
            alert("Booking successful!");
        } else {
            const errorData = await response.json();
            alert(`Booking failed: ${errorData.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error during booking:", error);
        alert("An error occurred while booking. Please try again.");
    }
}


document.getElementById("tourSearchForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const destination = document.getElementById("destination").value;
    const pax = document.getElementById("people").value;

    try {
      // Fetch search results from the API
      const response = await fetch(`http://localhost:3000/package?title=${destination}&pax=${pax}`);
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
            <p>Description: ${result.description || "No description available"}</p>
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