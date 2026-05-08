// ========================================
// AGENDA v3 - SISTEMA COMPLETO FUNCIONAL
// ========================================

// ---- Fecha real del sistema ----
let today = new Date();
today.setHours(0, 0, 0, 0);

let currentDate = new Date(today);
let selectedDate = new Date(today);
let currentView = "semanal"; // semanal | mensual | dia
let mvDate = new Date(today);
let dvDate = new Date(today);
let anualYear = today.getFullYear();

let priorities = [];
let stickyNote = "";
let activities = [];
let draggedElement = null;

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTH_NAMES_LC = [
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
const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const FECHAS_PRESET = [
  {
    date: "01-01",
    emoji: "🎆",
    name: "Año Nuevo",
    desc: "Inicio del nuevo año calendario.",
    type: "nacional",
  },
  {
    date: "06-01",
    emoji: "🎁",
    name: "Día de Reyes",
    desc: "Tradición de recibir regalos de los Reyes Magos.",
    type: "especial",
  },
  {
    date: "05-02",
    emoji: "🇲🇽",
    name: "Día de la Constitución",
    desc: "Promulgación de la Constitución de 1917.",
    type: "nacional",
  },
  {
    date: "14-02",
    emoji: "❤️",
    name: "Día del Amor y la Amistad",
    desc: "Celebración de las relaciones afectivas.",
    type: "especial",
  },
  {
    date: "21-03",
    emoji: "🌸",
    name: "Natalicio de Benito Juárez",
    desc: "Aniversario del nacimiento del Benemérito de las Américas.",
    type: "nacional",
  },
  {
    date: "23-03",
    emoji: "📚",
    name: "Inicio del 2.° Semestre",
    desc: "Arranque oficial del segundo semestre escolar 2025-2026.",
    type: "escolar",
  },
  {
    date: "01-05",
    emoji: "⚒️",
    name: "Día del Trabajo",
    desc: "Día Internacional del Trabajo.",
    type: "nacional",
  },
  {
    date: "05-05",
    emoji: "🥁",
    name: "Batalla de Puebla",
    desc: "Aniversario de la Batalla de Puebla de 1862.",
    type: "nacional",
  },
  {
    date: "10-05",
    emoji: "🌹",
    name: "Día de las Madres",
    desc: "Celebración a todas las madres mexicanas.",
    type: "especial",
  },
  {
    date: "15-05",
    emoji: "🍎",
    name: "Día del Maestro",
    desc: "Reconocimiento a la labor docente.",
    type: "escolar",
  },
  {
    date: "30-04",
    emoji: "🧒",
    name: "Día del Niño",
    desc: "Celebración del Día del Niño en México.",
    type: "especial",
  },
  {
    date: "15-09",
    emoji: "🎉",
    name: "Grito de Independencia",
    desc: "Ceremonia del Grito de Independencia, noche del 15.",
    type: "nacional",
  },
  {
    date: "16-09",
    emoji: "🇲🇽",
    name: "Día de la Independencia",
    desc: "Aniversario de la Independencia de México.",
    type: "nacional",
  },
  {
    date: "12-10",
    emoji: "🌎",
    name: "Día de la Raza",
    desc: "Conmemoración del encuentro de dos mundos.",
    type: "nacional",
  },
  {
    date: "02-11",
    emoji: "💀",
    name: "Día de Muertos",
    desc: "Ofrenda y recuerdo a los seres queridos fallecidos.",
    type: "especial",
  },
  {
    date: "20-11",
    emoji: "🐴",
    name: "Revolución Mexicana",
    desc: "Aniversario del inicio de la Revolución Mexicana.",
    type: "nacional",
  },
  {
    date: "12-12",
    emoji: "🙏",
    name: "Virgen de Guadalupe",
    desc: "Celebración a la patrona de México.",
    type: "especial",
  },
  {
    date: "25-12",
    emoji: "🎄",
    name: "Navidad",
    desc: "Celebración de la Navidad.",
    type: "nacional",
  },
  {
    date: "31-12",
    emoji: "🎊",
    name: "Fin de Año",
    desc: "Último día del año, celebración de Nochevieja.",
    type: "nacional",
  },
  {
    date: "01-08",
    emoji: "🏫",
    name: "Inicio de clases",
    desc: "Inicio del ciclo escolar 2026-2027 (estimado).",
    type: "escolar",
  },
];

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ── 1. Fijar fechas al día de hoy de forma SÍNCRONA ──────────────────
  today = new Date();
  today.setHours(0, 0, 0, 0);
  currentDate = new Date(today);
  selectedDate = new Date(today);
  mvDate = new Date(today.getFullYear(), today.getMonth(), 1);
  dvDate = new Date(today);
  anualYear = today.getFullYear();

  // ── 2. Inicializar UI con las fechas ya correctas ─────────────────────
  inicializarCalendario();
  inicializarPrioridades();
  inicializarNotaSticky();
  inicializarActividades();
  inicializarVistas();
  inicializarBotonesBarra();
  inicializarCalendarioAnual();
  inicializarFechasImportantes();

  actualizarCalendario();
  actualizarSemanaAnterior();
  actualizarSemanaActual(); // ← ya muestra la semana correcta de hoy
  actualizarBotonHoy();

  // ── 3. Cargar datos de la BD en segundo plano y re-renderizar ─────────
  await cargarDatos();

  actualizarListaPrioridades();
  actualizarNotaSticky();
  actualizarActividades();
  actualizarSemanaAnterior();
  renderizarVistaActiva();

  programarActualizacionDiaria();
});

// ========================================
// ACTUALIZACIÓN DIARIA
// ========================================

function programarActualizacionDiaria() {
  const now = new Date();
  const manana = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const ms = manana - now;
  setTimeout(function () {
    today = new Date();
    today.setHours(0, 0, 0, 0);
    currentDate = new Date(today);
    selectedDate = new Date(today);
    mvDate = new Date(today);
    dvDate = new Date(today);
    anualYear = today.getFullYear();
    guardarDatos();
    actualizarCalendario();
    actualizarSemanaAnterior();
    actualizarSemanaActual();
    renderizarVistaActiva();
    actualizarCalendarioAnual();
    programarActualizacionDiaria();
  }, ms);
}

// ========================================
// CALENDARIO MINI
// ========================================

function inicializarCalendario() {
  var btnPrevMonth = document.getElementById("ag2PrevMonth");
  var btnNextMonth = document.getElementById("ag2NextMonth");
  var btnToday = document.querySelector(".ag2-today-btn");
  if (btnPrevMonth)
    btnPrevMonth.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() - 1);
      actualizarCalendario();
    });
  if (btnNextMonth)
    btnNextMonth.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() + 1);
      actualizarCalendario();
    });
  if (btnToday)
    btnToday.addEventListener("click", function () {
      currentDate = new Date(today);
      selectedDate = new Date(today);
      dvDate = new Date(today);
      mvDate = new Date(today.getFullYear(), today.getMonth(), 1);
      actualizarCalendario();
      actualizarSemanaActual();
      renderizarVistaActiva();
    });
  actualizarBotonHoy();
}

function actualizarCalendario() {
  var monthTitle = document.querySelector(".ag2-month-title h2");
  var yearSpan = document.querySelector(".ag2-month-title span");
  if (monthTitle) monthTitle.textContent = MONTH_NAMES[currentDate.getMonth()];
  if (yearSpan) yearSpan.textContent = currentDate.getFullYear();

  var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  var lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  var daysInMonth = lastDay.getDate();
  var startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  var calGrid = document.querySelector(".ag2-cal-grid");
  if (!calGrid) return;

  calGrid.querySelectorAll(".ag2-cal-day").forEach(function (d) {
    d.remove();
  });

  for (var i = 0; i < startDow; i++) {
    var e = document.createElement("div");
    e.className = "ag2-cal-day ag2-other";
    calGrid.appendChild(e);
  }
  for (var day = 1; day <= daysInMonth; day++) {
    (function (d) {
      var el = document.createElement("div");
      el.className = "ag2-cal-day";
      el.textContent = d;
      var dow = (startDow + d - 1) % 7;
      if (dow === 5 || dow === 6) el.classList.add("ag2-weekend");

      // Marcar fechas importantes en el mini calendario
      var dateStr =
        String(d).padStart(2, "0") +
        "-" +
        String(currentDate.getMonth() + 1).padStart(2, "0");
      var fechaImp = FECHAS_PRESET.find(function (f) {
        return f.date === dateStr;
      });
      if (fechaImp) {
        el.classList.add("ag2-has-event");
        el.style.borderBottom = "2px solid #ef4444";
        el.title = fechaImp.emoji + " " + fechaImp.name;
      }

      if (
        d === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      )
        el.classList.add("ag2-highlight");
      if (
        d === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear()
      )
        el.classList.add("ag2-selected");
      el.addEventListener("click", function () {
        selectedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          d,
        );
        dvDate = new Date(selectedDate);

        // Actualizar selección visualmente sin reconstruir el grid completo
        calGrid.querySelectorAll(".ag2-cal-day.ag2-selected").forEach(function(prev) {
          prev.classList.remove("ag2-selected");
        });
        el.classList.add("ag2-selected");

        // Si es una fecha importante, mostrar aviso
        if (fechaImp) {
          alert(fechaImp.emoji + " " + fechaImp.name + ": " + fechaImp.desc);
        }

        actualizarSemanaActual();
        actualizarSemanaAnterior();
        renderizarVistaActiva();
      });
      calGrid.appendChild(el);
    })(day);
  }
  var headerCount = calGrid.querySelectorAll(".ag2-cal-header").length;
  var total = headerCount + startDow + daysInMonth;
  var remain = Math.ceil(total / 7) * 7 - total;
  for (var j = 0; j < remain; j++) {
    var e2 = document.createElement("div");
    e2.className = "ag2-cal-day ag2-other";
    calGrid.appendChild(e2);
  }
}

