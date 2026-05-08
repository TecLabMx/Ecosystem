/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const campusBBox = [-94.5579, 18.0051, -94.5541, 18.0069]; // [minLon, minLat, maxLon, maxLat]

let map;
let userMarker;
let routeStartMarker = null; // Marcador de inicio de ruta
let routeEndMarker = null; // Marcador de fin de ruta
let selectedStartPOI = null;
let selectedEndPOI = null;
let lastUserCoord = null;
let currentRoute;
let currentRoutePath = null; // Almacena las coordenadas de la ruta actual para el seguimiento
let routeTrackingInterval = null; // Para el seguimiento de ruta en tiempo real
let watchId = null; // Para el watchPosition de geolocalización

let routesGeo;
let poisGeo;
let fuseIndex; // Índice de búsqueda Fuse.js

let graph = { nodes: {}, coordsToId: {}, adj: {} };
let markerClusterGroup; // Grupo de clustering

// Variables para el bottom sheet
let bottomSheetOpen = false;
let bottomSheetStartY = 0;

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  initEventListeners();
  loadGeoJSONData();
  initBottomSheet();
});

// --- Funciones de Utilidad ---
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status-message status-${type}`;
  element.style.display = "block";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  // Anunciar a lectores de pantalla
  announceToScreenReader(message);
}

function hideStatus(elementId) {
  document.getElementById(elementId).style.display = "none";
}

function pointInBBox(point, bbox) {
  const [lon, lat] = point;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Inicialización del Mapa ---
function initMap() {
  map = L.map("map", {
    maxBounds: [
      [campusBBox[1] - 0.001, campusBBox[0] - 0.001],
      [campusBBox[3] + 0.001, campusBBox[2] + 0.001],
    ],
    maxZoom: 19,
    minZoom: 16,
  }).setView(
    [(campusBBox[1] + campusBBox[3]) / 2, (campusBBox[0] + campusBBox[2]) / 2],
    17,
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Inicializar grupo de clustering
  markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 80,
    disableClusteringAtZoom: 19,
  });
}

// --- Carga de Datos GeoJSON ---
async function loadGeoJSONData() {
  try {
    const [routesResponse, poisResponse] = await Promise.all([
      fetch("/data/campus_routes.geojson"),
      fetch("/data/pois.geojson"),
    ]);

    routesGeo = await routesResponse.json();
    poisGeo = await poisResponse.json();

    const allowedBuildings = [
      "Edificio LISC",
      "Edificio H",
      "Edificio G",
      "Edificio LIE-2",
      "Edificio LIE-1",
      "Edificio CECT",
      "Edificio O",
      "Edificio J",
      "Edificio I",
      "Edificio de LII",
      "Edificio E",
      "Edificio CI",
      "Edificio D",
      "Edificio C",
      "Edificio F",
      "Edificio DPI",
      "Edificio LQG",
      "Edificio UVMA",
      "Edificio AC",
      "Edificio ACB",
      "Edificio ACA",
      "Edificio B",
      "Edificio A",
      "Edificio LIQP",
      "Edificio LCI",
      "Edificio LIEM",
      "Edificio LAI",
      "Edificio V",
      "Edificio S.G",
      "Edificio X",
      "Palapa",
      "Domo",
      "Cafetería",
      "Subestación Eléctrica",
    ];

    poisGeo.features = poisGeo.features.filter((feature) => {
      const name = feature.properties.name;
      return allowedBuildings.includes(name);
    });

    // Exponer poisGeo globalmente para floating_panel y map_destination_selector
    window.poisGeo = poisGeo;
    // Exponer getPOICategory para que otros módulos puedan usarla
    window.getPOICategory = getPOICategory;
    // Disparar evento para notificar que los POIs están listos
    window.dispatchEvent(
      new CustomEvent("poisLoaded", { detail: { poisGeo } }),
    );

    // Cargar rutas en el mapa
    const routeLayer = L.geoJson(routesGeo, {
      style: function (feature) {
        const highway = feature.properties.highway;
        let color = "#cccccc"; // Gris claro para todos los caminos
        let weight = 3;

        // Todos los caminos en gris claro para mejor contraste con rutas
        if (highway === "footway" || highway === "path") {
          weight = 2;
        } else if (highway === "residential") {
          weight = 3;
        } else if (highway === "service") {
          weight = 2;
        }

        return {
          color: color,
          weight: weight,
          opacity: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(
            `<b>Camino:</b> ${feature.properties.name}<br>Tipo: ${feature.properties.highway || "Desconocido"}`,
          );
        }
      },
    }).addTo(map);

    // Cargar POIs con clustering
    L.geoJson(poisGeo, {
      pointToLayer: (f, latlng) => {
        let iconColor = "#e74c3c";
        let iconClass = "fa-map-marker-alt";

        const category = getPOICategory(f.properties);
        switch (category) {
          case "Edificio":
            iconColor = "#3498db";
            iconClass = "fa-building";
            break;
          case "Aula":
            iconColor = "#27ae60";
            iconClass = "fa-chalkboard";
            break;
          case "Laboratorio":
            iconColor = "#9b59b6";
            iconClass = "fa-flask";
            break;
          case "Biblioteca":
            iconColor = "#e67e22";
            iconClass = "fa-book";
            break;
          case "Cafetería":
            iconColor = "#e74c3c";
            iconClass = "fa-utensils";
            break;
          case "Estacionamiento":
            iconColor = "#95a5a6";
            iconClass = "fa-parking";
            break;
          case "Deportes":
            iconColor = "#2ecc71";
            iconClass = "fa-running";
            break;
          case "Servicio":
            iconColor = "#f39c12";
            iconClass = "fa-info-circle";
            break;
        }

        const marker = L.marker(latlng, {
          icon: L.divIcon({
            className: "poi-marker",
            html: `<i class="fas ${iconClass}" style="color: ${iconColor}; font-size: 20px;"></i>`,
            iconSize: [20, 20],
          }),
        });

        // Crear popup mejorado
        const popupContent = createEnrichedPopup(f.properties, category);
        marker.bindPopup(popupContent);

        markerClusterGroup.addLayer(marker);
        return marker;
      },
    });

    map.addLayer(markerClusterGroup);

    // Ajustar vista al campus
    map.fitBounds(routeLayer.getBounds(), { padding: [20, 20] });

    // Construir grafo y cargar POIs en la interfaz
    buildGraphFromRoutes(routesGeo);
    populatePOIList();
    initializeSearchIndex();
    populateCategories();

    // Cargar POIs guardados
    loadSavedPOIs();

    showStatus(
      "route-status",
      "Datos del campus cargados correctamente. Selecciona tu ubicación y destino.",
      "success",
    );
  } catch (error) {
    console.error("Error loading data:", error);
    showStatus(
      "route-status",
      "Error cargando datos: " + error.message,
      "error",
    );
  }
}

// --- Crear Popup Enriquecido ---
function createEnrichedPopup(properties, category) {
  const name = properties.name || "Punto de interés";
  const description =
    properties.description ||
    properties.description_kml ||
    "Sin descripción disponible";

  let html = `
    <div class="poi-popup">
      <div class="poi-popup-header">
        <div class="poi-popup-title">${name}</div>
        <div class="poi-popup-category">${category}</div>
      </div>
      <div class="poi-popup-body">
  `;

  // Agregar galería de imágenes si existen
  if (buildingImages[name] && buildingImages[name].length > 0) {
    html += `<div class="poi-popup-gallery">`;
    buildingImages[name].forEach((imgPath, index) => {
      html += `<img src="${imgPath}" alt="${name} - Imagen ${index + 1}" class="poi-popup-image" onclick="openImageModal('${imgPath}', '${name}')" />`;
    });
    html += `</div>`;
  }

  // Agregar descripción si existe
  if (description && description.length > 0) {
    html += `<div class="poi-popup-description">${description}</div>`;
  }

  // Agregar horario si existe
  if (properties.opening_hours) {
    html += `<div class="poi-popup-schedule"><strong>Horario:</strong> ${properties.opening_hours}</div>`;
  }

  // Agregar botones de acción
  html += `
      <div class="poi-popup-actions">
        <button class="poi-popup-btn poi-popup-btn-primary" onclick="selectPOIFromPopup('${name}')">
          <i class="fas fa-arrow-right"></i> Ir
        </button>
        <button class="poi-popup-btn poi-popup-btn-secondary" onclick="savePOI('${name}')">
          <i class="fas fa-bookmark"></i> Guardar
        </button>
      </div>
      </div>
    </div>
  `;

  return html;
}

function selectPOIFromPopup(poiName) {
  const poi = poisGeo.features.find((p) => p.properties.name === poiName);
  if (poi) {
    selectEndPOI(poi, null);
  }
}

function savePOI(poiName) {
  // Guardar en localStorage
  let savedPOIs =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POIS)) || [];
  if (!savedPOIs.includes(poiName)) {
    savedPOIs.push(poiName);
    localStorage.setItem(STORAGE_KEYS.SAVED_POIS, JSON.stringify(savedPOIs));
    alert(`${poiName} guardado correctamente`);
    loadSavedPOIs();
  } else {
    alert(`${poiName} ya está guardado`);
  }
}

function loadSavedPOIs() {
  const savedPOIsList = document.getElementById("saved-pois-list");
  const savedPOIs =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POIS)) || [];

  if (savedPOIs.length === 0) {
    savedPOIsList.innerHTML =
      '<p class="empty-message">No tienes POIs guardados aún</p>';
    return;
  }

  savedPOIsList.innerHTML = "";
  savedPOIs.forEach((poiName) => {
    const poi = poisGeo.features.find((p) => p.properties.name === poiName);
    if (poi) {
      const category = getPOICategory(poi.properties);
      const html = `
        <div class="saved-poi-item">
          <div class="saved-poi-info" onclick="selectEndPOI(${JSON.stringify(poi).replace(/"/g, "&quot;")}, this)">
            <div class="saved-poi-name">${poi.properties.name}</div>
            <div class="saved-poi-category">${category}</div>
          </div>
          <div class="saved-poi-actions">
            <button onclick="removeSavedPOI('${poiName}')" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      savedPOIsList.innerHTML += html;
    }
  });
}

