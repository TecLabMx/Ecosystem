// ========================================
// INICIALIZACIÓN Y VARIABLES GLOBALES
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("CONOCE-TEC Dashboard - Sistema Iniciado");

  // ========================================
  // SISTEMA DE ROLES — leer y aplicar permisos
  // ========================================
  aplicarPermisosPorRol();

  // Obtener elementos del DOM
  const sidebar = document.getElementById("sidebar");
  const btnMenuToggle = document.getElementById("btnMenuToggle");
  const btnCloseSidebar = document.getElementById("btnCloseSidebar");
  const navItems = document.querySelectorAll(".nav-item, .hnav-item");
  const navBottomItems = document.querySelectorAll(".nav-bottom-item");
  const sections = document.querySelectorAll('[id^="section"]');

  // Carrusel removido - reemplazado por banner estático e información institucional
  const carouselIndicators = document.getElementById("carouselIndicators");

  // Mapa
  const markers = document.querySelectorAll(".marker");
  const searchInput = document.getElementById("searchInput");
  const btnFilter = document.getElementById("btnFilter");

  // Usuario
  const userName = document.getElementById("userName");

  // Menú de Redes Sociales
  const btnSocialMenu = document.getElementById("btnSocialMenu");
  const socialMenuDropdown = document.getElementById("socialMenuDropdown");

  // Variables de estado
  let currentCarouselIndex = 0;

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  cargarDatosUsuario();
  configurarEventos();

  // Sidebar removido - navegación horizontal en header

  // ========================================
  // NAVEGACIÓN POR SECCIONES
  // ========================================

  function configurarEventos() {
    // Eventos del menú lateral
    navItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        const section = this.getAttribute("data-section");
        cambiarSeccion(section);

        // Cerrar sidebar en móvil
        if (window.innerWidth <= 768) {
          if (sidebar) sidebar.classList.remove("active");
        }
      });
    });

    // Eventos de la barra inferior
    navBottomItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        const section = this.getAttribute("data-section");
        if (section) {
          cambiarSeccion(section);
        }
      });
    });

    // Evento del menu de redes sociales
    if (btnSocialMenu) {
      btnSocialMenu.addEventListener("click", function (e) {
        e.stopPropagation();
        socialMenuDropdown.classList.toggle("active");
      });
    }

    // Cerrar menu al hacer clic fuera
    document.addEventListener("click", function (e) {
      if (
        socialMenuDropdown &&
        !socialMenuDropdown.contains(e.target) &&
        e.target !== btnSocialMenu
      ) {
        socialMenuDropdown.classList.remove("active");
      }
    });

    // Tooltips de redes sociales
    const socialLinks = document.querySelectorAll(".social-link");
    const socialTooltip = document.getElementById("socialTooltip");

    socialLinks.forEach((link) => {
      link.addEventListener("mouseenter", function (e) {
        const tooltip = this.getAttribute("data-tooltip");
        if (tooltip && socialTooltip) {
          socialTooltip.textContent = tooltip;
          socialTooltip.classList.add("show");

          // Posicionar el tooltip
          const rect = this.getBoundingClientRect();
          socialTooltip.style.left = rect.left + rect.width / 2 - 50 + "px";
          socialTooltip.style.top = rect.top - 40 + "px";
        }
      });

      link.addEventListener("mouseleave", function () {
        if (socialTooltip) {
          socialTooltip.classList.remove("show");
        }
      });
    });
  }

  function cambiarSeccion(sectionName) {
    // Mapa de nombres de sección para el título de la pestaña
    const titulos = {
      inicio: "Inicio",
      agenda: "Agenda",
      mapa: "Mapa del Campus",
      notas: "Notas",
      directorio: "Directorio",
      servicios: "Servicios",
    };
    document.title =
      "CONOCE-TEC – " +
      (titulos[sectionName] ||
        sectionName.charAt(0).toUpperCase() + sectionName.slice(1));

    // Actualizar nav items activos (header nav + legacy sidebar)
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-section") === sectionName) {
        item.classList.add("active");
      }
    });

    // Actualizar nav items activos (bottom)
    navBottomItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-section") === sectionName) {
        item.classList.add("active");
      }
    });

    // Ocultar todas las secciones
    sections.forEach((section) => {
      section.classList.remove("active");
    });

    // Mapeo especial para las secciones
    let sectionId =
      "section" + sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    if (sectionName === "inicio") {
      sectionId = "sectionInicio";
    } else if (sectionName === "mapa") {
      sectionId = "sectionMapa";
    } else if (sectionName === "agenda") {
      sectionId = "sectionAgenda";
    } else if (sectionName === "notas") {
      sectionId = "sectionNotas";
    } else if (sectionName === "directorio") {
      sectionId = "sectionDirectorio";
    } else if (sectionName === "servicios") {
      sectionId = "sectionServicios";
    }

    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.classList.add("active");

      // Si es la sección del mapa, recargar el iframe para asegurar que se carga correctamente
      if (sectionName === "mapa") {
        setTimeout(function () {
          const mapIframe = sectionElement.querySelector("iframe");
          if (mapIframe) {
            // Forzar recarga del iframe
            const src = mapIframe.src;
            mapIframe.src = "";
            setTimeout(function () {
              mapIframe.src = src;
            }, 100);
          }
        }, 100);
      }
    }

    // Mostrar botón redes sociales solo en el inicio
    const socialContainer = document.querySelector(".social-menu-container");
    if (socialContainer) {
      if (sectionName === "inicio") {
        socialContainer.style.display = "";
      } else {
        socialContainer.style.display = "none";
        const dropdown = document.getElementById("socialMenuDropdown");
        if (dropdown) dropdown.classList.remove("active");
      }
    }

    console.log("Sección cambiada a:", sectionName, "ID:", sectionId);
  }
  // Lógica del carrusel removida - reemplazada por banner estático e información institucional

  // ========================================
  // INTERACCIÓN CON MARCADORES DEL MAPA
  // ========================================

  markers.forEach((marker) => {
    marker.addEventListener("click", function () {
      const building = this.getAttribute("data-building");

      // Encontrar el item del carrusel correspondiente
      const carouselItem = document.querySelector(
        `.carousel-item[data-building="${building}"]`,
      );
      if (carouselItem) {
        const index = Array.from(
          document.querySelectorAll(".carousel-item"),
        ).indexOf(carouselItem);
        irAlItem(index);
      }

      console.log("Marcador clickeado:", building);
    });

    // Efecto hover
    marker.addEventListener("mouseenter", function () {
      this.style.zIndex = "10";
    });

    marker.addEventListener("mouseleave", function () {
      this.style.zIndex = "1";
    });
  });

  // ========================================
  // BÚSQUEDA EN EL CAMPUS
  // ========================================

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === "") {
      // Mostrar todos los marcadores
      markers.forEach((marker) => {
        marker.style.opacity = "1";
        marker.style.pointerEvents = "auto";
      });
      return;
    }

    // Filtrar marcadores
    markers.forEach((marker) => {
      const label = marker
        .querySelector(".marker-label")
        .textContent.toLowerCase();
      const building = marker.getAttribute("data-building").toLowerCase();

      if (label.includes(searchTerm) || building.includes(searchTerm)) {
        marker.style.opacity = "1";
        marker.style.pointerEvents = "auto";
      } else {
        marker.style.opacity = "0.3";
        marker.style.pointerEvents = "none";
      }
    });

    console.log("Búsqueda:", searchTerm);
  });

  btnFilter.addEventListener("click", function () {
    console.log("Filtro clickeado");
    // Aquí se pueden agregar opciones de filtro
  });

  // ========================================
  // CARGAR DATOS DEL USUARIO
  // ========================================

  function cargarDatosUsuario() {
    // Obtener nombre del usuario desde sessionStorage o localStorage
    const nombreUsuario =
      sessionStorage.getItem("ct_nombre") ||
      sessionStorage.getItem("nombreUsuario") ||
      sessionStorage.getItem("usuarioActual") ||
      "Alumno";

    // Primer nombre para saludo y rol
    const primerNombre = nombreUsuario.split(" ")[0];

    // Actualizar nombre completo en la pastilla del header
    if (userName) userName.textContent = nombreUsuario;

    // Actualizar el span de rol con el primer nombre
    const userRole = document.getElementById("userRole");
    if (userRole) userRole.textContent = primerNombre;

    // Actualizar saludo del banner de bienvenida
    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) welcomeName.textContent = primerNombre;

    console.log("Usuario cargado:", nombreUsuario);
  }

  // ========================================
  // PANEL DE NOTIFICACIONES
  // ========================================

  inicializarPanelNotificaciones();

  // ========================================
  // EVENTOS DEL AVATAR
  // ========================================

  const userAvatar = document.querySelector(".user-avatar");
  if (userAvatar) {
    userAvatar.addEventListener("click", function () {
      console.log("Avatar clickeado");
    });
  }

  // ========================================
  // RESPONSIVE
  // ========================================

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      if (sidebar) sidebar.classList.remove("active");
    }
  });

  // ========================================
  // FUNCIONES DE DEPURACIÓN
  // ========================================

  window.verDashboard = function () {
    console.log("=== DATOS DEL DASHBOARD ===");
    console.log("Usuario:", userName.textContent);
    console.log("Sección actual:", document.querySelector("section.active").id);
    console.log("Item del carrusel:", currentCarouselIndex);
    console.log("========================");
  };

  window.irASeccion = function (section) {
    cambiarSeccion(section);
  };

  window.irACarrusel = function (index) {
    irAlItem(index);
  };

  console.log("Escribe verDashboard() para ver información del dashboard");
  console.log('Escribe irASeccion("nombreSeccion") para cambiar de sección');
  console.log("Escribe irACarrusel(index) para ir a un item del carrusel");
});

// ========================================
// FUNCIONES GLOBALES
// ========================================

// Simular clic en navegación
function navigateTo(section) {
  const navItem = document.querySelector(`[data-section="${section}"]`);
  if (navItem) {
    navItem.click();
  }
}

// Obtener información del edificio
function getBuildings() {
  return [
    {
      id: "edificio-a",
      name: "Edificio Académico A",
      description: "Aulas y laboratorios",
      aulas: 12,
      labs: 3,
    },
    {
      id: "biblioteca",
      name: "Biblioteca",
      description: "Centro de recursos",
      libros: "5000+",
      pcs: 50,
    },
    {
      id: "cafeteria",
      name: "Cafetería",
      description: "Comidas y bebidas",
      horario: "7:00 AM - 8:00 PM",
      asientos: 200,
    },
    {
      id: "deportes",
      name: "Deportes",
      description: "Áreas deportivas",
      campos: 2,
      gimnasio: true,
    },
    {
      id: "servicios-admin",
      name: "Servicios Administrativos",
      description: "Trámites y gestión",
      empleados: 15,
      horario: "8:00 AM - 6:00 PM",
    },
    {
      id: "estacionamiento",
      name: "Estacionamiento",
      description: "Área de parqueo",
      espacios: 300,
      vigilancia: "24/7",
    },
  ];
}

// Buscar edificio
function searchBuilding(term) {
  const buildings = getBuildings();
  return buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(term.toLowerCase()) ||
      b.description.toLowerCase().includes(term.toLowerCase()),
  );
}
// ========================================
// DIRECTORIO - grupos desplegables
// ========================================
function toggleDirGroup(header) {
  const list = header.nextElementSibling;
  const chevron = header.querySelector(".dir-chevron");
  const expanded = list.classList.contains("expanded");
  if (expanded) {
    list.classList.remove("expanded");
    list.style.display = "none";
    chevron.style.transform = "rotate(0deg)";
    chevron.classList.remove("fa-chevron-down");
    chevron.classList.add("fa-chevron-right");
  } else {
    list.classList.add("expanded");
    list.style.display = "flex";
    chevron.style.transform = "rotate(0deg)";
    chevron.classList.remove("fa-chevron-right");
    chevron.classList.add("fa-chevron-down");
  }
}

// ========================================
// DIRECTORIO - MODAL PERFIL / NUEVO CONTACTO
// ========================================

// Base de datos de contactos (en memoria)
var dirContactos = [];
var dirContactoActual = null;
var dirModoEdicion = false;
var dirFiltroDepto = "todos";
var dirMostrarFavoritos = false;
var dirMostrarArchivados = false;
var dirPaginaActual = 1;
var dirContactosPorPagina = 6;

document.addEventListener("DOMContentLoaded", function () {
  inicializarDirectorio();

  const searchInputDir = document.querySelector(".dir-search-input");
  if (searchInputDir) {
    searchInputDir.addEventListener("input", function (e) {
      renderizarDirectorio(e.target.value.toLowerCase());
    });
  }
});

function inicializarDirectorio() {
  var grid = document.getElementById("dirGrid");
  if (grid)
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><p style="margin-top:12px;">Cargando directorio...</p></div>';

  fetch("/api/directory")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      // Estado local de favoritos/archivados (solo en esta sesión)
      var estadoLocal = {};
      try {
        var raw = sessionStorage.getItem("ct_dir_estado");
        if (raw) estadoLocal = JSON.parse(raw);
      } catch (e) {}

      dirContactos = data.map(function (d, i) {
        var dep = (d.departamento || "").toLowerCase();
        var color = "azul";
        if (
          dep.includes("administración") ||
          dep.includes("gestión") ||
          dep.includes("gestion")
        )
          color = "naranja";
        else if (dep.includes("electrónic") || dep.includes("electromecán"))
          color = "morado";
        else if (
          dep.includes("química") ||
          dep.includes("ambiental") ||
          dep.includes("industrial")
        )
          color = "verde";
        else if (
          dep.includes("escolar") ||
          dep.includes("titulac") ||
          dep.includes("becas") ||
          dep.includes("servicios")
        )
          color = "rosa";

        var localState = estadoLocal[d.id] || {};
        return {
          id: d.id,
          nombre: d.nombre,
          cargo: d.departamento || "",
          correo: d.email || "",
          area: d.departamento || "General",
          puesto: d.departamento || "",
          especialidad: d.cubiculo || "",
          color: color,
          favorito: localState.favorito || false,
          archivado: localState.archivado || false,
          esInstitucional: true,
        };
      });

      actualizarContadoresDirectorio();
      renderizarDirectorio();
    })
    .catch(function (err) {
      console.error("Error cargando directorio:", err);
      if (grid)
        grid.innerHTML =
          '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ef4444;"><i class="fas fa-exclamation-triangle" style="font-size:2rem;"></i><p style="margin-top:12px;">No se pudo cargar el directorio.</p></div>';
    });
}
function guardarDirectorio() {
  // Solo guardamos favoritos y archivados en sesión (los datos vienen de la BD)
  var estado = {};
  dirContactos.forEach(function (c) {
    if (c.favorito || c.archivado)
      estado[c.id] = { favorito: c.favorito, archivado: c.archivado };
  });
  sessionStorage.setItem("ct_dir_estado", JSON.stringify(estado));
  actualizarContadoresDirectorio();
}

function actualizarContadoresDirectorio() {
  let favs = 0,
    arcs = 0,
    total = 0;
  dirContactos.forEach((c) => {
    if (c.archivado) arcs++;
    else {
      total++;
      if (c.favorito) favs++;
    }
  });
  const favEl = document.getElementById("favCount");
  const arcEl = document.getElementById("arcCount");
  const totalEl = document.getElementById("dirTotalTxt");
  if (favEl) favEl.textContent = favs;
  if (arcEl) arcEl.textContent = arcs;
  if (totalEl) totalEl.textContent = `${total} contactos en total`;
}

function renderizarDirectorio(searchTerm = "") {
  const grid = document.getElementById("dirGrid");
  if (!grid) return;

  let filtrados = dirContactos.filter((c) => {
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(searchTerm) ||
      (c.cargo && c.cargo.toLowerCase().includes(searchTerm));
    if (dirMostrarArchivados) return c.archivado && coincideBusqueda;
    if (c.archivado) return false;
    if (dirMostrarFavoritos) return c.favorito && coincideBusqueda;
    if (dirFiltroDepto !== "todos")
      return c.area === dirFiltroDepto && coincideBusqueda;
    return coincideBusqueda;
  });

  // Favoritos siempre primero
  filtrados.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));

  const total = filtrados.length;
  const paginas = Math.ceil(total / dirContactosPorPagina) || 1;
  if (dirPaginaActual > paginas) dirPaginaActual = paginas;

  const inicio = (dirPaginaActual - 1) * dirContactosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + dirContactosPorPagina);

  grid.innerHTML = "";
  paginados.forEach((c) => {
    const card = document.createElement("div");
    card.className = `dir-card dir-card-${c.color || "azul"}`;
    card.setAttribute("data-id", c.id);
    // Badge institucional visible solo para admin
    var badgeInst =
      c.esInstitucional && obtenerRol() === "admin"
        ? '<span style="display:inline-block;background:#1e2a5a;color:#fff;font-size:.6rem;font-weight:700;border-radius:5px;padding:1px 5px;margin-bottom:4px;letter-spacing:.04em;">INSTITUCIONAL</span>'
        : "";
    // Icono de archivo: solo admin puede archivar contactos institucionales
    var archiveIcon =
      !c.esInstitucional || obtenerRol() === "admin"
        ? `<i class="fas fa-archive dir-archive-icon" onclick="toggleArchivarContacto(${c.id})" title="Archivar/Desarchivar"></i>`
        : "";
    card.innerHTML = `
            <div class="dir-card-top">
                <span class="dir-badge dir-badge-${c.color || "azul"}">${c.area || "General"}</span>
                <div style="display:flex; gap:8px; align-items:center;">
                    ${archiveIcon}
                    <i class="fas fa-star dir-star ${c.favorito ? "active" : ""}" style="color:${c.favorito ? "#f5c518" : "#ccc"}" onclick="toggleFavorito(${c.id})"></i>
                </div>
            </div>
            ${badgeInst}
            <div class="dir-avatar-wrap"><div class="dir-avatar dir-avatar-${c.color || "azul"}"><i class="fas fa-user"></i></div></div>
            <div class="dir-card-info">
                <h3 class="dir-nombre-contacto">${c.nombre}</h3>
                <p class="dir-puesto">${c.cargo || ""}</p>
            </div>
            <button class="dir-btn-perfil" onclick="abrirPerfil(${c.id})">VER PERFIL</button>
        `;
    grid.appendChild(card);
  });

  actualizarPaginacionDir(total, paginas);
}

function actualizarPaginacionDir(total, paginas) {
  const info = document.querySelector(".dir-pag-info");
  if (info)
    info.textContent = `Mostrando ${Math.min(total, dirContactosPorPagina)} de ${total} contactos`;
  const btns = document.querySelector(".dir-pag-btns");
  if (!btns) return;
  btns.innerHTML = "";

  const btnPrev = document.createElement("button");
  btnPrev.className = "dir-pag-btn";
  btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
  btnPrev.disabled = dirPaginaActual === 1;
  btnPrev.onclick = () => {
    if (dirPaginaActual > 1) {
      dirPaginaActual--;
      renderizarDirectorio();
    }
  };
  btns.appendChild(btnPrev);

  for (let i = 1; i <= paginas; i++) {
    const btn = document.createElement("button");
    btn.className = `dir-pag-btn ${dirPaginaActual === i ? "dir-pag-active" : ""}`;
    btn.textContent = i;
    btn.onclick = () => {
      dirPaginaActual = i;
      renderizarDirectorio();
    };
    btns.appendChild(btn);
  }

  const btnNext = document.createElement("button");
  btnNext.className = "dir-pag-btn";
  btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
  btnNext.disabled = dirPaginaActual === paginas;
  btnNext.onclick = () => {
    if (dirPaginaActual < paginas) {
      dirPaginaActual++;
      renderizarDirectorio();
    }
  };
  btns.appendChild(btnNext);
}

function filtrarDepto(depto) {
  dirFiltroDepto = depto;
  dirMostrarFavoritos = false;
  dirMostrarArchivados = false;
  dirPaginaActual = 1;
  document
    .querySelectorAll(".dir-item")
    .forEach((i) => i.classList.remove("active"));
  document.querySelector(".dir-favoritos-btn").classList.remove("active");
  document.querySelector(".dir-archivadas").classList.remove("active");
  event.currentTarget.classList.add("active");
  renderizarDirectorio();
}

