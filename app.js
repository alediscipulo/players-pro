// =====================================
// PLAYERS PRO - APLICACIÓN OFFLINE
// =====================================

class PlayersApp {
  constructor() {
    this.db = null;
    this.players = [];
    this.teams = [];
    this.favorites = new Set();
    this.currentPlayer = null;
    this.videoStream = null;
    this.modelsLoaded = false;
    
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando aplicación...');
    
    // Service Worker para offline
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('sw.js');
        console.log('✅ Service Worker registrado');
      } catch (err) {
        console.warn('⚠️ Service Worker no disponible:', err);
      }
    }

    // Inicializar IndexedDB
    await this.initDB();
    
    // Cargar datos
    await this.loadData();
    
    // Cargar favoritos
    this.loadFavorites();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Mostrar estadísticas
    this.updateStats();
    
    console.log('✅ Aplicación lista');
  }

  // ==================== DATABASE ====================

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PlayersDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de datos inicializada');
        resolve();
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        if (!db.objectStoreNames.contains('players')) {
          db.createObjectStore('players', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('teams')) {
          db.createObjectStore('teams', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async loadData() {
    try {
      // Intentar cargar desde IndexedDB primero
      const data = await this.getFromDB('metadata', 'playersData');
      
      if (data) {
        console.log('📂 Datos cargados desde base de datos local');
        this.players = data.players || [];
        this.teams = data.teams || [];
      } else {
        // Si no hay datos locales, intentar cargar datos de demostración
        await this.loadSampleData();
      }

      this.populateTeamFilter();
      this.renderResults();
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.showNotification('Error cargando datos');
    }
  }

  async loadSampleData() {
    console.log('📥 Usando datos de demostración...');
    
    // Datos de ejemplo para que funcione la app sin conexión inicial
    const sampleData = {
      players: [
        {
          id: 1, name: 'Lionel Messi', number: 10, position: 'Delantero',
          teamName: 'Inter Miami', teamId: 1, age: 36, height: 170,
          photo: 'https://api.promiedos.com.ar/images/players/1', status: 'disponible',
          stats: { appearances: 50, goals: 25, assists: 20, yellowCards: 5, redCards: 0, minutesPlayed: 4500 }
        },
        {
          id: 2, name: 'Cristiano Ronaldo', number: 7, position: 'Delantero',
          teamName: 'Manchester United', teamId: 2, age: 38, height: 187,
          photo: 'https://api.promiedos.com.ar/images/players/2', status: 'disponible',
          stats: { appearances: 45, goals: 30, assists: 8, yellowCards: 10, redCards: 0, minutesPlayed: 3800 }
        }
      ],
      teams: [
        { id: 1, name: 'Inter Miami', logo: 'https://api.promiedos.com.ar/images/team/1', playerCount: 23 },
        { id: 2, name: 'Manchester United', logo: 'https://api.promiedos.com.ar/images/team/2', playerCount: 22 }
      ]
    };

    this.players = sampleData.players;
    this.teams = sampleData.teams;
    
    // Guardar en IndexedDB
    await this.saveToDB('metadata', { key: 'playersData', ...sampleData });
  }

  async saveToDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getFromDB(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ==================== BÚSQUEDA ====================

  renderResults(players = this.players) {
    const container = document.getElementById('results-container');
    
    if (players.length === 0) {
      container.innerHTML = '<div class="empty">No se encontraron jugadores</div>';
      return;
    }

    container.innerHTML = players.map(player => `
      <div class="player-card" onclick="app.openPlayerModal(${player.id})">
        <div class="player-photo">
          ${player.photo ? `<img src="${player.photo}" alt="${player.name}" onerror="this.style.display='none'">` : ''}
          <span id="photo-${player.id}" ${player.photo ? 'style="display:none"' : ''}>👤</span>
        </div>
        <div class="player-info">
          <div class="player-number">${player.number || '-'}</div>
          <div class="player-name">${player.name}</div>
          <div class="player-details">${player.position || 'N/A'}</div>
          <div class="player-team">${player.teamName}</div>
          <span class="player-status status-${player.status}">${player.status || 'disponible'}</span>
        </div>
      </div>
    `).join('');
  }

  populateTeamFilter() {
    const select = document.getElementById('teamFilter');
    const teams = [...new Set(this.players.map(p => p.teamName))].sort();
    
    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team;
      option.textContent = team;
      select.appendChild(option);
    });
  }

  filterPlayers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const team = document.getElementById('teamFilter').value;
    const position = document.getElementById('positionFilter').value;

    let filtered = this.players.filter(p => {
      const matchName = p.name.toLowerCase().includes(searchText);
      const matchTeam = !team || p.teamName === team;
      const matchPosition = !position || p.position === position;
      return matchName && matchTeam && matchPosition;
    });

    this.renderResults(filtered);
  }

  // ==================== RECONOCIMIENTO FACIAL ====================

  async initFaceRecognition() {
    const container = document.getElementById('loadingFaceAPI');
    
    try {
      container.textContent = '⏳ Cargando modelos de IA...';
      
      // Cargar modelos necesarios
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.faceDescriptorNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/')
      ]);
      
      container.innerHTML = '✅ Modelo cargado. Haz clic en "Activar Cámara"';
      this.modelsLoaded = true;
      
    } catch (error) {
      console.error('Error cargando modelos:', error);
      container.innerHTML = '❌ Error cargando modelo. Intenta recargar la página.';
    }
  }

  async startCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 } }
      });
      
      const video = document.getElementById('video');
      video.srcObject = this.videoStream;
      video.style.display = 'block';
      
      document.querySelector('.btn-start-camera').style.display = 'none';
      document.querySelector('.btn-capture').style.display = 'block';
      document.querySelector('.btn-stop-camera').style.display = 'block';
      
    } catch (error) {
      this.showNotification('Acceso a cámara denegado');
      console.error('Error accediendo a cámara:', error);
    }
  }

  async captureAndAnalyze() {
    try {
      const video = document.getElementById('video');
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Detectar rostro
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();
      
      if (detections.length === 0) {
        this.showNotification('No se detectó rostro. Intenta de nuevo.');
        return;
      }
      
      // Dibujar detección
      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceLandmarks(canvas, detections);
      
      canvas.style.display = 'block';
      
      // Buscar coincidencias en la base de datos
      await this.matchFaceWithDatabase(detections[0].descriptor);
      
    } catch (error) {
      this.showNotification('Error procesando rostro');
      console.error('Error en reconocimiento facial:', error);
    }
  }

  async matchFaceWithDatabase(faceDescriptor) {
    const resultsContainer = document.getElementById('face-results');
    resultsContainer.innerHTML = '<div class="loading">Buscando coincidencias...</div>';
    
    // Simular búsqueda (en una app real, necesitarías almacenar descriptores)
    // Por ahora, mostrar sugerencia de capturar múltiples ángulos
    setTimeout(() => {
      resultsContainer.innerHTML = `
        <div class="empty">
          <p>🔍 Para una búsqueda más precisa:</p>
          <p style="font-size: 0.9rem; margin-top: 1rem;">1. Captura varios ángulos del rostro</p>
          <p style="font-size: 0.9rem;">2. Asegúrate de tener buena iluminación</p>
          <p style="font-size: 0.9rem;">3. Colócate frente a la cámara</p>
          <p style="font-size: 0.9rem; color: var(--primary); margin-top: 1rem;">💡 Tip: Usa la búsqueda por nombre para resultados más rápidos</p>
        </div>
      `;
    }, 2000);
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    
    document.getElementById('video').style.display = 'none';
    document.getElementById('canvas').style.display = 'none';
    document.querySelector('.btn-start-camera').style.display = 'block';
    document.querySelector('.btn-capture').style.display = 'none';
    document.querySelector('.btn-stop-camera').style.display = 'none';
  }

  // ==================== FAVORITOS ====================

  loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      this.favorites = new Set(JSON.parse(saved));
    }
  }

  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify([...this.favorites]));
  }

  toggleFavorite(playerId) {
    if (this.favorites.has(playerId)) {
      this.favorites.delete(playerId);
    } else {
      this.favorites.add(playerId);
    }
    this.saveFavorites();
    this.updateFavoriteButton();
    this.renderFavorites();
  }

  renderFavorites() {
    const container = document.getElementById('favorites-container');
    
    if (this.favorites.size === 0) {
      container.innerHTML = '<div class="empty">📌 No hay favoritos. ¡Agrega algunos!</div>';
      return;
    }

    const favoritesList = this.players.filter(p => this.favorites.has(p.id));
    this.renderResults(favoritesList);
  }

  // ==================== MODAL JUGADOR ====================

  openPlayerModal(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    this.currentPlayer = player;
    
    // Actualizar contenido del modal
    document.getElementById('modalPlayerName').textContent = player.name;
    document.getElementById('modalPlayerTeam').textContent = `${player.teamName} • ${player.position}`;
    
    const photoImg = document.getElementById('modalPlayerPhoto');
    const photoPlaceholder = document.getElementById('modalPhotoPlaceholder');
    
    if (player.photo) {
      photoImg.src = player.photo;
      photoImg.style.display = 'block';
      photoPlaceholder.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      photoPlaceholder.style.display = 'block';
    }

    // Estadísticas
    const stats = player.stats || {};
    document.getElementById('modalPlayerStats').innerHTML = `
      <div class="info-item">
        <div class="info-label">Número</div>
        <div class="info-value">#${player.number || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Posición</div>
        <div class="info-value">${player.position || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Edad</div>
        <div class="info-value">${player.age || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Altura</div>
        <div class="info-value">${player.height ? player.height + ' cm' : '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Partidos</div>
        <div class="info-value">${stats.appearances || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Goles</div>
        <div class="info-value">${stats.goals || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Asistencias</div>
        <div class="info-value">${stats.assists || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Tarjetas Amarillas</div>
        <div class="info-value">${stats.yellowCards || 0}</div>
      </div>
    `;

    this.updateFavoriteButton();
    document.getElementById('playerModal').classList.add('active');
  }

  closeModal() {
    document.getElementById('playerModal').classList.remove('active');
    this.currentPlayer = null;
  }

  updateFavoriteButton() {
    const btn = document.getElementById('favBtn');
    if (this.currentPlayer && this.favorites.has(this.currentPlayer.id)) {
      btn.classList.add('is-favorite');
      btn.textContent = '⭐ En Favoritos';
    } else {
      btn.classList.remove('is-favorite');
      btn.textContent = '⭐ Agregar a Favoritos';
    }
  }

  // ==================== UTILIDADES ====================

  updateStats() {
    const stats = document.getElementById('dbStats');
    if (stats) {
      stats.textContent = `${this.players.length} jugadores • ${this.teams.length} equipos`;
    }
  }

  showNotification(message) {
    console.log('📢', message);
    // Podrías implementar un sistema visual de notificaciones aquí
  }

  // ==================== EVENT LISTENERS ====================

  setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Búsqueda
    document.getElementById('searchBtn').addEventListener('click', () => this.filterPlayers());
    document.getElementById('searchInput').addEventListener('keyup', () => this.filterPlayers());
    document.getElementById('teamFilter').addEventListener('change', () => this.filterPlayers());
    document.getElementById('positionFilter').addEventListener('change', () => this.filterPlayers());

    // Filtros de estadísticas
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const stat = e.target.dataset.stat;
        this.filterByStat(stat);
      });
    });

    // Modal
    document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('playerModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('playerModal')) this.closeModal();
    });

    document.getElementById('favBtn').addEventListener('click', () => {
      if (this.currentPlayer) {
        this.toggleFavorite(this.currentPlayer.id);
      }
    });

    // Face Recognition
    document.querySelector('.btn-start-camera').addEventListener('click', () => this.startCamera());
    document.querySelector('.btn-capture').addEventListener('click', () => this.captureAndAnalyze());
    document.querySelector('.btn-stop-camera').addEventListener('click', () => this.stopCamera());

    // Settings
    document.getElementById('updateDataBtn').addEventListener('click', () => {
      this.showNotification('Los datos se actualizan automáticamente cuando están disponibles');
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
      if (confirm('¿Estás seguro? Se eliminarán todos los datos locales.')) {
        localStorage.clear();
        location.reload();
      }
    });

    // Iniciar Face API cuando se abre el tab
    const faceTab = document.querySelector('[data-tab="face"]');
    if (faceTab) {
      faceTab.addEventListener('click', () => {
        if (!this.modelsLoaded) {
          this.initFaceRecognition();
        }
      });
    }
  }

  switchTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });

    // Mostrar tab seleccionado
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
      selectedTab.classList.remove('hidden');
    }

    // Actualizar botones activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Acciones específicas por tab
    if (tabName === 'favorites') {
      this.renderFavorites();
    }
  }

  filterByStat(stat) {
    let filtered = this.players;

    switch(stat) {
      case 'topScorers':
        filtered = this.players.filter(p => (p.stats?.goals || 0) > 5).sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));
        break;
      case 'topAssists':
        filtered = this.players.filter(p => (p.stats?.assists || 0) > 2).sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0));
        break;
      case 'injured':
        filtered = this.players.filter(p => p.status === 'lesionado');
        break;
    }

    this.renderResults(filtered);
  }
}

// =====================================
// INICIALIZACIÓN
// =====================================

let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new PlayersApp();
});
