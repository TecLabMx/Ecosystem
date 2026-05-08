// ========================================
// INICIALIZACIÓN Y VARIABLES GLOBALES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('CONOCE-TEC Editar Perfil - Página Cargada');
    
    // Cargar datos del usuario
    cargarDatosFormulario();
    
    // Configurar eventos
    configurarEventos();
});

// ========================================
// CARGAR DATOS DEL FORMULARIO
// ========================================

function cargarDatosFormulario() {
    // Obtener datos del usuario desde sessionStorage
    const nombreUsuario = sessionStorage.getItem('usuarioActual') ||
                          sessionStorage.getItem('nombreUsuario') ||
                          localStorage.getItem('nombreUsuarioActual') || 'Juan Pérez García';
    const correoUsuario = sessionStorage.getItem('correoUsuario') ||
                          localStorage.getItem('correoUsuarioActual') || 'juan.perez@estudiante.edu.mx';
    
    // Llenar el formulario con los datos actuales
    document.getElementById('editNombre').value = nombreUsuario;
    document.getElementById('editCorreo').value = correoUsuario;
    const numControl = sessionStorage.getItem('numeroControl') || '';
    document.getElementById('editMatricula').value = numControl;
    document.getElementById('editCarrera').value = sessionStorage.getItem('carreraUsuario') || '';
    document.getElementById('editSemestre').value = sessionStorage.getItem('semestreUsuario') || '';
    document.getElementById('editTelefono').value = '+52 921 1234567';
    document.getElementById('editTelefonoEmergencia').value = '+52 921 7654321';
    document.getElementById('editDireccion').value = 'Calle Principal 123, Minatitlán, Veracruz';
    document.getElementById('editCiudad').value = 'Minatitlán, Veracruz';
    
    console.log('Datos del formulario cargados');
}

// ========================================
// CONFIGURAR EVENTOS
// ========================================

function configurarEventos() {
    // Evento para enviar el formulario
    const formEditarPerfil = document.getElementById('formEditarPerfil');
    if (formEditarPerfil) {
        formEditarPerfil.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarCambios();
        });
    }

    // Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }

    // Botones mostrar/ocultar contraseña
    document.querySelectorAll('.btn-toggle-pw').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Validar coincidencia de contraseñas en tiempo real
    const pwNueva = document.getElementById('editContrasenaNueva');
    const pwConfirmar = document.getElementById('editContrasenaConfirmar');
    const pwMatchMsg = document.getElementById('pwMatchMsg');
    const pwStrengthMsg = document.getElementById('pwStrengthMsg');

    if (pwNueva) {
        pwNueva.addEventListener('input', function() {
            const val = this.value;
            if (val.length === 0) {
                pwStrengthMsg.textContent = '';
            } else if (val.length < 6) {
                pwStrengthMsg.textContent = 'Contraseña muy corta (mínimo 6 caracteres)';
                pwStrengthMsg.style.color = '#ef4444';
            } else if (val.length < 12) {
                pwStrengthMsg.textContent = 'Contraseña débil';
                pwStrengthMsg.style.color = '#f97316';
            } else {
                pwStrengthMsg.textContent = 'Contraseña fuerte ✓';
                pwStrengthMsg.style.color = '#10b981';
            }
            if (pwConfirmar && pwConfirmar.value) validarCoincidencia();
        });
    }

    if (pwConfirmar) {
        pwConfirmar.addEventListener('input', validarCoincidencia);
    }

    function validarCoincidencia() {
        if (!pwNueva || !pwConfirmar || !pwMatchMsg) return;
        if (pwConfirmar.value === '') {
            pwMatchMsg.textContent = '';
            return;
        }
        if (pwNueva.value === pwConfirmar.value) {
            pwMatchMsg.textContent = 'Las contraseñas coinciden ✓';
            pwMatchMsg.className = 'form-text ok';
        } else {
            pwMatchMsg.textContent = 'Las contraseñas no coinciden';
            pwMatchMsg.className = 'form-text error';
        }
    }
}

// ========================================
// GUARDAR CAMBIOS
// ========================================

