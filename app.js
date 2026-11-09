document.addEventListener('DOMContentLoaded', () => {
    const audioStream = document.getElementById('audioStream');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const serverStatusIndicator = document.getElementById('serverStatusIndicator');
    const statusText = document.getElementById('statusText');
    
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const currentTrackCategory = document.getElementById('currentTrackCategory');
    const stationLogoImg = document.getElementById('stationLogoImg');
    const stationCoverFrame = document.getElementById('stationCoverFrame');
    const stationsCatalogGrid = document.getElementById('stationsCatalogGrid');
    
    // Elementos del Modal de Añadir
    const addStationBtn = document.getElementById('addStationBtn');
    const inputStationName = document.getElementById('inputStationName');
    const inputStationCategory = document.getElementById('inputStationCategory');
    const inputStreamUrl = document.getElementById('inputStreamUrl');
    const inputStationLogo = document.getElementById('inputStationLogo');
    const adminViewModal = document.getElementById('adminViewModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const dirTabs = document.querySelectorAll('.dir-tab');

    // Directorio inicial de emisoras (Colombia e Internacionales con portadas)
    let stations = JSON.parse(localStorage.getItem('sol_stations_v4')) || [
        { 
            name: "Sol Lofi Radio", 
            category: "colombia", 
            url: "https://stream.zeno.fm/f3wvbbqmdg8uv", 
            logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" 
        },
        { 
            name: "Jazz Classics", 
            category: "internacional", 
            url: "https://icecast.jazzradio.com/jazz-high.mp3", 
            logo: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=80" 
        },
        { 
            name: "Classical Masterpieces", 
            category: "internacional", 
            url: "https://stream.zeno.fm/0r0xa792kwzuv", 
            logo: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=80" 
        }
    ];

    let activeStationIndex = 0;
    let currentFilter = 'all';
    let isPlaying = false;

    // Renderizar catálogo de tarjetas con filtro por categoría
    function renderCatalog() {
        stationsCatalogGrid.innerHTML = '';
        
        stations.forEach((station, index) => {
            if (currentFilter !== 'all' && station.category !== currentFilter) return;

            const card = document.createElement('div');
            card.className = `station-card-item ${index === activeStationIndex ? 'active' : ''}`;
            card.innerHTML = `
                <div class="station-card-thumb">
                    <img src="${station.logo || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'}" alt="${station.name}">
                </div>
                <div class="station-card-title">${station.name}</div>
                <div class="station-card-cat">${station.category.toUpperCase()}</div>
            `;

            card.addEventListener('click', () => {
                activeStationIndex = index;
                updateActiveStation();
                if (isPlaying) {
                    stopPlayback();
                    startPlayback();
                } else {
                    startPlayback();
                }
            });

            stationsCatalogGrid.appendChild(card);
        });
    }

    function updateActiveStation() {
        const station = stations[activeStationIndex];
        if (!station) return;

        currentTrackTitle.textContent = station.name;
        currentTrackCategory.textContent = `Categoría: ${station.category.toUpperCase()}`;
        stationLogoImg.src = station.logo || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
        
        renderCatalog();
    }

    // Filtrado por pestañas
    dirTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.getAttribute('data-target-view');
            if (targetView === 'adminView') {
                adminViewModal.classList.remove('hidden');
                return;
            }

            dirTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-category');
            renderCatalog();
        });
    });

    closeModalBtn.addEventListener('click', () => {
        adminViewModal.classList.add('hidden');
    });

    // Añadir nueva emisora
    addStationBtn.addEventListener('click', () => {
        const name = inputStationName.value.trim();
        const category = inputStationCategory.value;
        const url = inputStreamUrl.value.trim();
        const logo = inputStationLogo.value.trim();

        if (!name || !url) {
            alert('Por favor completa el nombre y la URL del stream.');
            return;
        }

        stations.push({
            name,
            category,
            url,
            logo: logo || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'
        });

        localStorage.setItem('sol_stations_v4', JSON.stringify(stations));
        activeStationIndex = stations.length - 1;
        adminViewModal.classList.add('hidden');
        
        inputStationName.value = '';
        inputStreamUrl.value = '';
        inputStationLogo.value = '';
        
        renderCatalog();
        updateActiveStation();
        alert('¡Emisora agregada con éxito a la rocola!');
    });

    // Controles de Reproducción (Play/Pause, Anterior, Siguiente)
    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }
    });

    nextBtn.addEventListener('click', () => {
        activeStationIndex = (activeStationIndex + 1) % stations.length;
        updateActiveStation();
        if (isPlaying) {
            stopPlayback();
            startPlayback();
        }
    });

    prevBtn.addEventListener('click', () => {
        activeStationIndex = (activeStationIndex - 1 + stations.length) % stations.length;
        updateActiveStation();
        if (isPlaying) {
            stopPlayback();
            startPlayback();
        }
    });

    function startPlayback() {
        const station = stations[activeStationIndex];
        if (!station) return;

        audioStream.src = station.url;
        statusText.textContent = 'Conectando...';

        audioStream.play().then(() => {
            isPlaying = true;
            playIcon.className = 'fa-solid fa-pause';
            stationCoverFrame.classList.add('playing');
            statusText.textContent = 'Reproduciendo';
            serverStatusIndicator.style.borderColor = '#22c55e';
        }).catch(err => {
            console.error("Error al reproducir:", err);
            statusText.textContent = 'Error de stream';
            serverStatusIndicator.style.borderColor = '#ef4444';
            isPlaying = false;
            playIcon.className = 'fa-solid fa-play';
            stationCoverFrame.classList.remove('playing');
        });
    }

    function stopPlayback() {
        audioStream.pause();
        audioStream.src = '';
        isPlaying = false;
        playIcon.className = 'fa-solid fa-play';
        stationCoverFrame.classList.remove('playing');
        statusText.textContent = 'Detenido';
    }

    volumeSlider.addEventListener('input', (e) => {
        audioStream.volume = e.target.value;
    });

    // Inicializar
    renderCatalog();
    updateActiveStation();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
