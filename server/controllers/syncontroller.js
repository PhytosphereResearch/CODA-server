const db = require('../db');
const { UPDATE, CREATE } = require('./constants');
const helper = require('./helper');


module.exports = {
  async getAllSynonyms(request, response) { // retrieve synonym records
    try {
      const data = await db.synonyms.findAll({
        include: {
          model: db.agents,
          attributes: ['commonName']
        }
      });
      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async addSynonym(request, response) { // add a new synonym
    try {
      const { synonym, userName } = request.body;
      let res;
      const isUpdate = !!synonym.id;
      const msg = isUpdate ? 'Synonym updated' : 'Your synonym has been added';

      if (synonym.id) {//for editing an existing synonym
        
        if (synonym.isPrimary === 1) { // changes other primary flags to false
          res = await db.synonyms.update(
            { isPrimary: 0 },
            {
              fields: ['isPrimary'],
              where: { agentId: synonym.agentId },
            }
          )

          const { id } = synonym;
          const record = await db.synonyms.findOne({ where: { id } })
          res = await record.update(synonym) 
        }
        else {//if editing fields other than is primary
          const { id } = synonym;
          const record = await db.synonyms.findOne({ where: { id } })
          res = await record.update(synonym)           
        };
      } 
      else if (synonym.isPrimary === 1) { // for new synonym params.id undefined, changes other primary flags to false 
        res = await db.synonyms.update(
          { isPrimary: 0 },
          {
            fields: ['isPrimary'],
            where: { agentId: synonym.agentId },
          }
        )
        res = await db.synonyms.create(synonym)
      } 
      else {//if params.isPrimary=0 for a new synonym not in database
        res = await db.synonyms.create(synonym)
      }

      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'synonyms',
        table_record_id: res.id,
        action: isUpdate ? UPDATE : CREATE,
        new_record: JSON.stringify(synonym),
      })

      return response.status(201).json({ res, msg });
    } catch (error) {
      return response.status(500).json(error);
    }
  },
};
