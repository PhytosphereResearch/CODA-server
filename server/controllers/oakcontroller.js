const db = require('../db');
const helper = require('./helper');

module.exports = {

  async getAllOaks(request, response) {
    console.log('Getting all oaks')
    try {
      const data = await db.oaks.findAll();
      console.log('oak data', data)
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
      const { oak, userName } = request.body;
      const { id } = oak;

      if (id) {
        await db.auditLogs.create({//to create record in auditlogs for updating oak record
          user_id: userName,
          table_name: 'oaks',
          table_record_id: id,
          action: 'update',
          new_record: JSON.stringify(oak),
        })

        const record = await db.oaks.findOne({ where: { id } })
        const updatedOak = await record.update(oak)
        return response.status(201).json(updatedOak);

      } else {
        const newOak = await db.oaks.create(oak)
        db.auditLogs.create({//side code to make a record in auditLogs for add oak
          user_id: userName,
          table_name: 'oaks',
          table_record_id: newOak.id,
          action: 'create',
          new_record: JSON.stringify(oak),
        })
        return response.status(201).json(newOak);
      }
    } catch (err) {
      helper.handleError(response)(err);
    }
  },
};
