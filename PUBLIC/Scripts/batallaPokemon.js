//Recupera la info de los 2 pokemones seleccionados en la vista anterior
let pokemones = JSON.parse(sessionStorage.getItem("pokemonBatalla")) || [];

//Funcion auxliar para pausar la ejecucion cierto tiempo
// Se usa para que la batalla se vea por turnos y no pase todo de golpe
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Genera un numero random entre una ventana de (min, max)
// Se usa para calcular daño, cura y escoger acciones aleatorias
function randomEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Agrega una linea de texto al registro visual de la batalla
function agregarLineaLog(texto) {
  const battleLog = document.getElementById("battleLog");
  const line = document.createElement("div");
  line.classList.add("log-line");
  line.textContent = texto;
  battleLog.appendChild(line);
  // Hace scroll automatico hacia abajo para ver siempre el ultimo turno
  battleLog.scrollTop = battleLog.scrollHeight;
}

// Actualiza en pantalla la cantidad de vida de los 2 pokemones
function actualizarArena(p1, p2) {
  document.getElementById("fighter1Hp").textContent = `Vida: ${Math.max(0, p1.hp)}%`;
  document.getElementById("fighter2Hp").textContent = `Vida: ${Math.max(0, p2.hp)}%`;
}

// Decide qué acción puede usar el Pokémon según el número de turnos que lleva
// Siempre puede usar ataque normal
// Defensa especial solo desde el turno 2
// Ataque especial solo desde el turno 3
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

// Ejecuta un turno de batalla para el Pokémon atacante contra el defensor
// Aumenta su contador de turnos y luego aplica una acción aleatoria
function ejecutarTurno(atacante, defensor) {
  // Suma 1 al número de turnos que lleva ese Pokémon
  atacante.turnos++;
  // Elige qué acción va a usar este turno
  const accion = elegirAccion(atacante);

  // Si toca ataque normal
  if (accion === "ataqueNormal") {
    // Tiene 20% de probabilidad de fallar
    const falla = Math.random() < 0.2;

    if (falla) {
      return `Turno de ${atacante.name}: usó ataque normal, pero falló.`;
    }

    // Si no falla, hace daño aleatorio entre 10 y 20
    const dano = randomEntre(10, 20);
    defensor.hp -= dano;
    return `Turno de ${atacante.name}: usó ataque normal, hizo ${dano}% de daño. A ${defensor.name} le queda ${Math.max(0, defensor.hp)}% de vida.`;
  }

  // Si toca ataque especial
  if (accion === "ataqueEspecial") {
    // Tiene 25% de probabilidad de fallar
    const falla = Math.random() < 0.25;

    if (falla) {
      return `Turno de ${atacante.name}: intentó ataque especial, pero falló.`;
    }

    // Si no falla, hace daño aleatorio entre 20 y 35
    const dano = randomEntre(20, 35);
    defensor.hp -= dano;
    return `Turno de ${atacante.name}: usó ataque especial, hizo ${dano}% de daño. A ${defensor.name} le queda ${Math.max(0, defensor.hp)}% de vida.`;
  }

  // Si toca defensa especial
  if (accion === "defensaEspecial") {
    const falla = Math.random() < 0.2;

    if (falla) {
      // Tiene 20% de probabilidad de fallar
      return `Turno de ${atacante.name}: intentó defensa especial, pero falló.`;
    }

    // Si no falla, recupera vida entre 2 y 8 sin pasar de 100% de vida
    const cura = randomEntre(2, 8);
    atacante.hp = Math.min(100, atacante.hp + cura);
    return `Turno de ${atacante.name}: usó defensa especial, recuperó ${cura}% de vida y ahora tiene ${atacante.hp}% de vida.`;
  }
}


// Función principal que inicia y controla toda la batalla
async function iniciarBatalla() {
  // Verifica que sí existan exactamente 2 Pokémon seleccionados
  if (pokemones.length !== 2) {
    alert("No hay 2 Pokémon seleccionados.");
    return;
  }

  // Desactiva el botón para que no puedan iniciar varias batallas al mismo tiempo
  const boton = document.getElementById("startFightNowBtn");
  boton.disabled = true;

  // Crea una copia de cada Pokémon y les asigna vida inicial y contador de turnos
  const p1 = {
    //... sirve para copiar todas las propiedades de un objeto dentro de otro objeto
    ...pokemones[0],
    hp: 100,
    turnos: 0
  };

  const p2 = {
    ...pokemones[1],
    hp: 100,
    turnos: 0
  };

  // Limpia el historial anterior de pelea y el ganador anterior
  document.getElementById("battleLog").innerHTML = "";
  document.getElementById("winnerBox").innerHTML = "";

  // Muestra los datos iniciales en pantalla
  actualizarArena(p1, p2);
  agregarLineaLog(`Comienza la batalla entre ${p1.name} y ${p2.name}.`);
  // Espera 1 segundo antes de comenzar los turnos
  await esperar(1000);

  // true significa que empieza el Pokémon 1
  let turnoDeP1 = true;

  // La batalla continúa mientras ambos tengan vida mayor a 0
  while (p1.hp > 0 && p2.hp > 0) {
    if (turnoDeP1) {
      // Si es turno del Pokémon 1, ataca a Pokémon 2
      agregarLineaLog(ejecutarTurno(p1, p2));
    } else {
      // Si es turno del Pokémon 2, ataca a Pokémon 1
      agregarLineaLog(ejecutarTurno(p2, p1));
    }

    // Actualiza la vida y datos en pantalla después de cada turno
    actualizarArena(p1, p2);

    // Si alguno ya quedó sin vida, termina el ciclo
    if (p1.hp <= 0 || p2.hp <= 0) {
      break;
    }

    // Cambia el turno al otro Pokémon
    turnoDeP1 = !turnoDeP1;
    // Espera entre turnos para que se pueda leer el turno y el ataque utilizado
    await esperar(1400);
  }

  // Determina el ganador según quién conserve vida
  const ganador = p1.hp > 0 ? p1 : p2;

  // Muestra en pantalla el Pokémon ganador con su imagen
  document.getElementById("winnerBox").innerHTML = `
    <h2>Ganador</h2>
    <img src="${ganador.img}" alt="${ganador.name}">
    <h3>${ganador.name}</h3>
  `;
}

// Carga en pantalla los 2 Pokémon seleccionados antes de iniciar la pelea
// Esto permite que desde que entras a la vista ya se vean los contendientes
function cargarDatosIniciales() {
  if (pokemones.length !== 2) {
    document.querySelector("main").innerHTML = `
      <h1>Batalla Pokémon</h1>
      <p>No se encontraron Pokémon seleccionados.</p>
    `;
    return;
  }

  // Coloca nombre, imagen y vida inicial de cada Pokémon en la vista
  document.getElementById("fighter1Name").textContent = pokemones[0].name;
  document.getElementById("fighter2Name").textContent = pokemones[1].name;
  document.getElementById("fighter1Img").src = pokemones[0].img;
  document.getElementById("fighter2Img").src = pokemones[1].img;
  document.getElementById("fighter1Hp").textContent = "Vida: 100%";
  document.getElementById("fighter2Hp").textContent = "Vida: 100%";
}

// Cuando el usuario da clic en el botón, se inicia la batalla
document.getElementById("startFightNowBtn").addEventListener("click", iniciarBatalla);

// Al cargar la página, se muestran los Pokémon elegidos
cargarDatosIniciales();