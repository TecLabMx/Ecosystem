/* ========================================
   MÓDULO DE UBICACIÓN EN TIEMPO REAL MEJORADO
   Precisión alta + Limitado al campus
   ======================================== */

const LocationPrecision = {
  // Configuración
  config: {
    minMovementDistance: 0.001, // 1 metro en grados aproximados
    maxAccuracyThreshold: 50, // metros
    outOfBoundsThreshold: 3, // intentos antes de alertar
    updateInterval: 1000, // ms entre actualizaciones
  },

  // Estado
  state: {
    lastValidCoord: null,
    consecutiveOutOfBounds: 0,
    lastUpdateTime: 0,
  },

  // Inicializar
  init() {
    this.improveUserLocationTracking();
    console.log('✓ Sistema de ubicación mejorado inicializado');
  },

  // Verificar si la ubicación está dentro del campus
  isLocationInCampus(lat, lon) {
    const [minLon, minLat, maxLon, maxLat] = campusBBox;
    const tolerance = 0.0005; // ~50 metros de tolerancia

    return (
      lon >= minLon - tolerance &&
      lon <= maxLon + tolerance &&
      lat >= minLat - tolerance &&
      lat <= maxLat + tolerance
    );
  },

  // Mejorar el seguimiento de ubicación del usuario
  improveUserLocationTracking() {
    // Detener el watchPosition anterior si existe
    if (typeof stopUserLocationTracking === 'function') {
      stopUserLocationTracking();
    }

    if (!navigator.geolocation) {
      console.error('Geolocalización no disponible');
      return;
    }

    const self = this;

    // Usar watchPosition con opciones mejoradas
    watchId = navigator.geolocation.watchPosition(
      function (position) {
        const { latitude, longitude, heading, accuracy } = position.coords;
        const newCoord = [longitude, latitude];
        const now = Date.now();

        // Validar que no haya pasado muy poco tiempo desde la última actualización
        if (now - self.state.lastUpdateTime < self.config.updateInterval) {
          return;
        }

        // Verificar si está dentro del campus
        if (!self.isLocationInCampus(latitude, longitude)) {
          self.state.consecutiveOutOfBounds++;

          if (self.state.consecutiveOutOfBounds === 1) {
            console.warn(
              `⚠️ Ubicación fuera del campus. Precisión: ${Math.round(accuracy)}m`
            );
          }

          if (self.state.consecutiveOutOfBounds > self.config.outOfBoundsThreshold) {
            console.error('❌ Se ha salido del campus. Ubicación no actualizada.');
            return;
          }
        } else {
          self.state.consecutiveOutOfBounds = 0;
        }

        // Validar precisión
        if (accuracy && accuracy > self.config.maxAccuracyThreshold) {
          console.warn(
            `⚠️ Precisión baja: ${Math.round(accuracy)}m. Esperando mejor señal...`
          );
        }

        // Filtro de movimiento: ignorar cambios muy pequeños
        if (self.state.lastValidCoord) {
          const distance = calculateDistance(
            self.state.lastValidCoord[1],
            self.state.lastValidCoord[0],
            latitude,
            longitude
          );

          // Si el movimiento es menor a 1 metro, ignorar
          if (distance < self.config.minMovementDistance) {
            return;
          }
        }

        self.state.lastValidCoord = newCoord;
        self.state.lastUpdateTime = now;
        lastUserCoord = newCoord;

        // Calcular bearing con precisión mejorada
        let currentBearing = heading !== null ? heading : lastUserBearing;

        if (self.state.lastValidCoord && lastUserCoord) {
          try {
            const bearing = turf.bearing(
              turf.point([self.state.lastValidCoord[0], self.state.lastValidCoord[1]]),
              turf.point([longitude, latitude])
            );
            currentBearing = bearing;
          } catch (e) {
            console.warn('Error calculando bearing:', e);
          }
        }

        lastUserBearing = currentBearing;

        // Determinar clase de precisión
        let accuracyClass = 'low-precision';
        if (accuracy && accuracy < 10) {
          accuracyClass = 'high-precision';
        } else if (accuracy && accuracy < 30) {
          accuracyClass = 'medium-precision';
        }

        // Crear icono con efecto de precisión
        const userIcon = L.divIcon({
          className: `user-location-marker ${accuracyClass}`,
          html: `<i class="fas fa-walking" style="transform: rotate(${currentBearing}deg); color: #3498db; font-size: 28px; filter: drop-shadow(0 0 6px rgba(52, 152, 219, 0.8));"></i>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Actualizar o crear marcador
        if (userMarker) {
          userMarker.setLatLng([latitude, longitude]);
          userMarker.setIcon(userIcon);
          userMarker.setPopupContent(
            `Tu ubicación actual<br><small>Precisión: ${Math.round(accuracy)}m</small>`
          );
        } else {
          userMarker = L.marker([latitude, longitude], {
            icon: userIcon,
          }).addTo(map);
          userMarker.bindPopup(
            `Tu ubicación actual<br><small>Precisión: ${Math.round(accuracy)}m</small>`
          );
          map.setView([latitude, longitude], 17);
        }

        // Actualizar vista si está en navegación
        if (window.WazeNavigation && WazeNavigation.trackingIntervalId) {
          WazeNavigation.recenterMap();
        }

        console.log(
          `✓ Ubicación actualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (${Math.round(accuracy)}m)`
        );
      },
      function (error) {
        console.error('Error obteniendo ubicación:', error);

        // Mensajes de error descriptivos
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error(
              '❌ Permiso de ubicación denegado. Por favor, habilita la geolocalización.'
            );
            break;
          case error.POSITION_UNAVAILABLE:
            console.error(
              '❌ Ubicación no disponible. Intenta en un área con mejor señal GPS.'
            );
            break;
          case error.TIMEOUT:
            console.error('❌ Tiempo de espera agotado. Intenta nuevamente.');
            break;
        }
      },
      {
        enableHighAccuracy: true, // Usar GPS de alta precisión
        maximumAge: 0, // No usar ubicación en caché
        timeout: 10000, // 10 segundos para mejor precisión
      }
    );
  },

  // Obtener información de precisión actual
  getPrecisionInfo() {
    if (!lastUserCoord) {
      return {
        status: 'No disponible',
        accuracy: null,
        inCampus: false,
      };
    }

    return {
      status: 'Activa',
      accuracy: 'Desconocida',
      inCampus: this.isLocationInCampus(lastUserCoord[1], lastUserCoord[0]),
    };
  },
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el mapa esté listo
    setTimeout(() => {
      LocationPrecision.init();
    }, 2000);
  });
} else {
  setTimeout(() => {
    LocationPrecision.init();
  }, 2000);
}

// Exponer globalmente
window.LocationPrecision = LocationPrecision;
