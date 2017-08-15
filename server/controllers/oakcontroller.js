var db = require('../db');
var helper = require('./helper');

module.exports = {

  getAllOaks: function (request, response) {
    db.oaks.findAll({
    }).then(function (data) {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  getOaksByAgent: function (request, response) {
    var agentId = request.params.agentId;
    db.oaks.findAll({
      attributes: ['id', 'genus', 'species', 'subSpecies'],
      include: [{ model: db.hostInteractions, required: true, where: { agentId: agentId } }]
    }).then(function (data) {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  getOakById: function (request, response) {
    var id = request.params.id;
    db.oaks.findOne({ where: { id: id } })
      .then(function(oak) {
        response.status(200).json(oak);
      }).error(helper.handleError(response));
  },

  // getOneOak: function (request, response) {
  //   console.log('finding one oak');
  //   var params = {};
  //   console.log(request);
  //   // if ( request.query ) {
  //   //   console.log(request.query)
  //   //   var search = request.query.split('%20');
  //   //   params.genus = search[0];
  //   //   params.species = search[1];
  //   // }
  //   db.oaks.findAll({
  //     // where: params
  //   }).then(function (data) {
  //     response.status(200).json(data);
  //   }).error(helper.handleError(response));
  // },

  addOak: function (request, response) { //post a new oak record or update
    var params = request.body;
    if (params.id) {
      var id = params.id;
      db.oaks.findOne({ where: { id: id } })
        .then(function (record) {
          record.update(params)
            .then(function(oak) {
              response.status(201).json(oak);
            });
        });
    } else {
      db.oaks.create(params)
        .then(function(oak) {
          response.status(201).json(oak);
        });
    }
  }
};
