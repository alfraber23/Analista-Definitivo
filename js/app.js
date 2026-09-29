// Elementos del Login
const loginScreen = document.getElementById('login-screen');
const appDashboard = document.getElementById('app-dashboard');
const inputEmail = document.getElementById('input-email');
const inputPassword = document.getElementById('input-password');
const btnIngresar = document.getElementById('btn-ingresar');
const btnRegistrar = document.getElementById('btn-registrar');
const btnLogout = document.getElementById('btn-logout');

// Instancia de Auth
const auth = firebase.auth();
let usuarioLogueado = null;

// EL VIGILANTE: Escucha si alguien inicia o cierra sesión en tiempo real
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Alguien inició sesión, descargamos sus datos de Firestore
        usuarioLogueado = await Usuario.cargarDesdeNube(user.uid, user.email);

        loginScreen.style.display = 'none';
        appDashboard.style.display = 'block';
        console.log(`Sesión activa: ${usuarioLogueado.email}`);
    } else {
        // No hay sesión activa, bloqueamos el acceso
        usuarioLogueado = null;
        loginScreen.style.display = 'flex';
        appDashboard.style.display = 'none';
    }
});

// Botón de Iniciar Sesión
btnIngresar.addEventListener('click', () => {
    const email = inputEmail.value.trim();
    const pass = inputPassword.value;
    auth.signInWithEmailAndPassword(email, pass)
        .catch(error => alert("Error al ingresar: " + error.message));
});

// Botón de Crear Cuenta
btnRegistrar.addEventListener('click', () => {
    const email = inputEmail.value.trim();
    const pass = inputPassword.value;
    auth.createUserWithEmailAndPassword(email, pass)
        .catch(error => alert("Error al registrar: " + error.message));
});

// Botón de Cerrar Sesión
btnLogout.addEventListener('click', () => {
    auth.signOut();
});

// ... aquí abajo dejas el resto de tu código de app.js (los clics de las tarjetas, etc.) ...

//Lógica para abrir el curso desde el Dashboard
const tarjetaCapacitacion = document.getElementById('card-capacitacion');
const gridTarjetas = document.querySelector('.tools-grid');
const seccionCurso = document.getElementById('modulo-curso');
const btnCerrarCurso = document.getElementById('btn-cerrar-curso');

let gestor = null;

tarjetaCapacitacion.addEventListener('click', () => {
    gridTarjetas.style.display = 'none'; // Ocultamos las tarjetas
    document.querySelector('.welcome-section').style.display = 'none';
    seccionCurso.style.display = 'block'; // Mostramos el curso

    // Instanciamos el gestor y actualizamos la barra con el progreso guardado
    if (!gestor) gestor = new GestorCurso();
    gestor.actualizarInterfazProgreso();
});

btnCerrarCurso.addEventListener('click', () => {
    seccionCurso.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    document.querySelector('.welcome-section').style.display = 'block';
});

// Agrega esto en tu app.js, debajo de donde declaraste la lógica del curso

const tarjetaCalculadora = document.getElementById('card-calculadora');
const seccionCalculadora = document.getElementById('modulo-calculadora');
const btnCerrarCalculadora = document.getElementById('btn-cerrar-calculadora');

let calculadoraInstancia = null;

// Abrir Calculadora
tarjetaCalculadora.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    document.querySelector('.welcome-section').style.display = 'none';
    seccionCalculadora.style.display = 'block';

    if (!calculadoraInstancia) {
        calculadoraInstancia = new CalculadoraTiempos();
    }
});

// Cerrar Calculadora y volver al inicio
btnCerrarCalculadora.addEventListener('click', () => {
    seccionCalculadora.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    document.querySelector('.welcome-section').style.display = 'block';
});

const tarjetaPaquetes = document.getElementById('card-paquetes');
const seccionPaquetes = document.getElementById('modulo-paquetes');
const btnCerrarPaquetes = document.getElementById('btn-cerrar-paquetes');
let buscadorInstancia = null;

tarjetaPaquetes.addEventListener('click', () => {
    gridTarjetas.style.display = 'none';
    document.querySelector('.welcome-section').style.display = 'none';
    seccionPaquetes.style.display = 'block';

    if (!buscadorInstancia) buscadorInstancia = new BuscadorPaquetes();
});

btnCerrarPaquetes.addEventListener('click', () => {
    seccionPaquetes.style.display = 'none';
    gridTarjetas.style.display = 'grid';
    document.querySelector('.welcome-section').style.display = 'block';
});