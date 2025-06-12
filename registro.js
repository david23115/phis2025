// En registro.js
document.getElementById("registro-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const nombre = document.getElementById("registro-nombre").value;
    const password = document.getElementById("registro-password").value;
  
    // Guardar en localStorage
    localStorage.setItem(nombre, password);
    alert("¡Registro exitoso!");
    window.location.href = "../login/index.html"; // Redirigir al login
  });
  