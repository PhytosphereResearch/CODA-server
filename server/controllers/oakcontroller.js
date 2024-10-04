const db = require('../db');
const helper = require('./helper');

module.exports = {

  async getAllOaks(request, response) {
    const data =await db.oaks.findAll();
    // {
    // }).then((data) => {
      response.status(200).json(data);
    // }).error(helper.handleError(response));
  },

  async getOaksByAgent(request, response) {
    const agentId = request.params.agentId;
    const data = await db.oaks.findAll({
      attributes: ['id', 'genus', 'species', 'subSpecies'],
      include: [{ model: db.hostInteractions, required: true, where: { agentId } }],
    })//.then((data) => {
      response.status(200).json(data);
    // }).error(helper.handleError(response));
  },

 async getOakById(request, response) {
    const id = request.params.id;
    console.log("testing", id);
    const oak = await db.oaks.findOne({ where: { id }, logging:console.log })
      // .then((oak) => {
        response.status(200).json(oak);
      // }).error(helper.handleError(response));
  },

 async addOak(request, response) { // post a new oak record or update
    const params = request.body;
    if (params.id) {
      const id = params.id;
      const oak= await db.oaks.findOne({ where: { id } })
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
