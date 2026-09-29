class GestorCurso {
    constructor() {
        this.barraLlenado = document.getElementById('barra-llenado');
        this.textoProgreso = document.getElementById('texto-progreso');
        this.btnCompletar = document.getElementById('btn-completar-leccion');
        this.tituloLeccion = document.getElementById('titulo-leccion');
        this.cuerpoLeccion = document.getElementById('cuerpo-leccion');
        this.listaModulosMenu = document.querySelectorAll('.modulo-item');

        this.indiceLeccionActual = 0;
        this.moduloActualId = 'sap_hana';
        this.leccionesActuales = [];
        this.bdModulos = null; // Aquí guardaremos todo el JSON

        this.inicializarEventos();
        this.cargarContenido(); // Disparamos el fetch al iniciar
    }

    async cargarContenido() {
        try {
            const respuesta = await fetch('data/modulos.json');
            this.bdModulos = await respuesta.json();

            // Una vez cargado, configuramos el primer módulo
            this.leccionesActuales = this.bdModulos[this.moduloActualId].lecciones;
            this.mostrarLeccion(this.indiceLeccionActual);
            this.actualizarInterfazProgreso();
        } catch (error) {
            console.error("Error al cargar modulos.json:", error);
            this.cuerpoLeccion.innerHTML = "<p>⚠️ Error de carga. Verifica que Live Server esté activo.</p>";
        }
    }

    inicializarEventos() {
        this.btnCompletar.addEventListener('click', () => this.completarLeccionActual());
        this.listaModulosMenu.forEach(item => {
            item.addEventListener('click', (e) => this.cambiarModulo(e.currentTarget));
        });
    }

    cambiarModulo(elementoClickeado) {
        if (!this.bdModulos) return; // Evita errores si el JSON aún no carga

        this.listaModulosMenu.forEach(item => item.classList.remove('activo'));
        elementoClickeado.classList.add('activo');

        const nuevoModuloId = elementoClickeado.getAttribute('data-id');

        if (this.bdModulos[nuevoModuloId]) {
            this.moduloActualId = nuevoModuloId;
            this.leccionesActuales = this.bdModulos[this.moduloActualId].lecciones;
            this.indiceLeccionActual = 0;
            this.mostrarLeccion(this.indiceLeccionActual);
        } else {
            this.tituloLeccion.textContent = "Próximamente...";
            this.cuerpoLeccion.innerHTML = "<p>Estamos trabajando en la redacción de este módulo. ¡Vuelve pronto!</p>";
            this.btnCompletar.style.display = 'none';
        }
    }

    mostrarLeccion(indice) {
        this.btnCompletar.style.display = 'block';

        if (indice < this.leccionesActuales.length) {
            const leccion = this.leccionesActuales[indice];
            this.tituloLeccion.textContent = leccion.subtitulo;

            this.cuerpoLeccion.innerHTML = `
                ${leccion.texto}
                <div style="background: var(--bg-main); padding: 20px; text-align: center; border: 2px dashed var(--text-secondary); margin-top: 15px; border-radius: 5px;">
                    <em>📷 ${leccion.imagen_placeholder}</em>
                </div>
            `;

            this.btnCompletar.textContent = "Marcar como Completado y Avanzar";
            this.btnCompletar.disabled = false;
            this.btnCompletar.style.backgroundColor = "var(--accent)";
            this.btnCompletar.style.cursor = "pointer";
        } else {
            this.tituloLeccion.textContent = `¡${this.bdModulos[this.moduloActualId].titulo} Terminado!`;
            this.cuerpoLeccion.innerHTML = "<p>Has dominado esta sección. Selecciona el siguiente módulo en el menú lateral.</p>";

            this.btnCompletar.textContent = "Módulo Completado ✅";
            this.btnCompletar.disabled = true;
            this.btnCompletar.style.backgroundColor = "gray";
            this.btnCompletar.style.cursor = "not-allowed";
        }
    }

    actualizarInterfazProgreso() {
        const porcentaje = Math.round(usuarioLogueado.progresoCapacitacion);
        this.barraLlenado.style.width = `${porcentaje}%`;
        this.textoProgreso.textContent = `Progreso: ${porcentaje}%`;
    }

    completarLeccionActual() {
        if (this.indiceLeccionActual < this.leccionesActuales.length) {
            const porcentajePorLeccion = 20 / this.leccionesActuales.length;
            usuarioLogueado.avanzarProgreso(porcentajePorLeccion);
            this.actualizarInterfazProgreso();

            this.indiceLeccionActual++;
            this.mostrarLeccion(this.indiceLeccionActual);
        }
    }
}