/**
 * POI Details Card - Tarjeta de detalles mejorada tipo Google Maps
 */

class POIDetailsCard {
  constructor() {
    this.currentPOI = null;
    this.init();
  }

  init() {
    this.createCardHTML();
    this.attachEventListeners();
  }

  createCardHTML() {
    const cardHTML = `
      <div id="poi-details-card" class="poi-details-card hidden">
        <div class="poi-card-header">
          <button class="btn-close-card" id="btn-close-poi-card">
            <i class="fas fa-times"></i>
          </button>
          <button class="btn-favorite" id="btn-favorite-poi" title="Agregar a favoritos">
            <i class="fas fa-star"></i>
          </button>
        </div>

        <div class="poi-card-content">
          <!-- Imagen del POI -->
          <div class="poi-image-container" id="poi-image-container">
            <div class="poi-image-placeholder">
              <i class="fas fa-image"></i>
            </div>
          </div>

          <!-- Información básica -->
          <div class="poi-basic-info">
            <h2 class="poi-name" id="poi-name">Nombre del Lugar</h2>
            <div class="poi-category" id="poi-category">Categoría</div>
            <div class="poi-rating" id="poi-rating">
              <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
              </div>
              <span class="rating-text">(4.5)</span>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="poi-section">
            <div class="section-title">
              <i class="fas fa-map-marker-alt"></i>
              <span>Ubicación</span>
            </div>
            <div class="poi-address" id="poi-address">
              Dirección no disponible
            </div>
            <div class="poi-coordinates" id="poi-coordinates">
              Coordenadas: 0.0000, 0.0000
            </div>
          </div>

          <!-- Distancia -->
          <div class="poi-section">
            <div class="section-title">
              <i class="fas fa-ruler"></i>
              <span>Distancia</span>
            </div>
            <div class="poi-distance" id="poi-distance">
              Obtén tu ubicación para ver la distancia
            </div>
          </div>

          <!-- Horarios -->
          <div class="poi-section" id="poi-hours-section" style="display: none;">
            <div class="section-title">
              <i class="fas fa-clock"></i>
              <span>Horarios</span>
            </div>
            <div class="poi-hours" id="poi-hours">
              Horarios no disponibles
            </div>
          </div>

          <!-- Servicios -->
          <div class="poi-section" id="poi-services-section" style="display: none;">
            <div class="section-title">
              <i class="fas fa-check-circle"></i>
              <span>Servicios</span>
            </div>
            <div class="poi-services" id="poi-services">
              <!-- Se llena dinámicamente -->
            </div>
          </div>

          <!-- Contacto -->
          <div class="poi-section" id="poi-contact-section" style="display: none;">
            <div class="section-title">
              <i class="fas fa-phone"></i>
              <span>Contacto</span>
            </div>
            <div class="poi-contact" id="poi-contact">
              Contacto no disponible
            </div>
          </div>

          <!-- Descripción -->
          <div class="poi-section" id="poi-description-section" style="display: none;">
            <div class="section-title">
              <i class="fas fa-info-circle"></i>
              <span>Descripción</span>
            </div>
            <div class="poi-description" id="poi-description">
              Descripción no disponible
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="poi-card-actions">
          <button class="btn btn-primary btn-full" id="btn-go-to-poi">
            <i class="fas fa-directions"></i> Ir aquí
          </button>
          <button class="btn btn-secondary btn-full" id="btn-share-poi">
            <i class="fas fa-share-alt"></i> Compartir
          </button>
        </div>
      </div>
    `;

    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
  }

  attachEventListeners() {
    document.getElementById('btn-close-poi-card')?.addEventListener('click', () => this.closeCard());
    document.getElementById('btn-favorite-poi')?.addEventListener('click', () => this.toggleFavorite());
    document.getElementById('btn-go-to-poi')?.addEventListener('click', () => this.goToPOI());
    document.getElementById('btn-share-poi')?.addEventListener('click', () => this.sharePOI());
  }

