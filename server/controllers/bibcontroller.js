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
    try {
      const { reference, userName } = request.body;
      const isUpdate = !!reference.id
      let res;

      if (isUpdate) {
        const { id } = reference;
        const record = await db.bibs.findOne({ where: { id } })
        res = await record.update(reference)
      } else {
        res = await db.bibs.create(reference)
      }

      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'bibs',
        table_record_id: res.id,
        action: isUpdate ? 'update' : 'create',
        new_record: JSON.stringify(reference),
      })

      return response.status(201).json(res);
    } catch (err) {
      helper.handleError(response)(err);
    }

  },

};
