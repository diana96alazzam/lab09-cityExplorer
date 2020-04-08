'use strict';

require('dotenv').config();

const pg = require('pg');
const express = require('express');
const superAgent = require('superagent');
const cors = require('cors');


const PORT = process.env.PORT || 4000;
const app = express();
const helpers = require('./helpers');
app.use(cors());

const locationFunction = require('./location.js');
const weatherFunction = require('./weather.js');
const trailsFunction = require('./trails.js');
const moviesFunction = require('./movies.js')


app.get('/', helpers.homeFunction);
app.get('/bad', helpers.badFunction);
app.get('/location', locationFunction);
app.get('/weather', weatherFunction);
app.get('/trails', trailsFunction);
app.get('/movies', moviesFunction);
app.use('*', helpers.notFoundHandler);
app.use(helpers.errorHandler);


function startServer() {
    app.listen(PORT, () => console.log(`my server is up and running on port ${PORT}`));
  }

const client = require('./client.js');


// connect and listen
client.connect().then(startServer).catch((err) => console.error(err));



