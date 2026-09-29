//Elementos del DOM
const loginScreen = document.getElementById('login-screen');
const appDashboard = document.getElementById('app-dashboard');
const inputUsuario = document.getElementById('input-usuario');
const btnIngresar = document.getElementById('btn-ingresar');

// Variable global para usar a nuestro usuario en toda la app
let usuarioLogueado = null;

//Función para revisar si ya estábamos logueados al abrir la página
function verificarSesion() {
    const datosGuardados = localStorage.getItem('usuarioActual');

    if (datosGuardados) {
        // Aquí convertimos el JSON que guardamos de regreso a un objeto útil
        const datosParseados = JSON.parse(datosGuardados);

        // Reconstruimos nuestro objeto de la clase Usuario
        usuarioLogueado = new Usuario(datosParseados.nombre, datosParseados.progresoCapacitacion);

        // Saltamos el login
        loginScreen.style.display = 'none';
        appDashboard.style.display = 'block';

        console.log(`¡Bienvenido de nuevo, ${usuarioLogueado.nombre}! Tu progreso guardado es ${usuarioLogueado.progresoCapacitacion}%`);
    }
}

//Lógica del botón Ingresar (para usuarios nuevos)
btnIngresar.addEventListener('click', () => {
    const nombre = inputUsuario.value.trim();

    if (nombre === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    // Creamos al usuario desde cero
    usuarioLogueado = new Usuario(nombre);
    usuarioLogueado.guardarEnLocal(); // Lo guardamos en JSON en el navegador

    loginScreen.style.display = 'none';
    appDashboard.style.display = 'block';

    console.log(`Usuario nuevo registrado: ${usuarioLogueado.nombre}`);
});

// Ejecutamos esta verificación apenas carga el script
verificarSesion();

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