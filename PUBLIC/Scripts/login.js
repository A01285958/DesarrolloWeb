// Se redirige a la pagina de registro al darle clic al boton Registrarse
const btnRegistro = document.getElementById("btnRegistro");

btnRegistro.addEventListener("click", function () {
  window.location.href = "../Paginas/registro.html";
});

// Tomamos el formulario
const form = document.querySelector("form");

//Usuario hardcodeado
const ValidUser = {
    email: "person@test.com",
    password: "pass123",
    name: "person"   
};

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("floatingInput").value.trim();
  const password = document.getElementById("floatingPassword").value;

  // 1) Validar contra el hardcodeado
  const esValidUser =
    email === ValidUser.email && password === ValidUser.password;

  if (esValidUser) {
    alert("Bienvenido " + ValidUser.name);
    window.location.href = "../Paginas/home.html";
    return;
  }

  // 2) Validar contra usuarios registrados en localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuarioEncontrado = usuarios.find(
    (u) => u.email === email && u.password === password
  );

  if (usuarioEncontrado) {
    alert("Bienvenido " + usuarioEncontrado.name);
    window.location.href = "../Paginas/home.html";
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});