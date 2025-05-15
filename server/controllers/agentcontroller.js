const db = require('../db');
const Sequelize = require('sequelize');
const helper = require('./helper');

// router.get('/', async (req, res) => {
//   const token = req.auth;
//   const userData = await auth0.getProfile(token);
//   res.send("Got user data");
// });



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
    
    //things needed to make a record in edit_trails
    let currentDate = new Date();
    date=currentDate.toLocaleString();
    // console.log(date);
    const user_id = request.body.userName;
    table_record_id = request.body.agent.id;
    record = request.body.agent;
    new_recordStr = JSON.stringify({ record });
    console.log("new_recordStr", new_recordStr, "table_record_id", table_record_id, "user_id", user_id, "date", date, "currentDate", currentDate);

    const trail = await db.edit_trails.create({ 
      user_id: user_id,
       table_name: 'agents', 
       table_record_id: table_record_id, 
       new_record: new_recordStr, 
      date_time: currentDate
      });
  
    const allParams = request.body.agent;
    // console.log("allParams", allParams);
    
    if (allParams.id) {
      const { id } = allParams;
    db.agents.findOne({ where: { id } })
       
    .then((record) => {
      // console.log("record", record);
      record.update(allParams)
        .then((agt) => {
          response.status(201).json(agt);
          // console.log("agt", agt);
        });
    });
} else {
  const { agent, synonym } = allParams;

      record = allParams;
      new_recordStr = JSON.stringify({ record });
      console.log("new_recordStr", new_recordStr, "table_record_id", table_record_id, "user_id", user_id, "date", date, "currentDate", currentDate);


  db.agents.create(agent)
    .then((res) => {
      const agentID = res.dataValues.id;
      synonym.agentId = agentID;
      db.synonyms.create(synonym)
        .then((agt) => {
          response.status(201).json(agt);
        });
    });
}
  },
};
