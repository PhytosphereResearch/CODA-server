const db = require('../db');
const helper = require('./helper');
const Sequelize = require('sequelize');
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
    console.log("agentId", agentId);
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
    console.log("id", id);
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
      const params = request.body.oak;
      const id = params.id;
      const { userName } = request.body;

      //to create record in auditlogs for editing oak
      if (id) {
        const trail = await db.auditLogs.create({//side code to make a record in auditLogs
          user_id: userName,
          table_name: 'oaks',
          table_record_id: id,
          action: 'update',
          new_record: JSON.stringify(params),
        })

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
            db.auditLogs.create({//side code to make a record in auditLogs for add oak
              user_id: userName,
              table_name: 'oaks',
              table_record_id: oak.id,
              action: 'create',
              new_record: JSON.stringify(params),
            })
            response.status(201).json(oak);
          })
      }
    } catch (err) {
      helper.handleError(response)(err);
    }
  },
};
