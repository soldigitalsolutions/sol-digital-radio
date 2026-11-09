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

    // Limpiamos y usamos 'sol_stations_v3' para forzar emisoras de streaming reales y compatibles
    let stations = [
        { name: "🎵 Sol Lofi 24/7 (Directo)", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
        { name: "🎷 Jazz Classics Radio", url: "https://icecast.jazzradio.com/jazz-high.mp3" },
        { name: "🎹 Classical Masterpieces", url: "https://stream.zeno.fm/0r0xa792kwzuv" }
    ];

    // Intentar cargar las del usuario si existen
    const savedStations = localStorage.getItem('sol_stations_v3');
    if (savedStations) {
        try {
            stations = JSON.parse(savedStations);
        } catch (e) {
            console.error("Error al leer estaciones guardadas");
        }
    }

    let activeStationIndex = 0;
    let isPlaying = false;

    function renderStations() {
        if (!stationSelect || !rocolaStationsGrid) return;
        
        stationSelect.innerHTML = '';
        stations.forEach((station, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        });
        stationSelect.value = activeStationIndex;

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
        if (currentTrackTitle && currentStation) {
            currentTrackTitle.textContent = currentStation.name;
        }
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

    if (stationSelect) {
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
    }

    if (addStationBtn) {
        addStationBtn.addEventListener('click', () => {
            const name = inputStationName.value.trim();
            const url = inputStreamUrl.value.trim();

            if (!name || !url) {
                alert('Por favor completa el nombre y la URL del stream.');
                return;
            }

            stations.push({ name, url });
            localStorage.setItem('sol_stations_v3', JSON.stringify(stations));
            activeStationIndex = stations.length - 1;
            renderStations();
            updateActiveStationUI();
            
            inputStationName.value = '';
            inputStreamUrl.value = '';
            alert('¡Emisora agregada a la rocola con éxito!');
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!isPlaying) {
                startPlayback();
            } else {
                stopPlayback();
            }
        });
    }

    function startPlayback() {
        const currentStation = stations[activeStationIndex];
        if (!currentStation) return;
        
        currentTrackTitle.textContent = currentStation.name;
        
        if (vinylDisc) {
            vinylDisc.classList.remove('jukebox-load');
            void vinylDisc.offsetWidth;
            vinylDisc.classList.add('jukebox-load');
        }

        audioStream.src = currentStation.url;
        
        if (wakingBanner) wakingBanner.classList.add('hidden');
        if (statusText) statusText.textContent = 'Conectando...';
        if (serverStatusIndicator) serverStatusIndicator.className = 'server-status-pill waking';

        audioStream.play().then(() => {
            isPlaying = true;
            if (playIcon) playIcon.className = 'fa-solid fa-pause';
            if (vinylDisc) vinylDisc.classList.add('playing');
            if (statusText) statusText.textContent = 'Reproduciendo';
            if (serverStatusIndicator) serverStatusIndicator.className = 'server-status-pill online';
        }).catch(err => {
            console.error("Error al reproducir:", err);
            if (statusText) statusText.textContent = 'Error de stream';
            if (serverStatusIndicator) serverStatusIndicator.className = 'server-status-pill offline';
            isPlaying = false;
            if (playIcon) playIcon.className = 'fa-solid fa-play';
            if (vinylDisc) vinylDisc.classList.remove('playing');
        });
    }

    function stopPlayback() {
        audioStream.pause();
        audioStream.src = '';
        isPlaying = false;
        if (playIcon) playIcon.className = 'fa-solid fa-play';
        if (vinylDisc) vinylDisc.classList.remove('playing');
        if (statusText) statusText.textContent = 'Detenido';
        if (serverStatusIndicator) serverStatusIndicator.className = 'server-status-pill';
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audioStream.volume = e.target.value;
        });
    }

    function checkServerStatus() {
        if (serverStatusIndicator) serverStatusIndicator.className = 'server-status-pill online';
        if (statusText) statusText.textContent = 'Rocola Lista';
    }

    checkServerStatus();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
