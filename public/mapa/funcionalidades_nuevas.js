/* ========================================
   NUEVAS FUNCIONALIDADES PARA CONOCETEC
   (Sin afectar el sistema de rutas)
   ======================================== */

// ============================================
// 1. HISTORIAL DE RUTAS RECIENTES
// ============================================
const RouteHistory = {
  maxHistory: 10,
  storageKey: 'conocetec_route_history',
  
  save(startPOI, endPOI, distance, time) {
    const history = this.getAll();
    const newRoute = {
      id: Date.now(),
      start: startPOI ? startPOI.properties.name : 'Mi Ubicación',
      end: endPOI.properties.name,
      distance: distance,
      time: time,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(newRoute);
    
    // Mantener solo las últimas 10 rutas
    if (history.length > this.maxHistory) {
      history.pop();
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(history));
  },
  
  getAll() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  },
  
  clear() {
    localStorage.removeItem(this.storageKey);
  },
  
  displayHistory() {
    const history = this.getAll();
    const container = document.getElementById('route-history-list');
    
    if (!container) return;
    
    if (history.length === 0) {
      container.innerHTML = '<p class="empty-message">No hay rutas recientes</p>';
      return;
    }
    
    container.innerHTML = history.map(route => {
      const date = new Date(route.timestamp);
      const formattedDate = date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="history-item poi-card" data-route-id="${route.id}">
          <div class="history-header">
            <i class="fas fa-history"></i>
            <span class="history-date">${formattedDate}</span>
          </div>
          <div class="history-route">
            <div class="history-point">
              <i class="fas fa-play-circle" style="color: #27ae60;"></i>
              <span>${route.start}</span>
            </div>
            <div class="history-arrow">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="history-point">
              <i class="fas fa-flag-checkered" style="color: #e74c3c;"></i>
              <span>${route.end}</span>
            </div>
          </div>
          <div class="history-stats">
            <span><i class="fas fa-route"></i> ${(route.distance / 1000).toFixed(2)} km</span>
            <span><i class="fas fa-clock"></i> ${route.time} min</span>
          </div>
        </div>
      `;
    }).join('');
  }
};

// ============================================
// 2. COMPARTIR UBICACIÓN/RUTA
// ============================================
const ShareFeature = {
  shareLocation(poi) {
    const coords = poi.geometry.coordinates;
    const name = poi.properties.name;
    const url = `${window.location.origin}${window.location.pathname}?poi=${encodeURIComponent(name)}&lat=${coords[1]}&lon=${coords[0]}`;
    
    if (navigator.share) {
      navigator.share({
        title: `ConoceTec - ${name}`,
        text: `Te comparto la ubicación de ${name} en el Instituto Tecnológico de Minatitlán`,
        url: url
      }).catch(err => console.log('Error al compartir:', err));
    } else {
      // Fallback: copiar al portapapeles
      this.copyToClipboard(url);
      showStatus('route-status', 'Enlace copiado al portapapeles', 'success');
    }
  },
  
  shareRoute(startPOI, endPOI) {
    const startName = startPOI ? startPOI.properties.name : 'Mi Ubicación';
    const endName = endPOI.properties.name;
    const url = `${window.location.origin}${window.location.pathname}?route=true&end=${encodeURIComponent(endName)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'ConoceTec - Ruta',
        text: `Ruta desde ${startName} hasta ${endName}`,
        url: url
      }).catch(err => console.log('Error al compartir:', err));
    } else {
      this.copyToClipboard(url);
      showStatus('route-status', 'Enlace de ruta copiado al portapapeles', 'success');
    }
  },
  
  copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

// ============================================
// 3. ESTIMACIÓN DE TIEMPO MEJORADA
// ============================================
const TimeEstimator = {
  // Velocidades en m/s
  speeds: {
    walking: 1.4,      // ~5 km/h
    fast_walking: 1.8, // ~6.5 km/h
    slow_walking: 1.0  // ~3.6 km/h
  },
  
  currentSpeed: 'walking',
  
  setSpeed(speedType) {
    if (this.speeds[speedType]) {
      this.currentSpeed = speedType;
      localStorage.setItem('conocetec_walking_speed', speedType);
    }
  },
  
  getSpeed() {
    const saved = localStorage.getItem('conocetec_walking_speed');
    return this.speeds[saved || this.currentSpeed];
  },
  
  estimate(distanceMeters) {
    const speed = this.getSpeed();
    const timeSeconds = distanceMeters / speed;
    const timeMinutes = Math.round(timeSeconds / 60);
    
    return {
      minutes: timeMinutes,
      formatted: this.formatTime(timeMinutes)
    };
  },
  
  formatTime(minutes) {
    if (minutes < 1) return 'Menos de 1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
};

// ============================================
// 4. FILTROS AVANZADOS DE POIs
// ============================================
const AdvancedFilters = {
  filters: {
    category: null,
    hasImages: false,
    nearMe: false,
    maxDistance: null
  },
  
  apply(pois, userLocation) {
    let filtered = [...pois];
    
    // Filtrar por categoría
    if (this.filters.category) {
      filtered = filtered.filter(poi => 
        poi.properties.category === this.filters.category
      );
    }
    
    // Filtrar por imágenes disponibles
    if (this.filters.hasImages) {
      filtered = filtered.filter(poi => 
        poi.properties.images && poi.properties.images.length > 0
      );
    }
    
    // Filtrar por cercanía
    if (this.filters.nearMe && userLocation) {
      filtered = filtered.filter(poi => {
        const poiCoords = poi.geometry.coordinates;
        const distance = turf.distance(
          turf.point(userLocation),
          turf.point(poiCoords),
          { units: 'meters' }
        );
        return distance <= (this.filters.maxDistance || 500);
      });
      
      // Ordenar por distancia
      filtered.sort((a, b) => {
        const distA = turf.distance(
          turf.point(userLocation),
          turf.point(a.geometry.coordinates),
          { units: 'meters' }
        );
        const distB = turf.distance(
          turf.point(userLocation),
          turf.point(b.geometry.coordinates),
          { units: 'meters' }
        );
        return distA - distB;
      });
    }
    
    return filtered;
  },
  
  setFilter(filterName, value) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = value;
    }
  },
  
  clearAll() {
    this.filters = {
      category: null,
      hasImages: false,
      nearMe: false,
      maxDistance: null
    };
  }
};

