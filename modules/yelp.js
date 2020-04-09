'use strict';

require('dotenv').config();
const superAgent = require('superagent');
const helpers = require('./helpers.js');


function yelpFunction(request, response) {
    const searchedCity = request.query.search_query;
    getYelp(searchedCity)
    .then((yelpData) => helpers.renderStatus(yelpData, response))
    .catch((err) => errorHandler(err, request, response))
}

function getYelp(searchedCity){
    const yelpAPIkey = process.env.YELP_API_KEY;

    const yelpAPIurl = (`https://api.yelp.com/v3/businesses/search?location=${searchedCity}`);
    return superAgent.get(yelpAPIurl).set({ "Authorization": `Bearer ${yelpAPIkey}` })
    .then((yelpData) => mappingYelpData(yelpData.body.businesses));
}

function mappingYelpData(yelpData) {
    return yelpData.map((yelpD) => new Yelp(yelpD));
}


function Yelp(yelpD) {
    this.name = yelpD.name;
    this.image_url = yelpD.image_url;
    this.price = yelpD.price;
    this.rating = yelpD.rating;
    this.url = yelpD.url;
}

module.exports = yelpFunction;
