const serverless = require('serverless-http');
var http = require('http');
var express = require('express');
var routes = require('./server/config/routes.js'); //new routes
var middleware = require('./server/config/middleware.js');
var cors = require('cors');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors({ origin: process.env.ALLOWED_ORIGIN}));

middleware(app, express);
routes(app, express); //new routes


var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port'));
});

module.exports.app = app;
module.exports.handler = serverless(app);
