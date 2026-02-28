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

    const nombrePokemon = clone.querySelector(".pokemonNombre");
    const imgPokemon = clone.querySelector(".pokemonImg");
    const tipoPokemon = clone.querySelector(".pokemonTipo");
    const abilitesPokemon = clone.querySelector(".pokemonHabilidades");
    const numPokemon = clone.querySelector(".pokemonNum");

    //Nombre de pokemon
    nombrePokemon.textContent = `Nombre: ${data.name}`;
    //Numero de pokemon
    numPokemon.textContent = `No. ${data.id}`;
    //Tipo de pokemon
    const tipos = data.types.map(t => t.type.name).join(", ");
    tipoPokemon.textContent = `Tipo: ${tipos}`;
    //Imagen
    imgPokemon.src = data.sprites.front_default;
    imgPokemon.alt = data.name;
    //Habilidades
    const habilidades = data.abilities.map(a => a.ability.name).join(", ");
    abilitesPokemon.textContent = `Habilidades: ${habilidades}`;

    container.appendChild(clone);

  } catch (error) {
    console.error("Error:", error);
  }
}

// obtenerPokemon("ditto");

async function obtenerListaPokemon(limit = 151, offset = 0) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  return data.results.map(p => p.name);
}

async function cargarPokemons() {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  const nombres = await obtenerListaPokemon(151, 0);

  for (const nombre of nombres) {
    await obtenerPokemon(nombre);
  }
}

cargarPokemons();