function guardarCambios() {
    // Obtener valores del formulario
    const nombre = document.getElementById('editNombre').value.trim();
    const correo = document.getElementById('editCorreo').value.trim();
    const telefono = document.getElementById('editTelefono').value.trim();
    const matricula = document.getElementById('editMatricula').value.trim();
    const carrera = document.getElementById('editCarrera').value;
    const semestre = document.getElementById('editSemestre').value;
    const telefonoEmergencia = document.getElementById('editTelefonoEmergencia').value.trim();
    const direccion = document.getElementById('editDireccion').value.trim();
    const ciudad = document.getElementById('editCiudad').value.trim();

    // Validar campos requeridos
    if (!nombre || !correo) {
        mostrarAlerta('Por favor completa los campos requeridos', 'warning');
        return;
    }

    // Validar formato de correo
    if (!validarCorreo(correo)) {
        mostrarAlerta('Por favor ingresa un correo válido', 'warning');
        return;
    }

    // Validar cambio de contraseña (solo si se llenó algún campo)
    const pwActual = document.getElementById('editContrasenaActual') ? document.getElementById('editContrasenaActual').value : '';
    const pwNueva = document.getElementById('editContrasenaNueva') ? document.getElementById('editContrasenaNueva').value : '';
    const pwConfirmar = document.getElementById('editContrasenaConfirmar') ? document.getElementById('editContrasenaConfirmar').value : '';

    if (pwNueva || pwConfirmar || pwActual) {
        if (!pwActual) {
            mostrarAlerta('Ingresa tu contraseña actual para cambiarla', 'warning');
            return;
        }
        if (pwNueva.length < 6) {
            mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }
        if (pwNueva !== pwConfirmar) {
            mostrarAlerta('Las contraseñas nuevas no coinciden', 'warning');
            return;
        }
        // Guardar nueva contraseña
        sessionStorage.setItem('contrasenaUsuario', pwNueva);
        console.log('Contraseña actualizada');
    }

    // Guardar en sessionStorage
    sessionStorage.setItem('usuarioActual', nombre);
    sessionStorage.setItem('nombreUsuario', nombre);
    sessionStorage.setItem('correoUsuario', correo);
    sessionStorage.setItem('telefonoUsuario', telefono);
    if (matricula) sessionStorage.setItem('numeroControl', matricula);
    sessionStorage.setItem('carreraUsuario', carrera);
    sessionStorage.setItem('semestreUsuario', semestre);
    sessionStorage.setItem('telefonoEmergencia', telefonoEmergencia);
    sessionStorage.setItem('direccionUsuario', direccion);
    sessionStorage.setItem('ciudadUsuario', ciudad);

    // Persistir nombre y correo en localStorage para que sobrevivan entre páginas
    localStorage.setItem('nombreUsuarioActual', nombre);
    localStorage.setItem('correoUsuarioActual', correo);

    console.log('Cambios guardados:', { nombre, correo, carrera, semestre });

    // Mostrar mensaje de éxito
    mostrarAlerta('¡Perfil actualizado correctamente!', 'success');

    // Redirigir al perfil después de 1.5 segundos
    setTimeout(function() {
        window.location.href = 'perfil-alumno.html';
    }, 1500);
}

// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {
    if (confirm('¿Deseas cerrar sesión?')) {
        sessionStorage.clear();
        localStorage.removeItem('recordarAlumno');
        window.location.href = '../index.html';
    }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.insertBefore(alertDiv, document.body.firstChild);

    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

    setTimeout(function() {
        alertDiv.remove();
    }, 5000);
}

// ========================================
// FUNCIONES DE DEPURACIÓN
// ========================================

window.verDatosEdicion = function() {
    console.log('=== DATOS DE EDICIÓN ===');
    console.log('Nombre:', document.getElementById('editNombre').value);
    console.log('Correo:', document.getElementById('editCorreo').value);
    console.log('Carrera:', document.getElementById('editCarrera').value);
    console.log('Semestre:', document.getElementById('editSemestre').value);
    console.log('=======================');
};

console.log('Escribe verDatosEdicion() para ver los datos');