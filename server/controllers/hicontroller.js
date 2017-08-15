var db = require('../db');
var helper = require('./helper');

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
    // console.log('find the thing');
    var hiId = request.params.hiId;
    db.hostInteractions.findOne({
      include: [
        { model: db.hiSymptoms, include: [{ model: db.symptoms }] },
        { model: db.oaks },
        { model: db.agents, include: [
          { model: db.synonyms },
        ]
          // { model: db.hostInteractions, attributes: ['id'], include: [
          //   { model: db.countiesByRegions }]
          // }]
        },
        { model: db.bibs },
        { model: db.countiesByRegions }
      ],
      where: { id: hiId }
    })
      .then(function(data) {
        // console.log(data);
        response.status(200).json(data);
      }).error(helper.handleError(response));
  }

};
