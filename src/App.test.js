import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

const mockPokemons = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  ],
};

const mockBulbasaurDetails = {
  id: 1,
  name: 'bulbasaur',
  sprites: { front_default: 'bulbasaur.png', front_shiny: 'bulbasaur_shiny.png', back_default: 'bulbasaur_back.png' },
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  weight: 69,
  height: 7,
  abilities: [{ ability: { name: 'overgrow' } }, { ability: { name: 'chlorophyll' } }],
  stats: [{ stat: { name: 'hp' }, base_stat: 45 }],
  species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
};

const mockCharmanderDetails = {
    id: 4,
    name: 'charmander',
    sprites: { front_default: 'charmander.png', front_shiny: 'charmander_shiny.png', back_default: 'charmander_back.png' },
    types: [{ type: { name: 'fire' } }],
    weight: 85,
    height: 6,
    abilities: [{ ability: { name: 'blaze' } }, { ability: { name: 'solar-power' } }],
    stats: [{ stat: { name: 'hp' }, base_stat: 39 }],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
};

const mockEvolutionChain = {
  chain: {
    species: { name: 'bulbasaur' },
    evolves_to: [
      {
        species: { name: 'ivysaur' },
        evolves_to: [
          {
            species: { name: 'venusaur' },
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

describe('Pokedex App', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0')) {
        return Promise.resolve({ data: mockPokemons });
      }
      if (url.includes('https://pokeapi.co/api/v2/pokemon/1/')) {
        return Promise.resolve({ data: mockBulbasaurDetails });
      }
      if (url.includes('https://pokeapi.co/api/v2/pokemon/4/')) {
        return Promise.resolve({ data: mockCharmanderDetails });
      }
      if (url.includes('https://pokeapi.co/api/v2/pokemon-species/1/')) {
        return Promise.resolve({ data: { evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' } } });
      }
      if (url.includes('https://pokeapi.co/api/v2/evolution-chain/1/')) {
        return Promise.resolve({ data: mockEvolutionChain });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially and then displays a list of pokemons', async () => {
    render(<App />);
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Carregando.../i)).not.toBeInTheDocument();
  });

  test('filters the pokemon list based on search input', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/Buscar Pokémon por nome.../i);
    fireEvent.change(searchInput, { target: { value: 'char' } });
    expect(screen.getByText('charmander')).toBeInTheDocument();
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
  });

  test('shows a message when no pokemon is found', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/Buscar Pokémon por nome.../i);
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });
    expect(screen.getByText(/Nenhum Pokémon encontrado/i)).toBeInTheDocument();
  });

  test('opens a modal with pokemon details when a card is clicked', async () => {
    render(<App />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('bulbasaur'));
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText(/6.9 kg/i)).toBeInTheDocument();
      expect(screen.getByText(/0.7 m/i)).toBeInTheDocument();
    });
  });

  test('closes the modal when the close button is clicked', async () => {
    render(<App />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('bulbasaur'));
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Fechar modal/i));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});