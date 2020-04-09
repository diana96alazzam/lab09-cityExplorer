'use strict';

require('dotenv').config();
const client = require('./client.js');
const superAgent = require('superagent');
const helpers = require('./helpers.js');

function locationFunction(request, response){
    const city = request.query.city;
    getLocation(city).then(data => helpers.renderStatus(data, response))
    .catch((error) => helpers.errorHandler(error, request, response));
}
function getLocation(city){
    const SQL = 'SELECT * FROM locations WHERE search_query = $1';
    const valueSQL = [city];
    return client.query(SQL, valueSQL).then((searchResult) => {

        if (searchResult.rows.length > 0) {
            return(searchResult.rows[0]);
        } else {
            const API_URL = (`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`);
            
            return superAgent.get(API_URL)

                .then((locData) => {
                    storeINdatabase(city, locData.body)
                }).catch(() =>
                    app.use((error, request, response) => {
                        response.status(500).send(error);
                    })
                );
        }
    })

}
function storeINdatabase(city, locData){
    const locationData = new Location(locData[0]);
    const SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *';
    const valueSQL = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
    return client.query(SQL, valueSQL).then((results) => {
        results.rows[0];
    })
}

function Location(city, locData) {
    this.search_query = city;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;
}


module.exports = locationFunction;