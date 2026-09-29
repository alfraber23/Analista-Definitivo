// 1. Nuestra Clase Usuario
class Usuario {
    constructor(nombre, progreso = 0) {
        this.nombre = nombre;
        this.progresoCapacitacion = progreso; // Si no le pasamos progreso, inicia en 0
    }

    // Método para guardar/actualizar en el navegador (¡Aquí usamos JSON!)
    guardarEnLocal() {
        localStorage.setItem('usuarioActual', JSON.stringify(this));
    }

    // Método de ejemplo para simular que avanzó en un curso
    avanzarProgreso(porcentaje) {
        this.progresoCapacitacion += porcentaje;
        if (this.progresoCapacitacion > 100) this.progresoCapacitacion = 100;
        this.guardarEnLocal(); // Guardamos el nuevo progreso automáticamente
        console.log(`Progreso actualizado: ${this.progresoCapacitacion}%`);
    }
}