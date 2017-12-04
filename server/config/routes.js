var OakController = require('../controllers/oakcontroller');
var AgentController = require('../controllers/agentcontroller');
var SynonymController = require('../controllers/syncontroller');
var CountyController = require('../controllers/counties');
var InteractionController = require('../controllers/hicontroller');
var SymptomController = require('../controllers/symptomcontroller');
var BibController = require('../controllers/bibcontroller');
var checkJwt = require('./auth');

module.exports = function routes(app) {
  app.route('/agents')
    .post(AgentController.post);

  app.route('/agent/fields')
    .get(AgentController.getAgentFields);

  app.route('/agent/:agtId')
    .get(AgentController.findAgentRecord);

  app.route('/bib')
    .get(BibController.findAll)
    .post(checkJwt, BibController.addOrUpdate);

  app.route('/counties/byagent/:agentId')
    .get(CountyController.getCountiesByAgent);

  app.route('/interactionQuery')
    .get(InteractionController.searchForInteraction);

  app.route('/hi/:hiId')
    .get(InteractionController.getOne);

  app.route('/oaks')
    .get(OakController.getAllOaks)
    .post(checkJwt, OakController.addOak);

  app.route('/oaks/hostfor/:agentId')
    .get(OakController.getOaksByAgent);

  app.route('/oaks/:id')
    .get(OakController.getOakById);

  app.route('/symptoms')
    .get(SymptomController.findAll)
    .post(checkJwt, SymptomController.addOrUpdate);

  app.route('/syn')
    .get(SynonymController.getAllSynonyms)
    .post(checkJwt, SynonymController.addSynonym);
};
