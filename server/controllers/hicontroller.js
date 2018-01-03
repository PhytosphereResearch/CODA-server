const db = require('../db');
const helper = require('./helper');
const Sequelize = require('sequelize');
const uniq = require('lodash.uniq');

const { Op } = Sequelize;

const getDistinct = (colName, colAlias) => db.hiSymptoms.findAll({
  attributes: [
    [Sequelize.fn('DISTINCT', Sequelize.col(colName)), colAlias],
  ],
  raw: true,
})
  .then(res => res.map(entry => entry[colAlias]).sort().filter(entry => entry));

const updateHiLocations = (hiRecord, locations) => {
  db.countiesByRegions.findAll({ where: { countyCode: { [Op.or]: locations } } })
    .then(counties => hiRecord.setCountiesByRegions(counties));
};

module.exports = {

  searchForInteraction(request, response) {
    const { plantPart, symptomId, oakId } = request.query;
    // establish Oak include with or without query
    const oakQuery = oakId ? { model: db.oaks, where: { id: oakId } } : { model: db.oaks };
    // establish Symptoms include with or without query
    const symptomQuery = symptomId ?
      { model: db.symptoms, required: true, where: { id: symptomId } } :
      { model: db.symptoms, required: true };
    const plantPartQuery = plantPart ? { plantPart } : {};
    if (symptomId || oakId) {
      db.hiSymptoms.findAll({
        include: [{
          model: db.hostInteractions,
          include: [
            oakQuery,
            { model: db.agents, include: [{ model: db.synonyms, where: { isPrimary: true } }] },
          ],
        }, symptomQuery],
        where: plantPartQuery,
      }).then((data) => {
        response.status(200).json(data);
      }).error(helper.handleError(response));
    }
  },

  getOne(request, response) {
    const { hiId } = request.params;
    db.hostInteractions.findOne({
      include: [
        { model: db.hiSymptoms, include: [{ model: db.symptoms }] },
        { model: db.oaks },
        {
          model: db.agents,
          include: [
            { model: db.synonyms },
          ],
        },
        { model: db.bibs },
        { model: db.countiesByRegions },
      ],
      where: { id: hiId },
    })
      .then((data) => {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  getSubSites(request, response) {
    getDistinct('subSite', 'dist_subSite')
      .then(data => data.map((string) => {
        const split = string.split(';').map(str => str.trim());
        return split;
      }).reduce((a, b) => a.concat(b)).sort())
      .then(data => uniq(data))
      .then((data) => {
        response.status(200).json(data);
      });
  },

  searchByOakAndAgentId(request, response) {
    const { agentId, oakId } = request.query;
    db.hostInteractions.findOne({
      include: [
        { model: db.hiSymptoms, include: [{ model: db.symptoms }] },
        { model: db.oaks, where: { id: oakId } },
        {
          model: db.agents,
          where: { id: agentId },
          include: [
            { model: db.synonyms },
          ],
        },
        { model: db.bibs },
        { model: db.countiesByRegions },
      ],
    })
      .then(data => response.status(200).json(data))
      .error(helper.handleError(response));
  },

  addOrUpdate(request, response) {
    const allParams = request.body;
    const hiParams = {};
    hiParams.questionable = allParams.questionable;
    hiParams.situation = allParams.situation.join(';');
    hiParams.hostLifeStage = allParams.hostLifeStage.join(';');
    hiParams.notes = allParams.notes;
    if (allParams.id) {
      const { id } = allParams;
      hiParams.id = id;
      db.hostInteractions.findOne({ where: { id } })
        .then(record => record.update(hiParams))
        .then(hi => updateHiLocations(hi, allParams.countiesByRegions))
        .then(() => response.status(201).json({ message: 'Updated' }));
    }
  },
};
