let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

// toggle.onclick = function(){
//     navigation.classList.toggle("active");
//     main.classList.toggle("active");

// }

let list = document.querySelectorAll(".navigation li");
function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}
list.forEach((item) => item.addEventListener("mouseover", activeLink));

function toggleCard(id) {
  const content = document.getElementById(id);
  const icon = content.previousElementSibling.querySelector(
    ".material-symbols-outlined"
  );
  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    icon.textContent = "expand_less";
  } else {
    content.classList.add("hidden");
    icon.textContent = "expand_more";
  }
}
function confirmarEliminacion(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#004D00",
    cancelButtonColor: "#8dc84b",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/deleteComment/" + id;
    }
  });
}

function abrirModalComentario(id, text) {
  //mostrar modal
  const modal = document.getElementById("modalEditarComentario");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  //obtener datos
  document.getElementById("idComment").value = id;
  document.getElementById("commentCommenter").value = text;

  //accion del formulario

  const form = document.getElementById("formEditarComentario");
  form.action = `/actualizarComentario/${id}`;
}

function cerrarModalComentario() {
  //cerrar modal
  const modal = document.getElementById("modalEditarComentario");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}
// Cerrar al hacer clic fuera del modal
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modalEditarComentario");
  if (e.target === modal) cerrarModalComentario();
});


//boton de prifile 

function DesplegarProfile() {
  const MostrarInfo = document.getElementById("MostrarInfo");

  if (MostrarInfo.classList.contains("hidden")) {
    // Si está oculto, mostrarlo
    MostrarInfo.classList.remove("hidden");
    MostrarInfo.classList.add("flex");
  } else {
    // Si está visible, ocultarlo
    MostrarInfo.classList.add("hidden");
    MostrarInfo.classList.remove("flex");
  }
}


// nota me nsaje para que se oculte
 let NotaComentarios = document.getElementById("NotaComentarios");
      let botonnota = document.getElementById("botonnota");

      botonnota.addEventListener("click", () => {
        NotaComentarios.classList.remove("flex");
        NotaComentarios.classList.add("hidden");
      });

// --- TEMA OSCURO ---
const themeToggler = document.querySelector(".theme-toggler");

if (themeToggler) {
  themeToggler.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
    themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
    
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("theme-preference", isDark ? "dark" : "light");
    
    // Notificar a las gráficas
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme: isDark ? "dark" : "light" } }));
  });

  // Cargar preferencia
  if (localStorage.getItem("theme-preference") === "dark") {
    document.body.classList.add("dark-theme");
    themeToggler.querySelector("span:nth-child(1)").classList.remove("active");
    themeToggler.querySelector("span:nth-child(2)").classList.add("active");
  }
}