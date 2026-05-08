/* ========================================
   PRUEBAS DEL SISTEMA DE RUTAS
   ======================================== */

const RouteSystemTests = {
  results: [],
  
  // Función auxiliar para registrar resultados
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
  
  // Test 1: Verificar que el grafo se construyó correctamente
  testGraphConstruction() {
    const testName = 'Construcción del Grafo';
    
    if (!window.graph) {
      return this.log(testName, false, 'El objeto graph no existe');
    }
    
    const nodeCount = Object.keys(graph.nodes).length;
    const adjCount = Object.keys(graph.adj).length;
    
    if (nodeCount === 0) {
      return this.log(testName, false, 'El grafo no tiene nodos');
    }
    
    if (nodeCount !== adjCount) {
      return this.log(testName, false, 
        `Inconsistencia: ${nodeCount} nodos pero ${adjCount} listas de adyacencia`);
    }
    
    return this.log(testName, true, 
      `Grafo construido con ${nodeCount} nodos`);
  },
  
  // Test 2: Verificar que findNearestNode funciona
  testFindNearestNode() {
    const testName = 'Búsqueda de Nodo Más Cercano';
    
    if (typeof findNearestNode !== 'function') {
      return this.log(testName, false, 'Función findNearestNode no existe');
    }
    
    // Coordenada de prueba (centro aproximado del campus)
    const testCoord = [-94.556, 18.006];
    
    try {
      const result = findNearestNode(testCoord);
      
      if (!result || !result.id || !result.coord) {
        return this.log(testName, false, 'Resultado inválido');
      }
      
      return this.log(testName, true, 
        `Nodo encontrado a ${result.dist.toFixed(2)}m de distancia`);
    } catch (error) {
      return this.log(testName, false, `Error: ${error.message}`);
    }
  },
  
  // Test 3: Verificar que Dijkstra funciona
  testDijkstra() {
    const testName = 'Algoritmo de Dijkstra';
    
    if (typeof dijkstra !== 'function') {
      return this.log(testName, false, 'Función dijkstra no existe');
    }
    
    // Obtener dos nodos aleatorios
    const nodeIds = Object.keys(graph.nodes);
    if (nodeIds.length < 2) {
      return this.log(testName, false, 'No hay suficientes nodos para probar');
    }
    
    const startId = nodeIds[0];
    const endId = nodeIds[Math.floor(nodeIds.length / 2)];
    
    try {
      const result = dijkstra(startId, endId);
      
      if (!result || !result.path || !Array.isArray(result.path)) {
        return this.log(testName, false, 'Resultado inválido');
      }
      
      if (result.path.length === 0) {
        return this.log(testName, false, 'No se encontró ruta');
      }
      
      return this.log(testName, true, 
        `Ruta calculada: ${result.path.length} puntos, ${result.distance.toFixed(2)}m`);
    } catch (error) {
      return this.log(testName, false, `Error: ${error.message}`);
    }
  },
  
  // Test 4: Verificar que calculateRoute funciona
  testCalculateRoute() {
    const testName = 'Función calculateRoute';
    
    if (typeof calculateRoute !== 'function') {
      return this.log(testName, false, 'Función calculateRoute no existe');
    }
    
    // Verificar que las variables globales existen
    if (!window.selectedEndPOI) {
      return this.log(testName, false, 
        'No se puede probar sin un destino seleccionado (esto es normal si no hay POI seleccionado)');
    }
    
    return this.log(testName, true, 'Función existe y está lista para usar');
  },
  
  // Test 5: Verificar integridad de POIs
  testPOIsIntegrity() {
    const testName = 'Integridad de POIs';
    
    if (!window.poisGeo || !poisGeo.features) {
      return this.log(testName, false, 'Datos de POIs no cargados');
    }
    
    const totalPOIs = poisGeo.features.length;
    let validPOIs = 0;
    let poisWithNames = 0;
    let poisWithCategories = 0;
    
    poisGeo.features.forEach(poi => {
      if (poi.geometry && poi.geometry.coordinates) {
        validPOIs++;
      }
      if (poi.properties && poi.properties.name) {
        poisWithNames++;
      }
      if (poi.properties && poi.properties.category) {
        poisWithCategories++;
      }
    });
    
    if (validPOIs !== totalPOIs) {
      return this.log(testName, false, 
        `${totalPOIs - validPOIs} POIs tienen coordenadas inválidas`);
    }
    
    return this.log(testName, true, 
      `${totalPOIs} POIs válidos (${poisWithNames} con nombre, ${poisWithCategories} con categoría)`);
  },
  
  // Test 6: Verificar integridad de rutas
  testRoutesIntegrity() {
    const testName = 'Integridad de Rutas';
    
    if (!window.routesGeo || !routesGeo.features) {
      return this.log(testName, false, 'Datos de rutas no cargados');
    }
    
    const totalRoutes = routesGeo.features.length;
    let validRoutes = 0;
    
    routesGeo.features.forEach(route => {
      if (route.geometry && 
          route.geometry.type === 'LineString' && 
          route.geometry.coordinates && 
          route.geometry.coordinates.length >= 2) {
        validRoutes++;
      }
    });
    
    if (validRoutes !== totalRoutes) {
      return this.log(testName, false, 
        `${totalRoutes - validRoutes} rutas tienen geometría inválida`);
    }
    
    return this.log(testName, true, 
      `${totalRoutes} segmentos de ruta válidos`);
  },
  
  // Test 7: Simular cálculo de ruta completo
  testFullRouteCalculation() {
    const testName = 'Cálculo de Ruta Completo (Simulación)';
    
    if (!poisGeo || !poisGeo.features || poisGeo.features.length < 2) {
      return this.log(testName, false, 'No hay suficientes POIs para probar');
    }
    
    // Seleccionar dos POIs aleatorios
    const poi1 = poisGeo.features[0];
    const poi2 = poisGeo.features[Math.floor(poisGeo.features.length / 2)];
    
    const coord1 = poi1.geometry.coordinates;
    const coord2 = poi2.geometry.coordinates;
    
    try {
      // Encontrar nodos más cercanos
      const node1 = findNearestNode(coord1);
      const node2 = findNearestNode(coord2);
      
      if (!node1.id || !node2.id) {
        return this.log(testName, false, 'No se pudieron encontrar nodos cercanos');
      }
      
      // Calcular ruta
      const route = dijkstra(node1.id, node2.id);
      
      if (!route.path || route.path.length === 0) {
        return this.log(testName, false, 'No se pudo calcular la ruta');
      }
      
      // Calcular tiempo estimado
      const estimatedTime = Math.round(route.distance / 1.4 / 60);
      
      return this.log(testName, true, 
        `Ruta de ${poi1.properties.name || 'POI 1'} a ${poi2.properties.name || 'POI 2'}: ` +
        `${(route.distance / 1000).toFixed(2)}km, ~${estimatedTime}min`);
    } catch (error) {
      return this.log(testName, false, `Error: ${error.message}`);
    }
  },
  
  // Ejecutar todas las pruebas
  runAll() {
    console.log('%c========================================', 'color: blue; font-weight: bold');
    console.log('%cPRUEBAS DEL SISTEMA DE RUTAS', 'color: blue; font-weight: bold');
    console.log('%c========================================', 'color: blue; font-weight: bold');
    
    this.results = [];
    
    this.testGraphConstruction();
    this.testFindNearestNode();
    this.testDijkstra();
    this.testCalculateRoute();
    this.testPOIsIntegrity();
    this.testRoutesIntegrity();
    this.testFullRouteCalculation();
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log('%c========================================', 'color: blue; font-weight: bold');
    console.log(`%cResultado: ${passed}/${total} pruebas pasadas (${percentage}%)`, 
      passed === total ? 'color: green; font-weight: bold' : 'color: orange; font-weight: bold');
    console.log('%c========================================', 'color: blue; font-weight: bold');
    
    return {
      total: total,
      passed: passed,
      failed: total - passed,
      percentage: percentage,
      results: this.results
    };
  },
  
  // Generar reporte HTML
  generateHTMLReport() {
    const summary = this.runAll();
    
    const html = `
      <div style="font-family: monospace; padding: 20px; background: #f5f5f5;">
        <h2>Reporte de Pruebas del Sistema de Rutas</h2>
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3>Resumen</h3>
          <p><strong>Total de pruebas:</strong> ${summary.total}</p>
          <p><strong>Aprobadas:</strong> <span style="color: green;">${summary.passed}</span></p>
          <p><strong>Fallidas:</strong> <span style="color: red;">${summary.failed}</span></p>
          <p><strong>Porcentaje de éxito:</strong> ${summary.percentage}%</p>
        </div>
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3>Detalles</h3>
          ${summary.results.map(r => `
            <div style="margin: 10px 0; padding: 10px; background: ${r.passed ? '#e8f5e9' : '#ffebee'}; border-radius: 3px;">
              <strong>${r.passed ? '✓' : '✗'} ${r.test}</strong><br>
              <small>${r.message}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    return html;
  }
};

// Ejecutar pruebas automáticamente cuando los datos estén cargados
window.addEventListener('load', function() {
  // Esperar 2 segundos para que se carguen los datos
  setTimeout(() => {
    if (window.graph && window.poisGeo && window.routesGeo) {
      console.log('%c🧪 Ejecutando pruebas del sistema de rutas...', 'color: blue; font-size: 14px;');
      RouteSystemTests.runAll();
    } else {
      console.warn('⚠️ No se pudieron ejecutar las pruebas: datos no cargados');
    }
  }, 2000);
});

// Exportar para uso manual
window.RouteSystemTests = RouteSystemTests;
