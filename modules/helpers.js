'use strict';

// helper functions
function notFoundHandler(request, response) {
    response.status(404).send('Not Found');
}

function errorHandler(error, request, response) {
    response.status(500).send(error);
}

function renderStatus(data, response) {
    response.status(200).json(data);
}

function homeFunction(request, response){
    response.status(200).send('Home Page');
}
function badFunction(request, response){
    throw new Error('Error!');
}



module.exports = {
    notFoundHandler : notFoundHandler,
    errorHandler : errorHandler,
    renderStatus : renderStatus,
    homeFunction : homeFunction,
    badFunction : badFunction
}
