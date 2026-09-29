// 1. Inicializar Firebase con tus credenciales
const firebaseConfig = {
    apiKey: "AIzaSyB3Wp0-T8GTI_iHBZcEJsomtDHtg6z1Aps",
    authDomain: "analista-definitivo.firebaseapp.com",
    projectId: "analista-definitivo",
    storageBucket: "analista-definitivo.firebasestorage.app",
    messagingSenderId: "1030303777819",
    appId: "1:1030303777819:web:e1b0505feac89a1c9164be",
    measurementId: "G-V5W6FYS16D"
};

// Arrancamos los motores de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. Nuestra Clase Usuario adaptada a la Nube
class Usuario {
    constructor(uid, email, progreso = 0) {
        this.uid = uid; // El ID único que Firebase le da a cada cuenta
        this.email = email;
        this.progresoCapacitacion = progreso;
    }

    // Guardar o actualizar en Firestore
    async guardarEnNube() {
        try {
            await db.collection("usuarios").doc(this.uid).set({
                email: this.email,
                progresoCapacitacion: this.progresoCapacitacion
            });
        } catch (error) {
            console.error("Error guardando progreso en Firestore:", error);
        }
    }

    // Avanzar progreso y sincronizar automáticamente
    async avanzarProgreso(porcentaje) {
        this.progresoCapacitacion += porcentaje;
        if (this.progresoCapacitacion > 100) this.progresoCapacitacion = 100;

        await this.guardarEnNube();
        console.log(`¡Nube sincronizada! Progreso actual: ${this.progresoCapacitacion}%`);
    }

    // Función estática para descargar los datos al iniciar sesión
    static async cargarDesdeNube(uid, email) {
        const docRef = await db.collection("usuarios").doc(uid).get();

        if (docRef.exists) {
            // Si el usuario ya existe, cargamos su progreso
            const data = docRef.data();
            return new Usuario(uid, email, data.progresoCapacitacion);
        } else {
            // Si es un usuario recién registrado, creamos su registro en 0%
            const nuevoUser = new Usuario(uid, email, 0);
            await nuevoUser.guardarEnNube();
            return nuevoUser;
        }
    }
}