function filtrarFavoritos() {
  dirMostrarFavoritos = true;
  dirMostrarArchivados = false;
  dirFiltroDepto = "todos";
  dirPaginaActual = 1;
  document
    .querySelectorAll(".dir-item")
    .forEach((i) => i.classList.remove("active"));
  document.querySelector(".dir-archivadas").classList.remove("active");
  document.querySelector(".dir-favoritos-btn").classList.add("active");
  renderizarDirectorio();
}

function filtrarArchivados() {
  dirMostrarArchivados = true;
  dirMostrarFavoritos = false;
  dirFiltroDepto = "todos";
  dirPaginaActual = 1;
  document
    .querySelectorAll(".dir-item")
    .forEach((i) => i.classList.remove("active"));
  document.querySelector(".dir-favoritos-btn").classList.remove("active");
  document.querySelector(".dir-archivadas").classList.add("active");
  renderizarDirectorio();
}

function toggleFavorito(id) {
  const idx = dirContactos.findIndex((c) => c.id === id);
  dirContactos[idx].favorito = !dirContactos[idx].favorito;
  guardarDirectorio();
  renderizarDirectorio();
}

function toggleArchivarContacto(id) {
  const idx = dirContactos.findIndex((c) => c.id === id);
  dirContactos[idx].archivado = !dirContactos[idx].archivado;
  guardarDirectorio();
  renderizarDirectorio();
}

function abrirPerfil(id) {
  var contacto = dirContactos.find(function (c) {
    return c.id === id;
  });
  if (!contacto) return;
  dirContactoActual = contacto;
  dirModoEdicion = false;
  rellenarModal(contacto, false);
  document.getElementById("dirModalOverlay").classList.add("active");
}

function abrirNuevoContacto() {
  dirContactoActual = null;
  dirModoEdicion = true;
  limpiarFormulario();
  mostrarModoEdicion(true);
  document.getElementById("dirModalEditBtn").style.display = "none";
  document.getElementById("dirModalDeleteBtn").style.display = "none";
  document.getElementById("dirModalName").textContent = "Nuevo Contacto";
  document.getElementById("dirModalRole").textContent = "COMPLETA LOS DATOS";
  document.getElementById("dirModalOverlay").classList.add("active");
}

function rellenarModal(c, edicion) {
  document.getElementById("dirModalName").textContent = c.nombre;
  document.getElementById("dirModalRole").textContent = c.cargo;
  document.getElementById("vFechaNac").textContent = c.fechaNac || "—";
  document.getElementById("vCelular").textContent = c.celular || "—";
  document.getElementById("vCorreo").textContent = c.correo || "—";
  document.getElementById("vArea").textContent = c.area || "—";
  document.getElementById("vPuesto").textContent = c.puesto || "—";
  document.getElementById("vEspecialidad").textContent = c.especialidad || "—";
  document.getElementById("vCedula").textContent = c.cedula || "—";
  // Carrera específica independiente
  var vCarreraEspEl = document.getElementById("vCarreraEsp");
  if (vCarreraEspEl) {
    vCarreraEspEl.textContent = c.carreraEsp || "—";
    // Mostrar/ocultar la fila según si hay valor
    var vCarreraEspRow = document.getElementById("vCarreraEspRow");
    if (vCarreraEspRow)
      vCarreraEspRow.style.display = c.carreraEsp ? "" : "none";
  }
  var ul = document.getElementById("vMaterias");
  ul.innerHTML = "";
  if (c.materias && c.materias.length > 0) {
    c.materias.forEach(function (m) {
      var li = document.createElement("li");
      li.textContent = m;
      ul.appendChild(li);
    });
  } else {
    ul.innerHTML = "<li>—</li>";
  }
  document.getElementById("dirModalEditBtn").style.display = "";
  document.getElementById("dirModalDeleteBtn").style.display = "";
  mostrarModoEdicion(edicion);
}

function mostrarModoEdicion(editar) {
  document.getElementById("dirViewMode").style.display = editar
    ? "none"
    : "block";
  document.getElementById("dirEditMode").style.display = editar
    ? "block"
    : "none";
}

function limpiarFormulario() {
  [
    "fNombre",
    "fPuesto",
    "fFechaNac",
    "fCelular",
    "fCorreo",
    "fArea",
    "fCarreraEsp",
    "fEspecialidad",
    "fCedula",
    "fMaterias",
  ].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  handleAreaChange("");
}

function handleAreaChange(valor) {
  const carreraGroup = document.getElementById("fCarreraGroup");
  if (carreraGroup) {
    // Solo mostrar el selector de "carrera principal" cuando Área = Carreras
    carreraGroup.style.display = valor === "Carreras" ? "block" : "none";
  }
  // fCarreraEspGroup siempre visible — no se toca aquí
}

function guardarContacto() {
  var nombre = document.getElementById("fNombre").value.trim();
  var puesto = document.getElementById("fPuesto").value.trim();
  var areaSelect = document.getElementById("fArea").value;
  var carreraSelect = document.getElementById("fCarrera").value;
  // Carrera específica: campo independiente del Área
  var carreraEspEl = document.getElementById("fCarreraEsp");
  var carreraEsp = carreraEspEl ? carreraEspEl.value.trim() : "";

  if (!nombre) {
    alert("El nombre es obligatorio.");
    return;
  }
  if (!areaSelect) {
    alert("El área es obligatoria.");
    return;
  }

  // Cuando Área = Carreras, el área final es la carrera principal seleccionada
  var areaFinal = areaSelect === "Carreras" ? carreraSelect : areaSelect;

  // Mapa de colores por área/departamento/carrera
  var colorPorArea = {
    Administración: "naranja",
    Académico: "azul",
    Servicios: "verde",
    Coordinación: "rosa",
    Dirección: "morado",
    "Dirección General": "indigo",
    "Subdirección Académica": "cian",
    "Subdirección de Planeación": "teal",
    "Ingeniería en Gestión Empresarial": "naranja",
    "Ingeniería Electromecánica": "coral",
    "Ingeniería en Sistemas Computacionales": "indigo",
    "Ingeniería Electrónica": "cian",
    "Ingeniería Ambiental": "teal",
    "Ingeniería Industrial": "amarillo",
    "Ingeniería Química": "morado",
    "Licenciatura en Administración": "rosa",
    "Ingeniería en Inteligencia Artificial": "lima",
    "Ingeniería en Desarrollo de Aplicaciones": "granate",
    Posgrado: "oliva",
  };
  var colorAsignado = colorPorArea[areaFinal] || "azul";

  var datos = {
    nombre: nombre,
    cargo: puesto.toUpperCase(),
    puesto: puesto,
    fechaNac: document.getElementById("fFechaNac").value.trim(),
    celular: document.getElementById("fCelular").value.trim(),
    correo: document.getElementById("fCorreo").value.trim(),
    area: areaFinal,
    carreraEsp: carreraEsp, // carrera específica independiente del área
    especialidad: document.getElementById("fEspecialidad").value.trim(),
    cedula: document.getElementById("fCedula").value.trim(),
    materias: document
      .getElementById("fMaterias")
      .value.split(",")
      .map(function (m) {
        return m.trim();
      })
      .filter(Boolean),
    color: colorAsignado,
  };

  if (dirContactoActual) {
    // Al editar, conservar el flag institucional original
    Object.assign(dirContactoActual, datos);
    rellenarModal(dirContactoActual, false);
  } else {
    var nuevoId = Date.now();
    datos.id = nuevoId;
    datos.favorito = false;
    datos.archivado = false;
    // Admin crea contactos institucionales; alumno crea contactos personales
    datos.esInstitucional = obtenerRol() === "admin";
    dirContactos.push(datos);
    dirContactoActual = datos;
    rellenarModal(datos, false);
  }
  guardarDirectorio();
  renderizarDirectorio();
  dirModoEdicion = false;
}

// Botón editar dentro del modal
document.addEventListener("DOMContentLoaded", function () {
  var editBtn = document.getElementById("dirModalEditBtn");
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      if (!dirContactoActual) return;
      // Rellenar formulario
      document.getElementById("fNombre").value = dirContactoActual.nombre || "";
      document.getElementById("fPuesto").value = dirContactoActual.puesto || "";
      document.getElementById("fFechaNac").value =
        dirContactoActual.fechaNac || "";
      document.getElementById("fCelular").value =
        dirContactoActual.celular || "";
      document.getElementById("fCorreo").value = dirContactoActual.correo || "";

      // Carrera específica independiente — siempre se rellena si existe
      var carreraEspEl = document.getElementById("fCarreraEsp");
      if (carreraEspEl) carreraEspEl.value = dirContactoActual.carreraEsp || "";

      // Lógica para el área y carrera principal
      const areaActual = dirContactoActual.area || "";
      const areasPrincipales = [
        "Administración",
        "Académico",
        "Servicios",
        "Dirección",
        "Coordinación",
      ];

      if (areasPrincipales.includes(areaActual)) {
        document.getElementById("fArea").value = areaActual;
        handleAreaChange(areaActual);
      } else if (areaActual !== "") {
        document.getElementById("fArea").value = "Carreras";
        handleAreaChange("Carreras");
        document.getElementById("fCarrera").value = areaActual;
      } else {
        document.getElementById("fArea").value = "";
        handleAreaChange("");
      }

      document.getElementById("fEspecialidad").value =
        dirContactoActual.especialidad || "";
      document.getElementById("fCedula").value = dirContactoActual.cedula || "";
      document.getElementById("fMaterias").value = (
        dirContactoActual.materias || []
      ).join(", ");
      mostrarModoEdicion(true);
    });
  }
  var delBtn = document.getElementById("dirModalDeleteBtn");
  if (delBtn) {
    delBtn.addEventListener("click", function () {
      if (!dirContactoActual) return;
      if (!confirm("¿Eliminar a " + dirContactoActual.nombre + "?")) return;
      dirContactos = dirContactos.filter(function (c) {
        return c.id !== dirContactoActual.id;
      });
      guardarDirectorio();
      renderizarDirectorio();
      cerrarModalDir();
    });
  }
});

function cerrarModalDir(e) {
  const overlay = document.getElementById("dirModalOverlay");
  if (e && e.target !== overlay) return;
  if (overlay) overlay.classList.remove("active");
  dirContactoActual = null;
  dirModoEdicion = false;
  mostrarModoEdicion(false);
}

// ========================================
// AGENDA v2 - Tabs
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  // Tabs de agenda
  document.querySelectorAll(".ag2-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tabId = this.getAttribute("data-tab");
      // Activar tab
      document.querySelectorAll(".ag2-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      this.classList.add("active");
      // Mostrar contenido
      document.querySelectorAll(".ag2-tab-content").forEach(function (c) {
        c.classList.remove("active");
      });
      var el = document.getElementById(tabId);
      if (el) el.classList.add("active");
    });
  });
});

// ========================================
// CONTADORES EN TIEMPO REAL (localStorage)
// ========================================

(function () {
  // --- Contador de Visitas ---
  // Visitas: contador local por sesión (localStorage) — comportamiento original
  var visitaContada = sessionStorage.getItem("visitaContada");
  if (!visitaContada) {
    var visitas = parseInt(localStorage.getItem("contadorVisitas") || "0", 10);
    visitas += 1;
    localStorage.setItem("contadorVisitas", visitas);
    sessionStorage.setItem("visitaContada", "true");
  }

  // REQ-03: Registrados — contador real desde la BD vía /api/auth/count
  function actualizarContadores() {
    // Visitas: desde localStorage
    var elVisitas = document.getElementById("footerVisitas");
    if (elVisitas) {
      var visitas = parseInt(
        localStorage.getItem("contadorVisitas") || "0",
        10,
      );
      elVisitas.textContent = visitas.toLocaleString("es-MX");
    }

    // Registrados: desde la BD
    var elRegistrados = document.getElementById("footerRegistrados");
    if (elRegistrados) {
      fetch("/api/auth/count")
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (typeof data.total === "number") {
            elRegistrados.textContent = data.total.toLocaleString("es-MX");
          }
        })
        .catch(function () {
          elRegistrados.textContent = "—";
        });
    }
  }

  // Actualizar al cargar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", actualizarContadores);
  } else {
    actualizarContadores();
  }

  // Sincronizar visitas entre pestañas
  window.addEventListener("storage", function (e) {
    if (e.key === "contadorVisitas") actualizarContadores();
  });

  // Exponer función global — refresca registrados desde BD
  window.incrementarContadorRegistrados = function () {
    actualizarContadores();
  };
})();
// ========================================
// MÓDULO DE NOTAS v2
// ========================================

let notas = [];
let notaEditandoId = null;
let filtroCategoria = "todas";
let mostrarArchivadas = false;
let notasPorPagina = 6;
let paginaActual = 1;

document.addEventListener("DOMContentLoaded", function () {
  inicializarNotas();

  // Evento para búsqueda de notas
  const searchInputNotas = document.querySelector(".notas-search-input");
  if (searchInputNotas) {
    searchInputNotas.addEventListener("input", function (e) {
      const term = e.target.value.toLowerCase();
      renderizarNotas(term);
    });
  }

  // Eventos para categorías
  document.querySelectorAll(".notas-cat-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".notas-cat-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      filtroCategoria = this.getAttribute("data-cat");
      mostrarArchivadas = false;
      paginaActual = 1;
      renderizarNotas();
    });
  });

  // Evento para archivadas
  const btnArchivadas = document.querySelector(".notas-archivadas");
  if (btnArchivadas) {
    btnArchivadas.addEventListener("click", function () {
      document
        .querySelectorAll(".notas-cat-item")
        .forEach((i) => i.classList.remove("active"));
      mostrarArchivadas = true;
      paginaActual = 1;
      renderizarNotas();
    });
  }
});

function inicializarNotas() {
  var grid = document.getElementById("notasGrid");
  if (grid)
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><p style="margin-top:12px;">Cargando notas...</p></div>';

  var token = sessionStorage.getItem("ct_token");
  if (!token) {
    renderizarNotas();
    return;
  }

  fetch("/api/notes", { headers: { Authorization: "Bearer " + token } })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error("Respuesta inválida");
      notas = data.map(function (n) {
        return {
          id: n.id,
          titulo: n.titulo,
          contenido: n.contenido || "",
          color: n.color || "amarilla",
          categoria: n.categoria || "general",
          fijada: n.fijada || false,
          archivada: n.archivada || false,
          fecha: n.created_at || new Date().toISOString(),
          creadaEn: n.created_at || new Date().toISOString(),
        };
      });
      actualizarContadoresSidebar();
      renderizarNotas();
    })
    .catch(function (err) {
      console.error("Error cargando notas:", err);
      notas = [];
      renderizarNotas();
    });
}
function guardarNotas() {
  // Los datos ya están en la BD — solo actualizamos contadores locales
  actualizarContadoresSidebar();
}

function actualizarContadoresSidebar() {
  const counts = {
    todas: 0,
    academica: 0,
    personal: 0,
    ideas: 0,
    proyectos: 0,
    archivadas: 0,
  };
  notas.forEach((n) => {
    if (n.archivada) {
      counts.archivadas++;
    } else {
      counts.todas++;
      if (counts[n.categoria] !== undefined) counts[n.categoria]++;
    }
  });

  document.querySelectorAll(".notas-cat-item").forEach((item) => {
    const cat = item.getAttribute("data-cat");
    const countSpan = item.querySelector(".notas-cat-count");
    if (countSpan) countSpan.textContent = counts[cat];
  });

  const arcCount = document.querySelector(".notas-archivadas .notas-cat-count");
  if (arcCount) arcCount.textContent = counts.archivadas;

  const totalTxt = document.querySelector(".notas-total");
  if (totalTxt) totalTxt.textContent = `${counts.todas} notas en total`;
}

function renderizarNotas(searchTerm = "") {
  const grid = document.getElementById("notasGrid");
  if (!grid) return;

  let notasFiltradas = notas.filter((n) => {
    const coincideBusqueda =
      n.titulo.toLowerCase().includes(searchTerm) ||
      n.contenido.toLowerCase().includes(searchTerm);
    const coincideEstado = mostrarArchivadas
      ? n.archivada
      : !n.archivada &&
        (filtroCategoria === "todas" || n.categoria === filtroCategoria);
    return coincideBusqueda && coincideEstado;
  });

  // Ordenar: fijadas primero, luego por fecha descendente
  notasFiltradas.sort((a, b) => {
    if (a.fijada && !b.fijada) return -1;
    if (!a.fijada && b.fijada) return 1;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Paginación
  const totalNotas = notasFiltradas.length;
  const totalPaginas = Math.ceil(totalNotas / notasPorPagina) || 1;
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * notasPorPagina;
  const fin = inicio + notasPorPagina;
  const notasPagina = notasFiltradas.slice(inicio, fin);

  grid.innerHTML = "";
  notasPagina.forEach((nota) => {
    const card = crearTarjetaNota(nota);
    grid.appendChild(card);
  });

  actualizarPaginacion(totalNotas, totalPaginas);
}

function crearTarjetaNota(nota) {
  const div = document.createElement("div");
  div.className = `nota-card nota-${nota.color} ${nota.fijada ? "nota-fijada" : ""}`;

  const fechaObj = new Date(nota.fecha);
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const dia = fechaObj.getDate();
  const mes = meses[fechaObj.getMonth()];
  const anio = fechaObj.getFullYear();
  const hh = String(fechaObj.getHours()).padStart(2, "0");
  const mm = String(fechaObj.getMinutes()).padStart(2, "0");
  const horaStr = `${hh}:${mm}`;

  // Si tiene creadaEn y es distinta a fecha → fue actualizada
  let fechaLabel;
  if (nota.creadaEn && nota.creadaEn !== nota.fecha) {
    fechaLabel = `Actualizada: ${dia} de ${mes} de ${anio}, ${horaStr}`;
  } else {
    fechaLabel = `Creada: ${dia} de ${mes} de ${anio}, ${horaStr}`;
  }

  // Procesar contenido para checklist
  let contenidoHTML = "";
  if (nota.contenido.includes("- ")) {
    const lineas = nota.contenido.split("\n");
    contenidoHTML =
      '<div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;">';
    lineas.forEach((linea, idx) => {
      if (linea.startsWith("- ")) {
        const texto = linea.substring(2);
        const isDone = texto.startsWith("[x] ");
        const limpio = isDone ? texto.substring(4) : texto;
        contenidoHTML += `
                    <span class="nota-task">
                        <input type="checkbox" class="nota-task-checkbox" ${isDone ? "checked" : ""} onchange="toggleCheck(${nota.id}, ${idx})">
                        <span class="${isDone ? "nota-task-done" : ""}">${limpio}</span>
                    </span>`;
      } else {
        contenidoHTML += `<p>${linea}</p>`;
      }
    });
    contenidoHTML += "</div>";
  } else {
    contenidoHTML = `<p>${nota.contenido.replace(/\n/g, "<br>")}</p>`;
  }

  div.innerHTML = `
        <div class="nota-card-header">
            <span class="nota-badge nota-badge-${nota.color}">${nota.categoria.toUpperCase()}</span>
            <div style="display:flex; gap:8px;">
                <i class="fas fa-thumbtack nota-pin-btn" style="color: ${nota.fijada ? "#3b5bdb" : "#aaa"}" onclick="togglePin(${nota.id})" title="Fijar/Desfijar"></i>
                <i class="fas fa-archive nota-archive-btn" onclick="toggleArchivar(${nota.id})" title="Archivar/Desarchivar"></i>
                <i class="fas fa-trash nota-delete" onclick="eliminarNota(${nota.id})" title="Eliminar"></i>
            </div>
        </div>
        <div class="nota-body">
            <p class="nota-bold">${nota.titulo}</p>
            ${contenidoHTML}
            ${nota.recordatorio ? `<div class="nota-reminder"><i class="fas fa-bell"></i> ${nota.recordatorio}</div>` : ""}
        </div>
        <div class="nota-footer">
            <span class="nota-fecha"><i class="fas fa-clock"></i> ${fechaLabel}</span>
            <i class="fas fa-pen nota-edit" onclick="abrirEditarNota(${nota.id})" title="Editar"></i>
        </div>
        <div class="nota-curl nota-curl-${nota.color}"></div>
    `;
  return div;
}

function obtenerMes(m) {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return meses[m];
}

function actualizarPaginacion(total, paginas) {
  const info = document.querySelector(".notas-pag-info");
  if (info)
    info.textContent = `Mostrando ${Math.min(total, notasPorPagina)} de ${total} notas`;

  const btnsContainer = document.querySelector(".notas-pag-btns");
  if (!btnsContainer) return;

  btnsContainer.innerHTML = "";

  // Botón anterior
  const btnPrev = document.createElement("button");
  btnPrev.className = "notas-pag-btn";
  btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
  btnPrev.disabled = paginaActual === 1;
  btnPrev.onclick = () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarNotas();
    }
  };
  btnsContainer.appendChild(btnPrev);

  // Números de página
  for (let i = 1; i <= paginas; i++) {
    const btn = document.createElement("button");
    btn.className = `notas-pag-btn ${paginaActual === i ? "notas-pag-active" : ""}`;
    btn.textContent = i;
    btn.onclick = () => {
      paginaActual = i;
      renderizarNotas();
    };
    btnsContainer.appendChild(btn);
  }

  // Botón siguiente
  const btnNext = document.createElement("button");
  btnNext.className = "notas-pag-btn";
  btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
  btnNext.disabled = paginaActual === paginas;
  btnNext.onclick = () => {
    if (paginaActual < paginas) {
      paginaActual++;
      renderizarNotas();
    }
  };
  btnsContainer.appendChild(btnNext);
}

