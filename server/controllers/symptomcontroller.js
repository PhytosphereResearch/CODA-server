const db = require('../db');
const helper = require('./helper');

module.exports = {

  async findAll(request, response) {
    try {
      const data = await db.symptoms.findAll();

      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
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
