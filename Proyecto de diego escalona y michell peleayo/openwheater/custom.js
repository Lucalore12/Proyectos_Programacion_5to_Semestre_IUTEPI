const result = document.querySelector('.result');
const form = document.querySelector('.get-weather');
const nameCity = document.querySelector('#city');
const nameCountry = document.querySelector('#country');
const mapContainer = document.getElementById('map');

let map; // Variable global para el mapa
let marker; // Variable global para el marcador

function initMap(lat, lng) {
    if (!map) {
        map = L.map('map').setView([lat, lng], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], 8); // Reinicializa la vista del mapa
        if (marker) {
            map.removeLayer(marker); // Remueve el marcador anterior
        }
    }
    marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${nameCity.value}</b><br>Latitud: ${lat}, Longitud: ${lng}`)
        .openPopup();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = nameCity.value;
    const country = nameCountry.value;

    if (!city || !country) {
        result.innerHTML = '<p class="alert-message">Por favor ingresa una ciudad y un país.</p>';
        return;
    }

    const apiKey = '7c052b49263dcfbaef3d3e18b2aa6901'; // Reemplaza esto con tu clave de API de OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;

    // Limpia el contenido anterior
    result.innerHTML = '';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al solicitar los datos de la API');
            }
            return response.json();
        })
        .then(data => {
            if (data.cod === '404') {
                result.innerHTML = '<p class="alert-message">Ciudad no encontrada. Por favor, intenta nuevamente.</p>';
            } else {
                result.innerHTML = `
                    <h5>Clima en ${data.name}</h5>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                    <h2>${data.main.temp}°C</h2>
                    <p>Max: ${data.main.temp_max}°C</p>
                    <p>Min: ${data.main.temp_min}°C</p>
                `;

                const lat = data.coord.lat;
                const lon = data.coord.lon;
                initMap(lat, lon);

                // Cambiar la imagen de fondo basada en el país seleccionado
                document.body.style.backgroundImage = `url('./imagenes/${country}.jpg')`;
            }
        })
        .catch(error => {
            console.error('Error fetching the weather data:', error);
            result.innerHTML = '<p class="alert-message">Hubo un error al obtener los datos del clima. Por favor, intenta nuevamente más tarde.</p>';
        });
});
