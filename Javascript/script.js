const BASE_URL = 'http://api.weatherapi.com/v1//forecast.json';
const API_KEY = 'f6b34c4f984f4498a85112034252905';
const city = 'Mumbai';

async function callWeatherAPI(param) {
    const API_URL = `${BASE_URL}?key=${API_KEY}&q=${param}&days=6`
    const response = await fetch(API_URL)
    const jsonResponse = await response.json()
    return jsonResponse
}

const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')
const searchContainer = document.getElementById('searchContainer')
const display_msg_p = document.createElement('p')
const weatherContainer = document.getElementById('weatherContainer')
const currentWeatherContainer = document.getElementById('currentWeatherContainer')
const forecastWeatherContainer = document.getElementById('forecastWeatherContainer')
const searchCities = localStorage.getItem('searchCities') ? JSON.parse(localStorage.getItem('searchCities')) : []
const ul = document.createElement('ul')
const currentLocationButton = document.getElementById('currentLocationButton')

const displayDropDown = () => {
    if(searchCities.length > 0) {
        ul.innerHTML = ''
        searchCities.forEach((elem) => {
            const li = document.createElement('li')
            li.innerHTML = `${elem}`
            li.classList.add('border', 'rounded-[10px]', 'bg-white', 'py-1', 'pl-4', 'text-xl', 'hover:bg-gray-300')
            ul.append(li)
        })
        ul.classList.add('absolute', 'w-56', 'sm:w-72')
        searchContainer.insertBefore(ul,searchBtn)
    }
}

const removeDropDown = (event) => {
    if(!searchContainer.contains(event.target) || event.target.tagName ==='BUTTON' )
    {
        ul.remove()
    }
}

document.addEventListener('click', removeDropDown)

ul.addEventListener('click', (e) => {
    cityInput.value = e.target.innerHTML;
    ul.remove()
})

cityInput.addEventListener('focus', displayDropDown)


searchBtn.addEventListener('click', async () => {
    try {
        displayMessage('Fetching Weather Data, Please Be Patient...', false)
        currentWeatherContainer.innerHTML = ''
        forecastWeatherContainer.innerHTML = ''
        
        currentWeatherContainer.style.display = 'none'

        const cityName = cityInput.value;
        if (!cityName) {
            displayMessage('Please provide city in input field.', true)
            return
        }
        const weatherAPIResponse = await callWeatherAPI(cityName)
        if (weatherAPIResponse?.error) {
            displayMessage('No Matching City found.', true)
            cityInput.value = '' //Empty the city input field
            return;
        }
        console.log('WeatherResponse::::::::::::::::::::::::', weatherAPIResponse)
        currentWeatherContainer.style.display = 'block'
        currentWeatherContainer.innerHTML = displayCurrentWeatherData(cityName,weatherAPIResponse)
        forecastWeatherContainer.innerHTML = displayForecastWeatherData(weatherAPIResponse?.forecast?.forecastday)
        if(!searchCities.includes(cityName)) {
            searchCities.unshift(cityName)
        }
        if(searchCities.length > 5) {
            searchCities.pop()
        }
        localStorage.setItem('searchCities', JSON.stringify(searchCities))
        cityInput.value = '' //Empty the city input field
    } catch (error) {
        console.log('error:::::', error)
        displayMessage('Internal Server Error', true)
        return
    }
})