function configurarEventosCalendario() {}

// ---- Botón Hoy con fecha real ----
function actualizarBotonHoy() {
  var btn = document.querySelector(".ag2-today-btn");
  if (!btn) return;
  btn.textContent =
    "Hoy " + today.getDate() + " " + MONTH_NAMES_LC[today.getMonth()];
}

// ---- Título del tab de semana actual ----
function actualizarTabLabel() {
  var tabBtn = document.getElementById("ag2TabAgendaLabel");
  if (!tabBtn) return;
  tabBtn.textContent = "Semana actual";
}

// ---- Actualizar botón Hoy con fecha real ----
function actualizarBotonHoy() {
  var btn = document.querySelector(".ag2-today-btn");
  if (!btn) return;
  btn.textContent =
    "Hoy " + today.getDate() + " " + MONTH_NAMES_LC[today.getMonth()];
}

// ---- Renderizar todo (usado por guardarDatos) ----
function renderAll() {
  actualizarCalendario();
  actualizarSemanaActual();
  actualizarSemanaAnterior();
  renderizarVistaActiva();
}

// ========================================
// SELECTOR DE VISTA
// ========================================

function inicializarVistas() {
  var wrap = document.getElementById("ag2ViewSelectWrap");
  var dropdown = document.getElementById("ag2ViewDropdown");
  if (!wrap || !dropdown) return;

  wrap.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });
  dropdown.querySelectorAll(".ag2-view-option").forEach(function (opt) {
    opt.addEventListener("click", function (e) {
      e.stopPropagation();
      cambiarVista(this.dataset.view);
      dropdown.classList.remove("open");
    });
  });
  document.addEventListener("click", function () {
    dropdown.classList.remove("open");
  });

  var dvPrev = document.getElementById("ag2DvPrev");
  var dvNext = document.getElementById("ag2DvNext");
  if (dvPrev)
    dvPrev.addEventListener("click", function () {
      dvDate.setDate(dvDate.getDate() - 1);
      selectedDate = new Date(dvDate);
      actualizarCalendario();
      renderizarVistaDia();
    });
  if (dvNext)
    dvNext.addEventListener("click", function () {
      dvDate.setDate(dvDate.getDate() + 1);
      selectedDate = new Date(dvDate);
      actualizarCalendario();
      renderizarVistaDia();
    });

  var mvPrev = document.getElementById("ag2MvPrev");
  var mvNext = document.getElementById("ag2MvNext");
  if (mvPrev)
    mvPrev.addEventListener("click", function () {
      mvDate.setMonth(mvDate.getMonth() - 1);
      renderizarVistaMensual();
    });
  if (mvNext)
    mvNext.addEventListener("click", function () {
      mvDate.setMonth(mvDate.getMonth() + 1);
      renderizarVistaMensual();
    });

  cambiarVista("semanal");
}

function cambiarVista(view) {
  currentView = view;
  var label = document.getElementById("ag2ViewLabel");
  var weekly = document.querySelector(".ag2-schedule-wrap");
  var monthly = document.getElementById("ag2MonthlyView");
  var dayView = document.getElementById("ag2DayView");
  var title = document.getElementById("ag2WeeklyTitle");

  document.querySelectorAll(".ag2-view-option").forEach(function (o) {
    o.classList.toggle("active", o.dataset.view === view);
  });

  if (view === "semanal") {
    if (label) label.textContent = "Vista semanal";
    if (weekly) weekly.style.display = "";
    if (monthly) monthly.style.display = "none";
    if (dayView) dayView.style.display = "none";
    if (title) title.textContent = "Semana actual";
    actualizarSemanaActual();
  } else if (view === "mensual") {
    if (label) label.textContent = "Vista mensual";
    if (weekly) weekly.style.display = "none";
    if (monthly) monthly.style.display = "flex";
    if (dayView) dayView.style.display = "none";
    if (title) title.textContent = "Vista mensual";
    mvDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    renderizarVistaMensual();
  } else if (view === "dia") {
    if (label) label.textContent = "1 día";
    if (weekly) weekly.style.display = "none";
    if (monthly) monthly.style.display = "none";
    if (dayView) dayView.style.display = "flex";
    if (title) title.textContent = "Vista de 1 día";
    dvDate = new Date(selectedDate);
    renderizarVistaDia();
  }
}

function renderizarVistaActiva() {
  if (currentView === "semanal") actualizarSemanaActual();
  else if (currentView === "mensual") renderizarVistaMensual();
  else if (currentView === "dia") renderizarVistaDia();
}

// ---- Vista Mensual ----
function renderizarVistaMensual() {
  var grid = document.getElementById("ag2MvGrid");
  var title = document.getElementById("ag2MvTitle");
  var bigTitle = document.getElementById("ag2MvBigTitle");
  if (!grid || !title) return;
  var titleStr = MONTH_NAMES[mvDate.getMonth()] + " " + mvDate.getFullYear();
  title.textContent = titleStr;
  if (bigTitle) bigTitle.textContent = titleStr;

  var headers = Array.from(grid.querySelectorAll(".ag2-mv-hdr"));
  grid.innerHTML = "";
  headers.forEach(function (h) {
    grid.appendChild(h);
  });

  var firstDay = new Date(mvDate.getFullYear(), mvDate.getMonth(), 1);
  var lastDay = new Date(mvDate.getFullYear(), mvDate.getMonth() + 1, 0);
  var daysInMonth = lastDay.getDate();
  var startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  var allFechas = FECHAS_PRESET.concat(getFechasUsuario());

  for (var i = 0; i < startDow; i++) {
    var d = document.createElement("div");
    d.className = "ag2-mv-day ag2-mv-other";
    grid.appendChild(d);
  }

  for (var day = 1; day <= daysInMonth; day++) {
    (function (d) {
      var cell = document.createElement("div");
      cell.className = "ag2-mv-day";
      var isToday =
        d === today.getDate() &&
        mvDate.getMonth() === today.getMonth() &&
        mvDate.getFullYear() === today.getFullYear();
      var isSel =
        d === selectedDate.getDate() &&
        mvDate.getMonth() === selectedDate.getMonth() &&
        mvDate.getFullYear() === selectedDate.getFullYear();
      if (isToday) cell.classList.add("ag2-mv-today");
      if (isSel) cell.classList.add("ag2-mv-selected");

      var numWrap = document.createElement("div");
      numWrap.className = "ag2-mv-day-top";
      var num = document.createElement("span");
      num.className = "ag2-mv-day-num";
      num.textContent = d;
      numWrap.appendChild(num);

      // Fecha importante indicator
      var fKey =
        String(d).padStart(2, "0") +
        "-" +
        String(mvDate.getMonth() + 1).padStart(2, "0");
      var fi = allFechas.find(function (f) {
        return f.date === fKey;
      });
      if (fi) {
        var fiDot = document.createElement("span");
        fiDot.className = "ag2-mv-fi-dot";
        fiDot.title = fi.emoji + " " + fi.name;
        numWrap.appendChild(fiDot);
      }
      cell.appendChild(numWrap);

      var dateStr =
        mvDate.getFullYear() +
        "-" +
        String(mvDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d).padStart(2, "0");
      activities
        .filter(function (a) {
          return a.dateStr === dateStr;
        })
        .slice(0, 2)
        .forEach(function (ev) {
          var dot = document.createElement("span");
          dot.className = "ag2-mv-evt-dot";
          dot.style.background = colorForCategory(ev.category);
          dot.textContent = ev.name;
          cell.appendChild(dot);
        });
      cell.addEventListener("click", function () {
        selectedDate = new Date(mvDate.getFullYear(), mvDate.getMonth(), d);
        dvDate = new Date(selectedDate);
        renderizarVistaMensual();
        actualizarCalendario();
        actualizarSemanaActual(); // ← actualiza la semana semanal con la fecha elegida
        actualizarSemanaAnterior(); // ← y la semana anterior relativa a ella
      });
      grid.appendChild(cell);
    })(day);
  }
  var tc = 7 + startDow + daysInMonth;
  var re = Math.ceil(tc / 7) * 7 - tc;
  for (var j = 0; j < re; j++) {
    var e = document.createElement("div");
    e.className = "ag2-mv-day ag2-mv-other";
    grid.appendChild(e);
  }
}

