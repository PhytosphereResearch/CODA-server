const db = require('../db');
const helper = require('./helper');

module.exports = {

  findAll(request, response) {
    db.symptoms.findAll({})
      .then((data) => {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  addOrUpdate(request, response) {
    const symptom = request.body;
    if (symptom.id) {
      const { id } = symptom;
      delete symptom.id;
      db.symptoms.findOne({ where: { id } })
        .then((record) => {
          record.update(symptom)
            .then((sympt) => {
              response.status(201).json(sympt);
            });
        });
    } else {
      db.symptoms.create(symptom)
        .then((sympt) => {
          response.status(201).json(sympt);
        });
    }
  },

};
