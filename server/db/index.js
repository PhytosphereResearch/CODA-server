const { Sequelize } = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.load();
}

const user = process.env.RDS_USERNAME;
const pass = process.env.RDS_PASSWORD;
const database = process.env.RDS_DB_NAME;
const host = process.env.RDS_DB_HOST;

const initOrm = () => {
  try {
    console.log('Initializing db connection')
    return new Sequelize(database, user, pass, {
      host,
      dialect: 'mysql',
      port: 3306
    });
  } catch (e) {
    console.error('Database Connection error: ', e)
  }
}

const orm = initOrm();

// try {
//   await orm.authenticate();
//   console.log('Connection has been established successfully.');
// } catch (error) {
//   console.error('Unable to connect to the database:', error);
// }

const auditLogs = orm.define('auditlogs', {
  user_id: Sequelize.STRING,
  table_name: Sequelize.STRING,
  table_record_id: Sequelize.INTEGER,
  action: Sequelize.STRING,
  new_record: Sequelize.BLOB,//this is the record after it was created or updated
  date_time: Sequelize.DATE,
}, {
  timestamps: true,
  updatedAt: false,
  createdAt: 'date_time',
});

const oaks = orm.define('oaks', {
  genus: Sequelize.STRING,
  subGenus: Sequelize.STRING,
  species: Sequelize.STRING,
  subSpecies: Sequelize.STRING,
  commonName: Sequelize.STRING,
  authority: Sequelize.STRING,
  evergreen: Sequelize.STRING,
  acorns: Sequelize.STRING,
  leaves: Sequelize.STRING(500),
  stems: Sequelize.STRING,
  treeForm: Sequelize.STRING,
  height: Sequelize.STRING,
  distribution: Sequelize.STRING(1000),
  hybrids: Sequelize.STRING,
  varieties: Sequelize.STRING,
  usdaCode: Sequelize.STRING,
  notes: Sequelize.BLOB,
}, {
  createdAt: false,
  updatedAt: false,
});

console.log('oaks', oaks)

const agents = orm.define('agents', {
  torder: Sequelize.STRING,
  family: Sequelize.STRING,
  mostCommon: Sequelize.BOOLEAN,
  biotic: Sequelize.BOOLEAN,
  type: Sequelize.STRING,
  subType: Sequelize.STRING,
  subSubType: Sequelize.STRING,
  ecology: Sequelize.STRING,
  commonName: Sequelize.STRING,
  notes: Sequelize.BLOB,
  bookLink: Sequelize.STRING,
  original_coda_record: Sequelize.BOOLEAN,
}, {
  createdAt: false,
  updatedAt: false,
});

const synonyms = orm.define('synonyms', {
  genus: Sequelize.STRING,
  species: Sequelize.STRING,
  subSpecies: Sequelize.STRING,
  authority: Sequelize.STRING,
  isPrimary: Sequelize.BOOLEAN,
  notes: Sequelize.BLOB,
}, {
  createdAt: false,
  updatedAt: false,
});

agents.hasMany(synonyms);
synonyms.belongsTo(agents);

const bibs = orm.define('bibs', {
  year: Sequelize.STRING,
  description: Sequelize.STRING,
  author: Sequelize.STRING,
  title: Sequelize.BLOB,
  source: Sequelize.STRING,
  notes: Sequelize.BLOB,
}, {
  createdAt: false,
  updatedAt: false,
});

const symptoms = orm.define('symptoms', {
  symptom: Sequelize.STRING,
  description: Sequelize.BLOB,
  acorn: Sequelize.BOOLEAN,
  branch: Sequelize.BOOLEAN,
  flower: Sequelize.BOOLEAN,
  leaf: Sequelize.BOOLEAN,
  root: Sequelize.BOOLEAN,
  trunk: Sequelize.BOOLEAN,
}, {
  createdAt: false,
  updatedAt: false,
});


// GEOGRAPHY
const countiesByRegions = orm.define('countiesByRegion', {
  countyCode: Sequelize.STRING(3),
  countyName: Sequelize.STRING,
  regionId: Sequelize.INTEGER,
  regionName: Sequelize.STRING,
}, {
  createdAt: false,
  updatedAt: false,
});

// HOST-AGENT INTERACTIONS
const hostInteractions = orm.define('hostInteractions', {
  questionable: Sequelize.BOOLEAN,
  situation: Sequelize.STRING,
  hostLifeStage: Sequelize.STRING,
  notes: Sequelize.BLOB,
}, {
  createdAt: false,
  updatedAt: false,
});

oaks.hasMany(hostInteractions);
agents.hasMany(hostInteractions);
hostInteractions.belongsTo(oaks);
hostInteractions.belongsTo(agents);

const hiSymptoms = orm.define('hiSymptoms', {
  plantPart: Sequelize.STRING,
  subSite: Sequelize.STRING,
  maturity: Sequelize.STRING,
  isPrimary: Sequelize.STRING,
  isIndirect: Sequelize.BOOLEAN,
}, {
  createdAt: false,
  updatedAt: false,
});

// HELPER JOIN TABLE DEFINITIONS
const hiReferences = orm.define('hiReferences', {}, {
  createdAt: false,
  updatedAt: false,
});
const hiLocations = orm.define('hiLocations', {}, {
  createdAt: false,
  updatedAt: false,
});
const hiSymptomHelpers = orm.define('hiSymptomHelpers', {}, {
  createdAt: false,
  updatedAt: false,
});

// SET UP HOST INTERACTION CONNECTIONS
hostInteractions.hasMany(hiSymptoms);
hiSymptoms.belongsTo(hostInteractions);
bibs.belongsToMany(hostInteractions, { through: hiReferences });
countiesByRegions.belongsToMany(hostInteractions, { through: hiLocations });
symptoms.belongsToMany(hiSymptoms, { through: hiSymptomHelpers });

hostInteractions.belongsToMany(bibs, { through: hiReferences });
hostInteractions.belongsToMany(countiesByRegions, { through: hiLocations });
hiSymptoms.belongsToMany(symptoms, { through: hiSymptomHelpers });


// SYNC EVERYTHING
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
exports.auditLogs = auditLogs;