currentLocationButton.addEventListener('click', async () => {
    console.log('current location clicked!')
    try {
        currentWeatherContainer.innerHTML = ``
        forecastWeatherContainer.innerHTML =  ``
        currentWeatherContainer.style.display = 'none'
        displayMessage('Fetching Weather Data, Please Be Patient...', false)
        const position = await getCurrentPositionOfUser()
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude
        const locationParam = `${latitude},${longitude}`
        const weatherAPIResponse = await callWeatherAPI(locationParam)
        if (weatherAPIResponse?.error) {
            displayMessage('Weather API Failed.', true)
            return;
        }
        console.log('WeatherResponse::::::::::::::::::::::::', weatherAPIResponse)
        currentWeatherContainer.style.display = 'block'
        currentWeatherContainer.innerHTML = displayCurrentWeatherData('Your Location',weatherAPIResponse)
        forecastWeatherContainer.innerHTML = displayForecastWeatherData(weatherAPIResponse?.forecast?.forecastday)

    } catch (error) {
        console.log('error:::::::::::::', error)
        displayMessage('Weather API Failed.', true)
        return;
    }
})

async function getCurrentPositionOfUser() {
    return new Promise((resolve, reject) => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve,reject) 
        }
        else {
            reject('Geolocaiton not supported')
        }
    })
}

const displayMessage = (msg,isThisError) => {
    display_msg_p.innerHTML = msg
    display_msg_p.classList.add('text-center', 'text-red-600', 'text-xl', 'mb-4', 'font-bold')
    let timeout;
    if(isThisError) {
        timeout = 5000
        display_msg_p.classList.remove('text-blue-300')
        display_msg_p.classList.add('text-red-600')
        
    }
    else {
        timeout = 2000
        display_msg_p.classList.remove('text-red-600')
        display_msg_p.classList.add('text-blue-400')
    }
    searchContainer.insertBefore(display_msg_p, cityInput)

    setTimeout(() => {
        display_msg_p.innerHTML = ''
        searchContainer.insertBefore(display_msg_p, cityInput)
    }, timeout)
}

const displayForecastWeatherData = function (forecastdata) {
    let output = '<p class="tex-black text-center font-bold m-2 text-2xl" >5-day Forecast</p>'
    for (let day = 1; day <= forecastdata.length - 1; day++) {
        const date = forecastdata[day].date;
        const icon = forecastdata[day].day.condition.icon;
        const temp = forecastdata[day].day.avgtemp_c
        const wind = forecastdata[day].day.avgvis_miles
        const humidity = forecastdata[day].day.avghumidity
        output += `
            <div class="border-2 flex justify-evenly items-center flex-col sm:flex-row mb-3 rounded-[30px] bg-orange-400 text-xl font-semibold text-gray-300 py-2 sm:py-0"> 
                <p>${date}</p>
                <img class='h-20 w-20' src="${icon}" alt="weather_image">
                <p>Temperature:- ${temp}<sup>0</sup>C </p>
                <p>Wind:- ${wind}M/S </p>
                <p>Humidity:- ${humidity}% </p>
            </div>
        `
    }
    return output;
}

function displayCurrentWeatherData(cityName, weatherAPIResponse) {
    return `
            <div class="mx-6 text-2xl text-gray-500 font-bold text-center mt-2 flex justify-center items-center flex-col sm:flex-row">
                <p class="sm:mr-3 mr-0" >${cityName.toUpperCase()} </p>
                <p > (${weatherAPIResponse?.current?.last_updated?.split(' ')[0]}) </p>
            </div>
            <div class=' flex justify-around items-center my-6 h-auto sm:h-30 text-xl font-semibold flex-col sm:flex-row'>
                <div class=' flex justify-center items-center flex-col h-full p-2 text-gray-100'>
                    <img class="h-20 w-30" src="${weatherAPIResponse?.current?.condition?.icon}" alt="weather_image" >
                    <p>${weatherAPIResponse?.current?.condition?.text}</p>
                </div>
                <div class=' h-full  p-2 flex justify-center items-start flex-col text-gray-500'> 
                    <p>Temperature:- ${weatherAPIResponse?.current?.temp_c}<sup>0</sup>C</p>
                    <p> Wind:- ${weatherAPIResponse?.current?.wind_mph}M/S </p>
                    <p> Humidity:- ${weatherAPIResponse?.current?.humidity}% </p>
                </div>
            </div>
            `
}