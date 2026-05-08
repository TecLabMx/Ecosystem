/**
 * Map Destination Selector - Selector de destino interactivo en el mapa
 * Permite seleccionar puntos directamente en el mapa con tarjeta flotante compacta
 */

class MapDestinationSelector {
  constructor() {
    this.selectedPOI = null;
    this.floatingCard = null;
    this.isSelecting = false;
    this.mapClickListener = null;
    this.init();
  }

  init() {
    this.createFloatingCard();
    this.attachEventListeners();
  }

  /**
   * Crea la tarjeta flotante compacta
   */
  createFloatingCard() {
    const cardHTML = `
      <div id="destination-selector-card" class="destination-selector-card hidden">
        <!-- Indicador de selección -->
        <div class="selector-indicator">
          <i class="fas fa-map-pin"></i>
        </div>

        <!-- Contenido compacto -->
        <div class="selector-content">
          <!-- Nombre del POI -->
          <div class="selector-poi-name" id="selector-poi-name">Selecciona un punto</div>
          
          <!-- Información compacta -->
          <div class="selector-info">
            <div class="info-item">
              <i class="fas fa-ruler"></i>
              <span id="selector-distance">0 m</span>
            </div>
            <div class="info-item">
              <i class="fas fa-tag"></i>
              <span id="selector-category">Categoría</span>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="selector-actions">
          <button class="btn-selector-select" id="btn-selector-select" title="Seleccionar como destino">
            <i class="fas fa-check"></i>
            <span>Seleccionar</span>
          </button>
          <button class="btn-selector-close" id="btn-selector-close" title="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.insertAdjacentHTML('beforeend', cardHTML);
      this.floatingCard = document.getElementById('destination-selector-card');
    }
  }

  /**
   * Adjunta los event listeners
   */
  attachEventListeners() {
    // Botón de seleccionar
    document.getElementById('btn-selector-select')?.addEventListener('click', () => {
      this.confirmSelection();
    });

    // Botón de cerrar
    document.getElementById('btn-selector-close')?.addEventListener('click', () => {
      this.closeCard();
    });

    // Click en el mapa para seleccionar destino
    if (window.map) {
      window.map.on('click', (e) => {
        if (this.isSelecting) {
          this.handleMapClick(e);
        }
      });
    }

    // Permitir seleccionar al hacer click en marcadores
    document.addEventListener('click', (e) => {
      const poiItem = e.target.closest('.poi-item');
      if (poiItem) {
        const poiName = poiItem.querySelector('.poi-name')?.textContent;
        const poiId = poiItem.dataset.poiId;
        this.selectPOIFromList(poiName, poiId);
      }
    });
  }

  /**
   * Inicia el modo de selección en el mapa
   */
  startMapSelection() {
    this.isSelecting = true;
    
    // Cambiar cursor del mapa
    if (window.map) {
      window.map._container.style.cursor = 'crosshair';
    }

    // Mostrar instrucción
    this.showInstruction('Haz clic en el mapa para seleccionar el destino');
  }

  /**
   * Detiene el modo de selección
   */
  stopMapSelection() {
    this.isSelecting = false;
    
    // Restaurar cursor del mapa
    if (window.map) {
      window.map._container.style.cursor = 'grab';
    }
  }

  /**
   * Maneja el click en el mapa
   */
  handleMapClick(e) {
    const { lat, lng } = e.latlng;

    // Buscar el POI más cercano
    const nearestPOI = this.findNearestPOI(lat, lng);

    if (nearestPOI) {
      this.displayPOICard(nearestPOI, lat, lng);
    } else {
      // Si no hay POI cercano, mostrar opción genérica
      this.displayGenericLocation(lat, lng);
    }

    this.stopMapSelection();
  }

  /**
   * Busca el POI más cercano a las coordenadas
   */
  findNearestPOI(lat, lng) {
    if (!window.poisGeo || !window.poisGeo.features) {
      return null;
    }

    let nearest = null;
    let minDistance = 50; // Distancia máxima en metros

    window.poisGeo.features.forEach(feature => {
      const [poiLng, poiLat] = feature.geometry.coordinates;
      const distance = this.calculateDistance(lat, lng, poiLat, poiLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          id: feature.properties.id,
          name: feature.properties.name || 'Sin nombre',
          coordinates: [poiLng, poiLat],
          category: this.getCategoryFromProperties(feature.properties),
          properties: feature.properties,
          distance: distance
        };
      }
    });

    return nearest;
  }

  /**
   * Muestra la tarjeta con información del POI
   */
  displayPOICard(poi, userLat, userLng) {
    this.selectedPOI = poi;

    // Actualizar contenido
    document.getElementById('selector-poi-name').textContent = poi.name;
    document.getElementById('selector-category').textContent = poi.category;

    // Calcular distancia desde ubicación actual
    if (window.userMarker) {
      const userLatLng = window.userMarker.getLatLng();
      const distance = this.calculateDistance(
        userLatLng.lat,
        userLatLng.lng,
        poi.coordinates[1],
        poi.coordinates[0]
      );
      document.getElementById('selector-distance').textContent = this.formatDistance(distance);
    }

    // Mostrar tarjeta
    this.showCard();

    // Centrar mapa en el POI
    if (window.map) {
      window.map.setView([poi.coordinates[1], poi.coordinates[0]], 18);
    }
  }

  /**
   * Muestra una ubicación genérica
   */
  displayGenericLocation(lat, lng) {
    this.selectedPOI = {
      id: `generic_${Date.now()}`,
      name: 'Ubicación seleccionada',
      coordinates: [lng, lat],
      category: 'Ubicación',
      properties: {}
    };

    // Actualizar contenido
    document.getElementById('selector-poi-name').textContent = 'Ubicación seleccionada';
    document.getElementById('selector-category').textContent = 'Punto personalizado';

    // Calcular distancia
    if (window.userMarker) {
      const userLatLng = window.userMarker.getLatLng();
      const distance = this.calculateDistance(
        userLatLng.lat,
        userLatLng.lng,
        lat,
        lng
      );
      document.getElementById('selector-distance').textContent = this.formatDistance(distance);
    }

    // Mostrar tarjeta
    this.showCard();

    // Centrar mapa
    if (window.map) {
      window.map.setView([lat, lng], 18);
    }
  }

  /**
   * Selecciona un POI desde la lista
   */
  selectPOIFromList(poiName, poiId) {
    if (!window.poisGeo || !window.poisGeo.features) {
      return;
    }

    const feature = window.poisGeo.features.find(f => f.properties.id === poiId);
    if (feature) {
      const poi = {
        id: feature.properties.id,
        name: feature.properties.name || poiName,
        coordinates: feature.geometry.coordinates,
        category: this.getCategoryFromProperties(feature.properties),
        properties: feature.properties
      };

      this.displayPOICard(poi, feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    }
  }

  /**
   * Confirma la selección y genera la ruta
   */
  confirmSelection() {
    if (!this.selectedPOI) {
      return;
    }

    // Establecer como destino global
    window.selectedEndPOI = {
      name: this.selectedPOI.name,
      coordinates: this.selectedPOI.coordinates,
      properties: this.selectedPOI.properties || {}
    };

    // Mostrar mensaje de confirmación
    showStatus('route-status', `Destino seleccionado: ${this.selectedPOI.name}`, 'success');

    // Cerrar tarjeta
    this.closeCard();

    // Habilitar botón de calcular ruta
    const btnCalculateRoute = document.getElementById('btn-calculate-route');
    if (btnCalculateRoute && window.selectedStartPOI) {
      btnCalculateRoute.disabled = false;
      
      // Mostrar opción de calcular ruta automáticamente
      setTimeout(() => {
        this.showCalculateRoutePrompt();
      }, 500);
    }
  }

  /**
   * Muestra un prompt para calcular la ruta
   */
  showCalculateRoutePrompt() {
    const btnCalculateRoute = document.getElementById('btn-calculate-route');
    if (btnCalculateRoute) {
      // Animar el botón para llamar la atención
      btnCalculateRoute.style.animation = 'pulse 1s ease-in-out 2';
      
      // Después de 2 segundos, permitir que el usuario haga clic
      setTimeout(() => {
        btnCalculateRoute.style.animation = 'none';
      }, 2000);
    }
  }

  /**
   * Muestra la tarjeta
   */
  showCard() {
    if (this.floatingCard) {
      this.floatingCard.classList.remove('hidden');
      this.floatingCard.classList.add('visible');
    }
  }

  /**
   * Cierra la tarjeta
   */
  closeCard() {
    if (this.floatingCard) {
      this.floatingCard.classList.remove('visible');
      this.floatingCard.classList.add('hidden');
    }
    this.selectedPOI = null;
  }

  /**
   * Muestra instrucción temporal
   */
  showInstruction(message) {
    const instruction = document.createElement('div');
    instruction.className = 'map-instruction';
    instruction.textContent = message;
    
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.appendChild(instruction);
      
      setTimeout(() => {
        instruction.remove();
      }, 3000);
    }
  }

  /**
   * Obtiene la categoría de las propiedades
   */
  getCategoryFromProperties(properties) {
    const categoryMap = {
      'amenity': 'Servicios',
      'leisure': 'Recreación',
      'building': 'Edificios',
      'shop': 'Tiendas',
      'cafe': 'Cafeterías',
      'restaurant': 'Restaurantes',
      'library': 'Biblioteca',
      'parking': 'Estacionamiento'
    };

    for (const [key, category] of Object.entries(categoryMap)) {
      if (properties[key]) return category;
    }

    return 'Otros';
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Formatea la distancia
   */
  formatDistance(meters) {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + ' km';
    }
    return Math.round(meters) + ' m';
  }

  /**
   * Obtiene el selector para iniciar selección desde la UI
   */
  getStartSelectionButton() {
    return document.getElementById('btn-start-map-selection');
  }
}

// Instancia global
let mapDestinationSelector;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    mapDestinationSelector = new MapDestinationSelector();
  }, 500);
});
