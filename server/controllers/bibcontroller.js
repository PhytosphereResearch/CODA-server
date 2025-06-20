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

  async addOrUpdate(request, response) {
    console.log("request", request.body);
    const { reference, userName } = request.body;
    console.log("user", userName);
    if (reference.id) {
      const { id } = reference;

      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'bibs',
        table_record_id: id,
        action: 'update',
        new_record: JSON.stringify(reference),
      })

      const record = await db.bibs.findOne({ where: { id } })
      const res = await record.update(reference)
      return response.status(201).json(res);

    } else {
      const res = await db.bibs.create(reference)

      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'bibs',
        table_record_id: res.id,
        action: 'update',
        new_record: JSON.stringify(reference),
      })

      return response.status(201).json(res);
    }
  },

};
