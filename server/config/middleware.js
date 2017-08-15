var morgan = require('morgan');
var bodyParser = require('body-parser');

module.exports = function middleware(app) {
  app.use(morgan('short'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
};
