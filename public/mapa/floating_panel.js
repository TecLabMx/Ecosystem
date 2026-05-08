/* ========================================
   SISTEMA DE PANEL FLOTANTE
   Estilo Waze/Google Maps
   ======================================== */

const FloatingPanel = {
  // Estado del panel
  state: {
    isCompactOpen: false,
    isExpandedOpen: false,
    selectedStartPOI: null,
    selectedDestPOI: null,
    currentCategory: "",
  },

  // Inicializar
  init() {
    this.createFloatingPanel();
    this.setupEventListeners();
    this.syncWithOriginalUI();
    console.log("✓ Panel flotante inicializado");
  },

  // Crear estructura HTML del panel flotante
  createFloatingPanel() {
    const container = document.createElement("div");
    container.className = "floating-control-panel";
    container.id = "floating-control-panel";

    container.innerHTML = `
      <!-- Botón Principal (Minimizado) -->
      <div class="floating-main-button" id="floating-main-btn">
        <i class="fas fa-map-marked-alt"></i>
        <span id="floating-status-text">Seleccionar ruta</span>
        <div class="status-dot"></div>
      </div>
      
      <!-- Panel Compacto -->
      <div class="floating-compact-panel" id="floating-compact-panel">
        <div class="compact-header">
          <div class="compact-title">
            <i class="fas fa-route"></i>
            Planificar Ruta
          </div>
          <button class="compact-close" id="compact-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Búsqueda Rápida -->
        <div class="compact-search">
          <input 
            type="text" 
            id="floating-search-input" 
            placeholder="Buscar punto de interés..."
          />
          <i class="fas fa-search compact-search-icon"></i>
        </div>
        
        <!-- Punto de Inicio -->
        <div class="compact-section">
          <div class="compact-section-title">
            <i class="fas fa-map-pin"></i>
            Punto de Inicio
          </div>
          <select class="compact-select" id="floating-start-select">
            <option value="">Mi Ubicación Actual</option>
          </select>
        </div>
        
        <!-- Punto de Destino -->
        <div class="compact-section">
          <div class="compact-section-title">
            <i class="fas fa-flag-checkered"></i>
            Punto de Destino
          </div>
          <select class="compact-select" id="floating-category-filter">
            <option value="">Todas las categorías</option>
          </select>
          <select class="compact-select" id="floating-dest-select" style="margin-top: 8px;">
            <option value="">Seleccionar destino...</option>
          </select>
        </div>
        
        <!-- Botones de Acción -->
        <div class="quick-actions">
          <button class="quick-action-btn" id="floating-locate-btn">
            <i class="fas fa-crosshairs"></i>
            Mi Ubicación
          </button>
          <button class="compact-button" id="floating-calculate-btn" disabled>
            <i class="fas fa-directions"></i>
            Calcular Ruta
          </button>
        </div>
        
        <!-- Estado -->
        <div class="compact-status" id="floating-status" style="display: none;">
          Selecciona origen y destino
        </div>
        
        <!-- Toggle para expandir -->
        <div class="expand-toggle" id="expand-toggle-btn">
          <span>Ver más opciones</span>
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>
      
      <!-- Panel Expandido -->
      <div class="floating-expanded-panel" id="floating-expanded-panel">
        <div class="expanded-header">
          <div class="expanded-title">
            <i class="fas fa-map-marked-alt"></i>
            Todas las Opciones
          </div>
          <button class="expanded-close" id="expanded-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Lista de POIs -->
        <div class="expanded-section">
          <div class="expanded-section-title">
            <i class="fas fa-location-dot"></i>
            Puntos de Interés Disponibles
          </div>
          <div class="poi-list-compact" id="floating-poi-list">
            <!-- Se llenará dinámicamente -->
          </div>
        </div>
        
        <!-- Información adicional -->
        <div class="expanded-section">
          <div class="expanded-section-title">
            <i class="fas fa-info-circle"></i>
            Información
          </div>
          <div class="compact-status">
            Selecciona un punto de interés de la lista o usa el mapa para navegar.
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  },

  // Configurar event listeners
  setupEventListeners() {
    // Botón principal - abrir panel compacto
    document
      .getElementById("floating-main-btn")
      .addEventListener("click", () => {
        this.toggleCompactPanel();
      });

    // Cerrar panel compacto
    document
      .getElementById("compact-close-btn")
      .addEventListener("click", () => {
        this.closeCompactPanel();
      });

    // Cerrar panel expandido
    document
      .getElementById("expanded-close-btn")
      .addEventListener("click", () => {
        this.closeExpandedPanel();
      });

    // Toggle expandir/contraer
    document
      .getElementById("expand-toggle-btn")
      .addEventListener("click", () => {
        this.toggleExpandedPanel();
      });

    // Búsqueda
    document
      .getElementById("floating-search-input")
      .addEventListener("input", (e) => {
        this.handleSearch(e.target.value);
      });

    // Selección de categoría
    document
      .getElementById("floating-category-filter")
      .addEventListener("change", (e) => {
        this.handleCategoryChange(e.target.value);
      });

    // Selección de inicio
    document
      .getElementById("floating-start-select")
      .addEventListener("change", (e) => {
        this.handleStartSelection(e.target.value);
      });

    // Selección de destino
    document
      .getElementById("floating-dest-select")
      .addEventListener("change", (e) => {
        this.handleDestSelection(e.target.value);
      });

    // Botón de ubicación
    document
      .getElementById("floating-locate-btn")
      .addEventListener("click", () => {
        this.handleLocateUser();
      });

    // Botón calcular ruta
    document
      .getElementById("floating-calculate-btn")
      .addEventListener("click", () => {
        this.handleCalculateRoute();
      });
  },

  // Sincronizar con la UI original
  syncWithOriginalUI() {
    // Esperar a que la UI original esté lista
    setTimeout(() => {
      this.syncPOIData();
      this.syncCategories();
      this.setupOriginalUIListeners();
    }, 500);
  },

  // Sincronizar datos de POIs
  syncPOIData() {
    if (
      window.poisGeo &&
      window.poisGeo.features &&
      window.poisGeo.features.length > 0
    ) {
      this.populatePOISelects();
      this.populateExpandedPOIList();
    }
  },

  // Sincronizar categorías
  syncCategories() {
    const floatingCategoryFilter = document.getElementById(
      "floating-category-filter",
    );
    if (!floatingCategoryFilter) return;

    // Intentar copiar del select original primero
    const originalCategoryFilter = document.getElementById("category-filter");
    if (originalCategoryFilter && originalCategoryFilter.options.length > 1) {
      floatingCategoryFilter.innerHTML = originalCategoryFilter.innerHTML;
      return;
    }

    // Si no hay UI original, construir categorías desde poisGeo
    if (!window.poisGeo || !window.poisGeo.features) return;
    const categorias = new Set();
    window.poisGeo.features.forEach((f) => {
      const cat = window.getPOICategory
        ? window.getPOICategory(f.properties)
        : f.properties.category || "General";
      if (cat) categorias.add(cat);
    });

    floatingCategoryFilter.innerHTML =
      '<option value="">Todas las categorías</option>';
    Array.from(categorias)
      .sort()
      .forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        floatingCategoryFilter.appendChild(opt);
      });
  },

  // Poblar selects de POIs
  populatePOISelects() {
    const startSelect = document.getElementById("floating-start-select");
    const destSelect = document.getElementById("floating-dest-select");

    if (!window.poisGeo || !window.poisGeo.features) return;

    const features = window.poisGeo.features;

    startSelect.innerHTML = '<option value="">Mi Ubicación Actual</option>';
    destSelect.innerHTML = '<option value="">Seleccionar destino...</option>';

    features
      .slice()
      .sort((a, b) =>
        (a.properties.name || "").localeCompare(b.properties.name || ""),
      )
      .forEach((feature, index) => {
        const name = feature.properties.name || "Sin nombre";
        const realIndex = features.indexOf(feature);

        const optionStart = document.createElement("option");
        optionStart.value = realIndex;
        optionStart.textContent = name;
        startSelect.appendChild(optionStart);

        const optionDest = document.createElement("option");
        optionDest.value = realIndex;
        optionDest.textContent = name;
        destSelect.appendChild(optionDest);
      });
  },

  // Poblar lista expandida de POIs
  populateExpandedPOIList() {
    const poiList = document.getElementById("floating-poi-list");
    if (!poiList || !window.poisGeo || !window.poisGeo.features) return;

    const features = window.poisGeo.features;
    poiList.innerHTML = "";

    features
      .slice()
      .sort((a, b) =>
        (a.properties.name || "").localeCompare(b.properties.name || ""),
      )
      .forEach((feature) => {
        const index = features.indexOf(feature);
        const name = feature.properties.name || "Sin nombre";
        const category = window.getPOICategory
          ? window.getPOICategory(feature.properties)
          : feature.properties.category || "General";

        const poiItem = document.createElement("div");
        poiItem.className = "poi-item-compact";
        poiItem.dataset.poiIndex = index;

        const iconMap = {
          Aulas: "fa-chalkboard",
          Laboratorios: "fa-flask",
          Biblioteca: "fa-book",
          Cafetería: "fa-utensils",
          Deportes: "fa-running",
          Servicio: "fa-cogs",
        };
        const iconClass = iconMap[category] || "fa-map-marker-alt";

        poiItem.innerHTML = `
          <div class="poi-icon-compact"><i class="fas ${iconClass}"></i></div>
          <div class="poi-info-compact">
            <div class="poi-name-compact">${name}</div>
            <div class="poi-category-compact">${category}</div>
          </div>
        `;
        poiItem.addEventListener("click", () => {
          this.selectPOIFromList(index);
        });
        poiList.appendChild(poiItem);
      });
  },

  // Configurar listeners de la UI original
  setupOriginalUIListeners() {
    // Escuchar cambios en la UI original
    const originalStartSelect = document.getElementById("start-poi-select");
    const originalCategoryFilter = document.getElementById("category-filter");

    if (originalStartSelect) {
      originalStartSelect.addEventListener("change", () => {
        document.getElementById("floating-start-select").value =
          originalStartSelect.value;
      });
    }

    if (originalCategoryFilter) {
      originalCategoryFilter.addEventListener("change", () => {
        document.getElementById("floating-category-filter").value =
          originalCategoryFilter.value;
      });
    }
  },

  // Toggle panel compacto
  toggleCompactPanel() {
    const panel = document.getElementById("floating-compact-panel");
    const mainBtn = document.getElementById("floating-main-btn");

    if (this.state.isCompactOpen) {
      this.closeCompactPanel();
    } else {
      panel.classList.add("active");
      mainBtn.style.display = "none";
      this.state.isCompactOpen = true;
    }
  },

  // Cerrar panel compacto
  closeCompactPanel() {
    const panel = document.getElementById("floating-compact-panel");
    const mainBtn = document.getElementById("floating-main-btn");

    panel.classList.remove("active");
    mainBtn.style.display = "flex";
    this.state.isCompactOpen = false;
    this.closeExpandedPanel();
  },

  // Toggle panel expandido
  toggleExpandedPanel() {
    const panel = document.getElementById("floating-expanded-panel");
    const toggleBtn = document.getElementById("expand-toggle-btn");

    if (this.state.isExpandedOpen) {
      panel.classList.remove("active");
      toggleBtn.classList.remove("expanded");
      toggleBtn.querySelector("span").textContent = "Ver más opciones";
      this.state.isExpandedOpen = false;
    } else {
      panel.classList.add("active");
      toggleBtn.classList.add("expanded");
      toggleBtn.querySelector("span").textContent = "Ver menos opciones";
      this.state.isExpandedOpen = true;
      this.populateExpandedPOIList();
    }
  },

  // Cerrar panel expandido
  closeExpandedPanel() {
    const panel = document.getElementById("floating-expanded-panel");
    const toggleBtn = document.getElementById("expand-toggle-btn");

    panel.classList.remove("active");
    toggleBtn.classList.remove("expanded");
    toggleBtn.querySelector("span").textContent = "Ver más opciones";
    this.state.isExpandedOpen = false;
  },

  // Manejar búsqueda
  handleSearch(query) {
    const originalSearchInput = document.getElementById("search-input");
    if (originalSearchInput) {
      originalSearchInput.value = query;
      originalSearchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },

  // Manejar cambio de categoría
  handleCategoryChange(category) {
    this.state.currentCategory = category;

    // Sincronizar con UI original
    const originalCategoryFilter = document.getElementById("category-filter");
    if (originalCategoryFilter) {
      originalCategoryFilter.value = category;
      originalCategoryFilter.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    }

    // Filtrar POIs en el select de destino
    this.filterDestinationPOIs(category);
  },

  // Filtrar POIs de destino por categoría
  filterDestinationPOIs(category) {
    const destSelect = document.getElementById("floating-dest-select");
    if (!destSelect || !window.poisGeo || !window.poisGeo.features) return;

    destSelect.innerHTML = '<option value="">Seleccionar destino...</option>';

    const features = window.poisGeo.features;
    const filteredFeatures = category
      ? features.filter((f) => {
          const cat = window.getPOICategory
            ? window.getPOICategory(f.properties)
            : f.properties.category || "";
          return cat === category;
        })
      : features;

    filteredFeatures
      .slice()
      .sort((a, b) =>
        (a.properties.name || "").localeCompare(b.properties.name || ""),
      )
      .forEach((feature) => {
        const option = document.createElement("option");
        option.value = features.indexOf(feature);
        option.textContent = feature.properties.name || "Sin nombre";
        destSelect.appendChild(option);
      });
  },

  // Manejar selección de inicio
  handleStartSelection(poiIndex) {
    this.state.selectedStartPOI = poiIndex;

    // Sincronizar con UI original
    const originalStartSelect = document.getElementById("start-poi-select");
    if (originalStartSelect) {
      originalStartSelect.value = poiIndex;
      originalStartSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    this.updateCalculateButton();
    this.updateStatusText();
  },

  // Manejar selección de destino
  handleDestSelection(poiIndex) {
    this.state.selectedDestPOI = poiIndex;

    // Sincronizar con UI original (seleccionar el POI en el mapa)
    if (
      poiIndex !== null &&
      poiIndex !== "" &&
      window.poisGeo &&
      window.poisGeo.features
    ) {
      const feature = window.poisGeo.features[poiIndex];
      if (feature && typeof window.selectEndPOI === "function") {
        window.selectEndPOI(feature, null);
      }
    }

    this.updateCalculateButton();
    this.updateStatusText();
  },

  // Seleccionar POI desde la lista expandida
  selectPOIFromList(poiIndex) {
    // Marcar como seleccionado visualmente
    document.querySelectorAll(".poi-item-compact").forEach((item) => {
      item.classList.remove("selected");
    });
    document
      .querySelector(`[data-poi-index="${poiIndex}"]`)
      .classList.add("selected");

    // Establecer como destino
    document.getElementById("floating-dest-select").value = poiIndex;
    this.handleDestSelection(poiIndex);

    // Cerrar panel expandido
    this.closeExpandedPanel();
  },

  // Manejar ubicación del usuario
  handleLocateUser() {
    const originalLocateBtn = document.getElementById("btn-locate");
    if (originalLocateBtn) {
      originalLocateBtn.click();
    }

    this.showStatus("Obteniendo ubicación...", "info");
  },

  // Manejar cálculo de ruta
  handleCalculateRoute() {
    const originalCalculateBtn = document.getElementById("btn-calculate-route");
    if (originalCalculateBtn && !originalCalculateBtn.disabled) {
      originalCalculateBtn.click();
      this.closeCompactPanel();
      this.showStatus("Calculando ruta...", "success");
    }
  },

  // Actualizar botón de calcular
  updateCalculateButton() {
    const calculateBtn = document.getElementById("floating-calculate-btn");
    const hasDestination =
      this.state.selectedDestPOI !== null && this.state.selectedDestPOI !== "";

    calculateBtn.disabled = !hasDestination;
  },

  // Actualizar texto de estado
  updateStatusText() {
    const statusText = document.getElementById("floating-status-text");

    if (this.state.selectedDestPOI) {
      const feature =
        window.poisGeo && window.poisGeo.features
          ? window.poisGeo.features[this.state.selectedDestPOI]
          : null;
      statusText.textContent = feature
        ? `Ruta a ${feature.properties.name}`
        : "Seleccionar ruta";
    } else {
      statusText.textContent = "Seleccionar ruta";
    }
  },

  // Mostrar mensaje de estado
  showStatus(message, type = "info") {
    const status = document.getElementById("floating-status");
    status.textContent = message;
    status.className = `compact-status ${type}`;
    status.style.display = "block";

    setTimeout(() => {
      status.style.display = "none";
    }, 3000);
  },
};

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      FloatingPanel.init();
    }, 500);
  });
} else {
  setTimeout(() => {
    FloatingPanel.init();
  }, 500);
}

// Escuchar evento poisLoaded para poblar las listas en cuanto los datos estén disponibles
window.addEventListener("poisLoaded", () => {
  if (typeof FloatingPanel !== "undefined") {
    FloatingPanel.syncPOIData();
    FloatingPanel.syncCategories();
  }
});
