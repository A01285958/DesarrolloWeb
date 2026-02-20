const form = document.querySelector("form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    if (name === "" || email === "" || password === "") {
        alert("Todos los campos son obligatorios");
        return;
    }

    // Obtener usuarios existentes o crear arreglo vacío
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verificar si el usuario ya existe
    const existe = usuarios.find(user => user.email === email);

    if (existe) {
        alert("Este correo ya está registrado");
        return;
    }

    // Agregar nuevo usuario
    usuarios.push({
        name: name,
        email: email,
        password: password
    });

    // Guardar en localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro exitoso");
    window.location.href = "login.html";
});