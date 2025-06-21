const db = require('../db');
const helper = require('./helper');

module.exports = {

  async getAllOaks(request, response) {
    console.log('Getting all oaks')
    try {
      const data = await db.oaks.findAll();
      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async getOaksByAgent(request, response) {
    const agentId = request.params.agentId;
    try {
      const data = await db.oaks.findAll({
        attributes: ['id', 'genus', 'species', 'subSpecies'],
        include: [{ model: db.hostInteractions, required: true, where: { agentId } }]
      })
      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async getOakById(request, response) {
    const id = request.params.id;
    try {
      const oak = await db.oaks.findOne({ where: { id }, logging: console.log })
      response.status(200).json(oak);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async addOak(request, response) { // post a new oak record or update
    try {
      const params = request.body;
      if (params.id) {
        const id = params.id;
        const oak = await db.oaks.findOne({ where: { id } })
          .then((record) => {
            record.update(params)
              .then((oak) => {
                response.status(201).json(oak);
              })
          })
      } else {
        db.oaks.create(params)
          .then((oak) => {
            response.status(201).json(oak);
          })
      }
    } catch (err) {
      helper.handleError(response)(err);
    }
  },
};
