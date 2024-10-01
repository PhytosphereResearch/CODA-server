const db = require('../db');
const helper = require('./helper');

module.exports = {

  getAllOaks(request, response) {
    db.oaks.findAll({
    }).then((data) => {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  getOaksByAgent(request, response) {
    const agentId = request.params.agentId;
    db.oaks.findAll({
      attributes: ['id', 'genus', 'species', 'subSpecies'],
      include: [{ model: db.hostInteractions, required: true, where: { agentId } }],
    }).then((data) => {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

  getOakById(request, response) {
    const id = request.params.id;
    console.log("testing", id);
    db.oaks.findOne({ where: { id }, logging:console.log })
      .then((oak) => {
        response.status(200).json(oak);
      }).error(helper.handleError(response));
  },

  addOak(request, response) { // post a new oak record or update
    const params = request.body;
    if (params.id) {
      const id = params.id;
      db.oaks.findOne({ where: { id } })
        .then((record) => {
          record.update(params)
            .then((oak) => {
              response.status(201).json(oak);
            });
        });
    } else {
      db.oaks.create(params)
        .then((oak) => {
          response.status(201).json(oak);
        });
    }
  },
};
