const morgan = require('morgan');
const bodyParser = require('body-parser');

module.exports = function middleware(app) {
  app.use(morgan('short'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
};
