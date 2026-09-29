class GestorCurso {
    constructor() {
        this.barraLlenado = document.getElementById('barra-llenado');
        this.textoProgreso = document.getElementById('texto-progreso');

        // Botones de navegación
        this.btnAnterior = document.getElementById('btn-leccion-anterior');
        this.btnSiguiente = document.getElementById('btn-leccion-siguiente');
        this.btnCompletar = document.getElementById('btn-completar-leccion');

        this.tituloLeccion = document.getElementById('titulo-leccion');
        this.cuerpoLeccion = document.getElementById('cuerpo-leccion');
        this.listaModulosMenu = document.querySelectorAll('.modulo-item');

        this.moduloActualId = 'sap_hana';
        this.leccionesActuales = [];
        this.bdModulos = null;

        // Separamos el progreso real de lo que estás viendo
        this.indiceProgreso = 0;
        this.indiceVista = 0;

        this.inicializarEventos();
        this.cargarContenido();
    }

    async cargarContenido() {
        try {
            const respuesta = await fetch('data/modulos.json');
            this.bdModulos = await respuesta.json();

            this.leccionesActuales = this.bdModulos[this.moduloActualId].lecciones;
            this.sincronizarLeccionConProgreso();
            this.actualizarInterfazProgreso();
        } catch (error) {
            console.error("Error al cargar modulos.json:", error);
            this.cuerpoLeccion.innerHTML = "<p>⚠️ Error de carga. Verifica que Live Server esté activo.</p>";
        }
    }

    sincronizarLeccionConProgreso() {
        const porcLeccion = 20 / this.leccionesActuales.length;
        // Calculamos hasta qué lección tiene permiso de estar
        this.indiceProgreso = Math.floor(usuarioLogueado.progresoCapacitacion / porcLeccion);

        // El usuario arranca viendo la lección en la que se quedó
        this.indiceVista = this.indiceProgreso;

        // Si ya completó el módulo, le mostramos la última lección para que no vea pantalla rota
        if (this.indiceVista >= this.leccionesActuales.length) {
            this.indiceVista = this.leccionesActuales.length - 1;
        }

        this.mostrarLeccion(this.indiceVista);
    }

    inicializarEventos() {
        this.btnCompletar.addEventListener('click', () => this.completarLeccionActual());

        this.btnAnterior.addEventListener('click', () => {
            if (this.indiceVista > 0) {
                this.indiceVista--;
                this.mostrarLeccion(this.indiceVista);
            }
        });

        this.btnSiguiente.addEventListener('click', () => {
            if (this.indiceVista < this.indiceProgreso && this.indiceVista < this.leccionesActuales.length - 1) {
                this.indiceVista++;
                this.mostrarLeccion(this.indiceVista);
            }
        });

        this.listaModulosMenu.forEach(item => {
            item.addEventListener('click', (e) => this.cambiarModulo(e.currentTarget));
        });
    }

    cambiarModulo(elementoClickeado) {
        if (!this.bdModulos) return;

        this.listaModulosMenu.forEach(item => item.classList.remove('activo'));
        elementoClickeado.classList.add('activo');

        const nuevoModuloId = elementoClickeado.getAttribute('data-id');

        if (this.bdModulos[nuevoModuloId]) {
            this.moduloActualId = nuevoModuloId;
            this.leccionesActuales = this.bdModulos[this.moduloActualId].lecciones;
            this.sincronizarLeccionConProgreso();
        } else {
            this.tituloLeccion.textContent = "Próximamente...";
            this.cuerpoLeccion.innerHTML = "<p>Estamos trabajando en la redacción de este módulo.</p>";
            this.btnCompletar.style.display = 'none';
            this.btnAnterior.style.display = 'none';
            this.btnSiguiente.style.display = 'none';
        }
    }

    mostrarLeccion(indice) {
        // Aseguramos que los botones existan
        this.btnCompletar.style.display = 'block';
        this.btnAnterior.style.display = 'block';
        this.btnSiguiente.style.display = 'block';

        const leccion = this.leccionesActuales[indice];
        this.tituloLeccion.textContent = leccion.subtitulo;

        this.cuerpoLeccion.innerHTML = `
            ${leccion.texto}
            <div style="background: var(--bg-main); padding: 20px; text-align: center; border: 2px dashed var(--text-secondary); margin-top: 15px; border-radius: 5px;">
                <em>📷 ${leccion.imagen_placeholder}</em>
            </div>
        `;

        // Lógica de botones de navegación
        this.btnAnterior.disabled = (indice === 0);
        this.btnAnterior.style.opacity = (indice === 0) ? '0.5' : '1';

        // Lógica del botón COMPLETAR vs SIGUIENTE
        if (indice < this.indiceProgreso) {
            // Estás repasando una lección pasada
            this.btnCompletar.textContent = "Lección Completada ✅";
            this.btnCompletar.disabled = true;
            this.btnCompletar.style.backgroundColor = "var(--bg-main)";
            this.btnCompletar.style.border = "1px solid var(--accent)";

            this.btnSiguiente.disabled = false;
            this.btnSiguiente.style.opacity = '1';
        } else if (indice === this.indiceProgreso) {
            // Estás en tu lección actual bloqueada
            this.btnCompletar.textContent = "Marcar como Completado";
            this.btnCompletar.disabled = false;
            this.btnCompletar.style.backgroundColor = "var(--accent)";
            this.btnCompletar.style.border = "none";

            this.btnSiguiente.disabled = true; // No puedes adelantar
            this.btnSiguiente.style.opacity = '0.5';
        }
    }

    actualizarInterfazProgreso() {
        const porcentaje = Math.round(usuarioLogueado.progresoCapacitacion);
        this.barraLlenado.style.width = `${porcentaje}%`;
        this.textoProgreso.textContent = `Progreso: ${porcentaje}%`;
    }

    completarLeccionActual() {
        // Solo puedes completar si estás viendo tu lección límite
        if (this.indiceVista === this.indiceProgreso && this.indiceProgreso < this.leccionesActuales.length) {
            const porcentajePorLeccion = 20 / this.leccionesActuales.length;

            usuarioLogueado.avanzarProgreso(porcentajePorLeccion);
            this.actualizarInterfazProgreso();

            this.indiceProgreso++;
            this.indiceVista++;

            // Si acabaste el módulo, lo dejamos viendo la última
            if (this.indiceVista >= this.leccionesActuales.length) {
                this.indiceVista = this.leccionesActuales.length - 1;
                alert(`¡Felicidades! Has completado el módulo: ${this.bdModulos[this.moduloActualId].titulo}`);
            }

            this.mostrarLeccion(this.indiceVista);
        }
    }
}