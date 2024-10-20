const db = require('../db');
const helper = require('./helper');

module.exports = {

  async findAll(request, response) {
    try {
      const data = await db.bibs.findAll();
      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  addOrUpdate(request, response) {
    const newReference = request.body;
    if (newReference.id) {
      const { id } = newReference;
      delete newReference.id;
      db.bibs.findOne({ where: { id } })
        .then((record) => {
          record.update(newReference)
            .then((res) => {
              response.status(201).json(res);
            });
        });
    } else {
      // console.log('posting a new reference record');
      db.bibs.create(newReference)
        .then((res) => {
          response.status(201).json(res);
        });
    }
  },

};
