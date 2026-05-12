// ========================================
// INICIALIZACIÓN Y VARIABLES GLOBALES
// ======================================== 

document.addEventListener('DOMContentLoaded', function() {
    console.log('CONOCE-TEC Dashboard Visitante - Sistema Iniciado');

    // Obtener elementos del DOM
    const sidebar = document.getElementById('sidebar');
    const btnMenuToggle = document.getElementById('btnMenuToggle');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const navBottomItems = document.querySelectorAll('.nav-bottom-item');
    const sections = document.querySelectorAll('[id^="section"]');
    
    // Carrusel removido - reemplazado por banner estático e información institucional
    
    // Mapa
    const markers = document.querySelectorAll('.marker');
    const searchInput = document.getElementById('searchInput');
    const btnFilter = document.getElementById('btnFilter');
    
    // Menu de Redes Sociales
    const btnSocialMenu = document.getElementById('btnSocialMenu');
    const socialMenuDropdown = document.getElementById('socialMenuDropdown');

    // Variables de estado
    let currentCarouselIndex = 0;

    // ========================================
    // INICIALIZACIÓN
    // ========================================

    configurarEventos();
    mostrarMensajeBienvenida();

    // ========================================
    // EVENTOS DEL MENÚ LATERAL
    // ========================================

    btnMenuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
    });

    btnCloseSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });

    // Cerrar sidebar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !btnMenuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // ========================================
    // NAVEGACIÓN POR SECCIONES
    // ========================================

    function configurarEventos() {
        // Eventos del menú lateral
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                cambiarSeccion(section);
                
                // Cerrar sidebar en móvil
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });

        // Eventos de la barra inferior
        navBottomItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    cambiarSeccion(section);
                }
            });
        });
        
        // Evento del menu de redes sociales
        if (btnSocialMenu) {
            btnSocialMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                socialMenuDropdown.classList.toggle('active');
            });
        }
        
        // Cerrar menu al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (socialMenuDropdown && !socialMenuDropdown.contains(e.target) && e.target !== btnSocialMenu) {
                socialMenuDropdown.classList.remove('active');
            }
        });
        
        // Tooltips de redes sociales
        const socialLinks = document.querySelectorAll('.social-link');
        const socialTooltip = document.getElementById('socialTooltip');
        
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', function(e) {
                const tooltip = this.getAttribute('data-tooltip');
                if (tooltip && socialTooltip) {
                    socialTooltip.textContent = tooltip;
                    socialTooltip.classList.add('show');
                    
                    // Posicionar el tooltip
                    const rect = this.getBoundingClientRect();
                    socialTooltip.style.left = (rect.left + rect.width / 2 - 50) + 'px';
                    socialTooltip.style.top = (rect.top - 40) + 'px';
                }
            });
            
            link.addEventListener('mouseleave', function() {
                if (socialTooltip) {
                    socialTooltip.classList.remove('show');
                }
            });
        });
    }

    function cambiarSeccion(sectionName) {
        // Mapa de nombres de sección para el título de la pestaña
        const titulos = {
            'inicio':    'Inicio',
            'mapa':      'Mapa del Campus',
            'servicios': 'Servicios'
        };
        document.title = 'CONOCE-TEC – ' + (titulos[sectionName] || sectionName.charAt(0).toUpperCase() + sectionName.slice(1));

        // Actualizar nav items activos (sidebar)
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        // Actualizar nav items activos (bottom)
        navBottomItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        // Mostrar/ocultar secciones
        sections.forEach(section => {
            section.classList.remove('active');
        });

        let sectionId = 'section' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        if (sectionName === 'inicio') {
            sectionId = 'sectionInicio';
        } else if (sectionName === 'mapa') {
            sectionId = 'sectionMapa';
        }
        
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.add('active');
            
            // Si es la sección del mapa, recargar el iframe para asegurar que se carga correctamente
            if (sectionName === 'mapa') {
                setTimeout(function() {
                    const mapIframe = sectionElement.querySelector('iframe');
                    if (mapIframe) {
                        // Forzar recarga del iframe
                        const src = mapIframe.src;
                        mapIframe.src = '';
                        setTimeout(function() {
                            mapIframe.src = src;
                        }, 100);
                    }
                }, 100);
            }
        }

        console.log('Sección cambiada a:', sectionName);
    }

    // Lógica del carrusel removida - reemplazada por banner estático e información institucional
    
    // ========================================
    // INTERACCIÓN CON MARCADORES DEL MAPA
    // ========================================

    markers.forEach(marker => {
        marker.addEventListener('click', function() {
            const building = this.getAttribute('data-building');
            console.log('Marcador clickeado:', building);
        });

        // Efecto hover
        marker.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });

        marker.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });

    // ========================================
    // BÚSQUEDA EN EL CAMPUS
    // ========================================

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            // Mostrar todos los marcadores
            markers.forEach(marker => {
                marker.style.opacity = '1';
                marker.style.pointerEvents = 'auto';
            });
            return;
        }

        // Filtrar marcadores
        markers.forEach(marker => {
            const label = marker.querySelector('.marker-label').textContent.toLowerCase();
            const building = marker.getAttribute('data-building').toLowerCase();
            
            if (label.includes(searchTerm) || building.includes(searchTerm)) {
                marker.style.opacity = '1';
                marker.style.pointerEvents = 'auto';
            } else {
                marker.style.opacity = '0.3';
                marker.style.pointerEvents = 'none';
            }
        });

        console.log('Búsqueda:', searchTerm);
    });

    btnFilter.addEventListener('click', function() {
        console.log('Filtro clickeado');
        // Aquí se pueden agregar opciones de filtro
    });

    // ========================================
    // EVENTOS DE SERVICIOS
    // ========================================

    const servicioLinks = document.querySelectorAll('.servicio-link');
    servicioLinks.forEach(link => {
        // Los links con handler propio se excluyen del handler genérico
        if (link.id === 'btnInfoGeneralVisitante' || link.id === 'btnBibliotecaVisitante' || link.id === 'btnCafeteriaVisitante') return;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceName = this.closest('.servicio-card').querySelector('h3').textContent;
            console.log('Servicio clickeado:', serviceName);
            mostrarNotificacion('Servicio: ' + serviceName);
        });
    });

    // ========================================
    // FUNCIONES DE UTILIDAD
    // ========================================

    function mostrarMensajeBienvenida() {
        // Cargar nombre del visitante desde sessionStorage
        const nombreVisitante = sessionStorage.getItem('nombreVisitante');
        if (nombreVisitante) {
            const visitorNameEl = document.getElementById('visitorName');
            if (visitorNameEl) visitorNameEl.textContent = nombreVisitante;
        }

        console.log('=== BIENVENIDA VISITANTE ===');
        console.log('Acceso limitado a: Mapa y Servicios');
        console.log('Horario de atención: Lunes - Viernes, 8:00 AM - 6:00 PM');
        console.log('Teléfono: 21181916');
        console.log('============================');
    }

    function mostrarNotificacion(mensaje) {
        console.log('Notificación:', mensaje);
        // Aquí se puede agregar una notificación visual
    }

    // ========================================
    // RESPONSIVE
    // ========================================

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });

    // ========================================
    // FUNCIONES DE DEPURACIÓN
    // ========================================

    window.verDashboardVisitante = function() {
        console.log('=== DATOS DEL DASHBOARD VISITANTE ===');
        console.log('Tipo de usuario: Visitante');
        console.log('Acceso limitado: Sí');
        console.log('Secciones disponibles: Mapa, Servicios');
        console.log('Sección actual:', document.querySelector('section.active').id);
        console.log('Item del carrusel:', currentCarouselIndex);
        console.log('=====================================');
    };

    window.irASeccion = function(section) {
        cambiarSeccion(section);
    };

    window.irACarrusel = function(index) {
        irAlItem(index);
    };

    console.log('Escribe verDashboardVisitante() para ver información del dashboard');
    console.log('Escribe irASeccion("nombreSeccion") para cambiar de sección');
    console.log('Escribe irACarrusel(index) para ir a un item del carrusel');
});

// ========================================
// FUNCIONES GLOBALES
// ========================================

// Simular clic en navegación
function navigateTo(section) {
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) {
        navItem.click();
    }
}

// Obtener información de servicios
function getServices() {
    return [
        {
            id: 'info-general',
            name: 'Información General',
            description: 'Obtén información sobre programas académicos, admisiones y más.'
        },
        {
            id: 'biblioteca',
            name: 'Biblioteca',
            description: 'Acceso a más de 5000 libros y recursos digitales.'
        },
        {
            id: 'cafeteria',
            name: 'Cafetería',
            description: 'Disfruta de comidas y bebidas de calidad en nuestras instalaciones.'
        },
        {
            id: 'deportes',
            name: 'Deportes',
            description: 'Instalaciones deportivas modernas para estudiantes y visitantes.'
        },
        {
            id: 'estacionamiento',
            name: 'Estacionamiento',
            description: 'Estacionamiento seguro con vigilancia 24/7 disponible.'
        },
        {
            id: 'contacto',
            name: 'Contacto',
            description: 'Ponte en contacto con nuestro equipo de atención al visitante.'
        }
    ];
}

// Obtener información del edificio
function getBuildings() {
    return [
        {
            id: 'edificio-a',
            name: 'Edificio Académico A',
            description: 'Aulas y laboratorios',
            aulas: 12,
            labs: 3
        },
        {
            id: 'biblioteca',
            name: 'Biblioteca',
            description: 'Centro de recursos',
            libros: '5000+',
            pcs: 50
        },
        {
            id: 'cafeteria',
            name: 'Cafetería',
            description: 'Comidas y bebidas',
            horario: '7:00 AM - 8:00 PM',
            asientos: 200
        },
        {
            id: 'deportes',
            name: 'Deportes',
            description: 'Áreas deportivas',
            campos: 2,
            gimnasio: true
        },
        {
            id: 'servicios-admin',
            name: 'Servicios Administrativos',
            description: 'Trámites y gestión',
            empleados: 15,
            horario: '8:00 AM - 6:00 PM'
        },
        {
            id: 'estacionamiento',
            name: 'Estacionamiento',
            description: 'Área de parqueo',
            espacios: 300,
            vigilancia: '24/7'
        }
    ];
}