  /**
   * Abre la tarjeta de detalles de un POI
   */
  openCard(poi) {
    this.currentPOI = poi;
    this.updateCardContent(poi);

    const card = document.getElementById('poi-details-card');
    card?.classList.remove('hidden');

    // Scroll al inicio de la tarjeta
    card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Cierra la tarjeta de detalles
   */
  closeCard() {
    const card = document.getElementById('poi-details-card');
    card?.classList.add('hidden');
    this.currentPOI = null;
  }

  /**
   * Actualiza el contenido de la tarjeta
   */
  updateCardContent(poi) {
    // Nombre
    const nameEl = document.getElementById('poi-name');
    if (nameEl) nameEl.textContent = poi.name || 'Sin nombre';

    // Categoría
    const categoryEl = document.getElementById('poi-category');
    if (categoryEl) {
      const category = this.getCategoryFromProperties(poi.properties);
      categoryEl.textContent = category;
    }

    // Dirección
    const addressEl = document.getElementById('poi-address');
    if (addressEl) {
      const address = this.getAddressFromProperties(poi.properties);
      addressEl.textContent = address || 'Dirección no disponible';
    }

    // Coordenadas
    const coordsEl = document.getElementById('poi-coordinates');
    if (coordsEl && poi.coordinates) {
      coordsEl.textContent = `Coordenadas: ${poi.coordinates[1].toFixed(4)}, ${poi.coordinates[0].toFixed(4)}`;
    }

    // Distancia
    this.updateDistance(poi);

    // Imagen
    this.loadPOIImage(poi);

    // Horarios
    this.updateHours(poi);

    // Servicios
    this.updateServices(poi);

    // Contacto
    this.updateContact(poi);

    // Descripción
    this.updateDescription(poi);

    // Botón de favorito
    this.updateFavoriteButton(poi);
  }

  /**
   * Actualiza la distancia
   */
  updateDistance(poi) {
    if (!userMarker || !poi.coordinates) return;

    const userLatLng = userMarker.getLatLng();
    const distance = this.calculateDistance(
      userLatLng.lat,
      userLatLng.lng,
      poi.coordinates[1],
      poi.coordinates[0]
    );

    const distanceEl = document.getElementById('poi-distance');
    if (distanceEl) {
      if (distance >= 1000) {
        distanceEl.textContent = (distance / 1000).toFixed(1) + ' km';
      } else {
        distanceEl.textContent = Math.round(distance) + ' m';
      }
    }
  }

  /**
   * Carga la imagen del POI
   */
  loadPOIImage(poi) {
    const imageContainer = document.getElementById('poi-image-container');
    if (!imageContainer) return;

    // Buscar imagen en la carpeta de imágenes
    const imageName = poi.name?.replace(/\s+/g, '_');
    const imageUrl = `/images/${imageName}/1.jpg`;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = poi.name;
    img.className = 'poi-image';
    img.onerror = () => {
      // Si no hay imagen, mostrar placeholder
      imageContainer.innerHTML = `
        <div class="poi-image-placeholder">
          <i class="fas fa-image"></i>
        </div>
      `;
    };
    img.onload = () => {
      imageContainer.innerHTML = '';
      imageContainer.appendChild(img);
    };
  }

  /**
   * Actualiza los horarios
   */
  updateHours(poi) {
    const hoursSection = document.getElementById('poi-hours-section');
    const hoursEl = document.getElementById('poi-hours');

    if (!hoursSection || !hoursEl) return;

    const hours = this.getHoursFromProperties(poi.properties);
    if (hours) {
      hoursEl.textContent = hours;
      hoursSection.style.display = 'block';
    } else {
      hoursSection.style.display = 'none';
    }
  }

  /**
   * Actualiza los servicios
   */
  updateServices(poi) {
    const servicesSection = document.getElementById('poi-services-section');
    const servicesEl = document.getElementById('poi-services');

    if (!servicesSection || !servicesEl) return;

    const services = this.getServicesFromProperties(poi.properties);
    if (services.length > 0) {
      servicesEl.innerHTML = services.map(service => `
        <div class="service-item">
          <i class="fas fa-check"></i>
          <span>${service}</span>
        </div>
      `).join('');
      servicesSection.style.display = 'block';
    } else {
      servicesSection.style.display = 'none';
    }
  }

  /**
   * Actualiza el contacto
   */
  updateContact(poi) {
    const contactSection = document.getElementById('poi-contact-section');
    const contactEl = document.getElementById('poi-contact');

    if (!contactSection || !contactEl) return;

    const phone = poi.properties?.phone || poi.properties?.contact_phone;
    const email = poi.properties?.email || poi.properties?.contact_email;

    if (phone || email) {
      let contactHTML = '';
      if (phone) contactHTML += `<div><i class="fas fa-phone"></i> ${phone}</div>`;
      if (email) contactHTML += `<div><i class="fas fa-envelope"></i> ${email}</div>`;
      contactEl.innerHTML = contactHTML;
      contactSection.style.display = 'block';
    } else {
      contactSection.style.display = 'none';
    }
  }

  /**
   * Actualiza la descripción
   */
  updateDescription(poi) {
    const descSection = document.getElementById('poi-description-section');
    const descEl = document.getElementById('poi-description');

    if (!descSection || !descEl) return;

    const description = poi.properties?.description || poi.properties?.note;
    if (description) {
      descEl.textContent = description;
      descSection.style.display = 'block';
    } else {
      descSection.style.display = 'none';
    }
  }

  /**
   * Actualiza el botón de favorito
   */
  updateFavoriteButton(poi) {
    const btn = document.getElementById('btn-favorite-poi');
    if (!btn) return;

    const isFavorite = advancedSearch?.favorites.some(f => f.id === poi.id);
    if (isFavorite) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="far fa-star"></i>';
    }
  }

