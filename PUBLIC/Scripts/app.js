let limit = 20;
let offset = 0;
let cargando = false;
let totalPokemones = 0;
let modoBusqueda = false;
let listaGlobalPokemon = [];
let timeoutBusqueda;

async function obtenerPokemon(nombre, limpiar = false) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);

    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }

    const data = await response.json();

    const container = document.getElementById("pokemonContainer");
    const template = document.getElementById("pokemonTemplate");

    if (limpiar) {
      container.innerHTML = "";
    }

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
    tipoPokemon.textContent = tipos;

    imgPokemon.src = data.sprites.front_default;
    imgPokemon.alt = data.name;

    const habilidades = data.abilities.map(a => a.ability.name).join(", ");
    abilitesPokemon.textContent = habilidades;

    card.dataset.nombre = data.name.toLowerCase();
    card.dataset.id = String(data.id);
    card.dataset.tipo = data.types.map(t => t.type.name.toLowerCase()).join(", ");

    container.appendChild(clone);

  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// obtenerPokemon(ditto)

async function cargarListaGlobalPokemon() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
    const data = await response.json();
    listaGlobalPokemon = data.results.map(p => p.name);
  } catch (error) {
    console.error("Error al cargar la lista global:", error);
  }
}

async function obtenerListaPokemon(limit, offset) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  totalPokemones = data.count;
  return data.results.map(p => p.name);
}

async function cargarPokemons() {
  if (cargando || modoBusqueda) return;

  cargando = true;

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Cargando...";

  try {
    const nombres = await obtenerListaPokemon(limit, offset);

    for (const nombre of nombres) {
      await obtenerPokemon(nombre);
    }

    offset += limit;

    if (offset >= totalPokemones) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Cargar más Pokémon";
    }

  } catch (error) {
    console.error("Error al cargar Pokémon:", error);
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Cargar más Pokémon";
  }

  cargando = false;
}

async function buscarPorId(id) {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  try {
    await obtenerPokemon(id);
    return true;
  } catch (error) {
    container.innerHTML = "<p>No se encontró ese Pokémon.</p>";
    return false;
  }
}

async function buscarPorNombre(texto) {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  const coincidencias = listaGlobalPokemon.filter(nombre =>
    nombre.includes(texto.toLowerCase())
  );

  if (coincidencias.length === 0) {
    return false;
  }

  const primerosResultados = coincidencias.slice(0, 20);

  for (const nombre of primerosResultados) {
    await obtenerPokemon(nombre);
  }

  return true;
}

async function buscarPorTipo(tipo) {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${tipo.toLowerCase()}`);

    if (!response.ok) {
      throw new Error("Tipo no encontrado");
    }

    const data = await response.json();
    const lista = data.pokemon.slice(0, 20);

    if (lista.length === 0) {
      return false;
    }

    for (const item of lista) {
      await obtenerPokemon(item.pokemon.name);
    }

    return true;

  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function manejarBusqueda() {
  const texto = document.getElementById("searchInput").value.toLowerCase().trim();
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const container = document.getElementById("pokemonContainer");

  if (texto === "") {
    modoBusqueda = false;
    container.innerHTML = "";
    offset = 0;
    loadMoreBtn.style.display = "block";
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Cargar más Pokémon";
    await cargarPokemons();
    return;
  }

  modoBusqueda = true;
  loadMoreBtn.style.display = "none";
  container.innerHTML = "";

  // Si son solo números, buscar por ID
  if (/^\d+$/.test(texto)) {
    await buscarPorId(texto);
    return;
  }

  // Primero intentar por nombre parecido
  const encontradoPorNombre = await buscarPorNombre(texto);

  if (encontradoPorNombre) {
    return;
  }

  // Si no encontró por nombre, intentar por tipo
  const encontradoPorTipo = await buscarPorTipo(texto);

  if (!encontradoPorTipo) {
    container.innerHTML = "<p>No se encontraron resultados.</p>";
  }
}

async function iniciarApp() {
  await cargarListaGlobalPokemon();
  await cargarPokemons();
}

document.getElementById("loadMoreBtn").addEventListener("click", cargarPokemons);

document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(timeoutBusqueda);

  timeoutBusqueda = setTimeout(() => {
    manejarBusqueda();
  }, 400);
});

iniciarApp();