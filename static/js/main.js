document.addEventListener("DOMContentLoaded", () => {
  let currentView = "india";
  let plantData = {};
  let currentChart = null;

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  // This stateListContainer will be hidden and only used when triggered from the context menu
  const stateListContainer = document.getElementById("state-list-container");
  stateListContainer.style.maxHeight = "400px";
  stateListContainer.style.overflowY = "scroll";
  stateListContainer.style.border = "1px solid #ccc";
  stateListContainer.style.padding = "10px";
  stateListContainer.style.margin = "20px auto";
  stateListContainer.style.width = "300px";
  stateListContainer.style.backgroundColor = "#f9f9f9";
  stateListContainer.style.display = "none"; // Initially hidden

  const stateButtons = [];
  states.forEach((state) => {
    const stateButton = document.createElement("div");
    stateButton.className = "state-button";
    stateButton.innerHTML = `
            <span>${state}</span>
            <button class="view-details-btn">View Details</button>
        `;

    const viewDetailsBtn = stateButton.querySelector(".view-details-btn");
    viewDetailsBtn.onclick = () => {
      fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            showStateDetails(state, data);
          }
        })
        .catch((error) => console.error("Error fetching biomass data:", error));
    };
    stateButtons.push(stateButton);
    stateListContainer.appendChild(stateButton);
  });

  function showStateDetails(state, data) {
    const modal = document.getElementById("biomass-modal") || createModal();

    // Format the state data into an HTML table
    // Format the state data into an HTML table
    const tableRows = data
      .map(
        (item, index) => `
    <tr>
        <td>${index === 0 ? "Total Biomass" : "Total Surplus"}</td>
        <td>${item["Wheat"] || "N/A"}</td>
        <td>${item["Rice"] || "N/A"}</td>
        <td>${item["Maize"] || "N/A"}</td>
        <td>${item["Bajra"] || "N/A"}</td>
        <td>${item["Sugarcane"] || "N/A"}</td>
        <td>${item["Groundnut"] || "N/A"}</td>
        <td>${item["Rapeseed Mustard"] || "N/A"}</td>
        <td>${item["Arhar/Tur"] || "N/A"}</td>
        <td>${item["Total Crops"] || "N/A"}</td>
    </tr>
`
      )
      .join("");

    const content = `
    <div class="modal-content">
        <h3>${state} - Biomass Details</h3>
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th></th> 
                        <th>Wheat</th>
                        <th>Rice</th>
                        <th>Maize</th>
                        <th>Bajra</th>
                        <th>Sugarcane</th>
                        <th>Groundnut</th>
                        <th>Rapeseed Mustard</th>
                        <th>Arhar/Tur</th>
                        <th>Sum</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
         <p style="text-align: center; font-style: italic; margin-top: 10px;">* unit = 1000 tonnes per annum</p>
    </div>
`;

    modal.innerHTML = content;
    modal.id = "biomass-modal";
    modal.style.display = "block";
  }

  // New function to show all states biomass data in a modal
  function showAllStatesBiomassData() {
    // Create a modal specifically for the biomass state list
    const modal = document.createElement("div");
    modal.id = "biomass-states-modal";
    modal.className = "modal";
    modal.style.display = "block";
    modal.style.zIndex = "9999999";

    // Create modal content container
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.maxWidth = "600px";
    modalContent.style.padding = "20px";
    modalContent.style.margin = "50px auto";
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.borderRadius = "8px";
    modalContent.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

    // Add header and close button
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "20px";

    const title = document.createElement("h3");
    title.textContent = "Biomass Details by State";
    title.style.margin = "0";

    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontWeight = "bold";
    closeBtn.onclick = () => (modal.style.display = "none");

    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);

    // Create list of state buttons
    const stateList = document.createElement("div");
    stateList.style.maxHeight = "500px";
    stateList.style.overflowY = "auto";

    states.forEach((state) => {
      const stateButton = document.createElement("div");
      stateButton.className = "state-biomass-button";
      stateButton.style.display = "flex";
      stateButton.style.justifyContent = "space-between";
      stateButton.style.alignItems = "center";
      stateButton.style.padding = "10px";
      stateButton.style.margin = "5px 0";
      stateButton.style.borderBottom = "1px solid #eee";

      const stateName = document.createElement("span");
      stateName.textContent = state;

      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View Details";
      viewBtn.style.padding = "5px 10px";
      viewBtn.style.backgroundColor = "#4CAF50";
      viewBtn.style.color = "white";
      viewBtn.style.border = "none";
      viewBtn.style.borderRadius = "4px";
      viewBtn.style.cursor = "pointer";

      viewBtn.onclick = () => {
        // Close the state list modal
        modal.style.display = "none";

        // Fetch and display this state's biomass data
        fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
            } else {
              showStateDetails(state, data);
            }
          })
          .catch((error) =>
            console.error("Error fetching biomass data:", error)
          );
      };

      stateButton.appendChild(stateName);
      stateButton.appendChild(viewBtn);
      stateList.appendChild(stateButton);
    });

    modalContent.appendChild(stateList);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close when clicking outside
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  function toggleBiomassContainer(show) {
    const stateListContainer = document.getElementById("state-list-container");
    if (stateListContainer) {
      stateListContainer.style.display = "none"; // Always hide, we'll use the context menu option
    }
  }

  // Function to load biomass data for Odisha
  function loadOdishaBiomass() {
    fetch("/api/biomass/odisha")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching Odisha biomass data:", data.error);
        } else {
          displayOdishaBiomass(data);
        }
      })
      .catch((error) =>
        console.error("Error fetching Odisha biomass data:", error)
      );
  }

  // Function to display Odisha Biomass data
  function displayOdishaBiomass(data) {
    const odishaDistricts = document.querySelectorAll("[data-state='Odisha']");

    odishaDistricts.forEach((district) => {
      const districtName = district.getAttribute("data-district");
      const biomassData = data.find((d) => d.District.trim() === districtName);

      if (biomassData) {
        // Add new column dynamically
        district.innerHTML += `
        <div class="biomass-column">
          <h4>Biomass Details</h4>
          <p>Rice: ${biomassData.Rice || "N/A"}</p>
          <p>Wheat: ${biomassData.Wheat || "N/A"}</p>
          <p>Total Biomass: ${biomassData.Total || "N/A"}</p>
        </div>
      `;
      }
    });
  }

  // Highlight Odisha and bind hover event
  function highlightOdishaDistricts() {
    const odishaDistricts = document.querySelectorAll("[data-state='Odisha']");
    odishaDistricts.forEach((district) => {
      district.addEventListener("mouseover", () => {
        loadOdishaBiomass();
      });
    });
  }

  // Fetching plant data from backend
  fetch("/api/plants")
    .then((response) => response.json())
    .then((data) => {
      plantData = data;
      console.log("Loaded plant data:", plantData);
      loadIndiaMap();
      highlightStatesWithPlants(); // Highlight after data is loaded
      highlightOdishaDistricts();
    })
    .catch((error) => console.error("Error loading plant data:", error));
  // Added: Function to highlight districts with plants
  function highlightDistrictsWithPlants() {
    if (currentChart && plantData) {
      const series = currentChart.series[0];
      if (series) {
        series.data.forEach((point) => {
          const state = point.properties?.st_nm;
          const plants = plantData[state] || [];
          console.log(`Highlighting state: ${state}, Plants: ${plants.length}`);
          if (plants.length > 0) {
            point.update({ color: "#00FF00" }, true); // Highlight green
          } else {
            point.update({ color: "#EEEEEE" }, true); // Reset color
          }
        });
      }
    }
  }

  // Event listener for "plants" radio button
  const plantsRadioButton = document.getElementById("plants-radio"); // Assumes the radio button has an ID
  if (plantsRadioButton) {
    plantsRadioButton.addEventListener("change", () => {
      if (plantsRadioButton.checked) {
        highlightDistrictsWithPlants();
      }
    });
  }

  // Another trial of context menu for state

  function loadIndiaMap() {
    // Add this to loadIndiaMap function
    const bioMassDetailsHeader = document.getElementById("bioMassDetails");
    if (bioMassDetailsHeader) {
      bioMassDetailsHeader.style.display = "none"; // Hide the header completely
    }
    toggleBiomassContainer(false); // Always hide the container

    fetch("/static/geojson/india.json")
      .then((response) => response.json())
      .then((data) => {
        createMap(data);
        addContextMenuOption();
      })
      .catch((error) => console.error("Error loading India map:", error));
  }

  highlightDistrictsWithPlants();

  function calculateStateCentroid(stateFeature) {
    if (stateFeature.geometry.type === "Polygon") {
      const coordinates = stateFeature.geometry.coordinates[0];
      const len = coordinates.length;
      const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
      return [sumLon / len, sumLat / len];
    } else if (stateFeature.geometry.type === "MultiPolygon") {
      const polygons = stateFeature.geometry.coordinates;
      const allCoords = polygons.flat(2); // Flatten all polygons
      const len = allCoords.length;
      const sumLon = allCoords.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = allCoords.reduce((sum, coord) => sum + coord[1], 0);
      return [sumLon / len, sumLat / len];
    }
    return null;
  }

  function createMap(geoJson) {
    if (currentChart) {
      currentChart.destroy();
    }

    // Aggregate plant data by state
    const plantPoints = Object.values(plantData)
      .flat()
      .map((plant) => {
        return {
          name: plant["Sponge Iron Plant"] || "Unknown Plant",
          lon: parseFloat(plant["Longitude"]),
          lat: parseFloat(plant["Latitude"]),
          marker: {
            radius: 6,
            fillColor: "#FF0000",
            lineColor: "#fff",
            lineWidth: 2,
          },
        };
      });

    // Define states with biomass data
    const statesWithBiomass = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Goa",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
    ];

    // Create biomass points for all states with biomass data
    const biomassPoints = statesWithBiomass
      .map((state) => {
        const stateFeature = geoJson.features.find(
          (f) => f.properties.st_nm === state
        );
        if (stateFeature) {
          const coordinates = calculateStateCentroid(stateFeature);
          if (coordinates) {
            // Shift green dot slightly right
            return {
              name: state,
              lon: coordinates[0] + 0.2,
              lat: coordinates[1] + 0.2,
              marker: {
                radius: 8,
                fillColor: "#00FF00",
                lineColor: "#fff",
                lineWidth: 2,
              },
            };
          }
        }
        return null;
      })
      .filter((point) => point !== null);

    currentChart = Highcharts.mapChart("map-container", {
      chart: {
        map: geoJson,
        // Add context menu with biomass option
        events: {
          contextmenu: function (e) {
            // The default options from Highcharts
            if (!this.options.chart.contextMenu) {
              return;
            }
          },
        },
      },
      title: {
        text: "India Map With Plant and Biomass Locations",
      },
      subtitle: {
        text: "Red dots: Plants | Green dots: Biomass data <br><i>Click on a state name to open its map and see plants & biomass data.</i> <br><br> <small>Use the buttons below to toggle plant and biomass layers. You can view only plants, only biomass, both, or neither by selecting/deselecting them.</small>",
        useHTML: true, // Allows HTML formatting
      },
      mapNavigation: {
        enabled: true,
      },
      tooltip: {
        formatter: function () {
          const state = this.point.name || this.point.properties?.st_nm;

          if (this.point.series.name === "States with Biomass") {
            return `<b>${state}</b><br>Click to view biomass details`;
          } else if (this.point.series.name === "States") {
            // Show number of plants only when hovering over a state
            const plants = plantData[state] || [];
            return `<b>${state}</b><br>Number of Plants: ${plants.length}`;
          } else if (this.point.series.name === "Plant Locations") {
            // Show only the plant name when hovering over red dots
            return `<b>Plant:</b> ${this.point.name}`;
          } else {
            return `<b>${state}</b>`;
          }
        },
      },
      // Add custom Biomass Details option to the exporting menu
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "printChart",
              "separator",
              {
                text: "Biomass Details of State",
                onclick: function () {
                  showAllStatesBiomassData();
                },
              },
            ],
          },
        },
      },
      series: [
        {
          data: geoJson.features,
          name: "States",
          borderColor: "#000",
          borderWidth: 2,
          dataLabels: {
            enabled: true,
            format: "{point.properties.st_nm}",
            style: {
              fontWeight: "bold",
            },
          },
          point: {
            events: {
              click: function () {
                const stateName = this.properties.st_nm; // Get state name
                const plants = plantData[stateName];

                if (!stateName) return; // Prevents errors if no state name is found

                // Ensure clicking anywhere on the state (not just text) opens its map
                if (this.series.name === "States") {
                  if (!plants || plants.length === 0) {
                    alert("No plant data available for " + stateName);
                    return;
                  }

                  const stateFile = stateName.toLowerCase().replace(/\s+/g, "");
                  fetch(`/static/geojson/states/${stateFile}.json`)
                    .then((response) => response.json())
                    .then((stateData) => {
                      currentView = stateName;
                      createStateMap(stateData, plants, stateName);
                      createBackButton();
                    })
                    .catch((error) => {
                      console.error("Error loading state data:", error);
                      alert("Error loading map for " + stateName);
                    });
                }
              },
            },
          },
        },
        {
          id: "plants-series",
          type: "mappoint",
          name: "Plant Locations",
          data: plantPoints, // Now uses latitude/longitude instead of centroids
          color: "#FF0000",
          visible: true,
          dataLabels: {
            enabled: false,
          },
        },
        {
          id: "biomass-series",
          type: "mappoint",
          name: "States with Biomass",
          data: biomassPoints,
          color: "#00FF00",
          visible: true,
          dataLabels: {
            enabled: false,
          },
          point: {
            events: {
              click: function () {
                const state = this.name;
                fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.error) {
                      alert(data.error);
                    } else {
                      showStateDetails(state, data);
                    }
                  })
                  .catch((error) =>
                    console.error("Error fetching biomass data:", error)
                  );
              },
            },
          },
        },
      ],
    });

    return currentChart;
  }

  function toggleBiomassView() {
    if (currentChart) {
      const plantsSeries = currentChart.get("plants-series");
      const biomassSeries = currentChart.get("biomass-series");

      if (biomassSeries.visible) {
        // Switch to plants view
        plantsSeries.setVisible(true);
        biomassSeries.setVisible(false);
      } else {
        // Switch to biomass view
        plantsSeries.setVisible(false);
        biomassSeries.setVisible(true);
      }
    }
  }

  // Update the existing highlightStatesWithPlants function to handle both plants and biomass
  function highlightStatesWithPlants() {
    if (currentChart) {
      const plantsSeries = currentChart.get("plants-series");
      plantsSeries.setVisible(!plantsSeries.visible);
    }
  }

  function createStateMap(stateData, plants, stateName) {
    const bioMassDetailsHeader = document.getElementById("bioMassDetails");
    if (bioMassDetailsHeader) {
      bioMassDetailsHeader.style.display = "none";
    }

    if (currentChart) {
      currentChart.destroy();
    }
    // Extract plant locations using latitude & longitude for state-level map
    const plantPoints = plants.map((plant) => {
      return {
        name: plant["Sponge Iron Plant"] || "Unknown Plant",
        lon: parseFloat(plant["Longitude"]),
        lat: parseFloat(plant["Latitude"]),
        marker: {
          radius: 6,
          fillColor: "#FF0000",
          lineColor: "#fff",
          lineWidth: 2,
        },
      };
    });

    toggleBiomassContainer(false);

    // Normalize district names function
    const normalizeDistrictName = (name) => {
      if (!name) return "";
      // Add common variations of Sundargarh
      const variations = {
        sundergarh: "sundargarh",
        sundergarha: "sundargarh",
        sundargarha: "sundargarh",
        sondagarh: "sundargarh",
        sundargadh: "sundargarh",
      };

      const normalized = name.trim().toLowerCase();
      return variations[normalized] || normalized;
    };

    // Grouping plants by district with normalized names
    const plantsByDistrict = {};
    plants.forEach((plant) => {
      const rawDistrict = plant["City/ District"] || "Unknown";
      const district = normalizeDistrictName(rawDistrict);
      if (!plantsByDistrict[district]) {
        plantsByDistrict[district] = [];
      }
      plantsByDistrict[district].push(plant);

      // Debug log for Sundargarh related districts
      if (district.includes("sund") || district.includes("sond")) {
        console.log(
          "Found Sundargarh variation:",
          rawDistrict,
          "-> normalized to:",
          district
        );
      }
    });

    // Custom centroid calculation with special handling for Sundargarh
    function calculateDistrictCentroid(districtFeature) {
      const district = normalizeDistrictName(
        districtFeature.properties.district
      );

      // Debug log for Sundargarh district feature
      if (district.includes("sundargarh")) {
        console.log("Processing Sundargarh district feature:", districtFeature);
      }

      if (districtFeature.geometry.type === "Polygon") {
        const coordinates = districtFeature.geometry.coordinates[0];
        const len = coordinates.length;
        const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLon / len, sumLat / len];
      } else if (districtFeature.geometry.type === "MultiPolygon") {
        const polygons = districtFeature.geometry.coordinates;
        const allCoords = polygons.flat(2);
        const len = allCoords.length;
        const sumLon = allCoords.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = allCoords.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLon / len, sumLat / len];
      }
      return null;
    }

    // Getting districts with plants
    const districtsWithPlants = new Set(Object.keys(plantsByDistrict));

    // Preparing districts data with normalized names
    const districtsData = stateData.features.map((feature) => {
      const district = normalizeDistrictName(feature.properties.district);
      const districtPlants = plantsByDistrict[district] || [];
      return {
        ...feature,
        value: districtPlants.length,
        color: "#eee",
        plantsData: districtPlants,
        hasPlants: districtPlants.length > 0,
      };
    });

    // Enhanced offset calculation with special handling for Sundargarh
    const getOffsetCentroid = (centroid, isPlant, district) => {
      if (stateName === "Odisha") {
        const horizontalOffset = isPlant ? 0.05 : -0.05;
        const verticalOffset = isPlant ? 0.02 : -0.02;

        // Special handling for Sundargarh district
        if (normalizeDistrictName(district).includes("sundargarh")) {
          console.log("Applying offset for Sundargarh:", district, centroid);
        }

        return [centroid[0] + horizontalOffset, centroid[1] + verticalOffset];
      }
      return centroid;
    };

    currentChart = Highcharts.mapChart("map-container", {
      chart: {
        map: stateData,
        events: {
          load: function () {
            this.mapZoom(1.5);
          },
        },
      },
      title: {
        text: `${stateName} Districts`,
      },
      subtitle: {
        text: `Total Plants: ${plants.length} | Districts with Plants: ${districtsWithPlants.size} 
               <br><i>Click on District Name to see the availability of Biomass and Plants</i>`,
        useHTML: true, // Ensures HTML formatting works
      },
      mapNavigation: {
        enabled: true,
      },
      tooltip: {
        formatter: function () {
          const district =
            this.point.properties?.district?.trim() || this.point.district;
          const seriesName = this.series.name;

          if (seriesName === "Biomass Availability") {
            return `<b>${district}</b><br>Click here to view Biomass Availability`;
          }

          if (seriesName === "Sponge Iron Plants") {
            return `<b>Plant:</b> ${this.point.name}`; // Shows only plant name on hover
          }

          return `<b>${district}</b>`;
        },
      },
      series: [
        {
          name: "Districts",
          data: districtsData,
          borderColor: "#999",
          states: {
            hover: {
              color: "#90EE90",
            },
          },
          dataLabels: {
            enabled: true,
            format: "{point.properties.district}",
          },
          point: {
            events: {
              click: function () {
                const district = normalizeDistrictName(
                  this.properties.district
                );
                showDistrictDetails(district, plantsByDistrict[district] || []);
              },
            },
          },
        },
        {
          name: "Sponge Iron Plants",
          type: "mappoint",
          color: "#FF0000",
          data: plants.map((plant) => {
            return {
              name: plant["Sponge Iron Plant"] || "Unknown Plant",
              lon: parseFloat(plant["Longitude"]),
              lat: parseFloat(plant["Latitude"]),
              marker: {
                radius: 6,
                symbol: "circle",
                fillColor: "#FF0000",
                lineColor: "#fff",
                lineWidth: 2,
              },
            };
          }),
          dataLabels: {
            enabled: false,
          },
        },
        {
          name: "Biomass Availability",
          type: "mappoint",
          color: "#00FF00",
          visible: stateName === "Odisha",
          data: stateData.features
            .map((feature) => {
              const district = normalizeDistrictName(
                feature.properties.district
              );
              const centroid = calculateDistrictCentroid(feature);
              if (!centroid) return null;
              const offsetCentroid = getOffsetCentroid(
                centroid,
                false,
                district
              );
              return {
                name: district,
                lon: offsetCentroid[0],
                lat: offsetCentroid[1],
                district: district,
                marker: {
                  radius: 6,
                  symbol: "circle",
                  fillColor: "#00FF00",
                  lineColor: "#fff",
                  lineWidth: 2,
                },
              };
            })
            .filter((point) => point !== null),
          dataLabels: {
            enabled: false,
          },
          point: {
            events: {
              click: function () {
                const district = normalizeDistrictName(this.district);
                showDistrictDetails(district, plantsByDistrict[district] || []);
              },
            },
          },
        },
      ],
    });
  }
  highlightDistrictsWithPlants();

  // Function to show district details with both plant and biomass data
  // Modify the showDistrictDetails function to always show biomass data for Odisha districts:

  function showDistrictDetails(district, plants, isAllPlants = false) {
    const modal = document.getElementById("plantModal") || createModal();

    // Sort plants by name if they exist
    const sortedPlants = plants?.length
      ? [...plants].sort((a, b) =>
          (a["Sponge Iron Plant"] || "").localeCompare(
            b["Sponge Iron Plant"] || ""
          )
        )
      : [];

    // Create plants table if there are plants
    const plantsTable =
      sortedPlants.length > 0
        ? sortedPlants
            .map((plant) => {
              const details = Object.entries(plant)
                .filter(
                  ([key, value]) => value && value !== "N/A" && value !== ""
                )
                .map(
                  ([key, value]) => `
                  <tr>
                      <td class="key-column"><strong>${key}</strong></td>
                      <td class="value-column">${value}</td>
                  </tr>`
                )
                .join("");
              return `
              <div class="plant-entry">
                  <h4 class="plant-name">${
                    plant["Sponge Iron Plant"] || "Plant"
                  }</h4>
                  <table class="plant-details-table">
                      ${details}
                  </table>
              </div>
          `;
            })
            .join("")
        : "<p>No plant data available for this district</p>";

    // Always fetch biomass data for Odisha districts
    if (currentView === "Odisha") {
      fetch(`/api/odisha/districts/${district.toLowerCase()}`)
        .then((response) => response.json())
        .then((biomassData) => {
          const modalContent = `
          <div class="modal-content">
              <h2 class="district-title">${district} District Details</h2>
              <div class="three-column-container">
                  <!-- Plants Column -->
                  <div class="data-column plants-column">
                      <h3>Plants in ${district}</h3>
                      ${plantsTable}
                  </div>
      
                  <!-- DRI Plants Column (Duplicate of Plants Column) -->
                  <div class="data-column dri-plants-column">
                      <h3>DRI Plants in ${district}</h3>
                      ${plantsTable} 
                  </div>
      
                  <!-- Biomass Column - Always shown for Odisha -->
                  <div class="data-column biomass-column">
                      <h3>Biomass Data</h3>
                      ${
                        biomassData && biomassData.biomass
                          ? `
                          <div class="biomass-section">
                              <h4>Bioenergy Potential (GJ)</h4>
                              <table class="biomass-table">
                                  ${Object.entries(
                                    biomassData.biomass.bioenergy_potential
                                  )
                                    .map(
                                      ([key, value]) => `
                                          <tr>
                                              <td>${key
                                                .replace("_", " ")
                                                .toUpperCase()}:</td>
                                              <td>${
                                                value?.toFixed(2) || "0.00"
                                              }</td>
                                          </tr>
                                      `
                                    )
                                    .join("")}
                              </table>
                          </div>
                          <div class="biomass-section">
                              <h4>Gross Biomass (Kilo tonnes)</h4>
                              <table class="biomass-table">
                                  ${Object.entries(
                                    biomassData.biomass.gross_biomass
                                  )
                                    .map(
                                      ([key, value]) => `
                                          <tr>
                                              <td>${key
                                                .replace("_", " ")
                                                .toUpperCase()}:</td>
                                              <td>${
                                                value?.toFixed(2) || "0.00"
                                              }</td>
                                          </tr>
                                      `
                                    )
                                    .join("")}
                              </table>
                          </div>
                          <div class="biomass-section">
                              <h4>Surplus Biomass (Kilo tonnes)</h4>
                              <table class="biomass-table">
                                  ${Object.entries(
                                    biomassData.biomass.surplus_biomass
                                  )
                                    .map(
                                      ([key, value]) => `
                                          <tr>
                                              <td>${key
                                                .replace("_", " ")
                                                .toUpperCase()}:</td>
                                              <td>${
                                                value?.toFixed(2) || "0.00"
                                              }</td>
                                          </tr>
                                      `
                                    )
                                    .join("")}
                              </table>
                          </div>
                      `
                          : "<p>No biomass data available for this district</p>"
                      }
                  </div>
              </div>
          </div>

          <style>
              .three-column-container {
                  display: flex;
                  gap: 30px;
                  width 100%;
                  align-items: flex-start;
              }
              .data-column {
                  flex: 1;
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .data-column h3 {
                  margin-bottom: 10px;
              }
              .biomass-section, .plant-entry {
                  margin-bottom: 20px;
              }
          </style>

      `;

          modal.innerHTML = modalContent;
          modal.style.display = "block";
        })
        .catch((error) => {
          console.error("Error fetching biomass data:", error);
          showPlantOnlyDetails();
        });
    } else {
      showPlantOnlyDetails();
    }

    // Fallback for non-Odisha or failed data fetch
    function showPlantOnlyDetails() {
      const content = `
          <div class="modal-content">
              <h3>${
                isAllPlants ? "All Plants in State" : `Plants in ${district}`
              }</h3>
              <div class="district-plants">
                  ${plantsTable}
              </div>
          </div>`;
      modal.innerHTML = content;
      modal.style.display = "block";
    }
  }

  function showPlantDetails(plant) {
    const modal = document.getElementById("plantModal") || createModal();

    // Creating a formatted list of all plant details
    const details = Object.entries(plant)
      .filter(([key, value]) => value && value !== "N/A" && value !== "")
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join("");

    const content = `
            <div class="modal-content">
                <h3>${plant["Sponge Iron Plant"] || "Plant Details"}</h3>
                <div class="plant-details">
                    ${details}
                </div>
            </div>`;

    modal.innerHTML = content;
    modal.style.display = "block";
  }

  // Function to highlight states with plants
  function highlightStatesWithPlants() {
    if (currentChart && plantData) {
      const series = currentChart.series[0];
      if (series) {
        // Iterate over each state in the map
        series.data.forEach((point) => {
          const state = point.properties?.st_nm;
          const plantsInState = plantData[state]?.filter(
            (plant) => plant["City/ District"]
          );

          if (plantsInState && plantsInState.length > 0) {
            point.update({ color: "#FF0000" }, true); // Highlight red for states with district plants
          } else {
            point.update({ color: "#EEEEEE" }, true); // Reset color for states without plants
          }
        });
      }
    }
  }

  // Event listener for the "plants" button
  const plantsButton = document.getElementById("plants-dialog-button"); // Replace with the actual button ID
  if (plantsButton) {
    plantsButton.addEventListener("click", () => {
      highlightStatesWithPlants();
    });
  }

  function createModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById("plantModal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "plantModal";
    modal.className = "modal";
    modal.style.zIndex = "9999999"; // Ensure high z-index

    // Create a content wrapper div
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "modal-content";
    contentWrapper.style.zIndex = "10000000"; // Even higher z-index

    // Add close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.style.zIndex = "10000001"; // Highest z-index
    closeBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      modal.style.display = "none";
    };

    // Append close button to content wrapper
    contentWrapper.appendChild(closeBtn);

    // Append content wrapper to modal
    modal.appendChild(contentWrapper);

    // Closing when clicking outside
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };

    // Prevent clicks inside modal from closing it
    contentWrapper.onclick = (event) => {
      event.stopPropagation();
    };

    document.body.appendChild(modal);

    // Add fullscreen change event listener
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        modal.style.zIndex = "9999999";
        contentWrapper.style.zIndex = "10000000";
        closeBtn.style.zIndex = "10000001";
      }
    });

    return modal;
  }

  function createBackButton() {
    const existing = document.querySelector(".back-button");
    if (existing) existing.remove();

    const button = document.createElement("button");
    button.className = "back-button";
    button.innerHTML = "← Back to India";
    button.onclick = () => {
      loadIndiaMap();
      currentView = "india";
      button.remove();
      toggleBiomassContainer(true);
      // added

      const viewAllBtn = document.querySelector(".view-all-button");
      if (viewAllBtn) viewAllBtn.remove();
    };
    document.body.insertBefore(
      button,
      document.getElementById("map-container")
    );
  }
});
