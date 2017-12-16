var router = require('express').Router(); //eslint-disable-line
var controllers = require('./controllers');

for (var route in controllers) {
  router.route('/' + route)
    .get(controllers[route].get)
    .post(controllers[route].post);
}

module.exports = router;
