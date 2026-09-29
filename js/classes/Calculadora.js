class CalculadoraTiempos {
    constructor() {
        // Inputs
        this.inputInicioAx = document.getElementById('hora-inicio-ax');
        this.inputFinQx = document.getElementById('hora-fin-qx');
        this.inputFinAx = document.getElementById('hora-fin-ax');
        this.inputInicioGas = document.getElementById('hora-inicio-gas');
        this.inputFinGas = document.getElementById('hora-fin-gas');

        // Outputs
        this.resQx = document.getElementById('res-qx');
        this.resAx = document.getElementById('res-ax');
        this.resGas = document.getElementById('res-gas');

        this.inicializarEventos();
    }

    inicializarEventos() {
        // Configuramos la secuencia de saltos al escribir
        this.configurarInput(this.inputInicioAx, this.inputFinQx);
        this.configurarInput(this.inputFinQx, this.inputFinAx);
        this.configurarInput(this.inputFinAx, this.inputInicioGas);
        this.configurarInput(this.inputInicioGas, this.inputFinGas);
        this.configurarInput(this.inputFinGas, null); // El último no salta a ningún lado
    }

    configurarInput(inputElement, siguienteInput) {
        // Selecciona todo el texto al dar clic[cite: 1]
        inputElement.addEventListener('click', () => inputElement.select());

        // Aplica la máscara y calcula en tiempo real con cada tecla presionada
        inputElement.addEventListener('input', () => {
            this.aplicarMascara(inputElement, siguienteInput);
            this.calcularResultados();
        });
    }

    aplicarMascara(input, siguienteInput) {
        // Elimina cualquier caracter que no sea número[cite: 1]
        let valor = input.value.replace(/\D/g, "");

        // Validaciones estrictas de formato 24h[cite: 1]
        if (valor.length >= 1 && parseInt(valor[0]) > 2) valor = "";
        if (valor.length >= 2 && parseInt(valor.slice(0, 2)) > 23) valor = "23";
        if (valor.length >= 3 && parseInt(valor[2]) > 5) valor = valor.slice(0, 2);

        // Inserta los dos puntos automáticamente[cite: 1]
        if (valor.length > 2) {
            input.value = valor.slice(0, 2) + ":" + valor.slice(2, 4);
        } else {
            input.value = valor;
        }

        // Si la hora está completa (5 caracteres), salta al siguiente campo[cite: 1]
        if (input.value.length === 5 && siguienteInput) {
            siguienteInput.focus();
            setTimeout(() => siguienteInput.select(), 10);
        }
    }

    calcularResultados() {
        const inicioAx = this.inputInicioAx.value;
        const finQx = this.inputFinQx.value;
        const finAx = this.inputFinAx.value;
        const inicioGas = this.inputInicioGas.value;
        const finGas = this.inputFinGas.value;

        // Cálculo de Quirófano (Qx): Inicio Anestesia hasta Fin Cirugía
        if (inicioAx.length === 5 && finQx.length === 5) {
            this.resQx.textContent = this.obtenerDiferencia(inicioAx, finQx);
        } else {
            this.resQx.textContent = "--:--";
        }

        // Cálculo de Anestesia (Ax): Inicio Anestesia hasta Fin Anestesia
        if (inicioAx.length === 5 && finAx.length === 5) {
            this.resAx.textContent = this.obtenerDiferencia(inicioAx, finAx);
        } else {
            this.resAx.textContent = "--:--";
        }

        // Cálculo de Gas (Gas): Inicio Gas hasta Fin Gas
        if (inicioGas.length === 5 && finGas.length === 5) {
            this.resGas.textContent = this.obtenerDiferencia(inicioGas, finGas);
        } else {
            this.resGas.textContent = "--:--";
        }
    }

    obtenerDiferencia(horaInicio, horaFin) {
        const [h1, m1] = horaInicio.split(':').map(Number);
        const [h2, m2] = horaFin.split(':').map(Number);

        let minutosInicio = (h1 * 60) + m1;
        let minutosFin = (h2 * 60) + m2;

        // Compensación si el tiempo cruza la medianoche (ej. de 23:00 a 02:00)[cite: 1]
        if (minutosFin < minutosInicio) {
            minutosFin += 24 * 60;
        }

        const diferenciaMinutos = minutosFin - minutosInicio;
        const horasResultado = Math.floor(diferenciaMinutos / 60);
        const minutosResultado = diferenciaMinutos % 60;

        // Formatear salida para que siempre muestre dos dígitos (ej. 02:05)
        const horasFormato = horasResultado.toString().padStart(2, '0');
        const minsFormato = minutosResultado.toString().padStart(2, '0');

        return `${horasFormato}:${minsFormato} hrs`;
    }
}