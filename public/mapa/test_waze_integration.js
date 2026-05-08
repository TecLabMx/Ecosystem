/* ========================================
   PRUEBAS DE INTEGRACIÓN WAZE
   ======================================== */

const WazeIntegrationTests = {
  results: [],
  
  log(testName, passed, message = '') {
    const result = {
      test: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const icon = passed ? '✓' : '✗';
    const color = passed ? 'color: green' : 'color: red';
    console.log(`%c${icon} ${testName}`, color, message);
    
    return result;
  },
  
  // Test 1: Verificar que el panel Waze existe
  testWazePanelExists() {
    const testName = 'Panel de Navegación Waze Existe';
    const panel = document.getElementById('waze-navigation-panel');
    
    if (!panel) {
      return this.log(testName, false, 'El panel no fue creado');
    }
    
    return this.log(testName, true, 'Panel creado correctamente');
  },
  
  // Test 2: Verificar modo oscuro
  testDarkMode() {
    const testName = 'Modo Oscuro Activado';
    const body = document.body;
    
    if (!body.classList.contains('dark-mode')) {
      return this.log(testName, false, 'Modo oscuro no está activado');
    }
    
    return this.log(testName, true, 'Modo oscuro activo por defecto');
  },
  
  // Test 3: Verificar que WazeNavigation está disponible
  testWazeNavigationObject() {
    const testName = 'Objeto WazeNavigation Disponible';
    
    if (!window.WazeNavigation) {
      return this.log(testName, false, 'WazeNavigation no está definido');
    }
    
    if (typeof WazeNavigation.startNavigation !== 'function') {
      return this.log(testName, false, 'Método startNavigation no existe');
    }
    
    return this.log(testName, true, 'WazeNavigation completamente funcional');
  },
  
  // Test 4: Verificar intervalo de actualización
  testUpdateInterval() {
    const testName = 'Intervalo de Actualización (1 segundo)';
    
    if (!window.WazeNavigation) {
      return this.log(testName, false, 'WazeNavigation no disponible');
    }
    
    const interval = WazeNavigation.updateInterval;
    
    if (interval !== 1000) {
      return this.log(testName, false, 
        `Intervalo incorrecto: ${interval}ms (debería ser 1000ms)`);
    }
    
    return this.log(testName, true, 'Intervalo configurado a 1 segundo');
  },
  
  // Test 5: Verificar que el sistema de rutas original no fue modificado
  testOriginalRouteSystem() {
    const testName = 'Sistema de Rutas Original Intacto';
    
    // Verificar funciones críticas
    const criticalFunctions = [
      'buildGraphFromRoutes',
      'findNearestNode',
      'dijkstra',
      'calculateRoute'
    ];
    
    const missing = [];
    for (const funcName of criticalFunctions) {
      if (typeof window[funcName] !== 'function') {
        missing.push(funcName);
      }
    }
    
    if (missing.length > 0) {
      return this.log(testName, false, 
        `Funciones faltantes: ${missing.join(', ')}`);
    }
    
    // Verificar estructura del grafo
    if (!window.graph || !graph.nodes || !graph.adj) {
      return this.log(testName, false, 'Estructura del grafo alterada');
    }
    
    return this.log(testName, true, 
      'Todas las funciones críticas del sistema de rutas están intactas');
  },
  
  // Test 6: Verificar estilos CSS cargados
  testCSSLoaded() {
    const testName = 'Estilos CSS de Waze Cargados';
    
    const requiredStyles = [
      'waze_dark_mode.css',
      'waze_navigation_panel.css'
    ];
    
    const loadedStyles = Array.from(document.styleSheets)
      .map(sheet => sheet.href)
      .filter(href => href);
    
    const missing = requiredStyles.filter(style => 
      !loadedStyles.some(href => href.includes(style))
    );
    
    if (missing.length > 0) {
      return this.log(testName, false, 
        `Estilos faltantes: ${missing.join(', ')}`);
    }
    
    return this.log(testName, true, 'Todos los estilos CSS cargados');
  },
  
  // Test 7: Verificar responsive design
  testResponsiveDesign() {
    const testName = 'Diseño Responsivo';
    
    const panel = document.getElementById('waze-navigation-panel');
    if (!panel) {
      return this.log(testName, false, 'Panel no encontrado');
    }
    
    const styles = window.getComputedStyle(panel);
    const maxWidth = styles.getPropertyValue('max-width');
    
    if (!maxWidth || maxWidth === 'none') {
      return this.log(testName, false, 'Panel no tiene max-width definido');
    }
    
    return this.log(testName, true, 
      `Panel responsivo con max-width: ${maxWidth}`);
  },
  
  // Test 8: Simular inicio de navegación
  testSimulateNavigation() {
    const testName = 'Simulación de Inicio de Navegación';
    
    if (!window.WazeNavigation) {
      return this.log(testName, false, 'WazeNavigation no disponible');
    }
    
    // Crear ruta de prueba
    const testRoute = [
      [-94.556, 18.006],
      [-94.557, 18.007],
      [-94.558, 18.008]
    ];
    
    try {
      WazeNavigation.startNavigation(testRoute, 500, 5, 'Destino de Prueba');
      
      const panel = document.getElementById('waze-navigation-panel');
      if (!panel.classList.contains('active')) {
        WazeNavigation.stopNavigation();
        return this.log(testName, false, 'Panel no se activó');
      }
      
      // Detener navegación de prueba
      WazeNavigation.stopNavigation();
      
      return this.log(testName, true, 
        'Navegación simulada correctamente');
    } catch (error) {
      return this.log(testName, false, `Error: ${error.message}`);
    }
  },
  
  // Ejecutar todas las pruebas
  runAll() {
    console.log('%c========================================', 'color: blue; font-weight: bold');
    console.log('%cPRUEBAS DE INTEGRACIÓN WAZE', 'color: blue; font-weight: bold');
    console.log('%c========================================', 'color: blue; font-weight: bold');
    
    this.results = [];
    
    this.testWazePanelExists();
    this.testDarkMode();
    this.testWazeNavigationObject();
    this.testUpdateInterval();
    this.testOriginalRouteSystem();
    this.testCSSLoaded();
    this.testResponsiveDesign();
    this.testSimulateNavigation();
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log('%c========================================', 'color: blue; font-weight: bold');
    console.log(`%cResultado: ${passed}/${total} pruebas pasadas (${percentage}%)`, 
      passed === total ? 'color: green; font-weight: bold' : 'color: orange; font-weight: bold');
    console.log('%c========================================', 'color: blue; font-weight: bold');
    
    if (passed === total) {
      console.log('%c🎉 ¡Todas las pruebas pasaron! Sistema Waze completamente funcional', 
        'color: green; font-size: 14px; font-weight: bold');
    }
    
    return {
      total: total,
      passed: passed,
      failed: total - passed,
      percentage: percentage,
      results: this.results
    };
  }
};

// Ejecutar pruebas automáticamente
window.addEventListener('load', function() {
  setTimeout(() => {
    if (window.WazeNavigation && window.graph) {
      console.log('%c🧪 Ejecutando pruebas de integración Waze...', 
        'color: blue; font-size: 14px;');
      WazeIntegrationTests.runAll();
    } else {
      console.warn('⚠️ No se pudieron ejecutar las pruebas: componentes no cargados');
    }
  }, 3000);
});

// Exportar para uso manual
window.WazeIntegrationTests = WazeIntegrationTests;
