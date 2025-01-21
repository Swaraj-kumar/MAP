document.addEventListener('DOMContentLoaded', () => {
    let currentView = 'india';
    let plantData = {};
    let currentChart = null;

    // Fetching plant data from backend
    fetch('/api/plants')
        .then(response => response.json())
        .then(data => {
            plantData = data;
            console.log("Loaded plant data:", plantData);
            loadIndiaMap();
        })
        .catch(error => console.error('Error loading plant data:', error));

    function loadIndiaMap() {
        fetch('/static/geojson/india.json')
            .then(response => response.json())
            .then(data => createMap(data))
            .catch(error => console.error('Error loading India map:', error));
    }

    function createMap(geoJson) {
        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = Highcharts.mapChart('map-container', {
            chart: {
                map: geoJson
            },
            title: {
                text: 'India Map'
            },
            subtitle: {
                text: 'Click on a state to view plant details'
            },
            mapNavigation: {
                enabled: true
            },
            tooltip: {
                formatter: function () {
                    const state = this.point.properties.st_nm;
                    const plants = plantData[state] || [];
                    return `<b>${state}</b><br>Number of Plants: ${plants.length}`;
                }
            },
            series: [{
                data: geoJson.features,
                name: 'States',
                borderColor: '#000', // Set bold black border
                borderWidth: 2,      // Make the border thicker
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.st_nm}'
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
            }]
        });
    }

    function createStateMap(stateData, plants, stateName) {
        if (currentChart) {
            currentChart.destroy();
        }
    
        // Creating "View All Plants" button
        const viewAllBtn = document.createElement('button');
        viewAllBtn.className = 'view-all-button';
        viewAllBtn.innerHTML = 'View All Plants';
        viewAllBtn.onclick = () => showDistrictDetails(stateName, plants, true); // true indicates all plants view
        document.body.insertBefore(viewAllBtn, document.getElementById('map-container'));
    
        // Grouping plants by district
        const plantsByDistrict = {};
        plants.forEach(plant => {
            const district = plant['City/ District'] || 'Unknown';
            if (!plantsByDistrict[district]) {
                plantsByDistrict[district] = [];
            }
            plantsByDistrict[district].push(plant);
        });
    
        // Getting districts with plants
        const districtsWithPlants = new Set(Object.keys(plantsByDistrict));
    
        // Preparing districts data with plant counts
        const districtsData = stateData.features.map(feature => {
            const district = feature.properties.district;
            const districtPlants = plantsByDistrict[district] || [];
            // Adding feature that will highlight district data with plants
            return {
                ...feature,
                value: districtPlants.length,
                color: districtPlants.length > 0 ? '#bada55' : '#eee', // Light green for districts with plants
                plantsData: districtPlants,
                hasPlants: districtPlants.length > 0
            };
        });
    
        currentChart = Highcharts.mapChart('map-container', {
            chart: {
                map: stateData,
                events: {
                    load: function() {
                        // Creating a custom legend item for highlighting districts with plants
                        const chart = this;
                        const legendGroup = chart.legend.group;
                        const legendItem = chart.renderer.g('legend-item-plants')
                            .add(legendGroup);
    
                        // Adding hover events to the legend item
                        legendItem
                            .on('mouseenter', function() {
                                // Highlight districts with plants
                                chart.series[0].points.forEach(point => {
                                    if (point.value > 0) {
                                        point.setState('hover');
                                    }
                                });
                            })
                            .on('mouseleave', function() {
                                // Removing highlight
                                chart.series[0].points.forEach(point => {
                                    point.setState('');
                                });
                            });
                    }
                }
            },
            title: {
                text: `Plants in ${stateName}`
            },
            subtitle: {
                text: `Total Plants: ${plants.length} | Districts with Plants: ${districtsWithPlants.size}`
            },
            mapNavigation: {
                enabled: true
            },
            legend: {
                enabled: true,
                title: {
                    text: 'Toggle Visibility'
                }
            },
            plotOptions: {
                series: {
                    events: {
                        legendItemClick: function(e) {
                            if (this.type === 'map') {
                                if (this.visible) {
                                    // Showing only districts with plants and highlight them
                                    this.points.forEach(point => {
                                        if (point.value > 0) {
                                            point.setVisible(true, false);
                                            point.update({
                                                color: '#bada55',  // Highlight color
                                                borderColor: '#666'
                                            }, false);
                                        } else {
                                            point.setVisible(false, false);
                                        }
                                    });
                                } else {
                                    // Reset all districts to original style and show all
                                    this.points.forEach(point => {
                                        point.setVisible(true, false);
                                        point.update({
                                            color: '#eee',  // Reset to original color
                                            borderColor: '#999'
                                        }, false);
                                    });
                                }
                                this.chart.redraw();
                                return false;
                            }
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    if (this.point.plantData) {
                        const plant = this.point.plantData;
                        return `<b>${plant['Sponge Iron Plant'] || 'Plant'}</b><br>
                                Location: ${plant['City/ District']}<br>
                                Click for more details`;
                    }
                    const district = this.point.properties?.district;
                    const districtPlants = plantsByDistrict[district] || [];
                    const plantList = districtPlants.length > 0 
                        ? '<br>' + districtPlants.map(p => `• ${p['Sponge Iron Plant']}`).join('<br>')
                        : '';
                    return `<b>${district}</b><br>
                            Plants: ${districtPlants.length}${plantList}
                            ${districtPlants.length > 0 ? '<br>Click to view details' : ''}`;
                }
            },
            series: [{
                name: 'Districts',
                data: districtsData,
                color: '#eee',
                borderColor: '#999',
                states: {
                    hover: {
                        color: '#bada55',
                        borderColor: '#666'
                    }
                },
                animation: {
                    duration: 500
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.district}'
                },
                point: {
                    events: {
                        click: function() {
                            if (this.value > 0) {
                                showDistrictDetails(this.properties.district, this.plantsData);
                            }
                        }
                    }
                }
            }, {
                name: 'Plants',
                type: 'mappoint',
                data: plants.map((plant, index) => ({
                    x: (index % 5) * 2 - 5,
                    y: Math.floor(index / 5) * 2 - 5,
                    name: plant['Sponge Iron Plant'] || 'Plant',
                    plantData: plant,
                    district: plant['City/ District']
                })),
                color: '#f00',
                marker: {
                    radius: 5,
                    fillColor: '#f00',
                    lineColor: '#fff',
                    lineWidth: 1
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: {
                        fontSize: '8px',
                        textOutline: '1px white'
                    }
                },
                point: {
                    events: {
                        click: function() {
                            showPlantDetails(this.plantData);
                        }
                    }
                }
            }]
        });
    }
    
    function showDistrictDetails(district, plants, isAllPlants = false) {
        const modal = document.getElementById('plantModal') || createModal();
        
        // Sorting plants by name
        const sortedPlants = [...plants].sort((a, b) => 
            (a['Sponge Iron Plant'] || '').localeCompare(b['Sponge Iron Plant'] || '')
        );
    
        // Creating table of plants
        const plantsTable = sortedPlants.map(plant => {
            const details = Object.entries(plant)
                .filter(([key, value]) => value && value !== 'N/A' && value !== '')
                .map(([key, value]) => `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`)
                .join('');
            return `
                <div class="plant-entry">
                    <h4>${plant['Sponge Iron Plant'] || 'Plant'}</h4>
                    <table class="plant-table">
                        ${details}
                    </table>
                </div>
            `;
        }).join('<hr>');
    
        const content = `
            <div class="modal-content">
                <h3>${isAllPlants ? 'All Plants in State' : `Plants in ${district}`}</h3>
                <div class="district-plants">
                    ${plantsTable}
                </div>
            </div>`;
        
        modal.innerHTML = content;
        modal.style.display = 'block';
    }

    function showPlantDetails(plant) {
        const modal = document.getElementById('plantModal') || createModal();

        // Creating a formatted list of all plant details
        const details = Object.entries(plant)
            .filter(([key, value]) => value && value !== 'N/A' && value !== '')
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join('');

        const content = `
            <div class="modal-content">
                <h3>${plant['Sponge Iron Plant'] || 'Plant Details'}</h3>
                <div class="plant-details">
                    ${details}
                </div>
            </div>`;

        modal.innerHTML = content;
        modal.style.display = 'block';
    }

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'plantModal';
        modal.className = 'modal';

        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.style.display = 'none';

        modal.appendChild(closeBtn);

        // Closing when clicking outside
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        document.body.appendChild(modal);
        return modal;
    }

    function createBackButton() {
        const existing = document.querySelector('.back-button');
        if (existing) existing.remove();

        const button = document.createElement('button');
        button.className = 'back-button';
        button.innerHTML = '← Back to India';
        button.onclick = () => {
            loadIndiaMap();
            currentView = 'india';
            button.remove();
            // added
            const viewAllBtn = document.querySelector('.view-all-button')
            if(viewAllBtn)viewAllBtn.remove();
        };
        document.body.insertBefore(button, document.getElementById('map-container'));
    }
});


















