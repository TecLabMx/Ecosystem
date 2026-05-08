/**
 * Advanced Search - Búsqueda avanzada con autocompletado
 * Proporciona búsqueda inteligente, recientes y favoritos
 */

class AdvancedSearch {
  constructor() {
    this.recentSearches = this.loadRecentSearches();
    this.favorites = this.loadFavorites();
    this.allPOIs = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadAllPOIs();
  }

  attachEventListeners() {
    // Desktop search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e, 'desktop'));
      searchInput.addEventListener('focus', (e) => this.showSearchSuggestions(e, 'desktop'));
    }

    // Mobile search
    const searchInputMobile = document.getElementById('search-input-mobile');
    if (searchInputMobile) {
      searchInputMobile.addEventListener('input', (e) => this.handleSearch(e, 'mobile'));
      searchInputMobile.addEventListener('focus', (e) => this.showSearchSuggestions(e, 'mobile'));
    }

    // Cerrar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-results') && !e.target.closest('.form-input')) {
        document.querySelectorAll('.search-results').forEach(el => el.innerHTML = '');
      }
    });
  }

  /**
   * Carga todos los POIs disponibles
   */
  loadAllPOIs() {
    if (!window.poisGeo || !window.poisGeo.features) return;

    this.allPOIs = window.poisGeo.features.map(feature => ({
      id: feature.properties.id,
      name: feature.properties.name || 'Sin nombre',
      category: this.getCategoryFromProperties(feature.properties),
      coordinates: feature.geometry.coordinates,
      properties: feature.properties,
      type: 'poi'
    }));
  }

  /**
   * Obtiene la categoría de las propiedades del POI
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
   * Maneja la búsqueda
   */
  handleSearch(event, mode) {
    const input = event.target;
    const query = input.value.trim().toLowerCase();
    const resultsContainer = document.getElementById(`search-results${mode === 'mobile' ? '-mobile' : ''}`);

    if (!resultsContainer) return;

    if (query.length === 0) {
      this.showSearchSuggestions(event, mode);
      return;
    }

    // Buscar POIs
    const results = this.searchPOIs(query);

    // Mostrar resultados
    this.displaySearchResults(results, resultsContainer, mode);
  }

  /**
   * Busca POIs por query
   */
  searchPOIs(query) {
    return this.allPOIs.filter(poi => {
      const name = poi.name.toLowerCase();
      const category = poi.category.toLowerCase();
      return name.includes(query) || category.includes(query);
    }).slice(0, 8); // Limitar a 8 resultados
  }

  /**
   * Muestra sugerencias de búsqueda
   */
  showSearchSuggestions(event, mode) {
    const input = event.target;
    const resultsContainer = document.getElementById(`search-results${mode === 'mobile' ? '-mobile' : ''}`);

    if (!resultsContainer) return;

    const query = input.value.trim().toLowerCase();

    if (query.length > 0) return; // Si hay texto, no mostrar sugerencias

    let suggestions = [];

    // Mostrar búsquedas recientes
    if (this.recentSearches.length > 0) {
      suggestions.push({
        type: 'header',
        text: 'Búsquedas Recientes'
      });

      suggestions = suggestions.concat(
        this.recentSearches.slice(0, 3).map(search => ({
          type: 'recent',
          name: search.name,
          coordinates: search.coordinates,
          id: search.id
        }))
      );
    }

    // Mostrar favoritos
    if (this.favorites.length > 0) {
      suggestions.push({
        type: 'header',
        text: 'Favoritos'
      });

      suggestions = suggestions.concat(
        this.favorites.slice(0, 3).map(fav => ({
          type: 'favorite',
          name: fav.name,
          coordinates: fav.coordinates,
          id: fav.id
        }))
      );
    }

    // Mostrar categorías populares
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'header',
        text: 'Categorías Populares'
      });

      const categories = ['Edificios', 'Cafeterías', 'Biblioteca', 'Estacionamiento'];
      suggestions = suggestions.concat(
        categories.map(cat => ({
          type: 'category',
          name: cat,
          icon: this.getCategoryIcon(cat)
        }))
      );
    }

    this.displaySuggestions(suggestions, resultsContainer, mode);
  }

  /**
   * Muestra los resultados de búsqueda
   */
  displaySearchResults(results, container, mode) {
    container.innerHTML = '';

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <p>No se encontraron resultados</p>
        </div>
      `;
      return;
    }

    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="search-result-icon">
          <i class="fas ${this.getCategoryIcon(result.category)}"></i>
        </div>
        <div class="search-result-content">
          <div class="search-result-name">${result.name}</div>
          <div class="search-result-category">${result.category}</div>
        </div>
        <div class="search-result-action">
          <i class="fas fa-chevron-right"></i>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectSearchResult(result, mode);
      });

      container.appendChild(item);
    });
  }

  /**
   * Muestra las sugerencias
   */
  displaySuggestions(suggestions, container, mode) {
    container.innerHTML = '';

    suggestions.forEach(suggestion => {
      if (suggestion.type === 'header') {
        const header = document.createElement('div');
        header.className = 'search-suggestions-header';
        header.textContent = suggestion.text;
        container.appendChild(header);
      } else {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';

        if (suggestion.type === 'category') {
          item.innerHTML = `
            <div class="search-result-icon">
              <i class="fas ${suggestion.icon}"></i>
            </div>
            <div class="search-result-content">
              <div class="search-result-name">${suggestion.name}</div>
            </div>
          `;

          item.addEventListener('click', () => {
            document.getElementById(`search-input${mode === 'mobile' ? '-mobile' : ''}`).value = suggestion.name;
            this.handleSearch({ target: document.getElementById(`search-input${mode === 'mobile' ? '-mobile' : ''}`) }, mode);
          });
        } else {
          item.innerHTML = `
            <div class="search-result-icon">
              <i class="fas ${suggestion.type === 'favorite' ? 'fa-star' : 'fa-history'}"></i>
            </div>
            <div class="search-result-content">
              <div class="search-result-name">${suggestion.name}</div>
            </div>
            <div class="search-result-action">
              <i class="fas fa-chevron-right"></i>
            </div>
          `;

          item.addEventListener('click', () => {
            this.selectSearchResult(suggestion, mode);
          });
        }

        container.appendChild(item);
      }
    });
  }

  /**
   * Selecciona un resultado de búsqueda
   */
  selectSearchResult(result, mode) {
    // Agregar a búsquedas recientes
    this.addRecentSearch(result);

    // Establecer como destino
    selectedEndPOI = {
      name: result.name,
      coordinates: result.coordinates,
      properties: result.properties || {}
    };

    // Actualizar UI
    const categoryFilterEl = document.getElementById(`category-filter${mode === 'mobile' ? '-mobile' : ''}`);
    if (categoryFilterEl) {
      categoryFilterEl.value = '';
    }

    // Mostrar el POI en el mapa
    if (map && result.coordinates) {
      const marker = L.marker([result.coordinates[1], result.coordinates[0]]).addTo(map);
      map.setView([result.coordinates[1], result.coordinates[0]], 18);
    }

    // Limpiar búsqueda
    const searchInput = document.getElementById(`search-input${mode === 'mobile' ? '-mobile' : ''}`);
    if (searchInput) {
      searchInput.value = '';
      document.getElementById(`search-results${mode === 'mobile' ? '-mobile' : ''}`).innerHTML = '';
    }

    // Habilitar botón de calcular ruta
    const btnCalculateRoute = document.getElementById(`btn-calculate-route${mode === 'mobile' ? '-mobile' : ''}`);
    if (btnCalculateRoute && selectedStartPOI) {
      btnCalculateRoute.disabled = false;
    }

    showStatus(`route-status${mode === 'mobile' ? '-mobile' : ''}`, `Destino seleccionado: ${result.name}`, 'success');
  }

  /**
   * Agrega una búsqueda reciente
   */
  addRecentSearch(search) {
    // Eliminar duplicados
    this.recentSearches = this.recentSearches.filter(s => s.id !== search.id);

    // Agregar al inicio
    this.recentSearches.unshift({
      id: search.id,
      name: search.name,
      coordinates: search.coordinates,
      timestamp: Date.now()
    });

    // Limitar a 10 recientes
    this.recentSearches = this.recentSearches.slice(0, 10);

    // Guardar en localStorage
    this.saveRecentSearches();
  }

  /**
   * Agrega un favorito
   */
  addFavorite(poi) {
    // Verificar si ya existe
    if (this.favorites.some(f => f.id === poi.id)) {
      return;
    }

    this.favorites.push({
      id: poi.id,
      name: poi.name,
      coordinates: poi.coordinates,
      timestamp: Date.now()
    });

    this.saveFavorites();
  }

  /**
   * Elimina un favorito
   */
  removeFavorite(poiId) {
    this.favorites = this.favorites.filter(f => f.id !== poiId);
    this.saveFavorites();
  }

  /**
   * Obtiene el icono de la categoría
   */
  getCategoryIcon(category) {
    const icons = {
      'Servicios': 'fa-concierge-bell',
      'Recreación': 'fa-volleyball',
      'Edificios': 'fa-building',
      'Tiendas': 'fa-store',
      'Cafeterías': 'fa-coffee',
      'Restaurantes': 'fa-utensils',
      'Biblioteca': 'fa-book',
      'Estacionamiento': 'fa-square-parking',
      'Otros': 'fa-map-marker-alt'
    };

    return icons[category] || 'fa-map-marker-alt';
  }

  /**
   * Carga búsquedas recientes del localStorage
   */
  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('conocetec_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda búsquedas recientes en localStorage
   */
  saveRecentSearches() {
    try {
      localStorage.setItem('conocetec_recent_searches', JSON.stringify(this.recentSearches));
    } catch {
      console.warn('No se pudo guardar búsquedas recientes');
    }
  }

  /**
   * Carga favoritos del localStorage
   */
  loadFavorites() {
    try {
      const saved = localStorage.getItem('conocetec_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda favoritos en localStorage
   */
  saveFavorites() {
    try {
      localStorage.setItem('conocetec_favorites', JSON.stringify(this.favorites));
    } catch {
      console.warn('No se pudo guardar favoritos');
    }
  }

  /**
   * Limpia el historial de búsquedas
   */
  clearRecentSearches() {
    this.recentSearches = [];
    this.saveRecentSearches();
  }
}

// Instancia global
let advancedSearch;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  advancedSearch = new AdvancedSearch();
});
