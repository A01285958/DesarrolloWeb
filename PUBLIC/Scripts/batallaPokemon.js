let pokemones = JSON.parse(sessionStorage.getItem("pokemonBatalla")) || [];

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function agregarLineaLog(texto) {
  const battleLog = document.getElementById("battleLog");
  const line = document.createElement("div");
  line.classList.add("log-line");
  line.textContent = texto;
  battleLog.appendChild(line);
  battleLog.scrollTop = battleLog.scrollHeight;
}

function actualizarArena(p1, p2) {
  document.getElementById("fighter1Name").textContent = p1.name;
  document.getElementById("fighter2Name").textContent = p2.name;
  document.getElementById("fighter1Img").src = p1.img;
  document.getElementById("fighter2Img").src = p2.img;
  document.getElementById("fighter1Hp").textContent = `Vida: ${Math.max(0, p1.hp)}%`;
  document.getElementById("fighter2Hp").textContent = `Vida: ${Math.max(0, p2.hp)}%`;
}

function elegirAccion(pokemon) {
  const acciones = ["ataqueNormal"];

  if (pokemon.turnos >= 2) {
    acciones.push("defensaEspecial");
  }

  if (pokemon.turnos >= 3) {
    acciones.push("ataqueEspecial");
  }

  return acciones[randomEntre(0, acciones.length - 1)];
}

function ejecutarTurno(atacante, defensor) {
  atacante.turnos++;

  const accion = elegirAccion(atacante);

  if (accion === "ataqueNormal") {
    const falla = Math.random() < 0.2;

    if (falla) {
      return `Turno de ${atacante.name}: usó ataque normal, pero falló.`;
    }

    const dano = randomEntre(10, 20);
    defensor.hp -= dano;
    return `Turno de ${atacante.name}: usó ataque normal, hizo ${dano}% de daño. A ${defensor.name} le queda ${Math.max(0, defensor.hp)}% de vida.`;
  }

  if (accion === "ataqueEspecial") {
    const falla = Math.random() < 0.25;

    if (falla) {
      return `Turno de ${atacante.name}: intentó ataque especial, pero falló.`;
    }

    const dano = randomEntre(20, 35);
    defensor.hp -= dano;
    return `Turno de ${atacante.name}: usó ataque especial, hizo ${dano}% de daño. A ${defensor.name} le queda ${Math.max(0, defensor.hp)}% de vida.`;
  }

  if (accion === "defensaEspecial") {
    const falla = Math.random() < 0.2;

    if (falla) {
      return `Turno de ${atacante.name}: intentó defensa especial, pero falló.`;
    }

    const cura = randomEntre(8, 18);
    atacante.hp = Math.min(100, atacante.hp + cura);
    return `Turno de ${atacante.name}: usó defensa especial, recuperó ${cura}% de vida y ahora tiene ${atacante.hp}% de vida.`;
  }
}

async function iniciarBatalla() {
  if (pokemones.length !== 2) {
    alert("No hay 2 Pokémon seleccionados.");
    return;
  }

  const boton = document.getElementById("startFightNowBtn");
  boton.disabled = true;

  const p1 = {
    ...pokemones[0],
    hp: 100,
    turnos: 0
  };

  const p2 = {
    ...pokemones[1],
    hp: 100,
    turnos: 0
  };

  document.getElementById("battleLog").innerHTML = "";
  document.getElementById("winnerBox").innerHTML = "";

  actualizarArena(p1, p2);
  agregarLineaLog(`Comienza la batalla entre ${p1.name} y ${p2.name}.`);
  await esperar(1000);

  let turnoDeP1 = true;

  while (p1.hp > 0 && p2.hp > 0) {
    if (turnoDeP1) {
      agregarLineaLog(ejecutarTurno(p1, p2));
    } else {
      agregarLineaLog(ejecutarTurno(p2, p1));
    }

    actualizarArena(p1, p2);

    if (p1.hp <= 0 || p2.hp <= 0) {
      break;
    }

    turnoDeP1 = !turnoDeP1;
    await esperar(1400);
  }

  const ganador = p1.hp > 0 ? p1 : p2;

  document.getElementById("winnerBox").innerHTML = `
    <h2>Ganador</h2>
    <img src="${ganador.img}" alt="${ganador.name}">
    <h3>${ganador.name}</h3>
  `;
}

function cargarDatosIniciales() {
  if (pokemones.length !== 2) {
    document.querySelector("main").innerHTML = `
      <h1>Batalla Pokémon</h1>
      <p>No se encontraron Pokémon seleccionados.</p>
    `;
    return;
  }

  document.getElementById("fighter1Name").textContent = pokemones[0].name;
  document.getElementById("fighter2Name").textContent = pokemones[1].name;
  document.getElementById("fighter1Img").src = pokemones[0].img;
  document.getElementById("fighter2Img").src = pokemones[1].img;
  document.getElementById("fighter1Hp").textContent = "Vida: 100%";
  document.getElementById("fighter2Hp").textContent = "Vida: 100%";
}

document.getElementById("startFightNowBtn").addEventListener("click", iniciarBatalla);

cargarDatosIniciales();