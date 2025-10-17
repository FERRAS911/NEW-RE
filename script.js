// Wait for DOM to be ready
function domReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    const qrResult = document.getElementById('qr-result');
    const qrError = document.getElementById('qr-error');

    // Format date to dd/mmm/aa hh:mm
    function formatDate(date) {
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = meses[date.getMonth()];
        const año = String(date.getFullYear()).slice(-2);
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    }

    // Register attendance and notify other tabs
    function registrarAsistencia(id) {
        qrResult.textContent = `Escaneando...`;
        let found = false;
        const grupos = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
        for (let grupo of grupos) {
            const registros = JSON.parse(localStorage.getItem(`asistencias_${grupo}`)) || [];
            const registro = registros.find(r => r.id === id);
            if (registro) {
                found = true;
                if (!registro.asistencias) registro.asistencias = [];
                const fechaActual = formatDate(new Date());
                registro.asistencias.push({ fecha: fechaActual, estado: 'SA' });
                localStorage.setItem(`asistencias_${grupo}`, JSON.stringify(registros));
                qrResult.textContent = `Asistencia registrada para ${id} el ${fechaActual}`;

                // Notify other tabs (e.g., INFORMES.HTML) to update
                window.dispatchEvent(new Event('storage'));
                break;
            }
        }
        if (!found) {
            qrResult.textContent = `ID ${id} no encontrado en ningún grupo`;
        }
        setTimeout(() => {
            qrResult.textContent = 'Escaneando...';
        }, 2000);
    }

    // Initialize scanner
    function onScanSuccess(decodeText, decodeResult) {
        const id = decodeText.trim();
        registrarAsistencia(id);
    }

    function onScanError(err) {
        qrError.textContent = `Error al escanear: ${err}. Asegúrate de que la cámara esté disponible.`;
        qrError.style.display = 'block';
    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onScanSuccess, onScanError);

    // Listen for storage events to sync with other tabs if needed
    window.addEventListener('storage', () => {
        // This will trigger INFORMES.HTML to update if listening
    });
});
