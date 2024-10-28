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
                        <a href="./login.html" class="btn btn-secondary">Book now</a>
                    </div>
                </div>
            `;
            packageList.appendChild(packageCard);
        });
    }

    // Initial fetch and render
    fetchPackages();
});