  /**
   * Alterna favorito
   */
  toggleFavorite() {
    if (!this.currentPOI || !advancedSearch) return;

    const isFavorite = advancedSearch.favorites.some(f => f.id === this.currentPOI.id);

    if (isFavorite) {
      advancedSearch.removeFavorite(this.currentPOI.id);
    } else {
      advancedSearch.addFavorite({
        id: this.currentPOI.id,
        name: this.currentPOI.name,
        coordinates: this.currentPOI.coordinates
      });
    }

    this.updateFavoriteButton(this.currentPOI);
  }

  /**
   * Navega al POI
   */
  goToPOI() {
    if (!this.currentPOI) return;

    selectedEndPOI = {
      name: this.currentPOI.name,
      coordinates: this.currentPOI.coordinates,
      properties: this.currentPOI.properties
    };

    const btnCalculateRoute = document.getElementById('btn-calculate-route');
    if (btnCalculateRoute && selectedStartPOI) {
      btnCalculateRoute.disabled = false;
      btnCalculateRoute.click();
    }

    this.closeCard();
  }

  /**
   * Comparte el POI
   */
  sharePOI() {
    if (!this.currentPOI) return;

    const text = `Mira este lugar en ConoceTec: ${this.currentPOI.name}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: this.currentPOI.name,
        text: text,
        url: url
      }).catch(err => console.log('Error compartiendo:', err));
    } else {
      // Fallback: copiar al portapapeles
      const shareUrl = `${url}?poi=${this.currentPOI.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showStatus('route-status', 'Enlace copiado al portapapeles', 'success');
      });
    }
  }

  /**
   * Obtiene la categoría de las propiedades
   */
  getCategoryFromProperties(properties) {
    const categoryMap = {
      'amenity': 'Servicios',
      'leisure': 'Recreación',
      'building': 'Edificios',
      'shop': 'Tiendas',
      'cafe': 'Cafeterías',
      'restaurant': 'Restaurantes',
      'library': 'Biblioteca',
      'parking': 'Estacionamiento'
    };

    for (const [key, category] of Object.entries(categoryMap)) {
      if (properties[key]) return category;
    }

    return 'Otros';
  }

  /**
   * Obtiene la dirección de las propiedades
   */
  getAddressFromProperties(properties) {
    return properties?.address || properties?.street || 'Dirección no disponible';
  }

  /**
   * Obtiene los horarios de las propiedades
   */
  getHoursFromProperties(properties) {
    return properties?.opening_hours || properties?.hours || null;
  }

  /**
   * Obtiene los servicios de las propiedades
   */
  getServicesFromProperties(properties) {
    const services = [];

    if (properties?.wifi) services.push('WiFi');
    if (properties?.parking) services.push('Estacionamiento');
    if (properties?.wheelchair) services.push('Acceso para discapacitados');
    if (properties?.air_conditioning) services.push('Aire acondicionado');
    if (properties?.outdoor_seating) services.push('Asientos al aire libre');

    return services;
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Instancia global
let poiDetailsCard;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  poiDetailsCard = new POIDetailsCard();
});
