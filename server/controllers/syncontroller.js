var db = require('../db');
var helper = require('./helper');

module.exports = {
  getAllSynonyms: function (request, response) { //retrieve synonym records
    db.synonyms.findAll({
      include: [{ model: db.agents, attributes: ['commonName'] }]
    })
      .then(function (data) {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  //TODO: refactor this
  addSynonym: function (request, response) { //add a new synonym
    var params = request.body;
    if (params.id) {
      if (params.isPrimary === 1) { //changes other primary flags to false
        db.synonyms.update(
          { isPrimary: 0 },
          {
            fields: ['isPrimary'],
            where: { agentId: params.agentId }
          }).then(function () {
          var id = params.id;
          db.synonyms.findOne({ where: { id: id } })
            .then(function (record) {
              record.update(params)
                .then(function() {
                  response.status('201').json({ message: 'Synonym updated' });
                });
            });
        });
      } else {
        var id = params.id;
        db.synonyms.findOne({ where: { id: id } })
          .then(function (record) {
            record.update(params)
              .then(function() {
                response.status('201').json({ message: 'Synonym updated' });
              });
          });
      }
    } else {
      if (params.isPrimary === 1) { //changes other primary flags to false
        db.synonyms.update(
          { isPrimary: 0 },
          {
            fields: ['isPrimary'],
            where: { agentId: params.agentId }
          })
          .then(function () {
            db.synonyms.create(params)
              .then(function() {
                response.status('201').json({ message: 'Your synonym has been added' });
              });
          });
      } else {
        db.synonyms.create(params)
          .then(function() {
            response.status('201').json({ message: 'Your synonym has been added' });
          });
      }
    }
  },

  // MAYBE DEPRECATED CODE
  // synLookup: {
  //   get: function (request, response) {
  //
  //   },
  //   post: function (request, response) {
  //     console.log("Retrieving agent record");
  //     collectData(request, function (data) {
  //       var params = JSON.parse(data);
  //       // console.log(params);
  //       db.synonyms.findAll({
  //         attributes: ['agentId'],
  //         where: params
  //       }).then(function (data) {
  //         var agtID = JSON.parse(JSON.stringify(data))[0].agentId;
  //         db.synonyms.findAll({
  //           where: {agentId: agtID}
  //         }).then(function (data) {
  //           var data = JSON.stringify(data);
  //           sendResponse(response, data, 200);
  //         });
  //       }).catch(function (err) {
  //         var err = JSON.stringify(err);
  //         sendResponse(response, err, 404);
  //       });
  //     });
  //   }
  // },


};
