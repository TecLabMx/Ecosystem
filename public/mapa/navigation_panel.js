/**
 * Navigation Panel - Panel de navegación tipo Waze/Google Maps
 * Proporciona indicaciones paso a paso y seguimiento de ruta
 */

class NavigationPanel {
  constructor() {
    this.isNavigating = false;
    this.currentStep = 0;
    this.instructions = [];
    this.totalDistance = 0;
    this.totalTime = 0;
    this.trackingInterval = null;
    this.userLocation = null;
    this.routePath = null;
    this.init();
  }

  init() {
    this.createPanelHTML();
    this.attachEventListeners();
  }

  createPanelHTML() {
    const panelHTML = `
      <div id="navigation-panel" class="navigation-panel hidden">
        <!-- Header con origen y destino -->
        <div class="navigation-header">
          <div class="route-info-compact">
            <div class="route-origin">
              <i class="fas fa-circle-dot"></i>
              <span id="nav-origin-name">Mi ubicación</span>
            </div>
            <div class="route-swap">
              <button class="btn-swap" id="btn-swap-route" title="Intercambiar origen y destino">
                <i class="fas fa-arrow-right-arrow-left"></i>
              </button>
            </div>
            <div class="route-destination">
              <i class="fas fa-map-pin"></i>
              <span id="nav-destination-name">Destino</span>
            </div>
          </div>
          <button class="btn-close-nav" id="btn-close-nav">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Información de ruta -->
        <div class="route-summary">
          <div class="summary-item">
            <span class="label">Distancia</span>
            <span class="value" id="nav-total-distance">0 m</span>
          </div>
          <div class="summary-item">
            <span class="label">Tiempo</span>
            <span class="value" id="nav-total-time">0 min</span>
          </div>
          <div class="summary-item">
            <span class="label">Pasos</span>
            <span class="value" id="nav-total-steps">0</span>
          </div>
        </div>

        <!-- Instrucción actual destacada -->
        <div class="current-instruction">
          <div class="instruction-icon">
            <i id="instruction-icon" class="fas fa-arrow-up"></i>
          </div>
          <div class="instruction-content">
            <div class="instruction-text" id="current-instruction-text">
              Preparándose para navegar...
            </div>
            <div class="instruction-distance" id="current-instruction-distance">
              0 m
            </div>
          </div>
          <div class="instruction-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
          </div>
        </div>

        <!-- Lista de instrucciones -->
        <div class="instructions-list-container">
          <div class="instructions-list" id="instructions-list">
            <!-- Se llena dinámicamente -->
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="navigation-actions">
          <button class="btn btn-secondary" id="btn-pause-nav">
            <i class="fas fa-pause"></i> Pausar
          </button>
          <button class="btn btn-danger" id="btn-end-nav">
            <i class="fas fa-stop"></i> Finalizar
          </button>
          <button class="btn btn-primary" id="btn-resume-nav" style="display: none;">
            <i class="fas fa-play"></i> Reanudar
          </button>
        </div>
      </div>
    `;

    // Insertar el panel en el DOM
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.insertAdjacentHTML('beforeend', panelHTML);
    }
  }

  attachEventListeners() {
    document.getElementById('btn-close-nav')?.addEventListener('click', () => this.stopNavigation());
    document.getElementById('btn-pause-nav')?.addEventListener('click', () => this.pauseNavigation());
    document.getElementById('btn-resume-nav')?.addEventListener('click', () => this.resumeNavigation());
    document.getElementById('btn-end-nav')?.addEventListener('click', () => this.endNavigation());
    document.getElementById('btn-swap-route')?.addEventListener('click', () => this.swapRoute());
  }

  /**
   * Inicia la navegación con las instrucciones generadas
   */
  startNavigation(instructions, totalDistance, totalTime, routePath) {
    this.instructions = instructions;
    this.totalDistance = totalDistance;
    this.totalTime = totalTime;
    this.routePath = routePath;
    this.currentStep = 0;
    this.isNavigating = true;

    // Mostrar panel
    const panel = document.getElementById('navigation-panel');
    panel?.classList.remove('hidden');

    // Actualizar información
    this.updateRouteSummary();
    this.displayInstructions();
    this.updateCurrentInstruction();

    // Iniciar seguimiento
    this.startTracking();
  }

  /**
   * Actualiza el resumen de la ruta
   */
  updateRouteSummary() {
    const distanceEl = document.getElementById('nav-total-distance');
    const timeEl = document.getElementById('nav-total-time');
    const stepsEl = document.getElementById('nav-total-steps');

    if (distanceEl) distanceEl.textContent = this.formatDistance(this.totalDistance);
    if (timeEl) timeEl.textContent = this.formatTime(this.totalTime);
    if (stepsEl) stepsEl.textContent = this.instructions.length;
  }

  /**
   * Muestra la lista de instrucciones
   */
  displayInstructions() {
    const listContainer = document.getElementById('instructions-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    this.instructions.forEach((instruction, index) => {
      const isActive = index === this.currentStep;
      const item = document.createElement('div');
      item.className = `instruction-item ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <div class="instruction-step-number">${index + 1}</div>
        <div class="instruction-step-content">
          <div class="instruction-step-text">${instruction.text}</div>
          <div class="instruction-step-distance">${this.formatDistance(instruction.distance)}</div>
        </div>
        <div class="instruction-step-icon">
          <i class="fas ${this.getDirectionIcon(instruction.direction)}"></i>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  /**
   * Actualiza la instrucción actual
   */
  updateCurrentInstruction() {
    if (this.currentStep >= this.instructions.length) {
      this.completeNavigation();
      return;
    }

    const instruction = this.instructions[this.currentStep];
    const textEl = document.getElementById('current-instruction-text');
    const distanceEl = document.getElementById('current-instruction-distance');
    const iconEl = document.getElementById('instruction-icon');

    if (textEl) textEl.textContent = instruction.text;
    if (distanceEl) distanceEl.textContent = this.formatDistance(instruction.distance);
    if (iconEl) iconEl.className = `fas ${this.getDirectionIcon(instruction.direction)}`;

    // Actualizar lista
    this.displayInstructions();

    // Scroll a la instrucción actual
    const activeItem = document.querySelector('.instruction-item.active');
    activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Inicia el seguimiento de la ruta
   */
  startTracking() {
    if (this.trackingInterval) clearInterval(this.trackingInterval);

    this.trackingInterval = setInterval(() => {
      if (!this.isNavigating || !userMarker) return;

      const userLatLng = userMarker.getLatLng();
      this.userLocation = [userLatLng.lat, userLatLng.lng];

      // Verificar si se completó la instrucción actual
      this.checkInstructionCompletion();

      // Actualizar progreso
      this.updateProgress();
    }, 1000); // Actualizar cada segundo
  }

  /**
   * Verifica si se completó la instrucción actual
   */
  checkInstructionCompletion() {
    if (!this.userLocation || !this.instructions[this.currentStep]) return;

    const currentInstruction = this.instructions[this.currentStep];
    const nextInstruction = this.instructions[this.currentStep + 1];

    if (nextInstruction) {
      // Calcular distancia a la siguiente instrucción
      const distance = this.calculateDistance(
        this.userLocation[0],
        this.userLocation[1],
        nextInstruction.lat,
        nextInstruction.lng
      );

      // Si está cerca, pasar a la siguiente instrucción
      if (distance < 15) { // 15 metros de tolerancia
        this.currentStep++;
        this.updateCurrentInstruction();
      }
    }
  }

  /**
   * Actualiza el progreso visual
   */
  updateProgress() {
    const totalSteps = this.instructions.length;
    const progress = ((this.currentStep + 1) / totalSteps) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = `${progress}%`;
  }

  /**
   * Pausa la navegación
   */
  pauseNavigation() {
    this.isNavigating = false;
    if (this.trackingInterval) clearInterval(this.trackingInterval);

    document.getElementById('btn-pause-nav')?.style.setProperty('display', 'none');
    document.getElementById('btn-resume-nav')?.style.setProperty('display', 'block');
  }

  /**
   * Reanuda la navegación
   */
  resumeNavigation() {
    this.isNavigating = true;
    this.startTracking();

    document.getElementById('btn-pause-nav')?.style.setProperty('display', 'block');
    document.getElementById('btn-resume-nav')?.style.setProperty('display', 'none');
  }

  /**
   * Finaliza la navegación
   */
  endNavigation() {
    this.stopNavigation();
    showStatus('route-status', 'Navegación finalizada', 'success');
  }

  /**
   * Detiene la navegación
   */
  stopNavigation() {
    this.isNavigating = false;
    if (this.trackingInterval) clearInterval(this.trackingInterval);

    const panel = document.getElementById('navigation-panel');
    panel?.classList.add('hidden');

    this.currentStep = 0;
    this.instructions = [];
  }

  /**
   * Completa la navegación
   */
  completeNavigation() {
    this.stopNavigation();
    showStatus('route-status', '¡Llegaste a tu destino!', 'success');
  }

  /**
   * Intercambia origen y destino
   */
  swapRoute() {
    // Esta función se coordina con el script principal
    if (window.swapRoutePoints) {
      window.swapRoutePoints();
    }
  }

  /**
   * Obtiene el icono según la dirección
   */
  getDirectionIcon(direction) {
    const icons = {
      'straight': 'fa-arrow-up',
      'slight-left': 'fa-arrow-up-left',
      'left': 'fa-arrow-left',
      'sharp-left': 'fa-arrow-left',
      'slight-right': 'fa-arrow-up-right',
      'right': 'fa-arrow-right',
      'sharp-right': 'fa-arrow-right',
      'u-turn': 'fa-arrow-rotate-left',
      'destination': 'fa-flag-checkered'
    };
    return icons[direction] || 'fa-arrow-up';
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
   * Formatea el tiempo
   */
  formatTime(seconds) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 1) return 'menos de 1 min';
    if (minutes === 1) return '1 min';
    return minutes + ' min';
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
}

// Instancia global
let navigationPanel;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  navigationPanel = new NavigationPanel();
});