// ---- Vista 1 Día ----
// Ilustraciones SVG únicas por día (0=Dom,1=Lun,...,6=Sáb)
var DV_ILLUSTRATIONS = [
  // Domingo - sol con nubes (igual al de la imagen)
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="skyg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></radialGradient></defs><ellipse cx="100" cy="70" rx="100" ry="70" fill="url(#skyg)" opacity="0.5"/><circle cx="100" cy="62" r="28" fill="#fde68a"/><circle cx="100" cy="62" r="22" fill="#fbbf24"/><circle cx="93" cy="57" r="4" fill="#92400e" opacity="0.7"/><circle cx="107" cy="57" r="4" fill="#92400e" opacity="0.7"/><path d="M93 68 Q100 74 107 68" stroke="#92400e" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="93" cy="66" r="2.5" fill="#fca5a5"/><circle cx="107" cy="66" r="2.5" fill="#fca5a5"/><ellipse cx="68" cy="80" rx="22" ry="13" fill="white" opacity="0.9"/><ellipse cx="82" cy="74" rx="18" ry="12" fill="white" opacity="0.9"/><ellipse cx="60" cy="82" rx="15" ry="10" fill="white" opacity="0.85"/><ellipse cx="138" cy="82" rx="20" ry="12" fill="white" opacity="0.9"/><ellipse cx="125" cy="76" rx="16" ry="11" fill="white" opacity="0.85"/><polygon points="86,52 88,46 90,52" fill="#fde68a" opacity="0.8"/><polygon points="114,52 112,46 110,52" fill="#fde68a" opacity="0.8"/><polygon points="76,60 70,58 76,64" fill="#fde68a" opacity="0.8"/><polygon points="124,60 130,58 124,64" fill="#fde68a" opacity="0.8"/><text x="100" y="122" text-anchor="middle" font-size="11" fill="#93c5fd">✦</text><text x="148" y="48" text-anchor="middle" font-size="9" fill="#fde68a">✦</text><text x="55" y="45" text-anchor="middle" font-size="8" fill="#bfdbfe">✦</text></svg>',
  // Lunes - libro y café
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="55" width="70" height="55" rx="4" fill="#dbeafe"/><rect x="43" y="55" width="5" height="55" fill="#3b82f6"/><rect x="48" y="60" width="55" height="7" rx="2" fill="#93c5fd"/><rect x="48" y="72" width="45" height="5" rx="2" fill="#bfdbfe"/><rect x="48" y="82" width="50" height="5" rx="2" fill="#bfdbfe"/><rect x="48" y="92" width="38" height="5" rx="2" fill="#bfdbfe"/><ellipse cx="148" cy="88" rx="18" ry="6" fill="#d1d5db"/><rect x="133" y="62" width="30" height="26" rx="4" fill="#f3f4f6"/><rect x="133" y="62" width="30" height="6" rx="3" fill="#e5e7eb"/><path d="M148 68 Q155 72 152 80 Q149 85 148 88" stroke="#6b7280" stroke-width="2" fill="none"/><circle cx="148" cy="65" r="3" fill="#9ca3af"/><text x="100" y="128" text-anchor="middle" font-size="22">📚</text></svg>',
  // Martes - cohete
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><path d="M100 20 Q115 40 115 75 L100 85 L85 75 Q85 40 100 20Z" fill="#6366f1"/><path d="M100 20 Q108 40 108 75 L100 85 L92 75 Q92 40 100 20Z" fill="#818cf8"/><ellipse cx="100" cy="52" rx="8" ry="8" fill="#bae6fd"/><path d="M85 75 L72 95 L85 88Z" fill="#ef4444"/><path d="M115 75 L128 95 L115 88Z" fill="#ef4444"/><path d="M92 85 L96 105 L100 98 L104 105 L108 85Z" fill="#f97316" opacity="0.8"/><path d="M95 98 L100 118 L105 98Z" fill="#fde68a" opacity="0.7"/><circle cx="60" cy="40" r="5" fill="#fde68a" opacity="0.6"/><circle cx="150" cy="30" r="4" fill="#fde68a" opacity="0.5"/><circle cx="145" cy="70" r="3" fill="#fde68a" opacity="0.4"/><circle cx="55" cy="80" r="3" fill="#fde68a" opacity="0.4"/></svg>',
  // Miércoles - montaña / naturaleza
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="85" width="200" height="55" fill="#bbf7d0" rx="0"/><polygon points="30,85 80,30 130,85" fill="#4ade80"/><polygon points="70,85 115,40 160,85" fill="#22c55e"/><polygon points="100,85 135,55 170,85" fill="#86efac"/><circle cx="160" cy="28" r="18" fill="#fde68a"/><circle cx="152" cy="22" r="18" fill="#dbeafe"/><circle cx="50" cy="60" r="10" fill="white" opacity="0.7"/><circle cx="65" cy="55" r="12" fill="white" opacity="0.7"/><circle cx="42" cy="63" r="8" fill="white" opacity="0.6"/></svg>',
  // Jueves - estrella / logro
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><polygon points="100,18 108,42 134,42 114,57 121,81 100,66 79,81 86,57 66,42 92,42" fill="#fbbf24"/><polygon points="100,28 106,44 124,44 110,54 115,71 100,60 85,71 90,54 76,44 94,44" fill="#fde68a"/><circle cx="100" cy="52" r="8" fill="#f59e0b"/><circle cx="50" cy="35" r="5" fill="#fde68a" opacity="0.5"/><circle cx="155" cy="25" r="4" fill="#fde68a" opacity="0.6"/><circle cx="165" cy="75" r="6" fill="#fde68a" opacity="0.4"/><circle cx="38" cy="85" r="4" fill="#fde68a" opacity="0.4"/><text x="100" y="115" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">¡Tú puedes!</text></svg>',
  // Viernes - fiesta / globos
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="50" rx="16" ry="20" fill="#f87171"/><line x1="80" y1="70" x2="75" y2="105" stroke="#f87171" stroke-width="1.5"/><ellipse cx="115" cy="42" rx="14" ry="18" fill="#60a5fa"/><line x1="115" y1="60" x2="120" y2="105" stroke="#60a5fa" stroke-width="1.5"/><ellipse cx="148" cy="55" rx="13" ry="17" fill="#34d399"/><line x1="148" y1="72" x2="145" y2="105" stroke="#34d399" stroke-width="1.5"/><ellipse cx="52" cy="62" rx="12" ry="15" fill="#a78bfa"/><line x1="52" y1="77" x2="55" y2="105" stroke="#a78bfa" stroke-width="1.5"/><path d="M30 105 Q100 90 170 105" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-dasharray="5,4"/><text x="100" y="125" text-anchor="middle" font-size="18">🎉</text></svg>',
  // Sábado - luna y estrellas
  '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="140" fill="#1e1b4b" rx="12"/><path d="M110 30 Q90 45 90 65 Q90 90 110 100 Q80 100 68 80 Q55 58 68 40 Q82 22 110 30Z" fill="#fde68a"/><circle cx="55" cy="30" r="2" fill="white" opacity="0.8"/><circle cx="155" cy="20" r="2.5" fill="white" opacity="0.9"/><circle cx="170" cy="55" r="1.5" fill="white" opacity="0.7"/><circle cx="140" cy="85" r="2" fill="white" opacity="0.6"/><circle cx="30" cy="75" r="1.5" fill="white" opacity="0.7"/><circle cx="165" cy="110" r="1.5" fill="white" opacity="0.6"/><circle cx="90" cy="115" r="1" fill="white" opacity="0.5"/><text x="155" y="40" text-anchor="middle" font-size="12" fill="#fde68a">★</text><text x="40" y="50" text-anchor="middle" font-size="10" fill="#fde68a">★</text><text x="130" y="105" text-anchor="middle" font-size="8" fill="#fde68a">★</text></svg>',
];

function renderizarVistaDia() {
  var titleEl = document.getElementById("ag2DvTitle");
  var body = document.getElementById("ag2DvBody");
  var cardNum = document.getElementById("ag2DvCardNum");
  var cardDay = document.getElementById("ag2DvCardDayname");
  var cardMY = document.getElementById("ag2DvCardMonthYear");
  if (!body) return;

  var dayName = DAY_NAMES[(dvDate.getDay() + 6) % 7];
  var dateLabel =
    String(dvDate.getDate()).padStart(2, "0") +
    " de " +
    MONTH_NAMES_LC[dvDate.getMonth()] +
    " de " +
    dvDate.getFullYear();

  if (titleEl) titleEl.textContent = dateLabel;
  if (cardNum) cardNum.textContent = dvDate.getDate();
  if (cardDay) cardDay.textContent = dayName;
  if (cardMY)
    cardMY.textContent =
      MONTH_NAMES[dvDate.getMonth()] + " " + dvDate.getFullYear();

  var dateStr =
    dvDate.getFullYear() +
    "-" +
    String(dvDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dvDate.getDate()).padStart(2, "0");
  var evts = activities
    .filter(function (a) {
      return a.dateStr === dateStr;
    })
    .sort(function (a, b) {
      return a.startTime.localeCompare(b.startTime);
    });

  body.innerHTML = "";
  body.style.borderTop = "1px solid #e5e7eb";
  body.style.marginTop = "12px";

  if (evts.length === 0) {
    var illIdx = dvDate.getDay(); // 0=dom
    var ill = DV_ILLUSTRATIONS[illIdx];
    body.innerHTML =
      '<div class="ag2-dv-empty">' +
      '<div class="ag2-dv-ill">' +
      ill +
      "</div>" +
      '<div class="ag2-dv-empty-title">Día sin actividades</div>' +
      '<p class="ag2-dv-empty-sub">No hay actividades programadas para este día.</p>' +
      "</div>";
    return;
  }

  for (var h = 7; h <= 21; h++) {
    (function (hour) {
      var hourEvts = evts.filter(function (e) {
        return parseInt(e.startTime.split(":")[0]) === hour;
      });
      if (hourEvts.length === 0) return;
      var row = document.createElement("div");
      row.className = "ag2-dv-time-row";
      var hDiv = document.createElement("div");
      hDiv.className = "ag2-dv-hour";
      hDiv.textContent = hour + ":00";
      var sDiv = document.createElement("div");
      sDiv.className = "ag2-dv-slot";
      hourEvts.forEach(function (ev) {
        var evDiv = document.createElement("div");
        evDiv.className = "ag2-dv-event ag2-ev-" + ev.category + "-blk";
        evDiv.innerHTML =
          "<strong>" +
          ev.name +
          '</strong><span style="font-size:.75rem;display:block;">' +
          ev.startTime +
          " – " +
          ev.endTime +
          "</span>";
        sDiv.appendChild(evDiv);
      });
      row.appendChild(hDiv);
      row.appendChild(sDiv);
      body.appendChild(row);
    })(h);
  }
  // If nothing was appended (all events skipped), show all hours
  if (body.children.length === 0) {
    for (var h2 = 7; h2 <= 21; h2++) {
      (function (hour) {
        var row = document.createElement("div");
        row.className = "ag2-dv-time-row";
        var hDiv = document.createElement("div");
        hDiv.className = "ag2-dv-hour";
        hDiv.textContent = hour + ":00";
        var sDiv = document.createElement("div");
        sDiv.className = "ag2-dv-slot";
        evts
          .filter(function (e) {
            return parseInt(e.startTime.split(":")[0]) === hour;
          })
          .forEach(function (ev) {
            var evDiv = document.createElement("div");
            evDiv.className = "ag2-dv-event ag2-ev-" + ev.category + "-blk";
            evDiv.innerHTML =
              "<strong>" +
              ev.name +
              '</strong><span style="font-size:.75rem;display:block;">' +
              ev.startTime +
              " – " +
              ev.endTime +
              "</span>";
            sDiv.appendChild(evDiv);
          });
        row.appendChild(hDiv);
        row.appendChild(sDiv);
        body.appendChild(row);
      })(h2);
    }
  }
}

// ========================================
// PRIORIDADES
// ========================================

function inicializarPrioridades() {
  actualizarListaPrioridades();
}

function actualizarListaPrioridades() {
  var sec = document.querySelector(".ag2-priorities");
  if (!sec) return;
  sec.querySelectorAll(".ag2-priority-item").forEach(function (i) {
    i.remove();
  });
  var old = sec.querySelector(".ag2-btn-new-priority");
  if (old) old.remove();

  priorities.forEach(function (priority, index) {
    var label = document.createElement("label");
    label.className = "ag2-priority-item";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "ag2-checkbox";
    cb.checked = priority.completed;
    var span = document.createElement("span");
    span.textContent = priority.text;
    if (priority.completed) {
      span.style.textDecoration = "line-through";
      span.style.color = "#94a3b8";
      label.style.opacity = "0.6";
    }
    cb.addEventListener("change", function () {
      priority.completed = this.checked;
      span.style.textDecoration = this.checked ? "line-through" : "none";
      span.style.color = this.checked ? "#94a3b8" : "var(--color-text)";
      label.style.opacity = this.checked ? "0.6" : "1";
      guardarLocal();
      const token = sessionStorage.getItem("ct_token");
      if (token && priority.id) {
        fetch("/api/agenda/prioridades/" + priority.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            titulo: priority.text,
            completada: priority.completed,
          }),
        }).catch(function (err) {
          console.error("Error actualizando prioridad:", err);
        });
      }
    });
    var bE = document.createElement("button");
    bE.innerHTML = '<i class="fas fa-edit"></i>';
    Object.assign(bE.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      marginLeft: "auto",
      color: "#3b82f6",
      fontSize: "12px",
    });
    bE.addEventListener("click", function (e) {
      e.preventDefault();
      editarPrioridad(index);
    });
    var bD = document.createElement("button");
    bD.innerHTML = '<i class="fas fa-trash"></i>';
    Object.assign(bD.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      marginLeft: "8px",
      color: "#ef4444",
      fontSize: "12px",
    });
    bD.addEventListener("click", function (e) {
      e.preventDefault();
      eliminarPrioridad(index);
    });
    label.appendChild(cb);
    label.appendChild(span);
    label.appendChild(bE);
    label.appendChild(bD);
    sec.appendChild(label);
  });

  var btn = document.createElement("button");
  btn.className = "ag2-btn-new-priority";
  btn.innerHTML = '<i class="fas fa-plus"></i> Nueva prioridad';
  Object.assign(btn.style, {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#3b82f6",
    fontSize: "12px",
    fontWeight: "500",
    marginTop: "8px",
  });
  btn.addEventListener("click", agregarPrioridad);
  sec.appendChild(btn);
}

