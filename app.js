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
    const directoryTabsContainer = document.getElementById('directoryTabs') || document.querySelector('.directory-tabs');
    const liveBadgeIndicator = document.getElementById('liveBadgeIndicator');
    
    const shareAppBtn = document.getElementById('shareAppBtn');
    const shareAppBtnInternal = document.getElementById('shareAppBtnInternal');
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

    // Elementos del Centro de Ayuda e Instalación
    const openHelpModalBtn = document.getElementById('openHelpModalBtn');
    const helpDashboardModal = document.getElementById('helpDashboardModal');
    const closeHelpDashBtn = document.getElementById('closeHelpDashBtn');
    const deviceTabs = document.querySelectorAll('.device-tab');
    const instrPanes = document.querySelectorAll('.device-instr-pane');
    const installAppBtn = document.getElementById('installAppBtn');

    // VERSIÓN DEL CATÁLOGO: Sube este número (v14, v15...) cada vez que edites las emisoras aquí en el código
    const CATALOG_VERSION = 'sol_stations_v14';

    // Limpia versiones anteriores del almacenamiento local para evitar conflictos
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sol_stations_') && key !== CATALOG_VERSION) {
            localStorage.removeItem(key);
        }
    });

    // Catálogo Oficial de Emisoras
    let stations = JSON.parse(localStorage.getItem(CATALOG_VERSION)) || [
        { 
            name: "Olímpica Estéreo Barranquilla", 
            category: "colombia", 
            genre: "General",
            url: "https://master.letio.com/io/?gs=9102&type=live.mp3", 
            logo: "https://static.mytuner.mobi/media/tvos_radios/913/olimpica-stereo-barranquilla-921-fm.a7f8c4c5.png" 
        },
        { 
            name: "Reggaeton 92.3 FM", 
            category: "republica dominicana", 
            genre: "Reggaeton",
            url: "https://streampanel.online/8495/stream", 
            logo: "https://streampanel.online/img/stream_logos/385.jpg?t=1794636709269" 
        },
        { 
            name: "Mix 103.9 Barranquilla", 
            category: "colombia", 
            genre: "General",
            url: "https://playerservices.streamtheworld.com/api/livestream-redirect/MIX_BARRANQUILLAAAC.aac?dist=oro_web", 
            logo: "https://static.mytuner.mobi/media/tvos_radios/577/mix-1039-fm.664b9586.jpg" 
        },
        { 
            name: "La Kalle 96.9", 
            category: "colombia", 
            genre: "General",
            url: "https://playerservices.streamtheworld.com/api/livestream-redirect/LA_KALLE.mp3", 
            logo: "https://thumbnail.anii.io/co/120f8533-a122-11ef-8b9a-60ad4349a14f.webp" 
        },
        { 
            name: "Himnos Cristianos Del Ayer", 
            category: "colombia", 
            genre: "cristiana",
            url: "https://stream.zeno.fm/vkancadp2v8uv", 
            logo: "https://images.zeno.fm/wuiJiKL-mLyUj54hJGGrjRWahSyjQJzwBC2E5xzmERU/rs:fill:304:304/q:75/g:ce:0:0/aHR0cHM6Ly9wcm94eS56ZW5vLmZtL2NvbnRlbnQvc3RhdGlvbnMvYWd4emZucGxibTh0YzNSaGRITnlNZ3NTQ2tGMWRHaERiR2xsYm5RWWdJQ1FsTEQ5eWdvTUN4SU9VM1JoZEdsdmJsQnliMlpwYkdVWWdJQ3dwcWZwbkFrTW9nRUVlbVZ1YncvaW1hZ2UvP3U9MTY2MTU5MTQ3NjAwMA" 
        }
    ];

    let activeStationIndex = 0;
    let currentFilter = 'all';
    let isPlaying = false;
    let isConnecting = false;

    // --- FORMATEO AUTOMÁTICO DE PAÍSES Y BANDERAS ---
    function formatCategoryLabel(cat) {
        const normalized = (cat || 'general').trim().toLowerCase();
        const flagsMap = {
            'colombia': '🇨🇴 Colombia',
            'republica dominicana': '🇩🇴 Rep. Dominicana',
            'república dominicana': '🇩🇴 Rep. Dominicana',
            'alemania': '🇩🇪 Alemania',
            'mexico': '🇲🇽 México',
            'méxico': '🇲🇽 México',
            'espana': '🇪🇸 España',
            'españa': '🇪🇸 España',
            'argentina': '🇦🇷 Argentina',
            'estados unidos': '🇺🇸 EE. UU.',
            'usa': '🇺🇸 EE. UU.',
            'venezuela': '🇻🇪 Venezuela',
            'peru': '🇵🇪 Perú',
            'perú': '🇵🇪 Perú',
            'chile': '🇨🇱 Chile',
            'ecuador': '🇪🇨 Ecuador',
            'panama': '🇵🇦 Panamá',
            'panamá': '🇵🇦 Panamá',
            'puerto rico': '🇵🇷 Puerto Rico',
            'brasil': '🇧🇷 Brasil',
            'francia': '🇫🇷 Francia',
            'italia': '🇮🇹 Italia',
            'internacional': '🌎 Internacional'
        };
        if (flagsMap[normalized]) return flagsMap[normalized];
        
        const capitalized = normalized.replace(/\b\w/g, l => l.toUpperCase());
        return `🌍 ${capitalized}`;
    }

    // --- GENERACIÓN AUTOMÁTICA DE PESTAÑAS DE PAÍSES ---
    function renderTabs() {
        if (!directoryTabsContainer) return;

        const uniqueCategories = [];
        stations.forEach(st => {
            const cat = (st.category || 'colombia').trim().toLowerCase();
            if (cat && !uniqueCategories.includes(cat)) {
                uniqueCategories.push(cat);
            }
        });

        if (currentFilter !== 'all' && !uniqueCategories.includes(currentFilter)) {
            currentFilter = 'all';
        }

        directoryTabsContainer.innerHTML = '';

        // Pestaña "Todas"
        const allBtn = document.createElement('button');
        allBtn.className = `dir-tab ${currentFilter === 'all' ? 'active' : ''}`;
        allBtn.textContent = 'Todas';
        allBtn.addEventListener('click', () => {
            currentFilter = 'all';
            renderTabs();
            renderCatalog();
        });
        directoryTabsContainer.appendChild(allBtn);

        // Pestañas dinámicas según los países existentes en el catálogo
        uniqueCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `dir-tab ${currentFilter === cat ? 'active' : ''}`;
            btn.textContent = formatCategoryLabel(cat);
            btn.addEventListener('click', () => {
                currentFilter = cat;
                renderTabs();
                renderCatalog();
            });
            directoryTabsContainer.appendChild(btn);
        });
    }

    // --- VISUALIZADOR DE AUDIO (HÍBRIDO INTELIGENTE EN VIVO) ---
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    const canvas = document.getElementById('audioCanvas');
    const canvasCtx = canvas ? canvas.getContext('2d') : null;

    function initAudioVisualizer() {
        if (!canvas) return;
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                
                sourceNode = audioCtx.createMediaElementSource(audioStream);
                sourceNode.connect(analyser);
                analyser.connect(audioCtx.destination);
            }
        } catch (e) {
            console.log("Visualizador en modo dinámico alternativo.");
        }
    }

    function drawVisualizer() {
        if (!canvas || !canvasCtx) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        canvasCtx.clearRect(0, 0, width, height);

        let freqData = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

        if (isPlaying) {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            let hasRealData = false;
            if (analyser) {
                try {
                    analyser.getByteFrequencyData(freq
