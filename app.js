const apiKey = "c427c6749f034d46e6c258fcb93290ea"; // Replace with your actual API key
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const forecastContainer = document.getElementById('forecast');

// Current Weather URL
const currentWeatherUrl = (city) => 
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

// 5-Day Forecast URL (3-hour intervals)
const forecastUrl = (city) => 
  `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&cnt=40`;

async function getWeatherByLocation(city) {
    try {
        // Get current weather
        const currentResp = await fetch(currentWeatherUrl(city));
        const currentData = await currentResp.json();
        
        if (currentData.cod !== 200) {
            throw new Error(currentData.message);
        }

        // Get forecast data
        const forecastResp = await fetch(forecastUrl(city));
        const forecastData = await forecastResp.json();
        
        if (forecastData.cod !== "200") {
            throw new Error("Forecast data not available");
        }

        addWeatherToPage(currentData, forecastData);
        
    } catch (error) {
        main.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        forecastContainer.innerHTML = "";
        console.error(error);
    }
}

function addWeatherToPage(currentData, forecastData) {
    // Current Weather
    const weatherHTML = `
        <div class="weather-card">
            <div class="current-weather">
                <h2>${currentData.name}, ${currentData.sys.country}</h2>
                <img src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png" 
                     alt="${currentData.weather[0].description}" 
                     class="weather-icon">
                <div class="temperature">${Math.round(currentData.main.temp)}°C</div>
                <div class="description">${currentData.weather[0].description}</div>
                <div class="details">
                    <div class="detail-item">
                        <i class="fas fa-wind"></i>
                        <p>${currentData.wind.speed} m/s</p>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tint"></i>
                        <p>${currentData.main.humidity}%</p>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-compress-alt"></i>
                        <p>${currentData.main.pressure} hPa</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Forecast (group by day)
    const forecastByDay = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!forecastByDay[date]) {
            forecastByDay[date] = [];
        }
        forecastByDay[date].push(item);
    });

    let forecastHTML = `
        <div class="forecast">
            <div class="forecast-header">
                <h3>5-Day Forecast</h3>
            </div>
            <div class="forecast-days">
    `;

    Object.keys(forecastByDay).slice(0, 5).forEach(date => {
        const dayData = forecastByDay[date];
        const dayTemp = Math.round(dayData[0].main.temp);
        const nightTemp = Math.round(dayData[dayData.length-1].main.temp);
        const icon = dayData[Math.floor(dayData.length/2)].weather[0].icon;
        
        forecastHTML += `
            <div class="forecast-day">
                <h4>${new Date(dayData[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${dayData[0].weather[0].description}">
                <div class="forecast-temp">
                    <span class="day-temp">${dayTemp}°</span>
                    <span class="night-temp">${nightTemp}°</span>
                </div>
                <p>${dayData[0].weather[0].description}</p>
            </div>
        `;
    });

    forecastHTML += `</div></div>`;

    // Update DOM
    main.innerHTML = weatherHTML;
    forecastContainer.innerHTML = forecastHTML;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = search.value.trim();
    if (city) {
        getWeatherByLocation(city);
    }
});