async function agregarPrioridad() {
  var t = prompt("Ingresa la nueva prioridad:");
  if (!t || !t.trim()) return;
  var nueva = { text: t.trim(), completed: false };

  const token = sessionStorage.getItem("ct_token");
  if (token) {
    try {
      var res = await fetch("/api/agenda/prioridades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ titulo: nueva.text, completada: false }),
      });
      var data = await res.json();
      if (res.ok) nueva.id = data.id;
    } catch (err) {
      console.error("Error guardando prioridad:", err);
    }
  }
  priorities.push(nueva);
  guardarLocal();
  actualizarListaPrioridades();
}

async function editarPrioridad(i) {
  var t = prompt("Edita la prioridad:", priorities[i].text);
  if (!t || !t.trim()) return;
  priorities[i].text = t.trim();

  const token = sessionStorage.getItem("ct_token");
  if (token && priorities[i].id) {
    try {
      await fetch("/api/agenda/prioridades/" + priorities[i].id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          titulo: priorities[i].text,
          completada: priorities[i].completed,
        }),
      });
    } catch (err) {
      console.error("Error editando prioridad:", err);
    }
  }
  guardarLocal();
  actualizarListaPrioridades();
}

async function eliminarPrioridad(i) {
  if (!confirm("¿Eliminar esta prioridad?")) return;
  const token = sessionStorage.getItem("ct_token");
  if (token && priorities[i].id) {
    try {
      await fetch("/api/agenda/prioridades/" + priorities[i].id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (err) {
      console.error("Error eliminando prioridad:", err);
    }
  }
  priorities.splice(i, 1);
  guardarLocal();
  actualizarListaPrioridades();
}
function configurarEventosPrioridades() {}

// ========================================
// NOTA STICKY
// ========================================

function inicializarNotaSticky() {
  actualizarNotaSticky();
  // Ocultar si no hay nota
  var n = document.querySelector(".ag2-note-sticky");
  if (n && !stickyNote) n.style.display = "none";
}

function actualizarNotaSticky() {
  var n = document.querySelector(".ag2-note-sticky");
  if (!n) return;
  n.innerHTML = "";
  var pin = document.createElement("i");
  pin.className = "fas fa-thumbtack ag2-note-pin";
  var p = document.createElement("p");
  p.textContent = stickyNote || "";
  if (!stickyNote) n.style.display = "none";
  else n.style.display = "";
  var bE = document.createElement("button");
  bE.innerHTML = '<i class="fas fa-edit"></i>';
  Object.assign(bE.style, {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#f59e0b",
    fontSize: "14px",
    position: "absolute",
    top: "8px",
    right: "32px",
  });
  bE.addEventListener("click", editarNotaSticky);
  var bD = document.createElement("button");
  bD.innerHTML = '<i class="fas fa-trash"></i>';
  Object.assign(bD.style, {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
    fontSize: "14px",
    position: "absolute",
    top: "8px",
    right: "8px",
  });
  bD.addEventListener("click", eliminarNotaSticky);
  n.style.position = "relative";
  n.appendChild(pin);
  n.appendChild(p);
  n.appendChild(bE);
  n.appendChild(bD);
}

function editarNotaSticky() {
  var v = prompt("Edita la nota:", stickyNote || "");
  if (v !== null) {
    stickyNote = v;
    guardarDatos();
    actualizarNotaSticky();
  }
}
function eliminarNotaSticky() {
  if (confirm("¿Eliminar la nota?")) {
    stickyNote = "";
    guardarDatos();
    actualizarNotaSticky();
  }
}

// ========================================
// SEMANA ANTERIOR
// ========================================

function actualizarSemanaAnterior() {
  var ws = getWeekStart(selectedDate);
  var pwe = new Date(ws);
  pwe.setDate(pwe.getDate() - 1);
  var pws = new Date(pwe);
  pws.setDate(pwe.getDate() - 6);

  // Actualizar encabezado
  var hdr = document.querySelector(".ag2-prev-week-header");
  if (hdr) {
    var label = hdr.querySelector(".ag2-semana-label");
    if (label) label.textContent = "Semana anterior";
    var sd = hdr.querySelector(".ag2-semana-dates");
    if (sd)
      sd.innerHTML =
        String(pws.getDate()).padStart(2, "0") +
        " – " +
        String(pwe.getDate()).padStart(2, "0") +
        " <span>" +
        MONTH_NAMES_LC[pwe.getMonth()] +
        "</span>";
  }

  // Actualizar mini-grid de actividades
  var miniWeek = document.querySelector(".ag2-mini-week");
  if (!miniWeek) return;
  miniWeek.innerHTML = "";

  var dayShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  for (var i = 0; i < 7; i++) {
    var d = new Date(pws);
    d.setDate(d.getDate() + i);
    var dateStr =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");

    var dayDiv = document.createElement("div");
    dayDiv.className = "ag2-mini-day";
    if (i === 6) dayDiv.classList.add("ag2-mini-day-dom");

    var dayHdr = document.createElement("div");
    dayHdr.className = "ag2-mini-day-hdr";
    dayHdr.innerHTML =
      dayShort[i] +
      " <span>" +
      String(d.getDate()).padStart(2, "0") +
      "</span>";
    dayDiv.appendChild(dayHdr);

    // Filtrar actividades para este día específico de la semana anterior
    var dayActivities = activities.filter(function (a) {
      return a.dateStr === dateStr;
    });

    if (dayActivities.length > 0) {
      dayActivities.forEach(function (act) {
        var evtDiv = document.createElement("div");
        evtDiv.className = "ag2-mini-evt ag2-ev-" + act.category;
        evtDiv.style.marginTop = "4px";
        evtDiv.innerHTML =
          '<span class="ag2-mini-time">' +
          act.startTime +
          '</span><span class="ag2-mini-name">' +
          act.name +
          "</span>";
        dayDiv.appendChild(evtDiv);
      });
    }

    miniWeek.appendChild(dayDiv);
  }
}

// ========================================
// SEMANA ACTUAL
// ========================================

function actualizarSemanaActual() {
  var ws = getWeekStart(selectedDate);
  var we = new Date(ws);
  we.setDate(we.getDate() + 6);
  var h3 = document.getElementById("ag2WeeklyTitle");
  if (h3) {
    if (ws.getMonth() === we.getMonth()) {
      h3.textContent =
        "Semana del " +
        ws.getDate() +
        " al " +
        we.getDate() +
        " de " +
        MONTH_NAMES_LC[we.getMonth()];
    } else {
      h3.textContent =
        "Semana del " +
        ws.getDate() +
        " de " +
        MONTH_NAMES_LC[ws.getMonth()] +
        " al " +
        we.getDate() +
        " de " +
        MONTH_NAMES_LC[we.getMonth()];
    }
  }

  var dayShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  document.querySelectorAll(".ag2-sched-day-hdr").forEach(function (hdr, i) {
    var d = new Date(ws);
    d.setDate(d.getDate() + i);
    var num = hdr.querySelector(".ag2-sched-num");
    var name = hdr.querySelector(".ag2-sched-name");
    if (num) num.textContent = String(d.getDate()).padStart(2, "0");
    if (name) name.textContent = dayShort[i];
    hdr.classList.toggle("ag2-sunday", i === 6);
    var isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (num) num.classList.toggle("ag2-highlight", isToday);
  });
  actualizarActividades();
  actualizarTabLabel();
}

function getWeekStart(date) {
  var d = new Date(date),
    day = d.getDay(),
    diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ========================================
// ACTIVIDADES
// ========================================

function inicializarActividades() {
  actualizarActividades();
  var btn = document.querySelector(".ag2-nueva-btn");
  if (btn) btn.addEventListener("click", abrirModalNuevaActividad);

  // Se eliminaron los botones redundantes de Editar y Borrar de aquí, ya que ahora aparecen al hacer clic en la actividad.
}

function abrirModalNuevaActividad() {
  var todayStr =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  var html =
    '<div class="ag2-modal-overlay" id="ag2ModalOverlay"><div class="ag2-modal"><div class="ag2-modal-header"><h3>Nueva Actividad</h3><button class="ag2-modal-close" onclick="cerrarModalActividad()">&times;</button></div><div class="ag2-modal-body"><div class="ag2-form-group"><label>Nombre:</label><input type="text" id="ag2ActivityName" placeholder="Ej: Clase de Programación"></div><div class="ag2-form-group"><label>Fecha:</label><input type="date" id="ag2ActivityDate" value="' +
    todayStr +
    '"></div><div class="ag2-form-group"><label>Hora inicio:</label><input type="time" id="ag2ActivityStartTime" value="08:00"></div><div class="ag2-form-group"><label>Hora fin:</label><input type="time" id="ag2ActivityEndTime" value="09:00"></div><div class="ag2-form-group"><label>Categoría:</label><select id="ag2ActivityCategory"><option value="academico">Académico</option><option value="personal">Personal</option><option value="examen">Examen</option><option value="deportes">Deportes</option><option value="estudio">Estudio</option><option value="comida">Comida</option></select></div><div class="ag2-form-group"><label>Descripción:</label><textarea id="ag2ActivityDescription" placeholder="Notas..."></textarea></div></div><div class="ag2-modal-footer"><button class="ag2-btn-cancel" onclick="cerrarModalActividad()">Cancelar</button><button class="ag2-btn-save" onclick="guardarNuevaActividad()">Guardar</button></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  document
    .getElementById("ag2ModalOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) cerrarModalActividad();
    });
}

function cerrarModalActividad() {
  var o = document.getElementById("ag2ModalOverlay");
  if (o) o.remove();
}

async function guardarNuevaActividad() {
  var name = document.getElementById("ag2ActivityName").value.trim();
  if (!name) {
    alert("Por favor escribe un nombre para la actividad.");
    return;
  }
  var dateStr = document.getElementById("ag2ActivityDate").value;
  var startTime = document.getElementById("ag2ActivityStartTime").value;
  var endTime = document.getElementById("ag2ActivityEndTime").value;
  var category = document.getElementById("ag2ActivityCategory").value;
  var desc = document.getElementById("ag2ActivityDescription").value;

  var aDate = new Date(dateStr + "T00:00:00");
  var day = aDate.getDay() === 0 ? 6 : aDate.getDay() - 1;

  const token = sessionStorage.getItem("ct_token");
  var savedId = Date.now(); // fallback local id

  if (token) {
    try {
      var res = await fetch("/api/agenda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          titulo: name,
          descripcion: desc,
          fecha_inicio: dateStr + "T" + startTime + ":00",
          fecha_fin: dateStr + "T" + endTime + ":00",
          categoria: category,
          tipo: "actividad",
        }),
      });
      var data = await res.json();
      if (res.ok) savedId = data.id;
    } catch (err) {
      console.error("Error guardando actividad:", err);
    }
  }

  var nuevaActividad = {
    id: savedId,
    name,
    day,
    startTime,
    endTime,
    category,
    description: desc,
    dateStr,
  };
  activities.push(nuevaActividad);
  cerrarModalActividad();
  actualizarActividades();
  actualizarSemanaAnterior();
  renderizarVistaActiva();

  if (typeof window.agregarNotificacion === "function") {
    var catLabel = {
      academico: "Académico",
      personal: "Personal",
      examen: "Examen",
      deportes: "Deportes",
      estudio: "Estudio",
      comida: "Comida",
    };
    window.agregarNotificacion(
      "agenda",
      "Nueva actividad agregada",
      name +
        " — " +
        startTime +
        " a " +
        endTime +
        " (" +
        (catLabel[category] || category) +
        ")",
    );
  }
  if (typeof window.programarAlertasActividad === "function")
    window.programarAlertasActividad(nuevaActividad);
}

