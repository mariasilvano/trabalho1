module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuarios', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        login: {
            type: Sequelize.STRING(100), 
            allowNull: false
        },
        senha: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        twoFactorSecret: {
            type: Sequelize.STRING, 
            allowNull: false 
        }
    });
    return Usuario;
}
