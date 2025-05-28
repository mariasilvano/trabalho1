const db = require("../models");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const registerFormValidator = async (req, res) => {
	const { login, senha, confirmarSenha } = req.body;

	let error = null;

	if (!login) {
		error = { erro: "Necessário informar um login", campo: "login" };
	} else if (!senha) {
		error = { erro: "Necessário informar uma senha", campo: "senha" };
	} else if (!PASSWORD_REGEX.test(senha)) {
		error = {
			erro: "Senha inválida. Use pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos",
			campo: "senha",
		};
	} else if (!confirmarSenha) {
		error = { erro: "Necessário confirmar a senha", campo: "confirmarSenha" };
	} else if (senha !== confirmarSenha) {
		error = {
			erro: "As senhas não coincidem, tente novamente!",
			campo: "confirmarSenha",
		};
	}

	if (!error) {
		const existsUser = await db.Usuario.findOne({ where: { login } });
		if (existsUser) {
			error = {
				erro: "Já existe um usuário com o mesmo login",
				campo: "login",
			};
		}
	}

	if (error) {
		await res.render("register", { error, layout: "noMenu.handlebars" });
		return true;
	}

	return false;
};

module.exports = {
	registerFormValidator,
};