function actualizarActividades() {
  document.querySelectorAll(".ag2-sched-slot").forEach(function (s) {
    s.classList.remove("ag2-has-event", "ag2-skip");
    s.innerHTML = "";
  });
  var ws = getWeekStart(selectedDate);
  var we = new Date(ws);
  we.setDate(we.getDate() + 6);

  activities.forEach(function (activity) {
    // Verificar si la actividad pertenece a la semana seleccionada
    var actDate = new Date(activity.dateStr + "T00:00:00");
    if (actDate < ws || actDate > we) return;

    var sh = parseInt(activity.startTime.split(":")[0]);
    var sm = parseInt(activity.startTime.split(":")[1]);
    var eh = parseInt(activity.endTime.split(":")[0]);
    var em = parseInt(activity.endTime.split(":")[1]);
    // Cada slot representa 1 hora (7:00 → slot 0, 8:00 → slot 1, …)
    var startSlot = sh - 7;
    var cols = document.querySelectorAll(".ag2-sched-col");
    var col = cols[activity.day];
    if (!col) return;
    var colSlots = col.querySelectorAll(".ag2-sched-slot");
    var slot = colSlots[startSlot];
    if (!slot) return;
    var block = document.createElement("div");
    block.className = "ag2-ev-block ag2-ev-" + activity.category + "-blk";
    block.draggable = true;
    block.dataset.activityId = activity.id;
    var dur = eh * 60 + em - (sh * 60 + sm);
    // Ajuste de posición vertical por minutos dentro del slot (slot = 44px por hora)
    var slotH = 44;
    block.style.top = Math.round((sm / 60) * slotH) + "px";
    var totalPx = Math.max(slotH * 0.7, Math.round((dur / 60) * slotH));
    block.style.height = totalPx + "px";
    var sp = Math.max(1, Math.round(dur / 60));
    if (sp >= 2) block.classList.add("ag2-span" + Math.min(sp, 3));
    block.innerHTML =
      '<div style="padding: 4px 6px; height: 100%; display: flex; flex-direction: column; justify-content: center;">' +
      "<strong>" +
      activity.name +
      "</strong>" +
      '<div style="font-size: 0.75rem; opacity: 0.9;">' +
      activity.startTime +
      " – " +
      activity.endTime +
      "</div>" +
      '<div class="ag2-ev-actions" style="display:none;gap:8px;margin-top:8px;justify-content: center;">' +
      '<button class="ag2-btn-editar" data-id="' +
      activity.id +
      '" title="Editar" style="background:rgba(255,255,255,0.7); border:none; cursor:pointer; color:#1e293b; font-size:.8rem; padding:6px 10px; border-radius:6px; font-weight:600; display:flex; align-items:center; gap:4px;"><i class="fas fa-edit"></i> Editar</button>' +
      '<button class="ag2-btn-borrar" data-id="' +
      activity.id +
      '" title="Borrar" style="background:rgba(255,255,255,0.7); border:none; cursor:pointer; color:#ef4444; font-size:.8rem; padding:6px 10px; border-radius:6px; font-weight:600; display:flex; align-items:center; gap:4px;"><i class="fas fa-trash"></i> Borrar</button>' +
      "</div>" +
      "</div>";

    // Botones Editar y Borrar usando event listeners (el id puede ser UUID)
    block
      .querySelector(".ag2-btn-editar")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        editarActividad(this.dataset.id);
      });
    block
      .querySelector(".ag2-btn-borrar")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        eliminarActividad(this.dataset.id);
      });

    // Agrandar el bloque para que quepan los botones al hacer clic
    block.style.minHeight = "45px";
    block.style.transition = "all 0.2s ease";

    // Mostrar/ocultar botones al hacer clic en el bloque
    block.addEventListener("click", function (e) {
      e.stopPropagation();
      var actions = this.querySelector(".ag2-ev-actions");
      var isVisible = actions.style.display === "flex";

      // Ocultar todos los demás
      document.querySelectorAll(".ag2-ev-actions").forEach(function (a) {
        a.style.display = "none";
      });
      document.querySelectorAll(".ag2-ev-block").forEach(function (b) {
        b.style.minHeight = "45px";
        b.style.zIndex = "1";
      });

      if (!isVisible) {
        actions.style.display = "flex";
        this.style.minHeight = "90px";
        this.style.zIndex = "10";
      }
    });

    block.addEventListener("dragstart", function (e) {
      draggedElement = this;
      e.dataTransfer.effectAllowed = "move";
    });
    block.addEventListener("dragend", function () {
      draggedElement = null;
    });
    slot.classList.add("ag2-has-event");
    slot.appendChild(block);
  });

  // Cerrar botones al hacer clic fuera y restablecer tamaño de bloques
  document.addEventListener("click", function () {
    document.querySelectorAll(".ag2-ev-actions").forEach(function (a) {
      a.style.display = "none";
    });
    document.querySelectorAll(".ag2-ev-block").forEach(function (b) {
      b.style.minHeight = "45px";
      b.style.zIndex = "1";
    });
  });

  document.querySelectorAll(".ag2-sched-slot").forEach(function (slot) {
    slot.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      this.style.backgroundColor = "#e0e7ff";
    });
    slot.addEventListener("dragleave", function () {
      this.style.backgroundColor = "";
    });
    slot.addEventListener("drop", function (e) {
      e.preventDefault();
      if (draggedElement) {
        var aid = parseInt(draggedElement.dataset.activityId);
        var act = activities.find(function (a) {
          return a.id === aid;
        });
        if (act) {
          var col = this.closest(".ag2-sched-col");
          var ci = Array.from(
            document.querySelectorAll(".ag2-sched-col"),
          ).indexOf(col);
          var si = Array.from(col.querySelectorAll(".ag2-sched-slot")).indexOf(
            this,
          );

          // Calcular duración original en minutos
          var sh_old = parseInt(act.startTime.split(":")[0]);
          var sm_old = parseInt(act.startTime.split(":")[1]);
          var eh_old = parseInt(act.endTime.split(":")[0]);
          var em_old = parseInt(act.endTime.split(":")[1]);
          var durationMinutes = eh_old * 60 + em_old - (sh_old * 60 + sm_old);

          // Nueva hora de inicio basada en el slot donde se soltó (1 slot = 1 hora)
          var nh = 7 + si;
          var nm = 0;

          // Nueva hora de fin manteniendo la duración original
          var totalEndMinutes = nh * 60 + nm + durationMinutes;
          var eh = Math.floor(totalEndMinutes / 60);
          var em = totalEndMinutes % 60;

          // Asegurar que no pase de las 23:59
          if (eh >= 24) {
            eh = 23;
            em = 59;
          }

          act.day = ci;
          act.startTime =
            String(nh).padStart(2, "0") + ":" + String(nm).padStart(2, "0");
          act.endTime =
            String(eh).padStart(2, "0") + ":" + String(em).padStart(2, "0");

          // Sincronizar dateStr con el nuevo día de la semana
          var ws2 = getWeekStart(selectedDate);
          var aDate2 = new Date(ws2);
          aDate2.setDate(aDate2.getDate() + ci);
          act.dateStr =
            aDate2.getFullYear() +
            "-" +
            String(aDate2.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(aDate2.getDate()).padStart(2, "0");

          guardarDatos();
          actualizarActividades();
          actualizarSemanaAnterior();
        }
      }
      this.style.backgroundColor = "";
    });
  });
}

