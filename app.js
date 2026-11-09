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

    // Usamos 'sol_stations_v2' para ignorar la memoria vieja y forzar los streams directos funcionales
    let stations = JSON.parse(localStorage.getItem('sol_stations_v2')) || [
        { name: "🎵 Lofi Beats (Prueba Directa)", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
        { name: "🎷 Jazz Classics (Prueba Directa)", url: "https://icecast.jazzradio.com/jazz-high.mp3" }
    ];

    let activeStationIndex = 0;
    let isPlaying = false;

    function renderStations() {
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
        currentTrackTitle.textContent = currentStation.name;
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
            alert('Por favor completa el nombre y la URL del stream.');
            return;
        }

        stations.push({ name, url });
        localStorage.setItem('sol_stations_v2', JSON.stringify(stations));
        activeStationIndex = stations.length - 1;
        renderStations();
        updateActiveStationUI();
        
        inputStationName.value = '';
        inputStreamUrl.value = '';
        alert('¡Emisora agregada a la rocola con éxito!');
    });

    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
