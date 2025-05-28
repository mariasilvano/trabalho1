const db = require('../models'); 
const bcrypt = require('bcrypt');
const validatorForm = require('../utils/validatorForm');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const getRegister = async (req, res) => {
    res.render('register', { layout: 'noMenu.handlebars' });
}

const registerUser = async (req, res) => {
    const hasError = await validatorForm.registerFormValidator(req, res);

    if (hasError) return;

    const { login, senha } = req.body;
    
  try {
        const secretUser = speakeasy.generateSecret({ length: 20, name: 'Sistema de Configuração Segura entre Usuários (Alice)' });
        const qrCodeDataURL = await QRCode.toDataURL(secretUser.otpauth_url);
        const hash = await bcrypt.hash(senha, 10);

        await db.Usuario.create({ login, senha: hash, twoFactorSecret: secretUser.base32 });
        
        res.render('register', { 
            sucesso: 'Usuário cadastrado com sucesso!' ,
            qrCode: qrCodeDataURL,
            chaveManual: secretUser.base32,
            layout: 'noMenu.handlebars'
        });
  
    } catch (error) {
        console.error(error); 
        res.render('cadastro', { erro: 'Erro ao criar usuário.' });
  }
}


module.exports = {
    getRegister,
    registerUser
};

  
