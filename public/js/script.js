// ========================================
// CONOCE-TEC — Login conectado a API
// ========================================

// ── Helper: guardar token JWT en sessionStorage ──────────────
function guardarSesion(token, user, tipo) {
  sessionStorage.setItem("ct_token", token);
  sessionStorage.setItem("ct_user_id", user.id);
  sessionStorage.setItem("ct_nombre", user.nombre);
  sessionStorage.setItem("ct_email", user.email);
  sessionStorage.setItem("ct_rol", user.role || tipo);
  sessionStorage.setItem("tipoUsuario", tipo);
  sessionStorage.setItem("rolUsuario", user.role || tipo);
  sessionStorage.setItem("usuarioActual", user.nombre);
  sessionStorage.setItem("nombreUsuario", user.nombre);
  sessionStorage.setItem("horaLogin", new Date().toLocaleTimeString());
}

// ── Helper: obtener token para fetch autenticados ────────────
window.getAuthToken = function () {
  return sessionStorage.getItem("ct_token");
};

window.authHeaders = function () {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + sessionStorage.getItem("ct_token"),
  };
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("CONOCE-TEC Login — Sistema Iniciado");

  const btnAlumno = document.getElementById("btnAlumno");
  const btnVisitante = document.getElementById("btnVisitante");
  const btnConfirmarAlumno = document.getElementById("btnConfirmarAlumno");
  const btnConfirmarVisitante = document.getElementById(
    "btnConfirmarVisitante",
  );
  const formAlumno = document.getElementById("formAlumno");
  const formVisitante = document.getElementById("formVisitante");
  const modalAlumno = new bootstrap.Modal(
    document.getElementById("modalAlumno"),
  );
  const modalVisitante = new bootstrap.Modal(
    document.getElementById("modalVisitante"),
  );

  // ── Abrir modales ────────────────────────────────────────
  btnAlumno.addEventListener("click", function () {
    modalAlumno.show();
    formAlumno.reset();
    document.getElementById("usuarioAlumno").focus();
  });

  btnVisitante.addEventListener("click", function () {
    modalVisitante.show();
    formVisitante.reset();
    document.getElementById("nombreVisitante").focus();
  });

  // ── Enter en formularios ─────────────────────────────────
  formAlumno.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      btnConfirmarAlumno.click();
    }
  });
  formVisitante.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      btnConfirmarVisitante.click();
    }
  });

  // ── Confirmar alumno ─────────────────────────────────────
  btnConfirmarAlumno.addEventListener("click", function () {
    if (validarFormularioAlumno()) procesarLoginAlumno();
  });

  // ── Confirmar visitante ──────────────────────────────────
  btnConfirmarVisitante.addEventListener("click", function () {
    if (validarFormularioVisitante()) procesarLoginVisitante();
  });

  // ========================================
  // VALIDACIONES
  // ========================================
  function validarFormularioAlumno() {
    const usuario = document.getElementById("usuarioAlumno").value.trim();
    const password = document.getElementById("passwordAlumno").value.trim();
    if (!usuario) {
      mostrarAlerta("Ingresa tu correo o número de control", "warning");
      return false;
    }
    if (password.length < 6) {
      mostrarAlerta(
        "La contraseña debe tener al menos 6 caracteres",
        "warning",
      );
      return false;
    }
    return true;
  }

  function validarFormularioVisitante() {
    const nombre = document.getElementById("nombreVisitante").value.trim();
    const email = document.getElementById("emailVisitante").value.trim();
    const motivo = document.getElementById("motivoVisitante").value;
    if (!nombre) {
      mostrarAlerta("Ingresa tu nombre completo", "warning");
      return false;
    }
    if (!validarEmail(email)) {
      mostrarAlerta("Correo electrónico inválido", "warning");
      return false;
    }
    if (!motivo) {
      mostrarAlerta("Selecciona un motivo de visita", "warning");
      return false;
    }
    return true;
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ========================================
  // LOGIN ALUMNO — llama a /api/auth/login
  // ========================================
  async function procesarLoginAlumno() {
    const usuario = document.getElementById("usuarioAlumno").value.trim();
    const password = document.getElementById("passwordAlumno").value.trim();
    const recordar = document.getElementById("recordarAlumno")
      ? document.getElementById("recordarAlumno").checked
      : false;

    btnConfirmarAlumno.disabled = true;
    btnConfirmarAlumno.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        mostrarAlerta(data.message || "Credenciales inválidas", "danger");
        btnConfirmarAlumno.disabled = false;
        btnConfirmarAlumno.innerHTML = "Ingresar";
        return;
      }

      // Guardar sesión con JWT
      guardarSesion(data.token, data.user, "alumno");

      // "Recuérdame" — solo guarda el email (nunca la contraseña)
      if (recordar) {
        localStorage.setItem("ct_remember_email", usuario);
      } else {
        localStorage.removeItem("ct_remember_email");
      }

      mostrarAlerta("¡Bienvenido " + data.user.nombre + "!", "success");
      setTimeout(function () {
        modalAlumno.hide();
        window.location.href = "pages/dashboard-alumno.html";
      }, 1200);
    } catch (err) {
      console.error("Error login:", err);
      mostrarAlerta(
        "Error de conexión. Verifica que el servidor esté corriendo.",
        "danger",
      );
      btnConfirmarAlumno.disabled = false;
      btnConfirmarAlumno.innerHTML = "Ingresar";
    }
  }

  // ── Prellenar email si "Recuérdame" estaba activo ────────
  const emailGuardado = localStorage.getItem("ct_remember_email");
  if (emailGuardado) {
    const inputUsuario = document.getElementById("usuarioAlumno");
    if (inputUsuario) {
      inputUsuario.value = emailGuardado;
      if (document.getElementById("recordarAlumno"))
        document.getElementById("recordarAlumno").checked = true;
    }
  }

  // ========================================
  // LOGIN VISITANTE — sesión sin cuenta
  // ========================================
  function procesarLoginVisitante() {
    const nombre = document.getElementById("nombreVisitante").value.trim();
    const email = document.getElementById("emailVisitante").value.trim();
    const motivo = document.getElementById("motivoVisitante").value;

    btnConfirmarVisitante.disabled = true;
    btnConfirmarVisitante.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

    // El visitante no tiene cuenta — solo guardamos sesión local
    sessionStorage.setItem("tipoUsuario", "visitante");
    sessionStorage.setItem("rolUsuario", "visitante");
    sessionStorage.setItem("ct_rol", "visitante");
    sessionStorage.setItem("nombreVisitante", nombre);
    sessionStorage.setItem("ct_nombre", nombre);
    sessionStorage.setItem("emailVisitante", email);
    sessionStorage.setItem("motivoVisita", motivo);
    sessionStorage.setItem("horaLogin", new Date().toLocaleTimeString());

    mostrarAlerta("¡Bienvenido " + nombre + "!", "success");
    setTimeout(function () {
      modalVisitante.hide();
      btnConfirmarVisitante.disabled = false;
      btnConfirmarVisitante.innerHTML = "Continuar";
      window.location.href = "pages/dashboard-visitante.html";
    }, 1200);
  }

  // ========================================
  // ADMIN — login hardcodeado (sin BD)
  // ========================================
  const ADMIN_USUARIO = "admin";
  const ADMIN_PASSWORD = "conocetec2024";

  const btnAdmin = document.getElementById("btnAdmin");
  const btnConfirmarAdmin = document.getElementById("btnConfirmarAdmin");

  if (btnAdmin) {
    btnAdmin.addEventListener("click", function () {
      const el = document.getElementById("modalAdmin");
      if (el) new bootstrap.Modal(el).show();
    });
  }

  if (btnConfirmarAdmin) {
    btnConfirmarAdmin.addEventListener("click", function () {
      const usuario = document.getElementById("usuarioAdmin").value.trim();
      const password = document.getElementById("passwordAdmin").value.trim();
      const errDiv = document.getElementById("adminLoginError");

      if (usuario === ADMIN_USUARIO && password === ADMIN_PASSWORD) {
        errDiv.style.display = "none";
        sessionStorage.setItem("tipoUsuario", "alumno");
        sessionStorage.setItem("rolUsuario", "admin");
        sessionStorage.setItem("ct_rol", "admin");
        sessionStorage.setItem("usuarioActual", "Administrador");
        sessionStorage.setItem("nombreUsuario", "Administrador");
        sessionStorage.setItem("ct_nombre", "Administrador");
        sessionStorage.setItem("horaLogin", new Date().toLocaleTimeString());

        const m = bootstrap.Modal.getInstance(
          document.getElementById("modalAdmin"),
        );
        if (m) m.hide();
        mostrarAlerta("¡Bienvenido, Administrador!", "success");
        setTimeout(() => {
          window.location.href = "pages/dashboard-alumno.html";
        }, 1200);
      } else {
        errDiv.style.display = "block";
        document.getElementById("passwordAdmin").value = "";
        document.getElementById("passwordAdmin").focus();
      }
    });
  }

  // ========================================
  // HELPERS UI
  // ========================================
  function mostrarAlerta(mensaje, tipo) {
    const div = document.createElement("div");
    div.className = `alert alert-${tipo} alert-dismissible fade show`;
    div.setAttribute("role", "alert");
    div.innerHTML =
      mensaje +
      '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    Object.assign(div.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "9999",
      maxWidth: "400px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    });
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  configurarMostrarOcultarContrasena();

  function configurarMostrarOcultarContrasena() {
    document.querySelectorAll(".toggle-password").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const input = document.getElementById(this.getAttribute("data-target"));
        const icon = this.querySelector("i");
        if (input.type === "password") {
          input.type = "text";
          if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
          }
        } else {
          input.type = "password";
          if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
          }
        }
      });
    });
  }

  // Efectos hover en botones
  document.querySelectorAll(".btn-login").forEach((boton) => {
    boton.addEventListener("mousedown", function () {
      this.style.transform = "scale(0.97)";
    });
    boton.addEventListener("mouseup", function () {
      this.style.transform = "";
    });
    boton.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  });

  // Debug helpers
  window.verSesion = function () {
    console.log("TOKEN:", sessionStorage.getItem("ct_token"));
  };
  window.limpiarSesion = function () {
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
  };
  console.log("Escribe verSesion() para ver el token de sesión.");
});
