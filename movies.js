'use strict';

require('dotenv').config();
const superAgent = require('superagent');
const helpers = require('./helpers.js');


function moviesFunction(request, response) {
    const searchedCity = request.query.search_query;
    getMovies(searchedCity)
        .then((moviesData) => helpers.renderStatus(moviesData, response))
        .catch((err) => errorHandler(err, request, response))
}


function getMovies(searchedCity) {
    const moviesAPIkey = process.env.MOVIES_API_KEY;
    const moviesAPIurl = (`https://api.themoviedb.org/3/search/movie?api_key=${moviesAPIkey}&language=en-US&query=${searchedCity}&page=1&include_adult=false`);
    return superAgent.get(moviesAPIurl).then((moviesData) => mappingMoviesData(moviesData.body.results));
}

function mappingMoviesData(moviesData) {
    return moviesData.map((moviesD) => new Movies(moviesD));
}

function Movies(moviesD) {
    this.title = moviesD.title;
    this.overview = moviesD.overview;
    this.average_votes = moviesD.vote_average;
    this.total_votes = moviesD.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${moviesD.poster_path}`; // it gives something like this "/xBHvZcjRiWyobQ9kxBhO6B2dtRI.jpg"
    this.popularity = moviesD.popularity;
    this.released_on = moviesD.release_date;
}

module.exports = moviesFunction;


// getting the region from another api and insert it in this api to get the accurate data

    // let countrySplitted = request.query.formatted_query.split(',');
    // let country = countrySplitted[countrySplitted.length-1];
    // superAgent(`JSON: http://api.worldbank.org/v2/${country}/br?format=json`)
    // .then((region) => {
    //     superAgent(`https://api.themoviedb.org/3/movie/top_rated?api_key==${process.env.MOVIES_API_KEY}&language=en-US&page=1&region=${region}`)
