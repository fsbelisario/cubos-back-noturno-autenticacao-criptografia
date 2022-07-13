const connection = require('../connection');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const pwd = securePassword();

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json("O campo e-mail é obrigatório.");
    }

    if (!password) {
        return res.status(400).json("O campo senha é obrigatório.");
    }

    try {
        let query = 'SELECT * FROM users WHERE email = $1';
        const users = await connection.query(query, [email.toLowerCase()]);

        if (users.rowCount === 0) {
            return res.status(400).json('E-mail ou senha inválidos!');
        }

        const user = users.rows[0];

        const result = await pwd.verify(Buffer.from(password), Buffer.from(user.pwd_hash, 'hex'));

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json('E-mail ou senha inválidos!');
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(password))).toString('hex');
                    query = 'UPDATE users SET pwd_hash = $1 WHERE email = $2';
                    await connection.query(query, [hash, email.toLowerCase()]);
                } catch {
                }
                break;
        }

        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email
        }, jwtSecret);

        //Versão do token com prazo de validade de 1 dia
        // const token = jwt.sign({
        //     id: user.id,
        //     name: user.name,
        //     email: user.email
        // }, jwtSecret, { expiresIn: '1d' });

        return res.status(200).json({ message: `Login realizado com sucesso pelo usuário <${user.name}>.`, token });
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    login
}