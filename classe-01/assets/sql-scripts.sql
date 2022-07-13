CREATE DATABASE pokemon_catalog;

-- Para o id foi usado id SERIAL PRIMARY KEY (provável rejeição do método mais novo pelo Beekeeper)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	id INT GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
  	email VARCHAR(100) NOT NULL UNIQUE,
  	pwd_hash TEXT
);

-- Para o id foi usado id SERIAL PRIMARY KEY (provável rejeição do método mais novo pelo Beekeeper)
DROP TABLE IF EXISTS pokemons;
CREATE TABLE pokemons (
	id INT GENERATED ALWAYS AS IDENTITY,
	user_id INT NOT NULL REFERENCES users(id),
  	name VARCHAR(50) NOT NULL,
  	abilities TEXT NOT NULL,
  	img TEXT,
  	nickname VARCHAR(20)
);