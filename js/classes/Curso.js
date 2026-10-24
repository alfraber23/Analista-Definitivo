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

        // Extraemos el orden de los módulos directamente del menú lateral
        this.ordenModulos = Array.from(this.listaModulosMenu).map(item => item.getAttribute('data-id'));
        this.porcentajePorModulo = 100 / (this.ordenModulos.length || 5); // 20% por cada uno de los 5 módulos

        this.moduloActualId = 'sap_hana';
        this.leccionesActuales = [];
        this.bdModulos = null;

        // Separamos el progreso real dentro del módulo de la lección que se está visualizando
        this.indiceProgreso = 0;
        this.indiceVista = 0;
        this.moduloBloqueado = false;

        this.inicializarEventos();
        this.cargarContenido();
    }

    async cargarContenido() {
        try {
            const respuesta = await fetch('data/modulos.json');
            this.bdModulos = await respuesta.json();

            // Detectamos automáticamente en qué módulo se quedó el usuario según su porcentaje global
            const indiceModuloSugerido = Math.min(
                Math.floor((usuarioLogueado.progresoCapacitacion + 0.001) / this.porcentajePorModulo),
                this.ordenModulos.length - 1
            );
            const idSugerido = this.ordenModulos[indiceModuloSugerido];

            // Si el módulo donde se quedó ya existe en el JSON, lo abrimos ahí; si no, abrimos el primero
            if (this.bdModulos[idSugerido]) {
                this.moduloActualId = idSugerido;
            } else {
                this.moduloActualId = 'sap_hana';
            }

            // Actualizamos la clase visual 'activo' en el menú lateral
            this.listaModulosMenu.forEach(item => {
                item.classList.toggle('activo', item.getAttribute('data-id') === this.moduloActualId);
            });

            this.leccionesActuales = this.bdModulos[this.moduloActualId].lecciones;
            this.sincronizarLeccionConProgreso();
            this.actualizarInterfazProgreso();
        } catch (error) {
            console.error("Error al cargar modulos.json:", error);
            this.cuerpoLeccion.innerHTML = "<p>⚠️ Error de carga. Verifica que Live Server esté activo.</p>";
        }
    }

    obtenerIndiceModulo(moduloId) {
        const idx = this.ordenModulos.indexOf(moduloId);
        return idx !== -1 ? idx : 0;
    }

    sincronizarLeccionConProgreso() {
        const indiceModulo = this.obtenerIndiceModulo(this.moduloActualId);
        const progresoBaseModulo = indiceModulo * this.porcentajePorModulo; // Ej: Mód 1 = 0%, Mód 2 = 20%, Mód 3 = 40%
        const progresoGlobal = usuarioLogueado ? usuarioLogueado.progresoCapacitacion : 0;

        // Verificamos si el usuario aún no ha completado el módulo anterior
        this.moduloBloqueado = (progresoGlobal + 0.001) < progresoBaseModulo;

        // Calculamos cuánto progreso (de 0 a 20%) tiene acumulado específicamente en ESTE módulo
        const progresoEnModulo = Math.max(
            0,
            Math.min(this.porcentajePorModulo, progresoGlobal - progresoBaseModulo)
        );

        const porcLeccion = this.porcentajePorModulo / this.leccionesActuales.length;

        // Sumamos una pequeña tolerancia (0.001) para evitar errores de redondeo con decimales
        this.indiceProgreso = Math.floor((progresoEnModulo + 0.001) / porcLeccion);

        // El usuario arranca viendo la lección en la que se quedó dentro de este módulo
        this.indiceVista = this.indiceProgreso;

        // Si ya completó todas las lecciones de este módulo, mostramos la última lección
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
        // Aseguramos que los botones sean visibles en módulos activos
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

        // Lógica del botón ANTERIOR
        const enPrimeraLeccion = (indice === 0);
        this.btnAnterior.disabled = enPrimeraLeccion;
        this.btnAnterior.style.opacity = enPrimeraLeccion ? '0.5' : '1';

        const enUltimaLeccion = (indice >= this.leccionesActuales.length - 1);

        // Lógica del botón COMPLETAR y SIGUIENTE según el estado del módulo y lección
        if (this.moduloBloqueado) {
            // El usuario entró a ver un módulo posterior sin haber terminado el anterior
            this.btnCompletar.textContent = "🔒 Completa el módulo anterior primero";
            this.btnCompletar.disabled = true;
            this.btnCompletar.style.backgroundColor = "var(--bg-main)";
            this.btnCompletar.style.border = "1px solid var(--text-secondary)";

            this.btnSiguiente.disabled = true;
            this.btnSiguiente.style.opacity = '0.5';
        } else if (indice < this.indiceProgreso) {
            // Está repasando una lección ya completada de este módulo
            this.btnCompletar.textContent = "Lección Completada ✅";
            this.btnCompletar.disabled = true;
            this.btnCompletar.style.backgroundColor = "var(--bg-main)";
            this.btnCompletar.style.border = "1px solid var(--accent)";

            this.btnSiguiente.disabled = enUltimaLeccion;
            this.btnSiguiente.style.opacity = enUltimaLeccion ? '0.5' : '1';
        } else if (indice === this.indiceProgreso) {
            // Está en su lección actual pendiente por completar
            this.btnCompletar.textContent = "Marcar como Completado";
            this.btnCompletar.disabled = false;
            this.btnCompletar.style.backgroundColor = "var(--accent)";
            this.btnCompletar.style.border = "none";

            this.btnSiguiente.disabled = true; // No puede adelantar sin completar
            this.btnSiguiente.style.opacity = '0.5';
        }
    }

    actualizarInterfazProgreso() {
        const porcentaje = Math.round(usuarioLogueado.progresoCapacitacion);
        this.barraLlenado.style.width = `${porcentaje}%`;
        this.textoProgreso.textContent = `Progreso: ${porcentaje}%`;
    }

    completarLeccionActual() {
        if (this.moduloBloqueado) return;

        // Solo puede completar si está viendo su lección pendiente dentro del módulo actual
        if (this.indiceVista === this.indiceProgreso && this.indiceProgreso < this.leccionesActuales.length) {
            const porcentajePorLeccion = this.porcentajePorModulo / this.leccionesActuales.length;

            usuarioLogueado.avanzarProgreso(porcentajePorLeccion);
            this.actualizarInterfazProgreso();

            this.indiceProgreso++;
            this.indiceVista++;

            // Si terminó la última lección del módulo
            if (this.indiceVista >= this.leccionesActuales.length) {
                this.indiceVista = this.leccionesActuales.length - 1;
                alert(`¡Felicidades! Has completado el módulo: ${this.bdModulos[this.moduloActualId].titulo}`);
            }

            this.mostrarLeccion(this.indiceVista);
        }
    }
}
