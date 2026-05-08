/**
 * Help Module - Módulo de ayuda interactivo
 * Proporciona guía de uso y tutoriales sobre cómo funciona la aplicación
 */

class HelpModule {
  constructor() {
    this.isOpen = false;
    this.currentStep = 0;
    this.init();
  }

  init() {
    this.createHelpModal();
    this.attachEventListeners();
  }

  /**
   * Crea el modal de ayuda
   */
  createHelpModal() {
    const modalHTML = `
      <div id="help-modal" class="help-modal hidden">
        <!-- Overlay -->
        <div class="help-overlay" id="help-overlay"></div>

        <!-- Modal Content -->
        <div class="help-modal-content">
          <!-- Header -->
          <div class="help-header">
            <h2>¿Cómo funciona ConoceTec?</h2>
            <button class="help-close" id="help-close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Tabs -->
          <div class="help-tabs">
            <button class="help-tab-btn active" data-tab="inicio">
              <i class="fas fa-home"></i> Inicio
            </button>
            <button class="help-tab-btn" data-tab="buscar">
              <i class="fas fa-search"></i> Buscar
            </button>
            <button class="help-tab-btn" data-tab="rutas">
              <i class="fas fa-route"></i> Rutas
            </button>
            <button class="help-tab-btn" data-tab="navegacion">
              <i class="fas fa-compass"></i> Navegación
            </button>
            <button class="help-tab-btn" data-tab="consejos">
              <i class="fas fa-lightbulb"></i> Consejos
            </button>
          </div>

          <!-- Tab Content -->
          <div class="help-content">
            <!-- Inicio -->
            <div class="help-tab-content active" id="tab-inicio">
              <div class="help-section">
                <h3><i class="fas fa-map"></i> Bienvenido a ConoceTec</h3>
                <p>ConoceTec es una aplicación de navegación interactiva diseñada para ayudarte a moverte por el campus del Instituto Tecnológico de Minatitlán.</p>
              </div>

              <div class="help-section">
                <h4>Características principales:</h4>
                <ul class="help-list">
                  <li><strong>Mapa interactivo</strong> - Visualiza todos los edificios y puntos de interés del campus</li>
                  <li><strong>Búsqueda inteligente</strong> - Encuentra rápidamente lo que buscas</li>
                  <li><strong>Generación de rutas</strong> - Obtén direcciones paso a paso</li>
                  <li><strong>Navegación en tiempo real</strong> - Sigue las instrucciones mientras te desplazas</li>
                  <li><strong>Información detallada</strong> - Conoce horarios, servicios y contactos</li>
                </ul>
              </div>

              <div class="help-section">
                <p class="help-tip"><i class="fas fa-info-circle"></i> <strong>Tip:</strong> La aplicación funciona mejor en navegadores modernos como Chrome, Firefox o Safari.</p>
              </div>
            </div>

            <!-- Buscar -->
            <div class="help-tab-content" id="tab-buscar">
              <div class="help-section">
                <h3><i class="fas fa-search"></i> Cómo Buscar</h3>
                <p>Hay varias formas de encontrar lo que buscas en ConoceTec:</p>
              </div>

              <div class="help-section">
                <h4>1. Búsqueda por texto</h4>
                <p>Escribe en la barra de búsqueda para encontrar edificios, servicios o puntos de interés.</p>
                <ul class="help-list">
                  <li>Escribe el nombre completo o parcial</li>
                  <li>Verás sugerencias mientras escribes</li>
                  <li>Haz clic en un resultado para seleccionarlo</li>
                </ul>
              </div>

              <div class="help-section">
                <h4>2. Búsqueda por categoría</h4>
                <p>Filtra por categorías como:</p>
                <ul class="help-list">
                  <li>Edificios</li>
                  <li>Cafeterías</li>
                  <li>Biblioteca</li>
                  <li>Estacionamiento</li>
                  <li>Y más...</li>
                </ul>
              </div>

              <div class="help-section">
                <h4>3. Clic en el mapa</h4>
                <p>Haz clic directamente en un punto del mapa para ver información y seleccionarlo como destino.</p>
              </div>

              <div class="help-section">
                <p class="help-tip"><i class="fas fa-info-circle"></i> <strong>Tip:</strong> Usa la búsqueda reciente para acceder rápidamente a lugares que visitaste antes.</p>
              </div>
            </div>

            <!-- Rutas -->
            <div class="help-tab-content" id="tab-rutas">
              <div class="help-section">
                <h3><i class="fas fa-route"></i> Generación de Rutas</h3>
                <p>Obtén direcciones paso a paso entre dos puntos del campus:</p>
              </div>

              <div class="help-section">
                <h4>Paso 1: Selecciona tu ubicación de inicio</h4>
                <ul class="help-list">
                  <li>Por defecto es tu ubicación actual (si permites geolocalización)</li>
                  <li>O selecciona un punto específico del campus</li>
                </ul>
              </div>

              <div class="help-section">
                <h4>Paso 2: Selecciona tu destino</h4>
                <ul class="help-list">
                  <li>Busca un edificio o servicio</li>
                  <li>O haz clic directamente en el mapa</li>
                  <li>Verás información del lugar antes de confirmar</li>
                </ul>
              </div>

              <div class="help-section">
                <h4>Paso 3: Calcula la ruta</h4>
                <ul class="help-list">
                  <li>Haz clic en el botón "Calcular Ruta"</li>
                  <li>Se mostrará la distancia total y tiempo estimado</li>
                  <li>Verás la ruta dibujada en el mapa</li>
                </ul>
              </div>

              <div class="help-section">
                <p class="help-tip"><i class="fas fa-info-circle"></i> <strong>Tip:</strong> Puedes intercambiar origen y destino con el botón de flechas.</p>
              </div>
            </div>

            <!-- Navegación -->
            <div class="help-tab-content" id="tab-navegacion">
              <div class="help-section">
                <h3><i class="fas fa-compass"></i> Navegación en Tiempo Real</h3>
                <p>Una vez que tengas una ruta calculada, puedes iniciar la navegación:</p>
              </div>

              <div class="help-section">
                <h4>Cómo iniciar la navegación</h4>
                <ul class="help-list">
                  <li>Después de calcular la ruta, aparecerá un panel con instrucciones</li>
                  <li>Haz clic en "Empezar navegación" para comenzar</li>
                  <li>Verás la próxima instrucción destacada</li>
                </ul>
              </div>

              <div class="help-section">
                <h4>Durante la navegación</h4>
                <ul class="help-list">
                  <li><strong>Panel de instrucciones</strong> - Muestra paso a paso qué hacer</li>
                  <li><strong>Mapa actualizado</strong> - Tu ubicación se actualiza en tiempo real</li>
                  <li><strong>Progreso</strong> - Barra que muestra tu avance en la ruta</li>
                  <li><strong>Controles</strong> - Pausa, reanuda o finaliza en cualquier momento</li>
                </ul>
              </div>

              <div class="help-section">
                <p class="help-tip"><i class="fas fa-info-circle"></i> <strong>Tip:</strong> Permite el acceso a tu ubicación para que la navegación funcione correctamente.</p>
              </div>
            </div>

            <!-- Consejos -->
            <div class="help-tab-content" id="tab-consejos">
              <div class="help-section">
                <h3><i class="fas fa-lightbulb"></i> Consejos y Trucos</h3>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-star"></i> Agregar favoritos</h4>
                <p>Haz clic en la estrella en cualquier lugar para agregarlo a favoritos y acceder rápidamente después.</p>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-history"></i> Búsqueda reciente</h4>
                <p>Los lugares que buscas se guardan automáticamente. Accede a ellos rápidamente desde la búsqueda.</p>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-moon"></i> Modo oscuro</h4>
                <p>La aplicación se adapta automáticamente al modo oscuro de tu dispositivo para mayor comodidad.</p>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-mobile-alt"></i> Versión móvil</h4>
                <p>ConoceTec está optimizado para dispositivos móviles. Usa la interfaz táctil para mejor experiencia.</p>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-zoom-in"></i> Zoom del mapa</h4>
                <p>Usa los botones + y - para acercar o alejar el mapa. También puedes usar la rueda del ratón.</p>
              </div>

              <div class="help-section">
                <h4><i class="fas fa-share-alt"></i> Compartir ubicaciones</h4>
                <p>Haz clic en el botón de compartir para enviar una ubicación a otros usuarios.</p>
              </div>

              <div class="help-section">
                <p class="help-tip"><i class="fas fa-info-circle"></i> <strong>Tip:</strong> Consulta esta ayuda en cualquier momento haciendo clic en el botón de ayuda en la esquina superior derecha.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="help-footer">
            <p>¿Necesitas más ayuda? Contacta al equipo de soporte del Instituto Tecnológico de Minatitlán.</p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
   * Adjunta los event listeners
   */
  attachEventListeners() {
    // Botón de cerrar
    document.getElementById('help-close')?.addEventListener('click', () => this.closeHelp());

    // Overlay
    document.getElementById('help-overlay')?.addEventListener('click', () => this.closeHelp());

    // Tabs
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.help-tab-btn')));
    });

    // Botón de ayuda en el header
    document.getElementById('btn-help')?.addEventListener('click', () => this.openHelp());
  }

  /**
   * Abre el modal de ayuda
   */
  openHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('visible');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal de ayuda
   */
  closeHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.classList.add('hidden');
      this.isOpen = false;
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Cambia entre tabs
   */
  switchTab(tabBtn) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Agregar clase active al botón clickeado
    tabBtn.classList.add('active');

    // Obtener el tab a mostrar
    const tabName = tabBtn.dataset.tab;

    // Remover clase active de todos los contenidos
    document.querySelectorAll('.help-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Mostrar el contenido del tab
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
      tabContent.classList.add('active');
    }
  }

  /**
   * Muestra ayuda para una sección específica
   */
  showHelpForSection(sectionName) {
    this.openHelp();

    // Encontrar y hacer clic en el tab correspondiente
    const tabBtn = document.querySelector(`[data-tab="${sectionName}"]`);
    if (tabBtn) {
      tabBtn.click();
    }
  }
}

// Instancia global
let helpModule;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    helpModule = new HelpModule();
  }, 500);
});
