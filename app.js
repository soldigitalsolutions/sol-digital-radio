document.addEventListener('DOMContentLoaded', () => {
    const audioStream = document.getElementById('audioStream');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const vinylDisc = document.getElementById('vinylDisc');
    const volumeSlider = document.getElementById('volumeSlider');
    const serverStatusIndicator = document.getElementById('serverStatusIndicator');
    const statusText = document.getElementById('statusText');
    const wakingBanner = document.getElementById('wakingBanner');
    
    const stationSelect = document.getElementById('stationSelect');
    const inputStationName = document.getElementById('inputStationName');
    const inputStreamUrl = document.getElementById('inputStreamUrl');
    const addStationBtn = document.getElementById('addStationBtn');
    const pingServerBtn = document.getElementById('pingServerBtn');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const rocolaStationsGrid = document.getElementById('rocolaStationsGrid');

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

    let stations = JSON.parse(localStorage.getItem('sol_stations')) || [
        { name: "Sol Digital Radio (Principal)", url: "https://xiaozhi-radio-server.onrender.com/stream" },
        { name: "Sol Digital Alternativa (Backup)", url: "https://xiaozhi-radio-server.onrender.com/backup" }
    ];

    let activeStationIndex = 0;
    let isPlaying = false;

    // Renderizar emisoras tanto en el select como en los botones de la Rocola principal
    function renderStations() {
        // 1. Llenar el select de gestión
        stationSelect.innerHTML = '';
        stations.forEach((station, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        });
        stationSelect.value = activeStationIndex;

        // 2. Llenar el Kiosko de botones en la pantalla principal (Rocola)
        rocolaStationsGrid.innerHTML = '';
        stations.forEach((station, index) => {
            const btn = document.createElement('button');
            btn.className = `rocola-station-btn ${index === activeStationIndex ? 'active' : ''}`;
            btn.innerHTML = `<i class="fa-solid fa-compact-disc"></i> ${station.name}`;
            btn.addEventListener('click', () => {
                activeStationIndex = index;
                stationSelect.value = index;
                updateActiveStationUI();
                if (isPlaying) {
                    stopPlayback();
                    startPlayback();
                } else {
                    checkServerStatus();
                }
            });
            rocolaStationsGrid.appendChild(btn);
        });
    }

    function updateActiveStationUI() {
        const currentStation = stations[activeStationIndex];
        currentTrackTitle.textContent = currentStation.name;
        // Actualizar estado activo en los botones de la rocola
        const buttons = rocolaStationsGrid.querySelectorAll('.rocola-station-btn');
        buttons.forEach((b, idx) => {
            if (idx === activeStationIndex) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }

    renderStations();

    stationSelect.addEventListener('change', () => {
        activeStationIndex = parseInt(stationSelect.value);
        updateActiveStationUI();
        if (isPlaying) {
            stopPlayback();
            startPlayback();
        } else {
            checkServerStatus();
        }
    });

    addStationBtn.addEventListener('click', () => {
        const name = inputStationName.value.trim();
        const url = inputStreamUrl.value.trim();

        if (!name || !url) {
            alert('Por favor completa el nombre y la URL de la emisora.');
            return;
        }

        stations.push({ name, url });
        localStorage.setItem('sol_stations', JSON.stringify(stations));
        activeStationIndex = stations.length - 1;
        renderStations();
        updateActiveStationUI();
        
        inputStationName.value = '';
        inputStreamUrl.value = '';
        alert('¡Emisora agregada a la rocola con éxito!');
        checkServerStatus();
    });

    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }
    });

    function startPlayback() {
        const currentStation = stations[activeStationIndex];
        currentTrackTitle.textContent = currentStation.name;
        
        // Disparar animación de carga de LP (Rocola)
        vinylDisc.classList.remove('jukebox-load');
        void vinylDisc.offsetWidth;
        vinylDisc.classList.add('jukebox-load');

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

    volumeSlider.addEventListener('input', (e) => {
        audioStream.volume = e.target.value;
    });

    async function checkServerStatus() {
        const currentStation = stations[activeStationIndex];
        const startTime = Date.now();
        
        serverStatusIndicator.className = 'server-status-pill waking';
        statusText.textContent = 'Verificando...';
        wakingBanner.classList.add('hidden');

        try {
            await fetch(currentStation.url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
            const latency = Date.now() - startTime;
            serverStatusIndicator.className = 'server-status-pill online';
            statusText.textContent = 'Servidor Listo';
            wakingBanner.classList.add('hidden');
        } catch (error) {
            serverStatusIndicator.className = 'server-status-pill waking';
            statusText.textContent = 'Despertando...';
        }
    }

    if (pingServerBtn) {
        pingServerBtn.addEventListener('click', checkServerStatus);
    }
    checkServerStatus();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
