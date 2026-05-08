/* ========================================
   SISTEMA MEJORADO DE SELECCIÓN DE DESTINO
   Versión optimizada para PC y móviles
   ======================================== */

const MapDestinationSelector = {
  // Estado
  state: {
    selectedPOI: null,
    isCardVisible: false,
    destinationMarker: null
  },
  
  // Inicializar
  init() {
    this.setupMapClickListener();
    this.createDestinationCard();
    console.log('✓ Sistema de selección de destino mejorado inicializado');
  },
  
  // Crear tarjeta de destino mejorada (SIMPLIFICADA)
  createDestinationCard() {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.id = 'destination-card';
    card.style.display = 'none';
    
    card.innerHTML = `
      <div class="destination-card-header">
        <button class="destination-card-close" id="destination-card-close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="destination-card-content">
        <div class="destination-icon" id="destination-icon">
          <i class="fas fa-building"></i>
        </div>
        
        <div class="destination-info">
          <h3 class="destination-name" id="destination-name">Nombre del lugar</h3>
          <p class="destination-category" id="destination-category">Categoría</p>
        </div>
        
        <!-- Imagen y descripción eliminadas por redundancia -->
      </div>
      
      <div class="destination-card-actions">
        <button class="btn-destination-primary" id="btn-set-destination">
          <i class="fas fa-map-marker-alt"></i>
          Establecer como destino
        </button>
        
        <button class="btn-destination-secondary" id="btn-generate-route" style="display: none;">
          <i class="fas fa-route"></i>
          Generar ruta
        </button>
      </div>
    `;
    
    document.body.appendChild(card);
    this.setupCardListeners();
  },
  
  // Configurar listeners de la tarjeta
  setupCardListeners() {
    // Cerrar tarjeta
    document.getElementById('destination-card-close').addEventListener('click', () => {
      this.hideCard();
    });
    
    // Establecer destino
    document.getElementById('btn-set-destination').addEventListener('click', () => {
      this.setAsDestination();
    });
    
    // Generar ruta
    document.getElementById('btn-generate-route').addEventListener('click', () => {
      this.generateRoute();
    });
  },
  
  // Configurar listener de clics en el mapa
  setupMapClickListener() {
    // Esperar a que el mapa esté listo
    const checkMap = setInterval(() => {
      if (typeof map !== 'undefined' && map) {
        clearInterval(checkMap);
        
        // Listener para clics en marcadores de POI
        map.on('popupopen', (e) => {
          const popup = e.popup;
          const latlng = popup.getLatLng();
          
          // Buscar el POI correspondiente
          if (typeof poisGeo !== 'undefined' && poisGeo.features) {
            const poi = this.findPOIByCoordinates(latlng.lat, latlng.lng);
            if (poi) {
              this.showCard(poi, latlng);
            }
          }
        });
      }
    }, 100);
  },
  
  // Buscar POI por coordenadas
  findPOIByCoordinates(lat, lng) {
    if (typeof poisGeo === 'undefined') return null;
    
    const tolerance = 0.0001; // Tolerancia ajustada
    
    for (const feature of poisGeo.features) {
      if (feature.geometry.type === 'Point') {
        const [poiLng, poiLat] = feature.geometry.coordinates;
        
        if (Math.abs(poiLat - lat) < tolerance && Math.abs(poiLng - lng) < tolerance) {
          return {
            name: feature.properties.name || 'Punto de interés',
            description: feature.properties.description || feature.properties.description_kml || 'Sin descripción disponible',
            category: this.getPOICategory(feature.properties),
            coordinates: [poiLng, poiLat],
            properties: feature.properties
          };
        }
      }
    }
    
    return null;
  },
  
  // Obtener categoría del POI
  getPOICategory(properties) {
    const name = properties.name || "";
    
    if (name.includes("Edificio")) return "Edificio";
    if (name.includes("Aula")) return "Aula";
    if (name.includes("Laboratorio") || name.includes("Lab")) return "Laboratorio";
    if (name.includes("Biblioteca")) return "Biblioteca";
    if (name.includes("Cafetería") || name.includes("Comedor")) return "Cafetería";
    if (name.includes("Estacionamiento")) return "Estacionamiento";
    if (name.includes("Cancha") || name.includes("Deportes")) return "Deportes";
    return "Servicio";
  },
  
  // Obtener icono según categoría
  getCategoryIcon(category) {
    const icons = {
      "Edificio": "fa-building",
      "Aula": "fa-chalkboard",
      "Laboratorio": "fa-flask",
      "Biblioteca": "fa-book",
      "Cafetería": "fa-utensils",
      "Estacionamiento": "fa-parking",
      "Deportes": "fa-running",
      "Servicio": "fa-info-circle"
    };
    
    return icons[category] || "fa-map-marker-alt";
  },
  
  // Obtener color según categoría
  getCategoryColor(category) {
    const colors = {
      "Edificio": "#3498db",
      "Aula": "#27ae60",
      "Laboratorio": "#9b59b6",
      "Biblioteca": "#e67e22",
      "Cafetería": "#e74c3c",
      "Estacionamiento": "#95a5a6",
      "Deportes": "#2ecc71",
      "Servicio": "#f39c12"
    };
    
    return colors[category] || "#3498db";
  },
  
  // Mostrar tarjeta con información del POI
  showCard(poi, latlng) {
    this.state.selectedPOI = poi;
    this.state.isCardVisible = true;
    
    const card = document.getElementById('destination-card');
    const iconEl = document.getElementById('destination-icon');
    const nameEl = document.getElementById('destination-name');
    const categoryEl = document.getElementById('destination-category');
    
    // Actualizar contenido
    const icon = this.getCategoryIcon(poi.category);
    const color = this.getCategoryColor(poi.category);
    
    iconEl.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i>`;
    nameEl.textContent = poi.name;
    categoryEl.textContent = poi.category;
    
    // Mostrar tarjeta
    card.style.display = 'block';
    
    // Resetear botones
    document.getElementById('btn-set-destination').style.display = 'block';
    document.getElementById('btn-generate-route').style.display = 'none';
  },
  
  // Ocultar tarjeta
  hideCard() {
    const card = document.getElementById('destination-card');
    card.style.display = 'none';
    this.state.isCardVisible = false;
  },
  
  // Establecer como destino
  setAsDestination() {
    if (!this.state.selectedPOI) return;
    
    const poi = this.state.selectedPOI;
    
    // Actualizar estado global
    selectedEndPOI = poi;
    
    // Crear o actualizar marcador de destino
    if (this.state.destinationMarker) {
      map.removeLayer(this.state.destinationMarker);
    }
    
    const destIcon = L.divIcon({
      className: 'destination-marker-selected',
      html: `<i class="fas fa-flag-checkered" style="color: #e74c3c; font-size: 28px;"></i>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    
    this.state.destinationMarker = L.marker(
      [poi.coordinates[1], poi.coordinates[0]], 
      { icon: destIcon }
    ).addTo(map);
    
    // Actualizar UI
    document.getElementById('btn-set-destination').style.display = 'none';
    document.getElementById('btn-generate-route').style.display = 'block';
    
    // Mostrar notificación
    this.showNotification(`Destino establecido: ${poi.name}`, 'success');
    
    console.log('Destino establecido:', poi.name);
  },
  
  // Generar ruta
  generateRoute() {
    if (!this.state.selectedPOI) return;
    
    // Verificar que haya ubicación del usuario
    if (!lastUserCoord) {
      this.showNotification('No se puede obtener tu ubicación actual', 'error');
      return;
    }
    
    // Ocultar tarjeta
    this.hideCard();
    
    // Llamar a la función de cálculo de ruta (ahora implementada en script_simplified.js)
    if (typeof calculateRoute === 'function') {
      const routeResult = calculateRoute();
      
      if (routeResult && routeResult.path.length > 0) {
        this.showNotification('Ruta calculada con éxito', 'success');
        
        // Integrar con Waze si está disponible
        if (typeof integrateWithWaze === 'function') {
          integrateWithWaze();
        }
      } else {
        this.showNotification('No se pudo encontrar una ruta válida', 'error');
      }
    } else {
      this.showNotification('Sistema de navegación no disponible', 'error');
    }
  },
  
  // Mostrar notificación
  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `destination-notification destination-notification-${type}`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MapDestinationSelector.init();
  });
} else {
  MapDestinationSelector.init();
}
