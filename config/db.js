// config/db.js
const Sequelize = require('sequelize');

const sequelize = new Sequelize('trabalho1', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = {
  Sequelize,
  sequelize,
};
