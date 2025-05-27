module.exports = (sequelize, Sequelize) => {
  const Mensagem = sequelize.define('Mensagem', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    remetenteId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    destinatarioId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    mensagemCriptografada: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    chaveCriptografada: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    vetor: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    assinaturaDigital: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    hashMensagem: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    certificado: {
      type: Sequelize.JSONB,
      allowNull: false
    }
  }, {
    tableName: 'mensagens',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
  });

  Mensagem.associate = (models) => {
    Mensagem.belongsTo(models.Usuario, {
      foreignKey: 'remetenteId',
      as: 'remetente'
    });
    Mensagem.belongsTo(models.Usuario, {
      foreignKey: 'destinatarioId',
      as: 'destinatario'
    });
  };

  return Mensagem;
};
