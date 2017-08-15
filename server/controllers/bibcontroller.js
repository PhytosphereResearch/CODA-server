var db = require('../db');
var helper = require('./helper');

module.exports = {

  findAll: function (request, response) {
    db.bibs.findAll({})
    .then(function (data) {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  addOrUpdate: function (request, response) {
    var newReference = request.body;
    if (newReference.id) {
      var id = newReference.id;
      delete newReference.id;
      db.bibs.findOne({ where: { id: id } })
        .then(function (record) {
          record.update(newReference)
            .then(function(res) {
              response.status(201).json(res);
            });
        });
    } else {
      // console.log('posting a new reference record');
      db.bibs.create(newReference)
        .then(function (res) {
          response.status(201).json(res);
        });
    }
  }

};
