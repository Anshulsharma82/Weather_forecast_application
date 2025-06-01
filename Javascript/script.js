const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')
const searchContainer = document.getElementById('searchContainer')
const display_p = document.createElement('p')
const weatherContainer = document.getElementById('weatherContainer')
const currentWeatherContainer = document.getElementById('currentWeatherContainer')
const forecastWeatherContainer = document.getElementById('forecastWeatherContainer')
const searchCities = localStorage.getItem('searchCities') ? JSON.parse(localStorage.getItem('searchCities')) : []
const ul = document.createElement('ul')
const currentLocationButton = document.getElementById('currentLocationButton')

const BASE_URL = 'http://api.weatherapi.com/v1//forecast.json';
const API_KEY = 'f6b34c4f984f4498a85112034252905';
const city = 'Mumbai';

// Function to call the external weather API to get the weather info.
async function callWeatherAPI(param) {
    const API_URL = `${BASE_URL}?key=${API_KEY}&q=${param}&days=6`
    const response = await fetch(API_URL)
    const jsonResponse = await response.json()
    return jsonResponse
}


// Function to display recent searched cities if user clicks on input field.
const displayDropDown = () => {
    if(searchCities.length > 0) {
        ul.innerHTML = ''
        // create a list for recently searched cities.
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

// Function to remove dropdown when user clicks outside of the input field
const removeDropDown = (event) => {
    if(!searchContainer.contains(event.target) || event.target.tagName ==='BUTTON' )
    {
        ul.remove()
    }
}

// Function to display errors or messages accordingly.
const displayMsg = (msg, isErrorMsg) => {
    display_p.style.display = 'block'
    display_p.innerHTML = msg
    display_p.classList.add('text-center', 'text-red-600', 'text-xl', 'mb-4', 'font-bold')
    let timeout;
    if(isErrorMsg) {
        display_p.classList.add('text-red-600')
        display_p.classList.remove('text-green-600')
        timeout = 3000
    }
    else {
        display_p.classList.add('text-green-600')
        display_p.classList.remove('text-red-600')
        timeout = 1500
    }
    searchContainer.insertBefore(display_p, cityInput)

    setTimeout(() => {
        display_p.innerHTML = ''
        display_p.style.display = 'none'
    }, timeout)
}

// Function internally call other function to fetch weather info, to create element to display current and forecast weather detail, and display input related errors in case of city weather search.
async function cityWeatherInfo(selectedCity='') {
    try {
        currentWeatherContainer.innerHTML = ''
        forecastWeatherContainer.innerHTML = ''
        
        currentWeatherContainer.style.display = 'none'

        const cityName = cityInput.value ? cityInput.value.toUpperCase() : selectedCity ? selectedCity.toUpperCase() : '';
        if (!cityName) {
            displayMsg('Please provide city in input field.',true)
            return
        }
        // call weather API to fetch weather info.
        const weatherAPIResponse = await callWeatherAPI(cityName)
        // if weather API contains error object then display the error in UI.
        if (weatherAPIResponse?.error) {
            displayMsg('No Matching City found.',true)
            cityInput.value = '' //Empty the city input field
            return;
        }
        displayMsg('Please Be patient, Fetching Weather Data....', false)
        currentWeatherContainer.style.display = 'block'
        // Call function to create HTML element that contain current weather data and sets it to the parent container defined to display current weather.
        currentWeatherContainer.innerHTML = displayCurrentWeatherData(cityName,weatherAPIResponse)
        // Call function to create HTML element that contain forecast weather data and sets it to the parent container defined to display forecast weather.
        forecastWeatherContainer.innerHTML = displayForecastWeatherData(weatherAPIResponse?.forecast?.forecastday)
        // if seatched city not present in the local storage then add it to the beginning.
        if(!searchCities.includes(cityName)) {
            searchCities.unshift(cityName)
        }
        // if in local storage searched city array length is more than 5 then delete the last element from the list.
        if(searchCities.length > 5) {
            searchCities.pop()
        }
        // push the updated searched cities to the local storage.
        localStorage.setItem('searchCities', JSON.stringify(searchCities))
        cityInput.value = ''
    } catch (error) {
        console.log('error:::::', error)
        displayMsg('Internal Server Error', true)
        return
    }
}

// Function to get the latitude and longitude of the users current location.
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

// Function to return the innerHTML of container that contains the forecast weather data.
const displayForecastWeatherData = function (forecastdata) {
    let output = '<p class="tex-black text-center font-bold m-2 text-2xl" >5-day Forecast</p>'
    for (let day = 1; day <= forecastdata.length - 1; day++) {
        const date = forecastdata[day].date;
        const icon = forecastdata[day].day.condition.icon;
        const temp = forecastdata[day].day.avgtemp_c
        const wind = forecastdata[day].day.avgvis_miles
        const humidity = forecastdata[day].day.avghumidity
        output += `
            <div class="border-2 flex justify-evenly items-center flex-col sm:flex-row mb-3 rounded-[30px] bg-orange-500 hover:bg-orange-600 hover:text-gray-100 text-xl font-bold text-gray-200 py-2 sm:py-0"> 
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

// Function to return the innerHTML of container that contains the current weather data.
function displayCurrentWeatherData(cityName, weatherAPIResponse) {
    return `
            <div class="mx-6 text-2xl text-white font-bold text-center mt-2 flex justify-center items-center flex-col sm:flex-row transition-all duration-1000 hover:text-white">
                <p class="sm:mr-3 mr-0" >${cityName.toUpperCase()} </p>
                <p > (${weatherAPIResponse?.current?.last_updated?.split(' ')[0]}) </p>
            </div>
            <div class=' flex justify-around items-center my-6 h-auto sm:h-30 text-xl font-semibold flex-col sm:flex-row'>
                <div class=' flex justify-center items-center flex-col h-full p-2 text-gray-100'>
                    <img class="h-20 w-30" src="${weatherAPIResponse?.current?.condition?.icon}" alt="weather_image" >
                    <p>${weatherAPIResponse?.current?.condition?.text}</p>
                </div>
                <div class=' h-full border-2 flex justify-center items-start flex-col text-white font-bold bg-purple-700 hover:bg-purple-800 hover:text-gray-200 rounded-lg p-4'> 
                    <p>Temperature:- ${weatherAPIResponse?.current?.temp_c}<sup>0</sup>C</p>
                    <p> Wind:- ${weatherAPIResponse?.current?.wind_mph}M/S </p>
                    <p> Humidity:- ${weatherAPIResponse?.current?.humidity}% </p>
                </div>
            </div>
            `
}

// Below are the event listners added to the project.

searchBtn.addEventListener('click', () => {
    cityWeatherInfo()
})

currentLocationButton.addEventListener('click', async () => {
    try {
        displayMsg('Please Be patient, Fetching Weather Data....', false)
        currentWeatherContainer.innerHTML = ``
        forecastWeatherContainer.innerHTML =  ``
        currentWeatherContainer.style.display = 'none'
        const position = await getCurrentPositionOfUser()
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude
        const locationParam = `${latitude},${longitude}`
        const weatherAPIResponse = await callWeatherAPI(locationParam)
        if (weatherAPIResponse?.error) {
            displayMsg('Weather API Failed.', true)
            return;
        }
        currentWeatherContainer.style.display = 'block'
        currentWeatherContainer.innerHTML = displayCurrentWeatherData('Your Location',weatherAPIResponse)
        forecastWeatherContainer.innerHTML = displayForecastWeatherData(weatherAPIResponse?.forecast?.forecastday)

    } catch (error) {
        displayMsg('Weather API Failed.', true)
        return;
    }
})

cityInput.addEventListener('focus', displayDropDown)

document.addEventListener('click', removeDropDown)

// When user clicked on the list of the recently searched city then call cityWeatheInfo function to fetch the current and forecast weather data and remove the searched city dropdown.
ul.addEventListener('click', async (e) => {
    // cityInput.value = e.target.innerHTML;
    ul.remove()
    await cityWeatherInfo(e.target.innerHTML)
})