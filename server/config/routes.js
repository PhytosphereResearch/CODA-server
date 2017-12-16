const OakController = require('../controllers/oakcontroller');
const AgentController = require('../controllers/agentcontroller');
const SynonymController = require('../controllers/syncontroller');
const CountyController = require('../controllers/counties');
const InteractionController = require('../controllers/hicontroller');
const SymptomController = require('../controllers/symptomcontroller');
const BibController = require('../controllers/bibcontroller');
const checkJwt = require('./auth');

module.exports = function routes(app) {
  app.route('/agent')
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

  app.route('/hi')
    .get(InteractionController.searchByOakAndAgentId);

  app.route('/hi/symptoms')
    .get(InteractionController.getSubSites);

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
