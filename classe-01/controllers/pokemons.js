const connection = require('../connection');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const enroll = async (req, res) => {
    let { name, nickname, token } = req.body;

    if (!name) {
        return res.status(400).json("O campo nome é obrigatório.");
    }

    if (!token) {
        return res.status(400).json("O campo token é obrigatório.");
    }

    try {
        await jwt.verify(token, jwtSecret, { complete: true });
    } catch (error) {
        let message;
        switch (error.message) {
            case 'jwt expired':
                message = 'Token expirado. Refazer o login!';
                break;
            case 'invalid signature':
                message = 'Token com assinatura inválida.';
                break;
            case 'jwt not active':
                message = 'Token inativo.';
                break;
            case 'invalid audience':
                message = 'Token com destinatário inválido.';
                break;
            case 'invalid issuer':
                message = 'Token com emissor inválido.';
                break;
            case 'invalid jwt id':
                message = 'Token com id inválido.';
                break;
            case 'invalid jwt subject':
                message = 'Token com assunto inválido.';
                break;
            case 'jwt signature is required':
                message = 'Token sem assinatura.';
                break;
            case 'jwt malformed':
                message = 'Erro de formação do token.';
                break;
            default:
                message = error.message;
                break;
        }
        return res.status(400).json(message);
    }

    name = name.toLowerCase();

    try {
        let query = 'SELECT * FROM pokemons WHERE name = $1';
        const pokemons = await connection.query(query, [name]);
        if (pokemons.rowCount > 0) {
            return res.status(400).json('Pokemon já cadastrado!');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    if (!nickname) {
        nickname = nickname.toLowerCase();
    }

    let pokemon;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const { abilities, sprites: { other: { dream_world: { front_default } } } } = await response.json();

        pokemon = {
            name,
            abilities: "",
            img: front_default,
            nickname
        }

        for (const ability of abilities) {
            if (!pokemon.abilities) {
                pokemon.abilities = ability.ability.name;
            } else {
                pokemon.abilities = pokemon.abilities + ", " + ability.ability.name;
            }
        }

        try {
            const userId = jwt.decode(token, { complete: true }).payload.id;

            query = `INSERT INTO pokemons (user_id, name, abilities, img, nickname)
                    VALUES($1, $2, $3, $4, $5)`;
            const pokemonEnroll = await connection.query(query, [userId, pokemon.name, pokemon.abilities, pokemon.img, pokemon.nickname]);

            if (pokemonEnroll.rowCount === 0) {
                return res.status(400).json('Não foi possível cadastrar o pokemon.');
            }

            return res.status(200).json('Pokemon cadastrado com sucesso.');
        } catch (error) {
            return res.status(400).json(error.message);
        }
    } catch (error) {
        return res.status(400).json('Pokemon não encontrado.');
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    let { nickname, token } = req.body;

    if (!id) {
        return res.status(400).json("O campo id do Pokemon é obrigatório.");
    }

    if (!nickname) {
        return res.status(400).json("O campo apelido é obrigatório.");
    }

    if (!token) {
        return res.status(400).json("O campo token é obrigatório.");
    }

    try {
        await jwt.verify(token, jwtSecret);
    } catch (error) {
        let message;
        switch (error.message) {
            case 'jwt expired':
                message = 'Token expirado. Refazer o login!';
                break;
            case 'invalid signature':
                message = 'Token com assinatura inválida.';
                break;
            case 'jwt not active':
                message = 'Token inativo.';
                break;
            case 'invalid audience':
                message = 'Token com destinatário inválido.';
                break;
            case 'invalid issuer':
                message = 'Token com emissor inválido.';
                break;
            case 'invalid jwt id':
                message = 'Token com id inválido.';
                break;
            case 'invalid jwt subject':
                message = 'Token com assunto inválido.';
                break;
            case 'jwt signature is required':
                message = 'Token sem assinatura.';
                break;
            case 'jwt malformed':
                message = 'Erro de formação do token.';
                break;
            default:
                message = error.message;
                break;
        }
        return res.status(400).json(message);
    }

    try {
        let query = 'SELECT * FROM pokemons WHERE id = $1;';
        const pokemons = await connection.query(query, [id]);

        if (pokemons.rowCount === 0) {
            return res.status(400).json('Não existe Pokemon cadastrado com esse id.');
        }

        const userId = jwt.decode(token, { complete: true }).payload.id;
        nickname = nickname.toLowerCase();

        query = `UPDATE pokemons
                SET nickname = $1,
                user_id = $2
                WHERE id = $3`;
        const pokemonUpdate = await connection.query(query, [nickname, userId, id]);

        if (pokemonUpdate.rowCount === 0) {
            return res.status(400).json('Não foi possível atualizar o apelido do pokemon.');
        }

        return res.status(200).json('Apelido do Pokemon atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const list = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json("O campo token é obrigatório.");
    }

    try {
        await jwt.verify(token, jwtSecret);
    } catch (error) {
        let message;
        switch (error.message) {
            case 'jwt expired':
                message = 'Token expirado. Refazer o login!';
                break;
            case 'invalid signature':
                message = 'Token com assinatura inválida.';
                break;
            case 'jwt not active':
                message = 'Token inativo.';
                break;
            case 'invalid audience':
                message = 'Token com destinatário inválido.';
                break;
            case 'invalid issuer':
                message = 'Token com emissor inválido.';
                break;
            case 'invalid jwt id':
                message = 'Token com id inválido.';
                break;
            case 'invalid jwt subject':
                message = 'Token com assunto inválido.';
                break;
            case 'jwt signature is required':
                message = 'Token sem assinatura.';
                break;
            case 'jwt malformed':
                message = 'Erro de formação do token.';
                break;
            default:
                message = error.message;
                break;
        }
        return res.status(400).json(message);
    }

    try {
        const query = `SELECT pokemons.id, users.name as user, pokemons.name as pokemon,
            pokemons.nickname, pokemons.abilities, pokemons.img
            FROM pokemons
            LEFT JOIN users ON pokemons.user_id = users.id;`;
        const pokemonList = await connection.query(query);

        if (pokemonList.rowCount === 0) {
            return res.status(400).json('Não existem Pokemons cadastrados.');
        }

        return res.status(200).json(pokemonList.rows);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const get = async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (!id) {
        return res.status(400).json("O campo id do Pokemon é obrigatório.");
    }

    if (!token) {
        return res.status(400).json("O campo token é obrigatório.");
    }

    try {
        await jwt.verify(token, jwtSecret);
    } catch (error) {
        let message;
        switch (error.message) {
            case 'jwt expired':
                message = 'Token expirado. Refazer o login!';
                break;
            case 'invalid signature':
                message = 'Token com assinatura inválida.';
                break;
            case 'jwt not active':
                message = 'Token inativo.';
                break;
            case 'invalid audience':
                message = 'Token com destinatário inválido.';
                break;
            case 'invalid issuer':
                message = 'Token com emissor inválido.';
                break;
            case 'invalid jwt id':
                message = 'Token com id inválido.';
                break;
            case 'invalid jwt subject':
                message = 'Token com assunto inválido.';
                break;
            case 'jwt signature is required':
                message = 'Token sem assinatura.';
                break;
            case 'jwt malformed':
                message = 'Erro de formação do token.';
                break;
            default:
                message = error.message;
                break;
        }
        return res.status(400).json(message);
    }

    try {
        let query = 'SELECT * FROM pokemons WHERE id = $1;';
        const pokemons = await connection.query(query, [id]);

        if (pokemons.rowCount === 0) {
            return res.status(400).json('Não existe Pokemon cadastrado com esse id.');
        }

        query = `SELECT pokemons.id, users.name as user, pokemons.name as pokemon,
            pokemons.nickname, pokemons.abilities, pokemons.img
            FROM pokemons
            INNER JOIN users ON pokemons.user_id = users.id
            WHERE pokemons.id = $1;`;
        const pokemonSearch = await connection.query(query, [id]);

        return res.status(200).json(pokemonSearch.rows);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const remove = async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (!id) {
        return res.status(400).json("O campo id do Pokemon é obrigatório.");
    }

    if (!token) {
        return res.status(400).json("O campo token é obrigatório.");
    }

    try {
        await jwt.verify(token, jwtSecret);
    } catch (error) {
        let message;
        switch (error.message) {
            case 'jwt expired':
                message = 'Token expirado. Refazer o login!';
                break;
            case 'invalid signature':
                message = 'Token com assinatura inválida.';
                break;
            case 'jwt not active':
                message = 'Token inativo.';
                break;
            case 'invalid audience':
                message = 'Token com destinatário inválido.';
                break;
            case 'invalid issuer':
                message = 'Token com emissor inválido.';
                break;
            case 'invalid jwt id':
                message = 'Token com id inválido.';
                break;
            case 'invalid jwt subject':
                message = 'Token com assunto inválido.';
                break;
            case 'jwt signature is required':
                message = 'Token sem assinatura.';
                break;
            case 'jwt malformed':
                message = 'Erro de formação do token.';
                break;
            default:
                message = error.message;
                break;
        }
        return res.status(400).json(message);
    }

    try {
        let query = 'SELECT * FROM pokemons WHERE id = $1;';
        const pokemons = await connection.query(query, [id]);

        if (pokemons.rowCount === 0) {
            return res.status(400).json('Não existe Pokemon cadastrado com esse id.');
        }

        query = 'DELETE FROM pokemons WHERE pokemons.id = $1;';
        const pokemonRemoved = await connection.query(query, [id]);

        if (pokemonRemoved.rowCount === 0) {
            return res.status(400).json('Não foi possível remover o Pokemon.');
        }

        return res.status(200).json('Pokemon removido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    enroll,
    update,
    list,
    get,
    remove
}