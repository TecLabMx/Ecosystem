// Configuración de categorías y sus iconos
const POI_CATEGORIES = {
  "Aulas": {
    icon: "fa-chalkboard",
    color: "#27ae60",
    description: "Aulas y espacios de clase"
  },
  "Laboratorios": {
    icon: "fa-flask",
    color: "#9b59b6",
    description: "Laboratorios de investigación"
  },
  "Biblioteca": {
    icon: "fa-book",
    color: "#e67e22",
    description: "Biblioteca y recursos"
  },
  "Cafetería": {
    icon: "fa-utensils",
    color: "#e74c3c",
    description: "Cafeterías y comedores"
  },
  "Deportes": {
    icon: "fa-running",
    color: "#2ecc71",
    description: "Instalaciones deportivas"
  },
  "Servicio": {
    icon: "fa-info-circle",
    color: "#f39c12",
    description: "Servicios administrativos"
  },
  "Edificio": {
    icon: "fa-building",
    color: "#3498db",
    description: "Edificios principales"
  }
};

// Rutas predefinidas del campus
const PREDEFINED_ROUTES = [
  {
    name: "Tour Académico",
    description: "Recorrido por los principales edificios académicos",
    stops: [
      "Edificio A",
      "Edificio B",
      "Edificio C",
      "Edificio D",
      "Edificio E"
    ]
  },
  {
    name: "Tour Laboratorios",
    description: "Visita a los laboratorios especializados",
    stops: [
      "Edificio LISC",
      "Edificio LIE-1",
      "Edificio LIE-2",
      "Edificio LIQP"
    ]
  },
  {
    name: "Tour Servicios",
    description: "Ubicación de servicios importantes",
    stops: [
      "Biblioteca",
      "Cafetería",
      "Servicio Médico",
      "Oficinas Administrativas"
    ]
  }
];

// Configuración de velocidad de caminata (m/s)
const WALKING_SPEED = 1.4; // ~5 km/h

// Configuración de almacenamiento local
const STORAGE_KEYS = {
  SAVED_POIS: "conocetec_saved_pois",
  RECENT_SEARCHES: "conocetec_recent_searches",
  USER_PREFERENCES: "conocetec_preferences"
};

