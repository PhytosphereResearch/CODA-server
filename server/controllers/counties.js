const db = require('../db');
const helper = require('./helper');

module.exports = {

  getCountiesByAgent(request, response) {
    const { agentId } = request.params;
    db.countiesByRegions.findAll({
      include: [{ model: db.hostInteractions, required: true, where: { agentId } }],
    }).then((data) => {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  },

};
