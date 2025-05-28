const Sequelize = require("sequelize");

const sequelize = new Sequelize("trabalho1", "postgres", "senha", {
	// alterar quando for testar
	host: "localhost",
	dialect: "postgres",
});

module.exports = {
	Sequelize,
	sequelize,
};
