/**
 * Waze Improvements Integration - Integración de mejoras tipo Waze/Google Maps
 * Este archivo conecta todos los módulos nuevos con la funcionalidad existente
 */

// Esperar a que todos los módulos estén cargados
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initializeWazeImprovements();
  }, 1000);
});

function initializeWazeImprovements() {
  console.log('Inicializando mejoras Waze/Google Maps...');

  // Conectar búsqueda avanzada con el mapa
  if (window.advancedSearch) {
    connectAdvancedSearch();
  }

  // Conectar panel de navegación con el cálculo de rutas
  if (window.navigationPanel) {
    connectNavigationPanel();
  }

  // Conectar generador de instrucciones con el cálculo de rutas
  if (window.routeInstructionsGenerator) {
    connectRouteInstructions();
  }

  // Conectar tarjeta de detalles de POI
  if (window.poiDetailsCard) {
    connectPOIDetailsCard();
  }

  console.log('Mejoras Waze/Google Maps inicializadas correctamente');
}

/**
 * Conecta la búsqueda avanzada con el mapa
 */
function connectAdvancedSearch() {
  console.log('Conectando búsqueda avanzada...');

  // Hacer que los POIs del mapa sean clickeables para abrir la tarjeta de detalles
  if (window.markerClusterGroup) {
    window.markerClusterGroup.on('click', function(e) {
      const marker = e.layer;
      if (marker.feature && marker.feature.properties) {
        const poi = {
          id: marker.feature.properties.id,
          name: marker.feature.properties.name || 'Sin nombre',
          coordinates: [marker.feature.geometry.coordinates[1], marker.feature.geometry.coordinates[0]],
          properties: marker.feature.properties
        };

        if (window.poiDetailsCard) {
          window.poiDetailsCard.openCard(poi);
        }
      }
    });
  }
}

/**
 * Conecta el panel de navegación con el cálculo de rutas
 */
function connectNavigationPanel() {
  console.log('Conectando panel de navegación...');

  // Interceptar el cálculo de rutas existente
  const originalCalculateRoute = window.calculateRoute;
  if (originalCalculateRoute) {
    window.calculateRoute = function() {
      // Llamar a la función original
      originalCalculateRoute.apply(this, arguments);

      // Después de calcular la ruta, generar instrucciones y mostrar panel
      setTimeout(() => {
        if (window.currentRoute && window.routeInstructionsGenerator && window.navigationPanel) {
          const routePath = window.currentRoute.coordinates || [];
          const instructions = window.routeInstructionsGenerator.generateInstructions(
            routePath,
            window.selectedStartPOI,
            window.selectedEndPOI
          );

          const totalDistance = window.routeInstructionsGenerator.calculateTotalDistance(routePath);
          const totalTime = window.routeInstructionsGenerator.calculateEstimatedTime(routePath);

          // Mostrar panel de navegación
          window.navigationPanel.startNavigation(instructions, totalDistance, totalTime, routePath);
        }
      }, 500);
    };
  }
}

/**
 * Conecta el generador de instrucciones con el cálculo de rutas
 */
function connectRouteInstructions() {
  console.log('Conectando generador de instrucciones...');

  // Esto se maneja en connectNavigationPanel
}

/**
 * Conecta la tarjeta de detalles de POI con el mapa
 */
function connectPOIDetailsCard() {
  console.log('Conectando tarjeta de detalles de POI...');

  // Hacer que los elementos de la lista de POIs abran la tarjeta de detalles
  document.addEventListener('click', function(e) {
    const poiItem = e.target.closest('.poi-item');
    if (poiItem && window.poiDetailsCard) {
      const poiName = poiItem.querySelector('.poi-name')?.textContent;
      const poiId = poiItem.dataset.poiId;

      // Buscar el POI en los datos
      if (window.poisGeo && window.poisGeo.features) {
        const feature = window.poisGeo.features.find(f => f.properties.id === poiId);
        if (feature) {
          const poi = {
            id: feature.properties.id,
            name: feature.properties.name || poiName,
            coordinates: feature.geometry.coordinates,
            properties: feature.properties
          };
          window.poiDetailsCard.openCard(poi);
        }
      }
    }
  });
}

/**
 * Función auxiliar para intercambiar origen y destino
 */
window.swapRoutePoints = function() {
  if (window.selectedStartPOI && window.selectedEndPOI) {
    const temp = window.selectedStartPOI;
    window.selectedStartPOI = window.selectedEndPOI;
    window.selectedEndPOI = temp;

    // Actualizar UI
    const startSelect = document.getElementById('start-poi-select');
    const categoryFilter = document.getElementById('category-filter');

    if (startSelect) {
      startSelect.value = window.selectedStartPOI.name;
    }

    if (categoryFilter) {
      categoryFilter.value = '';
    }

    // Recalcular ruta si existe
    const btnCalculateRoute = document.getElementById('btn-calculate-route');
    if (btnCalculateRoute) {
      btnCalculateRoute.click();
    }
  }
};

/**
 * Mejora la experiencia del usuario con animaciones suaves
 */
function enhanceUserExperience() {
  // Agregar transiciones suaves al cambiar vistas
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.style.transition = 'all 0.3s ease';
  }

  // Mejorar feedback visual en botones
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 100);
    });
  });
}

// Ejecutar mejoras de UX
enhanceUserExperience();

/**
 * Exportar funciones para uso externo
 */
window.WazeImprovements = {
  initializeWazeImprovements,
  connectAdvancedSearch,
  connectNavigationPanel,
  connectRouteInstructions,
  connectPOIDetailsCard
};
