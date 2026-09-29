class BuscadorPaquetes {
    constructor() {
        this.inputBusqueda = document.getElementById('input-busqueda');
        this.btnBuscar = document.getElementById('btn-buscar-pqte');
        this.contenedorResultados = document.getElementById('resultados-busqueda');

        this.bdPaquetes = []; // Guardará el JSON de paquetes

        this.inicializarEventos();
        this.cargarPaquetes();
    }

    async cargarPaquetes() {
        try {
            const respuesta = await fetch('data/paquetes.json');
            this.bdPaquetes = await respuesta.json();
        } catch (error) {
            console.error("Error al cargar paquetes.json:", error);
            this.contenedorResultados.innerHTML = `<p style="color: #ef4444; text-align: center;">Error de conexión. Revisa Live Server.</p>`;
        }
    }

    inicializarEventos() {
        this.btnBuscar.addEventListener('click', () => this.procesarBusqueda());
        this.inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.procesarBusqueda();
        });
    }

    procesarBusqueda() {
        const texto = this.inputBusqueda.value.trim().toLowerCase();
        if (texto === "" || this.bdPaquetes.length === 0) return;

        // Ahora usamos this.bdPaquetes en lugar de la variable global
        const coincidenciaExacta = this.bdPaquetes.find(pqte => pqte.codigo.toLowerCase() === texto);

        if (coincidenciaExacta) {
            this.mostrarContenidoPaquete(coincidenciaExacta);
            return;
        }

        const coincidenciasNombre = this.bdPaquetes.filter(pqte => pqte.nombre.toLowerCase().includes(texto));

        if (coincidenciasNombre.length > 0) {
            this.mostrarOpciones(coincidenciasNombre);
        } else {
            this.contenedorResultados.innerHTML = `<p style="color: #ef4444; text-align: center;">No se encontró ningún paquete con "${texto}".</p>`;
        }
    }

    mostrarOpciones(listaPaquetes) {
        let html = `<p style="color: var(--text-secondary); margin-bottom: 15px;">Se encontraron ${listaPaquetes.length} paquetes. Selecciona uno:</p>`;

        listaPaquetes.forEach(pqte => {
            html += `
                <div class="opcion-paquete" data-codigo="${pqte.codigo}">
                    <h4>${pqte.codigo}</h4>
                    <p>${pqte.nombre}</p>
                </div>
            `;
        });

        this.contenedorResultados.innerHTML = html;

        const opciones = document.querySelectorAll('.opcion-paquete');
        opciones.forEach(opcion => {
            opcion.addEventListener('click', (e) => {
                const codigoSeleccionado = e.currentTarget.getAttribute('data-codigo');
                const paqueteElegido = this.bdPaquetes.find(p => p.codigo === codigoSeleccionado);
                this.mostrarContenidoPaquete(paqueteElegido);
            });
        });
    }

    mostrarContenidoPaquete(paquete) {
        let html = `
            <h3 class="titulo-paquete-abierto">[${paquete.codigo}] - ${paquete.nombre}</h3>
            <table class="tabla-contenido">
                <thead>
                    <tr>
                        <th>Cantidad</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        paquete.contenido.forEach(item => {
            html += `
                <tr>
                    <td style="color: var(--accent); font-weight: bold;">${item.cant}</td>
                    <td>${item.desc}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        this.contenedorResultados.innerHTML = html;
        this.inputBusqueda.value = "";
    }
}