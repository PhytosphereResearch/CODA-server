var Sequelize = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  var dotenv = require('dotenv');
  dotenv.load();
}
var user = process.env.RDS_USERNAME;
var pass = process.env.RDS_PASSWORD;
var database = process.env.RDS_DB_NAME;
var host = process.env.RDS_DB_HOST;
var orm = new Sequelize(database, user, pass, {
  host: host,
  dialect: 'mysql'
});

var oaks = orm.define('oaks', {
  genus: Sequelize.STRING,
  subGenus: Sequelize.STRING,
  species: Sequelize.STRING,
  subSpecies: Sequelize.STRING,
  commonName: Sequelize.STRING,
  authority: Sequelize.STRING,
  evergreen: Sequelize.STRING,
  acorns: Sequelize.STRING,
  leaves: Sequelize.STRING(500), //eslint-disable-line
  stems: Sequelize.STRING,
  treeForm: Sequelize.STRING,
  height: Sequelize.STRING,
  distribution: Sequelize.STRING(1000), //eslint-disable-line
  hybrids: Sequelize.STRING,
  varieties: Sequelize.STRING,
  notes: Sequelize.BLOB,
}, {
  createdAt: false,
  updatedAt: false
});

var agents = orm.define('agents', {
  torder: Sequelize.STRING,
  family: Sequelize.STRING,
  mostCommon: Sequelize.BOOLEAN,
  biotic: Sequelize.BOOLEAN,
  type: Sequelize.STRING,
  subType: Sequelize.STRING,
  subSubType: Sequelize.STRING,
  ecology: Sequelize.STRING,
  commonName: Sequelize.STRING,
  notes: Sequelize.BLOB
}, {
  createdAt: false,
  updatedAt: false
});

var synonyms = orm.define('synonyms', {
  genus: Sequelize.STRING,
  species: Sequelize.STRING,
  subSpecies: Sequelize.STRING,
  authority: Sequelize.STRING,
  isPrimary: Sequelize.BOOLEAN,
  notes: Sequelize.BLOB
}, {
  createdAt: false,
  updatedAt: false
});

agents.hasMany(synonyms);
synonyms.belongsTo(agents);

var bibs = orm.define('bibs', {
  year: Sequelize.STRING,
  description: Sequelize.STRING,
  author: Sequelize.STRING,
  title: Sequelize.BLOB,
  source: Sequelize.STRING,
  notes: Sequelize.BLOB
}, {
  createdAt: false,
  updatedAt: false
});

var symptoms = orm.define('symptoms', {
  symptom: Sequelize.STRING,
  description: Sequelize.BLOB,
  acorn: Sequelize.BOOLEAN,
  branch: Sequelize.BOOLEAN,
  flower: Sequelize.BOOLEAN,
  leaf: Sequelize.BOOLEAN,
  root: Sequelize.BOOLEAN,
  trunk: Sequelize.BOOLEAN
}, {
  createdAt: false,
  updatedAt: false
});


// GEOGRAPHY
var countiesByRegions = orm.define('countiesByRegion', {
  countyCode: Sequelize.STRING(3), //eslint-disable-line
  countyName: Sequelize.STRING,
  regionId: Sequelize.INTEGER,
  regionName: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

//HOST-AGENT INTERACTIONS
var hostInteractions = orm.define('hostInteractions', {
  questionable: Sequelize.BOOLEAN,
  situation: Sequelize.STRING,
  hostLifeStage: Sequelize.STRING,
  notes: Sequelize.BLOB
}, {
  createdAt: false,
  updatedAt: false
});

oaks.hasMany(hostInteractions);
agents.hasMany(hostInteractions);
hostInteractions.belongsTo(oaks);
hostInteractions.belongsTo(agents);

var hiSymptoms = orm.define('hiSymptoms', {
  plantPart: Sequelize.STRING,
  subSite: Sequelize.STRING,
  maturity: Sequelize.STRING,
  isPrimary: Sequelize.STRING,
  isIndirect: Sequelize.BOOLEAN
}, {
  createdAt: false,
  updatedAt: false
});

// HELPER JOIN TABLE DEFINITIONS
var hiReferences = orm.define('hiReferences', {}, {
  createdAt: false,
  updatedAt: false
});
var hiLocations = orm.define('hiLocations', {}, {
  createdAt: false,
  updatedAt: false
});
var hiSymptomHelpers = orm.define('hiSymptomHelpers', {}, {
  createdAt: false,
  updatedAt: false
});

//SET UP HOST INTERACTION CONNECTIONS
hostInteractions.hasMany(hiSymptoms);
hiSymptoms.belongsTo(hostInteractions);
bibs.belongsToMany(hostInteractions, { through: hiReferences });
countiesByRegions.belongsToMany(hostInteractions, { through: hiLocations });
symptoms.belongsToMany(hiSymptoms, { through: hiSymptomHelpers });

hostInteractions.belongsToMany(bibs, { through: hiReferences });
hostInteractions.belongsToMany(countiesByRegions, { through: hiLocations });
hiSymptoms.belongsToMany(symptoms, { through: hiSymptomHelpers });


//SYNC EVERYTHING
orm.sync();
oaks.sync();
agents.sync();
synonyms.sync();
bibs.sync();
symptoms.sync();
countiesByRegions.sync();
hostInteractions.sync();
hiSymptoms.sync();

exports.oaks = oaks;
exports.agents = agents;
exports.synonyms = synonyms;
exports.bibs = bibs;
exports.symptoms = symptoms;
exports.countiesByRegions = countiesByRegions;
exports.hostInteractions = hostInteractions;
exports.hiSymptoms = hiSymptoms;
exports.hiSymptomHelpers = hiSymptomHelpers;
exports.hiReferences = hiReferences;
exports.hiLocations = hiLocations;
