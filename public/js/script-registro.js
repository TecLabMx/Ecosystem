// ========================================
// CONOCE-TEC — Registro conectado a API
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('CONOCE-TEC Registro — Sistema Iniciado');

    // ── Elementos del formulario ─────────────────────────────
    const inputNombre         = document.getElementById('nombreCompleto');
    const inputCorreo         = document.getElementById('correo');
    const inputNumeroControl  = document.getElementById('numeroControl');
    const inputCarrera        = document.getElementById('carrera');
    const inputSemestre       = document.getElementById('semestre');
    const inputTelefono       = document.getElementById('telefono');
    const inputContrasena     = document.getElementById('contrasena');
    const inputConfirmacion   = document.getElementById('confirmarContrasena');
    const checkboxRecordar    = document.getElementById('recordarme');
    const checkboxTerminos    = document.getElementById('terminos');
    const btnCrearCuenta      = document.getElementById('btnCrearCuenta');
    const formRegistro        = document.getElementById('formRegistro');

    if (!btnCrearCuenta || !formRegistro) return;

    // Prevenir envío nativo del form (tipo submit)
    formRegistro.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) procesarRegistro();
    });

    // ── Envío con click directo también ─────────────────────
    btnCrearCuenta.addEventListener('click', function(e) {
        e.preventDefault();
        if (validarFormulario()) procesarRegistro();
    });

    // ========================================
    // VALIDACIONES EN TIEMPO REAL
    // ========================================
    if (inputNombre)        inputNombre.addEventListener('input',  () => validarCampo(inputNombre, 'errorNombre', v => v.length >= 3, 'Mínimo 3 caracteres'));
    if (inputCorreo)        inputCorreo.addEventListener('input',  () => validarCampo(inputCorreo, 'errorCorreo', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido'));
    if (inputNumeroControl) inputNumeroControl.addEventListener('input', () => validarCampo(inputNumeroControl, 'errorNumeroControl', v => v.length >= 5, 'Número de control inválido'));
    if (inputContrasena)    inputContrasena.addEventListener('input', () => {
        validarCampo(inputContrasena, 'errorContrasena', v => v.length >= 8, 'Mínimo 8 caracteres');
        if (inputConfirmacion && inputConfirmacion.value)
            validarCampo(inputConfirmacion, 'errorConfirmarContrasena', v => v === inputContrasena.value, 'Las contraseñas no coinciden');
    });
    if (inputConfirmacion)  inputConfirmacion.addEventListener('input', () =>
        validarCampo(inputConfirmacion, 'errorConfirmarContrasena', v => v === (inputContrasena ? inputContrasena.value : ''), 'Las contraseñas no coinciden')
    );

    function validarCampo(input, errorId, testFn, msg) {
        const group = input.closest('.input-group') || input.parentElement;
        const errorEl = document.getElementById(errorId);
        const valid = testFn(input.value.trim());
        if (group) { group.classList.toggle('error', !valid); group.classList.toggle('success', valid); }
        if (errorEl) { errorEl.textContent = valid ? '' : msg; errorEl.classList.toggle('show', !valid); }
        return valid;
    }

    // ========================================
    // VALIDACIÓN COMPLETA
    // ========================================
    function validarFormulario() {
        const checks = [
            inputNombre       ? validarCampo(inputNombre,        'errorNombre',        v => v.length >= 3,  'Mínimo 3 caracteres') : true,
            inputCorreo       ? validarCampo(inputCorreo,        'errorCorreo',        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido') : true,
            inputNumeroControl? validarCampo(inputNumeroControl, 'errorNumeroControl', v => v.length >= 5,  'Número de control inválido') : true,
            inputContrasena   ? validarCampo(inputContrasena,    'errorContrasena',    v => v.length >= 8,  'Mínimo 8 caracteres') : true,
            inputConfirmacion ? validarCampo(inputConfirmacion,  'errorConfirmarContrasena',  v => v === (inputContrasena ? inputContrasena.value : ''), 'Las contraseñas no coinciden') : true,
        ];

        if (checkboxTerminos && !checkboxTerminos.checked) {
            mostrarAlerta('Debes aceptar los términos y condiciones', 'warning');
            return false;
        }
        return checks.every(Boolean);
    }

    // ========================================
    // PROCESAMIENTO — llama a /api/auth/register
    // ========================================
    async function procesarRegistro() {
        const nombre        = inputNombre        ? inputNombre.value.trim()        : '';
        const correo        = inputCorreo        ? inputCorreo.value.trim()        : '';
        const numeroControl = inputNumeroControl ? inputNumeroControl.value.trim() : '';
        const carrera       = inputCarrera       ? inputCarrera.value.trim()       : '';
        const semestre      = inputSemestre      ? parseInt(inputSemestre.value)   : null;
        const telefono      = inputTelefono      ? inputTelefono.value.trim()      : '';
        const password      = inputContrasena    ? inputContrasena.value           : '';

        btnCrearCuenta.disabled = true;
        btnCrearCuenta.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    email:          correo,
                    password,
                    numero_control: numeroControl || null,
                    carrera:        carrera || null,
                    semestre:       semestre || null,
                    telefono:       telefono || null,
                    role:           'estudiante'
                })
            });
            const data = await res.json();

            if (!res.ok) {
                mostrarAlerta(data.message || 'Error al crear la cuenta', 'danger');
                btnCrearCuenta.disabled = false;
                btnCrearCuenta.innerHTML = 'Crear Cuenta';
                return;
            }

            // Guardar sesión con el JWT recibido
            sessionStorage.setItem('ct_token',     data.token);
            sessionStorage.setItem('ct_user_id',   data.user.id);
            sessionStorage.setItem('ct_nombre',    data.user.nombre);
            sessionStorage.setItem('ct_email',     data.user.email);
            sessionStorage.setItem('ct_rol',       data.user.role || 'estudiante');
            sessionStorage.setItem('tipoUsuario',  'alumno');
            sessionStorage.setItem('rolUsuario',   'alumno');
            sessionStorage.setItem('usuarioActual',data.user.nombre);
            sessionStorage.setItem('nombreUsuario',data.user.nombre);
            sessionStorage.setItem('horaLogin',    new Date().toLocaleTimeString());

            mostrarAlerta('¡Cuenta creada exitosamente! Bienvenido ' + data.user.nombre, 'success');
            setTimeout(function() {
                window.location.href = 'dashboard-alumno.html';
            }, 1800);

        } catch (err) {
            console.error('Error registro:', err);
            mostrarAlerta('Error de conexión. Verifica que el servidor esté corriendo.', 'danger');
            btnCrearCuenta.disabled = false;
            btnCrearCuenta.innerHTML = 'Crear Cuenta';
        }
    }

    // ========================================
    // HELPERS UI
    // ========================================
    function mostrarAlerta(mensaje, tipo) {
        const div = document.createElement('div');
        div.className = `alert alert-${tipo} alert-dismissible fade show`;
        div.setAttribute('role', 'alert');
        div.innerHTML = mensaje + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
        Object.assign(div.style, { position:'fixed', top:'20px', right:'20px', zIndex:'9999', maxWidth:'400px', boxShadow:'0 4px 12px rgba(0,0,0,0.15)' });
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    // Mostrar/ocultar contraseña
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const input = document.getElementById(this.getAttribute('data-target'));
            const icon  = this.querySelector('i');
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
            } else {
                input.type = 'password';
                if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
            }
        });
    });
});
