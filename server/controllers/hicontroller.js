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
  if (!locations || !locations.length) {
    return hiRecord.setCountiesByRegions([]);
  }
  return db.countiesByRegions.findAll({ where: { countyCode: { [Op.or]: locations } } })
    .then(counties => hiRecord.setCountiesByRegions(counties));
};

const updateHiReferences = (hiRecord, references) => {
  if (!references || !references.length) {
    return hiRecord.setBibs([]);
  }
  return db.bibs.findAll({ where: { id: { [Op.or]: references } } })
    .then(bibs => hiRecord.setBibs(bibs));
};

const updateHiSymptomList = (hiSymptomRecord, symptomList) => {
  if (!symptomList || !symptomList.length) {
    return hiSymptomRecord.setSymptoms([]);
  }
  return db.symptoms.findAll({ where: { id: { [Op.or]: symptomList.map(s => s.id) } } })
    .then(symptomRecords => hiSymptomRecord.setSymptoms(symptomRecords));
};

const updateHiSymptom = (hiSymptom) => {
  const { symptoms } = hiSymptom;
  delete hiSymptom.symptoms;
  return Promise.resolve()
    .then(() => {
      if (hiSymptom.id) {
        return db.hiSymptoms.findOne({ where: { id: hiSymptom.id } })
          .then((record) => {
            delete hiSymptom.hostInteractionId;
            return record.update(hiSymptom);
          });
      }
      return db.hiSymptoms.create(hiSymptom);
    })
    .then(record => updateHiSymptomList(record, symptoms));
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
          required: true,
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
    const hiSymptomList = Object.keys(allParams.hiSymptoms).map(key => allParams.hiSymptoms[key]);
    return Promise.resolve()
      .then(() => {
        if (allParams.id) {
          const { id } = allParams;
          hiParams.id = id;
          return db.hostInteractions.findOne({ where: { id } })
            .then(record => record.update(hiParams));
        }
        hiParams.oakId = allParams.oakId;
        hiParams.agentId = allParams.agentId;
        return db.hostInteractions.create(hiParams)
          .then((record) => {
            hiSymptomList.forEach(hiSymptom => hiSymptom.hostInteractionId = record.id);
            return record;
          });
      })
      .then(hi => Promise.all([
        updateHiLocations(hi, allParams.countiesByRegions),
        updateHiReferences(hi, allParams.bibs),
      ].concat(hiSymptomList.map(hiSymptom => updateHiSymptom(hiSymptom)))))
      .then(() => response.status(201).json({ message: 'Updated' }));
  },
};
