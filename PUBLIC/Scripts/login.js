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

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  let usuarioAutenticado = null;

    // 1) Validar usuario hardcodeado
 if (email === ValidUser.email && password === ValidUser.password) {
    usuarioAutenticado = ValidUser;
  }

  // Validar registrados
  const usuarioEncontrado = usuarios.find(
    (u) => u.email === email && u.password === password
  );

  if (usuarioEncontrado) {
    usuarioAutenticado = usuarioEncontrado;
  }

  if (usuarioAutenticado) {

    // Crear token simple
    //btoa codifica en base64
    //La sesion dura hsta que se cierra el navegador
    const token = btoa(
      JSON.stringify({
        email: usuarioAutenticado.email,
        loginTime: Date.now()
      })
    );

    /// Guardar sesión
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioAutenticado));

    window.location.href = "../Paginas/home.html";

  } else {
    alert("Usuario o contraseña incorrectos");
  }
});
