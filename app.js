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
    
    // Elementos de Gestión y Selector
    const stationSelect = document.getElementById('stationSelect');
    const inputStationName = document.getElementById('inputStationName');
    const inputStreamUrl = document.getElementById('inputStreamUrl');
    const addStationBtn = document.getElementById('addStationBtn');
    const pingServerBtn = document.getElementById('pingServerBtn');
    const diagHttp = document.getElementById('diagHttp');
    const diagLatency = document.getElementById('diagLatency');
    const currentTrackTitle = document.getElementById('currentTrackTitle');

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

    // Lista por defecto de Emisoras (puedes agregar más aquí o desde el panel)
    let stations = JSON.parse(localStorage.getItem('sol_stations')) || [
        { name: "Sol Digital Radio (Principal)", url: "https://xiaozhi-radio-server.onrender.com/stream" },
        { name: "Sol Digital Alternativa (Backup)", url: "https://xiaozhi-radio-server.onrender.com/backup" }
    ];

    let isPlaying = false;

    // Poblar el selector de emisoras
    function renderStations() {
        stationSelect.innerHTML = '';
        stations.forEach((station, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        });
    }

    renderStations();

    // Cuando cambias de emisora en el selector
    stationSelect.addEventListener('change', () => {
        const selectedStation = stations[stationSelect.value];
        currentTrackTitle.textContent = selectedStation.name;
        if (isPlaying) {
            stopPlayback();
            startPlayback();
        } else {
            checkServerStatus();
        }
    });

    // Agregar nueva emisora desde el panel
    addStationBtn.addEventListener('click', () => {
        const name = inputStationName.value.trim();
        const url = inputStreamUrl.value.trim();

        if (!name || !url) {
            alert('Por favor completa el nombre y la URL de la emisora.');
            return;
        }

        stations.push({ name, url });
        localStorage.setItem('sol_stations', JSON.stringify(stations));
        renderStations();
        
        // Seleccionar la recién creada
        stationSelect.value = stations.length - 1;
        inputStationName.value = '';
        inputStreamUrl.value = '';
        alert('¡Emisora agregada con éxito!');
        checkServerStatus();
    });

    // Control Play / Pause
    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }
    });

    function startPlayback() {
        const currentStation = stations[stationSelect.value];
        currentTrackTitle.textContent = currentStation.name;
        
        // Añadimos timestamp para evitar caché
        audioStream.src = `${currentStation.url}?t=${Date.now()}`;
        
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

    // Testear Estado del Servidor
    async function checkServerStatus() {
        const currentStation = stations[stationSelect.value];
        const startTime = Date.now();
        
        serverStatusIndicator.className = 'server-status-pill waking';
        statusText.textContent = 'Verificando...';
        wakingBanner.classList.remove('hidden');

        try {
            await fetch(currentStation.url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
            const latency = Date.now() - startTime;

            diagHttp.textContent = 'Activo (OK)';
            diagLatency.textContent = `${latency} ms`;
            
            serverStatusIndicator.className = 'server-status-pill online';
            statusText.textContent = 'Servidor Listo';
            wakingBanner.classList.add('hidden');
        } catch (error) {
            diagHttp.textContent = 'Inactivo / Despertando';
            diagLatency.textContent = '> 3000 ms';

            serverStatusIndicator.className = 'server-status-pill waking';
            statusText.textContent = 'Despertando...';
        }
    }

    pingServerBtn.addEventListener('click', checkServerStatus);
    checkServerStatus();

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
