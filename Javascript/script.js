const BASE_URL = 'http://api.weatherapi.com/v1//forecast.json';
const API_KEY = 'f6b34c4f984f4498a85112034252905';
const city = 'Mumbai';
// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
const API_URL = `${BASE_URL}?key=${API_KEY}&q=${city}&days=5`

async function callWeatherAPI() {
    const response = await fetch(API_URL)
    const jsonResponse = await response.json()
    return jsonResponse
}

callWeatherAPI().then((data) => {
    console.log(data)
})