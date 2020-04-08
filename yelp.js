'use strict';

require('dotenv').config();
const superAgent = require('superagent');
const helpers = require('./helpers.js');




// Need refactoring-----------------------------------------------------------------
app.get('/yelp', (request, response) => {

    superAgent('https://api.yelp.com/v3/businesses/search').key(process.env.YELP_API_KEY)

        .then((yelpRes) => {
            const yelpData = yelpRes.body.businesses.map((yelpD) => {
                return new Yelp (yelpD);
            });
            response.status(200).json(yelpData);
        })
        .catch((errY) => errorHandler(errY, request, response));

});

function Yelp(yelpD) {
    this.name = yelpD.name;
    this.image_url = yelpD.image_url;
    this.price = yelpD.price;
    this.rating = yelpD.rating;
    this.url = yelpD.url;
}
