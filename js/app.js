// Elementos del DOM actualizados
const authScreen = document.getElementById('auth-screen');
const loginBox = document.getElementById('login-box');
const registroBox = document.getElementById('registro-box');
const appDashboard = document.getElementById('app-dashboard');
const btnLogout = document.getElementById('btn-logout');
const btnResetAdmin = document.getElementById('btn-reset-admin'); // <-- Selector movido arriba

// Enlaces para cambiar de vista
const linkIrRegistro = document.getElementById('link-ir-registro');
const linkIrLogin = document.getElementById('link-ir-login');

// Instancia de Auth
const auth = firebase.auth();
let usuarioLogueado = null;

// --- ALTERNAR VISTAS LOGIN/REGISTRO ---
linkIrRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    registroBox.style.display = 'block';
});

linkIrLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registroBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// --- EL VIGILANTE ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Extraemos el nombre que guardamos en su perfil de Google/Firebase
        const nombrePerfil = user.displayName || "Analista";
        usuarioLogueado = await Usuario.cargarDesdeNube(user.uid, user.email, nombrePerfil);

        authScreen.style.display = 'none';
        appDashboard.style.display = 'block';

        console.log(`Bienvenido, ${usuarioLogueado.nombre}`);

        // <-- AQUÍ VALIDAMOS AL ADMIN (Porque aquí ya sabemos con certeza quién entró) -->
        if (user.email === 'josealberto.fb15@gmail.com') {
            btnResetAdmin.style.display = 'block';
        }
    } else {
        usuarioLogueado = null;
        authScreen.style.display = 'flex';
        loginBox.style.display = 'block';
        registroBox.style.display = 'none';
        appDashboard.style.display = 'none';
        btnResetAdmin.style.display = 'none'; // Ocultamos el botón si cierran sesión
    }
});

// --- EVENTO DEL BOTÓN ADMIN ---
btnResetAdmin.addEventListener('click', async () => {
    if (confirm("¿Seguro que quieres reiniciar tu progreso a 0% para hacer pruebas?")) {
        usuarioLogueado.progresoCapacitacion = 0;
        await usuarioLogueado.guardarEnNube();
        window.location.reload();
    }
});

// --- BOTÓN INICIAR SESIÓN ---
document.getElementById('btn-ingresar').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const msjError = document.getElementById('error-login');

    msjError.style.display = 'none';

    if (email === "" || pass === "") {
        msjError.textContent = "Ingresa tu correo y contraseña.";
        msjError.style.display = 'block';
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
        .catch(error => {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                msjError.textContent = "Correo o contraseña incorrectos.";
            } else {
                msjError.textContent = "Hubo un error al ingresar. Intenta más tarde.";
            }
            msjError.style.display = 'block';
        });
});

// --- BOTÓN CREAR CUENTA ---
document.getElementById('btn-registrar').addEventListener('click', async () => {
    const nombre = document.getElementById('reg-usuario').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const msjError = document.getElementById('error-registro');

    msjError.style.display = 'none';

    if (nombre === "" || email === "" || pass === "") {
        msjError.textContent = "Por favor llena todos los campos.";
        msjError.style.display = 'block';
        return;
    }

    try {
        const credencial = await auth.createUserWithEmailAndPassword(email, pass);
        await credencial.user.updateProfile({ displayName: nombre });
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            msjError.textContent = "Este correo ya está registrado en el sistema.";
        } else if (error.code === 'auth/weak-password') {
            msjError.textContent = "La contraseña debe tener al menos 6 caracteres.";
        } else if (error.code === 'auth/invalid-email') {
            msjError.textContent = "El formato del correo no es válido.";
        } else {
            msjError.textContent = "Error al crear la cuenta. Revisa los datos.";
        }
        msjError.style.display = 'block';
    }
});

// --- BOTÓN CERRAR SESIÓN ---
btnLogout.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.reload();
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});


// --- LÓGICA DE LAS TARJETAS (HERRAMIENTAS) ---
const gridTarjetas = document.querySelector('.tools-grid');
const welcomeSection = document.querySelector('.welcome-section');

// Capacitación
const tarjetaCapacitacion = document.getElementById('card-capacitacion');
const seccionCurso = document.getElementById('modulo-curso');
const btnCerrarCurso = document.getElementById('btn-cerrar-curso');
let gestor = null;

tarjetaCapacitacion.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    welcomeSection.style.display = 'none';
    seccionCurso.style.display = 'block';

    if (!gestor) gestor = new GestorCurso();
    gestor.actualizarInterfazProgreso();
});

btnCerrarCurso.addEventListener('click', () => {
    seccionCurso.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    welcomeSection.style.display = 'block';
});

// Calculadora
const tarjetaCalculadora = document.getElementById('card-calculadora');
const seccionCalculadora = document.getElementById('modulo-calculadora');
const btnCerrarCalculadora = document.getElementById('btn-cerrar-calculadora');
let calculadoraInstancia = null;

tarjetaCalculadora.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    welcomeSection.style.display = 'none';
    seccionCalculadora.style.display = 'block';

    if (!calculadoraInstancia) calculadoraInstancia = new CalculadoraTiempos();
});

btnCerrarCalculadora.addEventListener('click', () => {
    seccionCalculadora.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    welcomeSection.style.display = 'block';
});

// Buscador de Paquetes
const tarjetaPaquetes = document.getElementById('card-paquetes');
const seccionPaquetes = document.getElementById('modulo-paquetes');
const btnCerrarPaquetes = document.getElementById('btn-cerrar-paquetes');
let buscadorInstancia = null;

tarjetaPaquetes.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    welcomeSection.style.display = 'none';
    seccionPaquetes.style.display = 'block';

    if (!buscadorInstancia) buscadorInstancia = new BuscadorPaquetes();
});

btnCerrarPaquetes.addEventListener('click', () => {
    seccionPaquetes.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    welcomeSection.style.display = 'block';
});

// Aclaraciones
const tarjetaAclaraciones = document.getElementById('card-aclaraciones');
const seccionAclaraciones = document.getElementById('modulo-aclaraciones');
const btnCerrarAclaraciones = document.getElementById('btn-cerrar-aclaraciones');
let aclaracionesInstancia = null;

tarjetaAclaraciones.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    welcomeSection.style.display = 'none';
    seccionAclaraciones.style.display = 'block';

    if (!aclaracionesInstancia) aclaracionesInstancia = new GestorAclaraciones();
});

btnCerrarAclaraciones.addEventListener('click', () => {
    seccionAclaraciones.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    welcomeSection.style.display = 'block';
});