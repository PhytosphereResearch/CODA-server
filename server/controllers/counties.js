var db = require('../db');
var helper = require('./helper');

module.exports = {

  getCountiesByAgent: function (request, response) {
    var agentId = request.params.agentId;
    db.countiesByRegions.findAll({
      include: [{ model: db.hostInteractions, required: true, where: { agentId: agentId } }]
    }).then(function (data) {
      response.status(200).json(data);
    }).error(helper.handleError(response));
  }

};