// Funciones de acción
function abrirNuevaNota() {
  notaEditandoId = null;
  document.getElementById("notaModalTitle").textContent = "Nueva Nota";
  document.getElementById("notaTitulo").value = "";
  document.getElementById("notaContenido").value = "";
  // Preseleccionar categoría activa si no es "todas" ni vista de archivadas
  const categoriasValidas = ["academica", "personal", "ideas", "proyectos"];
  if (
    !mostrarArchivadas &&
    filtroCategoria !== "todas" &&
    categoriasValidas.includes(filtroCategoria)
  ) {
    document.getElementById("notaCategoria").value = filtroCategoria;
  } else {
    document.getElementById("notaCategoria").value = "academica";
  }
  document.getElementById("notaColor").value = "amarilla";
  document.getElementById("notaRecordatorioTexto").value = "";
  document.getElementById("notaRecordatorioFecha").value = "";
  document.getElementById("notaModalOverlay").classList.add("active");
}

function abrirEditarNota(id) {
  const nota = notas.find((n) => n.id === id);
  if (!nota) return;

  notaEditandoId = id;
  document.getElementById("notaModalTitle").textContent = "Editar Nota";
  document.getElementById("notaTitulo").value = nota.titulo;
  document.getElementById("notaContenido").value = nota.contenido;
  document.getElementById("notaCategoria").value = nota.categoria;
  document.getElementById("notaColor").value = nota.color;

  // Intentar parsear recordatorio
  if (nota.recordatorio && nota.recordatorio.includes(": ")) {
    const parts = nota.recordatorio.split(": ");
    document.getElementById("notaRecordatorioTexto").value = parts[0];
  } else {
    document.getElementById("notaRecordatorioTexto").value =
      nota.recordatorio || "";
  }

  document.getElementById("notaModalOverlay").classList.add("active");
}

function cerrarModalNota() {
  document.getElementById("notaModalOverlay").classList.remove("active");
}

async function guardarNota() {
  const titulo = document.getElementById("notaTitulo").value.trim();
  const contenido = document.getElementById("notaContenido").value.trim();
  const categoria = document.getElementById("notaCategoria").value;
  const color = document.getElementById("notaColor").value;

  if (!titulo) {
    alert("El título es obligatorio");
    return;
  }

  const token = sessionStorage.getItem("ct_token");
  if (!token) {
    alert("Debes iniciar sesión para guardar notas");
    return;
  }

  const payload = { titulo, contenido, categoria, color };

  try {
    let res, data;
    if (notaEditandoId) {
      res = await fetch("/api/notes/" + notaEditandoId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (res.ok) {
        const idx = notas.findIndex((n) => n.id === notaEditandoId);
        notas[idx] = { ...notas[idx], titulo, contenido, categoria, color };
      }
    } else {
      res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (res.ok) {
        notas.unshift({
          id: data.id,
          titulo: data.titulo,
          contenido: data.contenido || "",
          color: data.color || color,
          categoria: data.categoria || categoria,
          fijada: false,
          archivada: false,
          fecha: data.created_at || new Date().toISOString(),
          creadaEn: data.created_at || new Date().toISOString(),
        });
      }
    }
    if (!res.ok) {
      alert(data.message || "Error al guardar nota");
      return;
    }
  } catch (err) {
    console.error("Error guardando nota:", err);
    alert("Error de conexión al guardar nota");
    return;
  }

  actualizarContadoresSidebar();
  renderizarNotas();
  cerrarModalNota();
}

async function eliminarNota(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta nota?")) return;
  const token = sessionStorage.getItem("ct_token");
  try {
    const res = await fetch("/api/notes/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      notas = notas.filter((n) => n.id !== id);
      actualizarContadoresSidebar();
      renderizarNotas();
    } else {
      alert("Error al eliminar nota");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

async function togglePin(id) {
  const idx = notas.findIndex((n) => n.id === id);
  const newVal = !notas[idx].fijada;
  const token = sessionStorage.getItem("ct_token");
  try {
    await fetch("/api/notes/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ fijada: newVal }),
    });
    notas[idx].fijada = newVal;
  } catch (err) {
    console.error(err);
  }
  actualizarContadoresSidebar();
  renderizarNotas();
}

async function toggleArchivar(id) {
  const idx = notas.findIndex((n) => n.id === id);
  const newVal = !notas[idx].archivada;
  const token = sessionStorage.getItem("ct_token");
  try {
    await fetch("/api/notes/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ archivada: newVal }),
    });
    notas[idx].archivada = newVal;
  } catch (err) {
    console.error(err);
  }
  actualizarContadoresSidebar();
  renderizarNotas();
}

function toggleCheck(notaId, lineIdx) {
  const idx = notas.findIndex((n) => n.id === notaId);
  let lineas = notas[idx].contenido.split("\n");
  let itemIdx = 0;
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].startsWith("- ")) {
      if (itemIdx === lineIdx) {
        if (lineas[i].startsWith("- [x] ")) {
          lineas[i] = "- " + lineas[i].substring(6);
        } else {
          lineas[i] = "- [x] " + lineas[i].substring(2);
        }
        break;
      }
      itemIdx++;
    }
  }
  notas[idx].contenido = lineas.join("\n");
  guardarNotas();
  renderizarNotas();
}

function toggleCategoriasMenu() {
  const lista = document.getElementById("listaCategorias");
  const chevron = document.getElementById("catChevron");
  lista.classList.toggle("collapsed");
  if (lista.classList.contains("collapsed")) {
    chevron.style.transform = "rotate(-90deg)";
  } else {
    chevron.style.transform = "rotate(0deg)";
  }
}
// ========================================
// MODAL: INFORMACIÓN GENERAL (ALUMNO)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  const btnInfoGeneral = document.getElementById("btnInfoGeneralAlumno");
  if (btnInfoGeneral) {
    btnInfoGeneral.addEventListener("click", function () {
      abrirModalInfoGeneral();
    });
  }

  // Búsqueda en el modal
  const searchInput = document.querySelector(
    "#infoGeneralModalOverlay .ig-modal-search",
  );
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const term = this.value.toLowerCase().trim();
      const items = document.querySelectorAll(
        "#infoGeneralModalOverlay .ig-modal-item",
      );
      items.forEach(function (item) {
        const title = item
          .querySelector(".ig-item-title")
          .textContent.toLowerCase();
        const desc = item
          .querySelector(".ig-item-desc")
          .textContent.toLowerCase();
        item.style.display =
          title.includes(term) || desc.includes(term) ? "" : "none";
      });
    });
  }
});

function abrirModalInfoGeneral() {
  const overlay = document.getElementById("infoGeneralModalOverlay");
  if (overlay) {
    overlay.classList.add("active");
    // Limpiar búsqueda al abrir
    const si = overlay.querySelector(".ig-modal-search");
    if (si) {
      si.value = "";
    }
    const items = overlay.querySelectorAll(".ig-modal-item");
    items.forEach(function (i) {
      i.style.display = "";
    });
  }
}

function cerrarModalInfoGeneral(event) {
  const overlay = document.getElementById("infoGeneralModalOverlay");
  if (!overlay) return;
  // Si se hizo clic en el overlay (fondo) o se llamó sin evento, cerrar
  if (!event || event.target === overlay) {
    overlay.classList.remove("active");
  }
}

// ========================================
// MODAL: BIBLIOTECA (ALUMNO)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  const btnBiblioteca = document.getElementById("btnBibliotecaAlumno");
  if (btnBiblioteca) {
    btnBiblioteca.addEventListener("click", function () {
      abrirModalBiblioteca();
    });
  }
});

function abrirModalBiblioteca() {
  const overlay = document.getElementById("bibliotecaModalOverlay");
  if (overlay) overlay.classList.add("active");
}

function cerrarModalBiblioteca(event) {
  const overlay = document.getElementById("bibliotecaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) {
    overlay.classList.remove("active");
  }
}

// ========================================
// MODAL: CAFETERÍA (ALUMNO)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  const btnCafeteria = document.getElementById("btnCafeteriaAlumno");
  if (btnCafeteria) {
    btnCafeteria.addEventListener("click", function () {
      abrirModalCafeteria();
    });
  }
});

function abrirModalCafeteria() {
  const overlay = document.getElementById("cafeteriaModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalCafeteria(event) {
  const overlay = document.getElementById("cafeteriaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalPlatosDelDia() {
  cerrarModalCafeteria();
  const overlay = document.getElementById("platosDelDiaModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalPlatosDelDia(event) {
  const overlay = document.getElementById("platosDelDiaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalComidasRapidas() {
  cerrarModalCafeteria();
  const overlay = document.getElementById("comidasRapidasModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalComidasRapidas(event) {
  const overlay = document.getElementById("comidasRapidasModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function cargarImagenMenu(event) {
  // REQ-05: Solo el admin puede subir imagen del menú
  var rol = obtenerRol();
  if (rol !== "admin") {
    event.target.value = "";
    alert("Solo el administrador puede cargar la imagen del menú.");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    mostrarMenuCargado(e.target.result);
    // Guardar en clave propia y en la clave compartida con admin
    try {
      localStorage.setItem("cafeteria_menu_img", e.target.result);
      localStorage.setItem("cafeteria_menu_shared", e.target.result);
    } catch (ex) {}
  };
  reader.readAsDataURL(file);
}

function mostrarMenuCargado(src) {
  const img = document.getElementById("platosMenuImg");
  const placeholder = document.getElementById("platosImgPlaceholder");
  const preview = document.getElementById("platosImgPreview");
  if (img) img.src = src;
  if (placeholder) placeholder.style.display = "none";
  if (preview) preview.style.display = "";
}

// Restaurar imagen guardada al cargar la página (prioriza la del admin)
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Primero la del admin (compartida), luego la local
    const saved =
      localStorage.getItem("cafeteria_menu_shared") ||
      localStorage.getItem("cafeteria_menu_img");
    if (saved) mostrarMenuCargado(saved);
  } catch (ex) {}
});

// ========================================
// MODAL: TUTORÍAS ACADÉMICAS
// ========================================

const ASESORIAS_DATA = {
  ige: {
    nombre: "Ingeniería en Gestión Empresarial",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "IGE-1",
        materia: "Administración",
      },
    ],
  },
  iem: {
    nombre: "Ingeniería Electromecánica",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Martes",
        horario: "10:00 a 11:00 a.m.",
        aula: "IEM-1",
        materia: "Electromecánica",
      },
    ],
  },
  isc: {
    nombre: "Ingeniería en Sistemas Computacionales",
    asesores: [
      {
        num: 1,
        profesor: "Alberto Romay Guillén",
        dia: "Jueves",
        horario: "14:00 a 15:00 p.m.",
        aula: "H2",
        materia: "Métodos Numéricos",
      },
      {
        num: "",
        profesor: "",
        dia: "Viernes",
        horario: "12:00 a 13:00 p.m.",
        aula: "SC3",
        materia: "Arquitectura de Computadoras",
      },
      {
        num: 2,
        profesor: "Andrés Díaz Elizalde",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "SC1",
        materia: "Sistemas Operativos",
      },
      {
        num: "",
        profesor: "",
        dia: "Jueves",
        horario: "15:00 a 12:00 p.m.",
        aula: "LR",
        materia: "Tópicos Avanzados de Programación",
      },
      {
        num: 3,
        profesor: "Arturo Iván Grajales Vázquez",
        dia: "Viernes",
        horario: "15:00 a 16:00 p.m.",
        aula: "SC1",
        materia: "Diseño Web",
      },
      {
        num: 4,
        profesor: "Edgar Perdomo-Capetillo Ortiz",
        dia: "Viernes",
        horario: "09:00 a 10:00 a.m.",
        aula: "SC2",
        materia: "Fundamentos de Programación",
      },
      {
        num: 5,
        profesor: "Felipe de Jesús Hernández Pérez",
        dia: "Jueves",
        horario: "14:00 a 15:00 p.m.",
        aula: "LR",
        materia: "Taller de Base de Datos",
      },
      {
        num: "",
        profesor: "",
        dia: "Viernes",
        horario: "14:00 a 15:00 p.m.",
        aula: "LR",
        materia: "Administración de Base de Datos",
      },
      {
        num: 6,
        profesor: "Isaías Torres Martínez",
        dia: "Jueves",
        horario: "10:00 a 11:00 a.m.",
        aula: "H3",
        materia: "Investigación de Operaciones",
      },
      {
        num: "",
        profesor: "",
        dia: "Viernes",
        horario: "10:00 a 11:00 a.m.",
        aula: "H3",
        materia: "Investigación de Operaciones",
      },
      {
        num: 7,
        profesor: "Jorge Alberto Secchi Ruiz",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "LR",
        materia: "Taller de Sistemas de Operativos",
      },
      {
        num: "",
        profesor: "",
        dia: "Martes",
        horario: "10:00 a 11:00 a.m.",
        aula: "LR",
        materia: "Estructura de Datos",
      },
      {
        num: 8,
        profesor: "Jorge Miguel Guerrero Ambrosio",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "LR",
        materia: "Programación Orientada a Objetos",
      },
      {
        num: 9,
        profesor: "Kevin David Molina Gómez",
        dia: "Viernes",
        horario: "09:00 a 10:00 a.m.",
        aula: "LR",
        materia: "Programación Orientada a Objetos",
      },
      {
        num: 10,
        profesor: "Ma. Concepción Villatoro Cruz",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "SC2",
        materia: "Métodos Numéricos",
      },
      {
        num: "",
        profesor: "",
        dia: "Viernes",
        horario: "15:00 a 16:00 p.m.",
        aula: "LR",
        materia: "Fundamentos de Investigación",
      },
      {
        num: 11,
        profesor: "Pablo Francisco Vivas Torres",
        dia: "Martes",
        horario: "14:00 a 15:00 p.m.",
        aula: "SC2",
        materia: "Taller de Base de Datos",
      },
      {
        num: 12,
        profesor: "Octavio García Gracia",
        dia: "Martes",
        horario: "10:00 a 11:00 a.m.",
        aula: "H3",
        materia: "Fundamentos de Programación",
      },
      {
        num: 13,
        profesor: "Sonia Martínez Guzmán",
        dia: "Viernes",
        horario: "13:00 a 14:00 p.m.",
        aula: "H2",
        materia: "Matemáticas Discretas",
      },
      {
        num: 14,
        profesor: "Víctor Ignacio Velasco Huerta",
        dia: "Viernes",
        horario: "8:00 a 9:00 a.m.",
        aula: "LR",
        materia: "Fundamentos de Programación",
      },
      {
        num: 15,
        profesor: "Wendy Carranza Díaz",
        dia: "Jueves",
        horario: "11:00 a 12:00 p.m.",
        aula: "SC1",
        materia: "Fundamentos de Programación",
      },
    ],
  },
  iel: {
    nombre: "Ingeniería Electrónica",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "E-1",
        materia: "Electrónica",
      },
    ],
  },
  iam: {
    nombre: "Ingeniería Ambiental",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "A-1",
        materia: "Ambiental",
      },
    ],
  },
  ii: {
    nombre: "Ingeniería Industrial",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "II-1",
        materia: "Industrial",
      },
    ],
  },
  iq: {
    nombre: "Ingeniería Química",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "Q-1",
        materia: "Química",
      },
    ],
  },
  la: {
    nombre: "Licenciatura en Administración",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "LA-1",
        materia: "Administración",
      },
    ],
  },
  iia: {
    nombre: "Ingeniería en Inteligencia Artificial",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "IA-1",
        materia: "Inteligencia Artificial",
      },
    ],
  },
  ida: {
    nombre: "Ingeniería en Desarrollo de Aplicaciones",
    asesores: [
      {
        num: 1,
        profesor: "Por confirmar",
        dia: "Lunes",
        horario: "10:00 a 11:00 a.m.",
        aula: "DA-1",
        materia: "Desarrollo de Aplicaciones",
      },
    ],
  },
};

