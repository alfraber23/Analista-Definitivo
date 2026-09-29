class GestorAclaraciones {
    constructor() {
        // Elementos del buscador
        this.inputBuscar = document.getElementById('input-buscar-aclaracion');
        this.btnBuscar = document.getElementById('btn-buscar-aclaracion');
        this.resultadosArea = document.getElementById('resultados-aclaraciones');

        // Elementos del Panel Admin
        this.panelAdmin = document.getElementById('panel-admin');
        this.inputCodigo = document.getElementById('admin-codigo');
        this.inputDesc = document.getElementById('admin-desc');
        this.inputContenido = document.getElementById('admin-contenido');
        this.btnGuardar = document.getElementById('btn-guardar-aclaracion');
        this.btnLimpiar = document.getElementById('btn-limpiar-form');

        this.bdAclaraciones = [];
        this.esAdmin = false;

        this.verificarPrivilegios();
        this.inicializarEventos();
        this.cargarDatosEnTiempoReal();
    }

    verificarPrivilegios() {
        // Validamos estrictamente tu correo para dar permisos
        if (usuarioLogueado && usuarioLogueado.email === 'josealberto.fb15@gmail.com') {
            this.esAdmin = true;
            this.panelAdmin.style.display = 'block'; // Mostramos tus controles
        }
    }

    cargarDatosEnTiempoReal() {
        // Firebase escucha los cambios y los descarga automáticamente
        db.collection("aclaraciones").onSnapshot((snapshot) => {
            this.bdAclaraciones = [];
            snapshot.forEach((doc) => {
                this.bdAclaraciones.push({
                    id: doc.id, // Guardamos el documento usando tu Código como ID
                    ...doc.data()
                });
            });
        });
    }

    inicializarEventos() {
        this.btnBuscar.addEventListener('click', () => this.buscar());
        this.inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscar();
        });

        if (this.esAdmin) {
            this.btnGuardar.addEventListener('click', () => this.guardarAclaracion());
            this.btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        }
    }

    buscar() {
        const texto = this.inputBuscar.value.trim().toLowerCase();
        if (texto === "") return;

        // Filtramos por código exacto o si la descripción incluye la palabra
        const resultados = this.bdAclaraciones.filter(item =>
            item.id.toLowerCase() === texto ||
            item.descripcion.toLowerCase().includes(texto)
        );

        this.mostrarResultados(resultados, texto);
    }

    mostrarResultados(resultados, busqueda) {
        if (resultados.length === 0) {
            this.resultadosArea.innerHTML = `<p style="color: #ef4444; text-align: center;">No se encontró nada para "${busqueda}".</p>`;
            return;
        }

        let html = `<p style="color: var(--text-secondary); margin-bottom: 15px;">Resultados encontrados:</p>`;

        resultados.forEach(item => {
            html += `
                <div class="opcion-paquete" style="margin-bottom: 15px; border-left-color: var(--accent);">
                    <h4 style="color: var(--accent); font-size: 1.2rem;">Código: ${item.id}</h4>
                    <p style="font-weight: bold; margin: 5px 0;">${item.descripcion}</p>
                    ${item.contenido ? `<p style="color: var(--text-secondary); white-space: pre-wrap; font-size: 0.95rem;"><strong>Contenido:</strong><br>${item.contenido}</p>` : ''}
            `;

            // Si eres tú (admin), inyectamos los botones de editar y eliminar
            if (this.esAdmin) {
                html += `
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn-editar-admin" data-id="${item.id}" style="background: transparent; color: #eab308; border: 1px solid #eab308; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✏️ Editar</button>
                        <button class="btn-eliminar-admin" data-id="${item.id}" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 5px 10px; border-radius: 3px; cursor: pointer;">🗑️ Eliminar</button>
                    </div>
                `;
            }
            html += `</div>`;
        });

        this.resultadosArea.innerHTML = html;

        // Le damos vida a los botones de admin recién creados
        if (this.esAdmin) {
            document.querySelectorAll('.btn-editar-admin').forEach(btn => {
                btn.addEventListener('click', (e) => this.cargarParaEditar(e.target.dataset.id));
            });
            document.querySelectorAll('.btn-eliminar-admin').forEach(btn => {
                btn.addEventListener('click', (e) => this.eliminarAclaracion(e.target.dataset.id));
            });
        }
    }

    // --- MÉTODOS CRUD (SOLO PARA BETO) ---

    async guardarAclaracion() {
        // Forzamos el código a mayúsculas para mantener orden en la base de datos
        const codigo = this.inputCodigo.value.trim().toUpperCase();
        const desc = this.inputDesc.value.trim();
        const contenido = this.inputContenido.value.trim();

        if (codigo === "" || desc === "") {
            alert("El código y la descripción son obligatorios.");
            return;
        }

        // --- NUEVA VALIDACIÓN ---
        // Buscamos si el código ya existe en nuestra memoria sincronizada
        const existe = this.bdAclaraciones.find(item => item.id === codigo);

        if (existe) {
            // Si existe, lanzamos la alerta nativa del navegador
            const confirmar = confirm(`Oye, el código ${codigo} ya existe registrado como:\n"${existe.descripcion}"\n\n¿Quieres modificarlo y sobrescribir su información?`);

            // Si le das a "Cancelar", detenemos la función aquí mismo
            if (!confirmar) {
                return;
            }
        }
        // ------------------------

        try {
            // .set() actualiza si ya existe, o crea uno nuevo si no existe
            await db.collection("aclaraciones").doc(codigo).set({
                descripcion: desc,
                contenido: contenido
            });
            alert(`¡Código ${codigo} guardado con éxito!`);
            this.limpiarFormulario();
            this.inputBuscar.value = codigo; // Ponemos el código en el buscador
            this.btnBuscar.click(); // Forzamos la búsqueda para que veas el resultado
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar. Revisa la consola.");
        }
    }

    cargarParaEditar(codigo) {
        const item = this.bdAclaraciones.find(x => x.id === codigo);
        if (item) {
            this.inputCodigo.value = item.id;
            this.inputDesc.value = item.descripcion;
            this.inputContenido.value = item.contenido || "";
            // Hacemos scroll suave hacia el formulario
            this.panelAdmin.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async eliminarAclaracion(codigo) {
        if (confirm(`¿Estás SEGURO de que quieres eliminar el código ${codigo}?`)) {
            try {
                await db.collection("aclaraciones").doc(codigo).delete();
                this.resultadosArea.innerHTML = `<p style="color: var(--accent); text-align: center;">Código ${codigo} eliminado correctamente.</p>`;
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    }

    limpiarFormulario() {
        this.inputCodigo.value = "";
        this.inputDesc.value = "";
        this.inputContenido.value = "";
    }
}