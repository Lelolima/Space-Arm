// Enhanced Space Combat Game Controller

class SpaceshipController {
    constructor(gameCanvas, mapCanvas, gameSettings = {}) {
        // Default settings if none provided
        this.settings = {
            difficulty: 'normal',
            soundEnabled: true,
            musicEnabled: true,
            controlType: 'keyboard',
            ...gameSettings
        };
        
        this.spaceship = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            width: 64,
            height: 64,
            speed: 5,
            rotationSpeed: 0.05,
            angle: 0,
            thrusting: false,
            velocity: { x: 0, y: 0 },
            maxVelocity: 8,
            friction: 0.98,
            weapons: [],
            shield: 100,
            maxShield: 100,
            shieldRegenRate: 0.05,
            autoTargeting: true,  // Auto-targeting enabled by default
            targetingRange: 400,  // Increased targeting range
            level: 1,
            score: 0,
            experience: 0,
            experienceToNextLevel: 1000
        };
        
        // Adjust spaceship properties based on difficulty
        this.applyDifficultySettings();
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false,
            special: false
        };
        
        this.gameCanvas = gameCanvas;
        this.ctx = gameCanvas.getContext('2d');
        
        this.mapCanvas = mapCanvas;
        this.mapCtx = mapCanvas.getContext('2d');
        
        this.mapPosition = { x: 0, y: 0 };
        this.worldSize = {
            width: this.gameCanvas.width * 3,
            height: this.gameCanvas.height * 3
        };
        
        this.celestialBodies = [];
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
        this.interactiveObjects = [];
        this.enemyImages = [];
        this.targetedEnemy = null;
        this.gameState = 'playing'; // playing, paused, gameOver
        this.currentLevel = 1;
        
        // Create targeting reticle element
        this.createTargetingReticle();
        
        // Load game assets
        this.loadGameAssets();
        
        // Initialize the game
        this.init();
    }
    
    createTargetingReticle() {
        // Create targeting reticle for visual feedback
        this.reticle = document.createElement('div');
        this.reticle.className = 'targeting-reticle';
        document.body.appendChild(this.reticle);
    }
    
    applyDifficultySettings() {
        switch(this.settings.difficulty) {
            case 'easy':
                this.spaceship.maxShield = 150;
                this.spaceship.shield = 150;
                this.spaceship.shieldRegenRate = 0.1;
                this.spaceship.maxVelocity = 10;
                this.enemyDamageMultiplier = 0.7;
                this.enemyHealthMultiplier = 0.8;
                this.enemySpeedMultiplier = 0.8;
                this.enemySpawnRate = 0.7;
                this.spaceship.targetingRange = 500; // Increased targeting range for easy mode
                break;
                
            case 'normal':
                this.spaceship.maxShield = 100;
                this.spaceship.shield = 100;
                this.spaceship.shieldRegenRate = 0.05;
                this.spaceship.maxVelocity = 8;
                this.enemyDamageMultiplier = 1.0;
                this.enemyHealthMultiplier = 1.0;
                this.enemySpeedMultiplier = 1.0;
                this.enemySpawnRate = 1.0;
                this.spaceship.targetingRange = 400;
                break;
                
            case 'hard':
                this.spaceship.maxShield = 80;
                this.spaceship.shield = 80;
                this.spaceship.shieldRegenRate = 0.03;
                this.spaceship.maxVelocity = 7;
                this.enemyDamageMultiplier = 1.3;
                this.enemyHealthMultiplier = 1.2;
                this.enemySpeedMultiplier = 1.2;
                this.enemySpawnRate = 1.3;
                this.spaceship.targetingRange = 300; // Reduced targeting range for hard mode
                break;
        }
    }
    
    async loadGameAssets() {
        // Convert SVG to Image for spaceship
        this.spaceshipImage = await GameAssets.svgToImage(spaceshipSVG, 64, 64);
        
        // Create space background
        const backgroundDataUrl = GameAssets.createSpaceBackground(this.gameCanvas.width, this.gameCanvas.height);
        this.backgroundImage = new Image();
        this.backgroundImage.src = backgroundDataUrl;
        
        // Load enemy ship images
        for (let i = 0; i < enemyShipsSVG.length; i++) {
            const enemyImg = await GameAssets.svgToImage(enemyShipsSVG[i], 48, 48);
            this.enemyImages.push(enemyImg);
        }
        
        // Load sound effects if enabled
        if (this.settings.soundEnabled) {
            this.loadSoundEffects();
        }
    }
    
    loadSoundEffects() {
        // Sound effects would be loaded here
        // This is a placeholder for future implementation
    }
    
    generateCelestialBodies() {
        const bodies = [];
        const numBodies = Math.floor(Math.random() * 10) + 15; // More celestial bodies for a richer environment
        
        for (let i = 0; i < numBodies; i++) {
            const type = Math.random() > 0.6 ? 'planet' : 'asteroid';
            const radius = type === 'planet' ? Math.random() * 80 + 40 : Math.random() * 30 + 10;
            
            // Generate colors based on type
            let color;
            if (type === 'planet') {
                // Planet colors
                const planetColors = [
                    '#4CAF50', // Green
                    '#2196F3', // Blue
                    '#9C27B0', // Purple
                    '#FF5722', // Orange
                    '#607D8B'  // Blue Grey
                ];
                color = planetColors[Math.floor(Math.random() * planetColors.length)];
            } else {
                // Asteroid colors
                const asteroidColors = [
                    '#795548', // Brown
                    '#9E9E9E', // Grey
                    '#607D8B', // Blue Grey
                    '#8D6E63', // Brown
                    '#757575'  // Dark Grey
                ];
                color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
            }
            
            // Add gravitational pull for larger bodies
            const gravitationalPull = type === 'planet' ? radius / 20 : 0;
            
            // Add interactive properties for some celestial bodies
            const isInteractive = Math.random() > 0.7;
            let interactiveType = null;
            let interactiveEffect = null;
            
            if (isInteractive) {
                const interactiveTypes = ['speedBoost', 'shieldRecharge', 'weaponUpgrade', 'scoreBonus'];
                interactiveType = interactiveTypes[Math.floor(Math.random() * interactiveTypes.length)];
                
                switch(interactiveType) {
                    case 'speedBoost':
                        interactiveEffect = () => {
                            this.spaceship.maxVelocity *= 1.2;
                            setTimeout(() => {
                                this.spaceship.maxVelocity /= 1.2;
                            }, 10000); // 10 seconds boost
                        };
                        break;
                    case 'shieldRecharge':
                        interactiveEffect = () => {
                            this.spaceship.shield = this.spaceship.maxShield;
                        };
                        break;
                    case 'weaponUpgrade':
                        interactiveEffect = () => {
                            // Temporary weapon upgrade
                            const currentWeapon = this.spaceship.weapons[this.activeWeaponIndex];
                            currentWeapon.damage *= 1.5;
                            setTimeout(() => {
                                currentWeapon.damage /= 1.5;
                            }, 15000); // 15 seconds upgrade
                        };
                        break;
                    case 'scoreBonus':
                        interactiveEffect = () => {
                            this.spaceship.score += 500;
                        };
                        break;
                }
            }
            
            bodies.push({
                x: Math.random() * this.worldSize.width,
                y: Math.random() * this.worldSize.height,
                radius: radius,
                type: type,
                color: color,
                gravitationalPull: gravitationalPull,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                rotation: 0,
                isInteractive: isInteractive,
                interactiveType: interactiveType,
                interactiveEffect: interactiveEffect,
                interacted: false
            });
        }
        
        return bodies;
    }
    
    generateEnemies(count) {
        // Adjust count based on difficulty and level
        count = Math.ceil(count * this.enemySpawnRate * (1 + (this.currentLevel - 1) * 0.2));
        
        // Use the GameAssets helper to create enemies with different types
        const baseEnemies = GameAssets.createEnemyShips(count);
        
        // Apply difficulty multipliers and enhanced AI behaviors
        baseEnemies.forEach(enemy => {
            enemy.health *= this.enemyHealthMultiplier;
            enemy.speed *= this.enemySpeedMultiplier;
            
            // Make sure enemies are not too close to the player at start
            const dx = this.spaceship.x - enemy.x;
            const dy = this.spaceship.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too close, reposition
            if (distance < 400) {
                enemy.x = this.spaceship.x + (Math.random() > 0.5 ? 1 : -1) * (400 + Math.random() * 300);
                enemy.y = this.spaceship.y + (Math.random() > 0.5 ? 1 : -1) * (400 + Math.random() * 300);
            }
            
            // Add enhanced AI behavior based on type and difficulty
            switch(enemy.type) {
                case 1: // Scout - Fast, erratic movement
                    enemy.behavior = 'scout';
                    enemy.fireRate = 1500; // ms between shots
                    enemy.lastFired = Date.now();
                    enemy.evasionChance = 0.7; // High chance to evade player shots
                    enemy.flankingBehavior = true; // Will try to flank the player
                    break;
                    
                case 2: // Fighter - Standard pursuit with flanking
                    enemy.behavior = 'fighter';
                    enemy.fireRate = 1000;
                    enemy.lastFired = Date.now();
                    enemy.evasionChance = 0.4;
                    enemy.flankingBehavior = true;
                    break;
                    
                case 3: // Destroyer - Slow but powerful
                    enemy.behavior = 'destroyer';
                    enemy.fireRate = 2000;
                    enemy.lastFired = Date.now();
                    enemy.evasionChance = 0.2; // Low chance to evade
                    enemy.flankingBehavior = false; // Direct approach
                    break;
            }
        });
        
        return baseEnemies;
    }
    
    generatePowerUp(x, y) {
        const types = ['shield', 'weapon', 'speed', 'extraLife'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            x: x,
            y: y,
            type: type,
            radius: 15,
            collected: false,
            createdAt: Date.now(),
            lifespan: 10000 // 10 seconds lifespan
        };
    }
    
    init() {
        // Configure canvas sizes
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;
        
        this.mapCanvas.width = 200;
        this.mapCanvas.height = 200;
        
        // Generate celestial bodies
        this.celestialBodies = this.generateCelestialBodies();
        
        // Initialize enemies based on level
        this.enemies = this.generateEnemies(5 + this.currentLevel * 2);
        
        // Initialize weapons
        this.spaceship.weapons = [
            new StandardWeapon(this.spaceship, 10, 10, 800),
            new HomingWeapon(this.spaceship, 15, 8, 1000)
        ];
        
        // Set active weapon
        this.activeWeaponIndex = 0;
        
        // Setup controls
        this.setupControls();
        
        // Start game loop
        this.lastTime = Date.now();
        this.gameLoop();
    }
    
    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.keys.up = true;
                    this.spaceship.thrusting = true;
                    break;
                case 'ArrowDown':
                case 's':
                    this.keys.down = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.keys.right = true