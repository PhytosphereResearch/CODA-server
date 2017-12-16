var db = require('../db');
var helper = require('./helper');
var Sequelize = require('sequelize');
var uniq = require('lodash.uniq');
const getDistinct = (colName, colAlias) => {
  return db.hiSymptoms.findAll({ attributes: [
    [Sequelize.fn('DISTINCT', Sequelize.col(colName)), colAlias]
  ], raw: true })
    .then(res => res.map(entry => entry[colAlias]).sort().filter(entry => entry));
};

module.exports = {

  searchForInteraction: function (request, response) {
    var plantPart = request.query.plantPart;
    var symptomId = request.query.symptomId;
    var oakId = request.query.oakId;
    // establish Oak include with or without query
    var oakQuery = oakId ? { model: db.oaks, where: { id: oakId } } : { model: db.oaks };
    // establish Symptoms include with or without query
    var symptomQuery = symptomId ? { model: db.symptoms, required: true, where: { id: symptomId } } : { model: db.symptoms, required: true };
    var plantPartQuery = plantPart ? { plantPart: plantPart } : {};
    if (symptomId || oakId) {
      db.hiSymptoms.findAll ({
        include: [{ model: db.hostInteractions,
          include: [oakQuery, { model: db.agents, include: [{ model: db.synonyms, where: { isPrimary: true } }] }]
        }, symptomQuery],
        where: plantPartQuery
      }).then(function (data) {
        response.status(200).json(data);
      }).error(helper.handleError(response));
    }
  },

  getOne: function (request, response) {
    var hiId = request.params.hiId;
    db.hostInteractions.findOne({
      include: [
        { model: db.hiSymptoms, include: [{ model: db.symptoms }] },
        { model: db.oaks },
        { model: db.agents, include: [
          { model: db.synonyms },
        ]
        },
        { model: db.bibs },
        { model: db.countiesByRegions }
      ],
      where: { id: hiId }
    })
      .then(function(data) {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  getSubSites: function(request, response) {
    getDistinct('subSite', 'dist_subSite')
      .then(data => {
        return data.map(string => {
          let split = string.split(';').map(string => string.trim());
          return split;
        }).reduce((a, b) => a.concat(b)).sort();
      })
      .then(data => uniq(data))
      .then(function(data) {
        response.status(200).json(data);
      });
  },

  searchByOakAndAgentId: function (request, response) {
    let agentId = request.query.agentId;
    let oakId = request.query.oakId;
    db.hostInteractions.findOne({
      include: [
        { model: db.hiSymptoms, include: [{ model: db.symptoms }] },
        { model: db.oaks, where: { id: oakId } },
        { model: db.agents, where: { id: agentId}, include: [
          { model: db.synonyms },
        ]
        },
        { model: db.bibs },
        { model: db.countiesByRegions }
      ]
    })
      .then(data => response.status(200).json(data))
      .error(helper.handleError(response));
  }
};
