'use strict';

require('dotenv').config();

const pg = require('pg');
const express = require('express');
const superAgent = require('superagent');
const cors = require('cors');


const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());


// connection to psql
const client = new pg.Client(process.env.DATABASE_URL);

// connection to psql error
client.on('error', (err) => {
    throw new Error(err);
});

app.get('/', (request, response) => {
    response.status(200).send('Home Page');
});

// bad page
app.get('/bad', (request, response) => {
    throw new Error('Error!');
});

// location API
app.get('/location', (request, response) => {
    const city = request.query.city;
    const SQL = 'SELECT * FROM locations WHERE search_query = $1';
    const valueSQL = [city];

    client.query(SQL, valueSQL).then((searchResult) => {

        if (searchResult.rows.length > 0) {
            response.status(200).json(searchResult.rows[0]);
        } else {
            superAgent(`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${request.query.city}&format=json`)

                .then((locationRes) => {
                    const locData = locationRes.body;
                    const locationData = new Location(city, locData);
                    const SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *';
                    const valueSQL = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
                    client.query(SQL, valueSQL).then((results) => {
                        response.status(200).json(results.rows[0]);
                    })

                }).catch(() =>
                    app.use((error, request, response) => {
                        response.status(500).send(error);
                    })
                );
        }
    })
});

// weather API
app.get('/weather', (request, response) => {

    superAgent(`https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`)

        .then((weatherRes) => {
            const weatherForecast = weatherRes.body.data.map((dayWeather) => {
                return new Weather(dayWeather);
            });
            response.status(200).json(weatherForecast);
        })
        .catch((err) => errorHandler(err, request, response));

});


// trails API
app.get('/trails', (request, response) => {

    superAgent(`https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=200&key=${process.env.HIKING_API_KEY}`)

        .then((trailsRes) => {
            const trailsData = trailsRes.body.trails.map((trailD) => {
                return new Trail(trailD);
            });
            response.status(200).json(trailsData);
        })
        .catch((errT) => errorHandler(errT, request, response));

});


// movies API
app.get('/movies', (request, response) => {


    superAgent(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.MOVIES_API_KEY}&language=en-US&page=1`)

        .then((moviesRes) => {
            const moviesData = moviesRes.body.results.map((moviesD) => {
                return new Movies(moviesD);
            });
            response.status(200).json(moviesData);
        })
        .catch((errM) => errorHandler(errM, request, response));

});



// yelp API





// location construtor
function Location(city, locData) {
    this.search_query = city;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;
}

// weather construtor
function Weather(dayWeather) {
    this.forecast = dayWeather.weather.description;
    this.time = new Date(dayWeather.datetime).toDateString();
}

// trail construtor
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

// movies construtor
function Movies(moviesD) {
    this.title = moviesD.title;
    this.overview = moviesD.overview;
    this.average_votes = moviesD.vote_average;
    this.total_votes = moviesD.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${moviesD.poster_path}`; // it gives something like this "/xBHvZcjRiWyobQ9kxBhO6B2dtRI.jpg"
    this.popularity = moviesD.popularity;
    this.released_on = moviesD.release_date;
}


// yelp construtor



app.use('*', notFoundHandler);


// helper functions
function notFoundHandler(request, response) {
    response.status(404).send('Not Found');
}

function errorHandler(error, request, response) {
    response.status(500).send(error);
}


// connect and listen
client.connect().then(() => {

    app.listen(PORT, () => {
        console.log(`my server is up and running on port ${PORT}`)
    });

}).catch((err) => {
    throw new Error(`startup error ${err}`);
});


