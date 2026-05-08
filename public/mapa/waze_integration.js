/* ========================================
   INTEGRACIÓN WAZE CON SISTEMA DE RUTAS
   Preserva el sistema original de rutas
   ======================================== */

// Esperar a que todo esté cargado
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que el sistema original esté listo
  setTimeout(() => {
    initializeWazeIntegration();
  }, 1500);
});

function initializeWazeIntegration() {
  console.log('🚀 Inicializando integración Waze...');
  
  // IMPORTANTE: Guardar la función original de calculateRoute
  const originalCalculateRoute = window.calculateRoute;
  
  if (!originalCalculateRoute) {
    console.error('⚠️ Función calculateRoute no encontrada');
    return;
  }
  
  // Sobrescribir calculateRoute para integrar con Waze
  window.calculateRoute = function() {
    console.log('📍 Calculando ruta con integración Waze...');
    
    // Ejecutar la función original (PRESERVA EL SISTEMA DE RUTAS)
    const result = originalCalculateRoute();
    
    // Integrar inmediatamente si hay resultado
    if (result) {
      integrateWithWaze();
    }
    return result;
  };
  
  // También interceptar los botones de calcular ruta como respaldo
  setTimeout(() => {
    const btnCalculateRoute = document.getElementById('btn-calculate-route');
    const btnCalculateRouteMobile = document.getElementById('btn-calculate-route-mobile');
    
    if (btnCalculateRoute) {
      const originalClick = btnCalculateRoute.onclick;
      btnCalculateRoute.addEventListener('click', () => {
        setTimeout(() => {
          console.log('🔄 Activando panel Waze desde botón desktop...');
          integrateWithWaze();
        }, 1500);
      });
    }
    
    if (btnCalculateRouteMobile) {
      const originalClick = btnCalculateRouteMobile.onclick;
      btnCalculateRouteMobile.addEventListener('click', () => {
        setTimeout(() => {
          console.log('🔄 Activando panel Waze desde botón móvil...');
          integrateWithWaze();
        }, 1500);
      });
    }
  }, 2000);
  
  console.log('✓ Integración Waze completada');
}

window.integrateWithWaze = function() {
  console.log('🔍 Intentando integrar con Waze...');
  
  // Verificar que tenemos todos los datos necesarios
  if (!window.currentRoute) {
    console.log('⚠️ No hay ruta activa (currentRoute no existe)');
    return;
  }
  
  if (!window.selectedEndPOI) {
    console.log('⚠️ No hay destino seleccionado');
    return;
  }
  
  console.log('✓ Datos de ruta encontrados, iniciando panel Waze...');
  
  // Obtener datos de la ruta
  const routePath = currentRoute.getLatLngs().map(latlng => [latlng.lng, latlng.lat]);
  
  console.log(`  - Puntos en la ruta: ${routePath.length}`);
  
  // Calcular distancia total
  let totalDistance = 0;
  for (let i = 0; i < routePath.length - 1; i++) {
    totalDistance += turf.distance(
      turf.point(routePath[i]),
      turf.point(routePath[i + 1]),
      { units: 'meters' }
    );
  }
  
  // Calcular tiempo estimado (usando la velocidad del sistema original)
  const estimatedTime = Math.round(totalDistance / 1.4 / 60);
  
  // Obtener nombre del destino
  const destinationName = selectedEndPOI.properties.name;
  
  // Iniciar navegación Waze
  if (window.WazeNavigation) {
    console.log('✓ Iniciando WazeNavigation...');
    WazeNavigation.startNavigation(
      routePath,
      totalDistance,
      estimatedTime,
      destinationName
    );
    
    console.log('✓ Navegación Waze iniciada exitosamente');
    console.log(`  - Distancia: ${(totalDistance / 1000).toFixed(2)} km`);
    console.log(`  - Tiempo estimado: ${estimatedTime} min`);
    console.log(`  - Destino: ${destinationName}`);
    console.log(`  - Actualización: cada 1 segundo`);
  } else {
    console.error('❌ WazeNavigation no está disponible');
  }
}

// Integrar con el sistema de geolocalización existente
if (window.navigator && window.navigator.geolocation) {
  // Mejorar la frecuencia de actualización
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  
  navigator.geolocation.getCurrentPosition = function(success, error, options) {
    return originalGetCurrentPosition.call(
      navigator.geolocation,
      success,
      error,
      {
        ...options,
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };
}

console.log('✓ Script de integración Waze cargado');