function abrirModalTutorias() {
  const overlay = document.getElementById("tutoriasModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalTutorias(event) {
  const overlay = document.getElementById("tutoriasModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirAsesoriaCarrera(carreraId) {
  const data = ASESORIAS_DATA[carreraId];
  if (!data) return;
  cerrarModalTutorias();

  document.getElementById("asesoriaCarreraBreadcrumb").textContent =
    "Inicio › Tutorías Académicas › " + data.nombre;
  document.getElementById("asesoriaCarreraTitulo").textContent = data.nombre;

  const tbody = document.getElementById("asesoriaTablaBody");
  tbody.innerHTML = "";
  data.asesores.forEach(function (a, idx) {
    const tr = document.createElement("tr");
    tr.style.background = idx % 2 === 0 ? "#fff" : "#f5f8ff";
    tr.innerHTML =
      '<td style="padding:6px 5px;text-align:center;color:#555;">' +
      (a.num !== "" ? a.num : "") +
      "</td>" +
      '<td style="padding:6px 5px;color:#222;">' +
      a.profesor +
      "</td>" +
      '<td style="padding:6px 5px;text-align:center;color:#555;">' +
      a.dia +
      "</td>" +
      '<td style="padding:6px 5px;text-align:center;color:#555;">' +
      a.horario +
      "</td>" +
      '<td style="padding:6px 5px;text-align:center;font-weight:700;color:#1a3a6b;">' +
      a.aula +
      "</td>" +
      '<td style="padding:6px 5px;color:#333;">' +
      a.materia +
      "</td>";
    tbody.appendChild(tr);
  });

  const overlay = document.getElementById("asesoriaCarreraModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarAsesoriaCarrera(event) {
  const overlay = document.getElementById("asesoriaCarreraModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

// ========================================
// MODAL: BECAS
// ========================================

function abrirModalBecas() {
  const overlay = document.getElementById("becasModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalBecas(event) {
  const overlay = document.getElementById("becasModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

// ========================================
// MODAL: CURSOS
// ========================================

let cursoCarreraActual = "";

function abrirModalCursos() {
  const overlay = document.getElementById("cursosModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalCursos(event) {
  const overlay = document.getElementById("cursosModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirCursoCarrera(carreraId) {
  const nombres = {
    ige: "Ingeniería en Gestión Empresarial",
    iem: "Ingeniería Electromecánica",
    isc: "Ingeniería en Sistemas Computacionales",
    iel: "Ingeniería Electrónica",
    iam: "Ingeniería Ambiental",
    ii: "Ingeniería Industrial",
    iq: "Ingeniería Química",
    la: "Licenciatura en Administración",
    iia: "Ingeniería en Inteligencia Artificial",
    ida: "Ingeniería en Desarrollo de Aplicaciones",
  };
  cursoCarreraActual = carreraId;
  cerrarModalCursos();

  const nombre = nombres[carreraId] || carreraId;
  document.getElementById("cursoDetalleBreadcrumb").textContent =
    "Inicio › Cursos › " + nombre;
  document.getElementById("cursoDetalleTitulo").textContent = nombre;

  // Restaurar imagen guardada para esta carrera
  const placeholder = document.getElementById("cursoDetalleImgPlaceholder");
  const preview = document.getElementById("cursoDetalleImgPreview");
  const imgEl = document.getElementById("cursoDetalleImg");
  try {
    const saved = localStorage.getItem("cursos_img_" + carreraId);
    if (saved) {
      if (imgEl) imgEl.src = saved;
      if (placeholder) placeholder.style.display = "none";
      if (preview) preview.style.display = "";
    } else {
      if (placeholder) placeholder.style.display = "";
      if (preview) preview.style.display = "none";
    }
  } catch (ex) {}

  const overlay = document.getElementById("cursoDetalleModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarCursoDetalle(event) {
  const overlay = document.getElementById("cursoDetalleModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function cargarImagenCurso(event) {
  // REQ-05: Solo el admin puede subir imágenes
  if (obtenerRol() !== "admin") {
    event.target.value = "";
    alert("Solo el administrador puede cargar imágenes.");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgEl = document.getElementById("cursoDetalleImg");
    const placeholder = document.getElementById("cursoDetalleImgPlaceholder");
    const preview = document.getElementById("cursoDetalleImgPreview");
    if (imgEl) imgEl.src = e.target.result;
    if (placeholder) placeholder.style.display = "none";
    if (preview) preview.style.display = "";
    try {
      localStorage.setItem("cursos_img_" + cursoCarreraActual, e.target.result);
    } catch (ex) {}
  };
  reader.readAsDataURL(file);
}

// ========================================
// CAFETERÍA: RATING + OPINIÓN (ALUMNO)
// ========================================

(function () {
  var cafRating = 0;

  // ── Inicializar rating al cargar ──
  document.addEventListener("DOMContentLoaded", function () {
    var saved = parseFloat(localStorage.getItem("cafeteria_rating") || "0");
    if (saved > 0) {
      cafRating = saved;
      renderRating("cafRatingWrap", cafRating, "cafRatingScore");
    }

    var wrap = document.getElementById("cafRatingWrap");
    if (wrap) {
      var icons = wrap.querySelectorAll(".caf-cutlery");
      icons.forEach(function (icon) {
        // hover
        icon.addEventListener("mouseenter", function () {
          var v = parseFloat(this.getAttribute("data-val"));
          renderRatingHover("cafRatingWrap", v);
        });
        icon.addEventListener("mouseleave", function () {
          renderRating("cafRatingWrap", cafRating, "cafRatingScore");
        });
        // click
        icon.addEventListener("click", function () {
          cafRating = parseFloat(this.getAttribute("data-val"));
          renderRating("cafRatingWrap", cafRating, "cafRatingScore");
          try {
            localStorage.setItem("cafeteria_rating", cafRating);
          } catch (ex) {}
        });
      });
    }

    // Restaurar opiniones guardadas
    renderOpinionesCaf();
  });

  function renderRatingHover(wrapId, val) {
    var icons = document.querySelectorAll("#" + wrapId + " .caf-cutlery");
    var perIcon = 0.5; // cada icono cubre 0.5 puntos
    icons.forEach(function (icon, idx) {
      var iconVal = parseFloat(icon.getAttribute("data-val"));
      icon.classList.remove("lit", "half");
      if (iconVal <= val) icon.classList.add("lit");
    });
  }

  function renderRating(wrapId, val, scoreId) {
    var icons = document.querySelectorAll("#" + wrapId + " .caf-cutlery");
    icons.forEach(function (icon) {
      var iconVal = parseFloat(icon.getAttribute("data-val"));
      icon.classList.remove("lit", "half");
      if (val >= iconVal) icon.classList.add("lit");
      // no half for integer scale
    });
    var scoreEl = document.getElementById(scoreId);
    if (scoreEl)
      scoreEl.textContent = val > 0 ? val + " / 10" : "Sin calificar";
  }

  function renderOpinionesCaf() {
    var lista;
    try {
      lista = JSON.parse(localStorage.getItem("cafeteria_opiniones") || "[]");
    } catch (ex) {
      lista = [];
    }
    var wrap = document.getElementById("cafOpinionesLista");
    var items = document.getElementById("cafOpinionesItems");
    if (!wrap || !items) return;
    if (lista.length === 0) {
      wrap.style.display = "none";
      return;
    }
    wrap.style.display = "";
    items.innerHTML = "";
    lista
      .slice()
      .reverse()
      .forEach(function (op) {
        var div = document.createElement("div");
        div.style.cssText =
          "background:#fff8f0;border:1px solid #ffe0b2;border-radius:10px;padding:8px 12px;font-size:12px;color:#444;";
        div.innerHTML =
          '<span style="color:#e65100;font-weight:700;">' +
          op.fecha +
          "</span><br>" +
          op.texto;
        items.appendChild(div);
      });
  }

  window.abrirModalOpinionCaf = function () {
    var o = document.getElementById("opinionCafModalOverlay");
    if (o) o.classList.add("active");
    renderOpinionesCaf();
  };
  window.cerrarModalOpinionCaf = function (event) {
    var o = document.getElementById("opinionCafModalOverlay");
    if (!o) return;
    if (!event || event.target === o) o.classList.remove("active");
  };
  window.enviarOpinionCaf = function () {
    var ta = document.getElementById("cafOpinionTexto");
    if (!ta) return;
    var texto = ta.value.trim();
    if (!texto) {
      ta.focus();
      return;
    }
    var lista;
    try {
      lista = JSON.parse(localStorage.getItem("cafeteria_opiniones") || "[]");
    } catch (ex) {
      lista = [];
    }
    var ahora = new Date();
    lista.push({
      texto: texto,
      fecha:
        ahora.toLocaleDateString("es-MX") +
        " " +
        ahora.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    });
    try {
      localStorage.setItem("cafeteria_opiniones", JSON.stringify(lista));
    } catch (ex) {}
    ta.value = "";
    renderOpinionesCaf();
  };
})();

// ========================================
// MODAL: TRÁMITES ESCOLARES (ALUMNO)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  const btnTramites = document.getElementById("btnTramitesAlumno");
  if (btnTramites) {
    btnTramites.addEventListener("click", function () {
      abrirModalTramites();
    });
  }

  // Búsqueda en el modal de Trámites
  const trSearch = document.querySelector("#tramitesModalOverlay .tr-search");
  if (trSearch) {
    trSearch.addEventListener("input", function () {
      const term = this.value.toLowerCase().trim();
      document
        .querySelectorAll("#trDeptGrid .tr-filtrable")
        .forEach(function (card) {
          const name = card
            .querySelector(".tr-dept-name")
            .textContent.toLowerCase();
          card.style.display = term === "" || name.includes(term) ? "" : "none";
        });
    });
  }
});

function abrirModalTramites() {
  const overlay = document.getElementById("tramitesModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalTramites(event) {
  const overlay = document.getElementById("tramitesModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalGestionTec() {
  cerrarModalTramites();
  const overlay = document.getElementById("gestionTecModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalGestionTec(event) {
  const overlay = document.getElementById("gestionTecModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalDivisionEstudios() {
  cerrarModalTramites();
  const overlay = document.getElementById("divisionEstudiosModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalDivisionEstudios(event) {
  const overlay = document.getElementById("divisionEstudiosModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalSubdireccionAcademica() {
  cerrarModalTramites();
  const overlay = document.getElementById("subdireccionAcademicaModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalSubdireccionAcademica(event) {
  const overlay = document.getElementById("subdireccionAcademicaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalCentroComputo() {
  cerrarModalTramites();
  const overlay = document.getElementById("centroComputoModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalCentroComputo(event) {
  const overlay = document.getElementById("centroComputoModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function abrirModalRecursosHumanos() {
  cerrarModalTramites();
  const overlay = document.getElementById("recursosHumanosModalOverlay");
  if (overlay) overlay.classList.add("active");
  seleccionarTabRH("seguroVida", document.querySelector(".rh-tab-btn"));
}
function cerrarModalRecursosHumanos(event) {
  const overlay = document.getElementById("recursosHumanosModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}
function seleccionarTabRH(tabId, btn) {
  document
    .querySelectorAll("#recursosHumanosModalOverlay .rh-panel-content")
    .forEach(function (p) {
      p.style.display = "none";
    });
  document
    .querySelectorAll("#recursosHumanosModalOverlay .rh-tab-btn")
    .forEach(function (b) {
      b.classList.remove("rh-tab-active");
    });
  const panel = document.getElementById("rhPanel-" + tabId);
  if (panel) panel.style.display = "";
  if (btn) btn.classList.add("rh-tab-active");
}

function abrirModalServiciosEscolares() {
  cerrarModalTramites();
  const overlay = document.getElementById("serviciosEscolaresModalOverlay");
  if (overlay) overlay.classList.add("active");
  seleccionarTabSE(
    "directorio",
    document.querySelector("#serviciosEscolaresModalOverlay .rh-tab-btn"),
  );
}
function cerrarModalServiciosEscolares(event) {
  const overlay = document.getElementById("serviciosEscolaresModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}
function seleccionarTabSE(tabId, btn) {
  document
    .querySelectorAll("#serviciosEscolaresModalOverlay .rh-panel-content")
    .forEach(function (p) {
      p.style.display = "none";
    });
  document
    .querySelectorAll("#serviciosEscolaresModalOverlay .rh-tab-btn")
    .forEach(function (b) {
      b.classList.remove("rh-tab-active");
    });
  const panel = document.getElementById("sePanel-" + tabId);
  if (panel) panel.style.display = "";
  if (btn) btn.classList.add("rh-tab-active");
}

function abrirModalDirectorioSE() {
  cerrarModalServiciosEscolares();
  const overlay = document.getElementById("directorioSEModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalDirectorioSE(event) {
  const overlay = document.getElementById("directorioSEModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function cargarImagenOrganigrama(event) {
  // REQ-05: Solo el admin puede subir imágenes
  if (obtenerRol() !== "admin") {
    event.target.value = "";
    alert("Solo el administrador puede cargar imágenes.");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.getElementById("organigramaImg");
    const placeholder = document.getElementById("organigramaImgPlaceholder");
    const preview = document.getElementById("organigramaImgPreview");
    if (img) img.src = e.target.result;
    if (placeholder) placeholder.style.display = "none";
    if (preview) preview.style.display = "";
    try {
      localStorage.setItem("centrocomputo_organigrama_img", e.target.result);
    } catch (ex) {}
  };
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    const saved = localStorage.getItem("centrocomputo_organigrama_img");
    if (saved) {
      const img = document.getElementById("organigramaImg");
      const placeholder = document.getElementById("organigramaImgPlaceholder");
      const preview = document.getElementById("organigramaImgPreview");
      if (img) img.src = saved;
      if (placeholder) placeholder.style.display = "none";
      if (preview) preview.style.display = "";
    }
  } catch (ex) {}
});

function toggleTrSection(sectionId, btn) {
  const content = document.getElementById(sectionId);
  if (!content) return;
  const isCollapsed = content.classList.contains("tr-section-collapsed");
  const arrow = btn.querySelector(".tr-section-arrow");
  if (isCollapsed) {
    content.classList.remove("tr-section-collapsed");
    if (arrow) arrow.style.transform = "rotate(0deg)";
  } else {
    content.classList.add("tr-section-collapsed");
    if (arrow) arrow.style.transform = "rotate(-90deg)";
  }
}

function manejarArchivoTr(event, docId) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById("status-" + docId);
  const dlBtn = document.getElementById("dl-" + docId);
  if (status) {
    status.textContent =
      "✓ " +
      (file.name.length > 12 ? file.name.substring(0, 12) + "…" : file.name);
    status.title = file.name;
  }
  if (dlBtn) {
    const url = URL.createObjectURL(file);
    dlBtn.href = url;
    dlBtn.download = file.name;
    dlBtn.classList.remove("tr-download-hidden");
  }
}

// ========================================
// MODAL: OFERTA EDUCATIVA (ALUMNO)
// ========================================

// Datos de las carreras
const CARRERAS_DATA = {
  ige: {
    nombre: "Ingeniería en Gestión Empresarial",
    clave: "IGEM – 2009 – 201",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "--",
    correoJefe: "--",
    coord: "Luisa Vera Ramos",
    correo: "dep_ige@minatitlan.tecnm.mx",
    icono: "fas fa-chart-line",
    desc: [
      "Formación de líderes en generación estrategias de negocios y optimización de recursos empresariales.",
    ],
    perfilIngreso: {
      titulo:
        "Perfil de Ingreso a la carrera de Ingeniería en Gestión Empresarial",
      intro:
        "El aspirante por cursar la Ingeniería en Gestión Empresarial en Tecnológico Nacional de México Campus Minatitlán posea los conocimientos, habilidades, actitudes, valores y competencias necesarios para generar una base sólida que fomente su desarrollo a lo largo de su vida académica que ayude a formar profesionales de calidad, capaces de desarrollarse exitosamente en el ámbito laboral y personal.",
      requisitos: [
        "Haber concluido el nivel de Educación Media.",
        "Disponer del tiempo para cumplir con las actividades del plan de estudios.",
        "Presentar el examen de admisión establecido por el Instituto.",
      ],
      competencias: [
        "Habilidades matemáticas (álgebra, trigonometría y estadística).",
        "Habilidades básicas del manejo de la computación.",
        "Habilidades de gestión de información.",
        "Capacidad de abstracción, análisis y síntesis.",
        "Comprensión lectora.",
        "Comunicación escrita.",
        "Capacidad de relacionarse con otras personas.",
        "Habilidad para trabajar en forma autónoma.",
      ],
    },
    objetivos: {
      clave: "IGEM-2009-201",
      general:
        "Formar profesionales que contribuyan a la gestión de empresas e innovación de procesos; así como al diseño, implementación y desarrollo de sistemas estratégicos de negocios, optimizando recursos en un entorno global, con ética y responsabilidad social.",
      especificos: [
        "Es un egresado con un carácter incluyente, dinámico, proactivo, comprometido con el cuidado del medio ambiente y la responsabilidad social con una visión global en el ámbito empresarial que coadyuve al desarrollo de la economía.",
        "Es un egresado con las habilidades para análisis situacional, toma de decisiones estratégicas y solución de problemas que conlleven a una gestión efectiva de los recursos de la empresa.",
        "El egresado desarrolla la creatividad que le lleva a generar ideas innovadoras para la creación de negocios.",
        "El egresado genera emprendimientos innovadores en las empresas que promuevan entornos de trabajo decentes, igualitarios, seguros y sin riesgos para todos los trabajadores.",
      ],
    },
    mision: {
      mision:
        "Formar integralmente profesionales en ingeniería en gestión empresarial basados en el modelo educativo para el siglo XXI, que contribuyan a la gestión estratégica e innovación de negocios considerando los aspectos éticos y sostenibles en un entorno competitivo y global.",
      vision:
        "Ser un programa académico con reconocimiento nacional e internacional en el desempeño e investigación aplicada de la gestión empresarial.",
      politicas: [
        "Promover el desarrollo integral y armónico del estudiante en gestión empresarial para que responda a los retos y necesidades de los negocios.",
        "Implementar y orientar los procesos estratégicos y actividades del programa educativo hacia el reconocimiento nacional e internacional.",
        "Mantener una relación estrecha y permanente con la comunidad en actividades científicas, tecnológicas, culturales y humanísticas.",
        "Fomentar la investigación, la ciencia y la tecnología en el campo de la gestión empresarial.",
        "Vigilar en el proceso educativo el cumplimiento de las leyes, reglamentos y procedimientos que rigen la operación del programa.",
        "Orientar las actividades del programa educativo hacia la equidad de género y no discriminación, la responsabilidad social, respeto al medio ambiente e impacto económico.",
      ],
    },
    salidaLateral: true,
    perfilEgreso: [
      "Aplica habilidades directivas y de ingeniería en el diseño, gestión, fortalecimiento e innovación de las organizaciones para la toma de decisiones en forma efectiva, con una orientación sistémica y sustentable.",
      "Diseña e innova estructuras administrativas y procesos, con base en las necesidades de las organizaciones para competir eficientemente en mercados globales.",
      "Gestiona eficientemente los recursos de la organización con visión compartida, con el fin de suministrar bienes y servicios de calidad.",
      "Aplica métodos cuantitativos y cualitativos en el análisis e interpretación de datos y modelado de sistemas en los procesos organizacionales, para la mejora continua atendiendo estándares de calidad mundial.",
      "Diseña, y emprende nuevos negocios y proyectos empresariales sustentables en mercados competitivos, para promover el desarrollo.",
      "Diseña e implementa estrategias de mercadotecnia basadas en información recopilada de fuentes primarias y secundarias, para incrementar la competitividad de las organizaciones.",
      "Implementa planes y programas de seguridad e higiene para el fortalecimiento del entorno laboral.",
      "Gestiona sistemas integrales de calidad para la mejora de los procesos, ejerciendo un liderazgo estratégico y un compromiso ético.",
      "Aplica las normas legales para la creación y desarrollo de las organizaciones.",
      "Dirige equipos de trabajo para la mejora continua y el crecimiento integral de las organizaciones.",
      "Interpreta la información financiera para detectar oportunidades de mejora e inversión en un mundo global, que propicien la rentabilidad del negocio.",
      "Utiliza las nuevas tecnologías de información y comunicación en la organización, para optimizar los procesos y la eficaz toma de decisiones.",
      "Promueve el desarrollo del capital humano, para la realización de los objetivos organizacionales, dentro de un marco ético y un contexto multicultural.",
      "Aplica métodos de investigación para desarrollar e innovar modelos, sistemas, procesos y productos en las diferentes dimensiones de la organización.",
      "Gestiona la cadena de suministro de las organizaciones con un enfoque orientado a procesos para incrementar la productividad.",
      "Analiza las variables económicas para facilitar la toma estratégica de decisiones en la organización.",
      "Actúa como agente de cambio para facilitar la mejora continua y el desempeño de las organizaciones.",
      "Aplica métodos, técnicas y herramientas para la solución de problemas en la gestión empresarial con una visión estratégica.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
  },
  iem: {
    nombre: "Ingeniería Electromecánica",
    clave: "IEME – 2010 – 210",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Genáro Fernández Olivares",
    correoJefe: "metalmecanica@minatitlan.tecnm.mx",
    coord: "Isaac Mario García Guillen",
    correo: "dep_iem@minatitlan.tecnm.mx",
    icono: "fas fa-cogs",
    desc: [
      "Formar profesionistas de excelencia en Ingeniería Electromecánica, con actitud emprendedora, liderazgo y capacidad de analizar, diagnosticar, diseñar, seleccionar, instalar, administrar, mantener e innovar sistemas electromecánicos.",
    ],
    perfilIngreso: {
      titulo: "Perfil de Ingreso a la carrera de Ingeniería Electromecánica",
      intro:
        "Los aspirantes deberán ser egresados del sistema de Educación Media Superior y tendrán que contar preferentemente con un conjunto de conocimientos, habilidades, actitudes y valores definidos, que deberán reunir para el adecuado desarrollo del programa de Licenciatura en Ingeniería Electromecánica.",
      requisitos: [
        "Interés por descubrir nuevos conocimientos y resolver problemas.",
        "Aptitud de razonamiento lógico en la resolución de problemas de observación crítica y de análisis creativo.",
        "Personalidad innovadora, emprendedora y propositiva.",
        "Conocimientos teóricos y prácticos de las ciencias físico-matemáticas.",
        "Habilidades en aplicar el razonamiento lógico: de análisis, síntesis y aplicación del conocimiento.",
        "Disposición para el auto aprendizaje que propicie su desarrollo intelectual, afectivo y social.",
        "Actitud de responsabilidad, respeto a las personas, al medio ambiente y a las ideas, puntualidad, valores de tolerancia y puntualidad.",
      ],
      competencias: ["---"],
    },
    objetivos: {
      clave: "IEME-2010-210",
      general:
        "Formar profesionistas de excelencia en Ingeniería Electromecánica, con actitud emprendedora, liderazgo y capacidad de: analizar, diagnosticar, diseñar, seleccionar, instalar, administrar, mantener e innovar sistemas electromecánicos, en forma eficiente, segura y económica, considerando las normas y estándares nacionales e internacionales de forma sustentable con plena conciencia ética, humanística y social.",
      especificos: [
        "Aplica conocimientos especializados afines al campo de la investigación y de la ingeniería en el sector productivo y de servicios.",
        "Aplica y supervisa Proyectos orientados a la utilización de fuentes renovables y uso eficiente de la energía en los sectores productivos, de servicios y en su entorno social.",
        "Desempeña actividades en la docencia y en la administración dentro de los niveles educativos superior y medio-superior contribuyendo a la preparación profesional de los estudiantes.",
        "Ejecuta y supervisa trabajos de operación, mantenimiento y rediseño en el área de electromecánica en el sector productivo y de servicios con un enfoque sustentable y capacita al recurso humano especializado.",
        "Utiliza equipos especializados para la mejora de los sistemas electromecánicos en el sector productivo y de servicios.",
        "Desarrolla y participa en Proyectos de Mantenimiento y actualización en sistemas electromecánicos del sector productivo y de servicios.",
      ],
    },
    mision: {
      mision:
        "Ofrecer un servicio educativo de excelencia en el área de ingeniería electromecánica con calidad, eficiencia y pertinencia, para formar profesionales de excelencia que satisfagan las necesidades del entorno social e industrial de la región.",
      vision:
        "Ser uno de los mejores Departamentos de Metal Mecánica del Sistema Tecnológico a nivel nacional en cuanto a los indicadores de calidad académica, administrativa y servicios que de respuesta a las necesidades del entorno social.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Formula, gestiona y evalúa proyectos de ingeniería relacionados con sistemas y dispositivos en el área electromecánica, proponiendo soluciones con tecnologías de vanguardia, en el marco del desarrollo sustentable.",
      "Diseña e implementa sistemas y dispositivos electromecánicos, utilizando estrategias para el uso eficiente de la energía en los sectores productivo y de servicios apegado a normas y acuerdos nacionales e internacionales vigentes.",
      "Diseña e implementa estrategias y programas para el control y/o automatización de los procesos productivos y los dispositivos en los sistemas electromecánicos.",
      "Proyectar, gestionar, implementar y controlar actividades de instalación y operación de los sistemas electromecánicos para hacer eficientes los procesos productivos.",
      "Formula administra y supervisa programas de mantenimiento para la continuidad y optimización de procesos productivos.",
      "Genera y participa en proyectos de investigación para el desarrollo científico y tecnológico contribuyendo al bienestar social.",
      "Ejerce actitudes de liderazgo y de trabajo en equipo, para la toma de decisiones a partir de un sentido ético y profesional.",
      "Asume una actitud emprendedora en la creación e incubación de empresas, para el desarrollo económico.",
      "Aplica herramientas computacionales de acuerdo a las tecnologías de vanguardia, para el diseño, simulación y operación de sistemas electromecánicos acordes a la demanda del sector industrial.",
      "Utiliza el lenguaje oral y escrito con claridad y fluidez para interactuar en distintos contextos sociales.",
      "Comprende un segundo idioma para comunicar ideas e interpretar documentos de distinta índole.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
    atributosEgreso: [
      "Desarrolla proyectos de ingeniería relacionados con la selección, el diseño, la evaluación y el mantenimiento de equipos termo técnicos y de termo fluidos, utilizando estrategias para el uso eficiente de la energía y las herramientas computacionales y de información científica existentes en esta área.",
      "Formula proyectos de ingeniería relacionados con la selección, el diseño y mantenimiento en instalaciones, control y automatización de sistemas electromecánicos, en los sectores productivos y de servicios, promoviendo una cultura de ahorro y uso eficiente de la energía y el cuidado del medio ambiente.",
      "Gestiona proyectos de ingeniería relacionados con el diseño, la selección, evaluación y mantenimiento de elementos mecánicos y equipos electromecánicos con apego en las normas vigentes, utilizando las tecnologías de información, comunicación eficaz y con responsabilidad ética y profesional.",
      "Formula proyectos de ingeniería relacionados con el mantenimiento a sistemas: estáticos, dinámicos y eléctricos de manera sustentable, atendiendo a las necesidades del sector productivo y social, acorde a la normatividad aplicable nacional e internacional vigente.",
      "Desarrolla actitudes de liderazgo y trabajo en equipo a partir de un sentido ético y profesional, con un amplio carácter emprendedor y creativo, utilizando el lenguaje oral y escrito de manera adecuada.",
    ],
  },
  isc: {
    nombre: "Ingeniería en Sistemas Computacionales",
    clave: "ISIC – 2010 – 224",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Mauricio García Avalos",
    correoJefe: "sistemas@minatitlan.tecnm.mx",
    coord: "Víctor Ignacio Velasco Huerta",
    correo: "dep_isc@minatitlan.tecnm.mx",
    icono: "fas fa-laptop-code",
    desc: [
      "Formar profesionistas líderes con visión estratégica y amplio sentido ético; capaz de diseñar, desarrollar, implementar y administrar tecnología computacional para aportar soluciones innovadoras en beneficio de la sociedad.",
    ],
    perfilIngreso: {
      titulo:
        "Perfil de Ingreso a la carrera de Ingeniería en Sistemas Computacionales",
      intro:
        "El aspirante debe contar con capacidades analíticas y lógicas para el desarrollo de software y sistemas computacionales.",
      requisitos: [
        "Haber concluido el nivel de Educación Media.",
        "Disponer del tiempo para cumplir con las actividades del plan de estudios.",
        "Presentar el examen de admisión establecido por el Instituto.",
      ],
      competencias: [
        "Habilidades matemáticas y lógicas.",
        "Interés por la tecnología y la programación.",
        "Capacidad de abstracción y análisis.",
        "Habilidad para trabajar en forma autónoma y en equipo.",
        "Comprensión lectora en español e inglés básico.",
      ],
    },
    objetivos: {
      clave: "ISIC-2010-224",
      general:
        "Formar profesionistas líderes con visión estratégica y amplio sentido ético; capaz de diseñar, desarrollar, implementar y administrar tecnología computacional para aportar soluciones innovadoras en beneficio de la sociedad; en un contexto global, multidisciplinario y sostenible.",
      especificos: [
        "El egresado desarrolla e implementa aplicaciones computacionales integrando tecnologías actuales y emergentes para el sector productivo y de servicios, con estándares y normas nacionales e internacionales.",
        "El egresado soluciona problemas de contexto con base en competencias profesionales en el campo de los modelos computacionales y herramientas tecnológicas de vanguardia, con sentido ético y en un marco de sustentabilidad.",
        "El egresado analiza, diseña e implementa interfaces de procesamiento de datos para optimizar procesos y recursos en los diferentes sectores productivos.",
        "El egresado diseña, optimiza e implementa escenarios de conectividad de datos que requiere el sector productivo, social y de servicios.",
        "El egresado crea y administra proyectos, ejerciendo liderazgo efectivo en los diferentes sectores productivos, sociales y de servicios en los ámbitos nacionales e internacionales.",
      ],
    },
    mision: {
      mision:
        "Formar de manera integral ingenieros con competencias profesionales en sistemas de computación, competitivos en las tecnologías de la información y comunicación en tendencia y emergentes, bajo un contexto global, multidisciplinario y sostenible.",
      vision:
        "Ser un programa de estudios acreditado con egresados que brinden soluciones de alta calidad en ámbitos de desarrollo e innovación en tecnologías de información y comunicación, contribuyendo al fortalecimiento de nuestra área de influencia nacional e internacional.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Implementa aplicaciones computacionales para solucionar problemas de diversos contextos, integrando diferentes tecnologías, plataformas o dispositivos.",
      "Diseña, desarrolla y aplica modelos computacionales para solucionar problemas, mediante la selección y uso de herramientas matemáticas.",
      "Diseña e implementa interfaces para la automatización de sistemas de hardware y desarrollo del software asociado.",
      "Coordina y participa en equipos multidisciplinarios para la aplicación de soluciones innovadoras en diferentes contextos.",
      "Diseña, implementa y administra bases de datos optimizando los recursos disponibles, conforme a las normas vigentes de manejo y seguridad de la información.",
      "Desarrolla y administra software para apoyar la productividad y competitividad de las organizaciones cumpliendo con estándares de calidad.",
      "Evalúa tecnologías de hardware para soportar aplicaciones de manera efectiva.",
      "Detecta áreas de oportunidad empleando una visión empresarial para crear proyectos aplicando las Tecnologías de la Información y Comunicación.",
      "Diseña, configura y administra redes de computadoras para crear soluciones de conectividad en la organización, aplicando las normas y estándares vigentes.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
    especialidad: {
      nombre: "CIENCIA DE DATOS",
      descripcion:
        "Ciencia transdisciplinaria que involucra métodos científicos, procesos y sistemas para obtener un mejor entendimiento de grandes cantidades de datos, con el fin de identificar patrones en fenómenos reales para que de esta manera se tomen decisiones asertivas.",
      materias: [
        "Ciencia de Datos",
        "Big Data y NoSQL",
        "Aprendizaje Automático",
        "Metodologías Ágiles",
        "Ciberseguridad",
      ],
    },
  },
  iel: {
    nombre: "Ingeniería Electrónica",
    clave: "IELC – 2010 – 211",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Jafet Montenegro Hipólito",
    correoJefe: "electronica@minatitlan.tecnm.mx",
    coord: "Eliseo Hernández del Rivero",
    correo: "dep_ie@minatitlan.tecnm.mx",
    icono: "fas fa-microchip",
    desc: [
      "Formar profesionistas competentes para diseñar, modelar, implementar, operar, integrar, mantener, instalar y administrar sistemas electrónicos, con capacidad de innovar y transferir tecnología electrónica en proyectos multidisciplinarios.",
    ],
    perfilIngreso: {
      titulo: "Perfil de Ingreso a la carrera de Ingeniería Electrónica",
      intro: "----",
      requisitos: ["----"],
      competencias: ["----"],
    },
    objetivos: {
      clave: "IELC-2010-211",
      general:
        "Formar profesionistas competentes para diseñar, modelar, implementar, operar, integrar, mantener, instalar y administrar sistemas electrónicos; así como innovar y transferir tecnología electrónica existente y emergente en proyectos interdisciplinarios y multidisciplinarios, a nivel nacional e internacional, con capacidad de resolver problemas y atender las necesidades de su entorno con ética, actitud analítica, emprendedora y creativa, comprometidos con el desarrollo sustentable.",
      especificos: [
        "El egresado desarrolla investigación aplicada, realiza un posgrado e innova con el uso de las nuevas tecnologías para la solución de problemas propios de su perfil profesional en el sector productivo y educativo.",
        "El egresado, desempeña cargos gerenciales y mando medios en los diferentes sectores productivos y de servicios en los ámbitos nacionales e internacionales.",
        "El egresado diseña, desarrolla, implementa e integra sistemas electrónicos de medición y control de procesos, que satisfagan las necesidades de los diferentes sectores industriales y de servicios, para contribuir en el desarrollo y progreso regional, nacional e internacional.",
        "El egresado administra y gestiona de manera multidisciplinaria en una organización las actividades de instalación, actualización, operación y mantenimiento de equipos y sistemas electrónicos para la optimización de los procesos industriales y de servicios, con ética, responsabilidad social, en un marco de desarrollo sustentable.",
      ],
    },
    mision: {
      mision: "----",
      vision: "----",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Ofrecer formación de excelencia en el área de Ingeniería Electrónica con especialidad en instrumentación y control de procesos donde se combine calidad, ética, eficiencia y pertinencia que satisfagan las necesidades del entorno social e industrial ante los retos de la globalización procurando la preservación del medio ambiente.",
      "Analizar, modelar y resolver problemas complejos de Ingeniería Electrónica, aplicando los principios de las Ciencias Básicas e ingeniería que resulten en proyectos que cumplen necesidades específicas de los diferentes sectores.",
      "Analizar, seleccionar y operar equipos de calibración, pruebas para diagnóstico y parámetros en sistema de control automático que permitan aplicar la automatización en la optimización de procesos.",
      "Obtiene y simula modelos de experimentación para predecir el comportamiento de sistemas electrónicos empleando las Tecnologías de la Información y la Comunicación, así como programación de alto nivel.",
      "Se comunica en forma oral y escrita de manera efectiva en español y en un idioma extranjero utilizando la terminología del área.",
      "Participa en grupos de trabajo liderando o siendo parte de éstos, en el diseño o desarrollo de proyectos de sistemas electrónicos y de automatización para la solución de problemas de manera eficaz y eficiente aplicando normas técnicas y estándares nacionales e internacionales.",
      "Ser creativo, emprendedor y comprometido con su actualización profesional continua y autónoma, para estar a la vanguardia en los cambios científicos y tecnológicos que se dan en el ejercicio de su profesión.",
      "Dirige planifica y participa en equipos de trabajo interdisciplinario desarrollando proyectos integradores afines a su perfil en contexto nacional e internacional.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
    atributosEgreso: [
      "Analizar, modelar y resolver problemas complejos de Ingeniería Electrónica, aplicando los principios de las Ciencias Básicas e ingeniería que resulten en proyectos que cumplen necesidades específicas de los diferentes sectores.",
      "Analizar, seleccionar y operar equipos de calibración, pruebas para diagnóstico y parámetros en sistema de control automático que permitan aplicar la automatización en la optimización de procesos.",
      "Obtiene y simula modelos de experimentación para predecir el comportamiento de sistemas electrónicos empleando las Tecnologías de la Información y la Comunicación, así como programación de alto nivel.",
      "Se comunica en forma oral y escrita de manera efectiva en español y en un idioma extranjero utilizando la terminología del área.",
      "Participa en grupos de trabajo liderando o siendo parte de éstos, en el diseño o desarrollo de proyectos de sistemas electrónicos y de automatización.",
      "Ser creativo, emprendedor y comprometido con su actualización profesional continua y autónoma.",
      "Dirige planifica y participa en equipos de trabajo interdisciplinario desarrollando proyectos integradores afines a su perfil en contexto nacional e internacional.",
    ],
  },
  iam: {
    nombre: "Ingeniería Ambiental",
    clave: "IAMB – 2010 – 206",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Arturo Bulbarela Croda",
    correoJefe: "quimica_ambiental@minatitlan.tecnm.mx",
    coord: "Yazmín Natalie Corona Martínez",
    correo: "dep_ia@minatitlan.tecnm.mx",
    icono: "fas fa-leaf",
    desc: [
      "Formación de ingenieros comprometidos con la gestión, protección y restauración del medio ambiente, aplicando normatividad y tecnologías para el desarrollo sustentable.",
    ],
    perfilIngreso: {
      titulo: "Perfil de Ingreso a la carrera de Ingeniería Ambiental",
      intro:
        "El aspirante a cursar la carrera de Ingeniería Ambiental debe contar con los siguientes atributos de ingreso:",
      requisitos: [
        "Conocimientos básicos de física y química.",
        "Habilidades matemáticas en el área de álgebra, cálculo diferencial e integral.",
        "Habilidades en la lectura, comprensión, resumen y redacción de textos.",
        "Dominio en el uso de calculadoras científicas y de programas básicos de edición de textos y de hojas de cálculo.",
        "Conocimientos básicos de inglés.",
        "Uso básico de las TIC's.",
      ],
      competencias: ["----"],
    },
    objetivos: {
      clave: "IAMB-2010-206",
      general:
        "Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global.",
      especificos: [
        "Diseña y desarrolla proyectos de investigación como parte de un programa de posgrado o como miembro de una empresa, seleccionando las mejores opciones técnicas, económicas y ambientales.",
        "Dirige proyectos vinculados al área ambiental en los sectores público, productivo y de servicios que se efectúen en laboratorios, áreas experimentales y/o a escala real, con una actitud de liderazgo, profesionalismo y compromiso ético.",
        "Desempeña actividades en el campo de su competencia profesional como directivo en ayuntamientos municipales, en el gobierno estatal y federal, o en el sector privado a nivel nacional e internacional.",
        "Crea y dirige empresas brindando servicios técnicos especializados en el área ambiental, capacitación, resolución de problemáticas de contaminación.",
        "Gestiona proyectos de desarrollo social atendiendo el área ambiental, integrando todos los campos que influyen en su establecimiento, en los tres órdenes de gobierno, considerando la legislación nacional y/o internacional aplicable.",
      ],
    },
    mision: {
      mision:
        "Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global, con competencias inherentes al desarrollo de procesos en las diferentes áreas de la Ingeniería Química e Ingeniería Ambiental vinculados con los sectores productivo, social y de servicios con el propósito de influir en la solución de sus problemas y plantear alternativas que propicien el desarrollo sustentable.",
      vision:
        "Ser profesionistas en Ingeniería Química e Ingeniería Ambiental competentes para investigar, generar y aplicar el conocimiento científico y tecnológico, que le permita identificar y resolver problemas de diseño, operación, adaptación, optimización y administración en industrias químicas y de servicios, con calidad, seguridad, economía, usando racional y eficientemente los recursos naturales, conservando el medio ambiente.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Evalúa la calidad de aguas naturales y residuales para garantizar la sustentabilidad del recurso, de acuerdo con criterios de calidad y normatividad mexicana; aplicando criterios de ingeniería en el tratamiento de aguas naturales y residuales mediante selección, diseño y dimensionamiento de equipos y unidades, para optimizar su funcionamiento técnico, económico y normativo.",
      "Implementa y evalúa acciones dirigidas a la remediación de suelos contaminados mediante su caracterización, seleccionando tecnologías factibles desde el punto de vista técnico, económico y normativo, con fines de optimización.",
      "Participa en la implementación de sistemas de gestión integral de Residuos Sólidos Urbanos (RSU) organizados por la administración pública, priorizando el cuidado al medio ambiente y el cumplimiento de la normatividad mexicana.",
      "Evalúa e implementa planes de manejo de RSU, de manejo especial y peligrosos establecidos en una organización, acorde a la normatividad mexicana y/o metas establecidas por la misma organización.",
      "Aplica metodologías ISO 14001 para el desarrollo de Sistemas de Gestión Ambiental, de acuerdo con la normatividad ambiental, evaluando el desempeño ambiental de las organizaciones para su mejora continua, con fines de certificación y/o recertificación.",
      "Aplica sus conocimientos en la resolución de problemáticas ambientales utilizando herramientas tecnológicas como simuladores, sistemas de información geográfica y software especializado, empleando un segundo idioma, con un sentido proactivo, ético y de alta responsabilidad social.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
  },
  iid: {
    nombre: "Ingeniería Industrial",
    clave: "IIND – 2010 – 227",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Carolina Orihuela Vázquez",
    correoJefe: "industrial@minatitlan.tecnm.mx",
    coord: "Alejandro Bielma López",
    correo: "dep_ii@minatitlan.tecnm.mx",
    icono: "fas fa-industry",
    desc: [
      "Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios.",
    ],
    perfilIngreso: {
      titulo: "Perfil de Ingreso a la carrera de Ingeniería Industrial",
      intro:
        "El aspirante debe poseer aptitudes analíticas, capacidad organizativa e interés por la mejora continua de procesos industriales.",
      requisitos: [
        "Haber concluido el nivel de Educación Media.",
        "Disponer del tiempo para cumplir con las actividades del plan de estudios.",
        "Presentar el examen de admisión establecido por el Instituto.",
      ],
      competencias: [
        "Habilidades matemáticas y estadísticas.",
        "Capacidad de organización y planeación.",
        "Aptitud para el análisis de procesos.",
        "Habilidad para trabajar en equipo.",
        "Liderazgo y comunicación efectiva.",
      ],
    },
    objetivos: {
      clave: "IIND-2010-227",
      general:
        "Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios; con enfoque sistémico y sustentable en un entorno global.",
      especificos: [
        "Aplican las competencias y conocimientos adquiridos de la ingeniería industrial para la solución de problemas y mejora de la productividad y eficiencia de los sistemas productivos de bienes y servicios.",
        "Emprenden y evalúan modelos de negocios de bienes y servicios que responden a las necesidades del entorno local y global, generando empleos y bienestar económico.",
        "Fortalece sus habilidades y competencias profesionales mediante la formación continua, que le permiten adaptarse a los cambios y avances en la profesión.",
        "Desempeñan puestos estratégicos coordinando equipos de trabajo en los sectores productivos de bienes y servicios, en el ámbito regional, nacional e internacional.",
      ],
    },
    mision: {
      mision:
        "Somos un departamento académico cuyo compromiso es formar profesionistas con un enfoque basado en competencias en el campo de la ingeniería Industrial, con conocimientos, valores y actitudes, que le permitan ser lideres, creativos y emprendedores, sustentable, ético y comprometidos con el entorno global.",
      vision:
        "Ser un departamento académico de ingeniería industrial acreditado y consolidado a nivel nacional con un plan de estudios acreditado y especialidades acordes a las necesidades del sector productivo, así como con personal altamente competente en calidad académica, administrativa y de servicios.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Diseña, mejora e integra sistemas productivos de bienes y servicios aplicando tecnologías para su optimización.",
      "Diseña, implementa y mejora sistemas de trabajo para elevar la productividad.",
      "Implanta sistemas de calidad utilizando métodos estadísticos para mejorar la competitividad de las organizaciones.",
      "Administra sistemas de mantenimiento en procesos de bienes y servicios para la optimización en el uso de los recursos.",
      "Gestiona sistemas de seguridad, salud ocupacional de manera sustentable, en sistemas productivos de bienes y servicios atendiendo los lineamientos legales.",
      "Formula, evalúa y gestiona proyectos de inversión, sociales y de transferencia de tecnología para el desarrollo regional.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
    atributosEgreso: [
      "AE1. Resuelve problemas complejos de ingeniería Industrial aplicando los principios de ingeniería y ciencias básicas para la optimización de los sistemas productivos de bienes y servicios.",
      "AE2. Diseña, implementa y mejora sistemas de producción de bienes y servicios mediante métodos y técnicas establecidos para la mejora de la productividad.",
      "AE3. Evalúa e implementa sistemas integrados, mediante métodos estadísticos y de trabajo para mejorar la calidad, seguridad y productividad en las organizaciones.",
      "AE4. Coordina y dirige grupos interdisciplinarios haciendo uso de las tecnologías de información y comunicación para la difusión de los sistemas integrados en las organizaciones.",
      "AE5. Gestiona los sistemas integrados en los sectores productivos y de servicios con base a las normas y estándares vigentes nacionales e internacionales.",
      "AE6. Formula, evalúa y/o emprende proyectos de inversión aplicando los conocimientos de ingeniería Industrial, que promueva el desarrollo socioeconómico de una región de forma sustentable.",
      "AE7. Desarrolla actitudes de liderazgo y trabajo colaborativo a partir de un sentido ético y profesional, con un amplio carácter emprendedor, crítico y creativo.",
    ],
  },
  iq: {
    nombre: "Ingeniería Química",
    clave: "IQUI – 2010 – 232",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Arturo Bulbarela Croda",
    correoJefe: "quimica_ambiental@minatitlan.tecnm.mx",
    coord: "Laura Gabriela Martínez Montiel",
    correo: "dep_iq@minatitlan.tecnm.mx",
    icono: "fas fa-flask",
    desc: [
      "Formación de ingenieros especializados en diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios con base en el desarrollo tecnológico y de manera sustentable.",
    ],
    perfilIngreso: {
      titulo: "Perfil de Ingreso a la carrera de Ingeniería Química",
      intro:
        "El aspirante a la carrera de Ingeniería Química debe contar con el siguiente perfil de ingreso:",
      requisitos: [
        "Habilidades en matemáticas de álgebra, cálculo diferencial e integral.",
        "Conocimientos básicos de química y física.",
        "Habilidades de lectura, comprensión, resumen y redacción de textos.",
        "Conocimiento mínimo del idioma inglés.",
        "Uso básico de las TIC's.",
      ],
      competencias: ["----"],
    },
    objetivos: {
      clave: "IQUI-2010-232",
      general:
        "Formar ingenieros químicos capaces de diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios, con apego a la normatividad vigente y de manera sustentable.",
      especificos: [
        "El egresado estudia un posgrado y desarrolla investigación para innovar procesos en la industria o en el sector educativo.",
        "El egresado a través de su desempeño cubre puestos gerenciales en los sectores públicos o privados a nivel nacional o internacional.",
        "El egresado se actualiza en nuevas tecnologías y administra las empresas con sentido humano, legal, ético y con responsabilidad social.",
        "El egresado trabaja con equipos multidisciplinarios de alto desempeño para la planeación, evaluación y desarrollo de proyectos de construcción, expansión y mejora de procesos industriales.",
      ],
    },
    mision: {
      mision:
        "Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global, con competencias inherentes al desarrollo de procesos en las diferentes áreas de la Ingeniería Química e Ingeniería Ambiental vinculados con los sectores productivo, social y de servicios con el propósito de influir en la solución de sus problemas y plantear alternativas que propicien el desarrollo sustentable.",
      vision:
        "Ser profesionistas en Ingeniería Química e Ingeniería Ambiental competentes para investigar, generar y aplicar el conocimiento científico y tecnológico, que le permita identificar y resolver problemas de diseño, operación, adaptación, optimización y administración en industrias químicas y de servicios, con calidad, seguridad, economía, usando racional y eficientemente los recursos naturales, conservando el medio ambiente.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios con base en el desarrollo tecnológico de acuerdo con las normas de higiene y seguridad, de manera sustentable.",
      "Colaborar en equipos interdisciplinarios y multiculturales en su ámbito laboral, con actitud innovadora, espíritu crítico, disposición al cambio y apego a la ética profesional.",
      "Planear e implementar sistemas de gestión de calidad, ambiental e higiene y seguridad en los diferentes sectores, conforme a las normas nacionales e internacionales.",
      "Utilizar las tecnologías de la información y comunicación como herramientas en la construcción de soluciones a problemas de ingeniería y difundir el conocimiento científico y tecnológico.",
      "Realizar innovación y adaptación de tecnología en procesos aplicando la metodología científica, con respeto a la propiedad intelectual.",
      "Utilizar un segundo idioma en su ámbito laboral según los requerimientos del entorno.",
      "Comunicarse en forma oral y escrita en el ámbito laboral de manera expedita y concisa.",
      "Demostrar actitud creativa, emprendedora y de liderazgo para impulsar y crear empresas que contribuyan al progreso nacional.",
      "Administrar recursos humanos, materiales y financieros para los sectores público y privado, acorde a modelos administrativos vigentes.",
      "Demostrar actitudes de superación continua para lograr metas personales y profesionales con pertinencia y competitividad.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
    atributosEgreso: [
      "Identificar, formular y resolver problemas de Ingeniería aplicando principios de las Ciencias Básicas, Matemáticas e Ingeniería.",
      "Realizar el dimensionamiento de procesos para proponer soluciones que satisfagan necesidades que involucren criterios de salud y seguridad Industrial y el bienestar.",
      "Aplicar técnicas analíticas de laboratorio e investigación para mejorar los sistemas productivos.",
      "Aplicar los conocimientos para la Operación y Administración de plantas Industriales y de comunicación en el ámbito laboral y personal.",
      "Incluir e identificar las responsabilidades éticas, profesionales y sustentables en situaciones relacionadas con su quehacer diario de la ingeniería.",
      "Adquirir y aplicar nuevos conocimientos de acuerdo con las necesidades laborales o profesionales como el dominio del idioma inglés y el uso de software de ingeniería.",
      "Trabajar en equipos multidisciplinarios de manera efectiva y eficiente relacionados con la ingeniería creando un ambiente colaborativo e inclusivo.",
    ],
  },
  la: {
    nombre: "Licenciatura en Administración",
    clave: "LADM – 2010 – 234",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "----",
    correoJefe: "----",
    coord: "Olivia Hernández Domínguez",
    correo: "dep_la@minatitlan.tecnm.mx",
    icono: "fas fa-briefcase",
    desc: [
      "Formar profesionales de la administración comprometidos con las demandas y oportunidades del entorno, con una visión estratégica, humanista y global, que actúen como agentes de cambio.",
    ],
    perfilIngreso: {
      titulo:
        "Perfil de Ingreso a la carrera de Licenciatura en Administración",
      intro:
        "El aspirante por cursar la Licenciatura en Administración en Tecnológico Nacional de México Campus Minatitlán posea los conocimientos, habilidades, actitudes, valores y competencias necesarios para generar una base sólida que fomente su desarrollo a lo largo de su vida académica.",
      requisitos: [
        "Haber concluido el nivel de Educación Media Superior.",
        "Disponer del tiempo para cumplir con las actividades del plan de estudio.",
        "Presentar el examen de admisión establecido por el Instituto.",
      ],
      competencias: [
        "Habilidades matemáticas (aritmética y estadística).",
        "Habilidades básicas del manejo de la computación.",
        "Habilidades de gestión de información.",
        "Comprensión lectora.",
        "Comunicación escrita.",
        "Capacidad de relacionarse con otras personas.",
        "Habilidad para trabajar en forma autónoma.",
      ],
    },
    objetivos: {
      clave: "LADM-2010-234",
      general:
        "Formar profesionales de la administración comprometidos con las demandas y oportunidades del entorno, con una visión estratégica, humanista y global, que actúen como agentes de cambio, a través del diseño, innovación y dirección en las organizaciones.",
      especificos: [
        "Adaptar las etapas del proceso administrativo a las nuevas tendencias con la finalidad de optimizar los recursos.",
        "Analizar e interpretar información financiera y económica para la toma de decisiones en las organizaciones.",
        "Crear y desarrollar negocios sustentables aplicando métodos de investigación de vanguardia, contribuyendo al fin de la pobreza, con un enfoque multicultural.",
        "Interpretar y aplicar el marco legal vigente, para dar certeza jurídica a las organizaciones, contribuyendo al trabajo decente y crecimiento económico.",
        "Implementar y administrar sistemas de gestión de la calidad, para orientar a las organizaciones a la mejora continua que demande el entorno.",
        "Aplicar las tecnologías de la información y comunicación en el diseño de estrategias, que permitan el trabajo de las organizaciones.",
      ],
    },
    mision: {
      mision:
        "Formar integralmente profesionales en administración, basados en el modelo educativo para el siglo XXI, con un enfoque humanista y ético para el desarrollo estratégico sostenible que demanden las organizaciones.",
      vision:
        "Ser un programa académico con reconocimiento nacional e internacional en el desempeño e investigación aplicada de la administración.",
      politicas: [
        "Promover el desarrollo integral y armónico del estudiante en Administración para que responda a los retos y necesidades de las organizaciones.",
        "Implementar y orientar los procesos estratégicos y actividades del programa educativo hacia el reconocimiento nacional e internacional.",
        "Mantener una relación estrecha y permanente con la comunidad en actividades científicas, tecnológicas, culturales y humanísticas.",
        "Fomentar la investigación, la ciencia y la tecnología en el campo de la administración.",
        "Vigilar en el proceso educativo el cumplimiento de las leyes, reglamentos, manuales y procedimientos que rigen la operación del programa académico.",
        "Orientar las actividades del programa educativo hacia la equidad de género y no discriminación, la responsabilidad social, respeto al medio ambiente e impacto económico.",
      ],
    },
    salidaLateral: true,
    perfilEgreso: [
      "Integra los procesos gerenciales, de administración, de innovación y las estrategias para alcanzar la productividad y competitividad de las organizaciones.",
      "Adapta las etapas de los procesos a las nuevas tendencias y enfoques de la administración, para la optimización de los recursos y el manejo de los cambios organizacionales, de acuerdo a las necesidades del entorno.",
      "Desarrolla habilidades directivas basadas en la ética y la responsabilidad social, que le permitan integrar y coordinar equipos interdisciplinarios y multidisciplinarios para el crecimiento de la organización.",
      "Crea y desarrolla proyectos sustentables aplicando métodos de investigación de vanguardia, con un enfoque estratégico, multicultural y humanista.",
      "Dirige la organización hacia la consecución de sus objetivos, a través de la coordinación de esfuerzos y el desarrollo creativo.",
      "Diseña organizaciones que contribuyan a la transformación económica y social identificando las oportunidades de negocios.",
      "Interpreta y aplica el marco legal vigente nacional e internacional, para dar certeza jurídica a las organizaciones.",
      "Interpreta información financiera y económica para la toma de decisiones en las organizaciones.",
      "Desarrolla el capital humano a través de la utilización de técnicas y herramientas gerenciales para la toma de decisiones.",
      "Implementa y administra sistemas de gestión de calidad para orientarlos a la mejora continua, con la finalidad de lograr la eficacia y eficiencia de la organización.",
      "Aplica las tecnologías de la información y comunicación en el diseño de estrategias que optimicen el trabajo y desarrollo de las organizaciones.",
      "Posee una visión multidisciplinaria para generar acciones ante escenarios de contingencia salvaguardando la integridad humana.",
      "Diseña estrategias de mercadotecnia basadas en el análisis de la información interna y del entorno global, para asegurar el éxito de la comercialización de bienes y servicios de las organizaciones.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
  },
  iia: {
    nombre: "Ingeniería en Inteligencia Artificial",
    clave: "TBD",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Jafet Montenegro Hipólito",
    correoJefe: "electronica@minatitlan.tecnm.mx",
    coord: "Eliseo Hernández del Rivero",
    correo: "dep_ie@minatitlan.tecnm.mx",
    icono: "fas fa-robot",
    desc: [
      "Formar ingenieros competentes en el diseño, desarrollo, y evaluación de sistemas inteligentes para la toma de decisiones en entornos industriales, empresariales y de investigación, con un enfoque multidisciplinario, ético y sostenible.",
    ],
    perfilIngreso: {
      titulo:
        "Perfil de Ingreso a la carrera de Ingeniería en Inteligencia Artificial",
      intro:
        "El aspirante a la carrera de Ingeniería en Inteligencia Artificial debe contar con el siguiente perfil:",
      requisitos: [
        "Habilidades lógico-matemáticas.",
        "Habilidades de pensamiento crítico, de análisis y síntesis.",
        "Habilidades de comunicación oral y escrita.",
        "Habilidad de razonamiento cuantitativo.",
        "Habilidades de programación básica.",
        "Habilidades de uso de herramientas tecnológicas.",
      ],
      competencias: ["----"],
    },
    objetivos: {
      clave: "TBD",
      general:
        "Formar ingenieros competentes en el diseño, desarrollo, y evaluación de sistemas inteligentes para la toma de decisiones en entornos industriales, empresariales y de investigación que contribuyan al avance de las ciencias humanísticas y tecnológicas, con un enfoque multidisciplinario, ético y sostenible.",
      especificos: [
        "Utiliza análisis de datos, herramientas y técnicas avanzadas de inteligencia artificial para resolver problemas complejos en diferentes entornos sociales.",
        "Diseña, evalúa y modela algoritmos para crear soluciones inteligentes en entornos industriales, empresariales y de investigación.",
        "Aplica principios teóricos y prácticos para el análisis y desarrollo de sistemas inteligentes con sentido humano.",
        "Desarrolla soluciones en inteligencia artificial para integrar sistemas completos que automatizan procesos, optimizan operaciones y mejoran la toma de decisiones.",
        "Contribuye a la generación, comunicación y difusión de conocimiento en el campo de la inteligencia artificial mediante la participación en proyectos multidisciplinarios.",
      ],
    },
    mision: {
      mision: "Información disponible próximamente.",
      vision: "Información disponible próximamente.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Utiliza análisis de datos, herramientas y técnicas avanzadas de inteligencia artificial para resolver problemas complejos en diferentes entornos sociales.",
      "Diseña, evalúa y modela algoritmos para crear soluciones inteligentes en entornos industriales, empresariales y de investigación en una o varias áreas funcionales, cumpliendo con estándares de calidad y ética.",
      "Aplica principios teóricos y prácticos para el análisis y desarrollo de sistemas inteligentes con sentido humano.",
      "Desarrolla soluciones en inteligencia artificial para integrar sistemas completos que automatizan procesos, optimizan operaciones y mejoran la toma de decisiones en sectores industriales y comerciales con responsabilidad social.",
      "Contribuye a la generación, comunicación y difusión de conocimiento en el campo de la inteligencia artificial mediante la participación en proyectos multidisciplinarios para la gestión de proyectos de desarrollo tecnológico en su entorno.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
  },
  ida: {
    nombre: "Ingeniería en Desarrollo de Aplicaciones",
    clave: "TBD",
    modalidad: "Escolarizado – Semestral",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "Mauricio García Avalos",
    correoJefe: "sistemas@minatitlan.tecnm.mx",
    coord: "Víctor Ignacio Velasco Huerta",
    correo: "dep_isc@minatitlan.tecnm.mx",
    icono: "fas fa-mobile-alt",
    desc: [
      "Formar ingenieros competentes en el diseño y desarrollo de aplicaciones web, móvil y en la nube, ofreciendo soluciones innovadoras y eficientes que respondan a las necesidades del mercado digital.",
    ],
    perfilIngreso: {
      titulo:
        "Perfil de Ingreso a la carrera de Ingeniería en Desarrollo de Aplicaciones",
      intro:
        "El aspirante a la carrera de Ingeniería en Desarrollo de Aplicaciones debe contar con el siguiente perfil:",
      requisitos: [
        "Habilidades lógico-matemáticas.",
        "Habilidades de pensamiento crítico, de análisis y síntesis.",
        "Habilidades de comunicación oral y escrita.",
        "Habilidad de razonamiento cuantitativo.",
        "Habilidades de programación básica.",
        "Habilidades de uso de herramientas tecnológicas.",
      ],
      competencias: ["----"],
    },
    objetivos: {
      clave: "TBD",
      general:
        "Formar ingenieros competentes en el diseño y desarrollo de aplicaciones web, móvil y en la nube ofreciendo soluciones innovadoras y eficientes que respondan a las necesidades del mercado digital y permitan la mejora del desempeño de las organizaciones con tecnologías de vanguardia, en un entorno complejo y globalizado con compromiso ético y sostenible.",
      especificos: [
        "Analiza, diseña y desarrolla aplicaciones web, móvil o de cómputo en la nube para satisfacer los requerimientos de los usuarios.",
        "Desarrolla bases de datos relacionales y no relacionales utilizando estándares internacionales para crear sistemas de información robustos, eficientes y sostenibles.",
        "Desarrolla estrategias basadas en la mercadotecnia digital que permitan a los usuarios generar experiencias y contribuir con las organizaciones.",
        "Formula, diseña, ejecuta y evalúa proyectos de desarrollo de aplicaciones orientados a la satisfacción de necesidades para potenciar los servicios de las organizaciones.",
        "Desarrolla proyectos de inversión viables, empleando como una de las estrategias de solución el uso de nuevas tecnologías.",
      ],
    },
    mision: {
      mision: "Información disponible próximamente.",
      vision: "Información disponible próximamente.",
    },
    salidaLateral: true,
    perfilEgreso: [
      "Analiza, diseña y desarrolla aplicaciones web, móvil o de cómputo en la nube para satisfacer los requerimientos de los usuarios.",
      "Desarrolla bases de datos relacionales y no relacionales utilizando estándares internacionales para crear sistemas de información robustos, eficientes y sostenibles.",
      "Desarrolla estrategias basadas en la mercadotecnia digital, que le permitan a los usuarios generar experiencias y contribuir con las organizaciones para posicionar sus productos y servicios en Internet con sentido ético.",
      "Formula, diseña, ejecuta y evalúa proyectos de desarrollo de aplicaciones orientados a la satisfacción de necesidades para potenciar los servicios de las organizaciones y la sociedad con responsabilidad ética.",
      "Desarrolla proyectos de inversión viables, empleando como una de las estrategias de solución el uso de nuevas tecnologías, para la satisfacción de necesidades de las organizaciones y la sociedad.",
    ],
    asignaturas: [
      "Asignaturas",
      "Asignaturas comunes",
      "Asignaturas equivalentes",
    ],
  },
  "iid-d": {
    nombre: "Ingeniería Industrial (Educación a Distancia)",
    clave: "IIND – 2010 – 227",
    modalidad: "Distancia",
    duracion: "9 semestres",
    creditos: "260",
    jefe: "---",
    correoJefe: "---",
    coord: "Luz Elena Villanueva Castellanos",
    correo: "ead@minatitlan.tecnm.mx",
    icono: "fas fa-laptop-house",
    planEstudio: false,
    desc: [
      "Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial en modalidad a distancia; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios.",
    ],
    perfilIngreso: {
      titulo: "----",
      intro: "----",
      requisitos: ["----"],
      competencias: ["----"],
    },
    objetivos: {
      clave: "IIND-2010-227",
      general:
        "Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios; con enfoque sistémico y sustentable en un entorno global.",
      especificos: [],
    },
    perfilEgreso: [
      "Diseña, mejora e integra sistemas productivos de bienes y servicios aplicando tecnologías para su optimización.",
      "Diseña, implementa y mejora sistemas de trabajo para elevar la productividad.",
      "Implanta sistemas de calidad utilizando métodos estadísticos para mejorar la competitividad de las organizaciones.",
      "Administra sistemas de mantenimiento en procesos de bienes y servicios para la optimización en el uso de los recursos.",
      "Gestiona sistemas de seguridad, salud ocupacional de manera sustentable, en sistemas productivos de bienes y servicios atendiendo los lineamientos legales.",
      "Formula, evalúa y gestiona proyectos de inversión, sociales y de transferencia de tecnología para el desarrollo regional.",
    ],
    convocatoria: {
      texto:
        "Consulta la convocatoria para la modalidad de Educación a Distancia (AGO – DIC 2024):",
      url: "https://minatitlan.tecnm.mx/wp-content/uploads/2024/05/Convocatoria-No-Escolarizada-CIESDEMEX-EaD-Minatitlan_V.pdf",
    },
  },
};

// Carrera actualmente abierta (para plan de estudios)
let currentCarreraId = null;
const planEstudioFiles = {}; // almacena por carrera

document.addEventListener("DOMContentLoaded", function () {
  const btnOferta = document.getElementById("btnOfertaEducativaAlumno");
  if (btnOferta) {
    btnOferta.addEventListener("click", function () {
      abrirModalOferta();
    });
  }

  // Buscador en modal Oferta
  const oeSearch = document.querySelector("#ofertaModalOverlay .oe-search");
  if (oeSearch) {
    oeSearch.addEventListener("input", function () {
      const term = this.value.toLowerCase().trim();
      const panel =
        document.getElementById("oePanelPresencial").style.display !== "none"
          ? document.getElementById("oePanelPresencial")
          : document.getElementById("oePanelDistancia");
      panel.querySelectorAll(".oe-filtrable").forEach(function (btn) {
        btn.style.display =
          term === "" || btn.textContent.toLowerCase().includes(term)
            ? ""
            : "none";
      });
    });
  }
});

function abrirModalOferta() {
  const overlay = document.getElementById("ofertaModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalOferta(event) {
  const overlay = document.getElementById("ofertaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

function seleccionarModalidadOE(modalidad) {
  const panelP = document.getElementById("oePanelPresencial");
  const panelD = document.getElementById("oePanelDistancia");
  const tabP = document.getElementById("oeTabPresencial");
  const tabD = document.getElementById("oeTabDistancia");
  if (modalidad === "presencial") {
    panelP.style.display = "";
    panelD.style.display = "none";
    tabP.classList.add("oe-sidebar-active");
    tabD.classList.remove("oe-sidebar-active");
  } else {
    panelP.style.display = "none";
    panelD.style.display = "";
    tabP.classList.remove("oe-sidebar-active");
    tabD.classList.add("oe-sidebar-active");
  }
  // Limpiar búsqueda
  const s = document.querySelector("#ofertaModalOverlay .oe-search");
  if (s) {
    s.value = "";
  }
  document
    .querySelectorAll(".oe-filtrable")
    .forEach((b) => (b.style.display = ""));
}

function abrirModalCarrera(carreraId) {
  const data = CARRERAS_DATA[carreraId];
  if (!data) return;
  currentCarreraId = carreraId;

  // Cerrar modal oferta
  const ofertaOverlay = document.getElementById("ofertaModalOverlay");
  if (ofertaOverlay) ofertaOverlay.classList.remove("active");

  // --- Banner ---
  const bannerEl = document.getElementById("carreraBanner");
  const headerNoBanner = document.getElementById("carreraHeaderNoBanner");
  const bodyInner = document.getElementById("carreraBodyInner");
  if (bannerEl) {
    bannerEl.className = "oe-carrera-banner oe-banner-" + carreraId;
    const bannerIcon = document.getElementById("carreraBannerIcon");
    if (bannerIcon) bannerIcon.className = data.icono;
    document.getElementById("carreraBannerNombre").textContent = data.nombre;
    document.getElementById("carreraBannerClave").textContent = data.clave;
    // Cargar imagen usando <img> real (soporta .jpg y .jpeg)
    const bannerImg = document.getElementById("carreraBannerImg");
    if (bannerImg) {
      bannerImg.style.display = "none";
      bannerImg.src = "";
      const exts = ["jpg", "jpeg", "png", "webp"];
      let tried = 0;
      function tryNext() {
        if (tried >= exts.length) return; // ninguna cargó, queda el gradiente
        bannerImg.onerror = function () {
          tried++;
          tryNext();
        };
        bannerImg.onload = function () {
          bannerImg.style.display = "";
        };
        bannerImg.src = "../img/banner-" + carreraId + "." + exts[tried];
        tried++;
      }
      tryNext();
    }
    bannerEl.style.display = "";
  }
  if (headerNoBanner) headerNoBanner.style.display = "none";
  if (bodyInner) bodyInner.style.maxHeight = "calc(60vh - 130px)";

  // Breadcrumb y título
  document.getElementById("carreraBreadcrumb").textContent =
    "Inicio › Oferta Educativa › " + data.nombre;
  document.getElementById("carreraTitle").textContent = data.nombre;

  // --- Ficha técnica: ocultar filas vacías ---
  const fichaMap = {
    carreraModalidad: data.modalidad,
    carreraDuracion: data.duracion,
    carreraCreditos: data.creditos,
    carreraJefe: data.jefe,
    carreraCorreoJefe: data.correoJefe,
    carreraCoord: data.coord,
    carreraCorreo: data.correo,
  };
  Object.entries(fichaMap).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val || "—";
    const row = el.closest(".oe-ficha-row");
    if (row)
      row.style.display = val && val !== "---" && val !== "----" ? "" : "none";
  });

  // Descripción
  const descList = document.getElementById("carreraDesc");
  if (descList)
    descList.innerHTML = (data.desc || [])
      .map((d) => "<li>" + d + "</li>")
      .join("");

  // helper: show/hide a section wrapper
  function secVis(secId, wrapId, show) {
    const sec = document.getElementById(secId);
    const wrap = wrapId
      ? document.getElementById(wrapId)
      : sec && sec.closest(".tr-section");
    const target = wrap || (sec && sec.closest(".tr-section"));
    if (target) target.style.display = show ? "" : "none";
  }

  // --- Perfil de Ingreso ---
  const pi = data.perfilIngreso;
  if (pi && pi.intro && pi.intro !== "----") {
    let html = "";
    if (pi.titulo) html += `<h4>${pi.titulo}</h4>`;
    html += `<p>${pi.intro}</p>`;
    if (pi.requisitos && pi.requisitos[0] !== "----")
      html += `<h4>Requisitos</h4><ul>${pi.requisitos.map((r) => "<li>" + r + "</li>").join("")}</ul>`;
    if (pi.competencias && pi.competencias[0] !== "----")
      html += `<h4>Competencias</h4><ul>${pi.competencias.map((c) => "<li>" + c + "</li>").join("")}</ul>`;
    const el = document.getElementById("perfilIngresoContent");
    if (el) el.innerHTML = html;
    secVis("secPerfilIngreso", null, true);
  } else {
    secVis("secPerfilIngreso", null, false);
  }

  // --- Objetivos Educativos ---
  if (data.objetivos) {
    const obj = data.objetivos;
    let html = "";
    if (obj.clave) html += `<p class="oe-block-sub">Clave: ${obj.clave}</p>`;
    if (obj.general)
      html += `<p class="oe-block-title">Objetivo General</p><p class="oe-mision-text">${obj.general}</p>`;
    if (obj.especificos && obj.especificos.length)
      html += `<p class="oe-block-title">Objetivos educativos</p><ol class="oe-obj-list">${obj.especificos.map((e) => "<li>" + e + "</li>").join("")}</ol>`;
    const el = document.getElementById("objetivosContent");
    if (el) el.innerHTML = html;
    secVis("secObjetivos", null, true);
  } else {
    secVis("secObjetivos", null, false);
  }

  // --- Misión y Visión ---
  if (data.mision && data.mision.mision && data.mision.mision !== "----") {
    const m = data.mision;
    let html = `<p class="oe-block-title">Misión</p><p class="oe-mision-text">${m.mision}</p>`;
    if (m.vision && m.vision !== "----")
      html += `<p class="oe-block-title">Visión</p><p class="oe-mision-text">${m.vision}</p>`;
    if (m.politicas)
      html += `<p class="oe-block-title">Políticas</p><ol class="oe-politica-list">${m.politicas.map((p) => "<li>" + p + "</li>").join("")}</ol>`;
    const el = document.getElementById("misionContent");
    if (el) el.innerHTML = html;
    secVis("secMision", null, true);
  } else {
    secVis("secMision", null, false);
  }

  // --- Salida Lateral ---
  if (data.salidaLateral) {
    const slKey = carreraId + "_sl";
    const slFile = planEstudioFiles[slKey];
    const slSt = slFile
      ? `<span class="tr-file-status" title="${slFile.name}">✓ ${slFile.name.length > 12 ? slFile.name.substring(0, 12) + "…" : slFile.name}</span>`
      : '<span class="tr-file-status"></span>';
    const slDl = slFile
      ? `<a class="oe-upload-row-dl" href="${slFile.url}" download="${slFile.name}"><i class="fas fa-download"></i></a>`
      : `<a class="oe-upload-row-dl" style="display:none" href="#"><i class="fas fa-download"></i></a>`;
    // REQ-04/05: Botón de subida solo visible para admin
    const slUploadBtn = obtenerRol() === "admin"
      ? `<label class="oe-upload-row-btn" for="file-sl-${carreraId}"><i class="fas fa-upload"></i></label><input type="file" id="file-sl-${carreraId}" class="tr-file-input" accept="*/*" onchange="subirDocOE(event,'${slKey}','file-sl-${carreraId}')">`
      : '';
    const el = document.getElementById("salidaLateralContent");
    if (el)
      el.innerHTML = `<div class="oe-upload-zone"><div class="oe-upload-row"><i class="fas fa-file-alt oe-upload-row-icon"></i><span class="oe-upload-row-name">Documento de Salida Lateral</span><div class="oe-upload-row-actions">${slUploadBtn}${slSt}${slDl}</div></div></div>`;
    secVis("secSalidaLateral", null, true);
  } else {
    secVis("secSalidaLateral", null, false);
  }

  // --- Especialidad ---
  if (data.especialidad) {
    const esp = data.especialidad;
    let html = `<p class="oe-block-title">${esp.nombre || ""}</p>`;
    if (esp.descripcion)
      html += `<p class="oe-mision-text">${esp.descripcion}</p>`;
    if (esp.materias && esp.materias.length)
      html += `<ul>${esp.materias.map((m) => "<li>" + m + "</li>").join("")}</ul>`;
    const el = document.getElementById("especialidadContent");
    if (el) el.innerHTML = html;
    const w = document.getElementById("wrapSecEspecialidad");
    if (w) w.style.display = "";
  } else {
    const w = document.getElementById("wrapSecEspecialidad");
    if (w) w.style.display = "none";
  }

  // --- Atributos de Egreso ---
  if (data.atributosEgreso && data.atributosEgreso.length) {
    const el = document.getElementById("atributosContent");
    if (el)
      el.innerHTML = `<ol class="oe-egreso-list">${data.atributosEgreso.map((a) => "<li>" + a + "</li>").join("")}</ol>`;
    const w = document.getElementById("wrapSecAtributos");
    if (w) w.style.display = "";
  } else {
    const w = document.getElementById("wrapSecAtributos");
    if (w) w.style.display = "none";
  }

  // --- Perfil de Egreso ---
  if (data.perfilEgreso && data.perfilEgreso.length) {
    const el = document.getElementById("perfilEgresoContent");
    if (el)
      el.innerHTML = `<ol class="oe-egreso-list">${data.perfilEgreso.map((e) => "<li>" + e + "</li>").join("")}</ol>`;
    secVis("secPerfilEgreso", null, true);
  } else {
    secVis("secPerfilEgreso", null, false);
  }

  // --- Asignaturas ---
  if (data.asignaturas && data.asignaturas.length) {
    const esAdmin = obtenerRol() === "admin";
    const rows = data.asignaturas
      .map(function (nombre, idx) {
        const key = carreraId + "_as_" + idx;
        const f = planEstudioFiles[key];
        const st = f
          ? `<span class="tr-file-status" title="${f.name}">✓ ${f.name.length > 10 ? f.name.substring(0, 10) + "…" : f.name}</span>`
          : '<span class="tr-file-status"></span>';
        const dl = f
          ? `<a class="oe-upload-row-dl" href="${f.url}" download="${f.name}"><i class="fas fa-download"></i></a>`
          : `<a class="oe-upload-row-dl" style="display:none" href="#"><i class="fas fa-download"></i></a>`;
        // REQ-04/05: Botón de subida solo visible para admin
        const uploadBtn = esAdmin
          ? `<label class="oe-upload-row-btn" for="file-as-${carreraId}-${idx}"><i class="fas fa-upload"></i></label><input type="file" id="file-as-${carreraId}-${idx}" class="tr-file-input" accept="*/*" onchange="subirDocOE(event,'${key}','file-as-${carreraId}-${idx}')">`
          : '';
        return `<div class="oe-upload-row"><i class="fas fa-file-archive oe-upload-row-icon"></i><span class="oe-upload-row-name">${nombre}</span><div class="oe-upload-row-actions">${uploadBtn}${st}${dl}</div></div>`;
      })
      .join("");
    const el = document.getElementById("asignaturasContent");
    if (el) el.innerHTML = `<div class="oe-upload-zone">${rows}</div>`;
    secVis("secAsignaturas", null, true);
  } else {
    secVis("secAsignaturas", null, false);
  }

  // --- Convocatoria ---
  if (data.convocatoria) {
    let html = "";
    if (data.convocatoria.texto)
      html += `<p class="oe-mision-text">${data.convocatoria.texto}</p>`;
    if (data.convocatoria.url)
      html += `<a href="${data.convocatoria.url}" target="_blank" class="oe-conv-link"><i class="fas fa-external-link-alt"></i> Ver Convocatoria</a>`;
    const el = document.getElementById("convocatoriaContent");
    if (el) el.innerHTML = html;
    const w = document.getElementById("wrapSecConvocatoria");
    if (w) w.style.display = "";
  } else {
    const w = document.getElementById("wrapSecConvocatoria");
    if (w) w.style.display = "none";
  }

  // --- Plan de estudios ---
  const planDl = document.getElementById("planDownloadBtn");
  const planBlock = document
    .getElementById("planUploadLabel")
    ?.closest(".oe-section-block");
  if (data.planEstudio === false) {
    if (planBlock) planBlock.style.display = "none";
  } else {
    if (planBlock) planBlock.style.display = "";
    if (planEstudioFiles[carreraId]) {
      const f = planEstudioFiles[carreraId];
      if (planDl) {
        planDl.href = f.url;
        planDl.download = f.name;
        planDl.classList.remove("oe-plan-dl-hidden");
      }
    } else {
      if (planDl) {
        planDl.href = "#";
        planDl.classList.add("oe-plan-dl-hidden");
      }
    }
  }

  // Colapsar todas las secciones visibles
  [
    "secPerfilIngreso",
    "secObjetivos",
    "secMision",
    "secSalidaLateral",
    "secEspecialidad",
    "secAtributos",
    "secPerfilEgreso",
    "secAsignaturas",
    "secConvocatoria",
  ].forEach(function (id) {
    const sec = document.getElementById(id);
    if (sec) {
      sec.classList.add("tr-section-collapsed");
      const toggle = sec.previousElementSibling;
      if (toggle) {
        const arrow = toggle.querySelector(".tr-section-arrow");
        if (arrow) arrow.style.transform = "rotate(-90deg)";
      }
    }
  });

  const overlay = document.getElementById("carreraModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalCarrera(event) {
  const overlay = document.getElementById("carreraModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

// Upload genérico para docs de carrera (Salida Lateral, Asignaturas)
function subirDocOE(event, key, inputId) {
  // REQ-05: Solo el admin puede subir documentos de servicios
  var rol = obtenerRol();
  if (rol !== "admin") {
    event.target.value = "";
    alert("Solo el administrador puede subir archivos.");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  planEstudioFiles[key] = { url: url, name: file.name };
  // Actualizar status y botón de descarga en el DOM
  const input = document.getElementById(inputId);
  if (!input) return;
  const row = input.closest(".oe-upload-row");
  if (!row) return;
  const statusEl = row.querySelector(".tr-file-status");
  const dlEl = row.querySelector(".oe-upload-row-dl");
  if (statusEl) {
    statusEl.textContent =
      "✓ " +
      (file.name.length > 10 ? file.name.substring(0, 10) + "…" : file.name);
    statusEl.title = file.name;
  }
  if (dlEl) {
    dlEl.href = url;
    dlEl.download = file.name;
    dlEl.style.display = "";
  }
}

function subirPlanEstudio(event) {
  // REQ-05: Solo el admin puede subir el plan de estudio
  var rol = obtenerRol();
  if (rol !== "admin") {
    event.target.value = "";
    alert("Solo el administrador puede subir archivos.");
    return;
  }
  const file = event.target.files[0];
  if (!file || !currentCarreraId) return;
  const url = URL.createObjectURL(file);
  planEstudioFiles[currentCarreraId] = { url: url, name: file.name };
  const planDl = document.getElementById("planDownloadBtn");
  planDl.href = url;
  planDl.download = file.name;
  planDl.classList.remove("oe-plan-dl-hidden");
}
// ========================================
// MODALES: DEPORTES (ALUMNO)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("btnDeportesAlumno");
  if (btn) {
    btn.addEventListener("click", function () {
      abrirModalDeportes();
    });
  }
});

function abrirModalDeportes() {
  var o = document.getElementById("deportesModalOverlay");
  if (o) o.classList.add("active");
}
function cerrarModalDeportes(event) {
  var o = document.getElementById("deportesModalOverlay");
  if (!o) return;
  if (!event || event.target === o) o.classList.remove("active");
}

function abrirModalActDeportivas() {
  var o = document.getElementById("actDeportivasModalOverlay");
  if (o) o.classList.add("active");
}
function cerrarModalActDeportivas(event) {
  var o = document.getElementById("actDeportivasModalOverlay");
  if (!o) return;
  if (!event || event.target === o) o.classList.remove("active");
}

function abrirModalActCivicas() {
  var o = document.getElementById("actCivicasModalOverlay");
  if (o) o.classList.add("active");
}
function cerrarModalActCivicas(event) {
  var o = document.getElementById("actCivicasModalOverlay");
  if (!o) return;
  if (!event || event.target === o) o.classList.remove("active");
}

function abrirModalActCulturales() {
  var o = document.getElementById("actCulturalesModalOverlay");
  if (o) o.classList.add("active");
}
function cerrarModalActCulturales(event) {
  var o = document.getElementById("actCulturalesModalOverlay");
  if (!o) return;
  if (!event || event.target === o) o.classList.remove("active");
}

function filtrarActividadesDeportivas() {
  var query =
    (document.getElementById("depSearchDeportivas") || {}).value || "";
  query = query.toLowerCase().trim();
  var items = document.querySelectorAll("#listaActDeportivas .dep-act-item");
  items.forEach(function (item) {
    var nombre = (item.getAttribute("data-nombre") || "").toLowerCase();
    var texto = item.textContent.toLowerCase();
    item.style.display =
      !query || nombre.includes(query) || texto.includes(query) ? "" : "none";
  });
}

/* =========================================================
   MODAL: Desarrollo Académico
   ========================================================= */
function abrirModalDesarrolloAcademico() {
  cerrarModalTramites();
  var overlay = document.getElementById("desarrolloAcademicoModalOverlay");
  if (overlay) overlay.classList.add("active");
  seleccionarTabDA(
    "metodosMedios",
    document.querySelector(
      "#desarrolloAcademicoModalOverlay .rh-tab-btn:nth-child(2)",
    ),
  );
}
function cerrarModalDesarrolloAcademico(event) {
  var overlay = document.getElementById("desarrolloAcademicoModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}
function seleccionarTabDA(tabId, btn) {
  document
    .querySelectorAll("#desarrolloAcademicoModalOverlay .rh-panel-content")
    .forEach(function (p) {
      p.style.display = "none";
    });
  document
    .querySelectorAll("#desarrolloAcademicoModalOverlay .rh-tab-btn")
    .forEach(function (b) {
      b.classList.remove("rh-tab-active");
    });
  var panel = document.getElementById("daPanel-" + tabId);
  if (panel) panel.style.display = "";
  if (btn) btn.classList.add("rh-tab-active");
}

function abrirModalInvestigacionEducativa() {
  var overlay = document.getElementById("investigacionEducativaModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function cerrarModalInvestigacionEducativa(event) {
  var overlay = document.getElementById("investigacionEducativaModalOverlay");
  if (!overlay) return;
  if (!event || event.target === overlay) overlay.classList.remove("active");
}

// ============================================================
// SISTEMA DE NOTIFICACIONES — persistente, vinculado a Agenda
// ============================================================

var notifData = [];
var notifOpen = false;
var notifTimers = []; // IDs de setTimeout para recordatorios programados

// ---------- Persistencia ----------

function cargarNotificaciones() {
  try {
    var raw = localStorage.getItem("conocetec_notificaciones");
    notifData = raw ? JSON.parse(raw) : [];
  } catch (e) {
    notifData = [];
  }
}

function guardarNotificaciones() {
  try {
    localStorage.setItem("conocetec_notificaciones", JSON.stringify(notifData));
  } catch (e) {}
}

// ---------- Agregar notificación ----------

/**
 * tipo: 'agenda' | 'nota' | 'prioridad'
 * subTipo (opcional): 'dia_antes' | 'media_hora' — para alertas programadas
 */
function agregarNotificacion(tipo, titulo, texto, subTipo) {
  // Verificar preferencias del alumno
  try {
    var prefs = JSON.parse(localStorage.getItem("notif_prefs") || "{}");
    var tipoKey =
      tipo === "agenda"
        ? "agenda"
        : tipo === "nota"
          ? "notas"
          : "recordatorios";
    if (prefs[tipoKey] === false) return;
  } catch (e) {}

  cargarNotificaciones();

  var icons = {
    agenda: { icon: "fa-calendar-plus", bg: "#3b5bdb", label: "Agenda" },
    nota: { icon: "fa-sticky-note", bg: "#f59e0b", label: "Notas" },
    prioridad: { icon: "fa-check-circle", bg: "#2eaa62", label: "Prioridad" },
    dia_antes: { icon: "fa-calendar-day", bg: "#e67e22", label: "Agenda" },
    media_hora: { icon: "fa-bell", bg: "#e74c3c", label: "Agenda" },
  };

  var cfgTipo = subTipo
    ? icons[subTipo] || icons[tipo]
    : icons[tipo] || icons.agenda;

  notifData.unshift({
    id: Date.now(),
    tipo: tipo,
    subTipo: subTipo || null,
    icono: cfgTipo.icon,
    color: cfgTipo.bg,
    titulo: titulo,
    texto: texto,
    hora: new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fecha: new Date().toISOString(),
    leida: false,
  });

  if (notifData.length > 50) notifData = notifData.slice(0, 50);
  guardarNotificaciones();
  renderizarNotificaciones();
}

// ---------- Alertas programadas (1 día antes y 30 min antes) ----------

/**
 * Programa dos alertas para una actividad:
 *  1) Un día antes a la misma hora
 *  2) 30 minutos antes de la actividad
 */
function programarAlertasActividad(actividad) {
  if (!actividad || !actividad.dateStr || !actividad.startTime) return;

  var partes = actividad.startTime.split(":");
  var h = parseInt(partes[0]);
  var m = parseInt(partes[1]);

  // Fecha/hora exacta de la actividad
  var fechaActividad = new Date(
    actividad.dateStr + "T" + actividad.startTime + ":00",
  );
  if (isNaN(fechaActividad.getTime())) return;

  var ahora = Date.now();

  // --- Alerta 1: 1 día antes ---
  var unDiaAntes = new Date(fechaActividad.getTime() - 24 * 60 * 60 * 1000);
  var msHasta1Dia = unDiaAntes.getTime() - ahora;
  if (msHasta1Dia > 0) {
    var tid1 = setTimeout(function () {
      agregarNotificacion(
        "agenda",
        "📅 Mañana tienes una actividad",
        actividad.name +
          " — " +
          actividad.startTime +
          " (" +
          actividad.category +
          ")",
        "dia_antes",
      );
    }, msHasta1Dia);
    notifTimers.push(tid1);
    // Guardar referencia en localStorage para reactivar al recargar
    guardarAlertaPendiente(actividad.id, "dia_antes", unDiaAntes.getTime());
  }

  // --- Alerta 2: 30 minutos antes ---
  var mediaHoraAntes = new Date(fechaActividad.getTime() - 30 * 60 * 1000);
  var msHasta30min = mediaHoraAntes.getTime() - ahora;
  if (msHasta30min > 0) {
    var tid2 = setTimeout(function () {
      agregarNotificacion(
        "agenda",
        "⏰ En 30 minutos tienes: " + actividad.name,
        "Hoy a las " + actividad.startTime + " — " + actividad.category,
        "media_hora",
      );
    }, msHasta30min);
    notifTimers.push(tid2);
    guardarAlertaPendiente(
      actividad.id,
      "media_hora",
      mediaHoraAntes.getTime(),
    );
  }
}

// ---------- Persistencia de alertas programadas ----------

function guardarAlertaPendiente(actividadId, tipoAlerta, timestampMs) {
  try {
    var pendientes = JSON.parse(
      localStorage.getItem("conocetec_alertas_pendientes") || "[]",
    );
    // Evitar duplicados
    pendientes = pendientes.filter(function (p) {
      return !(p.actividadId === actividadId && p.tipoAlerta === tipoAlerta);
    });
    pendientes.push({
      actividadId: actividadId,
      tipoAlerta: tipoAlerta,
      timestampMs: timestampMs,
    });
    localStorage.setItem(
      "conocetec_alertas_pendientes",
      JSON.stringify(pendientes),
    );
  } catch (e) {}
}

function limpiarAlertaPendiente(actividadId) {
  try {
    var pendientes = JSON.parse(
      localStorage.getItem("conocetec_alertas_pendientes") || "[]",
    );
    pendientes = pendientes.filter(function (p) {
      return p.actividadId !== actividadId;
    });
    localStorage.setItem(
      "conocetec_alertas_pendientes",
      JSON.stringify(pendientes),
    );
  } catch (e) {}
}

/**
 * Al cargar la página, reactiva los timers de alertas que aún no han disparado
 */
function reactivarAlertasPendientes() {
  try {
    var pendientes = JSON.parse(
      localStorage.getItem("conocetec_alertas_pendientes") || "[]",
    );
    var actividades = JSON.parse(localStorage.getItem("agendaDatos") || "{}");
    var acts = actividades.activities || [];
    var ahora = Date.now();
    var vigentes = [];

    pendientes.forEach(function (p) {
      var msHasta = p.timestampMs - ahora;
      if (msHasta <= 0) return; // Ya pasó, descartar

      var act = acts.find(function (a) {
        return a.id === p.actividadId;
      });
      if (!act) return; // Actividad ya no existe

      vigentes.push(p);

      var tid = setTimeout(function () {
        if (p.tipoAlerta === "dia_antes") {
          agregarNotificacion(
            "agenda",
            "📅 Mañana tienes una actividad",
            act.name + " — " + act.startTime + " (" + act.category + ")",
            "dia_antes",
          );
        } else {
          agregarNotificacion(
            "agenda",
            "⏰ En 30 minutos tienes: " + act.name,
            "Hoy a las " + act.startTime + " — " + act.category,
            "media_hora",
          );
        }
      }, msHasta);
      notifTimers.push(tid);
    });

    // Guardar solo las vigentes
    localStorage.setItem(
      "conocetec_alertas_pendientes",
      JSON.stringify(vigentes),
    );
  } catch (e) {}
}

// ---------- Mapa tipo → sección ----------

var NOTIF_SECCION = {
  agenda: { seccion: "agenda", label: "Ir a Agenda" },
  nota: { seccion: "notas", label: "Ir a Notas" },
  prioridad: { seccion: "agenda", label: "Ir a Agenda" },
  dia_antes: { seccion: "agenda", label: "Ir a Agenda" },
  media_hora: { seccion: "agenda", label: "Ir a Agenda" },
};

// ---------- Renderizar panel ----------

function renderizarNotificaciones() {
  var list = document.getElementById("notifList");
  var badge = document.getElementById("notifBadge");
  if (!list || !badge) return;

  var noLeidas = notifData.filter(function (n) {
    return !n.leida;
  }).length;
  if (noLeidas > 0) {
    badge.textContent = noLeidas > 99 ? "99+" : noLeidas;
    badge.style.display = "flex";
    badge.style.alignItems = "center";
    badge.style.justifyContent = "center";
  } else {
    badge.style.display = "none";
  }

  if (notifData.length === 0) {
    list.innerHTML =
      '<div class="notif-empty"><i class="fas fa-bell-slash"></i><br>Sin notificaciones nuevas</div>';
    return;
  }

  list.innerHTML = notifData
    .map(function (n) {
      var cfgS = NOTIF_SECCION[n.subTipo || n.tipo] || NOTIF_SECCION.agenda;
      return (
        '<div class="notif-item' +
        (n.leida ? "" : " unread") +
        '" ' +
        'data-id="' +
        n.id +
        '" data-seccion="' +
        cfgS.seccion +
        '" ' +
        'title="' +
        cfgS.label +
        '" style="cursor:pointer;">' +
        '<div class="notif-item-icon" style="background:' +
        n.color +
        "22;color:" +
        n.color +
        ';">' +
        '<i class="fas ' +
        n.icono +
        '"></i>' +
        "</div>" +
        '<div class="notif-item-body">' +
        '<div class="notif-item-title">' +
        escHtml(n.titulo) +
        "</div>" +
        '<div class="notif-item-text">' +
        escHtml(n.texto) +
        "</div>" +
        '<div class="notif-item-time">' +
        '<i class="fas fa-clock" style="margin-right:4px;"></i>' +
        n.hora +
        '<span class="notif-item-link"><i class="fas fa-arrow-right"></i> ' +
        cfgS.label +
        "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  // Clic: marcar leída + navegar
  list.querySelectorAll(".notif-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var id = parseInt(this.dataset.id);
      var seccion = this.dataset.seccion;
      var n = notifData.find(function (x) {
        return x.id === id;
      });
      if (n) {
        n.leida = true;
        guardarNotificaciones();
        renderizarNotificaciones();
      }
      var panel = document.getElementById("notifDropdown");
      if (panel) panel.style.display = "none";
      notifOpen = false;
      if (seccion && typeof navigateTo === "function") navigateTo(seccion);
    });
  });
}

// ---------- Inicialización del panel ----------

function posicionarPanelNotif() {
  var btn = document.getElementById("notifIconBtn");
  var panel = document.getElementById("notifDropdown");
  if (!btn || !panel) return;
  var rect = btn.getBoundingClientRect();
  var panelW = 340;
  var left = rect.right - panelW;
  if (left < 8) left = 8;
  panel.style.top = rect.bottom + 8 + "px";
  panel.style.left = left + "px";
}

function inicializarPanelNotificaciones() {
  cargarNotificaciones();
  renderizarNotificaciones();
  reactivarAlertasPendientes();

  var btn = document.getElementById("notifIconBtn");
  var panel = document.getElementById("notifDropdown");
  var markAll = document.getElementById("notifMarkAll");

  if (!btn || !panel) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    notifOpen = !notifOpen;
    if (notifOpen) {
      posicionarPanelNotif();
      panel.style.display = "block";
      // pequeña animación
      panel.style.opacity = "0";
      panel.style.transform = "translateY(-8px)";
      panel.style.transition = "opacity .18s ease, transform .18s ease";
      requestAnimationFrame(function () {
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0)";
      });
    } else {
      panel.style.display = "none";
    }
  });

  if (markAll) {
    markAll.addEventListener("click", function (e) {
      e.stopPropagation();
      cargarNotificaciones();
      notifData.forEach(function (n) {
        n.leida = true;
      });
      guardarNotificaciones();
      renderizarNotificaciones();
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!panel || !notifOpen) return;
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      notifOpen = false;
      panel.style.display = "none";
    }
  });

  // Reposicionar si cambia el tamaño de ventana
  window.addEventListener("resize", function () {
    if (notifOpen) posicionarPanelNotif();
  });
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Exponer para script-agenda.js
window.agregarNotificacion = agregarNotificacion;
window.programarAlertasActividad = programarAlertasActividad;
window.limpiarAlertaPendiente = limpiarAlertaPendiente;

// ============================================================
// FOTO DE CONTACTO EN DIRECTORIO
// ============================================================

function inicializarFotoContacto() {
  var input = document.getElementById("dirPhotoInput");
  if (!input) return;
  input.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = document.getElementById("dirContactPhoto");
      var svg = document.getElementById("dirContactSilhouette");
      img.src = ev.target.result;
      img.style.display = "block";
      svg.style.display = "none";
      // Guardar foto en el contacto actual si existe
      if (typeof dirContactoActual !== "undefined" && dirContactoActual) {
        dirContactoActual.foto = ev.target.result;
        if (typeof guardarDirectorio === "function") guardarDirectorio();
      }
    };
    reader.readAsDataURL(file);
  });
}

// Sobrescribir rellenarModal para mostrar foto guardada y botón upload según modo
var _rellenarModalOrig =
  typeof rellenarModal === "function" ? rellenarModal : null;

function rellenarModalConFoto(c, edicion) {
  // Llamar al original
  if (_rellenarModalOrig) _rellenarModalOrig(c, edicion);
  // Mostrar foto si existe
  var img = document.getElementById("dirContactPhoto");
  var svg = document.getElementById("dirContactSilhouette");
  var uploadLabel = document.getElementById("dirPhotoUploadLabel");
  var photoInput = document.getElementById("dirPhotoInput");
  if (!img || !svg) return;
  if (c && c.foto) {
    img.src = c.foto;
    img.style.display = "block";
    svg.style.display = "none";
  } else {
    img.src = "";
    img.style.display = "none";
    svg.style.display = "block";
  }
  // Mostrar botón de cámara solo en modo edición
  if (uploadLabel) uploadLabel.style.display = edicion ? "flex" : "none";
  // Limpiar input de archivo
  if (photoInput) photoInput.value = "";
}

// Sobrescribir mostrarModoEdicion para también controlar el botón de cámara
var _mostrarModoEdicionOrig =
  typeof mostrarModoEdicion === "function" ? mostrarModoEdicion : null;

function mostrarModoEdicionConFoto(editar) {
  if (_mostrarModoEdicionOrig) _mostrarModoEdicionOrig(editar);
  var uploadLabel = document.getElementById("dirPhotoUploadLabel");
  if (uploadLabel) uploadLabel.style.display = editar ? "flex" : "none";
}

// Patch: reemplazar funciones globales al cargar
document.addEventListener("DOMContentLoaded", function () {
  inicializarFotoContacto();
  // Reemplazar rellenarModal y mostrarModoEdicion si existen
  if (typeof rellenarModal === "function") {
    _rellenarModalOrig = rellenarModal;
    window.rellenarModal = rellenarModalConFoto;
  }
  if (typeof mostrarModoEdicion === "function") {
    _mostrarModoEdicionOrig = mostrarModoEdicion;
    window.mostrarModoEdicion = mostrarModoEdicionConFoto;
  }
});

// ============================================================
// SISTEMA DE ROLES Y PERMISOS — CONOCE-TEC
// ============================================================
//
// Roles disponibles (guardados en sessionStorage.rolUsuario):
//
//  'visitante' → Solo lectura: Mapa y Servicios únicamente.
//                No ve secciones de Agenda, Notas, Directorio.
//                (El dashboard-visitante.html maneja esto por separado.)
//
//  'alumno'    → Acceso personal:
//                · Agenda: crear/editar/eliminar SUS actividades ✓
//                · Notas: CRUD completo de SUS notas ✓
//                · Directorio: ver institucional (solo lectura) + agregar contactos propios ✓
//                · Servicios: solo lectura, descargas y links ✓
//                · Mapa: uso completo ✓
//                · Perfil: modificar sus preferencias ✓
//                · NO puede editar/eliminar contactos institucionales ✗
//
//  'admin'     → Acceso total:
//                · Todo lo del alumno ✓
//                · Editar y eliminar contactos institucionales ✓
//                · Acceso al panel de cafetería admin ✓
//                · Badge visual "Admin" en la cabecera ✓
//
// ============================================================

/**
 * Obtiene el rol actual de la sesión.
 * @returns {'alumno'|'admin'|'visitante'}
 */
function obtenerRol() {
  return sessionStorage.getItem("rolUsuario") || "alumno";
}

/**
 * Aplica los permisos visuales según el rol.
 * Se llama al inicio del DOMContentLoaded principal.
 */
function aplicarPermisosPorRol() {
  var rol = obtenerRol();

  // ---- Mostrar rol en el header ----
  var userRoleEl = document.getElementById("userRole");
  if (userRoleEl) {
    if (rol === "admin") {
      userRoleEl.textContent = "Administrador";
      userRoleEl.style.color = "#f5c518";
      userRoleEl.style.fontWeight = "700";
    } else {
      userRoleEl.textContent = "Alumno";
    }
  }

  // ---- Badge Admin en header ----
  if (rol === "admin") {
    var userName = document.getElementById("userName");
    if (userName && !document.getElementById("adminBadgeHeader")) {
      var badge = document.createElement("span");
      badge.id = "adminBadgeHeader";
      badge.style.cssText =
        "display:inline-block;background:#f5c518;color:#1a2340;font-size:.65rem;font-weight:800;border-radius:6px;padding:1px 6px;margin-left:6px;vertical-align:middle;letter-spacing:.03em;";
      badge.textContent = "ADMIN";
      userName.parentNode.insertBefore(badge, userName.nextSibling);
    }
  }

  // ---- Restricciones de DIRECTORIO para alumno ----
  if (rol === "alumno") {
    // Ocultar botones Editar y Eliminar en el modal de contacto
    // Se controla en rellenarModal / rellenarModalConFoto vía esInstitucional
    // (ver función aplicarRestriccionesDirModal más abajo)
    // El botón "Nuevo contacto" permanece visible — alumnos pueden agregar propios
  }

  // ---- Mostrar/Ocultar botón 'Acceso encargado' según el rol ----
  var btnEncargado = document.getElementById("btnAccesoEncargado") || document.getElementById("btnAccesoEncargadoV");
  if (btnEncargado) {
    // Solo mostrar si el rol es 'admin' o 'cafeteria'
    if (rol === "admin" || rol === "cafeteria") {
      btnEncargado.style.display = "inline-flex";
    } else {
      btnEncargado.style.display = "none";
    }
  }

  // ---- REQ-04/05: Mostrar/Ocultar controles de SUBIDA según rol ----
  document.querySelectorAll(".caf-admin-only").forEach(function(el) {
    el.style.setProperty("display", rol === "admin" ? "" : "none", "important");
  });

  console.log("[CONOCE-TEC] Rol aplicado:", rol);
}

/**
 * Aplica restricciones en el modal de directorio según si el contacto
 * es institucional y el rol del usuario.
 * Llamada desde rellenarModal (y rellenarModalConFoto).
 * @param {object} contacto
 */
function aplicarRestriccionesDirModal(contacto) {
  var rol = obtenerRol();
  var esInst = contacto && contacto.esInstitucional === true;
  var editBtn = document.getElementById("dirModalEditBtn");
  var deleteBtn = document.getElementById("dirModalDeleteBtn");

  if (!editBtn || !deleteBtn) return;

  if (rol === "admin") {
    // Admin: siempre puede editar y eliminar
    editBtn.style.display = "";
    deleteBtn.style.display = "";
    editBtn.title = "Editar contacto";
    deleteBtn.title = "Eliminar contacto";
  } else if (rol === "alumno" && esInst) {
    // Alumno ve contacto institucional → solo lectura
    editBtn.style.display = "none";
    deleteBtn.style.display = "none";
  } else {
    // Alumno ve su propio contacto → puede editar/eliminar
    editBtn.style.display = "";
    deleteBtn.style.display = "";
  }
}

/**
 * Indica si el usuario actual puede editar el directorio institucional.
 */
function puedeEditarDirectorioInstitucional() {
  return obtenerRol() === "admin";
}

// ---- Parche sobre rellenarModal para inyectar la restricción de roles ----
document.addEventListener("DOMContentLoaded", function () {
  // Esperar a que rellenarModal esté definido (se define antes en este mismo archivo)
  var _orig = window.rellenarModal || rellenarModal;
  window.rellenarModal = function (c, edicion) {
    _orig(c, edicion);
    // Después de renderizar el modal, aplicar restricciones de rol
    aplicarRestriccionesDirModal(c);
  };
});

// Exponer para uso externo
window.obtenerRol = obtenerRol;
window.aplicarPermisosPorRol = aplicarPermisosPorRol;
window.aplicarRestriccionesDirModal = aplicarRestriccionesDirModal;
window.puedeEditarDirectorioInstitucional = puedeEditarDirectorioInstitucional;