// ============================================
// 5. MODO OFFLINE MEJORADO
// ============================================
const OfflineMode = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showStatus('Conexión restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showStatus('Modo sin conexión activado', 'warning');
    });
  },
  
  showStatus(message, type) {
    const banner = document.createElement('div');
    banner.className = `offline-banner offline-${type}`;
    banner.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'wifi' : 'exclamation-triangle'}"></i>
      <span>${message}</span>
    `;
    banner.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#27ae60' : '#f39c12'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
      banner.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  }
};

// ============================================
// 6. ESTADÍSTICAS DE USO
// ============================================
const UsageStats = {
  storageKey: 'conocetec_stats',
  
  increment(action) {
    const stats = this.getAll();
    stats[action] = (stats[action] || 0) + 1;
    stats.lastUsed = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(stats));
  },
  
  getAll() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {
      routesCalculated: 0,
      poisViewed: 0,
      locationsShared: 0,
      lastUsed: null
    };
  },
  
  display() {
    const stats = this.getAll();
    return `
      <div class="stats-container">
        <h3>Estadísticas de Uso</h3>
        <div class="stat-item">
          <i class="fas fa-route"></i>
          <span>Rutas calculadas: ${stats.routesCalculated || 0}</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>POIs visitados: ${stats.poisViewed || 0}</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-share-alt"></i>
          <span>Ubicaciones compartidas: ${stats.locationsShared || 0}</span>
        </div>
      </div>
    `;
  }
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar modo offline
  OfflineMode.init();
  
  // Mostrar historial si existe el contenedor
  if (document.getElementById('route-history-list')) {
    RouteHistory.displayHistory();
  }
  
  console.log('✓ Nuevas funcionalidades cargadas');
});

// Exportar para uso global
window.ConoceTecExtensions = {
  RouteHistory,
  ShareFeature,
  TimeEstimator,
  AdvancedFilters,
  OfflineMode,
  UsageStats
};
