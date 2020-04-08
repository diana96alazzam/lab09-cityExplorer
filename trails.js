'use strict';

require('dotenv').config();
const superAgent = require('superagent');
const helpers = require('./helpers.js');


function trailsFunction(request, response){
    const searchedLatitude = request.query.latitude;
    const searchedLongitude = request.query.longitude;

    getTrailsData(searchedLatitude, searchedLongitude).then(trailsData => helpers.renderStatus(trailsData, response))
    .catch((error) => helpers.errorHandler(err, request, response));
}

function getTrailsData(searchedLatitude, searchedLongitude) {
    const trailsAPIkey = process.env.HIKING_API_KEY;
    const trailsAPIurl = (`https://www.hikingproject.com/data/get-trails?lat=${searchedLatitude}&lon=${searchedLongitude}&maxDistance=1000&key=${trailsAPIkey}`);

    return superAgent.get(trailsAPIurl).then((trailsData => mappingTrailsData(trailsData.body.trails)))

}

function mappingTrailsData(trailsData) {
    return trailsData.map((trailD) => {
        return new Trail(trailD);
    });
}

function Trail(trailD) {
    this.name = trailD.name;
    this.location = trailD.location;
    this.length = trailD.length;
    this.stars = trailD.stars;
    this.star_votes = trailD.starVotes;
    this.summary = trailD.summary;
    this.trail_url = trailD.url;
    this.conditions = trailD.conditionDetails;
    this.condition_date = trailD.conditionDate.slice(0, 11);
    this.condition_time = (trailD.conditionDate.slice(-8));
}

module.exports = trailsFunction;