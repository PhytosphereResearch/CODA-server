const db = require('../db');
const Sequelize = require('sequelize');
const helper = require('./helper');

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
      response.status(200).json(data);
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

    //things needed to make a record in editTrails
    let currentDate = new Date();
    const { userName, agent } = request.body;
    console.log ("agent", agent);
    const { id } = agent; //this gets the agent id
    const newRecord = JSON.stringify(agent);
    console.log("newRecord", newRecord);

    // const allParams = request.body.agent;//duplicative? this is just agent-right?
   if (agent.id) {//would this be the same as if (agentId) {
    // console.log ("allParamsID", allParams.id);
      // const { id } = allParams;//what is this doing? destructuring agent? recreating agentId again?
      console.log("id",  id );

      const trail = await db.editTrails.create({//side code to make a record in edit trails
        user_id: userName,
        table_name: 'agents',
        table_record_id: id,
        new_record: JSON.stringify(agent),
        date_time: currentDate,
      });

      db.agents.findOne({ where: { id } })//find existing record by agentId and update it with agent
        .then((record) => {
          record.update(agent)
            .then((agt) => {
              response.status(201).json(agt);
            });
        });
    } else {//if new agent created
      const { agent, synonym } = request.body.agent;//synonym is part  of agent
      console.log("agent", agent, "synonym", synonym);
      const newAgent = await db.agents.create(agent);
      const agentID = newAgent.dataValues.id;

      synonym.agentId = agentID;
      const agt = await db.synonyms.create(synonym)
     
      await db.editTrails.create({
        user_id: userName,
        table_name: 'agents',
        table_record_id: agentID,
        new_record: JSON.stringify(agent),
        date_time: currentDate
      });

      await db.editTrails.create({
        user_id: userName,
        table_name: 'synonyms',
        table_record_id: agt.dataValues.id,
        new_record: JSON.stringify(synonym),
        date_time: currentDate
      });
      response.status(201).json(agt);

    }
  },
};
