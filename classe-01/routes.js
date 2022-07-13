const express = require('express');
const login = require('./controllers/login');
const pokemons = require('./controllers/pokemons');
const users = require('./controllers/users');

const routes = express();

// Usuários
routes.post('/cadastro', users.enroll);

// Login
routes.post('/login', login.login);

// Pokemons
routes.post('/pokemon', pokemons.enroll);
routes.put('/pokemon/:id', pokemons.update);
routes.get('/pokemon', pokemons.list);
routes.get('/pokemon/:id', pokemons.get);
routes.delete('/pokemon/:id', pokemons.remove);

module.exports = routes;