'use strict';

require('dotenv').config();
const superAgent = require('superagent');
const helpers = require('./helpers.js');


function weatherFunction(request, response){
    const searchedCity = request.query.search_query;
    getWeather(searchedCity)
    .then(weatherData => helpers.renderStatus(weatherData, response)) 
    .catch((err) => errorHandler(err, request, response));
}

function getWeather(searchedCity){
    let weatherAPIkey = process.env.WEATHER_API_KEY;
    const weatherAPIurl = (`https://api.weatherbit.io/v2.0/forecast/daily?city=${searchedCity}&key=${weatherAPIkey}`);

    return superAgent.get(weatherAPIurl).then(weatherData => mappingWeatherData(weatherData.body.data));
}

function mappingWeatherData(weatherData){
    return weatherData.map((dayWeather) => {
        return new Weather(dayWeather);
    });
}

function Weather(dayWeather) {
    this.forecast = dayWeather.weather.description;
    this.time = new Date(dayWeather.datetime).toDateString();
}


module.exports = weatherFunction;