// Buscar edificio
function searchBuilding(term) {
    const buildings = getBuildings();
    return buildings.filter(b => 
        b.name.toLowerCase().includes(term.toLowerCase()) ||
        b.description.toLowerCase().includes(term.toLowerCase())
    );
}

// Buscar servicio
function searchService(term) {
    const services = getServices();
    return services.filter(s => 
        s.name.toLowerCase().includes(term.toLowerCase()) ||
        s.description.toLowerCase().includes(term.toLowerCase())
    );
}

// ========================================
// TRÁMITES ESCOLARES (VISITANTE)
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Búsqueda en el modal de Trámites Visitante
    const trSearchV = document.querySelector('#tramitesModalOverlayV .tr-search-v');
    if (trSearchV) {
        trSearchV.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('#trDeptGridV .tr-filtrable-v').forEach(function (card) {
                const name = card.querySelector('.tr-dept-name').textContent.toLowerCase();
                card.style.display = (term === '' || name.includes(term)) ? '' : 'none';
            });
        });
    }
});

function abrirModalTramitesVisitante() {
    const overlay = document.getElementById('tramitesModalOverlayV');
    if (overlay) overlay.classList.add('active');
}

function cerrarModalTramitesV(event) {
    const overlay = document.getElementById('tramitesModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function abrirModalGestionTecV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('gestionTecModalOverlayV');
    if (overlay) overlay.classList.add('active');
}

function cerrarModalGestionTecV(event) {
    const overlay = document.getElementById('gestionTecModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function abrirModalDivisionEstudiosV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('divisionEstudiosModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalDivisionEstudiosV(event) {
    const overlay = document.getElementById('divisionEstudiosModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function abrirModalSubdireccionAcademicaV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('subdireccionAcademicaModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalSubdireccionAcademicaV(event) {
    const overlay = document.getElementById('subdireccionAcademicaModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function abrirModalCentroComputoV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('centroComputoModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalCentroComputoV(event) {
    const overlay = document.getElementById('centroComputoModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function abrirModalRecursosHumanosV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('recursosHumanosModalOverlayV');
    if (overlay) overlay.classList.add('active');
    seleccionarTabRHV('seguroVidaV', document.querySelector('#recursosHumanosModalOverlayV .rh-tab-btn'));
}
function cerrarModalRecursosHumanosV(event) {
    const overlay = document.getElementById('recursosHumanosModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}
function seleccionarTabRHV(tabId, btn) {
    document.querySelectorAll('#recursosHumanosModalOverlayV .rh-panel-content').forEach(function(p) {
        p.style.display = 'none';
    });
    document.querySelectorAll('#recursosHumanosModalOverlayV .rh-tab-btn').forEach(function(b) {
        b.classList.remove('rh-tab-active');
    });
    const panel = document.getElementById('rhPanel-' + tabId);
    if (panel) panel.style.display = '';
    if (btn) btn.classList.add('rh-tab-active');
}

function abrirModalServiciosEscolaresV() {
    cerrarModalTramitesV();
    const overlay = document.getElementById('serviciosEscolaresModalOverlayV');
    if (overlay) overlay.classList.add('active');
    seleccionarTabSEV('directorio', document.querySelector('#serviciosEscolaresModalOverlayV .rh-tab-btn'));
}
function cerrarModalServiciosEscolaresV(event) {
    const overlay = document.getElementById('serviciosEscolaresModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}
function seleccionarTabSEV(tabId, btn) {
    document.querySelectorAll('#serviciosEscolaresModalOverlayV .rh-panel-content').forEach(function(p) {
        p.style.display = 'none';
    });
    document.querySelectorAll('#serviciosEscolaresModalOverlayV .rh-tab-btn').forEach(function(b) {
        b.classList.remove('rh-tab-active');
    });
    const panel = document.getElementById('sePanelV-' + tabId);
    if (panel) panel.style.display = '';
    if (btn) btn.classList.add('rh-tab-active');
}

function abrirModalDirectorioSEV() {
    cerrarModalServiciosEscolaresV();
    const overlay = document.getElementById('directorioSEModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalDirectorioSEV(event) {
    const overlay = document.getElementById('directorioSEModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function cargarImagenOrganigramaV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.getElementById('organigramaImgV');
        const placeholder = document.getElementById('organigramaImgPlaceholderV');
        const preview = document.getElementById('organigramaImgPreviewV');
        if (img) img.src = e.target.result;
        if (placeholder) placeholder.style.display = 'none';
        if (preview) preview.style.display = '';
        try { localStorage.setItem('centrocomputo_organigrama_img_v', e.target.result); } catch(ex) {}
    };
    reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        const saved = localStorage.getItem('centrocomputo_organigrama_img_v');
        if (saved) {
            const img = document.getElementById('organigramaImgV');
            const placeholder = document.getElementById('organigramaImgPlaceholderV');
            const preview = document.getElementById('organigramaImgPreviewV');
            if (img) img.src = saved;
            if (placeholder) placeholder.style.display = 'none';
            if (preview) preview.style.display = '';
        }
    } catch(ex) {}
});

function toggleTrSectionV(sectionId, btn) {
    const content = document.getElementById(sectionId);
    if (!content) return;
    const isCollapsed = content.classList.contains('tr-section-collapsed');
    const arrow = btn.querySelector('.tr-section-arrow');
    if (isCollapsed) {
        content.classList.remove('tr-section-collapsed');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('tr-section-collapsed');
        if (arrow) arrow.style.transform = 'rotate(-90deg)';
    }
}

function manejarArchivoTrV(event, docId) {
    const file = event.target.files[0];
    if (!file) return;
    const status = document.getElementById('status-' + docId);
    const dlBtn  = document.getElementById('dl-' + docId);
    if (status) {
        status.textContent = '✓ ' + (file.name.length > 12 ? file.name.substring(0, 12) + '…' : file.name);
        status.title = file.name;
    }
    if (dlBtn) {
        const url = URL.createObjectURL(file);
        dlBtn.href = url;
        dlBtn.download = file.name;
        dlBtn.classList.remove('tr-download-hidden');
    }
}

// ========================================
// OFERTA EDUCATIVA (VISITANTE)
// ========================================

const CARRERAS_DATA_V = {
    'ige': {
        nombre: 'Ingeniería en Gestión Empresarial',
        clave: 'IGEM – 2009 – 201',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '360',
        coord: 'Luisa Vera Ramos',
        correo: 'dep_ige@minatitlan.tecnm.mx',
        icono: 'fas fa-chart-line',
        desc: ['Formación de líderes en generación estrategias de negocios y optimización de recursos empresariales.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería en Gestión Empresarial',
            intro: 'El aspirante por cursar la Ingeniería en Gestión Empresarial en Tecnológico Nacional de México Campus Minatitlán posea los conocimientos, habilidades, actitudes, valores y competencias necesarios para generar una base sólida que fomente su desarrollo a lo largo de su vida académica que ayude a formar profesionales de calidad, capaces de desarrollarse exitosamente en el ámbito laboral y personal.',
            requisitos: [
                'Haber concluido el nivel de Educación Media.',
                'Disponer del tiempo para cumplir con las actividades del plan de estudios.',
                'Presentar el examen de admisión establecido por el Instituto.'
            ],
            competencias: [
                'Habilidades matemáticas (álgebra, trigonometría y estadística).',
                'Habilidades básicas del manejo de la computación.',
                'Habilidades de gestión de información.',
                'Capacidad de abstracción, análisis y síntesis.',
                'Comprensión lectora.',
                'Comunicación escrita.',
                'Capacidad de relacionarse con otras personas.',
                'Habilidad para trabajar en forma autónoma.'
            ]
        },
        objetivos: {
            clave: 'IGEM-2009-201',
            general: 'Formar profesionales que contribuyan a la gestión de empresas e innovación de procesos; así como al diseño, implementación y desarrollo de sistemas estratégicos de negocios, optimizando recursos en un entorno global, con ética y responsabilidad social.',
            especificos: [
                'Es un egresado con un carácter incluyente, dinámico, proactivo, comprometido con el cuidado del medio ambiente y la responsabilidad social con una visión global en el ámbito empresarial que coadyuve al desarrollo de la economía.',
                'Es un egresado con las habilidades para análisis situacional, toma de decisiones estratégicas y solución de problemas que conlleven a una gestión efectiva de los recursos de la empresa.',
                'El egresado desarrolla la creatividad que le lleva a generar ideas innovadoras para la creación de negocios.',
                'El egresado genera emprendimientos innovadores en las empresas que promuevan entornos de trabajo decentes, igualitarios, seguros y sin riesgos para todos los trabajadores.'
            ]
        },
        mision: {
            mision: 'Formar integralmente profesionales en ingeniería en gestión empresarial basados en el modelo educativo para el siglo XXI, que contribuyan a la gestión estratégica e innovación de negocios considerando los aspectos éticos y sostenibles en un entorno competitivo y global.',
            vision: 'Ser un programa académico con reconocimiento nacional e internacional en el desempeño e investigación aplicada de la gestión empresarial.',
            politicas: [
                'Promover el desarrollo integral y armónico del estudiante en gestión empresarial para que responda a los retos y necesidades de los negocios.',
                'Implementar y orientar los procesos estratégicos y actividades del programa educativo hacia el reconocimiento nacional e internacional.',
                'Mantener una relación estrecha y permanente con la comunidad en actividades científicas, tecnológicas, culturales y humanísticas.',
                'Fomentar la investigación, la ciencia y la tecnología en el campo de la gestión empresarial.',
                'Vigilar en el proceso educativo el cumplimiento de las leyes, reglamentos y procedimientos que rigen la operación del programa.',
                'Orientar las actividades del programa educativo hacia la equidad de género y no discriminación, la responsabilidad social, respeto al medio ambiente e impacto económico.'
            ]
        },
        salidaLateral: true,
        perfilEgreso: [
            'Aplica habilidades directivas y de ingeniería en el diseño, gestión, fortalecimiento e innovación de las organizaciones para la toma de decisiones en forma efectiva, con una orientación sistémica y sustentable.',
            'Diseña e innova estructuras administrativas y procesos, con base en las necesidades de las organizaciones para competir eficientemente en mercados globales.',
            'Gestiona eficientemente los recursos de la organización con visión compartida, con el fin de suministrar bienes y servicios de calidad.',
            'Aplica métodos cuantitativos y cualitativos en el análisis e interpretación de datos y modelado de sistemas en los procesos organizacionales, para la mejora continua atendiendo estándares de calidad mundial.',
            'Diseña, y emprende nuevos negocios y proyectos empresariales sustentables en mercados competitivos, para promover el desarrollo.',
            'Diseña e implementa estrategias de mercadotecnia basadas en información recopilada de fuentes primarias y secundarias, para incrementar la competitividad de las organizaciones.',
            'Implementa planes y programas de seguridad e higiene para el fortalecimiento del entorno laboral.',
            'Gestiona sistemas integrales de calidad para la mejora de los procesos, ejerciendo un liderazgo estratégico y un compromiso ético.',
            'Aplica las normas legales para la creación y desarrollo de las organizaciones.',
            'Dirige equipos de trabajo para la mejora continua y el crecimiento integral de las organizaciones.',
            'Interpreta la información financiera para detectar oportunidades de mejora e inversión en un mundo global, que propicien la rentabilidad del negocio.',
            'Utiliza las nuevas tecnologías de información y comunicación en la organización, para optimizar los procesos y la eficaz toma de decisiones.',
            'Promueve el desarrollo del capital humano, para la realización de los objetivos organizacionales, dentro de un marco ético y un contexto multicultural.',
            'Aplica métodos de investigación para desarrollar e innovar modelos, sistemas, procesos y productos en las diferentes dimensiones de la organización.',
            'Gestiona la cadena de suministro de las organizaciones con un enfoque orientado a procesos para incrementar la productividad.',
            'Analiza las variables económicas para facilitar la toma estratégica de decisiones en la organización.',
            'Actúa como agente de cambio para facilitar la mejora continua y el desempeño de las organizaciones.',
            'Aplica métodos, técnicas y herramientas para la solución de problemas en la gestión empresarial con una visión estratégica.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes']
    },
    'iem': {
        nombre: 'Ingeniería Electromecánica',
        clave: 'IEME – 2010 – 210',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Isaac Mario García Olivares',
        correo: 'dep_iem@minatitlan.tecnm.mx',
        icono: 'fas fa-cogs',
        desc: ['Formar profesionistas de excelencia en Ingeniería Electromecánica, con actitud emprendedora, liderazgo y capacidad de analizar, diagnosticar, diseñar, seleccionar, instalar, administrar, mantener e innovar sistemas electromecánicos.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería Electromecánica',
            intro: 'Los aspirantes deberán ser egresados del sistema de Educación Media Superior y tendrán que contar preferentemente con un conjunto de conocimientos, habilidades, actitudes y valores definidos.',
            requisitos: [
                'Interés por descubrir nuevos conocimientos y resolver problemas.',
                'Aptitud de razonamiento lógico en la resolución de problemas de observación crítica y de análisis creativo.',
                'Personalidad innovadora, emprendedora y propositiva.',
                'Conocimientos teóricos y prácticos de las ciencias físico-matemáticas.',
                'Habilidades en aplicar el razonamiento lógico: de análisis, síntesis y aplicación del conocimiento.',
                'Disposición para el auto aprendizaje que propicie su desarrollo intelectual, afectivo y social.',
                'Actitud de responsabilidad, respeto a las personas, al medio ambiente y a las ideas, puntualidad, valores de tolerancia y puntualidad.'
            ],
            competencias: ['----']
        },
        objetivos: {
            clave: 'IEME-2010-210',
            general: 'Formar profesionistas de excelencia en Ingeniería Electromecánica, con actitud emprendedora, liderazgo y capacidad de: analizar, diagnosticar, diseñar, seleccionar, instalar, administrar, mantener e innovar sistemas electromecánicos, en forma eficiente, segura y económica, considerando las normas y estándares nacionales e internacionales de forma sustentable con plena conciencia ética, humanística y social.',
            especificos: [
                'Aplica conocimientos especializados afines al campo de la investigación y de la ingeniería en el sector productivo y de servicios.',
                'Aplica y supervisa Proyectos orientados a la utilización de fuentes renovables y uso eficiente de la energía en los sectores productivos, de servicios y en su entorno social.',
                'Desempeña actividades en la docencia y en la administración dentro de los niveles educativos superior y medio-superior.',
                'Ejecuta y supervisa trabajos de operación, mantenimiento y rediseño en el área de electromecánica en el sector productivo y de servicios con un enfoque sustentable.',
                'Utiliza equipos especializados para la mejora de los sistemas electromecánicos en el sector productivo y de servicios.',
                'Desarrolla y participa en Proyectos de Mantenimiento y actualización en sistemas electromecánicos del sector productivo y de servicios.'
            ]
        },
        mision: {
            mision: 'Ofrecer un servicio educativo de excelencia en el área de ingeniería electromecánica con calidad, eficiencia y pertinencia, para formar profesionales de excelencia que satisfagan las necesidades del entorno social e industrial de la región.',
            vision: 'Ser uno de los mejores Departamentos de Metal Mecánica del Sistema Tecnológico a nivel nacional en cuanto a los indicadores de calidad académica, administrativa y servicios que de respuesta a las necesidades del entorno social.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Formula, gestiona y evalúa proyectos de ingeniería relacionados con sistemas y dispositivos en el área electromecánica, proponiendo soluciones con tecnologías de vanguardia, en el marco del desarrollo sustentable.',
            'Diseña e implementa sistemas y dispositivos electromecánicos, utilizando estrategias para el uso eficiente de la energía en los sectores productivo y de servicios apegado a normas y acuerdos nacionales e internacionales vigentes.',
            'Diseña e implementa estrategias y programas para el control y/o automatización de los procesos productivos y los dispositivos en los sistemas electromecánicos.',
            'Proyectar, gestionar, implementar y controlar actividades de instalación y operación de los sistemas electromecánicos para hacer eficientes los procesos productivos.',
            'Formula administra y supervisa programas de mantenimiento para la continuidad y optimización de procesos productivos.',
            'Genera y participa en proyectos de investigación para el desarrollo científico y tecnológico contribuyendo al bienestar social.',
            'Ejerce actitudes de liderazgo y de trabajo en equipo, para la toma de decisiones a partir de un sentido ético y profesional.',
            'Asume una actitud emprendedora en la creación e incubación de empresas, para el desarrollo económico.',
            'Aplica herramientas computacionales de acuerdo a las tecnologías de vanguardia, para el diseño, simulación y operación de sistemas electromecánicos.',
            'Utiliza el lenguaje oral y escrito con claridad y fluidez para interactuar en distintos contextos sociales.',
            'Comprende un segundo idioma para comunicar ideas e interpretar documentos de distinta índole.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        atributosEgreso: [
            'Desarrolla proyectos de ingeniería relacionados con la selección, el diseño, la evaluación y el mantenimiento de equipos termo técnicos y de termo fluidos, utilizando estrategias para el uso eficiente de la energía.',
            'Formula proyectos de ingeniería relacionados con la selección, el diseño y mantenimiento en instalaciones, control y automatización de sistemas electromecánicos, promoviendo una cultura de ahorro y uso eficiente de la energía.',
            'Gestiona proyectos de ingeniería relacionados con el diseño, la selección, evaluación y mantenimiento de elementos mecánicos y equipos electromecánicos con apego en las normas vigentes.',
            'Formula proyectos de ingeniería relacionados con el mantenimiento a sistemas: estáticos, dinámicos y eléctricos de manera sustentable.',
            'Desarrolla actitudes de liderazgo y trabajo en equipo a partir de un sentido ético y profesional, con un amplio carácter emprendedor y creativo.'
        ]
    },
    'isc': {
        nombre: 'Ingeniería en Sistemas Computacionales',
        clave: 'ISIC – 2010 – 224',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Víctor Ignacio Velasco Huerta',
        correo: 'dep_isc@minatitlan.tecnm.mx',
        icono: 'fas fa-laptop-code',
        desc: ['Formar profesionistas líderes con visión estratégica y amplio sentido ético; capaz de diseñar, desarrollar, implementar y administrar tecnología computacional para aportar soluciones innovadoras en beneficio de la sociedad.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería en Sistemas Computacionales',
            intro: 'El aspirante debe contar con capacidades analíticas y lógicas para el desarrollo de software y sistemas computacionales.',
            requisitos: [
                'Haber concluido el nivel de Educación Media.',
                'Disponer del tiempo para cumplir con las actividades del plan de estudios.',
                'Presentar el examen de admisión establecido por el Instituto.'
            ],
            competencias: [
                'Habilidades matemáticas y lógicas.',
                'Interés por la tecnología y la programación.',
                'Capacidad de abstracción y análisis.',
                'Habilidad para trabajar en forma autónoma y en equipo.',
                'Comprensión lectora en español e inglés básico.'
            ]
        },
        objetivos: {
            clave: 'ISIC-2010-224',
            general: 'Formar profesionistas líderes con visión estratégica y amplio sentido ético; capaz de diseñar, desarrollar, implementar y administrar tecnología computacional para aportar soluciones innovadoras en beneficio de la sociedad; en un contexto global, multidisciplinario y sostenible.',
            especificos: [
                'El egresado desarrolla e implementa aplicaciones computacionales integrando tecnologías actuales y emergentes para el sector productivo y de servicios, con estándares y normas nacionales e internacionales.',
                'El egresado soluciona problemas de contexto con base en competencias profesionales en el campo de los modelos computacionales y herramientas tecnológicas de vanguardia, con sentido ético y en un marco de sustentabilidad.',
                'El egresado analiza, diseña e implementa interfaces de procesamiento de datos para optimizar procesos y recursos en los diferentes sectores productivos.',
                'El egresado diseña, optimiza e implementa escenarios de conectividad de datos que requiere el sector productivo, social y de servicios.',
                'El egresado crea y administra proyectos, ejerciendo liderazgo efectivo en los diferentes sectores productivos, sociales y de servicios en los ámbitos nacionales e internacionales.'
            ]
        },
        mision: {
            mision: 'Formar de manera integral ingenieros con competencias profesionales en sistemas de computación, competitivos en las tecnologías de la información y comunicación en tendencia y emergentes, bajo un contexto global, multidisciplinario y sostenible.',
            vision: 'Ser un programa de estudios acreditado con egresados que brinden soluciones de alta calidad en ámbitos de desarrollo e innovación en tecnologías de información y comunicación, contribuyendo al fortalecimiento de nuestra área de influencia nacional e internacional.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Implementa aplicaciones computacionales para solucionar problemas de diversos contextos, integrando diferentes tecnologías, plataformas o dispositivos.',
            'Diseña, desarrolla y aplica modelos computacionales para solucionar problemas, mediante la selección y uso de herramientas matemáticas.',
            'Diseña e implementa interfaces para la automatización de sistemas de hardware y desarrollo del software asociado.',
            'Coordina y participa en equipos multidisciplinarios para la aplicación de soluciones innovadoras en diferentes contextos.',
            'Diseña, implementa y administra bases de datos optimizando los recursos disponibles, conforme a las normas vigentes de manejo y seguridad de la información.',
            'Desarrolla y administra software para apoyar la productividad y competitividad de las organizaciones cumpliendo con estándares de calidad.',
            'Evalúa tecnologías de hardware para soportar aplicaciones de manera efectiva.',
            'Detecta áreas de oportunidad empleando una visión empresarial para crear proyectos aplicando las Tecnologías de la Información y Comunicación.',
            'Diseña, configura y administra redes de computadoras para crear soluciones de conectividad en la organización, aplicando las normas y estándares vigentes.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        especialidad: {
            nombre: 'CIENCIA DE DATOS',
            descripcion: 'Ciencia transdisciplinaria que involucra métodos científicos, procesos y sistemas para obtener un mejor entendimiento de grandes cantidades de datos, con el fin de identificar patrones en fenómenos reales para que de esta manera se tomen decisiones asertivas.',
            materias: ['Ciencia de Datos', 'Big Data y NoSQL', 'Aprendizaje Automático', 'Metodologías Ágiles', 'Ciberseguridad']
        }
    },
    'iel': {
        nombre: 'Ingeniería Electrónica',
        clave: 'IELC – 2010 – 211',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Eliseo Hernández del Rivero',
        correo: 'dep_ie@minatitlan.tecnm.mx',
        icono: 'fas fa-microchip',
        desc: ['Formar profesionistas competentes para diseñar, modelar, implementar, operar, integrar, mantener, instalar y administrar sistemas electrónicos, con capacidad de innovar y transferir tecnología en proyectos multidisciplinarios.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería Electrónica',
            intro: '----',
            requisitos: ['----'],
            competencias: ['----']
        },
        objetivos: {
            clave: 'IELC-2010-211',
            general: 'Formar profesionistas competentes para diseñar, modelar, implementar, operar, integrar, mantener, instalar y administrar sistemas electrónicos; así como innovar y transferir tecnología electrónica existente y emergente en proyectos interdisciplinarios y multidisciplinarios, a nivel nacional e internacional.',
            especificos: [
                'El egresado desarrolla investigación aplicada, realiza un posgrado e innova con el uso de las nuevas tecnologías para la solución de problemas propios de su perfil profesional.',
                'El egresado, desempeña cargos gerenciales y mando medios en los diferentes sectores productivos y de servicios en los ámbitos nacionales e internacionales.',
                'El egresado diseña, desarrolla, implementa e integra sistemas electrónicos de medición y control de procesos, que satisfagan las necesidades de los diferentes sectores industriales y de servicios.',
                'El egresado administra y gestiona de manera multidisciplinaria en una organización las actividades de instalación, actualización, operación y mantenimiento de equipos y sistemas electrónicos.'
            ]
        },
        mision: {
            mision: '----',
            vision: '----'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Analizar, modelar y resolver problemas complejos de Ingeniería Electrónica, aplicando los principios de las Ciencias Básicas e ingeniería que resulten en proyectos que cumplen necesidades específicas de los diferentes sectores.',
            'Analizar, seleccionar y operar equipos de calibración, pruebas para diagnóstico y parámetros en sistema de control automático que permitan aplicar la automatización en la optimización de procesos.',
            'Obtiene y simula modelos de experimentación para predecir el comportamiento de sistemas electrónicos empleando las Tecnologías de la Información y la Comunicación, así como programación de alto nivel.',
            'Se comunica en forma oral y escrita de manera efectiva en español y en un idioma extranjero utilizando la terminología del área.',
            'Participa en grupos de trabajo liderando o siendo parte de éstos, en el diseño o desarrollo de proyectos de sistemas electrónicos y de automatización.',
            'Ser creativo, emprendedor y comprometido con su actualización profesional continua y autónoma, para estar a la vanguardia en los cambios científicos y tecnológicos.',
            'Dirige planifica y participa en equipos de trabajo interdisciplinario desarrollando proyectos integradores afines a su perfil en contexto nacional e internacional.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        atributosEgreso: [
            'Analizar, modelar y resolver problemas complejos de Ingeniería Electrónica, aplicando los principios de las Ciencias Básicas e ingeniería.',
            'Analizar, seleccionar y operar equipos de calibración, pruebas para diagnóstico y parámetros en sistema de control automático.',
            'Obtiene y simula modelos de experimentación para predecir el comportamiento de sistemas electrónicos empleando las TIC y programación de alto nivel.',
            'Se comunica en forma oral y escrita de manera efectiva en español y en un idioma extranjero.',
            'Participa en grupos de trabajo en el diseño o desarrollo de proyectos de sistemas electrónicos y de automatización.',
            'Ser creativo, emprendedor y comprometido con su actualización profesional continua y autónoma.',
            'Dirige y participa en equipos de trabajo interdisciplinario desarrollando proyectos integradores en contexto nacional e internacional.'
        ]
    },
    'iam': {
        nombre: 'Ingeniería Ambiental',
        clave: 'IAMB – 2010 – 206',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Yazmín Natalie Corona Martínez',
        correo: 'dep_ia@minatitlan.tecnm.mx',
        icono: 'fas fa-leaf',
        desc: ['Formación de ingenieros comprometidos con la gestión, protección y restauración del medio ambiente, aplicando normatividad y tecnologías para el desarrollo sustentable.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería Ambiental',
            intro: 'El aspirante a cursar la carrera de Ingeniería Ambiental debe contar con los siguientes atributos de ingreso:',
            requisitos: [
                'Conocimientos básicos de física y química.',
                'Habilidades matemáticas en el área de álgebra, cálculo diferencial e integral.',
                'Habilidades en la lectura, comprensión, resumen y redacción de textos.',
                'Dominio en el uso de calculadoras científicas y de programas básicos de edición de textos y de hojas de cálculo.',
                'Conocimientos básicos de inglés.',
                'Uso básico de las TIC\'s.'
            ],
            competencias: ['----']
        },
        objetivos: {
            clave: 'IAMB-2010-206',
            general: 'Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global.',
            especificos: [
                'Diseña y desarrolla proyectos de investigación como parte de un programa de posgrado o como miembro de una empresa, seleccionando las mejores opciones técnicas, económicas y ambientales.',
                'Dirige proyectos vinculados al área ambiental en los sectores público, productivo y de servicios con una actitud de liderazgo, profesionalismo y compromiso ético.',
                'Desempeña actividades en el campo de su competencia profesional como directivo en ayuntamientos municipales, en el gobierno estatal y federal, o en el sector privado.',
                'Crea y dirige empresas brindando servicios técnicos especializados en el área ambiental.',
                'Gestiona proyectos de desarrollo social atendiendo el área ambiental, considerando la legislación nacional y/o internacional aplicable.'
            ]
        },
        mision: {
            mision: 'Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global, con competencias inherentes al desarrollo de procesos en las diferentes áreas de la Ingeniería Química e Ingeniería Ambiental vinculados con los sectores productivo, social y de servicios.',
            vision: 'Ser profesionistas en Ingeniería Química e Ingeniería Ambiental competentes para investigar, generar y aplicar el conocimiento científico y tecnológico, que le permita identificar y resolver problemas de diseño, operación, adaptación, optimización y administración en industrias químicas y de servicios.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Evalúa la calidad de aguas naturales y residuales para garantizar la sustentabilidad del recurso, de acuerdo con criterios de calidad y normatividad mexicana.',
            'Implementa y evalúa acciones dirigidas a la remediación de suelos contaminados mediante su caracterización, seleccionando tecnologías factibles desde el punto de vista técnico, económico y normativo.',
            'Participa en la implementación de sistemas de gestión integral de Residuos Sólidos Urbanos (RSU) organizados por la administración pública.',
            'Evalúa e implementa planes de manejo de RSU, de manejo especial y peligrosos establecidos en una organización, acorde a la normatividad mexicana.',
            'Aplica metodologías ISO 14001 para el desarrollo de Sistemas de Gestión Ambiental, con fines de certificación y/o recertificación.',
            'Aplica sus conocimientos en la resolución de problemáticas ambientales utilizando herramientas tecnológicas como simuladores, sistemas de información geográfica y software especializado.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        atributosEgreso: [
            'Evalúa la calidad de aguas naturales y residuales para garantizar la sustentabilidad del recurso, aplicando criterios de ingeniería en el tratamiento de aguas.',
            'Implementa y evalúa acciones dirigidas a la remediación de suelos contaminados mediante su caracterización.',
            'Participa en la implementación de sistemas de gestión integral de Residuos Sólidos Urbanos (RSU).',
            'Evalúa e implementa planes de manejo de RSU, de manejo especial y peligrosos acorde a la normatividad mexicana.',
            'Aplica metodologías ISO 14001 para el desarrollo de Sistemas de Gestión Ambiental, con fines de certificación y/o recertificación.',
            'Aplica sus conocimientos en la resolución de problemáticas ambientales utilizando herramientas tecnológicas como simuladores y sistemas de información geográfica.'
        ]
    },
    'iid': {
        nombre: 'Ingeniería Industrial',
        clave: 'IIND – 2010 – 227',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Alejandro Bielma López',
        correo: 'dep_ii@minatitlan.tecnm.mx',
        icono: 'fas fa-industry',
        desc: ['Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería Industrial',
            intro: 'El aspirante debe poseer aptitudes analíticas, capacidad organizativa e interés por la mejora continua de procesos industriales.',
            requisitos: [
                'Haber concluido el nivel de Educación Media.',
                'Disponer del tiempo para cumplir con las actividades del plan de estudios.',
                'Presentar el examen de admisión establecido por el Instituto.'
            ],
            competencias: [
                'Habilidades matemáticas y estadísticas.',
                'Capacidad de organización y planeación.',
                'Aptitud para el análisis de procesos.',
                'Habilidad para trabajar en equipo.',
                'Liderazgo y comunicación efectiva.'
            ]
        },
        objetivos: {
            clave: 'IIND-2010-227',
            general: 'Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios; con enfoque sistémico y sustentable en un entorno global.',
            especificos: [
                'Aplican las competencias y conocimientos adquiridos de la ingeniería industrial para la solución de problemas y mejora de la productividad y eficiencia de los sistemas productivos de bienes y servicios.',
                'Emprenden y evalúan modelos de negocios de bienes y servicios que responden a las necesidades del entorno local y global.',
                'Fortalece sus habilidades y competencias profesionales mediante la formación continua, que le permiten adaptarse a los cambios y avances en la profesión.',
                'Desempeñan puestos estratégicos coordinando equipos de trabajo en los sectores productivos de bienes y servicios.'
            ]
        },
        mision: {
            mision: 'Somos un departamento académico cuyo compromiso es formar profesionistas con un enfoque basado en competencias en el campo de la ingeniería Industrial, con conocimientos, valores y actitudes, que le permitan ser lideres, creativos y emprendedores, sustentable, ético y comprometidos con el entorno global.',
            vision: 'Ser un departamento académico de ingeniería industrial acreditado y consolidado a nivel nacional con un plan de estudios acreditado y especialidades acordes a las necesidades del sector productivo.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Diseña, mejora e integra sistemas productivos de bienes y servicios aplicando tecnologías para su optimización.',
            'Diseña, implementa y mejora sistemas de trabajo para elevar la productividad.',
            'Implanta sistemas de calidad utilizando métodos estadísticos para mejorar la competitividad de las organizaciones.',
            'Administra sistemas de mantenimiento en procesos de bienes y servicios para la optimización en el uso de los recursos.',
            'Gestiona sistemas de seguridad, salud ocupacional de manera sustentable, en sistemas productivos de bienes y servicios atendiendo los lineamientos legales.',
            'Formula, evalúa y gestiona proyectos de inversión, sociales y de transferencia de tecnología para el desarrollo regional.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        atributosEgreso: [
            'AE1. Resuelve problemas complejos de ingeniería Industrial aplicando los principios de ingeniería y ciencias básicas para la optimización de los sistemas productivos.',
            'AE2. Diseña, implementa y mejora sistemas de producción de bienes y servicios mediante métodos y técnicas establecidos.',
            'AE3. Evalúa e implementa sistemas integrados, mediante métodos estadísticos y de trabajo para mejorar la calidad, seguridad y productividad.',
            'AE4. Coordina y dirige grupos interdisciplinarios haciendo uso de las tecnologías de información y comunicación.',
            'AE5. Gestiona los sistemas integrados en los sectores productivos y de servicios con base a las normas y estándares vigentes nacionales e internacionales.',
            'AE6. Formula, evalúa y/o emprende proyectos de inversión que promueva el desarrollo socioeconómico de una región de forma sustentable.',
            'AE7. Desarrolla actitudes de liderazgo y trabajo colaborativo a partir de un sentido ético y profesional, con un amplio carácter emprendedor y creativo.'
        ]
    },
    'iq': {
        nombre: 'Ingeniería Química',
        clave: 'IQUI – 2010 – 232',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Laura Gabriela Martínez Montiel',
        correo: 'dep_iq@minatitlan.tecnm.mx',
        icono: 'fas fa-flask',
        desc: ['Formación de ingenieros especializados en diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios con base en el desarrollo tecnológico y de manera sustentable.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería Química',
            intro: 'El aspirante a la carrera de Ingeniería Química debe contar con el siguiente perfil de ingreso:',
            requisitos: [
                'Habilidades en matemáticas de álgebra, cálculo diferencial e integral.',
                'Conocimientos básicos de química y física.',
                'Habilidades de lectura, comprensión, resumen y redacción de textos.',
                'Conocimiento mínimo del idioma inglés.',
                'Uso básico de las TIC\'s.'
            ],
            competencias: ['----']
        },
        objetivos: {
            clave: 'IQUI-2010-232',
            general: 'Formar ingenieros químicos capaces de diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios, con apego a la normatividad vigente y de manera sustentable.',
            especificos: [
                'El egresado estudia un posgrado y desarrolla investigación para innovar procesos en la industria o en el sector educativo.',
                'El egresado a través de su desempeño cubre puestos gerenciales en los sectores públicos o privados a nivel nacional o internacional.',
                'El egresado se actualiza en nuevas tecnologías y administra las empresas con sentido humano, legal, ético y con responsabilidad social.',
                'El egresado trabaja con equipos multidisciplinarios de alto desempeño para la planeación, evaluación y desarrollo de proyectos de construcción, expansión y mejora de procesos industriales.'
            ]
        },
        mision: {
            mision: 'Formar profesionistas con conocimientos, habilidades y actitudes con un alto valor social, que les permita desempeñarse en un plano competitivo y de excelencia dentro de un marco global, con competencias inherentes al desarrollo de procesos en las diferentes áreas de la Ingeniería Química e Ingeniería Ambiental.',
            vision: 'Ser profesionistas en Ingeniería Química e Ingeniería Ambiental competentes para investigar, generar y aplicar el conocimiento científico y tecnológico, que le permita identificar y resolver problemas de diseño, operación, adaptación, optimización y administración en industrias químicas y de servicios.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Diseñar, seleccionar, operar, optimizar y controlar procesos en industrias químicas y de servicios con base en el desarrollo tecnológico de acuerdo con las normas de higiene y seguridad, de manera sustentable.',
            'Colaborar en equipos interdisciplinarios y multiculturales en su ámbito laboral, con actitud innovadora, espíritu crítico, disposición al cambio y apego a la ética profesional.',
            'Planear e implementar sistemas de gestión de calidad, ambiental e higiene y seguridad en los diferentes sectores, conforme a las normas nacionales e internacionales.',
            'Utilizar las tecnologías de la información y comunicación como herramientas en la construcción de soluciones a problemas de ingeniería.',
            'Realizar innovación y adaptación de tecnología en procesos aplicando la metodología científica, con respeto a la propiedad intelectual.',
            'Demostrar actitud creativa, emprendedora y de liderazgo para impulsar y crear empresas que contribuyan al progreso nacional.',
            'Administrar recursos humanos, materiales y financieros para los sectores público y privado, acorde a modelos administrativos vigentes.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes'],
        atributosEgreso: [
            'Identificar, formular y resolver problemas de Ingeniería aplicando principios de las Ciencias Básicas, Matemáticas e Ingeniería.',
            'Realizar el dimensionamiento de procesos para proponer soluciones que involucren criterios de salud y seguridad Industrial.',
            'Aplicar técnicas analíticas de laboratorio e investigación para mejorar los sistemas productivos.',
            'Aplicar los conocimientos para la Operación y Administración de plantas Industriales.',
            'Incluir e identificar las responsabilidades éticas, profesionales y sustentables en el quehacer diario de la ingeniería.',
            'Adquirir y aplicar nuevos conocimientos como el dominio del idioma inglés y el uso de software de ingeniería.',
            'Trabajar en equipos multidisciplinarios de manera efectiva y eficiente creando un ambiente colaborativo e inclusivo.'
        ]
    },
    'la': {
        nombre: 'Licenciatura en Administración',
        clave: 'LADM – 2010 – 234',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Olivia Hernández Domínguez',
        correo: 'dep_la@minatitlan.tecnm.mx',
        icono: 'fas fa-briefcase',
        desc: ['Formar profesionales de la administración comprometidos con las demandas y oportunidades del entorno, con una visión estratégica, humanista y global, que actúen como agentes de cambio.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Licenciatura en Administración',
            intro: 'El aspirante por cursar la Licenciatura en Administración en Tecnológico Nacional de México Campus Minatitlán posea los conocimientos, habilidades, actitudes, valores y competencias necesarios para generar una base sólida que fomente su desarrollo a lo largo de su vida académica.',
            requisitos: [
                'Haber concluido el nivel de Educación Media Superior.',
                'Disponer del tiempo para cumplir con las actividades del plan de estudio.',
                'Presentar el examen de admisión establecido por el Instituto.'
            ],
            competencias: [
                'Habilidades matemáticas (aritmética y estadística).',
                'Habilidades básicas del manejo de la computación.',
                'Habilidades de gestión de información.',
                'Comprensión lectora.',
                'Comunicación escrita.',
                'Capacidad de relacionarse con otras personas.',
                'Habilidad para trabajar en forma autónoma.'
            ]
        },
        objetivos: {
            clave: 'LADM-2010-234',
            general: 'Formar profesionales de la administración comprometidos con las demandas y oportunidades del entorno, con una visión estratégica, humanista y global, que actúen como agentes de cambio, a través del diseño, innovación y dirección en las organizaciones.',
            especificos: [
                'Adaptar las etapas del proceso administrativo a las nuevas tendencias con la finalidad de optimizar los recursos.',
                'Analizar e interpretar información financiera y económica para la toma de decisiones en las organizaciones.',
                'Crear y desarrollar negocios sustentables aplicando métodos de investigación de vanguardia.',
                'Interpretar y aplicar el marco legal vigente, para dar certeza jurídica a las organizaciones.',
                'Implementar y administrar sistemas de gestión de la calidad, para orientar a las organizaciones a la mejora continua.',
                'Aplicar las tecnologías de la información y comunicación en el diseño de estrategias de las organizaciones.'
            ]
        },
        mision: {
            mision: 'Formar integralmente profesionales en administración, basados en el modelo educativo para el siglo XXI, con un enfoque humanista y ético para el desarrollo estratégico sostenible que demanden las organizaciones.',
            vision: 'Ser un programa académico con reconocimiento nacional e internacional en el desempeño e investigación aplicada de la administración.',
            politicas: [
                'Promover el desarrollo integral y armónico del estudiante en Administración para que responda a los retos y necesidades de las organizaciones.',
                'Implementar y orientar los procesos estratégicos y actividades del programa educativo hacia el reconocimiento nacional e internacional.',
                'Mantener una relación estrecha y permanente con la comunidad en actividades científicas, tecnológicas, culturales y humanísticas.',
                'Fomentar la investigación, la ciencia y la tecnología en el campo de la administración.',
                'Vigilar en el proceso educativo el cumplimiento de las leyes, reglamentos, manuales y procedimientos.',
                'Orientar las actividades del programa educativo hacia la equidad de género y no discriminación, la responsabilidad social, respeto al medio ambiente e impacto económico.'
            ]
        },
        salidaLateral: true,
        perfilEgreso: [
            'Integra los procesos gerenciales, de administración, de innovación y las estrategias para alcanzar la productividad y competitividad de las organizaciones.',
            'Adapta las etapas de los procesos a las nuevas tendencias y enfoques de la administración, para la optimización de los recursos y el manejo de los cambios organizacionales.',
            'Desarrolla habilidades directivas basadas en la ética y la responsabilidad social, que le permitan integrar y coordinar equipos interdisciplinarios y multidisciplinarios.',
            'Crea y desarrolla proyectos sustentables aplicando métodos de investigación de vanguardia, con un enfoque estratégico, multicultural y humanista.',
            'Dirige la organización hacia la consecución de sus objetivos, a través de la coordinación de esfuerzos y el desarrollo creativo.',
            'Diseña organizaciones que contribuyan a la transformación económica y social identificando las oportunidades de negocios.',
            'Interpreta y aplica el marco legal vigente nacional e internacional, para dar certeza jurídica a las organizaciones.',
            'Interpreta información financiera y económica para la toma de decisiones en las organizaciones.',
            'Implementa y administra sistemas de gestión de calidad para orientarlos a la mejora continua.',
            'Aplica las tecnologías de la información y comunicación en el diseño de estrategias que optimicen el trabajo y desarrollo de las organizaciones.',
            'Diseña estrategias de mercadotecnia basadas en el análisis de la información interna y del entorno global.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes']
    },
    'iia': {
        nombre: 'Ingeniería en Inteligencia Artificial',
        clave: 'TBD',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Eliseo Hernández del Rivero',
        correo: 'dep_ie@minatitlan.tecnm.mx',
        icono: 'fas fa-robot',
        desc: ['Formar ingenieros competentes en el diseño, desarrollo, y evaluación de sistemas inteligentes para la toma de decisiones en entornos industriales, empresariales y de investigación, con un enfoque multidisciplinario, ético y sostenible.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería en Inteligencia Artificial',
            intro: 'El aspirante a la carrera de Ingeniería en Inteligencia Artificial debe contar con el siguiente perfil:',
            requisitos: [
                'Habilidades lógico-matemáticas.',
                'Habilidades de pensamiento crítico, de análisis y síntesis.',
                'Habilidades de comunicación oral y escrita.',
                'Habilidad de razonamiento cuantitativo.',
                'Habilidades de programación básica.',
                'Habilidades de uso de herramientas tecnológicas.'
            ],
            competencias: ['----']
        },
        objetivos: {
            clave: 'TBD',
            general: 'Formar ingenieros competentes en el diseño, desarrollo, y evaluación de sistemas inteligentes para la toma de decisiones en entornos industriales, empresariales y de investigación que contribuyan al avance de las ciencias humanísticas y tecnológicas, con un enfoque multidisciplinario, ético y sostenible.',
            especificos: [
                'Utiliza análisis de datos, herramientas y técnicas avanzadas de inteligencia artificial para resolver problemas complejos en diferentes entornos sociales.',
                'Diseña, evalúa y modela algoritmos para crear soluciones inteligentes en entornos industriales, empresariales y de investigación.',
                'Aplica principios teóricos y prácticos para el análisis y desarrollo de sistemas inteligentes con sentido humano.',
                'Desarrolla soluciones en inteligencia artificial para integrar sistemas completos que automatizan procesos y mejoran la toma de decisiones.',
                'Contribuye a la generación, comunicación y difusión de conocimiento en el campo de la inteligencia artificial.'
            ]
        },
        mision: {
            mision: 'Información disponible próximamente.',
            vision: 'Información disponible próximamente.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Utiliza análisis de datos, herramientas y técnicas avanzadas de inteligencia artificial para resolver problemas complejos en diferentes entornos sociales.',
            'Diseña, evalúa y modela algoritmos para crear soluciones inteligentes en entornos industriales, empresariales y de investigación, cumpliendo con estándares de calidad y ética.',
            'Aplica principios teóricos y prácticos para el análisis y desarrollo de sistemas inteligentes con sentido humano.',
            'Desarrolla soluciones en inteligencia artificial para integrar sistemas completos que automatizan procesos, optimizan operaciones y mejoran la toma de decisiones con responsabilidad social.',
            'Contribuye a la generación, comunicación y difusión de conocimiento en el campo de la inteligencia artificial mediante la participación en proyectos multidisciplinarios.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes']
    },
    'ida': {
        nombre: 'Ingeniería en Desarrollo de Aplicaciones',
        clave: 'TBD',
        modalidad: 'Escolarizado – Semestral',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Víctor Ignacio Velasco Huerta',
        correo: 'dep_isc@minatitlan.tecnm.mx',
        icono: 'fas fa-mobile-alt',
        desc: ['Formar ingenieros competentes en el diseño y desarrollo de aplicaciones web, móvil y en la nube, ofreciendo soluciones innovadoras y eficientes que respondan a las necesidades del mercado digital.'],
        perfilIngreso: {
            titulo: 'Perfil de Ingreso a la carrera de Ingeniería en Desarrollo de Aplicaciones',
            intro: 'El aspirante a la carrera de Ingeniería en Desarrollo de Aplicaciones debe contar con el siguiente perfil:',
            requisitos: [
                'Habilidades lógico-matemáticas.',
                'Habilidades de pensamiento crítico, de análisis y síntesis.',
                'Habilidades de comunicación oral y escrita.',
                'Habilidad de razonamiento cuantitativo.',
                'Habilidades de programación básica.',
                'Habilidades de uso de herramientas tecnológicas.'
            ],
            competencias: ['----']
        },
        objetivos: {
            clave: 'TBD',
            general: 'Formar ingenieros competentes en el diseño y desarrollo de aplicaciones web, móvil y en la nube ofreciendo soluciones innovadoras y eficientes que respondan a las necesidades del mercado digital y permitan la mejora del desempeño de las organizaciones con tecnologías de vanguardia.',
            especificos: [
                'Analiza, diseña y desarrolla aplicaciones web, móvil o de cómputo en la nube para satisfacer los requerimientos de los usuarios.',
                'Desarrolla bases de datos relacionales y no relacionales utilizando estándares internacionales para crear sistemas de información robustos.',
                'Desarrolla estrategias basadas en la mercadotecnia digital que permitan a los usuarios generar experiencias y contribuir con las organizaciones.',
                'Formula, diseña, ejecuta y evalúa proyectos de desarrollo de aplicaciones orientados a la satisfacción de necesidades.',
                'Desarrolla proyectos de inversión viables, empleando el uso de nuevas tecnologías para la satisfacción de necesidades de las organizaciones.'
            ]
        },
        mision: {
            mision: 'Información disponible próximamente.',
            vision: 'Información disponible próximamente.'
        },
        salidaLateral: true,
        perfilEgreso: [
            'Analiza, diseña y desarrolla aplicaciones web, móvil o de cómputo en la nube para satisfacer los requerimientos de los usuarios.',
            'Desarrolla bases de datos relacionales y no relacionales utilizando estándares internacionales para crear sistemas de información robustos, eficientes y sostenibles.',
            'Desarrolla estrategias basadas en la mercadotecnia digital, que le permitan a los usuarios generar experiencias y contribuir con las organizaciones para posicionar sus productos y servicios en Internet con sentido ético.',
            'Formula, diseña, ejecuta y evalúa proyectos de desarrollo de aplicaciones orientados a la satisfacción de necesidades para potenciar los servicios de las organizaciones y la sociedad con responsabilidad ética.',
            'Desarrolla proyectos de inversión viables, empleando como una de las estrategias de solución el uso de nuevas tecnologías, para la satisfacción de necesidades de las organizaciones y la sociedad.'
        ],
        asignaturas: ['Asignaturas', 'Asignaturas comunes', 'Asignaturas equivalentes']
    },
    'iid-d': {
        nombre: 'Ingeniería Industrial (Educación a Distancia)',
        clave: 'IIND – 2010 – 227',
        modalidad: 'Distancia',
        duracion: '9 semestres',
        creditos: '260',
        coord: 'Luz Elena Villanueva Castellanos',
        correo: 'ead@minatitlan.tecnm.mx',
        icono: 'fas fa-laptop-house',
        planEstudio: false,
        desc: ['Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial en modalidad a distancia; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios.'],
        perfilIngreso: {
            titulo: '----',
            intro: '----',
            requisitos: ['----'],
            competencias: ['----']
        },
        objetivos: {
            clave: 'IIND-2010-227',
            general: 'Formar profesionales, éticos, líderes, creativos y emprendedores en el área de Ingeniería Industrial; competente para diseñar, implantar, administrar, innovar y optimizar sistemas de producción de bienes y servicios; con enfoque sistémico y sustentable en un entorno global.',
            especificos: []
        },
        perfilEgreso: [
            'Diseña, mejora e integra sistemas productivos de bienes y servicios aplicando tecnologías para su optimización.',
            'Diseña, implementa y mejora sistemas de trabajo para elevar la productividad.',
            'Implanta sistemas de calidad utilizando métodos estadísticos para mejorar la competitividad de las organizaciones.',
            'Administra sistemas de mantenimiento en procesos de bienes y servicios para la optimización en el uso de los recursos.',
            'Gestiona sistemas de seguridad, salud ocupacional de manera sustentable, en sistemas productivos de bienes y servicios atendiendo los lineamientos legales.',
            'Formula, evalúa y gestiona proyectos de inversión, sociales y de transferencia de tecnología para el desarrollo regional.'
        ],
        convocatoria: {
            texto: 'Consulta la convocatoria para la modalidad de Educación a Distancia (AGO – DIC 2024):',
            url: 'https://minatitlan.tecnm.mx/wp-content/uploads/2024/05/Convocatoria-No-Escolarizada-CIESDEMEX-EaD-Minatitlan_V.pdf'
        }
    }
};

let currentCarreraIdV = null;
const planEstudioFilesV = {};

document.addEventListener('DOMContentLoaded', function () {
    // Buscador en modal Oferta Visitante
    const oeSearchV = document.querySelector('#ofertaModalOverlayV .oe-search-v');
    if (oeSearchV) {
        oeSearchV.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            const panel = document.getElementById('oePanelPresencialV').style.display !== 'none'
                ? document.getElementById('oePanelPresencialV')
                : document.getElementById('oePanelDistanciaV');
            panel.querySelectorAll('.oe-filtrable-v').forEach(function (btn) {
                btn.style.display = (term === '' || btn.textContent.toLowerCase().includes(term)) ? '' : 'none';
            });
        });
    }
});

function abrirModalOfertaV() {
    const overlay = document.getElementById('ofertaModalOverlayV');
    if (overlay) overlay.classList.add('active');
}

function cerrarModalOfertaV(event) {
    const overlay = document.getElementById('ofertaModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function seleccionarModalidadOEV(modalidad) {
    const panelP = document.getElementById('oePanelPresencialV');
    const panelD = document.getElementById('oePanelDistanciaV');
    const tabP   = document.getElementById('oeTabPresencialV');
    const tabD   = document.getElementById('oeTabDistanciaV');
    if (modalidad === 'presencial') {
        panelP.style.display = '';
        panelD.style.display = 'none';
        tabP.classList.add('oe-sidebar-active');
        tabD.classList.remove('oe-sidebar-active');
    } else {
        panelP.style.display = 'none';
        panelD.style.display = '';
        tabP.classList.remove('oe-sidebar-active');
        tabD.classList.add('oe-sidebar-active');
    }
    const s = document.querySelector('#ofertaModalOverlayV .oe-search-v');
    if (s) { s.value = ''; }
    document.querySelectorAll('.oe-filtrable-v').forEach(b => b.style.display = '');
}

function abrirModalCarreraV(carreraId) {
    const data = CARRERAS_DATA_V[carreraId];
    if (!data) return;
    currentCarreraIdV = carreraId;

    // Cerrar modal oferta
    const ofertaOverlay = document.getElementById('ofertaModalOverlayV');
    if (ofertaOverlay) ofertaOverlay.classList.remove('active');

    // --- Banner ---
    const bannerEl = document.getElementById('carreraBannerV');
    const headerNoBanner = document.getElementById('carreraHeaderNoBannerV');
    const bodyInner = document.getElementById('carreraBodyInnerV');
    if (bannerEl) {
        bannerEl.className = 'oe-carrera-banner oe-banner-' + carreraId;
        const bannerIcon = document.getElementById('carreraBannerIconV');
        if (bannerIcon) bannerIcon.className = data.icono;
        const bnEl = document.getElementById('carreraBannerNombreV');
        const bcEl = document.getElementById('carreraBannerClaveV');
        if (bnEl) bnEl.textContent = data.nombre;
        if (bcEl) bcEl.textContent = data.clave;
        // Cargar imagen usando <img> real (soporta .jpg y .jpeg)
        const bannerImgV = document.getElementById('carreraBannerImgV');
        if (bannerImgV) {
            bannerImgV.style.display = 'none';
            bannerImgV.src = '';
            const extsV = ['jpg', 'jpeg', 'png', 'webp'];
            let triedV = 0;
            function tryNextV() {
                if (triedV >= extsV.length) return;
                bannerImgV.onerror = function() { triedV++; tryNextV(); };
                bannerImgV.onload = function() { bannerImgV.style.display = ''; };
                bannerImgV.src = '../img/banner-' + carreraId + '.' + extsV[triedV];
                triedV++;
            }
            tryNextV();
        }
        bannerEl.style.display = '';
    }
    if (headerNoBanner) headerNoBanner.style.display = 'none';
    if (bodyInner) bodyInner.style.maxHeight = 'calc(60vh - 130px)';

    // Breadcrumb y título
    document.getElementById('carreraBreadcrumbV').textContent = 'Inicio › Oferta Educativa › ' + data.nombre;
    document.getElementById('carreraTitleV').textContent = data.nombre;

    // --- Ficha técnica ---
    const fichaMap = {
        'carreraNombreV': data.nombre,
        'carreraClaveV': data.clave,
        'carreraModalidadV': data.modalidad,
        'carreraDuracionV': data.duracion,
        'carreraCreditosV': data.creditos,
        'carreraCoordV': data.coord,
        'carreraCorreoV': data.correo
    };
    Object.entries(fichaMap).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = val || '—';
        const row = el.closest('.oe-ficha-row');
        if (row) row.style.display = (val && val !== '---' && val !== '----') ? '' : 'none';
    });

    // Icono
    const iconEl = document.getElementById('carreraIconV');
    if (iconEl) iconEl.className = data.icono;

    // Descripción
    const descList = document.getElementById('carreraDescV');
    if (descList) descList.innerHTML = (data.desc || []).map(d => '<li>' + d + '</li>').join('');

    // helper
    function secVisV(secId, show) {
        const sec = document.getElementById(secId);
        const wrap = sec && sec.closest('.tr-section');
        if (wrap) wrap.style.display = show ? '' : 'none';
    }

    // --- Perfil de Ingreso ---
    const pi = data.perfilIngreso;
    if (pi && pi.intro && pi.intro !== '----') {
        let html = '';
        if (pi.titulo && pi.titulo !== '----') html += `<h4>${pi.titulo}</h4>`;
        html += `<p>${pi.intro}</p>`;
        if (pi.requisitos && pi.requisitos[0] !== '----') html += `<h4>Requisitos</h4><ul>${pi.requisitos.map(r=>'<li>'+r+'</li>').join('')}</ul>`;
        if (pi.competencias && pi.competencias[0] !== '----') html += `<h4>Competencias</h4><ul>${pi.competencias.map(c=>'<li>'+c+'</li>').join('')}</ul>`;
        const el = document.getElementById('perfilIngresoContentV');
        if (el) el.innerHTML = html;
        secVisV('secPerfilIngresoV', true);
    } else { secVisV('secPerfilIngresoV', false); }

    // --- Objetivos ---
    if (data.objetivos) {
        const obj = data.objetivos;
        let html = '';
        if (obj.clave) html += `<p class="oe-block-sub">Clave: ${obj.clave}</p>`;
        if (obj.general) html += `<p class="oe-block-title">Objetivo General</p><p class="oe-mision-text">${obj.general}</p>`;
        if (obj.especificos && obj.especificos.length) html += `<p class="oe-block-title">Objetivos educativos</p><ol class="oe-obj-list">${obj.especificos.map(e=>'<li>'+e+'</li>').join('')}</ol>`;
        const el = document.getElementById('objetivosContentV');
        if (el) el.innerHTML = html;
        secVisV('secObjetivosV', true);
    } else { secVisV('secObjetivosV', false); }

    // --- Misión y Visión ---
    if (data.mision && data.mision.mision && data.mision.mision !== '----') {
        const m = data.mision;
        let html = `<p class="oe-block-title">Misión</p><p class="oe-mision-text">${m.mision}</p>`;
        if (m.vision && m.vision !== '----') html += `<p class="oe-block-title">Visión</p><p class="oe-mision-text">${m.vision}</p>`;
        if (m.politicas) html += `<p class="oe-block-title">Políticas</p><ol class="oe-politica-list">${m.politicas.map(p=>'<li>'+p+'</li>').join('')}</ol>`;
        const el = document.getElementById('misionContentV');
        if (el) el.innerHTML = html;
        secVisV('secMisionV', true);
    } else { secVisV('secMisionV', false); }

    // --- Salida Lateral ---
    if (data.salidaLateral) {
        const slKey = carreraId + '_sl_v';
        const slFile = planEstudioFilesV[slKey];
        const slSt = slFile ? `<span class="tr-file-status" title="${slFile.name}">✓ ${slFile.name.length>12?slFile.name.substring(0,12)+'…':slFile.name}</span>` : '<span class="tr-file-status"></span>';
        const slDl = slFile ? `<a class="oe-upload-row-dl" href="${slFile.url}" download="${slFile.name}"><i class="fas fa-download"></i></a>` : `<a class="oe-upload-row-dl" style="display:none" href="#"><i class="fas fa-download"></i></a>`;
        const el = document.getElementById('salidaLateralContentV');
        if (el) el.innerHTML = `<div class="oe-upload-zone"><div class="oe-upload-row"><i class="fas fa-file-alt oe-upload-row-icon"></i><span class="oe-upload-row-name">Documento de Salida Lateral</span><div class="oe-upload-row-actions"><label class="oe-upload-row-btn" for="file-sl-v-${carreraId}"><i class="fas fa-upload"></i></label><input type="file" id="file-sl-v-${carreraId}" class="tr-file-input" accept="*/*" onchange="subirDocOEV(event,'${slKey}','file-sl-v-${carreraId}')">${slSt}${slDl}</div></div></div>`;
        secVisV('secSalidaLateralV', true);
    } else { secVisV('secSalidaLateralV', false); }

    // --- Especialidad ---
    const espWrapV = document.getElementById('wrapSecEspecialidadV');
    if (data.especialidad) {
        const esp = data.especialidad;
        let html = `<p class="oe-block-title">${esp.nombre||''}</p>`;
        if (esp.descripcion) html += `<p class="oe-mision-text">${esp.descripcion}</p>`;
        if (esp.materias && esp.materias.length) html += `<ul>${esp.materias.map(m=>'<li>'+m+'</li>').join('')}</ul>`;
        const el = document.getElementById('especialidadContentV');
        if (el) el.innerHTML = html;
        if (espWrapV) espWrapV.style.display = '';
    } else { if (espWrapV) espWrapV.style.display = 'none'; }

    // --- Atributos de Egreso ---
    const atWrapV = document.getElementById('wrapSecAtributosV');
    if (data.atributosEgreso && data.atributosEgreso.length) {
        const el = document.getElementById('atributosContentV');
        if (el) el.innerHTML = `<ol class="oe-egreso-list">${data.atributosEgreso.map(a=>'<li>'+a+'</li>').join('')}</ol>`;
        if (atWrapV) atWrapV.style.display = '';
    } else { if (atWrapV) atWrapV.style.display = 'none'; }

    // --- Perfil de Egreso ---
    if (data.perfilEgreso && data.perfilEgreso.length) {
        const el = document.getElementById('perfilEgresoContentV');
        if (el) el.innerHTML = `<ol class="oe-egreso-list">${data.perfilEgreso.map(e=>'<li>'+e+'</li>').join('')}</ol>`;
        secVisV('secPerfilEgresoV', true);
    } else { secVisV('secPerfilEgresoV', false); }

    // --- Asignaturas ---
    if (data.asignaturas && data.asignaturas.length) {
        const rows = data.asignaturas.map(function(nombre, idx) {
            const key = carreraId + '_as_v_' + idx;
            const f = planEstudioFilesV[key];
            const st = f ? `<span class="tr-file-status" title="${f.name}">✓ ${f.name.length>10?f.name.substring(0,10)+'…':f.name}</span>` : '<span class="tr-file-status"></span>';
            const dl = f ? `<a class="oe-upload-row-dl" href="${f.url}" download="${f.name}"><i class="fas fa-download"></i></a>` : `<a class="oe-upload-row-dl" style="display:none" href="#"><i class="fas fa-download"></i></a>`;
            return `<div class="oe-upload-row"><i class="fas fa-file-archive oe-upload-row-icon"></i><span class="oe-upload-row-name">${nombre}</span><div class="oe-upload-row-actions"><label class="oe-upload-row-btn" for="file-as-v-${carreraId}-${idx}"><i class="fas fa-upload"></i></label><input type="file" id="file-as-v-${carreraId}-${idx}" class="tr-file-input" accept="*/*" onchange="subirDocOEV(event,'${key}','file-as-v-${carreraId}-${idx}')">${st}${dl}</div></div>`;
        }).join('');
        const el = document.getElementById('asignaturasContentV');
        if (el) el.innerHTML = `<div class="oe-upload-zone">${rows}</div>`;
        secVisV('secAsignaturasV', true);
    } else { secVisV('secAsignaturasV', false); }

    // --- Convocatoria ---
    const cvWrapV = document.getElementById('wrapSecConvocatoriaV');
    if (data.convocatoria) {
        let html = '';
        if (data.convocatoria.texto) html += `<p class="oe-mision-text">${data.convocatoria.texto}</p>`;
        if (data.convocatoria.url) html += `<a href="${data.convocatoria.url}" target="_blank" class="oe-conv-link"><i class="fas fa-external-link-alt"></i> Ver Convocatoria</a>`;
        const el = document.getElementById('convocatoriaContentV');
        if (el) el.innerHTML = html;
        if (cvWrapV) cvWrapV.style.display = '';
    } else { if (cvWrapV) cvWrapV.style.display = 'none'; }

    // --- Plan de estudios ---
    const planDlV = document.getElementById('planDownloadBtnV');
    const planBlockV = document.getElementById('planUploadLabelV')?.closest('.oe-section-block');
    if (data.planEstudio === false) {
        if (planBlockV) planBlockV.style.display = 'none';
    } else {
        if (planBlockV) planBlockV.style.display = '';
        if (planEstudioFilesV[carreraId]) {
            const f = planEstudioFilesV[carreraId];
            if (planDlV) { planDlV.href = f.url; planDlV.download = f.name; planDlV.classList.remove('oe-plan-dl-hidden'); }
        } else {
            if (planDlV) { planDlV.href = '#'; planDlV.classList.add('oe-plan-dl-hidden'); }
        }
    }

    // Colapsar secciones
    ['secPerfilIngresoV','secObjetivosV','secMisionV','secSalidaLateralV','secEspecialidadV','secAtributosV','secPerfilEgresoV','secAsignaturasV','secConvocatoriaV'].forEach(function(id) {
        const sec = document.getElementById(id);
        if (sec) {
            sec.classList.add('tr-section-collapsed');
            const toggle = sec.previousElementSibling;
            if (toggle) { const arrow = toggle.querySelector('.tr-section-arrow'); if (arrow) arrow.style.transform = 'rotate(-90deg)'; }
        }
    });

    const overlay = document.getElementById('carreraModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalCarreraV(event) {
    const overlay = document.getElementById('carreraModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

function subirDocOEV(event, key, inputId) {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    planEstudioFilesV[key] = { url: url, name: file.name };
    const input = document.getElementById(inputId);
    if (!input) return;
    const row = input.closest('.oe-upload-row');
    if (!row) return;
    const statusEl = row.querySelector('.oe-upload-row-status');
    const dlEl = row.querySelector('.oe-upload-row-dl');
    if (statusEl) { statusEl.textContent = '✓ ' + (file.name.length > 10 ? file.name.substring(0,10)+'…' : file.name); statusEl.title = file.name; }
    if (dlEl) { dlEl.href = url; dlEl.download = file.name; dlEl.style.display = ''; }
}

function subirPlanEstudioV(event) {
    const file = event.target.files[0];
    if (!file || !currentCarreraIdV) return;
    const url = URL.createObjectURL(file);
    planEstudioFilesV[currentCarreraIdV] = { url: url, name: file.name };
    const planDlV = document.getElementById('planDownloadBtnV');
    planDlV.href = url;
    planDlV.download = file.name;
    planDlV.classList.remove('oe-plan-dl-hidden');
}

/* =========================================================
   MODAL: Desarrollo Académico (Visitante)
   ========================================================= */
function abrirModalDesarrolloAcademicoV() {
    cerrarModalTramitesV();
    var overlay = document.getElementById('desarrolloAcademicoModalOverlayV');
    if (overlay) overlay.classList.add('active');
    seleccionarTabDAV('metodosMediosV', document.querySelector('#desarrolloAcademicoModalOverlayV .rh-tab-btn:nth-child(2)'));
}
function cerrarModalDesarrolloAcademicoV(event) {
    var overlay = document.getElementById('desarrolloAcademicoModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}
function seleccionarTabDAV(tabId, btn) {
    document.querySelectorAll('#desarrolloAcademicoModalOverlayV .rh-panel-content').forEach(function(p) {
        p.style.display = 'none';
    });
    document.querySelectorAll('#desarrolloAcademicoModalOverlayV .rh-tab-btn').forEach(function(b) {
        b.classList.remove('rh-tab-active');
    });
    var panel = document.getElementById('daPanel-' + tabId);
    if (panel) panel.style.display = '';
    if (btn) btn.classList.add('rh-tab-active');
}

function abrirModalInvestigacionEducativaV() {
    var overlay = document.getElementById('investigacionEducativaModalOverlayV');
    if (overlay) overlay.classList.add('active');
}
function cerrarModalInvestigacionEducativaV(event) {
    var overlay = document.getElementById('investigacionEducativaModalOverlayV');
    if (!overlay) return;
    if (!event || event.target === overlay) overlay.classList.remove('active');
}

// ========================================
// CONTADORES: VISITAS Y REGISTRADOS (VISITANTE)
// Comparte localStorage con el perfil Alumno
// ========================================
(function() {
    // Incrementar visitas solo una vez por sesión de pestaña
    var visitaContada = sessionStorage.getItem('visitaContadaV');
    if (!visitaContada) {
        var visitas = parseInt(localStorage.getItem('contadorVisitas') || '0', 10);
        visitas += 1;
        localStorage.setItem('contadorVisitas', visitas);
        sessionStorage.setItem('visitaContadaV', 'true');
    }

    function actualizarContadoresV() {
        var visitas     = parseInt(localStorage.getItem('contadorVisitas')     || '0', 10);
        var registrados = parseInt(localStorage.getItem('contadorRegistrados') || '0', 10);

        var elVisitas     = document.getElementById('sidebarVisitasV');
        var elRegistrados = document.getElementById('sidebarRegistradosV');

        if (elVisitas)     elVisitas.textContent     = visitas > 0 ? visitas.toLocaleString('es-MX') : '—';
        if (elRegistrados) elRegistrados.textContent = registrados > 0 ? registrados.toLocaleString('es-MX') : '—';

        // Intentar actualizar registrados desde la API
        if (elRegistrados) {
            fetch('/api/auth/count')
                .then(function(r) { if (!r.ok) throw new Error('no API'); return r.json(); })
                .then(function(data) {
                    if (typeof data.total === 'number') {
                        elRegistrados.textContent = data.total.toLocaleString('es-MX');
                        localStorage.setItem('contadorRegistrados', data.total);
                    }
                })
                .catch(function() { /* usa el valor localStorage ya mostrado */ });
        }
    }

    // Actualizar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', actualizarContadoresV);
    } else {
        actualizarContadoresV();
    }

    // Actualizar en tiempo real si otra pestaña/ventana cambia el storage
    window.addEventListener('storage', function(e) {
        if (e.key === 'contadorVisitas' || e.key === 'contadorRegistrados') {
            actualizarContadoresV();
        }
    });
})();