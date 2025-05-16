// models/index.js
const { Sequelize, sequelize } = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Usuario = require('./usuario')(sequelize, Sequelize);
db.Mensagem = require('./mensagem')(sequelize, Sequelize);

// Relacionamentos
db.Usuario.hasMany(db.Mensagem, { foreignKey: 'remetenteId', as: 'MensagensEnviadas' });
db.Usuario.hasMany(db.Mensagem, { foreignKey: 'destinatarioId', as: 'MensagensRecebidas' });
db.Mensagem.belongsTo(db.Usuario, { foreignKey: 'remetenteId', as: 'Remetente' });
db.Mensagem.belongsTo(db.Usuario, { foreignKey: 'destinatarioId', as: 'Destinatario' });

module.exports = db;
