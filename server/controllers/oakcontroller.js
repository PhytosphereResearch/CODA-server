const db = require('../db');
const { UPDATE, CREATE } = require('./constants');
const helper = require('./helper');

module.exports = {

  async getAllOaks(request, response) {
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
      const oak = await db.oaks.findOne({ where: { id } })
      response.status(200).json(oak);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async addOak(request, response) { // post a new oak record or update
    try {
      const { oak, userName } = request.body;
      const isUpdate = !!oak.id;
      let res;

      if (isUpdate) {
        const { id } = oak;
        const record = await db.oaks.findOne({ where: { id } })
       res = await record.update(oak)
      } else {
        res = await db.oaks.create(oak)
      }

      await db.auditLogs.create({//side code to make a record in auditLogs for add or edit oak
          user_id: userName,
          table_name: 'oaks',
          table_record_id: res.id,
          action: isUpdate ? UPDATE : CREATE, 
          new_record: JSON.stringify(oak),
        })
       
      return response.status(201).json(res);    
    } catch (err) {
      helper.handleError(response)(err);
    }
 
  },

};
