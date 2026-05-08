/* ========================================
   MÓDULO DE DIRECCIÓN MEJORADA DEL USUARIO
   - Heading del dispositivo
   - Animación suave de rotación
   - Línea de dirección visual
   ======================================== */

const UserDirectionEnhanced = {
  // Configuración
  config: {
    directionLineLength: 50, // metros
    directionLineColor: '#3498db',
    directionLineOpacity: 0.6,
    rotationSmoothness: 0.15, // 0-1, menor = más suave
    headingUpdateInterval: 500, // ms
  },

  // Estado
  state: {
    currentHeading: 0,
    targetHeading: 0,
    directionLine: null,
    isHeadingSupported: false,
    lastHeadingUpdate: 0,
  },

  // Inicializar
  init() {
    this.checkHeadingSupport();
    this.setupHeadingListener();
    this.createDirectionLine();
    console.log('✓ Sistema de dirección mejorada inicializado');
  },

  // Verificar si el dispositivo soporta heading
  checkHeadingSupport() {
    if ('DeviceOrientationEvent' in window) {
      this.state.isHeadingSupported = true;
      console.log('✓ Brújula del dispositivo disponible');
    } else {
      console.warn('⚠️ Brújula del dispositivo no disponible, usando movimiento');
    }
  },

  // Configurar listener para heading del dispositivo
  setupHeadingListener() {
    if (!this.state.isHeadingSupported) {
      return;
    }

    // Solicitar permiso en iOS 13+
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      // iOS 13+ requiere permiso explícito
      const permissionButton = document.getElementById('request-heading-permission');
      if (permissionButton) {
        permissionButton.addEventListener('click', () => {
          DeviceOrientationEvent.requestPermission()
            .then((permissionState) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', (event) => {
                  this.handleDeviceOrientation(event);
                });
                console.log('✓ Permiso de brújula concedido');
              }
            })
            .catch(console.error);
        });
      }
    } else {
      // Android y navegadores que no requieren permiso
      window.addEventListener('deviceorientation', (event) => {
        this.handleDeviceOrientation(event);
      });
    }
  },

  // Manejar cambios de orientación del dispositivo
  handleDeviceOrientation(event) {
    const now = Date.now();

    // Limitar frecuencia de actualizaciones
    if (now - this.state.lastHeadingUpdate < this.config.headingUpdateInterval) {
      return;
    }

    this.state.lastHeadingUpdate = now;

    // Obtener el heading (0-360 grados)
    // webkitCompassHeading para iOS, alpha para Android
    let heading = event.webkitCompassHeading || event.alpha;

    if (heading === undefined || heading === null) {
      return;
    }

    // Normalizar heading a 0-360
    heading = (heading + 360) % 360;

    // Actualizar heading con animación suave
    this.updateHeadingSmooth(heading);

    // Actualizar línea de dirección
    this.updateDirectionLine();
  },

  // Actualizar heading con animación suave
  updateHeadingSmooth(newHeading) {
    this.state.targetHeading = newHeading;

    // Calcular la diferencia más corta (puede ser negativa)
    let diff = this.state.targetHeading - this.state.currentHeading;

    // Ajustar para tomar el camino más corto
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }

    // Aplicar suavizado
    this.state.currentHeading +=
      diff * this.config.rotationSmoothness;

    // Normalizar
    this.state.currentHeading =
      (this.state.currentHeading + 360) % 360;

    // Actualizar icono del usuario
    this.updateUserIcon();
  },

  // Actualizar icono del usuario con rotación suave
  updateUserIcon() {
    if (!userMarker) {
      return;
    }

    const icon = userMarker.getElement();
    if (!icon) {
      return;
    }

    const walkingIcon = icon.querySelector('i');
    if (walkingIcon) {
      // Aplicar rotación suave con transición CSS
      walkingIcon.style.transition = 'transform 0.3s ease-out';
      walkingIcon.style.transform = `rotate(${this.state.currentHeading}deg)`;
    }
  },

  // Crear línea de dirección
  createDirectionLine() {
    if (!map) {
      setTimeout(() => this.createDirectionLine(), 500);
      return;
    }

    // Crear polyline para la línea de dirección
    this.state.directionLine = L.polyline([], {
      color: this.config.directionLineColor,
      weight: 3,
      opacity: this.config.directionLineOpacity,
      dashArray: '5, 5',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    console.log('✓ Línea de dirección creada');
  },

  // Actualizar línea de dirección
  updateDirectionLine() {
    if (!this.state.directionLine || !lastUserCoord) {
      return;
    }

    // Calcular punto final de la línea basado en heading y distancia
    const startLat = lastUserCoord[1];
    const startLon = lastUserCoord[0];

    // Usar Turf.js para calcular el punto destino
    try {
      const startPoint = turf.point([startLon, startLat]);
      const endPoint = turf.destination(
        startPoint,
        this.config.directionLineLength / 1000, // convertir metros a km
        this.state.currentHeading
      );

      const endCoords = endPoint.geometry.coordinates;

      // Actualizar polyline
      this.state.directionLine.setLatLngs([
        [startLat, startLon],
        [endCoords[1], endCoords[0]],
      ]);
    } catch (e) {
      console.warn('Error actualizando línea de dirección:', e);
    }
  },

  // Alternativamente, usar bearing del movimiento si heading no está disponible
  updateHeadingFromMovement(fromCoord, toCoord) {
    if (this.state.isHeadingSupported) {
      return; // Usar heading del dispositivo si está disponible
    }

    try {
      const bearing = turf.bearing(
        turf.point([fromCoord[0], fromCoord[1]]),
        turf.point([toCoord[0], toCoord[1]])
      );

      this.updateHeadingSmooth(bearing);
      this.updateDirectionLine();
    } catch (e) {
      console.warn('Error calculando bearing:', e);
    }
  },

  // Obtener información de dirección actual
  getDirectionInfo() {
    return {
      heading: Math.round(this.state.currentHeading),
      direction: this.getCompassDirection(this.state.currentHeading),
      headingSupported: this.state.isHeadingSupported,
    };
  },

  // Convertir heading a dirección cardinal
  getCompassDirection(heading) {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(heading / 22.5) % 16;
    return directions[index];
  },

  // Cambiar longitud de la línea de dirección
  setDirectionLineLength(meters) {
    this.config.directionLineLength = meters;
    this.updateDirectionLine();
  },

  // Cambiar color de la línea de dirección
  setDirectionLineColor(color) {
    this.config.directionLineColor = color;
    if (this.state.directionLine) {
      this.state.directionLine.setStyle({ color });
    }
  },

  // Cambiar suavidad de rotación (0-1)
  setRotationSmoothness(value) {
    this.config.rotationSmoothness = Math.max(0, Math.min(1, value));
  },
};

// Inicializar cuando el mapa esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      UserDirectionEnhanced.init();
    }, 3000);
  });
} else {
  setTimeout(() => {
    UserDirectionEnhanced.init();
  }, 3000);
}

// Exponer globalmente
window.UserDirectionEnhanced = UserDirectionEnhanced;
