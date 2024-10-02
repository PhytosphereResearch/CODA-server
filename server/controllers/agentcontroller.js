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
  });
    // }).then((data) => {
      response.status(200).json(data);
    // }).error(helper.handleError(response));
  },

  getAgentFields(request, response) { // get all agents
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

  post(request, response) {
    const allParams = request.body;
    if (allParams.id) {
      const { id } = allParams;
      db.agents.findOne({ where: { id } })
        .then((record) => {
          record.update(allParams)
            .then((agt) => {
              response.status(201).json(agt);
            });
        });
    } else {
      const { agent, synonym } = allParams;
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