function editarActividad(aid) {
  var act = activities.find(function (a) {
    return String(a.id) === String(aid);
  });
  if (!act) return;
  var html =
    '<div class="ag2-modal-overlay" id="ag2ModalOverlay">' +
    '<div class="ag2-modal">' +
    '<div class="ag2-modal-header"><h3>Editar Actividad</h3><button class="ag2-modal-close" id="ag2ModalCloseBtn">&times;</button></div>' +
    '<div class="ag2-modal-body">' +
    '<div class="ag2-form-group"><label>Nombre:</label><input type="text" id="ag2ActivityName" value="' +
    act.name +
    '"></div>' +
    '<div class="ag2-form-group"><label>Fecha:</label><input type="date" id="ag2ActivityDate" value="' +
    act.dateStr +
    '"></div>' +
    '<div class="ag2-form-group"><label>Hora inicio:</label><input type="time" id="ag2ActivityStartTime" value="' +
    act.startTime +
    '"></div>' +
    '<div class="ag2-form-group"><label>Hora fin:</label><input type="time" id="ag2ActivityEndTime" value="' +
    act.endTime +
    '"></div>' +
    '<div class="ag2-form-group"><label>Categoría:</label><select id="ag2ActivityCategory">' +
    '<option value="academico"' +
    (act.category === "academico" ? " selected" : "") +
    ">Académico</option>" +
    '<option value="personal"' +
    (act.category === "personal" ? " selected" : "") +
    ">Personal</option>" +
    '<option value="examen"' +
    (act.category === "examen" ? " selected" : "") +
    ">Examen</option>" +
    '<option value="deportes"' +
    (act.category === "deportes" ? " selected" : "") +
    ">Deportes</option>" +
    '<option value="estudio"' +
    (act.category === "estudio" ? " selected" : "") +
    ">Estudio</option>" +
    '<option value="comida"' +
    (act.category === "comida" ? " selected" : "") +
    ">Comida</option>" +
    "</select></div>" +
    '<div class="ag2-form-group"><label>Descripción:</label><textarea id="ag2ActivityDescription">' +
    (act.description || "") +
    "</textarea></div>" +
    "</div>" +
    '<div class="ag2-modal-footer">' +
    '<button class="ag2-btn-cancel" id="ag2ModalCancelBtn">Cancelar</button>' +
    '<button class="ag2-btn-save"   id="ag2ModalSaveBtn">Guardar</button>' +
    "</div>" +
    "</div>" +
    "</div>";
  document.body.insertAdjacentHTML("beforeend", html);
  document
    .getElementById("ag2ModalCloseBtn")
    .addEventListener("click", cerrarModalActividad);
  document
    .getElementById("ag2ModalCancelBtn")
    .addEventListener("click", cerrarModalActividad);
  document
    .getElementById("ag2ModalSaveBtn")
    .addEventListener("click", function () {
      guardarEdicionActividad(aid);
    });
  document
    .getElementById("ag2ModalOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) cerrarModalActividad();
    });
}

async function guardarEdicionActividad(aid) {
  var act = activities.find(function (a) {
    return String(a.id) === String(aid);
  });
  if (!act) return;
  act.name = document.getElementById("ag2ActivityName").value;
  act.dateStr = document.getElementById("ag2ActivityDate").value;
  act.startTime = document.getElementById("ag2ActivityStartTime").value;
  act.endTime = document.getElementById("ag2ActivityEndTime").value;
  act.category = document.getElementById("ag2ActivityCategory").value;
  act.description = document.getElementById("ag2ActivityDescription").value;

  var aDate = new Date(act.dateStr + "T00:00:00");
  act.day = aDate.getDay() === 0 ? 6 : aDate.getDay() - 1;

  const token = sessionStorage.getItem("ct_token");
  if (token) {
    try {
      await fetch("/api/agenda/" + aid, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          titulo: act.name,
          descripcion: act.description,
          fecha_inicio: act.dateStr + "T" + act.startTime + ":00",
          fecha_fin: act.dateStr + "T" + act.endTime + ":00",
          categoria: act.category,
        }),
      });
    } catch (err) {
      console.error("Error actualizando actividad:", err);
    }
  }

  cerrarModalActividad();
  actualizarActividades();
  actualizarSemanaAnterior();
  renderizarVistaActiva();
  if (typeof window.agregarNotificacion === "function") {
    var catLabel2 = {
      academico: "Académico",
      personal: "Personal",
      examen: "Examen",
      deportes: "Deportes",
      estudio: "Estudio",
      comida: "Comida",
    };
    window.agregarNotificacion(
      "agenda",
      "Actividad actualizada",
      act.name +
        " — " +
        act.startTime +
        " a " +
        act.endTime +
        " (" +
        (catLabel2[act.category] || act.category) +
        ")",
    );
  }
  if (typeof window.limpiarAlertaPendiente === "function")
    window.limpiarAlertaPendiente(act.id);
  if (typeof window.programarAlertasActividad === "function")
    window.programarAlertasActividad(act);
}

