const db = require('../db');
const helper = require('./helper');

module.exports = {

  findAll(request, response) {
    db.bibs.findAll({})
      .then((data) => {
        response.status(200).json(data);
      }).error(helper.handleError(response));
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
