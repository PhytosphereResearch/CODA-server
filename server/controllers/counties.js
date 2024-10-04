const db = require('../db');
const helper = require('./helper');

module.exports = {

  async getCountiesByAgent(request, response) {
    const { agentId } = request.params;
    const data = await db.countiesByRegions.findAll({
      include: [{ model: db.hostInteractions, required: true, where: { agentId } }],
    })//.then((data) => {
      response.status(200).json(data);
    // }).error(helper.handleError(response));
  },

};
