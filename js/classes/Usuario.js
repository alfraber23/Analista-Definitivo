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
    // Agregamos "nombre" con un valor por defecto por si acaso
    constructor(uid, email, nombre = "Analista", progreso = 0) {
        this.uid = uid;
        this.email = email;
        this.nombre = nombre;
        this.progresoCapacitacion = progreso;
    }

    async guardarEnNube() {
        try {
            await db.collection("usuarios").doc(this.uid).set({
                email: this.email,
                nombre: this.nombre, // Guardamos el nombre en Firestore
                progresoCapacitacion: this.progresoCapacitacion
            });
        } catch (error) {
            console.error("Error guardando progreso en Firestore:", error);
        }
    }

    async avanzarProgreso(porcentaje) {
        this.progresoCapacitacion += porcentaje;
        if (this.progresoCapacitacion > 100) this.progresoCapacitacion = 100;

        await this.guardarEnNube();
        console.log(`¡Nube sincronizada! Progreso actual: ${this.progresoCapacitacion}%`);
    }

    // Le pasamos el nombre desde app.js cuando Firebase lo detecte
    static async cargarDesdeNube(uid, email, nombre) {
        const docRef = await db.collection("usuarios").doc(uid).get();

        if (docRef.exists) {
            const data = docRef.data();
            return new Usuario(uid, email, data.nombre, data.progresoCapacitacion);
        } else {
            const nuevoUser = new Usuario(uid, email, nombre, 0);
            await nuevoUser.guardarEnNube();
            return nuevoUser;
        }
    }
}