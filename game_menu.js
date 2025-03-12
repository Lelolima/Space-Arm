// Game Menu System for Space Combat

class GameMenu {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.currentScreen = null;
        this.gameSettings = {
            difficulty: 'normal', // easy, normal, hard
            soundEnabled: true,
            musicEnabled: true,
            controlType: 'keyboard' // keyboard, touch
        };
        
        // Load saved settings if available
        this.loadSettings();
    }
    
    loadSettings() {
        // Try to load settings from localStorage
        try {
            const savedSettings = localStorage.getItem('spaceGameSettings');
            if (savedSettings) {
                this.gameSettings = JSON.parse(savedSettings);
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }
    
    saveSettings() {
        // Save current settings to localStorage
        try {
            localStorage.setItem('spaceGameSettings', JSON.stringify(this.gameSettings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
    
    showMainMenu() {
        this.clearScreen();
        
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        
        // Game title
        const title = document.createElement('h1');
        title.className = 'game-title';
        title.textContent = 'SPACE COMBAT';
        menuContainer.appendChild(title);
        
        // Menu options
        const options = [
            { text: 'INICIAR JOGO', action: () => this.startGame() },
            { text: 'CONFIGURAÇÕES', action: () => this.showSettings() },
            { text: 'COMO JOGAR', action: () => this.showInstructions() },
            { text: 'CRÉDITOS', action: () => this.showCredits() }
        ];
        
        const menuList = document.createElement('ul');
        menuList.className = 'menu-list';
        
        options.forEach(option => {
            const menuItem = document.createElement('li');
            menuItem.className = 'menu-item';
            menuItem.textContent = option.text;
            menuItem.addEventListener('click', option.action);
            menuList.appendChild(menuItem);
        });
        
        menuContainer.appendChild(menuList);
        this.parentElement.appendChild(menuContainer);
        this.currentScreen = menuContainer;
        
        // Add animated background
        this.createAnimatedBackground();
    }
    
    showSettings() {
        this.clearScreen();
        
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'menu-container settings-container';
        
        // Settings title
        const title = document.createElement('h2');
        title.className = 'settings-title';
        title.textContent = 'CONFIGURAÇÕES';
        settingsContainer.appendChild(title);
        
        // Difficulty setting
        const difficultyContainer = document.createElement('div');
        difficultyContainer.className = 'setting-item';
        
        const difficultyLabel = document.createElement('span');
        difficultyLabel.textContent = 'Dificuldade:';
        difficultyContainer.appendChild(difficultyLabel);
        
        const difficulties = ['Fácil', 'Normal', 'Difícil'];
        const difficultyValues = ['easy', 'normal', 'hard'];
        
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'selector';
        
        difficulties.forEach((diff, index) => {
            const option = document.createElement('span');
            option.className = 'selector-option';
            option.textContent = diff;
            if (this.gameSettings.difficulty === difficultyValues[index]) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                // Remove selected class from all options
                difficultySelector.querySelectorAll('.selector-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Update settings
                this.gameSettings.difficulty = difficultyValues[index];
                this.saveSettings();
            });
            
            difficultySelector.appendChild(option);
        });
        
        difficultyContainer.appendChild(difficultySelector);
        settingsContainer.appendChild(difficultyContainer);
        
        // Sound toggle
        const soundContainer = document.createElement('div');
        soundContainer.className = 'setting-item';
        
        const soundLabel = document.createElement('span');
        soundLabel.textContent = 'Efeitos Sonoros:';
        soundContainer.appendChild(soundLabel);
        
        const soundToggle = document.createElement('div');
        soundToggle.className = 'toggle ' + (this.gameSettings.soundEnabled ? 'on' : 'off');
        soundToggle.innerHTML = '<div class="toggle-handle"></div>';
        soundToggle.addEventListener('click', () => {
            this.gameSettings.soundEnabled = !this.gameSettings.soundEnabled;
            soundToggle.className = 'toggle ' + (this.gameSettings.soundEnabled ? 'on' : 'off');
            this.saveSettings();
        });
        
        soundContainer.appendChild(soundToggle);
        settingsContainer.appendChild(soundContainer);
        
        // Music toggle
        const musicContainer = document.createElement('div');
        musicContainer.className = 'setting-item';
        
        const musicLabel = document.createElement('span');
        musicLabel.textContent = 'Música:';
        musicContainer.appendChild(musicLabel);
        
        const musicToggle = document.createElement('div');
        musicToggle.className = 'toggle ' + (this.gameSettings.musicEnabled ? 'on' : 'off');
        musicToggle.innerHTML = '<div class="toggle-handle"></div>';
        musicToggle.addEventListener('click', () => {
            this.gameSettings.musicEnabled = !this.gameSettings.musicEnabled;
            musicToggle.className = 'toggle ' + (this.gameSettings.musicEnabled ? 'on' : 'off');
            this.saveSettings();
        });
        
        musicContainer.appendChild(musicToggle);
        settingsContainer.appendChild(musicContainer);
        
        // Control type setting
        const controlContainer = document.createElement('div');
        controlContainer.className = 'setting-item';
        
        const controlLabel = document.createElement('span');
        controlLabel.textContent = 'Controles:';
        controlContainer.appendChild(controlLabel);
        
        const controls = ['Teclado', 'Touch'];
        const controlValues = ['keyboard', 'touch'];
        
        const controlSelector = document.createElement('div');
        controlSelector.className = 'selector';
        
        controls.forEach((control, index) => {
            const option = document.createElement('span');
            option.className = 'selector-option';
            option.textContent = control;
            if (this.gameSettings.controlType === controlValues[index]) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                // Remove selected class from all options
                controlSelector.querySelectorAll('.selector-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Update settings
                this.gameSettings.controlType = controlValues[index];
                this.saveSettings();
            });
            
            controlSelector.appendChild(option);
        });
        
        controlContainer.appendChild(controlSelector);
        settingsContainer.appendChild(controlContainer);
        
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', () => this.showMainMenu());
        settingsContainer.appendChild(backButton);
        
        this.parentElement.appendChild(settingsContainer);
        this.currentScreen = settingsContainer;
    }
    
    showInstructions() {
        this.clearScreen();
        
        const instructionsContainer = document.createElement('div');
        instructionsContainer.className = 'menu-container instructions-container';
        
        // Instructions title
        const title = document.createElement('h2');
        title.className = 'instructions-title';
        title.textContent = 'COMO JOGAR';
        instructionsContainer.appendChild(title);
        
        // Instructions content
        const content = document.createElement('div');
        content.className = 'instructions-content';
        content.innerHTML = `
            <div class="instruction-section">
                <h3>Controles</h3>
                <p><span class="key">W</span> ou <span class="key">↑</span> - Acelerar</p>
                <p><span class="key">S</span> ou <span class="key">↓</span> - Desacelerar</p>
                <p><span class="key">A</span> ou <span class="key">←</span> - Girar à esquerda</p>
                <p><span class="key">D</span> ou <span class="key">→</span> - Girar à direita</p>
                <p><span class="key">Espaço</span> - Disparar</p>
            </div>
            
            <div class="instruction-section">
                <h3>Objetivo</h3>
                <p>Destrua as naves inimigas enquanto navega pelo espaço.</p>
                <p>Evite colisões com asteroides e inimigos.</p>
                <p>Colete power-ups para melhorar suas armas e escudos.</p>
            </div>
            
            <div class="instruction-section">
                <h3>Dicas</h3>
                <p>Use o minimapa para localizar inimigos e recursos.</p>
                <p>A mira automática ajuda a atingir inimigos próximos.</p>
                <p>Diferentes inimigos têm comportamentos distintos.</p>
            </div>
        `;
        instructionsContainer.appendChild(content);
        
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', () => this.showMainMenu());
        instructionsContainer.appendChild(backButton);
        
        this.parentElement.appendChild(instructionsContainer);
        this.currentScreen = instructionsContainer;
    }
    
    showCredits() {
        this.clearScreen();
        
        const creditsContainer = document.createElement('div');
        creditsContainer.className = 'menu-container credits-container';
        
        // Credits title
        const title = document.createElement('h2');
        title.className = 'credits-title';
        title.textContent = 'CRÉDITOS';
        creditsContainer.appendChild(title);
        
        // Credits content
        const content = document.createElement('div');
        content.className = 'credits-content';
        content.innerHTML = `
            <p class="credit-item">Desenvolvimento: Space Combat Team</p>
            <p class="credit-item">Design: Creative Space Studios</p>
            <p class="credit-item">Música: Stellar Sounds</p>
            <p class="credit-item">Efeitos Sonoros: Cosmic Audio</p>
            <p class="credit-item">Agradecimentos especiais a todos os jogadores!</p>
        `;
        creditsContainer.appendChild(content);
        
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', () => this.showMainMenu());
        creditsContainer.appendChild(backButton);
        
        this.parentElement.appendChild(creditsContainer);
        this.currentScreen = creditsContainer;
    }
    
    startGame() {
        // Hide menu
        this.clearScreen();
        
        // Create loading screen
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.innerHTML = `
            <h1 id="game-title">SPACE COMBAT</h1>
            <p>Carregando sistema de navegação...</p>
            <div id="loading-bar">
                <div id="progress-bar"></div>
            </div>
        `;
        this.parentElement.appendChild(loadingScreen);
        
        // Show loading progress
        const progressBar = loadingScreen.querySelector('#progress-bar');
        let progress = 0;
        
        const loadingInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    this.initGame();
                }, 500);
            }
        }, 100);
    }
    
    initGame() {
        // Initialize game with current settings
        const gameCanvas = document.getElementById('game-canvas');
        const minimap = document.getElementById('minimap');
        
        // Create game info elements if they don't exist
        if (!document.getElementById('game-info')) {
            const gameInfo = document.createElement('div');
            gameInfo.id = 'game-info';
            gameInfo.innerHTML = `
                <div>Velocidade: <span id="speed-info">0</span></div>
                <div>Posição: <span id="position-info">0,0</span></div>
                <div>Inimigos: <span id="enemies-info">0</span></div>
                <div>Nível: <span id="level-info">1</span></div>
            `;
            document.body.appendChild(gameInfo);
        }
        
        // Create pause button
        const pauseButton = document.createElement('button');
        pauseButton.id = 'pause-button';
        pauseButton.textContent = '⏸️';
        pauseButton.addEventListener('click', () => this.pauseGame());
        document.body.appendChild(pauseButton);
        
        // Initialize game controller with difficulty settings
        const controller = new SpaceshipController(gameCanvas, minimap, this.gameSettings);
        this.gameController = controller;
        
        // Store reference to game controller
        window.gameController = controller;
    }
