/* ========================================
   OPTIMIZACIONES DE RENDIMIENTO
   (Sin afectar el sistema de rutas)
   ======================================== */

// ============================================
// 1. LAZY LOADING DE IMÁGENES
// ============================================
const ImageLazyLoader = {
  observer: null,
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  },
  
  observe(element) {
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }
};

// ============================================
// 2. DEBOUNCE PARA BÚSQUEDAS
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// 3. THROTTLE PARA EVENTOS DE SCROLL/GEOLOCALIZACIÓN
// ============================================
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// 4. CACHÉ DE CÁLCULOS DE DISTANCIA
// ============================================
const DistanceCache = {
  cache: new Map(),
  maxSize: 1000,
  
  getKey(coord1, coord2) {
    return `${coord1[0]},${coord1[1]}-${coord2[0]},${coord2[1]}`;
  },
  
  get(coord1, coord2) {
    const key = this.getKey(coord1, coord2);
    return this.cache.get(key);
  },
  
  set(coord1, coord2, distance) {
    if (this.cache.size >= this.maxSize) {
      // Eliminar el primer elemento (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    const key = this.getKey(coord1, coord2);
    this.cache.set(key, distance);
  },
  
  clear() {
    this.cache.clear();
  }
};

// ============================================
// 5. OPTIMIZACIÓN DE RENDERIZADO DE POIs
// ============================================
const POIRenderer = {
  visiblePOIs: new Set(),
  renderBatch: 20,
  
  renderInBatches(pois, renderFunction, onComplete) {
    let index = 0;
    
    const renderNext = () => {
      const batch = pois.slice(index, index + this.renderBatch);
      
      batch.forEach(poi => {
        renderFunction(poi);
        this.visiblePOIs.add(poi.properties.name);
      });
      
      index += this.renderBatch;
      
      if (index < pois.length) {
        requestAnimationFrame(renderNext);
      } else if (onComplete) {
        onComplete();
      }
    };
    
    renderNext();
  },
  
  clear() {
    this.visiblePOIs.clear();
  }
};

// ============================================
// 6. COMPRESIÓN DE DATOS GEOJSON
// ============================================
const GeoJSONOptimizer = {
  // Reducir precisión de coordenadas (6 decimales = ~10cm precisión)
  roundCoordinates(coords, precision = 6) {
    if (Array.isArray(coords[0])) {
      return coords.map(c => this.roundCoordinates(c, precision));
    }
    return coords.map(c => Number(c.toFixed(precision)));
  },
  
  // Eliminar propiedades innecesarias
  cleanProperties(properties, keepKeys) {
    const cleaned = {};
    keepKeys.forEach(key => {
      if (properties[key] !== undefined) {
        cleaned[key] = properties[key];
      }
    });
    return cleaned;
  },
  
  // Optimizar un FeatureCollection completo
  optimize(geojson, options = {}) {
    const {
      coordPrecision = 6,
      keepProperties = ['name', 'category', 'amenity']
    } = options;
    
    return {
      ...geojson,
      features: geojson.features.map(feature => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: this.roundCoordinates(
            feature.geometry.coordinates,
            coordPrecision
          )
        },
        properties: this.cleanProperties(
          feature.properties,
          keepProperties
        )
      }))
    };
  }
};

// ============================================
// 7. PRECARGA DE DATOS CRÍTICOS
// ============================================
const DataPreloader = {
  preloadedData: {},
  
  async preload(urls) {
    const promises = urls.map(async url => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        this.preloadedData[url] = data;
        return { url, success: true };
      } catch (error) {
        console.error(`Error precargando ${url}:`, error);
        return { url, success: false, error };
      }
    });
    
    return Promise.all(promises);
  },
  
  get(url) {
    return this.preloadedData[url];
  },
  
  has(url) {
    return this.preloadedData.hasOwnProperty(url);
  }
};

// ============================================
// 8. OPTIMIZACIÓN DE EVENTOS DEL MAPA
// ============================================
const MapEventOptimizer = {
  lastZoom: null,
  lastCenter: null,
  
  shouldUpdateMarkers(map) {
    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();
    
    // Solo actualizar si el zoom cambió significativamente
    // o si el centro se movió más de cierta distancia
    if (this.lastZoom === null || 
        Math.abs(currentZoom - this.lastZoom) >= 1) {
      this.lastZoom = currentZoom;
      this.lastCenter = currentCenter;
      return true;
    }
    
    if (this.lastCenter) {
      const distance = currentCenter.distanceTo(this.lastCenter);
      if (distance > 100) { // 100 metros
        this.lastCenter = currentCenter;
        return true;
      }
    }
    
    return false;
  },
  
  reset() {
    this.lastZoom = null;
    this.lastCenter = null;
  }
};

// ============================================
// 9. GESTIÓN DE MEMORIA
// ============================================
const MemoryManager = {
  clearUnusedData() {
    // Limpiar cachés
    DistanceCache.clear();
    POIRenderer.clear();
    
    // Forzar garbage collection (solo en desarrollo)
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  },
  
  monitorMemory() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const percentage = (used / total) * 100;
      
      console.log(`Memoria usada: ${(used / 1048576).toFixed(2)} MB (${percentage.toFixed(1)}%)`);
      
      // Si se usa más del 80%, limpiar
      if (percentage > 80) {
        console.warn('Uso de memoria alto, limpiando...');
        this.clearUnusedData();
      }
    }
  }
};

// ============================================
// 10. OPTIMIZACIÓN DE BÚSQUEDA
// ============================================
const SearchOptimizer = {
  cache: new Map(),
  maxCacheSize: 100,
  
  getCachedResults(query) {
    return this.cache.get(query.toLowerCase());
  },
  
  cacheResults(query, results) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(query.toLowerCase(), results);
  },
  
  clearCache() {
    this.cache.clear();
  }
};

// ============================================
// INICIALIZACIÓN DE OPTIMIZACIONES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar lazy loading
  ImageLazyLoader.init();
  
  // Monitorear memoria cada 30 segundos (solo en desarrollo)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setInterval(() => {
      MemoryManager.monitorMemory();
    }, 30000);
  }
  
  console.log('✓ Optimizaciones de rendimiento cargadas');
});

// Exportar para uso global
window.ConoceTecOptimizations = {
  ImageLazyLoader,
  debounce,
  throttle,
  DistanceCache,
  POIRenderer,
  GeoJSONOptimizer,
  DataPreloader,
  MapEventOptimizer,
  MemoryManager,
  SearchOptimizer
};
