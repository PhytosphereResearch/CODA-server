const db = require('../db');
const helper = require('./helper');

module.exports = {

  async getCountiesByAgent(request, response) {
    const { agentId } = request.params;
    try {
      const data = await db.countiesByRegions.findAll({
        include: [{ model: db.hostInteractions, required: true, where: { agentId } }],
      })
      response.status(200).json(data);
    }
    catch (err) {
      helper.handleError(response)(err);
    }
  },
};
