async function obtenerPokemon(nombre) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);

    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }

    const data = await response.json();

    const container = document.getElementById("pokemonContainer");
    const template = document.getElementById("pokemonTemplate");

    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".pokemon-card");
    const nombrePokemon = clone.querySelector(".pokemonNombre");
    const imgPokemon = clone.querySelector(".pokemonImg");
    const tipoPokemon = clone.querySelector(".pokemonTipo");
    const abilitesPokemon = clone.querySelector(".pokemonHabilidades");
    const numPokemon = clone.querySelector(".pokemonNum");

    nombrePokemon.textContent = `Nombre: ${data.name}`;
    numPokemon.textContent = `No. ${data.id}`;

    const tipos = data.types.map(t => t.type.name).join(", ");
    tipoPokemon.textContent = `Tipo: ${tipos}`;

    imgPokemon.src = data.sprites.front_default;
    imgPokemon.alt = data.name;

    const habilidades = data.abilities.map(a => a.ability.name).join(", ");
    abilitesPokemon.textContent = `Habilidades: ${habilidades}`;

    card.dataset.nombre = data.name.toLowerCase();
    card.dataset.id = String(data.id);
    card.dataset.tipo = data.types.map(t => t.type.name.toLowerCase()).join(", ");

    container.appendChild(clone);

  } catch (error) {
    console.error("Error:", error);
  }
}

// obtenerPokemon("ditto");

async function obtenerListaPokemon() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
  const data = await response.json();
  return data.results.map(p => p.name);
}

async function cargarPokemons() {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  const nombres = await obtenerListaPokemon();

  const bloque = 30;

  for (let i = 0; i < nombres.length; i += bloque) {
    const grupo = nombres.slice(i, i + bloque);
    // Con Promise.all carga varios pokemones al mismo tiempo
    await Promise.all(grupo.map(nombre => obtenerPokemon(nombre)));
  }
}

async function cargarPokemons() {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  const nombres = await obtenerListaPokemon();

  for (const nombre of nombres) {
    await obtenerPokemon(nombre);
  }
}

function filtrarPokemones() {
  const texto = document.getElementById("searchInput").value.toLowerCase().trim();
  const criterio = document.getElementById("filterType").value;
  const cards = document.querySelectorAll(".pokemon-card");

  cards.forEach(card => {
    let valor = "";

    if (criterio === "nombre") {
      valor = card.dataset.nombre;
    } else if (criterio === "id") {
      valor = card.dataset.id;
    } else if (criterio === "tipo") {
      valor = card.dataset.tipo;
    }

    if (valor.includes(texto)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

cargarPokemons();

document.getElementById("searchInput").addEventListener("input", filtrarPokemones);
document.getElementById("filterType").addEventListener("change", filtrarPokemones);