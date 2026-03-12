// Cantidad de Pokemon que se cargan por bloque
let limit = 20;
// Desde qué posición empieza a cargar en la API
let offset = 0;
// Evita que se hagan varias cargas al mismo tiempo
let cargando = false;
// Indica si el usuario está en modo búsqueda
let modoBusqueda = false;
// Guarda todos los nombres de Pokémon para hacer búsquedas parciales
let listaGlobalPokemon = [];
// Variable para retrasar la búsqueda mientras el usuario escribe
let timeoutBusqueda;

//Agregar a una lista los 2 pokemones seleccionados para la pelea
let pokemonesSeleccionados = [];

// Función para obtener un Pokémon específico por nombre o id
async function obtenerPokemon(nombre, limpiar = false) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);

    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }

    const data = await response.json();
    // Contenedor donde van las tarjetas
    const container = document.getElementById("pokemonContainer");
    // Obtiene el template HTML de una tarjeta
    const template = document.getElementById("pokemonTemplate");

    // Si limpiar es true, vacía el contenedor antes de agregar nueva info
    if (limpiar) {
      container.innerHTML = "";
    }

    // Clona el contenido del template
    const clone = template.content.cloneNode(true);

    // Elementos de la tarjeta clonada
    const card = clone.querySelector(".pokemon-card");
    const nombrePokemon = clone.querySelector(".pokemonNombre");
    const imgPokemon = clone.querySelector(".pokemonImg");
    const tipoPokemon = clone.querySelector(".pokemonTipo");
    const abilitesPokemon = clone.querySelector(".pokemonHabilidades");
    const numPokemon = clone.querySelector(".pokemonNum");
    const selectBtn = clone.querySelector(".selectPokemonBtn");

    nombrePokemon.textContent = `Nombre: ${data.name}`;
    numPokemon.textContent = `No. ${data.id}`;

    const tipos = data.types.map(t => t.type.name).join(", ");
    tipoPokemon.textContent = tipos;

    imgPokemon.src = data.sprites.front_default;
    imgPokemon.alt = data.name;

    const habilidades = data.abilities.map(a => a.ability.name).join(", ");
    abilitesPokemon.textContent = habilidades;

    const pokemonData = {
      id: data.id,
      name: data.name,
      img: data.sprites.front_default,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name)
    };

    if (pokemonesSeleccionados.find(p => p.id === data.id)){
      card.classList.add("selected");
    }

    selectBtn.addEventListener("click", () => {
      seleccionarPokemon(pokemonData, card);
    });
    
    // Agrega la tarjeta al contenedor
    container.appendChild(clone);

  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// obtenerPokemon(ditto)

// Carga una lista global con todos los nombres de Pokémon desde la API
// Sirve para hacer búsquedas parciales por nombre
async function cargarListaGlobalPokemon() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
    const data = await response.json();
    listaGlobalPokemon = data.results.map(p => p.name);
  } catch (error) {
    console.error("Error al cargar la lista global:", error);
  }
}

// Obtiene una lista de Pokémon por bloques usando limit y offset
async function obtenerListaPokemon(limit, offset) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  // Guarda cuántos Pokémon existen en total
  totalPokemones = data.count;
  // Regresa solo los nombres
  return data.results.map(p => p.name);
}

// Carga Pokémon normales al inicio o con el botón "Cargar más"
async function cargarPokemons() {
  if (cargando || modoBusqueda) return;

  cargando = true;

  // Obtiene el botón de cargar más
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  // Desactiva el botón mientras carga
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Cargando...";

  try {
    // Obtiene la siguiente lista de nombres
    const nombres = await obtenerListaPokemon(limit, offset);

    // Carga cada Pokémon uno por uno
    for (const nombre of nombres) {
      await obtenerPokemon(nombre);
    }

    // Avanza el offset para la siguiente carga
    offset += limit;

    // Si ya no quedan más Pokémon, oculta el botón
    if (offset >= totalPokemones) {
      loadMoreBtn.style.display = "none";
    } else {
      // Si aún quedan, reactiva el botón
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

// Busca un Pokémon por id exacto
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

// Busca Pokémon por coincidencia parcial en el nombre
async function buscarPorNombre(texto) {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  // Filtra los nombres que contengan el texto escrito
  const coincidencias = listaGlobalPokemon.filter(nombre =>
    nombre.includes(texto.toLowerCase())
  );

  if (coincidencias.length === 0) {
    return false;
  }

  // Solo toma los primeros 30 resultados para no saturar
  const primerosResultados = coincidencias.slice(0, 30);

  // Obtiene la información completa de cada uno
  for (const nombre of primerosResultados) {
    await obtenerPokemon(nombre);
  }

  return true;
}

// Busca Pokémon por tipo
async function buscarPorTipo(tipo) {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  try {
    // Pide a la API todos los Pokémon de ese tipo
    const response = await fetch(`https://pokeapi.co/api/v2/type/${tipo.toLowerCase()}`);

    // Si el tipo no existe, lanza error
    if (!response.ok) {
      throw new Error("Tipo no encontrado");
    }
    const data = await response.json();
    const lista = data.pokemon.slice(0, 30);

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

// Maneja la búsqueda automática
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

  // Si hay texto, entra en modo búsqueda
  modoBusqueda = true;
  loadMoreBtn.style.display = "none";
  container.innerHTML = "";

  // Si son solo números, buscar por ID
  // Utiliza la expresion regular para saber si en la cadena de texto hay solo numeros
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

//Funcion para seleccionar
function seleccionarPokemon(pokemonData, card) {
  const yaExiste = pokemonesSeleccionados.find(p => p.id === pokemonData.id);

  if (yaExiste) {
    pokemonesSeleccionados = pokemonesSeleccionados.filter(p => p.id !== pokemonData.id);
    card.classList.remove("selected");
  } else {
    if (pokemonesSeleccionados.length >= 2) {
      alert("Solo puedes seleccionar 2 Pokémon.");
      return;
    }

    pokemonesSeleccionados.push(pokemonData);
    card.classList.add("selected");
  }

  const texto = document.getElementById("selectedPokemonsText");
  const boton = document.getElementById("startBattleBtn");

  if (pokemonesSeleccionados.length === 0) {
    texto.textContent = "Selecciona 2 Pokémon para pelear";
    boton.disabled = true;
  } else if (pokemonesSeleccionados.length === 1) {
    texto.textContent = `Seleccionado: ${pokemonesSeleccionados[0].name}`;
    boton.disabled = true;
  } else {
    texto.textContent = `Pelea: ${pokemonesSeleccionados[0].name} vs ${pokemonesSeleccionados[1].name}`;
    boton.disabled = false;
  }
}

//Funcion para guardar y cambiar de vista
function irABatalla(){
  if(pokemonesSeleccionados.length !== 2){
    alert("Debes seleccionar 2 Pokemones");
    return;
  }
  sessionStorage.setItem("pokemonBatalla", JSON.stringify(pokemonesSeleccionados));
  window.location.href = "../Paginas/batallaPokemon.html";
}

// Función inicial al cargar la página
async function iniciarApp() {
  await cargarListaGlobalPokemon();
  // Carga los primeros Pokémon visibles
  await cargarPokemons();
}

document.getElementById("startBattleBtn").addEventListener("click", irABatalla);
// Evento del botón "Cargar más"
document.getElementById("loadMoreBtn").addEventListener("click", cargarPokemons);

// Evento del input de búsqueda con retraso de 400 ms
document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(timeoutBusqueda);

  timeoutBusqueda = setTimeout(() => {
    manejarBusqueda();
  }, 400);
});
iniciarApp();