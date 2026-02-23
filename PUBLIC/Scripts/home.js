const usuario = JSON.parse(sessionStorage.getItem("usuarioActivo"));

if (usuario) {
  document.getElementById("nombreUsuario").textContent = usuario.name;
}
