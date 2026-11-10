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
    const currentGenreBadge = document.getElementById('currentGenreBadge');
    const stationLogoImg = document.getElementById('stationLogoImg');
    const stationCoverFrame = document.getElementById('stationCoverFrame');
    const stationsCatalogGrid = document.getElementById('stationsCatalogGrid');
    const liveBadgeIndicator = document.getElementById('liveBadgeIndicator');
    
    const shareAppBtn = document.getElementById('shareAppBtn');
    const openAdminModalBtn = document.getElementById('openAdminModalBtn');
    const adminPasswordModal = document.getElementById('adminPasswordModal');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const closeDashboardBtn = document.getElementById('closeDashboardBtn');
    const downloadIndexBtn = document.getElementById('downloadIndexBtn');
    const addStationBtn = document.getElementById('addStationBtn');
    const inputStationName = document.getElementById('inputStationName');
    const inputStationCategory = document.getElementById('inputStationCategory');
    const inputStationGenre = document.getElementById('inputStationGenre');
    const inputStreamUrl = document.getElementById('inputStreamUrl');
    const inputStationLogo = document.getElementById('inputStationLogo');
    const adminStationsList = document.getElementById('adminStationsList');
    const dirTabs = document.querySelectorAll('.dir-tab');

    // Catálogo actualizado con el enlace de Letio para Olímpica Barranquilla
    let stations = JSON.parse(localStorage.getItem('sol_stations_v9')) || [
        { 
            name: "Sol Lofi Radio", 
            category: "colombia", 
            genre: "Lofi / Chill",
            url: "https://stream.zeno.fm/f3wvbbqmdg8uv", 
            logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" 
        },
        { 
            name: "Olímpica Estéreo Barranquilla", 
            category: "colombia", 
            genre: "General",
            url: "https://master.letio.com/io/?gs=9102&type=live.mp3", 
            logo: "https://static.mytuner.mobi/media/tvos_radios/913/olimpica-stereo-barranquilla-921-fm.a7f8c4c5.png" 
        },
        { 
            name: "Mix 103.9 Barranquilla", 
            category: "colombia", 
            genre: "General",
            url: "https://playerservices.streamtheworld.com/api/livestream-redirect/MIX_BARRANQUILLAAAC.aac?dist=oro_web", 
            logo: "https://static.mytuner.mobi/media/tvos_radios/577/mix-1039-fm.664b9586.jpg" 
        }
    ];

    let activeStationIndex = 0;
    let currentFilter = 'all';
    let isPlaying = false;

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
                <div class="station-card-genre">${station.genre || 'General'}</div>
            `;

            card.addEventListener('click', () => {
                activeStationIndex = index;
                updateActiveStation();
                startPlayback();
            });

            stationsCatalogGrid.appendChild(card);
        });
    }

    function updateActiveStation() {
        const station = stations[activeStationIndex];
        if (!station) return;

        currentTrackTitle.textContent = station.name;
        currentTrackCategory.textContent = `Nacionalidad: ${station.category.toUpperCase()}`;
        currentGenreBadge.textContent = station.genre || 'General';
        stationLogoImg.src = station.logo || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
        
        renderCatalog();
    }

    function renderAdminList() {
        adminStationsList.innerHTML = '';
        
        stations.forEach((station, index) => {
            const row = document.createElement('div');
            row.className = 'admin-station-row';
            row.innerHTML = `
                <div class="admin-station-row-top">
                    <span class="admin-station-name">ID: ${index + 1} - ${station.name}</span>
                    <button class="btn-danger delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-group" style="margin-bottom:4px;">
                    <label>Nombre</label>
                    <input type="text" class="edit-name" data-index="${index}" value="${station.name}">
                </div>
                <div class="admin-station-inputs">
                    <div class="form-group" style="margin-bottom:4px;">
                        <label>Nacionalidad</label>
                        <select class="styled-select edit-cat" data-index="${index}">
                            <option value="colombia" ${station.category === 'colombia' ? 'selected' : ''}>Colombia</option>
                            <option value="internacional" ${station.category === 'internacional' ? 'selected' : ''}>Internacional</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:4px;">
                        <label>Género</label>
                        <input type="text" class="edit-genre" data-index="${index}" value="${station.genre || ''}">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:4px;">
                    <label>Enlace Stream URL</label>
                    <input type="url" class="edit-url" data-index="${index}" value="${station.url}">
                </div>
                <div class="form-group" style="margin-bottom:4px;">
                    <label>Portada URL</label>
                    <input type="url" class="edit-logo" data-index="${index}" value="${station.logo || ''}">
                </div>
                <button class="btn-primary save-station-btn" data-index="${index}"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
            `;
            adminStationsList.appendChild(row);
        });

        adminStationsList.querySelectorAll('.save-station-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                stations[idx].name = adminStationsList.querySelector(`.edit-name[data-index="${idx}"]`).value;
                stations[idx].category = adminStationsList.querySelector(`.edit-cat[data-index="${idx}"]`).value;
                stations[idx].genre = adminStationsList.querySelector(`.edit-genre[data-index="${idx}"]`).value;
                stations[idx].url = adminStationsList.querySelector(`.edit-url[data-index="${idx}"]`).value;
                stations[idx].logo = adminStationsList.querySelector(`.edit-logo[data-index="${idx}"]`).value;

                localStorage.setItem('sol_stations_v9', JSON.stringify(stations));
                renderCatalog();
                updateActiveStation();
                alert('¡Radio actualizada con éxito!');
            });
        });

        adminStationsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                if (confirm(`¿Eliminar la radio "${stations[idx].name}"?`)) {
                    stations.splice(idx, 1);
                    localStorage.setItem('sol_stations_v9', JSON.stringify(stations));
                    renderCatalog();
                    updateActiveStation();
                    renderAdminList();
                }
            });
        });
    }

    dirTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dirTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-category');
            renderCatalog();
        });
    });

    shareAppBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Sol Digital Radio',
                text: '¡Escucha las mejores emisoras en Sol Digital Radio!',
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    });

    openAdminModalBtn.addEventListener('click', () => {
        adminPasswordInput.value = '';
        adminPasswordModal.classList.remove('hidden');
    });

    cancelPasswordBtn.addEventListener('click', () => {
        adminPasswordModal.classList.add('hidden');
    });

    submitPasswordBtn.addEventListener('click', () => {
        if (adminPasswordInput.value === 'Solradio2026.') {
            adminPasswordModal.classList.add('hidden');
            renderAdminList();
            adminDashboardModal.classList.remove('hidden');
        } else {
            alert('Contraseña incorrecta.');
        }
    });

    closeDashboardBtn.addEventListener('click', () => {
        adminDashboardModal.classList.add('hidden');
    });

    // Limpieza inteligente antes de descargar el archivo para GitHub
    downloadIndexBtn.addEventListener('click', () => {
        adminDashboardModal.classList.add('hidden');
        adminPasswordModal.classList.add('hidden');
        adminStationsList.innerHTML = ''; 

        const htmlContent = document.documentElement.outerHTML;
        
        renderAdminList();

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('¡Archivo index.html descargado limpio y listo para GitHub!');
    });

    addStationBtn.addEventListener('click', () => {
        const name = inputStationName.value.trim();
        const category = inputStationCategory.value;
        const genre = inputStationGenre.value.trim();
        const url = inputStreamUrl.value.trim();
        const logo = inputStationLogo.value.trim();

        if (!name || !url) {
            alert('Por favor completa al menos el nombre y la URL del stream.');
            return;
        }

        stations.push({
            name,
            category,
            genre: genre || 'General',
            url,
            logo: logo || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'
        });

        localStorage.setItem('sol_stations_v9', JSON.stringify(stations));
        activeStationIndex = stations.length - 1;
        
        inputStationName.value = '';
        inputStationGenre.value = '';
        inputStreamUrl.value = '';
        inputStationLogo.value = '';

        renderCatalog();
        updateActiveStation();
        renderAdminList();
        alert('¡Radio agregada con éxito!');
    });

    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (stations.length === 0) return;
        activeStationIndex = (activeStationIndex + 1) % stations.length;
        updateActiveStation();
        startPlayback();
    });

    prevBtn.addEventListener('click', () => {
        if (stations.length === 0) return;
        activeStationIndex = (activeStationIndex - 1 + stations.length) % stations.length;
        updateActiveStation();
        startPlayback();
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
            statusText.textContent = 'En Sintonía';
            serverStatusIndicator.style.borderColor = '#22c55e';
            liveBadgeIndicator.classList.add('active');
        }).catch(err => {
            console.error("Error al reproducir:", err);
            statusText.textContent = 'Error de stream';
            serverStatusIndicator.style.borderColor = '#ef4444';
            isPlaying = false;
            playIcon.className = 'fa-solid fa-play';
            stationCoverFrame.classList.remove('playing');
            liveBadgeIndicator.classList.remove('active');
        });
    }

    function stopPlayback() {
        audioStream.pause();
        audioStream.src = '';
        isPlaying = false;
        playIcon.className = 'fa-solid fa-play';
        stationCoverFrame.classList.remove('playing');
        statusText.textContent = 'Detenido';
        liveBadgeIndicator.classList.remove('active');
    }

    volumeSlider.addEventListener('input', (e) => {
        audioStream.volume = e.target.value;
    });

    renderCatalog();
    updateActiveStation();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
