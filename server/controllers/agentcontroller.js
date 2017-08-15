var db = require('../db');
var helper = require('./helper');

module.exports = {

  findAgentRecord: function(request, response) { // get one agent AND associated counties and oaks
    var agentId = request.params.agtId;
    db.agents.findOne({
      where: { id: agentId },
      include: [
        { model: db.synonyms },
        { model: db.hostInteractions, attributes: ['id'], include: [
          { model: db.oaks, attributes: ['id', 'genus', 'species', 'subSpecies'] },
          { model: db.countiesByRegions }
        ] }
      ]
    }).then(function (data) {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  post: function (request, response) {
    var allParams = request.body;
    if (allParams.id) {
      var id = allParams.id;
      db.agents.findOne({ where: { id: id } })
        .then(function (record) {
          record.update(allParams)
            .then(function(agt) {
              response.status(201).json(agt);
            });
        });
    } else {
      var agent = allParams.agent;
      var synonym = allParams.synonym;
      db.agents.create(agent)
        .then(function (res) {
          var agentID = res.dataValues.id;
          synonym.agentId = agentID;
          db.synonyms.create(synonym)
            .then(function (agt) {
              response.status(201).json(agt);
            });
        });
    }
  }
};
