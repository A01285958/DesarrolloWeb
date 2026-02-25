async function obtenerPokemon(nombre) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    
    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }

    const data = await response.json();

    const nombrePokemon = document.getElementById("pokemonNombre");
    const imgPokemon = document.getElementById("pokemonImg");

    nombrePokemon.textContent = `Nombre: ${data.name}`;
    imgPokemon.src = data.sprites.front_default;
    imgPokemon.alt = data.name;

  } catch (error) {
    document.getElementById("pokemonNombre").textContent = "Nombre: No encontrado";
    document.getElementById("pokemonImg").src = "";
    console.error("Error:", error);
  }
}

obtenerPokemon("ditto");