async function eliminarActividad(aid) {
  if (!confirm("¿Eliminar esta actividad?")) return;
  if (typeof window.limpiarAlertaPendiente === "function")
    window.limpiarAlertaPendiente(aid);
  const token = sessionStorage.getItem("ct_token");
  if (token) {
    try {
      await fetch("/api/agenda/" + aid, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (err) {
      console.error("Error eliminando actividad:", err);
    }
  }
  activities = activities.filter(function (a) {
    return String(a.id) !== String(aid);
  });
  actualizarActividades();
  actualizarSemanaAnterior();
  renderizarVistaActiva();
}
function configurarEventosActividades() {}

// ========================================
// CALENDARIO ANUAL
// ========================================

function inicializarCalendarioAnual() {
  var p = document.getElementById("ag2AnualPrev");
  var n = document.getElementById("ag2AnualNext");
  if (p)
    p.addEventListener("click", function () {
      anualYear--;
      actualizarCalendarioAnual();
    });
  if (n)
    n.addEventListener("click", function () {
      anualYear++;
      actualizarCalendarioAnual();
    });
  actualizarCalendarioAnual();
}

function actualizarCalendarioAnual() {
  var yearEl = document.getElementById("ag2AnualYear");
  var grid = document.getElementById("ag2AnualGrid");
  if (!yearEl || !grid) return;
  yearEl.textContent = anualYear;
  grid.innerHTML = "";

  var allFechas = FECHAS_PRESET.concat(getFechasUsuario());

  for (var m = 0; m < 12; m++) {
    (function (mo) {
      var md = document.createElement("div");
      md.className = "ag2-anual-month";
      var tEl = document.createElement("div");
      tEl.className = "ag2-anual-month-title";
      tEl.textContent = MONTH_NAMES[mo];
      md.appendChild(tEl);
      var mg = document.createElement("div");
      mg.className = "ag2-anual-mini-grid";
      ["L", "M", "X", "J", "V", "S", "D"].forEach(function (h) {
        var he = document.createElement("div");
        he.className = "ag2-anual-mini-hdr";
        he.textContent = h;
        mg.appendChild(he);
      });
      var fd = new Date(anualYear, mo, 1),
        ld = new Date(anualYear, mo + 1, 0);
      var sd = fd.getDay() === 0 ? 6 : fd.getDay() - 1;
      for (var i = 0; i < sd; i++) {
        var de = document.createElement("div");
        de.className = "ag2-anual-mini-day ag2-anual-other";
        mg.appendChild(de);
      }
      for (var day = 1; day <= ld.getDate(); day++) {
        (function (d) {
          var wrap = document.createElement("div");
          wrap.className = "ag2-anual-mini-cell";
          var de = document.createElement("div");
          de.className = "ag2-anual-mini-day";
          de.textContent = d;
          var dow = (sd + d - 1) % 7;
          if (dow === 5 || dow === 6) de.classList.add("ag2-anual-weekend");
          if (
            d === today.getDate() &&
            mo === today.getMonth() &&
            anualYear === today.getFullYear()
          )
            de.classList.add("ag2-anual-today");

          // Mark fechas importantes
          var fKey =
            String(d).padStart(2, "0") + "-" + String(mo + 1).padStart(2, "0");
          var fi = allFechas.find(function (f) {
            return f.date === fKey;
          });
          if (fi) {
            de.classList.add("ag2-anual-fi");
            de.title = (fi.emoji || "📅") + " " + fi.name;
            var fiDotEl = document.createElement("span");
            fiDotEl.className = "ag2-anual-fi-dot";
            wrap.appendChild(de);
            wrap.appendChild(fiDotEl);
            de.addEventListener("click", function () {
              selectedDate = new Date(anualYear, mo, d);
              currentDate = new Date(anualYear, mo, d);
              dvDate = new Date(selectedDate);
              actualizarCalendario();
              var tabBtn = document.querySelector('[data-tab="tabAgenda"]');
              if (tabBtn) tabBtn.click();
            });
            mg.appendChild(wrap);
            return;
          }

          de.addEventListener("click", function () {
            selectedDate = new Date(anualYear, mo, d);
            currentDate = new Date(anualYear, mo, d);
            dvDate = new Date(selectedDate);
            actualizarCalendario();
            var tabBtn = document.querySelector('[data-tab="tabAgenda"]');
            if (tabBtn) tabBtn.click();
          });
          mg.appendChild(de);
        })(day);
      }
      md.appendChild(mg);
      grid.appendChild(md);
    })(m);
  }
}

// ========================================
// FECHAS IMPORTANTES
// ========================================

function inicializarFechasImportantes() {
  var btn = document.getElementById("ag2FiAddBtn");
  if (btn) btn.addEventListener("click", abrirModalAgregarFecha);
  renderizarFechasImportantes();
}

function getFechasUsuario() {
  var r = localStorage.getItem("ag_fechas_usuario");
  return r ? JSON.parse(r) : [];
}
function setFechasUsuario(a) {
  localStorage.setItem("ag_fechas_usuario", JSON.stringify(a));
}

function renderizarFechasImportantes() {
  var list = document.getElementById("ag2FiList");
  if (!list) return;
  list.innerHTML = "";
  var user = getFechasUsuario();
  var all = FECHAS_PRESET.map(function (f) {
    return Object.assign({}, f, { user: false });
  })
    .concat(
      user.map(function (f) {
        return Object.assign({}, f, { user: true });
      }),
    )
    .sort(function (a, b) {
      var p = a.date.split("-").map(Number),
        q = b.date.split("-").map(Number);
      return p[1] !== q[1] ? p[1] - q[1] : p[0] - q[0];
    });

  all.forEach(function (fecha) {
    var parts = fecha.date.split("-");
    var day = parts[0],
      mon = parseInt(parts[1]);
    var item = document.createElement("div");
    item.className =
      "ag2-fi-item ag2-fi-" + (fecha.user ? "user" : fecha.type || "nacional");
    var eDiv = document.createElement("div");
    eDiv.className = "ag2-fi-emoji";
    eDiv.textContent = fecha.emoji || "📅";
    var info = document.createElement("div");
    info.className = "ag2-fi-info";
    info.innerHTML =
      '<div class="ag2-fi-date">' +
      day +
      " de " +
      MONTH_NAMES[mon - 1] +
      (fecha.user ? " · Personal" : "") +
      '</div><p class="ag2-fi-name">' +
      fecha.name +
      '</p><p class="ag2-fi-desc">' +
      fecha.desc +
      "</p>";
    item.appendChild(eDiv);
    item.appendChild(info);
    if (fecha.user) {
      var del = document.createElement("button");
      del.className = "ag2-fi-del-btn";
      del.innerHTML = '<i class="fas fa-trash"></i>';
      del.title = "Eliminar";
      (function (f) {
        del.addEventListener("click", function () {
          if (confirm('¿Eliminar "' + f.name + '"?')) {
            setFechasUsuario(
              getFechasUsuario().filter(function (x) {
                return !(x.date === f.date && x.name === f.name);
              }),
            );
            renderizarFechasImportantes();
          }
        });
      })(fecha);
      item.appendChild(del);
    }
    list.appendChild(item);
  });
}

function abrirModalAgregarFecha() {
  var opts = MONTH_NAMES.map(function (m, i) {
    return (
      '<option value="' +
      String(i + 1).padStart(2, "0") +
      '">' +
      m +
      "</option>"
    );
  }).join("");
  var html =
    '<div class="ag2-fi-modal-overlay open" id="ag2FiModalOverlay"><div class="ag2-fi-modal"><h3>➕ Agregar fecha importante</h3><div class="ag2-fi-form-group"><label>Nombre</label><input type="text" id="ag2FiName" placeholder="Ej: Cumpleaños de mamá"></div><div class="ag2-fi-form-group"><label>Día</label><input type="number" id="ag2FiDay" min="1" max="31" placeholder="Día (1-31)"></div><div class="ag2-fi-form-group"><label>Mes</label><select id="ag2FiMonth">' +
    opts +
    '</select></div><div class="ag2-fi-form-group"><label>Emoji (opcional)</label><input type="text" id="ag2FiEmoji" placeholder="🎂" maxlength="2"></div><div class="ag2-fi-form-group"><label>Descripción breve</label><textarea id="ag2FiDesc" placeholder="Descripción..."></textarea></div><div class="ag2-info-modal-actions"><button class="ag2-info-btn-cancel" id="ag2FiModalCancel">Cancelar</button><button class="ag2-info-btn-primary" id="ag2FiModalSave">Guardar</button></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  document
    .getElementById("ag2FiModalCancel")
    .addEventListener("click", function () {
      document.getElementById("ag2FiModalOverlay").remove();
    });
  document
    .getElementById("ag2FiModalOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) this.remove();
    });
  document
    .getElementById("ag2FiModalSave")
    .addEventListener("click", function () {
      var name = document.getElementById("ag2FiName").value.trim();
      var day = String(
        parseInt(document.getElementById("ag2FiDay").value || "1"),
      ).padStart(2, "0");
      var month = document.getElementById("ag2FiMonth").value;
      var emoji = document.getElementById("ag2FiEmoji").value.trim() || "📅";
      var desc = document.getElementById("ag2FiDesc").value.trim();
      if (!name) {
        alert("Por favor escribe un nombre.");
        return;
      }
      var arr = getFechasUsuario();
      arr.push({ date: day + "-" + month, name, emoji, desc, type: "user" });
      setFechasUsuario(arr);
      document.getElementById("ag2FiModalOverlay").remove();
      renderizarFechasImportantes();
    });
}

// ========================================
// BOTONES DE BARRA
// ========================================

function inicializarBotonesBarra() {
  var bE = document.getElementById("btnExportarPDF");
  if (bE)
    bE.addEventListener("click", function () {
      mostrarInfoModal(
        "📄 Exportar PDF",
        "<p>Esta función exporta la agenda en PDF con estas opciones:</p><ul><li><strong>Vista semanal:</strong> semana actual con todas las actividades.</li><li><strong>Vista mensual:</strong> calendario mensual con eventos marcados.</li><li><strong>Fechas importantes:</strong> lista del año completo.</li><li><strong>Prioridades:</strong> lista de tareas y su estado.</li></ul><p>El PDF se descarga automáticamente a tu dispositivo.</p>",
        function () {
          window.print();
        },
        "Imprimir / Guardar PDF",
      );
    });
  var bG = document.getElementById("btnSincronizarGoogle");
  if (bG)
    bG.addEventListener("click", function () {
      mostrarInfoModal(
        "🔄 Sincronizar con Google Calendar",
        "<p>Para sincronizar con Google Calendar:</p><ul><li>Inicia sesión con tu cuenta de Google.</li><li>Autoriza a CONOCE-TEC a acceder a tu calendario.</li><li>Tus actividades se sincronizarán automáticamente.</li><li>Los cambios en Google también se reflejarán aquí.</li></ul><p>Requiere conexión a internet y cuenta de Google.</p>",
        function () {
          window.open("https://calendar.google.com/", "_blank");
        },
        "Abrir Google Calendar",
      );
    });
  var bB = document.getElementById("btnBuscarAgenda");
  if (bB) bB.addEventListener("click", abrirBuscador);
  var bC = document.getElementById("btnCompartirAgenda");
  if (bC)
    bC.addEventListener("click", function () {
      mostrarInfoModal(
        "🔗 Compartir agenda",
        "<p>Opciones para compartir tu agenda:</p><ul><li><strong>Enlace público:</strong> enlace de solo lectura para que otros vean tus actividades.</li><li><strong>Por correo:</strong> resumen semanal o mensual a cualquier correo.</li><li><strong>Exportar .ics:</strong> compatible con Google Calendar, Outlook y Apple Calendar.</li></ul>",
        function () {
          var txt = generarResumenAgenda();
          if (navigator.share) {
            navigator
              .share({ title: "Mi Agenda – CONOCE-TEC", text: txt })
              .catch(function () {});
          } else {
            navigator.clipboard.writeText(txt).then(function () {
              alert("Resumen copiado al portapapeles.");
            });
          }
        },
        "Compartir / Copiar resumen",
      );
    });
}

function generarResumenAgenda() {
  var ws = getWeekStart(selectedDate);
  var we = new Date(ws);
  we.setDate(we.getDate() + 6);
  var txt =
    "AGENDA CONOCE-TEC – Semana del " +
    ws.getDate() +
    " al " +
    we.getDate() +
    " de " +
    MONTH_NAMES_LC[we.getMonth()] +
    " " +
    we.getFullYear() +
    "\n\n";
  var actWeek = activities.filter(function (a) {
    var d = new Date(ws);
    d.setDate(d.getDate() + a.day);
    return true;
  });
  if (actWeek.length === 0) {
    txt += "Sin actividades registradas esta semana.";
  } else {
    actWeek.forEach(function (a) {
      txt +=
        "• [" +
        DAY_NAMES[a.day] +
        "] " +
        a.startTime +
        " – " +
        a.endTime +
        ": " +
        a.name +
        " (" +
        a.category +
        ")\n";
    });
  }
  return txt;
}

function mostrarInfoModal(titulo, contenido, accion, txtBtn) {
  var ex = document.getElementById("ag2InfoModalOverlay");
  if (ex) ex.remove();
  var html =
    '<div class="ag2-info-modal-overlay open" id="ag2InfoModalOverlay"><div class="ag2-info-modal"><h3>' +
    titulo +
    "</h3>" +
    contenido +
    '<div class="ag2-info-modal-actions"><button class="ag2-info-btn-cancel" id="ag2InfoModalCancel">Cerrar</button>' +
    (accion
      ? '<button class="ag2-info-btn-primary" id="ag2InfoModalOk">' +
        (txtBtn || "Aceptar") +
        "</button>"
      : "") +
    "</div></div></div>";
  document.body.insertAdjacentHTML("beforeend", html);
  document
    .getElementById("ag2InfoModalCancel")
    .addEventListener("click", function () {
      document.getElementById("ag2InfoModalOverlay").remove();
    });
  document
    .getElementById("ag2InfoModalOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) this.remove();
    });
  if (accion) {
    document
      .getElementById("ag2InfoModalOk")
      .addEventListener("click", function () {
        document.getElementById("ag2InfoModalOverlay").remove();
        accion();
      });
  }
}

