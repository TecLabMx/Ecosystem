// ========================================
// INICIALIZACIÓN Y VARIABLES GLOBALES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('CONOCE-TEC Perfil - Página Cargada');
    
    // Obtener datos del usuario desde sessionStorage
    cargarDatosUsuario();
    
    // Configurar eventos
    configurarEventos();
});

// ========================================
// CARGAR DATOS DEL USUARIO
// ========================================

function cargarDatosUsuario() {
    // Leer nombre desde cualquiera de las keys que usan login y registro
    const nombreUsuario = sessionStorage.getItem('nombreUsuario') ||
                          sessionStorage.getItem('usuarioActual') ||
                          localStorage.getItem('nombreUsuarioActual') ||
                          localStorage.getItem('nombreAlumno') ||
                          'Juan Pérez García';

    const correoUsuario = sessionStorage.getItem('correoUsuario') ||
                          localStorage.getItem('correoUsuarioActual') ||
                          localStorage.getItem('correoAlumno') ||
                          'juan.perez@estudiante.edu.mx';

    // Leer datos extra guardados en editar perfil
    const telefono        = sessionStorage.getItem('telefonoUsuario')    || '+52 921 1234567';
    const numeroControl   = sessionStorage.getItem('numeroControl')      || '';
    const carrera         = sessionStorage.getItem('carreraUsuario')     || 'Ingeniería en Sistemas Computacionales';
    const semestre        = sessionStorage.getItem('semestreUsuario')    || '6to Semestre';
    const telEmergencia   = sessionStorage.getItem('telefonoEmergencia') || '+52 921 7654321';
    const direccion       = sessionStorage.getItem('direccionUsuario')   || 'Calle Principal 123, Minatitlán, Veracruz';
    const ciudad          = sessionStorage.getItem('ciudadUsuario')      || 'Minatitlán, Veracruz';

    // Encabezado de la tarjeta de perfil
    const profileName  = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    if (profileName)  profileName.textContent  = nombreUsuario;
    if (profileEmail) profileEmail.textContent = correoUsuario;

    // Información personal
    const infoNombre    = document.getElementById('infoNombre');
    const infoCorreo    = document.getElementById('infoCorreo');
    const infoTel       = document.getElementById('infoTelefono');
    const infoMatricula = document.getElementById('infoMatricula');
    if (infoNombre)    infoNombre.textContent    = nombreUsuario;
    if (infoCorreo)    infoCorreo.textContent    = correoUsuario;
    if (infoTel)       infoTel.textContent       = telefono;
    if (infoMatricula) infoMatricula.textContent = numeroControl || '—';

    // Información académica
    const infoCarrera  = document.getElementById('infoCarrera');
    const infoSemestre = document.getElementById('infoSemestre');
    if (infoCarrera)  infoCarrera.textContent  = carrera;
    if (infoSemestre) infoSemestre.textContent = semestre;

    // Información de contacto
    const infoCelular    = document.getElementById('infoTelefonoCelular');
    const infoEmergencia = document.getElementById('infoTelefonoEmergencia');
    const infoDireccion  = document.getElementById('infoDireccion');
    const infoCiudad     = document.getElementById('infoCiudad');
    if (infoCelular)    infoCelular.textContent    = telefono;
    if (infoEmergencia) infoEmergencia.textContent = telEmergencia;
    if (infoDireccion)  infoDireccion.textContent  = direccion;
    if (infoCiudad)     infoCiudad.textContent     = ciudad;

    console.log('Datos del usuario cargados:', { nombreUsuario, correoUsuario });
}

// ========================================
// CONFIGURAR EVENTOS
// ========================================

function configurarEventos() {
    // Botón Editar Perfil - navega directamente (es un <a href>)
    // No se sobreescribe el comportamiento del enlace

    // Botón Cambiar Avatar
    const btnEditAvatar = document.querySelector('.btn-edit-avatar');
    if (btnEditAvatar) {
        btnEditAvatar.addEventListener('click', function() {
            mostrarAlerta('Función de cambiar foto en desarrollo', 'info');
        });
    }

    // Botón Cambiar Contraseña - redirige a editar perfil
    const btnChangePassword = document.getElementById('btnChangePassword');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', function() {
            window.location.href = 'editar-perfil.html';
        });
    }

    // Botón Notificaciones — abre modal configurable
    const btnNotifications = document.getElementById('btnNotifications');
    if (btnNotifications) {
        btnNotifications.addEventListener('click', function() {
            abrirModalNotificaciones();
        });
    }

    // Botón Privacidad — abre modal de privacidad
    const btnPrivacy = document.getElementById('btnPrivacy');
    if (btnPrivacy) {
        btnPrivacy.addEventListener('click', function() {
            abrirModalPrivacidad();
        });
    }

    // Botón Eliminar Cuenta
    const btnDeleteAccount = document.getElementById('btnDeleteAccount');
    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                mostrarAlerta('Solicitud de eliminación de cuenta enviada', 'warning');
            }
        });
    }

    // Botones Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    const btnLogoutBottom = document.getElementById('btnLogoutBottom');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }
    
    if (btnLogoutBottom) {
        btnLogoutBottom.addEventListener('click', cerrarSesion);
    }
}

// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {
    // Mostrar confirmación
    if (confirm('¿Deseas cerrar sesión?')) {
        // Limpiar sessionStorage
        sessionStorage.clear();
        localStorage.removeItem('recordarAlumno');
        
        // Redirigir al login
        window.location.href = '../index.html';
    }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insertar alerta al inicio del body
    document.body.insertBefore(alertDiv, document.body.firstChild);

    // Agregar estilos personalizados
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

    // Auto-cerrar después de 5 segundos
    setTimeout(function() {
        alertDiv.remove();
    }, 5000);
}

// ========================================
// FUNCIONES DE DEPURACIÓN
// ========================================

window.verPerfil = function() {
    console.log('=== DATOS DEL PERFIL ===');
    console.log('Nombre:', document.getElementById('profileName').textContent);
    console.log('Email:', document.getElementById('profileEmail').textContent);
    console.log('Número de Control:', document.getElementById('infoMatricula') ? document.getElementById('infoMatricula').textContent : '—');
    console.log('Carrera:', document.getElementById('infoCarrera').textContent);
    console.log('========================');
};

console.log('Escribe verPerfil() para ver los datos del perfil');
// ============================================================
// MODAL DE NOTIFICACIONES CONFIGURABLES
// ============================================================

function abrirModalNotificaciones() {
    var overlay = document.getElementById('notifModalOverlay');
    if (!overlay) return;

    // Cargar preferencias guardadas
    var prefs = JSON.parse(localStorage.getItem('notif_prefs') || '{}');
    var defaults = { agenda: true, notas: true, recordatorios: true, prioridades: true, sonido: false };
    var cfg = Object.assign({}, defaults, prefs);

    var map = {
        notifPrefAgenda:        'agenda',
        notifPrefNotas:         'notas',
        notifPrefRecordatorios: 'recordatorios',
        notifPrefPrioridades:   'prioridades',
        notifPrefSonido:        'sonido'
    };
    Object.keys(map).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.checked = cfg[map[id]];
    });

    overlay.classList.add('active');

    // Eventos de cierre y guardado
    document.getElementById('notifModalClose').onclick = function() { overlay.classList.remove('active'); };
    document.getElementById('notifModalCancel').onclick = function() { overlay.classList.remove('active'); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('active'); });

    document.getElementById('notifModalSave').onclick = function() {
        var saved = {};
        Object.keys(map).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) saved[map[id]] = el.checked;
        });
        localStorage.setItem('notif_prefs', JSON.stringify(saved));
        overlay.classList.remove('active');
        mostrarAlerta('Preferencias de notificaciones guardadas', 'success');
    };
}

// ============================================================
// MODAL DE PRIVACIDAD
// ============================================================

function abrirModalPrivacidad() {
    var overlay = document.getElementById('privacyModalOverlay');
    if (!overlay) return;

    // Cargar preferencias guardadas
    var prefs = JSON.parse(localStorage.getItem('privacy_prefs') || '{}');
    var defaults = { nombre: true, correo: false, carrera: true, telefono: false };
    var cfg = Object.assign({}, defaults, prefs);

    var map = {
        privPrefNombre:   'nombre',
        privPrefCorreo:   'correo',
        privPrefCarrera:  'carrera',
        privPrefTelefono: 'telefono'
    };
    Object.keys(map).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.checked = cfg[map[id]];
    });

    overlay.classList.add('active');

    document.getElementById('privacyModalClose').onclick = function() { overlay.classList.remove('active'); };
    document.getElementById('privacyModalCancel').onclick = function() { overlay.classList.remove('active'); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('active'); });

    document.getElementById('privacyModalSave').onclick = function() {
        var saved = {};
        Object.keys(map).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) saved[map[id]] = el.checked;
        });
        localStorage.setItem('privacy_prefs', JSON.stringify(saved));
        overlay.classList.remove('active');
        mostrarAlerta('Preferencias de privacidad guardadas', 'success');
    };
}