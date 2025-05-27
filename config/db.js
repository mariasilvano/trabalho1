// config/db.js
const Sequelize = require('sequelize');

const sequelize = new Sequelize('trabalho1', 'postgres', 'west', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = {
  Sequelize,
  sequelize,
};