function abrirBuscador() {
  var ex = document.getElementById("ag2SearchOverlay");
  if (ex) ex.remove();
  var html =
    '<div class="ag2-search-modal-overlay open" id="ag2SearchOverlay"><div class="ag2-search-modal"><div class="ag2-search-bar"><i class="fas fa-search"></i><input type="text" id="ag2SearchInput" placeholder="Buscar actividades, prioridades, fechas..."><button class="ag2-search-close" id="ag2SearchClose"><i class="fas fa-times"></i></button></div><div class="ag2-search-results" id="ag2SearchResults"><div class="ag2-search-empty">Escribe para buscar en tu agenda</div></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  var inp = document.getElementById("ag2SearchInput");
  inp.focus();
  inp.addEventListener("input", function () {
    buscarEnAgenda(this.value.trim());
  });
  document
    .getElementById("ag2SearchClose")
    .addEventListener("click", function () {
      document.getElementById("ag2SearchOverlay").remove();
    });
  document
    .getElementById("ag2SearchOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) this.remove();
    });
}

function buscarEnAgenda(q) {
  var res = document.getElementById("ag2SearchResults");
  if (!res) return;
  if (!q) {
    res.innerHTML =
      '<div class="ag2-search-empty">Escribe para buscar en tu agenda</div>';
    return;
  }
  var ql = q.toLowerCase(),
    found = [];
  activities
    .filter(function (a) {
      return (
        a.name.toLowerCase().includes(ql) ||
        (a.description || "").toLowerCase().includes(ql)
      );
    })
    .forEach(function (a) {
      found.push({
        icon: "📅",
        color: colorForCategory(a.category),
        title: a.name,
        sub: DAY_NAMES[a.day] + " · " + a.startTime + " – " + a.endTime,
      });
    });
  priorities
    .filter(function (p) {
      return p.text.toLowerCase().includes(ql);
    })
    .forEach(function (p) {
      found.push({
        icon: "✅",
        color: "#3b5bdb",
        title: p.text,
        sub: p.completed ? "Completada" : "Pendiente",
      });
    });
  FECHAS_PRESET.concat(getFechasUsuario())
    .filter(function (f) {
      return f.name.toLowerCase().includes(ql);
    })
    .forEach(function (f) {
      found.push({
        icon: f.emoji || "📌",
        color: "#f59e0b",
        title: f.name,
        sub: f.date,
      });
    });
  if (found.length === 0) {
    res.innerHTML =
      '<div class="ag2-search-empty">No se encontraron resultados para "<strong>' +
      q +
      '</strong>"</div>';
    return;
  }
  res.innerHTML = found
    .map(function (r) {
      return (
        '<div class="ag2-search-result-item"><div class="ag2-search-result-icon" style="background:' +
        r.color +
        ';">' +
        r.icon +
        '</div><div class="ag2-search-result-text"><strong>' +
        r.title +
        "</strong><small>" +
        r.sub +
        "</small></div></div>"
      );
    })
    .join("");
}

// ========================================
// UTILIDADES
// ========================================

function colorForCategory(cat) {
  return (
    {
      academico: "#22c55e",
      personal: "#a855f7",
      examen: "#3b82f6",
      deportes: "#f97316",
      estudio: "#ef4444",
      comida: "#06b6d4",
    }[cat] || "#888"
  );
}

// ========================================
// ALMACENAMIENTO — conectado a /api/agenda
// ========================================

function guardarDatos() {
  guardarLocal();
}

async function cargarDatos() {
  // Las fechas (today, selectedDate, etc.) ya se fijan en DOMContentLoaded
  // Aquí solo cargamos datos de la BD

  // Prioridades y nota rápida desde sessionStorage
  var raw = sessionStorage.getItem("ct_agenda_local");
  if (raw) {
    try {
      var p = JSON.parse(raw);
      priorities = p.priorities || [];
      stickyNote = p.stickyNote || "";
    } catch (e) {
      priorities = [];
      stickyNote = "";
    }
  } else {
    priorities = [];
    stickyNote = "";
  }

  // Cargar actividades desde la BD
  const token = sessionStorage.getItem("ct_token");
  if (!token) {
    activities = [];
    return;
  }

  try {
    const res = await fetch("/api/agenda", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      activities = data.map(function (a) {
        var dateStr = a.fecha_inicio ? a.fecha_inicio.slice(0, 10) : "";
        var startTime = a.fecha_inicio ? a.fecha_inicio.slice(11, 16) : "09:00";
        var endTime = a.fecha_fin ? a.fecha_fin.slice(11, 16) : "10:00";

        // Calcular el día de la semana (0=Lun … 6=Dom) a partir de dateStr
        var aDate = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
        var day = aDate.getDay() === 0 ? 6 : aDate.getDay() - 1;

        return {
          id: a.id,
          name: a.titulo, // ← campo correcto para renderizado
          description: a.descripcion || "",
          dateStr: dateStr, // ← campo correcto para filtrado
          day: day,
          startTime: startTime,
          endTime: endTime,
          category: (a.categoria || "general").toLowerCase(),
          type: a.tipo || "actividad",
          completed: a.completada || false,
        };
      });
    }
  } catch (err) {
    console.error("Error cargando agenda:", err);
    activities = [];
  }

  // Cargar prioridades desde la BD
  try {
    const resPr = await fetch("/api/agenda/prioridades", {
      headers: { Authorization: "Bearer " + token },
    });
    if (resPr.ok) {
      const dataPr = await resPr.json();
      if (Array.isArray(dataPr) && dataPr.length > 0) {
        priorities = dataPr.map(function (p) {
          return { id: p.id, text: p.titulo, completed: p.completada || false };
        });
        guardarLocal();
      }
    }
  } catch (err) {
    console.warn("No se pudieron cargar prioridades desde BD:", err);
  }
}

function guardarLocal() {
  sessionStorage.setItem(
    "ct_agenda_local",
    JSON.stringify({ priorities, stickyNote }),
  );
}

// ========================================
// EXPONER GLOBALES
// ========================================
window.cerrarModalActividad = cerrarModalActividad;
window.guardarNuevaActividad = guardarNuevaActividad;
window.editarActividad = editarActividad;
window.guardarEdicionActividad = guardarEdicionActividad;
window.eliminarActividad = eliminarActividad;
