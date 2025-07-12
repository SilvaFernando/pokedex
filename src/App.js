import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20');
      const results = response.data.results;

      const detailed = await Promise.all(results.map(async (p) => {
        const res = await axios.get(p.url);
        return {
          name: res.data.name,
          image: res.data.sprites.front_default,
          types: res.data.types.map(t => t.type.name)
        };
      }));

      setPokemons(detailed);
    }

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Pokédex</h1>
      <div className="pokedex">
        {pokemons.map((pokemon, index) => (
          <div key={index} className="card">
            <img src={pokemon.image} alt={pokemon.name} />
            <h3>{pokemon.name}</h3>
            <p>{pokemon.types.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;