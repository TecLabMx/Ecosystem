/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const campusBBox = [-94.5579, 18.0051, -94.5541, 18.0069]; // [minLon, minLat, maxLon, maxLat]

// Usamos var para que las variables se adjunten automáticamente al objeto window
// y sean accesibles desde otros scripts (como map_destination_improved.js)
var map;
var userMarker;
var routeStartMarker = null;
var routeEndMarker = null;
var selectedStartPOI = null;
var selectedEndPOI = null;
var lastUserCoord = null;
var lastUserBearing = 0;
var currentRoute;
var currentRoutePath = null;
var routeTrackingInterval = null;
var watchId = null;

var routesGeo;
var poisGeo;
var fuseIndex;

var graph = { nodes: {}, coordsToId: {}, adj: {} };
var markerClusterGroup;

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  loadGeoJSONData();
  requestUserLocation();
});

// --- Funciones de Utilidad ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function pointInBBox(point, bbox) {
  const [lon, lat] = point;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
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
  }).setView([(campusBBox[1] + campusBBox[3]) / 2, (campusBBox[0] + campusBBox[2]) / 2], 17);

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
      fetch("data/campus_routes.geojson"),
      fetch("data/pois.geojson"),
    ]);

    routesGeo = await routesResponse.json();
    poisGeo = await poisResponse.json();

    const allowedBuildings = [
      "Edificio LISC", "Edificio H", "Edificio G", "Edificio LIE-2", "Edificio LIE-1",
      "Edificio CECT", "Edificio O", "Edificio J", "Edificio I", "Edificio de LII",
      "Edificio E", "Edificio CI", "Edificio D", "Edificio C", "Edificio F",
      "Edificio DPI", "Edificio LQG", "Edificio UVMA", "Edificio AC", "Edificio ACB",
      "Edificio ACA", "Edificio B", "Edificio A", "Edificio LIQP", "Edificio LCI",
      "Edificio LIEM", "Edificio LAI", "Edificio V", "Edificio S.G", "Edificio X",
      "Palapa", "Domo", "Cafetería", "Subestación Eléctrica"
    ];

    poisGeo.features = poisGeo.features.filter(feature => {
      const name = feature.properties.name;
      return allowedBuildings.includes(name);
    });

    // Cargar rutas en el mapa
    const routeLayer = L.geoJson(routesGeo, {
      style: function (feature) {
        const highway = feature.properties.highway;
        let color = "#cccccc";
        let weight = 3;

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
          layer.bindPopup(`<b>Camino:</b> ${feature.properties.name}<br>Tipo: ${feature.properties.highway || 'Desconocido'}`);
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

    // Construir grafo
    buildGraphFromRoutes(routesGeo);

    console.log("Datos del campus cargados correctamente");
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// --- Obtener Categoría del POI ---
function getPOICategory(properties) {
  const name = properties.name || "";
  const type = properties.type || "";

  if (name.includes("Edificio")) return "Edificio";
  if (name.includes("Aula")) return "Aula";
  if (name.includes("Laboratorio") || name.includes("Lab")) return "Laboratorio";
  if (name.includes("Biblioteca")) return "Biblioteca";
  if (name.includes("Cafetería") || name.includes("Comedor")) return "Cafetería";
  if (name.includes("Estacionamiento")) return "Estacionamiento";
  if (name.includes("Cancha") || name.includes("Deportes")) return "Deportes";
  return "Servicio";
}

// --- Crear Popup Enriquecido ---
function createEnrichedPopup(properties, category) {
  const name = properties.name || "Punto de interés";
  const description = properties.description || properties.description_kml || "Sin descripción disponible";
  
  let html = `
    <div class="poi-popup">
      <div class="poi-popup-header">
        <div class="poi-popup-title">${name}</div>
        <div class="poi-popup-category">${category}</div>
      </div>
      <div class="poi-popup-body">
  `;

  // Agregar galería de imágenes si existen
  if (typeof buildingImages !== 'undefined' && buildingImages[name] && buildingImages[name].length > 0) {
    html += `<div class="poi-popup-gallery">`;
    buildingImages[name].forEach((imgPath, index) => {
      html += `<img src="${imgPath}" alt="${name} - Imagen ${index + 1}" class="poi-popup-image" />`;
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

  html += `
      </div>
    </div>
  `;

  return html;
}

// --- Ubicación del Usuario ---
function requestUserLocation() {
  if (!navigator.geolocation) {
    console.error("Geolocalización no disponible");
    return;
  }

  // Usar watchPosition para obtener actualizaciones continuas
  watchId = navigator.geolocation.watchPosition(
    function (position) {
      const { latitude, longitude, heading } = position.coords;
      const newCoord = [longitude, latitude]; // [lng, lat]

      // Calcular el bearing si no está disponible (simulación)
      let currentBearing = heading !== null ? heading : lastUserBearing;
      
      if (lastUserCoord) {
        // Calcular bearing entre la última posición y la nueva
        const prevLat = lastUserCoord[1];
        const prevLon = lastUserCoord[0];
        
        // Usar turf.bearing para un cálculo más preciso
        const bearing = turf.bearing(turf.point([prevLon, prevLat]), turf.point(newCoord));
        currentBearing = bearing;
      }
      
      lastUserCoord = newCoord;
      lastUserBearing = currentBearing;

      // Crear el ícono de persona caminando
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `<i class="fas fa-walking" style="transform: rotate(${currentBearing}deg); color: #3498db; font-size: 28px;"></i>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      if (userMarker) {
        userMarker.setLatLng([latitude, longitude]);
        userMarker.setIcon(userIcon);
      } else {
        userMarker = L.marker([latitude, longitude], {
          icon: userIcon,
        }).addTo(map);
        userMarker.bindPopup("Tu ubicación actual");
        map.setView([latitude, longitude], 17);
      }
      
      // Actualizar la vista del mapa para seguir al usuario si la navegación está activa
      if (window.WazeNavigation && WazeNavigation.trackingIntervalId) {
          WazeNavigation.recenterMap();
      }
      
    },
    function (error) {
      console.error("Error obteniendo ubicación:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}

// Detener el seguimiento de la ubicación cuando sea necesario
function stopUserLocationTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// --- Sistema de Rutas (Dijkstra) ---
function addNodeToGraph(coord) {
  const key = coord.join(",");
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
    const lines = geom.type === "LineString" ? [geom.coordinates] : geom.coordinates;
    lines.forEach((coords) => {
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i], b = coords[i + 1];
        const ida = addNodeToGraph(a), idb = addNodeToGraph(b);
        const dist = turf.distance(turf.point(a), turf.point(b), { units: "meters" });
        graph.adj[ida].push({ to: idb, dist });
        graph.adj[idb].push({ to: ida, dist });
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
    const dist = turf.distance(turf.point(targetCoord), turf.point(nodeCoord), { units: "meters" });
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

class PriorityQueue {
  constructor() { this.collection = []; }
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
    if (!added) this.collection.push(entry);
  }
  dequeue() { return this.collection.shift(); }
  isEmpty() { return this.collection.length === 0; }
}

function calculateRoute() {
  if (!selectedEndPOI) return;
  const startCoord = selectedStartPOI ? selectedStartPOI.coordinates : lastUserCoord;
  if (!startCoord) return;
  const endCoord = selectedEndPOI.coordinates;
  const startNode = findNearestNode(startCoord);
  const endNode = findNearestNode(endCoord);
  if (startNode.id === null || endNode.id === null) return;
  const routeResult = dijkstra(startNode.id, endNode.id);
  if (routeResult.path.length === 0) return;

  if (currentRoute) map.removeLayer(currentRoute);
  currentRoute = L.polyline(routeResult.path.map(c => [c[1], c[0]]), {
    color: "#e74c3c", weight: 5, opacity: 0.8, dashArray: "5, 5"
  }).addTo(map);

  window.currentRoute = currentRoute; // Para integración con Waze
  return routeResult;
}

// Stub functions para compatibilidad
function announceToScreenReader(message) {
  console.log("Anuncio:", message);
}
