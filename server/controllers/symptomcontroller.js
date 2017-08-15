var db = require('../db');
var helper = require('./helper');

module.exports = {

  findAll: function (request, response) {
    db.symptoms.findAll({})
      .then(function (data) {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  addOrUpdate: function (request, response) {
    var symptom = request.body;
    if (symptom.id) {
      var id = symptom.id;
      delete symptom.id;
      db.symptoms.findOne({ where: { id: id } })
        .then(function (record) {
          record.update(symptom)
            .then(function(sympt) {
              response.status(201).json(sympt);
            });
        });
    } else {
      console.log('posting a new symptom record');
      db.symptoms.create(symptom)
        .then(function(sympt) {
          response.status(201).json(sympt);
        });
    }
  }

};
