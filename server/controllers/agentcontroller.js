var db = require('../db');
var Sequelize = require('sequelize');
var helper = require('./helper');

const getDistinct = (colName, colAlias) => {
  return db.agents.findAll({ attributes: [
    [Sequelize.fn('DISTINCT', Sequelize.col(colName)), colAlias]
  ], raw: true })
  // .then(record => record.get({plain: true}))
    .then(res => res.map(entry => entry[colAlias]).sort().filter(entry => entry));
};

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

  getAgentFields: function(request, response) { // get all agents
    // torder: Sequelize.STRING,
    // family: Sequelize.STRING,
    // mostCommon: Sequelize.BOOLEAN,
    // biotic: Sequelize.BOOLEAN,
    // type: Sequelize.STRING,
    // subType: Sequelize.STRING,
    // subSubType: Sequelize.STRING,
    // ecology: Sequelize.STRING,
    // commonName: Sequelize.STRING,
    // notes: Sequelize.BLOB
    // db.agents.findAll({
    //   attributes: [
    //     [Sequelize.fn('DISTINCT', Sequelize.col('torder')), 'dist_torder'],
    //     // [Sequelize.fn('DISTINCT', Sequelize.col('family')), 'dist_family'],
    //     // [Sequelize.fn('DISTINCT', Sequelize.col('type')), 'dist_type'],
    //     // [Sequelize.fn('DISTINCT', Sequelize.col('subType')), 'dist_subType'],
    //     // [Sequelize.fn('DISTINCT', Sequelize.col('subSubType')), 'dist_subSubType']
    //   ]
    // })
    return Promise.all([
      getDistinct('torder', 'dist_order'),
      getDistinct('family', 'dist_family'),
      getDistinct('type', 'dist_type'),
      getDistinct('subType', 'dist_subType'),
      getDistinct('subSubType', 'dist_subSubType')
    ])
      .then(function(data) {
        let options = ['torder', 'family', 'type', 'subType', 'subSubType'];
        let fields = {};
        data.forEach((field, index) => {
          let option = options[index];
          fields[option] = field;
        });
        response.status(200).json(fields);
      }).catch(helper.handleError(response));
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
