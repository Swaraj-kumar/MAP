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

  const stateListContainer = document.getElementById("state-list-container");
  stateListContainer.style.maxHeight = "400px";
  stateListContainer.style.overflowY = "scroll";
  stateListContainer.style.border = "1px solid #ccc";
  stateListContainer.style.padding = "10px";
  stateListContainer.style.margin = "20px auto";
  stateListContainer.style.width = "300px";
  stateListContainer.style.backgroundColor = "#f9f9f9";

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

  // Fetching plant data from backend
  fetch("/api/plants")
    .then((response) => response.json())
    .then((data) => {
      plantData = data;
      console.log("Loaded plant data:", plantData);
      loadIndiaMap();
      highlightStatesWithPlants(); // Highlight after data is loaded
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

  function loadIndiaMap() {
    fetch("/static/geojson/india.json")
      .then((response) => response.json())
      .then((data) => createMap(data))
      .catch((error) => console.error("Error loading India map:", error));
  }

  highlightDistrictsWithPlants();


  function calculateStateCentroid(stateFeature) {
    if (stateFeature.geometry.type === 'Polygon') {
        const coordinates = stateFeature.geometry.coordinates[0];
        const len = coordinates.length;
        const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLon / len, sumLat / len];
    } else if (stateFeature.geometry.type === 'MultiPolygon') {
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
    const statesWithPlants = Object.entries(plantData)
        .filter(([state, plants]) => plants.length > 0)
        .map(([state, plants]) => {
            const stateFeature = geoJson.features.find(f => f.properties.st_nm === state);
            if (stateFeature) {
                const coordinates = calculateStateCentroid(stateFeature);
                return coordinates
                    ? {
                          name: state,
                          lon: coordinates[0],
                          lat: coordinates[1],
                          plantCount: plants.length,
                          marker: {
                              radius: 8,
                              fillColor: '#FF0000',
                              lineColor: '#fff',
                              lineWidth: 2
                          }
                      }
                    : null;
            }
            return null;
        })
        .filter(point => point !== null);

    currentChart = Highcharts.mapChart('map-container', {
        chart: {
            map: geoJson
        },
        title: {
            text: 'India Map'
        },
        subtitle: {
            text: 'Hover for plant details, Click to explore districts'
        },
        mapNavigation: {
            enabled: true
        },
        tooltip: {
            formatter: function () {
                const state = this.point.name || this.point.properties?.st_nm;
                const plants = plantData[state] || [];
                return `
                    <b>${state}</b><br>
                    Number of Plants: ${plants.length}`;
            }
        },
        series: [
            {
                data: geoJson.features,
                name: 'States',
                borderColor: '#000',
                borderWidth: 2,
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.st_nm}',
                    style: {
                        fontWeight: 'bold'
                    }
                },
                point: {
                    events: {
                        click: function () {
                            const stateName = this.properties.st_nm;
                            const plants = plantData[stateName];

                            if (!plants || plants.length === 0) {
                                alert('No plant data available for ' + stateName);
                                return;
                            }

                            const stateFile = stateName.toLowerCase().replace(/\s+/g, '');
                            fetch(`/static/geojson/states/${stateFile}.json`)
                                .then(response => response.json())
                                .then(stateData => {
                                    currentView = stateName;
                                    createStateMap(stateData, plants, stateName);
                                    createBackButton();
                                })
                                .catch(error => {
                                    console.error('Error loading state data:', error);
                                    alert('Error loading map for ' + stateName);
                                });
                        }
                    }
                }
            },
            {
              type: 'mappoint',
              name: 'States with Plants',
              data: statesWithPlants,
              color: '#FF0000', // Explicitly set red color for all markers
              dataLabels: {
                  enabled: false,
                  format: '{point.name}',
                  style: {
                      fontSize: '8px',
                      textOutline: '1px white'
                  }
              },
              tooltip: {
                  formatter: function () {
                      return `<b>${this.point.name}</b><br>
                              Number of Plants: ${this.point.plantCount}`;
                  }
              }
          }
          
        ]
    });
}

