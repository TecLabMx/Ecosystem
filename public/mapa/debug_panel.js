/* ========================================
   SCRIPT DE DEPURACIÓN PARA EL PANEL WAZE
   ======================================== */

// Verificar que todo se carga correctamente
window.addEventListener('load', function() {
  setTimeout(() => {
    console.log('%c========================================', 'color: purple; font-weight: bold');
    console.log('%cDEPURACIÓN DEL PANEL WAZE', 'color: purple; font-weight: bold');
    console.log('%c========================================', 'color: purple; font-weight: bold');
    
    // 1. Verificar que el panel existe en el DOM
    const panel = document.getElementById('waze-navigation-panel');
    if (panel) {
      console.log('%c✓ Panel Waze encontrado en el DOM', 'color: green');
      console.log('  - ID:', panel.id);
      console.log('  - Clases:', panel.className);
      console.log('  - Visible:', panel.classList.contains('active'));
    } else {
      console.log('%c✗ Panel Waze NO encontrado en el DOM', 'color: red');
      console.log('%c  Intentando crear el panel manualmente...', 'color: orange');
      if (window.WazeNavigation) {
        WazeNavigation.createNavigationPanel();
        console.log('%c  ✓ Panel creado manualmente', 'color: green');
      }
    }
    
    // 2. Verificar WazeNavigation
    if (window.WazeNavigation) {
      console.log('%c✓ WazeNavigation disponible', 'color: green');
      console.log('  - Intervalo de actualización:', WazeNavigation.updateInterval, 'ms');
    } else {
      console.log('%c✗ WazeNavigation NO disponible', 'color: red');
    }
    
    // 3. Verificar sistema de rutas original
    if (window.calculateRoute) {
      console.log('%c✓ Función calculateRoute disponible', 'color: green');
    } else {
      console.log('%c✗ Función calculateRoute NO disponible', 'color: red');
    }
    
    // 4. Verificar datos de ruta
    if (window.currentRoute) {
      console.log('%c✓ Hay una ruta activa', 'color: green');
    } else {
      console.log('%c⚠ No hay ruta activa (esto es normal si no has calculado una ruta)', 'color: orange');
    }
    
    // 5. Verificar modo oscuro
    if (document.body.classList.contains('dark-mode')) {
      console.log('%c✓ Modo oscuro activado', 'color: green');
    } else {
      console.log('%c⚠ Modo oscuro desactivado', 'color: orange');
    }
    
    console.log('%c========================================', 'color: purple; font-weight: bold');
    console.log('%cPara probar el panel:', 'color: blue; font-weight: bold');
    console.log('%c1. Obtén tu ubicación (botón "Actualizar mi ubicación")', 'color: blue');
    console.log('%c2. Selecciona un destino de la lista', 'color: blue');
    console.log('%c3. Haz clic en "Calcular Ruta"', 'color: blue');
    console.log('%c4. El panel Waze debería aparecer automáticamente', 'color: blue');
    console.log('%c========================================', 'color: purple; font-weight: bold');
    
  }, 3000);
});

// Función de prueba manual
window.testWazePanel = function() {
  console.log('🧪 Probando panel Waze manualmente...');
  
  const panel = document.getElementById('waze-navigation-panel');
  if (!panel) {
    console.error('❌ Panel no encontrado');
    return;
  }
  
  // Activar el panel manualmente
  panel.classList.add('active');
  console.log('✓ Panel activado manualmente');
  console.log('  Deberías ver el panel en la pantalla ahora');
  
  // Desactivar después de 5 segundos
  setTimeout(() => {
    panel.classList.remove('active');
    console.log('✓ Panel desactivado');
  }, 5000);
};

console.log('%c💡 TIP: Ejecuta testWazePanel() en la consola para probar el panel manualmente', 
  'color: cyan; font-size: 12px; font-weight: bold');
