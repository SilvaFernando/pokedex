import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const POKEMONS_PER_PAGE = 20;
const TOTAL_POKEMONS = 151;

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [evolutions, setEvolutions] = useState([]);
  const totalPages = Math.ceil(TOTAL_POKEMONS / POKEMONS_PER_PAGE);

  // Acessibilidade: fecha modal com ESC e ENTER
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleModalClose();
      if (e.key === "Enter" && document.activeElement.id === "close-modal") handleModalClose();
    };

    if (modalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  useEffect(() => {
    async function fetchPageData() {
      setLoadingList(true);
      const offset = (currentPage - 1) * POKEMONS_PER_PAGE;
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${POKEMONS_PER_PAGE}&offset=${offset}`
        );
        const results = response.data.results;

        const detailed = await Promise.all(
          results.map(async (p) => {
            const res = await axios.get(p.url);
            return {
              name: res.data.name,
              image: res.data.sprites.front_default,
              types: res.data.types.map((t) => t.type.name),
              url: p.url,
            };
          })
        );
        setPokemons(detailed);
      } catch {
        setPokemons([]);
      }
      setLoadingList(false);
    }
    fetchPageData();
  }, [currentPage]);

  const handleCardClick = async (url) => {
    setLoadingDetails(true);
    setModalOpen(true);
    setEvolutions([]);
    try {
      const res = await axios.get(url);
      const poke = res.data;
      // Evolução
      const species = await axios.get(poke.species.url);
      const evolutionReq = await axios.get(species.data.evolution_chain.url);

      const extractEvolutions = (chain) => {
        let arr = [];
        arr.push(chain.species.name);
        if (chain.evolves_to && chain.evolves_to.length) {
          chain.evolves_to.forEach((child) => {
            arr = arr.concat(extractEvolutions(child));
          });
        }
        return arr;
      };
      let evo = extractEvolutions(evolutionReq.data.chain);

      const evoDetails = await Promise.all(
        evo.map(async (name) => {
          try {
            const r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            return {
              name: r.data.name,
              sprite: r.data.sprites.front_default,
              id: r.data.id,
            };
          } catch {
            return { name, sprite: null, id: null };
          }
        })
      );

      setEvolutions(evoDetails);
      setSelectedPokemon(poke);
      setLoadingDetails(false);
    } catch {
      setSelectedPokemon(null);
      setEvolutions([]);
      setLoadingDetails(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPokemon(null);
    setEvolutions([]);
  };

  // Busca (apenas na página atual)
  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const goToNextPage = () =>
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1));

  return (
    <div className="App">
      <h1>
        <span
          aria-label="Pokédex"
          style={{
            display: "inline-block",
            position: "relative",
            paddingRight: "36px",
          }}
        >
          Pokédex
          {/* Luz pokédex */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "-28px",
              top: "0px",
              width: "22px",
              height: "22px",
              background: "radial-gradient(circle, #64b5f6 60%, #1565c0 92%, #212121 100%)",
              border: "3.5px solid #fff",
              boxShadow: "0 0 14px 8px #42a5f566,0 0 3px 2px #42a4f6ee",
              borderRadius: "50%",
              display: "inline-block"
            }}
            title="Luz de pokédex decorativa"
          />
        </span>
        {/* Grade decorativa */}
        <div
          aria-hidden="true"
          style={{
            width: "100%",
            height: "8px",
            margin: "18px 0 0 0",
            background: "repeating-linear-gradient(90deg,#b71c1c,#b71c1c 8px,transparent 8px, transparent 16px)"
          }}
        />
      </h1>

      <input
        type="text"
        placeholder="Buscar Pokémon por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "0.6rem 1rem",
          fontSize: "1.08rem",
          borderRadius: "16px",
          border: "2px solid #1976d2",
          marginBottom: "2rem",
          outline: "none",
          boxShadow: "0 1px 4px #bdbdbd80",
        }}
        aria-label="Buscar Pokémon por nome"
      />

      <div className="pokedex" role="region" aria-label="Lista de pokémons">
        {loadingList ? (
          <div style={{ fontWeight: "bold", fontSize: "1.23rem", color: "#d32f2f" }}>
            Carregando...
          </div>
        ) : filteredPokemons.length > 0 ? (
          filteredPokemons.map((pokemon, index) => (
            <div
              key={index}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(pokemon.url)}
              title="Clique para ver detalhes"
              tabIndex={0}
              role="button"
              onKeyPress={(e) => { if (e.key === "Enter") handleCardClick(pokemon.url); }}
              aria-label={`Abrir detalhes de ${pokemon.name}`}
            >
              <img src={pokemon.image} alt={pokemon.name} />
              <h3>{pokemon.name}</h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.4rem",
                  marginTop: "6px",
                }}
              >
                {pokemon.types.map((type) => (
                  <p
                    key={type}
                    style={{
                      backgroundColor: typeColors[type],
                      color: "#fff",
                      borderRadius: "10px",
                      padding: "0.2rem 0.7rem",
                      margin: 0,
                      fontWeight: "bold",
                      textShadow: "0 1px 2px rgba(30,30,30,0.2)",
                    }}
                  >
                    {type}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#d32f2f", fontWeight: "bold" }}>Nenhum Pokémon encontrado nesta página.</div>
        )}
      </div>

      {/* Paginação */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>

      {/* Modal de detalhes */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(50,30,30,0.65)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #fff 85%, #e3e3e3 100%)",
              borderRadius: "1.3rem 2.3rem 1.3rem 2.3rem",
              boxShadow: "0 14px 36px 0 rgba(80,0,0,0.30)",
              minWidth: 320,
              maxWidth: 420,
              width: "96vw",
              padding: "2.2rem 1.3rem 1.5rem 1.3rem",
              position: "relative",
              textAlign: "center",
              border: "6px solid #1976d2"
            }}
          >
            <div
               aria-hidden="true"
               style={{
                 width: 24,
                 height: 24,
                 position: 'absolute',
                 top: -22,
                 left: 38,
                 borderRadius: "50%",
                 background: "radial-gradient(circle, #64b5f6 65%, #1976d2 100%)",
                 border: "3px solid #fff",
                 boxShadow: "0 0 14px 5px #42a5f555"
               }}
            />
            <button
              id="close-modal"
              style={{
                position: "absolute",
                top: 10,
                right: 13,
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                fontWeight: "bold",
                fontSize: 22,
                cursor: "pointer",
                boxShadow: "0 2px 7px #21212125",
                transition: "background 0.17s"
              }}
              onClick={handleModalClose}
              title="Fechar"
              aria-label="Fechar modal"
            >×</button>
            {loadingDetails ? (
              <p style={{ fontWeight: "bold" }}>Carregando...</p>
            ) : selectedPokemon ? (
              <>
                {/* Sprites principais */}
                <div style={{ display: "flex", justifyContent: "center", gap: 15, marginBottom: 12, flexWrap: "wrap" }}>
                  <div>
                    <img
                      src={selectedPokemon.sprites.front_default}
                      alt={selectedPokemon.name}
                      style={{
                        width: 95,
                        height: 95,
                        background: "#c7dfff",
                        borderRadius: "50%",
                        border: "3px solid #1976d2",
                        boxShadow: "0 2px 12px #1976d233, 0 0 0 7px #fff inset",
                      }}
                    />
                    <div style={{ fontSize: 13, color: "#1976d2", fontWeight: 600, margin: 3 }}>
                      Normal
                    </div>
                  </div>
                  {/* Sprite shiny */}
                  {selectedPokemon.sprites.front_shiny &&
                    <div>
                      <img
                        src={selectedPokemon.sprites.front_shiny}
                        alt={`${selectedPokemon.name} shiny`}
                        style={{
                          width: 95,
                          height: 95,
                          background: "#fffde7",
                          borderRadius: "50%",
                          border: "2.5px solid gold",
                          boxShadow: "0 1px 7px #ffd70088, 0 0 0 7px #fffde7 inset"
                        }}
                      />
                      <div style={{ fontSize: 13, color: "#b8860b", fontWeight: 600, margin: 3 }}>
                        Versão Shiny
                      </div>
                    </div>
                  }
                  {/* Sprite back */}
                  {selectedPokemon.sprites.back_default &&
                    <div>
                      <img
                        src={selectedPokemon.sprites.back_default}
                        alt={`${selectedPokemon.name} costas`}
                        style={{
                          width: 95,
                          height: 95,
                          background: "#e1bee7",
                          borderRadius: "50%",
                          border: "2.5px solid #7e57c2",
                          boxShadow: "0 1px 7px #90caf9, 0 0 0 7px #ede7f6 inset"
                        }}
                      />
                      <div style={{ fontSize: 13, color: "#7e57c2", fontWeight: 600, margin: 3 }}>
                        De costas
                      </div>
                    </div>
                  }
                </div>
                <h2
                  style={{
                    textTransform: "capitalize",
                    color: "#d32f2f",
                    marginBottom: "0.3rem",
                    fontWeight: 900,
                    fontSize: "2rem",
                    letterSpacing: "1.5px",
                    textShadow: "1.5px 1.5px 0 #fff",
                  }}
                >
                  {selectedPokemon.name}
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                      marginLeft: 7,
                    }}
                  >
                    #{selectedPokemon.id}
                  </span>
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.4rem",
                    marginBottom: 18,
                  }}
                >
                  {selectedPokemon.types.map((t) => (
                    <p
                      key={t.type.name}
                      style={{
                        backgroundColor: typeColors[t.type.name],
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "0.19rem 0.8rem",
                        margin: 0,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textShadow: "0 1px 2px rgba(30,30,30,0.2)",
                      }}
                    >
                      {t.type.name}
                    </p>
                  ))}
                </div>
                <div
                  style={{
                    textAlign: "left",
                    margin: "0 auto",
                    maxWidth: "270px",
                    background: "#f3f6fb",
                    border: "1.6px solid #d32f2f",
                    borderRadius: "0.9rem",
                    padding: "1rem 1.2rem",
                    boxShadow: "0 2px 9px #d32f2f23",
                  }}
                >
                  <strong>Peso:</strong> {selectedPokemon.weight / 10} kg
                  <br />
                  <strong>Altura:</strong> {selectedPokemon.height / 10} m
                  <br />
                  <strong>Habilidades:</strong>
                  <ul style={{ marginTop: 6, marginBottom: 10 }}>
                    {selectedPokemon.abilities.map((a) => (
                      <li key={a.ability.name} style={{ textTransform: "capitalize" }}>
                        {a.ability.name}
                      </li>
                    ))}
                  </ul>
                  <strong>Status base:</strong>
                  <ul style={{ marginTop: 6 }}>
                    {selectedPokemon.stats.map((stat) => (
                      <li
                        key={stat.stat.name}
                        style={{ textTransform: "capitalize" }}
                      >
                        {stat.stat.name}:{" "}
                        <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                          {stat.base_stat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evolução */}
                {evolutions.length > 1 && (
                  <div style={{ margin: "20px auto 0 auto", maxWidth: 330, background: "#fff7e4", borderRadius: "1rem", border: "2px solid #ffc107", padding: 12 }}>
                    <div style={{ fontWeight: 800, color: "#db8308", marginBottom: 6, textAlign: "center" }}>Evoluções:</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      {evolutions.map((ev, idx) => (
                        <div key={ev.name + idx} style={{ textAlign: "center" }}>
                          <img
                            src={ev.sprite}
                            alt={ev.name}
                            style={{
                              width: 54,
                              height: 54,
                              background: "#ececec",
                              borderRadius: "50%",
                              border: "2.5px solid #1976d2",
                              boxShadow: "0 1px 2px #aaa"
                            }}
                          />
                          <div style={{ fontSize: 12, color: "#d32f2f", fontWeight: 700, marginTop: 2, textTransform: "capitalize" }}>
                            {ev.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            ) : (
              <p style={{fontWeight:"bold"}}>Erro ao carregar informações do Pokémon.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