function createStateMap(stateData, plants, stateName) {
  if (currentChart) {
      currentChart.destroy();
  }

  // Grouping plants by district
  const plantsByDistrict = {};
  plants.forEach((plant) => {
      const district = plant["City/ District"] || "Unknown";
      if (!plantsByDistrict[district]) {
          plantsByDistrict[district] = [];
      }
      plantsByDistrict[district].push(plant);
  });

  // Custom centroid calculation
  function calculateDistrictCentroid(districtFeature) {
      if (districtFeature.geometry.type === "Polygon") {
          const coordinates = districtFeature.geometry.coordinates[0];
          const len = coordinates.length;
          const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
          const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
          return [sumLon / len, sumLat / len];
      }
      return null;
  }

  // Getting districts with plants
  const districtsWithPlants = new Set(Object.keys(plantsByDistrict));

  // Preparing districts data with plant counts
  const districtsData = stateData.features.map((feature) => {
      const district = feature.properties.district;
      const districtPlants = plantsByDistrict[district] || [];
      return {
          ...feature,
          value: districtPlants.length,
          color: districtPlants.length > 0 ? "#bada55" : "#eee",
          plantsData: districtPlants,
          hasPlants: districtPlants.length > 0,
      };
  });

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
          text: `Plants in ${stateName}`,
      },
      subtitle: {
          text: `Total Plants: ${plants.length} | Districts with Plants: ${districtsWithPlants.size}`,
      },
      mapNavigation: {
          enabled: true,
      },
      tooltip: {
          formatter: function () {
              const district = this.point.properties?.district;
              const districtPlants = plantsByDistrict[district] || [];
              const plantList =
                  districtPlants.length > 0
                      ? "<br>" +
                        districtPlants
                            .map((p) => `• ${p["Sponge Iron Plant"]}`)
                            .join("<br>")
                      : "";
              return `<b>${district}</b><br>
                          Plants: ${districtPlants.length}${plantList}
                          ${
                              districtPlants.length > 0
                                  ? "<br>Click to view details"
                                  : ""
                          }`;
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
                          if (this.value > 0) {
                              showDistrictDetails(
                                  this.properties.district,
                                  this.plantsData
                              );
                          }
                      },
                  },
              },
          },
          {
              name: "Districts with Plants",
              type: "mappoint",
              color: "#FF0000", // Explicitly set red color for all points
              data: stateData.features
                  .filter((feature) => {
                      const district = feature.properties.district;
                      return plantsByDistrict[district]?.length >= 1;
                  })
                  .map((feature) => {
                      const district = feature.properties.district;
                      const centroid = calculateDistrictCentroid(feature);
                      return centroid
                          ? {
                                name: `${district} Plants`,
                                lon: centroid[0],
                                lat: centroid[1],
                                district: district,
                                marker: {
                                    radius: 8,
                                    fillColor: "#FF0000", // Ensure marker color is red
                                    lineColor: "#fff",
                                    lineWidth: 2,
                                },
                            }
                          : null;
                  })
                  .filter((point) => point !== null),
              dataLabels: {
                  enabled: true,
                  format: "{point.district}",
                  style: {
                      fontSize: "8px",
                      textOutline: "1px white",
                  },
              },
              point: {
                  events: {
                      click: function () {
                          showDistrictDetails(
                              this.district,
                              plantsByDistrict[this.district]
                          );
                      },
                  },
              },
          },
      ],
  });
}

  highlightDistrictsWithPlants();

  function showDistrictDetails(district, plants, isAllPlants = false) {
    const modal = document.getElementById("plantModal") || createModal();

    // Sorting plants by name
    const sortedPlants = [...plants].sort((a, b) =>
      (a["Sponge Iron Plant"] || "").localeCompare(b["Sponge Iron Plant"] || "")
    );

    // Creating table of plants
    const plantsTable = sortedPlants
      .map((plant) => {
        const details = Object.entries(plant)
          .filter(([key, value]) => value && value !== "N/A" && value !== "")
          .map(
            ([key, value]) =>
              `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`
          )
          .join("");
        return `
                <div class="plant-entry">
                    <h4>${plant["Sponge Iron Plant"] || "Plant"}</h4>
                    <table class="plant-table">
                        ${details}
                    </table>
                </div>
            `;
      })
      .join("<hr>");

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
    const modal = document.createElement("div");
    modal.id = "plantModal";
    modal.className = "modal";

    // Add close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => (modal.style.display = "none");

    modal.appendChild(closeBtn);

    // Closing when clicking outside
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };

    document.body.appendChild(modal);
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
