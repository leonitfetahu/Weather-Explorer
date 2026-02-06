const SearchBar = document.getElementById('SearchBar');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const WeatherCard = document.getElementById('weather-card');

let userSearched = false;
let currentMarkers = [];

// Initialize map
const map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Load user's current location on page load
const getCurrentPositionAgain = function() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const { latitude } = position.coords;
                    const { longitude } = position.coords;
                    
                    map.setView([latitude, longitude], 13);
                    clearMarkers();
                    L.marker([latitude, longitude], {
                        title: 'Your Location'
                    }).addTo(map);
                },
                function(error) {
                    console.log('Geolocation error:', error.message);
                    // Set default view if geolocation fails
                    map.setView([40, 0], 3);
                }
            );
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
};

// Geocoding function to search locations
const Geocoding = async function(position) {
    try {
        if (!position.trim()) {
            alert('Please enter a location');
            return;
        }

        const APIKEY = '69847b3152cec101381386ofpcf8a15';
        const fetching = await fetch(
            `https://geocode.maps.co/search?q=${encodeURIComponent(position)}&api_key=${APIKEY}`
        );
        
        if (!fetching.ok) {
            throw new Error('Location not found');
        }

        const convert = await fetching.json();
        
        if (!convert || convert.length === 0) {
            alert('Location not found. Please try another search.');
            return;
        }

        const { lat, lon } = convert[0];
        map.setView([lat, lon], 13);
        clearMarkers();
        L.marker([lat, lon], {
            title: position
        }).addTo(map);

        WeatherApi(position);
    } catch (error) {
        console.log('Error:', error.message);
        alert('Error searching location. Please try again.');
    }
};

// Clear all markers from map
const clearMarkers = function() {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
};

// Weather API function
const WeatherApi = async function(position) {
    try {
        const ApiKey = '4796bcba84994033948122222260402';
        const fetchingApi = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${ApiKey}&q=${encodeURIComponent(position)}`
        );
        
        if (!fetchingApi.ok) {
            throw new Error('Weather data not found');
        }

        const convert = await fetchingApi.json();
        
        const { location, current } = convert;
        
        WeatherCard.innerHTML = `
            <div class="weather-card" id="weatherCard">
                <h3>${location.name}, ${location.country}</h3>
                <div class="weather-info">
                    <div class="weather-item">
                        <span class="weather-label">Temperature</span>
                        <span class="weather-value">${current.temp_c}°C</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">Condition</span>
                        <span class="weather-value">${current.condition.text}</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">Wind</span>
                        <span class="weather-value">${current.wind_kph} km/h</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">Humidity</span>
                        <span class="weather-value">${current.humidity}%</span>
                    </div>
                </div>
                <div class="extra-info">
                    <div class="weather-item">
                        <span class="weather-label">Feels Like</span>
                        <span class="weather-value">${current.feelslike_c}°C</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">Pressure</span>
                        <span class="weather-value">${current.pressure_mb} mb</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">Visibility</span>
                        <span class="weather-value">${current.vis_km} km</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">UV Index</span>
                        <span class="weather-value">${current.uv}</span>
                    </div>
                </div>
                <button class="expand-btn" id="expandBtn">Expand Details</button>
            </div>
        `;

        const expandBtn = document.getElementById('expandBtn');
        const weatherCard = document.getElementById('weatherCard');
        
        expandBtn.addEventListener('click', function() {
            weatherCard.classList.toggle('expanded');
            expandBtn.textContent = weatherCard.classList.contains('expanded') 
                ? 'Show Less' 
                : 'Expand Details';
        });

    } catch (error) {
        console.log('Error:', error.message);
        WeatherCard.innerHTML = `
            <div class="weather-card">
                <h3>⚠️ Error</h3>
                <p style="color: #666;">Could not fetch weather data. Please try again.</p>
            </div>
        `;
    }
};

// Event listeners
searchBtn.addEventListener('click', function() {
    userSearched = true;
    const location = SearchBar.value;
    Geocoding(location);
    SearchBar.value = ''; // Clear input after search
});

SearchBar.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        userSearched = true;
        const location = SearchBar.value;
        Geocoding(location);
        SearchBar.value = '';
    }
});

locationBtn.addEventListener('click', getCurrentPositionAgain);

// Load current position on page load
getCurrentPositionAgain();
