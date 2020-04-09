'use strict';

require('dotenv').config();
const client = require('./client.js');
const superAgent = require('superagent');
const helpers = require('./helpers.js');

function locationFunction(request, response){
    const searchedCity = request.query.city;
    getLocation(searchedCity)
    .then(data => helpers.renderStatus(data, response))
    .catch((error) => helpers.errorHandler(error, request, response));
}
function getLocation(searchedCity){
    
    const SQL = 'SELECT * FROM locations WHERE search_query = $1';
    const valueSQL = [searchedCity];
    return client.query(SQL, valueSQL).then((searchResult) => {

        if (searchResult.rows.length > 0) {
            return(searchResult.rows[0]);
        } else {
            const geocodeAPIkey = process.env.GEOCODE_API_KEY; 
            const locationAPIurl = (`https://eu1.locationiq.com/v1/search.php?key=${geocodeAPIkey}&q=${searchedCity}&format=json`);
            
            return superAgent.get(locationAPIurl)
                .then(locData => storeINdatabase(searchedCity, locData.body))
        }
    });

}
function storeINdatabase(searchedCity, locData){
    const locationData = new Location(locData[0]);
    let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *';
    let valueSQL = [searchedCity, locationData.formatted_query, locationData.latitude, locationData.longitude];
    return client.query(SQL, valueSQL)
    .then(results => results.rows[0]);
}

function Location(locData) {
    this.search_query = locData.search_query;
    this.formatted_query = locData.display_name;
    this.latitude = locData.lat;
    this.longitude = locData.lon;
}


module.exports = locationFunction;