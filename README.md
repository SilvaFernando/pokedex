# Pokédex React

<img src="https://e7.pngegg.com/pngimages/595/56/png-clipart-pokemon-poke-ball-pokemon-angle-image-file-formats.png" alt="Pokébola" width="100" />

Este projeto é uma Pokédex interativa feita em React que consome a API pública [PokéAPI](https://pokeapi.co/) para listar pokémons, mostrar detalhes, evoluções, habilidades, peso, altura, tipos, entre outros recursos.

## Funcionalidades

- Listagem paginada de pokémons (20 por página)
- Busca por nome de pokémon na página atual
- Visualização de detalhes de cada pokémon em um modal
- Exibição de sprites normais, shiny e de costas
- Mostrar evoluções do pokémon selecionado
- Navegação entre páginas

## Tecnologias Utilizadas

- React (com Create React App)
- Axios para requisições HTTP
- CSS puro para estilização

## Como usar

### Clone o repositório

```bash
git clone https://github.com/SilvaFernando/pokedex.git
cd pokedex
```

### Instale as dependências

```bash
npm install
```

### Execute a aplicação

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

## Como funciona

(O conteúdo detalhado de funcionamento está no seu código anterior, mantenha aqui ou personalize conforme desejar.)

## Testes Automatizados

Este projeto possui testes automatizados que garantem o funcionamento correto de suas funcionalidades. Os principais testes verificam:

- **Estado de carregamento**: se o aplicativo exibe uma mensagem de carregamento ao iniciar e apresenta a lista de pokémons ao concluir a requisição.
- **Busca por nome**: se o filtro funciona corretamente ao buscar pokémons pelo nome.
- **Mensagens de “não encontrado”**: se uma mensagem adequada é exibida quando nenhum pokémon corresponde à busca.
- **Abertura de detalhes**: se o modal de detalhes abre ao clicar na carta de um pokémon e exibe informações relevantes como nome, peso, altura, tipos e sprites.
- **Fechamento do modal**: se o modal fecha corretamente ao clicar no botão de fechar.

Esses testes são escritos usando **React Testing Library** e **Jest**, simulando interações do usuário e verificando a renderização e comportamento do componente.

## Licença

Este projeto é apenas um exemplo e pode ser utilizado livremente.

