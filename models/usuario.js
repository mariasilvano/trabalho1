module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    login: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    senha: {
      type: Sequelize.STRING,
      allowNull: false
    },
    twoFactorSecret: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Mensagem, {
      foreignKey: 'remetenteId',
      as: 'mensagensEnviadas'
    });

    Usuario.hasMany(models.Mensagem, {
      foreignKey: 'destinatarioId',
      as: 'mensagensRecebidas'
    });
  };

  return Usuario;
};
