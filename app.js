document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const audioStream = document.getElementById('audioStream');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const vinylDisc = document.getElementById('vinylDisc');
    const volumeSlider = document.getElementById('volumeSlider');
    const serverStatusIndicator = document.getElementById('serverStatusIndicator');
    const statusText = document.getElementById('statusText');
    const wakingBanner = document.getElementById('wakingBanner');
    
    // Elementos de Configuración y Diagnóstico
    const inputRelayUrl = document.getElementById('inputRelayUrl');
    const inputMountPoint = document.getElementById('inputMountPoint');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const pingServerBtn = document.getElementById('pingServerBtn');
    const diagHttp = document.getElementById('diagHttp');
    const diagLatency = document.getElementById('diagLatency');
    const diagListeners = document.getElementById('diagListeners');

    // Navegación entre pestañas
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            const targetView = document.getElementById(btn.getAttribute('data-target'));
            if (targetView) targetView.classList.add('active');
        });
    });

    // Cargar configuración guardada o por defecto
    const savedUrl = localStorage.getItem('relay_url') || 'https://xiaozhi-radio-server.onrender.com';
    const savedMount = localStorage.getItem('mount_point') || 'https://xiaozhi-radio-server.onrender.com/stream';
    
    inputRelayUrl.value = savedUrl;
    inputMountPoint.value = savedMount;

    let isPlaying = false;
    let checkInterval = null;

    // Guardar configuración
    saveConfigBtn.addEventListener('click', () => {
        localStorage.setItem('relay_url', inputRelayUrl.value.trim());
        localStorage.setItem('mount_point', inputMountPoint.value.trim());
        alert('¡Configuración guardada con éxito!');
        checkServerStatus();
    });

    // Control Play / Pause
    playPauseBtn.addEventListener('click', async () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }
    });

    function startPlayback() {
        const streamUrl = inputMountPoint.value.trim();
        // Añadimos timestamp para evitar caché agresiva en navegadores móviles
        audioStream.src = `${streamUrl}?t=${Date.now()}`;
        
        wakingBanner.classList.remove('hidden');
        statusText.textContent = 'Conectando...';
        serverStatusIndicator.className = 'server-status-pill waking';

        audioStream.play().then(() => {
            isPlaying = true;
            playIcon.className = 'fa-solid fa-pause';
            vinylDisc.classList.add('playing');
            wakingBanner.classList.add('hidden');
            statusText.textContent = 'En Vivo';
            serverStatusIndicator.className = 'server-status-pill online';
        }).catch(err => {
            console.error("Error al reproducir:", err);
            wakingBanner.classList.add('hidden');
            statusText.textContent = 'Error de conexión';
            serverStatusIndicator.className = 'server-status-pill offline';
            isPlaying = false;
            playIcon.className = 'fa-solid fa-play';
            vinylDisc.classList.remove('playing');
        });
    }

    function stopPlayback() {
        audioStream.pause();
        audioStream.src = '';
        isPlaying = false;
        playIcon.className = 'fa-solid fa-play';
        vinylDisc.classList.remove('playing');
        statusText.textContent = 'Detenido';
        serverStatusIndicator.className = 'server-status-pill';
        wakingBanner.classList.add('hidden');
    }

    // Control de Volumen
    volumeSlider.addEventListener('input', (e) => {
        audioStream.volume = e.target.value;
    });

    // Testear Estado del Servidor (Render Ping + Waking Detector)
    async function checkServerStatus() {
        const url = inputRelayUrl.value.trim();
        const startTime = Date.now();
        
        serverStatusIndicator.className = 'server-status-pill waking';
        statusText.textContent = 'Verificando...';
        wakingBanner.classList.remove('hidden');

        try {
            // Usamos modo 'no-cors' o fetch directo
            const response = await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
            const latency = Date.now() - startTime;

            diagHttp.textContent = 'Activo (OK)';
            diagLatency.textContent = `${latency} ms`;
            diagListeners.textContent = '1+ (Activo)';
            
            serverStatusIndicator.className = 'server-status-pill online';
            statusText.textContent = 'Servidor Listo';
            wakingBanner.classList.add('hidden');
        } catch (error) {
            console.warn("Servidor durmiendo o inactivo:", error);
            diagHttp.textContent = 'Inactivo / Despertando';
            diagLatency.textContent = '> 3000 ms';
            diagListeners.textContent = '0';

            serverStatusIndicator.className = 'server-status-pill waking';
            statusText.textContent = 'Despertando...';
        }
    }

    pingServerBtn.addEventListener('click', checkServerStatus);

    // Verificar al iniciar
    checkServerStatus();

    // Registro de PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado correctamente.'))
            .catch(err => console.log('Error al registrar Service Worker:', err));
    }
});
