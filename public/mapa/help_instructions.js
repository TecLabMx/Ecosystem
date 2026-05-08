/* ========================================
   MÓDULO DE AYUDA E INSTRUCCIONES
   Sistema de ayuda rápida para usuarios
   ======================================== */

const HelpSystem = {
  // Estado
  state: {
    isOpen: false
  },
  
  // Inicializar
  init() {
    this.createHelpButton();
    this.createHelpModal();
    this.setupEventListeners();
    console.log('✓ Sistema de ayuda inicializado');
  },
  
  // Crear botón de ayuda flotante
  createHelpButton() {
    const button = document.createElement('button');
    button.className = 'help-floating-button';
    button.id = 'help-floating-button';
    button.setAttribute('aria-label', 'Ayuda');
    button.innerHTML = '<i class="fas fa-question-circle"></i>';
    
    document.body.appendChild(button);
  },
  
  // Crear modal de ayuda
  createHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'help-modal';
    modal.id = 'help-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="help-modal-overlay" id="help-modal-overlay"></div>
      
      <div class="help-modal-content">
        <div class="help-modal-header">
          <h2>
            <i class="fas fa-info-circle"></i>
            Cómo usar ConoceTEC
          </h2>
          <button class="help-modal-close" id="help-modal-close" aria-label="Cerrar ayuda">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="help-modal-body">
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="help-section-content">
              <h3>1. Explora el mapa</h3>
              <p>Navega por el mapa del campus usando gestos táctiles (móvil) o el mouse (PC). Haz zoom para ver más detalles.</p>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="help-section-content">
              <h3>2. Selecciona un punto de interés</h3>
              <p>Toca o haz clic en cualquier edificio o punto del mapa para ver su información. Aparecerá una tarjeta con detalles.</p>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-flag-checkered"></i>
            </div>
            <div class="help-section-content">
              <h3>3. Establece tu destino</h3>
              <p>En la tarjeta de información, presiona el botón <strong>"Establecer como destino"</strong> para seleccionar ese lugar como tu objetivo.</p>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-route"></i>
            </div>
            <div class="help-section-content">
              <h3>4. Genera tu ruta</h3>
              <p>Una vez establecido el destino, presiona <strong>"Generar ruta"</strong> para calcular el camino desde tu ubicación actual.</p>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-directions"></i>
            </div>
            <div class="help-section-content">
              <h3>5. Sigue las indicaciones</h3>
              <p>La aplicación te mostrará indicaciones paso a paso para llegar a tu destino. Sigue las flechas y distancias en pantalla.</p>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-section-icon">
              <i class="fas fa-crosshairs"></i>
            </div>
            <div class="help-section-content">
              <h3>6. Ubicación en tiempo real</h3>
              <p>La aplicación usa tu GPS para mostrarte tu posición actual en el mapa. Asegúrate de tener activada la ubicación.</p>
            </div>
          </div>
          
          <div class="help-tips">
            <h3><i class="fas fa-lightbulb"></i> Consejos útiles</h3>
            <ul>
              <li><strong>Permisos de ubicación:</strong> Permite el acceso a tu ubicación para obtener rutas precisas.</li>
              <li><strong>Conexión a internet:</strong> Se recomienda tener conexión para cargar el mapa correctamente.</li>
              <li><strong>Modo oscuro:</strong> La interfaz se adapta automáticamente según la configuración de tu dispositivo.</li>
              <li><strong>Zoom:</strong> Usa dos dedos (móvil) o la rueda del mouse (PC) para hacer zoom.</li>
            </ul>
          </div>
        </div>
        
        <div class="help-modal-footer">
          <button class="btn-help-primary" id="btn-help-close">
            <i class="fas fa-check"></i>
            Entendido
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  // Configurar event listeners
  setupEventListeners() {
    // Abrir modal
    document.getElementById('help-floating-button').addEventListener('click', () => {
      this.openModal();
    });
    
    // Cerrar modal - botón X
    document.getElementById('help-modal-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Cerrar modal - botón "Entendido"
    document.getElementById('btn-help-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Cerrar modal - clic en overlay
    document.getElementById('help-modal-overlay').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Cerrar modal - tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.closeModal();
      }
    });
  },
  
  // Abrir modal
  openModal() {
    const modal = document.getElementById('help-modal');
    modal.style.display = 'flex';
    this.state.isOpen = true;
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Animar entrada
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  },
  
  // Cerrar modal
  closeModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('show');
    
    setTimeout(() => {
      modal.style.display = 'none';
      this.state.isOpen = false;
      
      // Restaurar scroll del body
      document.body.style.overflow = '';
    }, 300);
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HelpSystem.init();
  });
} else {
  HelpSystem.init();
}
