var http = require('http');
var express = require('express');
var routes = require('./config/routes'); //new routes
var middleware = require('./config/middleware.js');
var cors = require('cors');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());


middleware(app, express);
routes(app, express); //new routes


var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});


module.exports.app = app;
