// Supongamos que ya validaste el login correctamente
const nombre = document.getElementById("login-name").value;
localStorage.setItem("usuarioActual", nombre); // Guardar el nombre
window.location.href = "../dashboard/dashboard.html"; // Redirigir al dashboard
