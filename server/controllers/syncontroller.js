const db = require('../db');
const helper = require('./helper');

module.exports = {
  getAllSynonyms(request, response) { // retrieve synonym records
    db.synonyms.findAll({
      include: [{ model: db.agents, attributes: ['commonName'] }],
    })
      .then((data) => {
        response.status(200).json(data);
      }).error(helper.handleError(response));
  },

  // TODO: refactor this
  addSynonym(request, response) { // add a new synonym
    const params = request.body;
    if (params.id) {
      if (params.isPrimary === 1) { // changes other primary flags to false
        db.synonyms.update(
          { isPrimary: 0 },
          {
            fields: ['isPrimary'],
            where: { agentId: params.agentId },
          },
        ).then(() => {
          const { id } = params;
          db.synonyms.findOne({ where: { id } })
            .then((record) => {
              record.update(params)
                .then(() => {
                  response.status('201').json({ message: 'Synonym updated' });
                });
            });
        });
      } else {
        const { id } = params;
        db.synonyms.findOne({ where: { id } })
          .then((record) => {
            record.update(params)
              .then(() => {
                response.status('201').json({ message: 'Synonym updated' });
              });
          });
      }
    } else if (params.isPrimary === 1) { // changes other primary flags to false
      db.synonyms.update(
        { isPrimary: 0 },
        {
          fields: ['isPrimary'],
          where: { agentId: params.agentId },
        },
      )
        .then(() => {
          db.synonyms.create(params)
            .then(() => {
              response.status('201').json({ message: 'Your synonym has been added' });
            });
        });
    } else {
      db.synonyms.create(params)
        .then(() => {
          response.status('201').json({ message: 'Your synonym has been added' });
        });
    }
  },
};
