const db = require('../db');
const helper = require('./helper');

module.exports = {

  async findAll(request, response) {
    try {
      const data = await db.symptoms.findAll();

      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async addOrUpdate(request, response) {
    try {
      const { symptom, userName } = request.body;
      const isUpdate = !!symptom.id;
      let res;
      
      if (isUpdate) {
        const { id } = symptom;
        const record = await db.symptoms.findOne({ where: { id } })
        res = await record.update(symptom)
      } 
      else {
        res = await db.symptoms.create(symptom)
      }
      
      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'symptoms',
        table_record_id: res.id,
        action: isUpdate ? 'update' : 'create',
        new_record: JSON.stringify(symptom),
      })

      return response.status(201).json(res);
    } catch (error) {
      return response.status(500).json(error);
    }
  },
};
