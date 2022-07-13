const connection = require('../connection');

const enroll = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name) {
        return res.status(400).json("O campo nome é obrigatório.");
    }

    if (!email) {
        return res.status(400).json("O campo e-mail é obrigatório.");
    }

    if (!password) {
        return res.status(400).json("O campo senha é obrigatório.");
    }

    try {
        let query = 'SELECT * FROM users WHERE email = $1';
        const user = await connection.query(query, [email.toLowerCase()]);

        if (user.rowCount > 0) {
            return res.status(400).json('E-mail já cadastrado!');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const hash = (await pwd.hash(Buffer.from(password))).toString('hex');

        query = 'INSERT INTO users (name, email, pwd_hash) VALUES ($1, $2, $3)';
        const users = await connection.query(query, [name, email.toLowerCase(), hash]);

        if (users.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar o usuário.');
        }

        return res.status(200).json('Usuário cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    enroll
}