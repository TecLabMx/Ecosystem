/* ========================================
   SISTEMA DE NAVEGACIÓN ESTILO WAZE
   Actualización cada 1 segundo
   ======================================== */

const WazeNavigation = {
  // Configuración
  updateInterval: 1000, // 1 segundo (como solicitaste)
  trackingIntervalId: null,
  currentRoute: null,
  currentInstructionIndex: 0,
  userPosition: null,
  instructions: [],
  
  // Inicializar
  init() {
    this.createNavigationPanel();
    this.setupDarkModeToggle();
    console.log('✓ Sistema de navegación Waze inicializado');
  },
  
  // Crear el panel HTML
  createNavigationPanel() {
    const panel = document.createElement('div');
    panel.id = 'waze-navigation-panel';
    panel.className = 'waze-navigation-panel';
    panel.innerHTML = `
      <div class="waze-nav-header">
        <div class="waze-nav-title">
          <i class="fas fa-location-arrow"></i>
          <span>Navegando</span>
        </div>
        <button class="waze-nav-close" id="waze-nav-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="waze-current-instruction">
        <div class="waze-instruction-main">
          <div class="waze-instruction-icon" id="waze-current-icon">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="waze-instruction-text">
            <div class="waze-instruction-distance" id="waze-current-distance">--</div>
            <div class="waze-instruction-action" id="waze-current-action">Calculando ruta...</div>
            <div class="waze-instruction-street" id="waze-current-street"></div>
          </div>
        </div>
      </div>
      
      <div class="waze-progress-container">
        <div class="waze-progress-bar">
          <div class="waze-progress-fill" id="waze-progress-fill" style="width: 0%"></div>
        </div>
        <div class="waze-progress-text">
          <span id="waze-progress-current">0 m</span>
          <span id="waze-progress-total">0 m</span>
        </div>
      </div>
      
      <div class="waze-route-info">
        <div class="waze-route-stat">
          <div class="waze-route-stat-icon"><i class="fas fa-route"></i></div>
          <span class="waze-route-stat-value" id="waze-total-distance">--</span>
          <span class="waze-route-stat-label">Distancia</span>
        </div>
        <div class="waze-route-stat">
          <div class="waze-route-stat-icon"><i class="fas fa-clock"></i></div>
          <span class="waze-route-stat-value" id="waze-eta">--</span>
          <span class="waze-route-stat-label">Tiempo</span>
        </div>
        <div class="waze-route-stat">
          <div class="waze-route-stat-icon"><i class="fas fa-tachometer-alt"></i></div>
          <span class="waze-route-stat-value" id="waze-speed">--</span>
          <span class="waze-route-stat-label">Velocidad</span>
        </div>
      </div>
      
      <div class="waze-upcoming-instructions" id="waze-upcoming-list">
        <!-- Se llenarán dinámicamente -->
      </div>
      
      <div class="waze-nav-actions">
        <button class="waze-action-btn waze-action-btn-secondary" id="waze-recenter">
          <i class="fas fa-crosshairs"></i>
          Recentrar
        </button>
        <button class="waze-action-btn waze-action-btn-primary" id="waze-stop-nav">
          <i class="fas fa-stop"></i>
          Detener
        </button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Event listeners
    document.getElementById('waze-nav-close').addEventListener('click', () => this.stopNavigation());
    document.getElementById('waze-stop-nav').addEventListener('click', () => this.stopNavigation());
    document.getElementById('waze-recenter').addEventListener('click', () => this.recenterMap());
  },
  
  // Configurar toggle de modo oscuro
  setupDarkModeToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'dark-mode-toggle';
    toggle.innerHTML = '<i class="fas fa-moon"></i>';
    toggle.addEventListener('click', () => this.toggleDarkMode());
    document.body.appendChild(toggle);
    
    // Activar modo oscuro por defecto
    document.body.classList.add('dark-mode');
    toggle.innerHTML = '<i class="fas fa-sun"></i>';
  },
  
  // Toggle modo oscuro
  toggleDarkMode() {
    const body = document.body;
    const toggle = document.querySelector('.dark-mode-toggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
      toggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('conocetec_dark_mode', 'true');
    } else {
      toggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('conocetec_dark_mode', 'false');
    }
  },
  
  // Iniciar navegación
  startNavigation(routePath, totalDistance, estimatedTime, destinationName) {
    this.currentRoute = routePath;
    this.instructions = this.generateInstructions(routePath);
    this.currentInstructionIndex = 0;
    
    // Mostrar panel
    const panel = document.getElementById('waze-navigation-panel');
    panel.classList.add('active');
    
    // Actualizar información general
    document.getElementById('waze-total-distance').textContent = 
      `${(totalDistance / 1000).toFixed(2)} km`;
    document.getElementById('waze-eta').textContent = 
      `${estimatedTime} min`;
    
    // Iniciar seguimiento cada 1 segundo
    this.startTracking();
    
    console.log('✓ Navegación iniciada - Actualización cada 1 segundo');
  },
  
  // Generar instrucciones de navegación
  generateInstructions(routePath) {
    const instructions = [];
    
    for (let i = 0; i < routePath.length - 1; i++) {
      const current = routePath[i];
      const next = routePath[i + 1];
      
      // Calcular distancia al siguiente punto
      const distance = turf.distance(
        turf.point(current),
        turf.point(next),
        { units: 'meters' }
      );
      
      // Calcular dirección
      const bearing = this.calculateBearing(
        current[1], current[0],
        next[1], next[0]
      );
      
      const direction = this.bearingToDirection(bearing);
      
      instructions.push({
        point: next,
        distance: distance,
        bearing: bearing,
        direction: direction,
        action: this.getActionText(direction),
        icon: this.getDirectionIcon(direction)
      });
    }
    
    return instructions;
  },
  
  // Calcular bearing entre dos puntos
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  },
  
  // Convertir bearing a dirección
  bearingToDirection(bearing) {
    if (bearing >= 337.5 || bearing < 22.5) return 'north';
    if (bearing >= 22.5 && bearing < 67.5) return 'northeast';
    if (bearing >= 67.5 && bearing < 112.5) return 'east';
    if (bearing >= 112.5 && bearing < 157.5) return 'southeast';
    if (bearing >= 157.5 && bearing < 202.5) return 'south';
    if (bearing >= 202.5 && bearing < 247.5) return 'southwest';
    if (bearing >= 247.5 && bearing < 292.5) return 'west';
    if (bearing >= 292.5 && bearing < 337.5) return 'northwest';
    return 'north';
  },
  
  // Obtener texto de acción
  getActionText(direction) {
    const actions = {
      'north': 'Continúa recto',
      'northeast': 'Gira ligeramente a la derecha',
      'east': 'Gira a la derecha',
      'southeast': 'Gira fuertemente a la derecha',
      'south': 'Da la vuelta',
      'southwest': 'Gira fuertemente a la izquierda',
      'west': 'Gira a la izquierda',
      'northwest': 'Gira ligeramente a la izquierda'
    };
    return actions[direction] || 'Continúa';
  },
  
  // Obtener icono de dirección
  getDirectionIcon(direction) {
    const icons = {
      'north': 'fa-arrow-up',
      'northeast': 'fa-arrow-up-right',
      'east': 'fa-arrow-right',
      'southeast': 'fa-arrow-down-right',
      'south': 'fa-arrow-down',
      'southwest': 'fa-arrow-down-left',
      'west': 'fa-arrow-left',
      'northwest': 'fa-arrow-up-left'
    };
    return icons[direction] || 'fa-arrow-up';
  },
  
  // Iniciar seguimiento (cada 1 segundo)
  startTracking() {
    // Limpiar intervalo anterior si existe
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
    }
    
    // Actualizar cada 1 segundo (1000ms)
    this.trackingIntervalId = setInterval(() => {
      this.updateNavigation();
    }, this.updateInterval);
    
    // Primera actualización inmediata
    this.updateNavigation();
  },
  
  // Actualizar navegación
  updateNavigation() {
    if (!this.currentRoute || !window.lastUserCoord) {
      return;
    }
    
    this.userPosition = lastUserCoord;
    
    // Encontrar la instrucción actual
    const currentInstruction = this.getCurrentInstruction();
    
    if (!currentInstruction) {
      this.onArrival();
      return;
    }
    
    // Actualizar UI
    this.updateCurrentInstruction(currentInstruction);
    this.updateProgress();
    this.updateUpcomingInstructions();
    this.updateSpeed();
  },
  
  // Obtener instrucción actual
  getCurrentInstruction() {
    if (!this.instructions || this.instructions.length === 0) {
      return null;
    }
    
    // Encontrar el punto más cercano adelante
    let minDistance = Infinity;
    let closestIndex = this.currentInstructionIndex;
    
    for (let i = this.currentInstructionIndex; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      const distance = turf.distance(
        turf.point(this.userPosition),
        turf.point(instruction.point),
        { units: 'meters' }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
      
      // Si pasamos el punto (distancia muy pequeña), avanzar
      if (distance < 10 && i > this.currentInstructionIndex) {
        this.currentInstructionIndex = i;
      }
    }
    
    return {
      ...this.instructions[closestIndex],
      distanceToPoint: minDistance,
      index: closestIndex
    };
  },
  
  // Actualizar instrucción actual
  updateCurrentInstruction(instruction) {
    const distanceEl = document.getElementById('waze-current-distance');
    const actionEl = document.getElementById('waze-current-action');
    const iconEl = document.getElementById('waze-current-icon');
    
    // Formatear distancia
    let distanceText;
    if (instruction.distanceToPoint < 1000) {
      distanceText = `${Math.round(instruction.distanceToPoint)} m`;
    } else {
      distanceText = `${(instruction.distanceToPoint / 1000).toFixed(1)} km`;
    }
    
    distanceEl.textContent = distanceText;
    actionEl.textContent = instruction.action;
    iconEl.innerHTML = `<i class="fas ${instruction.icon}"></i>`;
  },
  
  // Actualizar barra de progreso
  updateProgress() {
    if (!this.currentRoute || !this.userPosition) return;
    
    // Calcular distancia total recorrida
    let totalDistance = 0;
    let traveledDistance = 0;
    
    for (let i = 0; i < this.currentRoute.length - 1; i++) {
      const segmentDistance = turf.distance(
        turf.point(this.currentRoute[i]),
        turf.point(this.currentRoute[i + 1]),
        { units: 'meters' }
      );
      
      totalDistance += segmentDistance;
      
      if (i < this.currentInstructionIndex) {
        traveledDistance += segmentDistance;
      }
    }
    
    // Añadir distancia desde última instrucción hasta posición actual
    if (this.currentInstructionIndex > 0) {
      const lastPoint = this.currentRoute[this.currentInstructionIndex];
      traveledDistance += turf.distance(
        turf.point(lastPoint),
        turf.point(this.userPosition),
        { units: 'meters' }
      );
    }
    
    const percentage = Math.min((traveledDistance / totalDistance) * 100, 100);
    
    document.getElementById('waze-progress-fill').style.width = `${percentage}%`;
    document.getElementById('waze-progress-current').textContent = 
      `${Math.round(traveledDistance)} m`;
    document.getElementById('waze-progress-total').textContent = 
      `${Math.round(totalDistance)} m`;
  },
  
  // Actualizar próximas instrucciones
  updateUpcomingInstructions() {
    const listEl = document.getElementById('waze-upcoming-list');
    const upcoming = this.instructions.slice(
      this.currentInstructionIndex + 1,
      this.currentInstructionIndex + 4
    );
    
    listEl.innerHTML = upcoming.map(inst => `
      <div class="waze-upcoming-instruction">
        <div class="waze-upcoming-icon">
          <i class="fas ${inst.icon}"></i>
        </div>
        <div class="waze-upcoming-text">
          <div class="waze-upcoming-action">${inst.action}</div>
          <div class="waze-upcoming-distance">
            En ${inst.distance < 1000 ? Math.round(inst.distance) + ' m' : (inst.distance / 1000).toFixed(1) + ' km'}
          </div>
        </div>
      </div>
    `).join('');
  },
  
  // Actualizar velocidad
  updateSpeed() {
    // Usar velocidad de caminata predeterminada (1.4 m/s = 5 km/h)
    const speedKmh = 5;
    document.getElementById('waze-speed').textContent = `${speedKmh} km/h`;
  },
  
  // Al llegar al destino
  onArrival() {
    const panel = document.getElementById('waze-navigation-panel');
    panel.classList.add('arrived');
    
    document.getElementById('waze-current-distance').textContent = '¡Llegaste!';
    document.getElementById('waze-current-action').textContent = 'Has llegado a tu destino';
    document.getElementById('waze-current-icon').innerHTML = 
      '<i class="fas fa-check-circle"></i>';
    
    // Detener seguimiento después de 3 segundos
    setTimeout(() => {
      this.stopNavigation();
    }, 3000);
  },
  
  // Detener navegación
  stopNavigation() {
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
    
    const panel = document.getElementById('waze-navigation-panel');
    panel.classList.remove('active', 'arrived');
    
    this.currentRoute = null;
    this.instructions = [];
    this.currentInstructionIndex = 0;
    
    console.log('✓ Navegación detenida');
  },
  
  // Recentrar mapa
  recenterMap() {
    if (window.map && this.userPosition) {
      map.setView([this.userPosition[1], this.userPosition[0]], 18);
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  WazeNavigation.init();
});

// Exportar para uso global
window.WazeNavigation = WazeNavigation;