function removeSavedPOI(poiName) {
  let savedPOIs =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POIS)) || [];
  savedPOIs = savedPOIs.filter((name) => name !== poiName);
  localStorage.setItem(STORAGE_KEYS.SAVED_POIS, JSON.stringify(savedPOIs));
  loadSavedPOIs();
}

// --- Función para determinar la categoría de un POI ---
function getPOICategory(properties) {
  const name = properties.name || "";

  const buildingCategories = {
    "Edificio H": "Aulas",
    "Edificio G": "Aulas",
    "Edificio CECT": "Aulas",
    "Edificio J": "Aulas",
    "Edificio I": "Aulas",
    "Edificio E": "Aulas",
    "Edificio CI": "Aulas",
    "Edificio D": "Aulas",
    "Edificio C": "Aulas",
    "Edificio F": "Aulas",
    "Edificio DPI": "Aulas",
    "Edificio LQG": "Aulas",
    "Edificio AC": "Aulas",
    "Edificio B": "Aulas",
    "Edificio A": "Aulas",
    "Edificio LIEM": "Aulas",
    "Edificio LAI": "Aulas",
    "Edificio V": "Aulas",
    "Edificio S.G": "Aulas",
    "Edificio X": "Aulas",
    "Edificio LISC": "Laboratorios",
    "Edificio LIE-2": "Laboratorios",
    "Edificio LIE-1": "Laboratorios",
    "Edificio de LII": "Laboratorios",
    "Edificio UVMA": "Laboratorios",
    "Edificio LIQP": "Laboratorios",
    "Edificio LCI": "Laboratorios",
    "Edificio O": "Biblioteca",
    Palapa: "Cafetería",
    Cafetería: "Cafetería",
    Cafeteria: "Cafetería",
    "Cafetería Adicional": "Cafetería",
    Domo: "Deportes",
    "Edificio ACB": "Servicio",
    "Edificio ACA": "Servicio",
    "Subestación Eléctrica": "Servicio",
  };

  if (buildingCategories[name]) {
    return buildingCategories[name];
  }

  const amenity = properties.amenity || "";
  const building = properties.building || "";
  const highway = properties.highway || "";
  const leisure = properties.leisure || "";
  const sport = properties.sport || "";
  const office = properties.office || "";
  const shop = properties.shop || "";

  if (building && building !== "yes") return "Edificio";
  if (amenity === "university" || amenity === "college") return "Edificio";
  if (amenity === "library") return "Biblioteca";
  if (
    amenity === "cafe" ||
    amenity === "restaurant" ||
    name.toLowerCase().includes("cafetería") ||
    name.toLowerCase().includes("cafeteria")
  )
    return "Cafetería";
  if (amenity === "parking") return "Estacionamiento";
  if ((leisure && leisure !== "pitch") || sport) return "Deportes";
  if (name.toLowerCase().includes("laboratorio")) return "Laboratorio";
  if (name.toLowerCase().includes("aula")) return "Aula";
  if (highway && (highway === "footway" || highway === "path")) return "Camino";
  if (office) return "Oficina";
  if (shop) return "Tienda";

  return "Punto de Interés";
}

// --- Inicializar Índice de Búsqueda (Fuse.js) ---
function initializeSearchIndex() {
  const searchOptions = {
    keys: [
      "properties.name",
      "properties.description",
      "properties.description_kml",
    ],
    threshold: 0.3,
    includeScore: true,
  };

  fuseIndex = new Fuse(poisGeo.features, searchOptions);
}

// --- Búsqueda con Fuse.js ---
function performSearch(query) {
  if (!query || query.length < 2) {
    document.getElementById("search-results").innerHTML = "";
    document.getElementById("search-results-mobile").innerHTML = "";
    return;
  }

  const results = fuseIndex.search(query).slice(0, 10); // Limitar a 10 resultados

  let html = "";
  results.forEach((result) => {
    const poi = result.item;
    const category = getPOICategory(poi.properties);
    html += `
      <div class="search-result-item" onclick="selectEndPOI(${JSON.stringify(poi).replace(/"/g, "&quot;")}, this)">
        <div>
          <div class="search-result-name">${poi.properties.name}</div>
          <div class="search-result-category">${category}</div>
        </div>
        <i class="fas fa-chevron-right" style="color: #3498db;"></i>
      </div>
    `;
  });

  document.getElementById("search-results").innerHTML = html;
  document.getElementById("search-results-mobile").innerHTML = html;
}

