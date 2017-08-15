var path = require('path');
var OakController = require('../controllers/oakcontroller');
var AgentController = require('../controllers/agentcontroller');
var SynonymController = require('../controllers/syncontroller');
var CountyController = require('../controllers/counties');
var InteractionController = require('../controllers/hicontroller');
var SymptomController = require('../controllers/symptomcontroller');
var BibController = require('../controllers/bibcontroller');

module.exports = function routes(app) {
  app.route('/agent')
  .post(AgentController.post);

  app.route('/agent/:agtId')
    .get(AgentController.findAgentRecord);

  app.route('/bib')
    .get(BibController.findAll)
    .post(BibController.addOrUpdate);

  app.route('/counties/byagent/:agentId')
    .get(CountyController.getCountiesByAgent);

  app.route('/interactionQuery')
    .get(InteractionController.searchForInteraction);

  app.route('/hi/:hiId')
    .get(InteractionController.getOne);

  app.route('/oaks')
    .get(OakController.getAllOaks)
    .post(OakController.addOak);

  app.route('/oaks/hostfor/:agentId')
    .get(OakController.getOaksByAgent);

  app.route('/oaks/:id')
    .get(OakController.getOakById);

  app.route('/symptoms')
    .get(SymptomController.findAll)
    .post(SymptomController.addOrUpdate);

  app.route('/syn')
    .get(SynonymController.getAllSynonyms)
    .post(SynonymController.addSynonym);

  app.route('/search/*')
    .get(function root(req, res) {
      res.sendFile(path.join(__dirname, '/../../client/index.html'));
    });
};
