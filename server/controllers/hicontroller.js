const db = require('../db');
const helper = require('./helper');
const Sequelize = require('sequelize');
const uniq = require('lodash.uniq');
const { UPDATE, CREATE } = require('./constants');
const auditController = require('./auditcontroller');

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
// group ids of symptoms within a general category together for querying
const multiSymptomIds = {
  gall: ['32', '21', '37'],
  rot: ['57', '9', '11', '51', '76'],
  canker: ['10', '11', '48', '72'],
};

const buildSymptomQuery = (symptomId) => {
  // if a symptom id represents one of our general categories,
  // we include every symptom in the category in our query
  if (!symptomId) {
    return { model: db.symptoms, required: true };
  } else if (symptomId === '32') {
    return { model: db.symptoms, required: true, where: { id: { [Op.or]: multiSymptomIds.gall } } }
  } else if (symptomId === '57') {
    return { model: db.symptoms, required: true, where: { id: { [Op.or]: multiSymptomIds.rot } } }
  } else if (symptomId === '10') {
    return { model: db.symptoms, required: true, where: { id: { [Op.or]: multiSymptomIds.canker } } }
  }
  return { model: db.symptoms, required: true, where: { id: symptomId } }
};

module.exports = {
  async searchForInteraction(request, response) {
    const { plantPart, symptomId, oakId } = request.query;
    // establish Oak include with or without query
    const oakQuery = oakId ? { model: db.oaks, where: { id: oakId } } : { model: db.oaks };
    // establish Symptoms include with or without query
    const symptomQuery = buildSymptomQuery(symptomId);
    const plantPartQuery = plantPart ? { plantPart } : {};
    if (symptomId || oakId) {
      try {
        const data = await db.hiSymptoms.findAll({
          include: [{
            model: db.hostInteractions,
            required: true,
            include: [
              oakQuery,
              { model: db.agents, include: [{ model: db.synonyms, where: { isPrimary: true } }] },
            ],
          }, symptomQuery],
          where: plantPartQuery,
        });
        response.status(200).json(data);
      }
      catch (err) {
        helper.handleError(response)(err);
      }
    }
  },

  async getOne(request, response) {
    const { hiId } = request.params;
    try {
      const data = await db.hostInteractions.findOne({
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
      });
      const auditRecords = await auditController.getAuditRecords(hiId, "hostinteractions");
      const dataParse = JSON.parse(JSON.stringify(data));
   
      response.status(200).json({ ...dataParse, auditRecords });
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  getSubSites(request, response) {
    getDistinct('subSite', 'dist_subSite')
      .then(data => data.map((string) => {
        const split = string.split(';').map(str => str.trim());
        return split;
      }).reduce((a, b) => a.concat(b)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())))
      .then(data => uniq(data))
      .then((data) => {
        response.status(200).json(data);
      });
  },

  async searchByOakAndAgentId(request, response) {
    const { agentId, oakId } = request.query;
    try {
      await db.hostInteractions.findOne({
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
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async addOrUpdate(request, response) {
    try {
      const { hi, userName } = request.body;
      const hiParams = {};
      let res;
      const isUpdate = !!hi.id;
      hiParams.questionable = hi.questionable;
      hiParams.situation = hi.situation.join(';');
      hiParams.hostLifeStage = hi.hostLifeStage.join(';');
      hiParams.notes = hi.notes;
      const hiSymptomList = Object.keys(hi.hiSymptoms).map(key => hi.hiSymptoms[key]);

      if (isUpdate) {
        const { id } = hi;
        hiParams.id = id;
        const record = await db.hostInteractions.findOne({ where: { id } })
        res = await record.update(hiParams)
      } else {
        hiParams.oakId = hi.oakId;
        hiParams.agentId = hi.agentId;
        res = await db.hostInteractions.create(hiParams);
        hiSymptomList.forEach(hiSymptom => hiSymptom.hostInteractionId = res.id);
      }

      let [hiLocations, hiReferences, ...hiSymptoms] = await Promise.all([
        updateHiLocations(res, hi.countiesByRegions),
        updateHiReferences(res, hi.bibs),
      ].concat(hiSymptomList.map(hiSymptom => updateHiSymptom(hiSymptom))));

      let rec = {};
      if (isUpdate) {
        let { dataValues, isNewRecord } = res;
        rec = { dataValues, isNewRecord, hiLocations, hiReferences, hiSymptoms };
      }
      else {
        rec = hi;
      }

      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'hostinteractions or related',
        table_record_id: isUpdate ? hi.id : res.id,
        action: isUpdate ? UPDATE : CREATE,
        new_record: JSON.stringify(rec),
      })

      return response.status(201).json(res);
    } catch (error) {
      return response.status(500).json(error);
    }
  }
};