// --- Funciones de Grafo (Dijkstra) ---
function coordToKey(coord) {
  return `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
}

function addNodeToGraph(coord) {
  const key = coordToKey(coord);
  if (!graph.coordsToId[key]) {
    const id = Object.keys(graph.nodes).length;
    graph.nodes[id] = coord;
    graph.coordsToId[key] = id;
    graph.adj[id] = [];
  }
  return graph.coordsToId[key];
}

function buildGraphFromRoutes(geo) {
  graph = { nodes: {}, coordsToId: {}, adj: {} };
  geo.features.forEach((f) => {
    const geom = f.geometry;
    const lines =
      geom.type === "LineString" ? [geom.coordinates] : geom.coordinates;
    lines.forEach((coords) => {
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i],
          b = coords[i + 1];
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (!pointInBBox(mid, campusBBox)) continue;
        const ida = addNodeToGraph(a),
          idb = addNodeToGraph(b);
        const dist = turf.distance(turf.point(a), turf.point(b), {
          units: "meters",
        });
        graph.adj[ida].push({ to: idb, dist, coordA: a, coordB: b });
        graph.adj[idb].push({ to: ida, dist, coordA: b, coordB: a });
      }
    });
  });
  console.log("Grafo construido. Nodos:", Object.keys(graph.nodes).length);
}

function findNearestNode(targetCoord) {
  let minDistance = Infinity;
  let nearestNodeId = null;
  let nearestNodeCoord = null;

  for (const nodeId in graph.nodes) {
    const nodeCoord = graph.nodes[nodeId];
    const dist = turf.distance(turf.point(targetCoord), turf.point(nodeCoord), {
      units: "meters",
    });
    if (dist < minDistance) {
      minDistance = dist;
      nearestNodeId = nodeId;
      nearestNodeCoord = nodeCoord;
    }
  }
  return { id: nearestNodeId, dist: minDistance, coord: nearestNodeCoord };
}

function dijkstra(startNodeId, endNodeId) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();

  for (const nodeId in graph.nodes) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  }
  distances[startNodeId] = 0;
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const { element: currentId, priority: currentDistance } = pq.dequeue();

    if (currentDistance > distances[currentId]) continue;
    if (currentId === endNodeId) break;

    for (const neighborEdge of graph.adj[currentId]) {
      const neighborId = neighborEdge.to;
      const distance = neighborEdge.dist;
      const newDistance = currentDistance + distance;

      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = currentId;
        pq.enqueue(neighborId, newDistance);
      }
    }
  }

  const path = [];
  let current = endNodeId;
  while (current !== null) {
    path.unshift(graph.nodes[current]);
    current = previous[current];
  }

  return {
    path: path.length > 1 ? path : [],
    distance: distances[endNodeId] === Infinity ? 0 : distances[endNodeId],
  };
}

// Implementación simple de Priority Queue
class PriorityQueue {
  constructor() {
    this.collection = [];
  }

  enqueue(element, priority) {
    const entry = { element, priority };
    let added = false;
    for (let i = 0; i < this.collection.length; i++) {
      if (entry.priority < this.collection[i].priority) {
        this.collection.splice(i, 0, entry);
        added = true;
        break;
      }
    }
    if (!added) {
      this.collection.push(entry);
    }
  }

  dequeue() {
    return this.collection.shift();
  }

  isEmpty() {
    return this.collection.length === 0;
  }
}

// --- UI Functions ---
function initEventListeners() {
  const sidebar = document.getElementById("sidebar");
  const bottomSheet = document.getElementById("bottom-sheet");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const btnLocate = document.getElementById("btn-locate");
  const btnLocateMobile = document.getElementById("btn-locate-mobile");
  const btnCalculateRoute = document.getElementById("btn-calculate-route");
  const btnCalculateRouteMobile = document.getElementById(
    "btn-calculate-route-mobile",
  );
  const routeInfo = document.getElementById("route-info");
  const routeClose = document.getElementById("route-close");
  const categoryFilter = document.getElementById("category-filter");
  const categoryFilterMobile = document.getElementById(
    "category-filter-mobile",
  );
  const btnHelp = document.getElementById("btn-help");
  const startPoiSelect = document.getElementById("start-poi-select");
  const startPoiSelectMobile = document.getElementById(
    "start-poi-select-mobile",
  );
  const searchInput = document.getElementById("search-input");
  const searchInputMobile = document.getElementById("search-input-mobile");

  // Toggle bottom sheet en móviles
  sidebarToggle.addEventListener("click", function () {
    const isOpen = bottomSheet.classList.toggle("active");
    sidebarToggle.setAttribute("aria-expanded", isOpen);
    bottomSheet.style.transform = isOpen ? "translateY(0)" : "translateY(100%)";
    bottomSheetOpen = isOpen;
  });

  // Cerrar bottom sheet al presionar Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && bottomSheet.classList.contains("active")) {
      bottomSheet.classList.remove("active");
      sidebarToggle.setAttribute("aria-expanded", "false");
      bottomSheet.style.transform = "translateY(100%)";
      bottomSheetOpen = false;
    }
  });

  // Cerrar información de ruta
  routeClose.addEventListener("click", function () {
    routeInfo.classList.remove("active");
    if (currentRoute) {
      map.removeLayer(currentRoute);
      currentRoute = null;
    }
    // **NUEVO: Detener el seguimiento de ruta al cerrar**
    stopRouteTracking();
    // Restaurar el mensaje de estado
    showStatus(
      "route-status",
      "Selecciona tu punto de inicio y destino para calcular la ruta.",
      "info",
    );
    showStatus(
      "route-status-mobile",
      "Selecciona tu punto de inicio y destino para calcular la ruta.",
      "info",
    );
  });

  // Botón de ayuda
  btnHelp.addEventListener("click", function () {
    alert(
      'ConoceTec - Guía de uso:\n\n1. Selecciona un punto de inicio (Mi ubicación actual o un edificio).\n2. Selecciona un punto de destino de la lista o búscalo.\n3. Haz clic en "Calcular Ruta" para obtener direcciones.\n4. Sigue la ruta roja en el mapa.\n\nCaracterísticas:\n- Navegación dentro del campus del Instituto Tecnológico de Minatitlán\n- Puntos de interés categorizados (Edificios, Aulas, Laboratorios, etc.)\n- Cálculo de rutas peatonales optimizadas\n- Búsqueda rápida con autocompletar\n- Información detallada de cada POI',
    );
  });

  // Función unificada para manejar el cambio de filtro de categoría
  const handleCategoryFilterChange = (selectElement) => {
    populatePOIList(selectElement.value);
    // Anunciar cambio para lectores de pantalla
    announceToScreenReader(
      `Filtrando por: ${selectElement.value || "todas las categorías"}`,
    );
  };

  // Event listener para el filtro de categoría (Desktop y Mobile)
  categoryFilter.addEventListener("change", () =>
    handleCategoryFilterChange(categoryFilter),
  );
  categoryFilterMobile.addEventListener("change", () =>
    handleCategoryFilterChange(categoryFilterMobile),
  );

  // Función unificada para manejar el cambio de punto de inicio
  const handleStartPOIChange = (selectElement, statusId) => {
    const selectedValue = selectElement.value;
    if (selectedValue === "current_location") {
      selectedStartPOI = null;
      showStatus(statusId, "Punto de inicio: Mi ubicación actual", "info");
    } else {
      selectedStartPOI = poisGeo.features.find(
        (poi) => poi.properties.name === selectedValue,
      );
      showStatus(statusId, `Punto de inicio: ${selectedValue}`, "info");
    }
    updateCalculateRouteButton();
  };

  // Event listener para el selector de punto de inicio (Desktop y Mobile)
  startPoiSelect.addEventListener("change", () =>
    handleStartPOIChange(startPoiSelect, "start-poi-status"),
  );
  startPoiSelectMobile.addEventListener("change", () =>
    handleStartPOIChange(startPoiSelectMobile, "start-poi-status-mobile"),
  );

  // Event listeners para búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      performSearch(this.value);
    });
  }

  if (searchInputMobile) {
    searchInputMobile.addEventListener("input", function () {
      performSearch(this.value);
    });
  }

  // Botones principales
  btnLocate.addEventListener("click", requestUserLocation);
  if (btnLocateMobile) {
    btnLocateMobile.addEventListener("click", requestUserLocation);
  }

  btnCalculateRoute.addEventListener("click", calculateRoute);
  if (btnCalculateRouteMobile) {
    btnCalculateRouteMobile.addEventListener("click", calculateRoute);
  }
}

// --- Bottom Sheet (Mobile) ---
function initBottomSheet() {
  const bottomSheet = document.getElementById("bottom-sheet");
  const handle = document.querySelector(".bottom-sheet-handle");
  const tabButtons = document.querySelectorAll(".tab-button");

  // Detectar dispositivo móvil
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    bottomSheet.classList.add("active");
  }

  // Manejo del arrastre del handle
  handle.addEventListener("mousedown", startDrag);
  handle.addEventListener("touchstart", startDrag);

  function startDrag(e) {
    bottomSheetStartY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  function drag(e) {
    const currentY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;
    const diff = currentY - bottomSheetStartY;

    if (diff > 50) {
      // Cerrar bottom sheet
      bottomSheet.style.transform = "translateY(100%)";
      bottomSheet.classList.remove("active");
      bottomSheetOpen = false;
    } else if (diff < -50) {
      // Abrir bottom sheet
      bottomSheet.style.transform = "translateY(0)";
      bottomSheet.classList.add("active");
      bottomSheetOpen = true;
    }
  }

  function endDrag() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchend", endDrag);
  }

  // Cambio de tabs
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      // Remover clase active de todos los botones y contenidos
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Agregar clase active al botón y contenido seleccionado
      this.classList.add("active");
      document.getElementById(`tab-${tabName}`).classList.add("active");

      // Cargar datos si es necesario
      if (tabName === "nearby" && lastUserCoord) {
        loadNearbyPOIs();
      } else if (tabName === "saved") {
        loadSavedPOIs();
      }
    });
  });
}

function loadNearbyPOIs() {
  if (!lastUserCoord) return;

  const nearbyList = document.getElementById("nearby-list");
  nearbyList.innerHTML = "";

  // Calcular distancia a cada POI (en metros)
  const poisWithDistance = poisGeo.features
    .map((poi) => {
      const [lon, lat] = poi.geometry.coordinates;
      const distance = calculateDistance(
        lastUserCoord[1],
        lastUserCoord[0],
        lat,
        lon,
      );
      return { poi, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15); // Top 15 cercanos

  if (poisWithDistance.length === 0) {
    nearbyList.innerHTML = '<p class="empty-message">No hay POIs cercanos</p>';
    return;
  }

  poisWithDistance.forEach(({ poi, distance }) => {
    const category = getPOICategory(poi.properties);
    const distanceText =
      distance < 1
        ? `${(distance * 1000).toFixed(0)} m`
        : `${distance.toFixed(2)} km`;
    const html = `
      <div class="nearby-item" onclick="selectEndPOI(${JSON.stringify(poi).replace(/"/g, "&quot;")}, this)">
        <div class="nearby-item-name">${poi.properties.name}</div>
        <div class="nearby-item-distance">${distanceText} - ${category}</div>
      </div>
    `;
    nearbyList.innerHTML += html;
  });
}

function populateCategories() {
  const categoriesList = document.getElementById("categories-list");
  const categories = {};

  poisGeo.features.forEach((poi) => {
    const category = getPOICategory(poi.properties);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(poi);
  });

  categoriesList.innerHTML = "";
  Object.keys(categories)
    .sort()
    .forEach((category) => {
      const count = categories[category].length;
      const html = `
      <div class="category-item" onclick="filterByCategory('${category}')">
        <div class="category-item-name">${category}</div>
        <div style="font-size: 12px; color: #7f8c8d;">${count} POIs</div>
      </div>
    `;
      categoriesList.innerHTML += html;
    });
}

function filterByCategory(category) {
  document.getElementById("category-filter").value = category;
  populatePOIList(category);
  // Cambiar a tab de destino en sidebar
  document
    .querySelector(".sidebar-section:nth-child(4)")
    .scrollIntoView({ behavior: "smooth" });
}

// Cargar POIs en la interfaz
function populatePOIList(filterCategory = "") {
  const poiListDesktop = document.getElementById("poi-list");
  const poiListMobile = document.getElementById("poi-list-mobile");
  const startPoiSelectDesktop = document.getElementById("start-poi-select");
  const startPoiSelectMobile = document.getElementById(
    "start-poi-select-mobile",
  );

  // Limpiar listas
  poiListDesktop.innerHTML = "";
  poiListMobile.innerHTML = "";

  // Resetear selectores de inicio
  startPoiSelectDesktop.innerHTML =
    '<option value="current_location">Mi Ubicación Actual</option>';
  startPoiSelectMobile.innerHTML =
    '<option value="current_location">Mi Ubicación Actual</option>';

  if (!poisGeo || !poisGeo.features) {
    poiListDesktop.innerHTML =
      '<div class="status-message status-error">Error cargando puntos de interés</div>';
    poiListMobile.innerHTML =
      '<div class="status-message status-error">Error cargando puntos de interés</div>';
    return;
  }

  let categorizedPOIs = {
    Aulas: [],
    Laboratorios: [],
    Biblioteca: [],
    Cafetería: [],
    Deportes: [],
    Servicio: [],
  };

  poisGeo.features.forEach((poi) => {
    const category = getPOICategory(poi.properties);
    if (categorizedPOIs[category]) {
      categorizedPOIs[category].push(poi);
    }
    const optionDesktop = document.createElement("option");
    optionDesktop.value = poi.properties.name;
    optionDesktop.textContent = poi.properties.name;
    startPoiSelectDesktop.appendChild(optionDesktop);

    const optionMobile = document.createElement("option");
    optionMobile.value = poi.properties.name;
    optionMobile.textContent = poi.properties.name;
    startPoiSelectMobile.appendChild(optionMobile);
  });

  let filteredPOIs = poisGeo.features;
  if (filterCategory) {
    filteredPOIs = poisGeo.features.filter(
      (poi) => getPOICategory(poi.properties) === filterCategory,
    );
  }

  for (const categoryName of Object.keys(categorizedPOIs)) {
    const poisInCategory = categorizedPOIs[categoryName];
    if (poisInCategory.length > 0) {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "poi-category";

      const categoryHeader = document.createElement("div");
      categoryHeader.className = "poi-category-header";
      categoryHeader.innerHTML = `<i class="fas fa-chevron-right"></i> ${categoryName} (${poisInCategory.length})`;
      categoryHeader.addEventListener("click", () => {
        categoryDiv.classList.toggle("active");
      });
      categoryDiv.appendChild(categoryHeader);

      const categoryContent = document.createElement("div");
      categoryContent.className = "poi-category-content";

      poisInCategory.sort((a, b) =>
        a.properties.name.localeCompare(b.properties.name),
      );

      poisInCategory.forEach((poi) => {
        const poiItem = document.createElement("div");
        poiItem.className = "poi-item";
        poiItem.innerHTML = `<span>${poi.properties.name}</span>`;
        poiItem.addEventListener("click", () => {
          selectEndPOI(poi, poiItem);
        });
        categoryContent.appendChild(poiItem);
      });
      categoryDiv.appendChild(categoryContent);

      // Clonar para la versión móvil
      const categoryDivMobile = categoryDiv.cloneNode(true);

      // Re-asignar event listeners para el clon móvil
      categoryDivMobile
        .querySelector(".poi-category-header")
        .addEventListener("click", () => {
          categoryDivMobile.classList.toggle("active");
        });

      // Re-asignar event listeners a los items del clon móvil
      categoryDivMobile.querySelectorAll(".poi-item").forEach((item, index) => {
        item.addEventListener("click", () => {
          selectEndPOI(poisInCategory[index], item);
        });
      });

      poiListDesktop.appendChild(categoryDiv);
      poiListMobile.appendChild(categoryDivMobile);
    }
  }
}

function selectEndPOI(poi, element) {
  selectedEndPOI = poi;
  document.getElementById("selected-poi-name").textContent =
    poi.properties.name;

  // Remover clase 'selected' de todos los elementos
  document
    .querySelectorAll(".poi-item")
    .forEach((item) => item.classList.remove("selected"));

  // Si se selecciona un elemento de la lista, marcarlo como seleccionado
  if (element) {
    element.classList.add("selected");
  }

  // Cerrar el popup de Leaflet si está abierto
  map.closePopup();

  // Abrir el bottom sheet en móvil y cambiar a la pestaña de Ubicación/Ruta
  const bottomSheet = document.getElementById("bottom-sheet");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Abrir el bottom sheet
    bottomSheet.classList.add("active");
    bottomSheet.style.transform = "translateY(0)";
    sidebarToggle.setAttribute("aria-expanded", "true");
    bottomSheetOpen = true;

    // Cambiar a la pestaña de Ubicación/Ruta (tab-location)
    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    document
      .querySelector('.tab-button[data-tab="location"]')
      .classList.add("active");
    document.getElementById("tab-location").classList.add("active");
  }

  // Actualizar estados de ruta
  showStatus(
    "route-status",
    `Destino seleccionado: ${poi.properties.name}`,
    "info",
  );
  showStatus(
    "route-status-mobile",
    `Destino seleccionado: ${poi.properties.name}`,
    "info",
  );
  updateCalculateRouteButton();
}

function updateCalculateRouteButton() {
  const btnCalculateRoute = document.getElementById("btn-calculate-route");
  const btnCalculateRouteMobile = document.getElementById(
    "btn-calculate-route-mobile",
  );

  const isDisabled = !(lastUserCoord || selectedStartPOI) || !selectedEndPOI;

  if (btnCalculateRoute) {
    btnCalculateRoute.disabled = isDisabled;
  }
  if (btnCalculateRouteMobile) {
    btnCalculateRouteMobile.disabled = isDisabled;
  }
}

// --- Gestión de ubicación del usuario ---
function requestUserLocation() {
  // Mostrar estado en ambos lugares
  showStatus("location-status", "Obteniendo ubicación...", "info");
  showStatus("location-status-mobile", "Obteniendo ubicación...", "info");

  if (!navigator.geolocation) {
    showStatus(
      "location-status",
      "Tu navegador no soporta geolocalización",
      "error",
    );
    showStatus(
      "location-status-mobile",
      "Tu navegador no soporta geolocalización",
      "error",
    );
    return;
  }

  navigator.geolocation.watchPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude; // Verificar si está dentro del campus
      if (!pointInBBox([lon, lat], campusBBox)) {
        showStatus(
          "location-status",
          "Estás fuera del campus. Usando ubicación aproximada.",
          "error",
        );
        showStatus(
          "location-status-mobile",
          "Estás fuera del campus. Usando ubicación aproximada.",
          "error",
        );
      } else {
        showStatus(
          "location-status",
          "Ubicación obtenida correctamente",
          "success",
        );
        showStatus(
          "location-status-mobile",
          "Ubicación obtenida correctamente",
          "success",
        );
      }
      if (userMarker) {
        userMarker.setLatLng([lat, lon]); // Actualizar posición en lugar de remover y crear
        lastUserCoord = [lon, lat]; // Actualizar la coordenada global
        loadNearbyPOIs(); // Recargar POIs cercanos con la nueva ubicación
      } else {
        userMarker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: "user-marker",
            html: '<i class="fas fa-user" style="color: #e74c3c; font-size: 20px;"></i>',
            iconSize: [20, 20],
          }),
        })
          .addTo(map)
          .bindPopup("<b>Tu ubicación actual</b>")
          .openPopup();
      } // Cerrar el else del userMarker

      // map.setView([lat, lon], 18); // Se comenta para evitar que el mapa salte constantemente en cada actualización

      updateCalculateRouteButton();
      if (selectedEndPOI) {
        showStatus("route-status", "Puedes calcular la ruta ahora", "success");
        showStatus(
          "route-status-mobile",
          "Puedes calcular la ruta ahora",
          "success",
        );
      }
    },
    function (error) {
      showStatus(
        "location-status",
        "Error obteniendo ubicación: " + error.message,
        "error",
      );
    },
  );
}

function updateLocation(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  if (!pointInBBox([lon, lat], campusBBox)) {
    showStatus(
      "location-status",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
    showStatus(
      "location-status-mobile",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
  } else {
    showStatus(
      "location-status",
      "Ubicación obtenida correctamente",
      "success",
    );
    showStatus(
      "location-status-mobile",
      "Ubicación obtenida correctamente",
      "success",
    );
  }

  if (userMarker) {
    userMarker.setLatLng([lat, lon]); // Actualizar posición en lugar de remover y crear
  } else {
    userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "user-marker",
        html: '<i class="fas fa-user" style="color: #e74c3c; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    })
      .addTo(map)
      .bindPopup("<b>Tu ubicación actual</b>")
      .openPopup();
  }

  lastUserCoord = [lon, lat]; // Actualizar la coordenada global
  loadNearbyPOIs(); // Recargar POIs cercanos con la nueva ubicación
  updateCalculateRouteButton();

  if (selectedEndPOI && !routeTrackingInterval) {
    showStatus("route-status", "Puedes calcular la ruta ahora", "success");
    showStatus(
      "route-status-mobile",
      "Puedes calcular la ruta ahora",
      "success",
    );
  }

  // Si hay una ruta activa, actualizar el progreso
  if (routeTrackingInterval) {
    updateRouteProgress();
  }
}

function locationError(error) {
  showStatus(
    "location-status",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
  showStatus(
    "location-status-mobile",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showStatus(
      "location-status",
      "La geolocalización no es soportada por tu navegador",
      "error",
    );
    return;
  }

  showStatus("location-status", "Obteniendo ubicación...", "info");
  showStatus("location-status-mobile", "Obteniendo ubicación...", "info");

  // Usar watchPosition para el seguimiento continuo
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(updateLocation, locationError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000,
  });
}

// --- Funciones de Seguimiento de Ruta ---
function startRouteTracking(routePath) {
  // Limpiar cualquier intervalo anterior
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
  }

  // Almacenar la ruta actual para el seguimiento
  currentRoutePath = routePath;

  // Iniciar el seguimiento cada 5 segundos
  // Nota: El watchPosition ya actualiza la ubicación, este intervalo es para la lógica de acortamiento
  routeTrackingInterval = setInterval(function () {
    if (lastUserCoord && currentRoutePath && currentRoutePath.length > 0) {
      updateRouteProgress();
    } else if (currentRoutePath && currentRoutePath.length === 0) {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  }, 5000); // Actualizar cada 5 segundos
}

function stopRouteTracking() {
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
    routeTrackingInterval = null;
  }
  currentRoutePath = null;
  // Opcional: detener watchPosition si no se necesita la ubicación para otra cosa
  // if (watchId) {
  //   navigator.geolocation.clearWatch(watchId);
  //   watchId = null;
  // }
}

function updateRouteProgress() {
  const userLon = lastUserCoord[0];
  const userLat = lastUserCoord[1];
  let nearestSegmentIndex = -1;
  let minDistance = Infinity;

  // Encontrar el punto más cercano en la ruta actual
  for (let i = 0; i < currentRoutePath.length; i++) {
    const [pathLon, pathLat] = currentRoutePath[i];
    const distance = calculateDistance(userLat, userLon, pathLat, pathLon);

    // Usar un umbral de 10 metros (0.01 km) para considerar que el usuario está en el camino
    if (distance < minDistance && distance < 0.01) {
      minDistance = distance;
      nearestSegmentIndex = i;
    }
  }

  if (nearestSegmentIndex !== -1) {
    // Si el usuario está cerca de un punto en la ruta, "acortar" la ruta
    // El nuevo inicio de la ruta es el punto más cercano + 1 (para evitar el punto que acaba de pasar)
    currentRoutePath = currentRoutePath.slice(nearestSegmentIndex + 1);

    if (currentRoutePath.length > 0) {
      // Redibujar la ruta acortada
      if (currentRoute) {
        map.removeLayer(currentRoute);
      }

      currentRoute = L.polyline(
        currentRoutePath.map((coord) => [coord[1], coord[0]]),
        {
          color: "#e74c3c",
          weight: 5,
          opacity: 0.8,
          dashArray: "5, 5",
        },
      ).addTo(map);

      // Actualizar la instrucción de navegación
      updateNavigationInstruction(userLat, userLon, currentRoutePath);
    } else {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  } else {
    // Si el usuario se desvía, notificar
    showStatus(
      "route-status",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
    showStatus(
      "route-status-mobile",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
  }
}

function updateNavigationInstruction(userLat, userLon, remainingPath) {
  if (remainingPath.length < 2) {
    document.getElementById("current-instruction").textContent =
      "Has llegado a tu destino.";
    return;
  }

  // El siguiente punto clave es el segundo punto en el camino restante (el primero es el punto de inicio del segmento actual)
  const nextPoint = remainingPath[0];
  const nextNextPoint = remainingPath[1];

  // Función para calcular el rumbo (bearing) entre dos puntos (simplificado)
  function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360; // Normalizar a 0-360
  }

  const bearingToNext = calculateBearing(
    userLat,
    userLon,
    nextPoint[1],
    nextPoint[0],
  );
  const bearingToNextNext = calculateBearing(
    nextPoint[1],
    nextPoint[0],
    nextNextPoint[1],
    nextNextPoint[0],
  );

  let turnAngle = bearingToNextNext - bearingToNext;

  // Normalizar el ángulo de giro a -180 a 180
  if (turnAngle > 180) {
    turnAngle -= 360;
  } else if (turnAngle < -180) {
    turnAngle += 360;
  }

  let instruction = "Continúa recto";

  // Usar un umbral de ángulo para determinar el giro
  if (Math.abs(turnAngle) > 15) {
    // Umbral para giros ligeros
    if (turnAngle > 0) {
      instruction = "Gira ligeramente a la derecha";
    } else {
      instruction = "Gira ligeramente a la izquierda";
    }
  }

  // Usar un umbral más grande para giros más pronunciados
  if (Math.abs(turnAngle) > 45) {
    if (turnAngle > 0) {
      instruction = "Gira a la derecha";
    } else {
      instruction = "Gira a la izquierda";
    }
  }

  // Usar un umbral muy grande para giros en U
  if (Math.abs(turnAngle) > 135) {
    instruction = "Gira en U";
  }

  // Si el usuario está muy cerca del siguiente punto, la instrucción debe ser hacia el siguiente segmento
  const distanceToNext =
    calculateDistance(userLat, userLon, nextPoint[1], nextPoint[0]) * 1000; // en metros

  let finalInstruction = "";
  if (distanceToNext < 10) {
    // Si está a menos de 10 metros del siguiente punto
    finalInstruction = `Prepárate para ${instruction} en el siguiente cruce.`;
  } else {
    finalInstruction = `${instruction} y continúa por ${distanceToNext.toFixed(0)} metros.`;
  }

  document.getElementById("current-instruction").textContent = finalInstruction;
}

function updateLocation(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  if (!pointInBBox([lon, lat], campusBBox)) {
    showStatus(
      "location-status",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
    showStatus(
      "location-status-mobile",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
  } else {
    showStatus(
      "location-status",
      "Ubicación obtenida correctamente",
      "success",
    );
    showStatus(
      "location-status-mobile",
      "Ubicación obtenida correctamente",
      "success",
    );
  }

  if (userMarker) {
    userMarker.setLatLng([lat, lon]); // Actualizar posición en lugar de remover y crear
  } else {
    userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "user-marker",
        html: '<i class="fas fa-user" style="color: #e74c3c; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    })
      .addTo(map)
      .bindPopup("<b>Tu ubicación actual</b>")
      .openPopup();
  }

  lastUserCoord = [lon, lat]; // Actualizar la coordenada global
  loadNearbyPOIs(); // Recargar POIs cercanos con la nueva ubicación
  updateCalculateRouteButton();

  if (selectedEndPOI && !routeTrackingInterval) {
    showStatus("route-status", "Puedes calcular la ruta ahora", "success");
    showStatus(
      "route-status-mobile",
      "Puedes calcular la ruta ahora",
      "success",
    );
  }

  // Si hay una ruta activa, actualizar el progreso
  if (routeTrackingInterval) {
    updateRouteProgress();
  }
}

function locationError(error) {
  showStatus(
    "location-status",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
  showStatus(
    "location-status-mobile",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showStatus(
      "location-status",
      "La geolocalización no es soportada por tu navegador",
      "error",
    );
    return;
  }

  showStatus("location-status", "Obteniendo ubicación...", "info");
  showStatus("location-status-mobile", "Obteniendo ubicación...", "info");

  // Usar watchPosition para el seguimiento continuo
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(updateLocation, locationError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000,
  });
}

// --- Funciones de Seguimiento de Ruta ---
function startRouteTracking(routePath) {
  // Limpiar cualquier intervalo anterior
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
  }

  // Almacenar la ruta actual para el seguimiento
  currentRoutePath = routePath;

  // Iniciar el seguimiento cada 5 segundos
  // Nota: El watchPosition ya actualiza la ubicación, este intervalo es para la lógica de acortamiento
  routeTrackingInterval = setInterval(function () {
    if (lastUserCoord && currentRoutePath && currentRoutePath.length > 0) {
      updateRouteProgress();
    } else if (currentRoutePath && currentRoutePath.length === 0) {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  }, 5000); // Actualizar cada 5 segundos
}

function stopRouteTracking() {
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
    routeTrackingInterval = null;
  }
  currentRoutePath = null;
  // Opcional: detener watchPosition si no se necesita la ubicación para otra cosa
  // if (watchId) {
  //   navigator.geolocation.clearWatch(watchId);
  //   watchId = null;
  // }
}

function updateRouteProgress() {
  const userLon = lastUserCoord[0];
  const userLat = lastUserCoord[1];
  let nearestSegmentIndex = -1;
  let minDistance = Infinity;

  // Encontrar el punto más cercano en la ruta actual
  for (let i = 0; i < currentRoutePath.length; i++) {
    const [pathLon, pathLat] = currentRoutePath[i];
    const distance = calculateDistance(userLat, userLon, pathLat, pathLon);

    // Usar un umbral de 10 metros (0.01 km) para considerar que el usuario está en el camino
    if (distance < minDistance && distance < 0.01) {
      minDistance = distance;
      nearestSegmentIndex = i;
    }
  }

  if (nearestSegmentIndex !== -1) {
    // Si el usuario está cerca de un punto en la ruta, "acortar" la ruta
    // El nuevo inicio de la ruta es el punto más cercano + 1 (para evitar el punto que acaba de pasar)
    currentRoutePath = currentRoutePath.slice(nearestSegmentIndex + 1);

    if (currentRoutePath.length > 0) {
      // Redibujar la ruta acortada
      if (currentRoute) {
        map.removeLayer(currentRoute);
      }

      currentRoute = L.polyline(
        currentRoutePath.map((coord) => [coord[1], coord[0]]),
        {
          color: "#e74c3c",
          weight: 5,
          opacity: 0.8,
          dashArray: "5, 5",
        },
      ).addTo(map);

      // Actualizar la instrucción de navegación
      updateNavigationInstruction(userLat, userLon, currentRoutePath);
    } else {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  } else {
    // Si el usuario se desvía, notificar
    showStatus(
      "route-status",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
    showStatus(
      "route-status-mobile",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
  }
}

function updateNavigationInstruction(userLat, userLon, remainingPath) {
  if (remainingPath.length < 2) {
    document.getElementById("current-instruction").textContent =
      "Has llegado a tu destino.";
    return;
  }

  // El siguiente punto clave es el segundo punto en el camino restante (el primero es el punto de inicio del segmento actual)
  const nextPoint = remainingPath[0];
  const nextNextPoint = remainingPath[1];

  // Función para calcular el rumbo (bearing) entre dos puntos (simplificado)
  function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360; // Normalizar a 0-360
  }

  const bearingToNext = calculateBearing(
    userLat,
    userLon,
    nextPoint[1],
    nextPoint[0],
  );
  const bearingToNextNext = calculateBearing(
    nextPoint[1],
    nextPoint[0],
    nextNextPoint[1],
    nextNextPoint[0],
  );

  let turnAngle = bearingToNextNext - bearingToNext;

  // Normalizar el ángulo de giro a -180 a 180
  if (turnAngle > 180) {
    turnAngle -= 360;
  } else if (turnAngle < -180) {
    turnAngle += 360;
  }

  let instruction = "Continúa recto";

  // Usar un umbral de ángulo para determinar el giro
  if (Math.abs(turnAngle) > 15) {
    // Umbral para giros ligeros
    if (turnAngle > 0) {
      instruction = "Gira ligeramente a la derecha";
    } else {
      instruction = "Gira ligeramente a la izquierda";
    }
  }

  // Usar un umbral más grande para giros más pronunciados
  if (Math.abs(turnAngle) > 45) {
    if (turnAngle > 0) {
      instruction = "Gira a la derecha";
    } else {
      instruction = "Gira a la izquierda";
    }
  }

  // Usar un umbral muy grande para giros en U
  if (Math.abs(turnAngle) > 135) {
    instruction = "Gira en U";
  }

  // Si el usuario está muy cerca del siguiente punto, la instrucción debe ser hacia el siguiente segmento
  const distanceToNext =
    calculateDistance(userLat, userLon, nextPoint[1], nextPoint[0]) * 1000; // en metros

  let finalInstruction = "";
  if (distanceToNext < 10) {
    // Si está a menos de 10 metros del siguiente punto
    finalInstruction = `Prepárate para ${instruction} en el siguiente cruce.`;
  } else {
    finalInstruction = `${instruction} y continúa por ${distanceToNext.toFixed(0)} metros.`;
  }

  document.getElementById("current-instruction").textContent = finalInstruction;
}

function updateLocation(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  if (!pointInBBox([lon, lat], campusBBox)) {
    showStatus(
      "location-status",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
    showStatus(
      "location-status-mobile",
      "Estás fuera del campus. Usando ubicación aproximada.",
      "error",
    );
  } else {
    showStatus(
      "location-status",
      "Ubicación obtenida correctamente",
      "success",
    );
    showStatus(
      "location-status-mobile",
      "Ubicación obtenida correctamente",
      "success",
    );
  }

  if (userMarker) {
    userMarker.setLatLng([lat, lon]); // Actualizar posición en lugar de remover y crear
  } else {
    userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "user-marker",
        html: '<i class="fas fa-user" style="color: #e74c3c; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    })
      .addTo(map)
      .bindPopup("<b>Tu ubicación actual</b>")
      .openPopup();
  }

  lastUserCoord = [lon, lat]; // Actualizar la coordenada global
  loadNearbyPOIs(); // Recargar POIs cercanos con la nueva ubicación
  updateCalculateRouteButton();

  if (selectedEndPOI && !routeTrackingInterval) {
    showStatus("route-status", "Puedes calcular la ruta ahora", "success");
    showStatus(
      "route-status-mobile",
      "Puedes calcular la ruta ahora",
      "success",
    );
  }

  // Si hay una ruta activa, actualizar el progreso
  if (routeTrackingInterval) {
    updateRouteProgress();
  }
}

function locationError(error) {
  showStatus(
    "location-status",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
  showStatus(
    "location-status-mobile",
    "Error obteniendo ubicación: " + error.message,
    "error",
  );
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showStatus(
      "location-status",
      "La geolocalización no es soportada por tu navegador",
      "error",
    );
    return;
  }

  showStatus("location-status", "Obteniendo ubicación...", "info");
  showStatus("location-status-mobile", "Obteniendo ubicación...", "info");

  // Usar watchPosition para el seguimiento continuo
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(updateLocation, locationError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000,
  });
}

// --- Funciones de Seguimiento de Ruta ---
function startRouteTracking(routePath) {
  // Limpiar cualquier intervalo anterior
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
  }

  // Almacenar la ruta actual para el seguimiento
  currentRoutePath = routePath;

  // Iniciar el seguimiento cada 5 segundos
  // Nota: El watchPosition ya actualiza la ubicación, este intervalo es para la lógica de acortamiento
  routeTrackingInterval = setInterval(function () {
    if (lastUserCoord && currentRoutePath && currentRoutePath.length > 0) {
      updateRouteProgress();
    } else if (currentRoutePath && currentRoutePath.length === 0) {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  }, 5000); // Actualizar cada 5 segundos
}

function stopRouteTracking() {
  if (routeTrackingInterval) {
    clearInterval(routeTrackingInterval);
    routeTrackingInterval = null;
  }
  currentRoutePath = null;
  // Opcional: detener watchPosition si no se necesita la ubicación para otra cosa
  // if (watchId) {
  //   navigator.geolocation.clearWatch(watchId);
  //   watchId = null;
  // }
}

function updateRouteProgress() {
  const userLon = lastUserCoord[0];
  const userLat = lastUserCoord[1];
  let nearestSegmentIndex = -1;
  let minDistance = Infinity;

  // Encontrar el punto más cercano en la ruta actual
  for (let i = 0; i < currentRoutePath.length; i++) {
    const [pathLon, pathLat] = currentRoutePath[i];
    const distance = calculateDistance(userLat, userLon, pathLat, pathLon);

    // Usar un umbral de 10 metros (0.01 km) para considerar que el usuario está en el camino
    if (distance < minDistance && distance < 0.01) {
      minDistance = distance;
      nearestSegmentIndex = i;
    }
  }

  if (nearestSegmentIndex !== -1) {
    // Si el usuario está cerca de un punto en la ruta, "acortar" la ruta
    // El nuevo inicio de la ruta es el punto más cercano + 1 (para evitar el punto que acaba de pasar)
    currentRoutePath = currentRoutePath.slice(nearestSegmentIndex + 1);

    if (currentRoutePath.length > 0) {
      // Redibujar la ruta acortada
      if (currentRoute) {
        map.removeLayer(currentRoute);
      }

      currentRoute = L.polyline(
        currentRoutePath.map((coord) => [coord[1], coord[0]]),
        {
          color: "#e74c3c",
          weight: 5,
          opacity: 0.8,
          dashArray: "5, 5",
        },
      ).addTo(map);

      // Actualizar la instrucción de navegación
      updateNavigationInstruction(userLat, userLon, currentRoutePath);
    } else {
      // Ruta completada
      stopRouteTracking();
      showStatus("route-status", "¡Has llegado a tu destino!", "success");
      showStatus(
        "route-status-mobile",
        "¡Has llegado a tu destino!",
        "success",
      );
      alert("¡Has llegado a tu destino!");
    }
  } else {
    // Si el usuario se desvía, notificar
    showStatus(
      "route-status",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
    showStatus(
      "route-status-mobile",
      "Parece que te has desviado de la ruta. Intenta volver al camino.",
      "warning",
    );
  }
}

function updateNavigationInstruction(userLat, userLon, remainingPath) {
  if (remainingPath.length < 2) {
    document.getElementById("current-instruction").textContent =
      "Has llegado a tu destino.";
    return;
  }

  // El siguiente punto clave es el segundo punto en el camino restante (el primero es el punto de inicio del segmento actual)
  const nextPoint = remainingPath[0];
  const nextNextPoint = remainingPath[1];

  // Función para calcular el rumbo (bearing) entre dos puntos (simplificado)
  function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360; // Normalizar a 0-360
  }

  const bearingToNext = calculateBearing(
    userLat,
    userLon,
    nextPoint[1],
    nextPoint[0],
  );
  const bearingToNextNext = calculateBearing(
    nextPoint[1],
    nextPoint[0],
    nextNextPoint[1],
    nextNextPoint[0],
  );

  let turnAngle = bearingToNextNext - bearingToNext;

  // Normalizar el ángulo de giro a -180 a 180
  if (turnAngle > 180) {
    turnAngle -= 360;
  } else if (turnAngle < -180) {
    turnAngle += 360;
  }

  let instruction = "Continúa recto";

  // Usar un umbral de ángulo para determinar el giro
  if (Math.abs(turnAngle) > 15) {
    // Umbral para giros ligeros
    if (turnAngle > 0) {
      instruction = "Gira ligeramente a la derecha";
    } else {
      instruction = "Gira ligeramente a la izquierda";
    }
  }

  // Usar un umbral más grande para giros más pronunciados
  if (Math.abs(turnAngle) > 45) {
    if (turnAngle > 0) {
      instruction = "Gira a la derecha";
    } else {
      instruction = "Gira a la izquierda";
    }
  }

  // Usar un umbral muy grande para giros en U
  if (Math.abs(turnAngle) > 135) {
    instruction = "Gira en U";
  }

  // Si el usuario está muy cerca del siguiente punto, la instrucción debe ser hacia el siguiente segmento
  const distanceToNext =
    calculateDistance(userLat, userLon, nextPoint[1], nextPoint[0]) * 1000; // en metros

  let finalInstruction = "";
  if (distanceToNext < 10) {
    // Si está a menos de 10 metros del siguiente punto
    finalInstruction = `Prepárate para ${instruction} en el siguiente cruce.`;
  } else {
    finalInstruction = `${instruction} y continúa por ${distanceToNext.toFixed(0)} metros.`;
  }

  document.getElementById("current-instruction").textContent = finalInstruction;
}

// --- Cálculo de Ruta ---
function calculateRoute() {
  if (!selectedEndPOI) {
    showStatus("route-status", "Por favor selecciona un destino", "error");
    return;
  }

  const startCoord = selectedStartPOI
    ? selectedStartPOI.geometry.coordinates
    : lastUserCoord;

  if (!startCoord) {
    showStatus(
      "route-status",
      "Por favor obtén tu ubicación o selecciona un punto de inicio",
      "error",
    );
    showStatus(
      "route-status-mobile",
      "Por favor obtén tu ubicación o selecciona un punto de inicio",
      "error",
    );
    return;
  }

  const endCoord = selectedEndPOI.geometry.coordinates;

  const startNode = findNearestNode(startCoord);
  const endNode = findNearestNode(endCoord);

  if (!startNode.id || !endNode.id) {
    showStatus("route-status", "No se puede calcular la ruta", "error");
    showStatus("route-status-mobile", "No se puede calcular la ruta", "error");
    return;
  }

  const routeResult = dijkstra(startNode.id, endNode.id);

  if (routeResult.path.length === 0) {
    showStatus("route-status", "No se encontró una ruta válida", "error");
    return;
  }

  // Mostrar ruta en el mapa
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }

  // Remover marcadores anteriores de inicio y fin
  if (routeStartMarker) {
    map.removeLayer(routeStartMarker);
  }
  if (routeEndMarker) {
    map.removeLayer(routeEndMarker);
  }

  const routeCoordinates = routeResult.path.map((coord) => [
    coord[0],
    coord[1],
  ]); // [lon, lat]

  currentRoute = L.polyline(
    routeCoordinates.map((coord) => [coord[1], coord[0]]), // [lat, lon] para Leaflet
    {
      color: "#e74c3c",
      weight: 5,
      opacity: 0.8,
      dashArray: "5, 5",
    },
  ).addTo(map);

  // Agregar marcador de INICIO (verde)
  const startLatLng = [startCoord[1], startCoord[0]]; // [lat, lon]
  routeStartMarker = L.marker(startLatLng, {
    icon: L.divIcon({
      className: "route-marker route-start-marker",
      html: '<div class="route-marker-icon"><i class="fas fa-play-circle"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  }).addTo(map);
  routeStartMarker.bindPopup("<b>Inicio de Ruta</b>");

  // Agregar marcador de FIN (rojo)
  const endLatLng = [endCoord[1], endCoord[0]]; // [lat, lon]
  routeEndMarker = L.marker(endLatLng, {
    icon: L.divIcon({
      className: "route-marker route-end-marker",
      html: '<div class="route-marker-icon"><i class="fas fa-flag-checkered"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  }).addTo(map);
  routeEndMarker.bindPopup(
    "<b>Destino</b><br>" + selectedEndPOI.properties.name,
  );

  // Calcular tiempo estimado (asumiendo 1.4 m/s = 5 km/h)
  const estimatedTime = Math.round(routeResult.distance / 1.4 / 60);

  // Mostrar información de la ruta
  document.getElementById("route-distance").textContent =
    `${(routeResult.distance / 1000).toFixed(2)} km`;
  document.getElementById("route-time").textContent =
    `${estimatedTime} minutos`;
  document.getElementById("route-info").classList.add("active");

  // Ajustar vista al mapa para mostrar la ruta
  map.fitBounds(currentRoute.getBounds(), { padding: [50, 50] });

  showStatus(
    "route-status",
    "Ruta calculada correctamente. ¡Iniciando seguimiento!",
    "success",
  );
  showStatus(
    "route-status-mobile",
    "Ruta calculada correctamente. ¡Iniciando seguimiento!",
    "success",
  );

  // **NUEVO: Iniciar el seguimiento de ruta en tiempo real**
  startRouteTracking(routeCoordinates);

  // Generar indicaciones paso a paso (iniciales)
  generateDirections(routeCoordinates);
  showDirectionsPanel();
}

// --- Accesibilidad: Anunciar cambios a lectores de pantalla ---
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

// --- Print Route ---
document.addEventListener("DOMContentLoaded", function () {
  const btnPrintRoute = document.getElementById("btn-print-route");
  if (btnPrintRoute) {
    btnPrintRoute.addEventListener("click", function () {
      if (!currentRoute) {
        alert("Por favor calcula una ruta primero");
        return;
      }
      window.print();
    });
  }
});

// --- Seguimiento en Tiempo Real y Indicaciones ---

// Variables globales para el seguimiento
let isTracking = false;
let trackingInterval = null;
let currentDirectionIndex = 0;
let routeDirections = [];
let routeCoordinates = [];

// Generar indicaciones paso a paso
function generateDirections(coordinates) {
  // Implementación más detallada de indicaciones paso a paso
  const directionsList = document.getElementById("directions-list");
  directionsList.innerHTML = "";

  if (coordinates.length < 2) {
    directionsList.innerHTML =
      '<li class="direction-step"><i class="fas fa-flag-checkered"></i><span>Has llegado a tu destino.</span></li>';
    return;
  }

  // Punto de inicio
  directionsList.innerHTML += `
    <li class="direction-step start-step">
      <i class="fas fa-map-pin"></i>
      <span>Comienza tu ruta.</span>
    </li>
  `;

  // Lógica para generar instrucciones de giro (simplificada)
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prevPoint = coordinates[i - 1];
    const currentPoint = coordinates[i];
    const nextPoint = coordinates[i + 1];

    // Calcular la distancia al siguiente punto (para la instrucción)
    const distance =
      calculateDistance(
        currentPoint[1],
        currentPoint[0],
        nextPoint[1],
        nextPoint[0],
      ) * 1000; // en metros

    // Función para calcular el rumbo (bearing) entre dos puntos (simplificado)
    function calculateBearing(lat1, lon1, lat2, lon2) {
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      lat1 = (lat1 * Math.PI) / 180;
      lat2 = (lat2 * Math.PI) / 180;

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      let brng = Math.atan2(y, x);
      brng = (brng * 180) / Math.PI;
      return (brng + 360) % 360; // Normalizar a 0-360
    }

    const bearingIn = calculateBearing(
      prevPoint[1],
      prevPoint[0],
      currentPoint[1],
      currentPoint[0],
    );
    const bearingOut = calculateBearing(
      currentPoint[1],
      currentPoint[0],
      nextPoint[1],
      nextPoint[0],
    );

    let turnAngle = bearingOut - bearingIn;

    // Normalizar el ángulo de giro a -180 a 180
    if (turnAngle > 180) {
      turnAngle -= 360;
    } else if (turnAngle < -180) {
      turnAngle += 360;
    }

    let instruction = "Continúa recto";
    let iconClass = "fa-arrow-up";

    // Usar un umbral de ángulo para determinar el giro
    if (Math.abs(turnAngle) > 15) {
      // Umbral para giros ligeros
      if (turnAngle > 0) {
        instruction = "Gira a la derecha";
        iconClass = "fa-arrow-right";
      } else {
        instruction = "Gira a la izquierda";
        iconClass = "fa-arrow-left";
      }
    }

    // Solo agregar una instrucción si hay un cambio significativo de dirección o es el final
    if (Math.abs(turnAngle) > 15 || i === coordinates.length - 2) {
      directionsList.innerHTML += `
        <li class="direction-step">
          <i class="fas ${iconClass}"></i>
          <span>${instruction} y continúa por ${distance.toFixed(0)} metros.</span>
        </li>
      `;
    }
  }

  // Punto de destino
  directionsList.innerHTML += `
    <li class="direction-step end-step">
      <i class="fas fa-flag-checkered"></i>
      <span>Has llegado a ${selectedEndPOI.properties.name}.</span>
    </li>
  `;
}

function showDirectionsPanel() {
  // Asegurarse de que el panel de instrucciones esté visible
  const directionsPanel = document.getElementById("route-directions");
  if (directionsPanel) {
    directionsPanel.classList.add("active");
  }
}

// Función para mostrar el panel de indicaciones
function showDirectionsPanel() {
  const panel = document.getElementById("directions-panel");
  panel.classList.add("active");

  // Mostrar las indicaciones
  displayDirectionsList();

  // Iniciar el seguimiento en tiempo real
  startRealTimeTracking();
}

// Función para mostrar la lista de indicaciones
function displayDirectionsList() {
  const list = document.getElementById("directions-list");
  list.innerHTML = "";

  routeDirections.forEach((dir, index) => {
    const item = document.createElement("div");
    item.className = "direction-item";
    if (index === currentDirectionIndex) {
      item.classList.add("active");
    }

    const icon = document.createElement("div");
    icon.className = "direction-icon";
    icon.innerHTML = `<i class="fas fa-${dir.icon}"></i>`;

    const text = document.createElement("div");
    text.className = "direction-text";

    const instruction = document.createElement("div");
    instruction.className = "direction-instruction";
    instruction.textContent = dir.instruction;

    const distance = document.createElement("div");
    distance.className = "direction-distance";
    distance.textContent =
      dir.distance > 0 ? `${dir.distance.toFixed(0)} m` : "Destino";

    text.appendChild(instruction);
    text.appendChild(distance);

    item.appendChild(icon);
    item.appendChild(text);

    list.appendChild(item);
  });
}

// Función para actualizar la indicación actual
function updateCurrentDirection() {
  const instruction = document.getElementById("current-instruction");

  if (currentDirectionIndex < routeDirections.length) {
    const dir = routeDirections[currentDirectionIndex];
    instruction.innerHTML = `
      <i class="fas fa-${dir.icon}"></i>
      <span>${dir.instruction}</span>
    `;
  }

  // Actualizar la lista
  displayDirectionsList();
}

// Función para iniciar el seguimiento en tiempo real
function startRealTimeTracking() {
  if (isTracking) return;

  isTracking = true;
  currentDirectionIndex = 0;

  const status = document.getElementById("directions-status");
  status.innerHTML =
    '<span class="tracking-indicator"></span> Siguiendo tu ubicación...';
  status.className = "directions-status";

  // Actualizar la posición cada 5 segundos
  trackingInterval = setInterval(() => {
    if (!lastUserCoord) {
      status.textContent = "Obteniendo ubicación...";
      return;
    }

    // Encontrar el punto más cercano en la ruta
    let closestIndex = 0;
    let closestDistance = Infinity;

    routeCoordinates.forEach((coord, index) => {
      const dist = calculateDistance(
        lastUserCoord[1],
        lastUserCoord[0],
        coord[1],
        coord[0],
      );

      if (dist < closestDistance) {
        closestDistance = dist;
        closestIndex = index;
      }
    });

    // Actualizar el índice de dirección
    if (closestIndex > currentDirectionIndex) {
      currentDirectionIndex = closestIndex;
      updateCurrentDirection();
    }

    // Actualizar la barra de progreso
    const totalDistance = routeDirections.reduce(
      (sum, dir) => sum + dir.distance,
      0,
    );
    const traveledDistance = routeDirections
      .slice(0, currentDirectionIndex)
      .reduce((sum, dir) => sum + dir.distance, 0);
    const progress = (traveledDistance / totalDistance) * 100;

    document.getElementById("progress-fill").style.width = progress + "%";
    document.getElementById("progress-distance").textContent =
      (traveledDistance / 1000).toFixed(2) + " km";
    document.getElementById("progress-total").textContent =
      (totalDistance / 1000).toFixed(2) + " km";

    // Verificar si el usuario ha llegado al destino
    if (closestDistance < 20) {
      // 20 metros de tolerancia
      if (currentDirectionIndex === routeDirections.length - 1) {
        stopRealTimeTracking();
        status.textContent = "¡Has llegado a tu destino!";
        status.className = "directions-status success";

        // Mostrar notificación
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("ConoceTec", {
            body: "¡Has llegado a tu destino!",
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%233498db' width='192' height='192'/><text x='50%' y='50%' font-size='80' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='central'>CT</text></svg>",
          });
        }
      }
    } else if (closestDistance > 100) {
      status.textContent = "Estás fuera de la ruta. Vuelve al camino.";
      status.className = "directions-status warning";
    } else {
      status.innerHTML =
        '<span class="tracking-indicator"></span> Siguiendo tu ubicación...';
      status.className = "directions-status";
    }
  }, 5000); // Actualizar cada 5 segundos
}

// Función para detener el seguimiento en tiempo real
function stopRealTimeTracking() {
  isTracking = false;
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}

// Función para cerrar el panel de indicaciones
function closeDirectionsPanel() {
  const panel = document.getElementById("directions-panel");
  panel.classList.remove("active");
  stopRealTimeTracking();
}

// Event listener para el botón de cerrar indicaciones
document.addEventListener("DOMContentLoaded", function () {
  const closeBtn = document.getElementById("directions-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeDirectionsPanel);
  }
});

// Solicitar permiso para notificaciones
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// --- Funciones para Modal de Imágenes ---
function openImageModal(imagePath, buildingName) {
  // Crear modal si no existe
  let modal = document.getElementById("image-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-modal";
    modal.className = "image-modal";
    modal.innerHTML = `
      <div class="image-modal-content">
        <span class="image-modal-close">&times;</span>
        <img class="image-modal-img" id="modal-image" src="" alt="">
        <div class="image-modal-caption" id="modal-caption"></div>
        <div class="image-modal-nav">
          <button class="image-modal-prev" id="modal-prev"><i class="fas fa-chevron-left"></i></button>
          <button class="image-modal-next" id="modal-next"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners para cerrar modal
    const closeBtn = modal.querySelector(".image-modal-close");
    closeBtn.onclick = closeImageModal;
    modal.onclick = function (e) {
      if (e.target === modal) {
        closeImageModal();
      }
    };

    // Event listeners para navegación
    document.getElementById("modal-prev").onclick = () => navigateImage(-1);
    document.getElementById("modal-next").onclick = () => navigateImage(1);

    // Navegación con teclado
    document.addEventListener("keydown", function (e) {
      if (modal.style.display === "flex") {
        if (e.key === "Escape") closeImageModal();
        if (e.key === "ArrowLeft") navigateImage(-1);
        if (e.key === "ArrowRight") navigateImage(1);
      }
    });
  }

  // Configurar modal
  const modalImg = document.getElementById("modal-image");
  const caption = document.getElementById("modal-caption");

  modal.style.display = "flex";
  modalImg.src = imagePath;
  caption.textContent = buildingName;

  // Guardar información para navegación
  modal.dataset.currentBuilding = buildingName;
  modal.dataset.currentImagePath = imagePath;
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function navigateImage(direction) {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  const buildingName = modal.dataset.currentBuilding;
  const currentPath = modal.dataset.currentImagePath;

  if (!buildingImages[buildingName]) return;

  const images = buildingImages[buildingName];
  const currentIndex = images.indexOf(currentPath);

  if (currentIndex === -1) return;

  let newIndex = currentIndex + direction;

  // Wrap around
  if (newIndex < 0) newIndex = images.length - 1;
  if (newIndex >= images.length) newIndex = 0;

  const newPath = images[newIndex];

  const modalImg = document.getElementById("modal-image");
  modalImg.src = newPath;
  modal.dataset.currentImagePath = newPath;
}
