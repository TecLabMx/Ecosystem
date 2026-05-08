/* ========================================
   MÓDULO DE UBICACIÓN ESTABLE Y MEJORADO
   - Sin conflictos con watchPosition
   - Precisión mejorada
   - Dirección con animación suave
   ======================================== */

const LocationStable = {
  config: {
    rotationSmoothness: 0.2,
    minMovementDistance: 0.5, // metros
  },

  state: {
    currentHeading: 0,
    targetHeading: 0,
    lastValidCoord: null,
    directionLine: null,
  },

  init() {
    console.log('✓ Sistema de ubicación estable inicializado');
    // El watchPosition ya está activo en script_simplified.js
    // Solo mejoramos la rotación y dirección
    this.setupDirectionLine();
    this.improveRotation();
  },

  setupDirectionLine() {
    if (!map) {
      setTimeout(() => this.setupDirectionLine(), 500);
      return;
    }

    this.state.directionLine = L.polyline([], {
      color: '#3498db',
      weight: 3,
      opacity: 0.6,
      dashArray: '5, 5',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    console.log('✓ Línea de dirección creada');
  },

  improveRotation() {
    // Mejorar la rotación del icono en cada actualización de ubicación
    const originalRequestUserLocation = window.requestUserLocation;

    window.requestUserLocation = function () {
      if (!navigator.geolocation) {
        console.error('Geolocalización no disponible');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        function (position) {
          const { latitude, longitude, heading } = position.coords;
          const newCoord = [longitude, latitude];

          // Calcular bearing si no hay heading
          let currentBearing = heading !== null ? heading : lastUserBearing;

          if (LocationStable.state.lastValidCoord) {
            try {
              const bearing = turf.bearing(
                turf.point([
                  LocationStable.state.lastValidCoord[0],
                  LocationStable.state.lastValidCoord[1],
                ]),
                turf.point([longitude, latitude])
              );
              currentBearing = bearing;
            } catch (e) {
              console.warn('Error calculando bearing:', e);
            }
          }

          LocationStable.state.lastValidCoord = newCoord;
          LocationStable.state.targetHeading = currentBearing;

          // Aplicar suavizado de rotación
          let diff = LocationStable.state.targetHeading - LocationStable.state.currentHeading;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          LocationStable.state.currentHeading +=
            diff * LocationStable.config.rotationSmoothness;
          LocationStable.state.currentHeading =
            (LocationStable.state.currentHeading + 360) % 360;

          lastUserCoord = newCoord;
          lastUserBearing = LocationStable.state.currentHeading;

          // Crear icono con rotación suave
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<i class="fas fa-walking" style="transform: rotate(${LocationStable.state.currentHeading}deg); color: #3498db; font-size: 28px; filter: drop-shadow(0 0 4px rgba(52, 152, 219, 0.6)); transition: transform 0.3s ease-out;"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          if (userMarker) {
            userMarker.setLatLng([latitude, longitude]);
            userMarker.setIcon(userIcon);
          } else {
            userMarker = L.marker([latitude, longitude], {
              icon: userIcon,
            }).addTo(map);
            userMarker.bindPopup('Tu ubicación actual');
            map.setView([latitude, longitude], 17);
          }

          // Actualizar línea de dirección
          LocationStable.updateDirectionLine(latitude, longitude);

          // Seguimiento de navegación
          if (window.WazeNavigation && WazeNavigation.trackingIntervalId) {
            WazeNavigation.recenterMap();
          }
        },
        function (error) {
          console.error('Error obteniendo ubicación:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 8000,
        }
      );
    };

    // Llamar la función mejorada
    requestUserLocation();
  },

  updateDirectionLine(latitude, longitude) {
    if (!this.state.directionLine || !lastUserCoord) {
      return;
    }

    try {
      const startPoint = turf.point([longitude, latitude]);
      const endPoint = turf.destination(
        startPoint,
        0.05, // 50 metros en km
        this.state.currentHeading
      );

      const endCoords = endPoint.geometry.coordinates;

      this.state.directionLine.setLatLngs([
        [latitude, longitude],
        [endCoords[1], endCoords[0]],
      ]);
    } catch (e) {
      console.warn('Error actualizando línea de dirección:', e);
    }
  },
};

// Inicializar cuando el mapa esté listo
setTimeout(() => {
  LocationStable.init();
}, 2000);

window.LocationStable = LocationStable;
