const db = require('../db');
const Sequelize = require('sequelize');
const helper = require('./helper');
const { UPDATE, CREATE } = require('./constants');
const auditController = require('./auditcontroller');

const getDistinct = (colName, colAlias) => db.agents.findAll({
  attributes: [
    [Sequelize.fn('DISTINCT', Sequelize.col(colName)), colAlias],
  ],
  raw: true,
})
  .then(res => res.map(entry => entry[colAlias]).sort().filter(entry => entry));

module.exports = {

  async findAgentRecord(request, response) { // get one agent AND associated counties and oaks
    const agentId = request.params.agtId;
    const tableName = "agents";
    const tableRecordId = agentId;
    try {
      const data = await db.agents.findOne({
        where: { id: agentId }, 
        include: [
          { model: db.synonyms },
          {
            model: db.hostInteractions,
            attributes: ['id'],
            include: [
              { model: db.oaks, attributes: ['id', 'genus', 'species', 'subSpecies'] },
              { model: db.countiesByRegions },
            ],
          },
        ], 
      })
    
      const auditRecords = await auditController.getAuditRecords( tableRecordId, tableName );
      const dataParse = JSON.parse(JSON.stringify(data));
      response.status(200).json({ ...dataParse, auditRecords });
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },

  async getAgentFields(request, response) { // get all agents
    return Promise.all([
      getDistinct('torder', 'dist_order'),
      getDistinct('family', 'dist_family'),
      getDistinct('type', 'dist_type'),
      getDistinct('subType', 'dist_subType'),
      getDistinct('subSubType', 'dist_subSubType'),
    ])
      .then((data) => {
        const options = ['torder', 'family', 'type', 'subType', 'subSubType'];
        const fields = {};
        data.forEach((field, index) => {
          const option = options[index];
          fields[option] = field;
        });
        
        response.status(200).json(fields);
      }).catch(helper.handleError(response));
  },

  async post(request, response) {

    //things needed to make a record in auditLogs
    const { userName, agent } = request.body;
    const { id } = agent; //this gets the agent id
   
    if (agent.id) {
      await db.auditLogs.create({//side code to make a record in auditLogs
        user_id: userName,
        table_name: 'agents',
        table_record_id: id,
        action: UPDATE,
        new_record: JSON.stringify(agent),
      })

      db.agents.findOne({ where: { id } })//find existing record by agentId and update it with agent
        .then((record) => {
          record.update(agent)
            .then((agt) => {
              response.status(201).json(agt);
            });
        });
    } else {//if new agent created
      const { agent, synonym } = request.body.agent;//synonym is part  of agent
      const newAgent = await db.agents.create(agent);
      const agentID = newAgent.dataValues.id;
      synonym.agentId = agentID;
      const agt = await db.synonyms.create(synonym)

      await db.auditLogs.create({
        user_id: userName,
        table_name: 'agents',
        table_record_id: agentID,
        action: CREATE,
        new_record: JSON.stringify(agent),
      });

      await db.auditLogs.create({
        user_id: userName,
        table_name: 'synonyms',
        table_record_id: agt.dataValues.id,
        action: CREATE,
        new_record: JSON.stringify(synonym),
      });
      response.status(201).json(agt);
    }
  },
};
