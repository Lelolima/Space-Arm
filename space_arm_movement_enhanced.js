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
            autoTargeting: true,
            targetingRange: 300,
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
        this.enemyImages = [];
        this.targetedEnemy = null;
        this.gameState = 'playing'; // playing, paused, gameOver
        this.currentLevel = 1;
        
        // Load game assets
        this.loadGameAssets();
        
        // Initialize the game
        this.init();
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
    }
    
    generateCelestialBodies() {
        const bodies = [];
        const numBodies = Math.floor(Math.random() * 10) + 10; // More celestial bodies
        
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
            
            bodies.push({
                x: Math.random() * this.worldSize.width,
                y: Math.random() * this.worldSize.height,
                radius: radius,
                type: type,
                color: color,
                gravitationalPull: gravitationalPull,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                rotation: 0
            });
        }
        
        return bodies;
    }
    
    generateEnemies(count) {
        // Adjust count based on difficulty and level
        count = Math.ceil(count * this.enemySpawnRate * (1 + (this.currentLevel - 1) * 0.2));
        
        // Use the GameAssets helper to create enemies with different types
        const baseEnemies = GameAssets.createEnemyShips(count);
        
        // Apply difficulty multipliers
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
            
            // Add AI behavior based on type and difficulty
            switch(enemy.type) {
                case 1: // Scout - Fast, erratic movement
                    enemy.behavior = 'scout';
                    enemy.fireRate = 1500; // ms between shots
                    enemy.lastFired = Date.now();
                    break;
                    
                case 2: // Fighter - Standard pursuit with flanking
                    enemy.behavior = 'fighter';
                    enemy.fireRate = 1000;
                    enemy.lastFired = Date.now();
                    break;
                    
                case 3: // Destroyer - Slow but powerful
                    enemy.behavior = 'destroyer';
                    enemy.fireRate = 2000;
                    enemy.lastFired = Date.now();
                    break;
            }
        });
        
        return baseEnemies;
    }
    
    generatePowerUp(x, y) {
        const types = ['shield', 'weapon', 'speed'];
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
                    this.keys.right = true;
                    break;
                case ' ':
                    this.keys.fire = true;
                    break;
                case 'q':
                    // Switch weapons
                    this.activeWeaponIndex = (this.activeWeaponIndex + 1) % this.spaceship.weapons.length;
                    break;
                case 'e':
                    // Toggle auto-targeting
                    this.spaceship.autoTargeting = !this.spaceship.autoTargeting;
                    break;
                case 'Escape':
                    // Toggle pause
                    this.togglePause();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.keys.up = false;
                    this.spaceship.thrusting = false;
                    break;
                case 'ArrowDown':
                case 's':
                    this.keys.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.keys.right = false;
                    break;
                case ' ':
                    this.keys.fire = false;
                    break;
            }
        });
        
        // Add touch controls for mobile
        if (this.settings.controlType === 'touch' || 'ontouchstart' in window) {
            this.addTouchControls();
        }
    }
    
    addTouchControls() {
        // Remove existing touch controls if any
        const existingControls = document.querySelector('.touch-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        document.body.appendChild(touchControls);
        
        // Direction buttons
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(dir => {
            const btn = document.createElement('div');
            btn.className = `touch-btn touch-${dir}`;
            btn.innerHTML = `<div class="arrow-${dir}"></div>`;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[dir] = true;
                if (dir === 'up') this.spaceship.thrusting = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[dir] = false;
                if (dir === 'up') this.spaceship.thrusting = false;
            });
            
            touchControls.appendChild(btn);
        });
        
        // Fire button
        const fireBtn = document.createElement('div');
        fireBtn.className = 'touch-btn touch-fire';
        fireBtn.innerText = 'FIRE';
        
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.fire = true;
        });
        
        fireBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.fire = false;
        });
        
        touchControls.appendChild(fireBtn);
        
        // Weapon switch button
        const weaponBtn = document.createElement('div');
        weaponBtn.className = 'touch-btn';
        weaponBtn.innerText = 'ARMA';
        weaponBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.activeWeaponIndex = (this.activeWeaponIndex + 1) % this.spaceship.weapons.length;
        });
        touchControls.appendChild(weaponBtn);
        
        // Auto-target toggle button
        const targetBtn = document.createElement('div');
        targetBtn.className = 'touch-btn';
        targetBtn.innerText = 'MIRA';
        targetBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.spaceship.autoTargeting = !this.spaceship.autoTargeting;
        });
        touchControls.appendChild(targetBtn);
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            // Create pause menu
            const pauseMenu = document.createElement('div');
            pauseMenu.id = 'pause-menu';
            pauseMenu.innerHTML = `
                <div class="pause-container">
                    <h2>JOGO PAUSADO</h2>
                    <button id="resume-btn">Continuar</button>
                    <button id="settings-btn">Configurações</button>
                    <button id="quit-btn">Sair</button>
                </div>
            `;
            document.body.appendChild(pauseMenu);
            
            // Add event listeners
            document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
            document.getElementById('settings-btn').addEventListener('click', () => {
                // Show settings menu
                pauseMenu.style.display = 'none';
                // Implementation would depend on the menu system
            });
            document.getElementById('quit-btn').addEventListener('click', () => {
                // Return to main menu
                location.reload();
            });
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            // Remove pause menu
            const pauseMenu = document.getElementById('pause-menu');
            if (pauseMenu) {
                pauseMenu.remove();
            }
            // Resume game loop
            this.lastTime = Date.now();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    findNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = this.spaceship.targetingRange;
        
        this.enemies.forEach(enemy => {
            const dx = enemy.x - this.spaceship.x;
            const dy = enemy.y - this.spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update spaceship rotation
        if (this.keys.left) {
            this.spaceship.angle -= this.spaceship.rotationSpeed;
        }
        
        if (this.keys.right) {
            this.spaceship.angle += this.spaceship.rotationSpeed;
        }
        
        // Auto-targeting system
        if (this.spaceship.autoTargeting) {
            this.targetedEnemy = this.findNearestEnemy();
            
            if (this.targetedEnemy) {
                // Calculate angle to enemy
                const dx = this.targetedEnemy.x - this.spaceship.x;
                const dy = this.targetedEnemy.y - this.spaceship.y;
                const targetAngle = Math.atan2(dy, dx);
                
                // Gradually rotate towards enemy
                const angleDiff = targetAngle - this.spaceship.angle;
                
                // Normalize angle difference to [-PI, PI]
                let normalizedDiff = angleDiff;
                while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
                while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
                
                // Apply rotation towards enemy with a dampening factor
                this.spaceship.angle += normalizedDiff * 0.03;
            }
        }
        
        // Forward/backward movement
        if (this.keys.up) {
            this.spaceship.velocity.x += Math.cos(this.spaceship.angle) * 0.1;
            this.spaceship.velocity.y += Math.sin(this.spaceship.angle) * 0.1;
        }
        
        if (this.keys.down) {
            this.spaceship.velocity.x -= Math.cos(this.spaceship.angle) * 0.1;
            this.spaceship.velocity.y -= Math.sin(this.spaceship.angle) * 0.1;
        }
        
        // Apply gravitational pull from celestial bodies
        this.celestialBodies.forEach(body => {
            if (body.gravitationalPull > 0) {
                const dx = body.x - this.spaceship.x;
                const dy = body.y - this.spaceship.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only apply gravity if within range
                if (distance < body.radius * 5) {
                    const force = body.gravitationalPull / (distance * distance);
                    const angle = Math.atan2(dy, dx);
                    
                    this.spaceship.velocity.x += Math.cos(angle) * force;
                    this.spaceship.velocity.y += Math.sin(angle) * force;
                }
            }
        });
        
        // Apply max velocity
        const speed = Math.sqrt(
            this.spaceship.velocity.x ** 2 + 
            this.spaceship.velocity.y ** 2
        );
        
        if (speed > this.spaceship.maxVelocity) {
            const ratio = this.spaceship.maxVelocity / speed;
            this.spaceship.velocity.x *= ratio;
            this.spaceship.velocity.y *= ratio;
        }
        
        // Apply friction
        this.spaceship.velocity.x *= this.spaceship.friction;
        this.spaceship.velocity.y *= this.spaceship.friction;
        
        // Update spaceship position
        this.spaceship.x += this.spaceship.velocity.x;
        this.spaceship.y += this.spaceship.velocity.y;
        
        // Wrap around world boundaries
        if (this.spaceship.x < 0) this.spaceship.x = this.worldSize.width;
        if (this.spaceship.x > this.worldSize.width) this.spaceship.x = 0;
        if (this.spaceship.y < 0) this.spaceship.y = this.worldSize.height;
        if (this.spaceship.y > this.worldSize.height) this.spaceship.y = 0;
        
        // Update map position to center on player
        this.mapPosition.x = this.spaceship.x - this.gameCanvas.width / 2;
        this.mapPosition.y = this.spaceship.y - this.gameCanvas.height / 2;
        
        // Keep map position within world bounds
        this.mapPosition.x = Math.max(0, Math.min(this.mapPosition.x, this.worldSize.width - this.gameCanvas.width));
        this.mapPosition.y = Math.max(0, Math.min(this.mapPosition.y, this.worldSize.height - this.gameCanvas.height));
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Regenerate shield
        this.spaceship.shield = Math.min(
            this.spaceship.shield + this.spaceship.shieldRegenRate * deltaTime / 1000,
            this.spaceship.maxShield
        );
        
        // Check collisions
        this.checkCollisions();
        
        // Check level progression
        this.checkLevelProgression();
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Update homing projectiles
            if (projectile.homing && this.targetedEnemy) {
                // Calculate angle to enemy
                const dx = this.targetedEnemy.x - projectile.x;
                const dy = this.targetedEnemy.y - projectile.y;
                const targetAngle = Math.atan2(dy, dx);
                
                // Gradually adjust angle towards target
                const angleDiff = targetAngle - projectile.angle;
                
                // Normalize angle difference
                let normalizedDiff = angleDiff;
                while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
                while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
                
                projectile.angle += normalizedDiff * 0.1;
            }
            
            // Move projectile
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;
            
            // Update distance traveled
            if (projectile.range) {
                projectile.distanceTraveled += projectile.speed;
                
                // Remove if exceeded range
                if (projectile.distanceTraveled > projectile.range) {
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }
            
            // Remove if out of bounds
            if (
                projectile.x < this.mapPosition.x - 100 ||
                projectile.x > this.mapPosition.x + this.gameCanvas.width + 100 ||
                projectile.y < this.mapPosition.y - 100 ||
                projectile.y > this.mapPosition.y + this.gameCanvas.height + 100
            ) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // Different behavior based on enemy type
            const dx = this.spaceship.x - enemy.x;
            const dy = this.spaceship.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            switch(enemy.behavior) {
                case 'scout': // Fast, erratic movement
                    const jitter = Math.sin(Date.now() / 200) * 0.3;
                    enemy.x += Math.cos(angle + jitter) * enemy.speed;
                    enemy.y += Math.sin(angle + jitter) * enemy.speed;
                    break;
                    
                case 'fighter': // Standard pursuit with flanking
                    if (distance < 300) {
                        // Try to flank when close
                        const flankAngle = angle + Math.PI / 4 * Math.sin(Date.now() / 1000);
                        enemy.x += Math.cos(flankAngle) * enemy.speed;
                        enemy.y += Math.sin(flankAngle) * enemy.speed;
                    } else {
                        // Direct pursuit when far
                        enemy.x += Math.cos(angle) * enemy.speed;
                        enemy.y += Math.sin(angle) * enemy.speed;
                    }
                    break;
                    
                case 'destroyer': // Slow but steady, maintains distance
                    if (distance < 200) {
                        // Back away if too close
                        enemy.x -= Math.cos(angle) * enemy.speed * 0.5;
                        enemy.y -= Math.sin(angle) * enemy.speed * 0.5;
                    } else if (distance > 400) {
                        // Approach if too far
                        enemy.x += Math.cos(angle) * enemy.speed;
                        enemy.y += Math.sin(angle) * enemy.speed;
                    } else {
                        // Circle around at optimal range
                        const circleAngle = angle + Math.PI / 2;
                        enemy.x += Math.cos(circleAngle) * enemy.speed * 0.7;
                        enemy.y += Math.sin(circleAngle) * enemy.speed * 0.7;
                    }
                    break;
                    
                default: // Default behavior
                    enemy.x += Math.cos(angle) * enemy.speed;
                    enemy.y += Math.sin(angle) * enemy.speed;
            }
            
            // Update enemy angle to face direction of movement
            enemy.angle = angle;
            
            // Enemy shooting
            if (Date.now() - enemy.lastFired > enemy.fireRate && distance < 500) {
                // Create enemy projectile
                this.projectiles.push({
                    x: enemy.x,
                    y: enemy.y,
                    angle: angle,
                    speed: 5,
                    damage: 5 * this.enemyDamageMultiplier,
                    isEnemyProjectile: true,
                    color: enemy.type === 1 ? '#ff4444' : 
                           enemy.type === 2 ? '#bb44ff' : '#44ff44'
                });
                
                enemy.lastFired = Date.now();
            }
        });
    }
    
    updatePowerUps(deltaTime) {
        // Remove expired power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (Date.now() - powerUp.createdAt > powerUp.lifespan) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Randomly spawn new power-ups
        if (Math.random() < 0.001 * deltaTime / 16) {
            const x = this.mapPosition.x + Math.random() * this.gameCanvas.width;
            const y = this.mapPosition.y + Math.random() * this.gameCanvas.height;
            this.powerUps.push(this.generatePowerUp(x, y));
        }
    }
    
    updateParticles(deltaTime) {
        // Update particle positions and lifetimes
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Move particle
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // Apply friction
            particle.velocity.x *= 0.98;
            particle.velocity.y *= 0.98;
            
            // Reduce size/opacity over time
            particle.size *= 0.95;
            particle.opacity -= 0.02;
            
            // Remove if too small or transparent
            if (particle.size < 0.5 || particle.opacity <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            
            this.particles.push({
                x: x,
                y: y,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                size: Math.random() * 5 + 2,
                color: color,
                opacity: 1
            });
        }
    }
    
    checkCollisions() {
        // Check projectile collisions with enemies
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Skip enemy projectiles
            if (projectile.isEnemyProjectile) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.width / 2) {
                    // Damage enemy
                    const damage = projectile.damage || 10;
                    enemy.health -= damage;
                    
                    // Create hit effect
                    this.createExplosion(projectile.x, projectile.y, '#ffaa00', 5);
                    
                    // Remove projectile
                    this.projectiles.splice(i, 1);
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        // Create explosion
                        this.createExplosion(enemy.x, enemy.y, 
                            enemy.type === 1 ? '#ff4444' : 
                            enemy.type === 2 ? '#bb44ff' : '#44ff44', 
                            30);
                        
                        // Add score based on enemy type
                        const scoreValue = enemy.type === 1 ? 100 : 
                                         enemy.type === 2 ? 250 : 500;
                        this.spaceship.score += scoreValue;
                        
                        // Add experience
                        this.spaceship.experience += scoreValue;
                        
                        // Chance to drop power-up
                        if (Math.random() < 0.3) {
                            this.powerUps.push(this.generatePowerUp(enemy.x, enemy.y));
                        }
                        
                        // Remove enemy
                        this.enemies.splice(j, 1);
                    }
                    
                    break;
                }
            }
        }
        
        // Check enemy projectile collisions with player
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Only check enemy projectiles
            if (!projectile.isEnemyProjectile) continue;
            
            const dx = projectile.x - this.spaceship.x;
            const dy = projectile.y - this.spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.spaceship.width / 2) {
                // Damage player shield
                this.spaceship.shield -= projectile.damage || 5;
                
                // Create hit effect
                this.createExplosion(projectile.x, projectile.y, '#2196F3', 10);
                
                // Remove projectile
                this.projectiles.splice(i, 1);
                
                // Check if player is destroyed
                if (this.spaceship.shield <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // Check collisions with celestial bodies
        this.celestialBodies.forEach(body => {
            const dx = this.spaceship.x - body.x;
            const dy = this.spaceship.y - body.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.spaceship.width / 2 + body.radius * 0.8) {
                // Collision with celestial body
                // Bounce off
                const angle = Math.atan2(dy, dx);
                this.spaceship.velocity.x = Math.cos(angle) * 5;
                this.spaceship.velocity.y = Math.sin(angle) * 5;
                
                // Damage shield
                this.spaceship.shield -= 10;
                
                // Create impact effect
                this.createExplosion(this.spaceship.x, this.spaceship.y, '#ffffff', 15);
                
                // Check if player is destroyed
                if (this.spaceship.shield <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Check collisions with power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const dx = this.spaceship.x - powerUp.x;
            const dy = this.spaceship.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.spaceship.width / 2 + powerUp.radius) {
                // Apply power-up effect
                switch(powerUp.type) {
                    case 'shield':
                        this.spaceship.shield = Math.min(
                            this.spaceship.shield + 50,
                            this.spaceship.maxShield
                        );
                        break;
                        
                    case 'weapon':
                        // Upgrade current weapon temporarily
                        const weapon = this.spaceship.weapons[this.activeWeaponIndex];
                        weapon.damage *= 1.5;
                        setTimeout(() => {
                            weapon.damage /= 1.5;
                        }, 10000);
                        break;
                        
                    case 'speed':
                        // Increase max velocity temporarily
                        const originalVelocity = this.spaceship.maxVelocity;
                        this.spaceship.maxVelocity *= 1.5;
                        setTimeout(() => {
                            this.spaceship.maxVelocity = originalVelocity;
                        }, 10000);
                        break;
                }
                
                // Create collection effect
                this.createExplosion(powerUp.x, powerUp.y, 
                    powerUp.type === 'shield' ? '#4CAF50' : 
                    powerUp.type === 'weapon' ? '#FF5722' : '#2196F3', 
                    15);
                
                // Remove power-up
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    checkLevelProgression() {
        // Check if all enemies are defeated
        if (this.enemies.length === 0) {
            // Increase level
            this.currentLevel++;
            
            // Update level display
            const levelInfo = document.getElementById('level-info');
            if (levelInfo) {
                levelInfo.textContent = this.currentLevel;
            }
            
            // Generate new enemies for next level
            this.enemies = this.generateEnemies(5 + this.currentLevel * 2);
            
            // Show level up message
            this.showLevelUpMessage();
        }
        
        // Check if player has enough experience to level up
        if (this.spaceship.experience >= this.spaceship.experienceToNextLevel) {
            this.spaceship.level++;
            this.spaceship.experience -= this.spaceship.experienceToNextLevel;
            this.spaceship.experienceToNextLevel *= 1.5;
            
            // Improve ship stats
            this.spaceship.maxShield += 20;
            this.spaceship.shield = this.spaceship.maxShield;
            this.spaceship.maxVelocity += 0.5;
            
            // Show ship upgrade message
            this.showShipUpgradeMessage();
        }
    }
    
    showLevelUpMessage() {
        const message = document.createElement('div');
        message.className = 'level-message';
        message.innerHTML = `<h2>NÍVEL ${this.currentLevel}</h2>`;
        document.body.appendChild(message);
        
        // Remove after animation
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 1000);
        }, 2000);
    }
    
    showShipUpgradeMessage() {
        const message = document.createElement('div');
        message.className = 'upgrade-message';
        message.innerHTML = `<h3>NAVE APRIMORADA!</h3><p>Nível ${this.spaceship.level}</p>`;
        document.body.appendChild(message);
        
        // Remove after animation
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 1000);
        }, 2000);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Create game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-container">
                <h2>GAME OVER</h2>
                <p>Pontuação: ${this.spaceship.score}</p>
                <p>Nível: ${this.currentLevel}</p>
                <button id="restart-btn">Jogar Novamente</button>
                <button id="menu-btn">Menu Principal</button>
            </div>
        `;
        document.body.appendChild(gameOverScreen);
        
        // Add event listeners
        document.getElementById('restart-btn').addEventListener('click', () => {
            gameOverScreen.remove();
            this.init();
            this.gameState = 'playing';
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            location.reload();
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // Draw background
        if (this.backgroundImage && this.backgroundImage.complete) {
            // Create tiled background
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = this.backgroundImage.width;
            patternCanvas.height = this.backgroundImage.height;
            const patternCtx = patternCanvas.getContext('2d');
            patternCtx.drawImage(this.backgroundImage, 0, 0);
            
            const pattern = this.ctx.createPattern(patternCanvas, 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        } else {
            // Fallback background
            this.ctx.fillStyle = '#050a1c';
            this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
            
            // Draw simple stars
            this.ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 100; i++) {
                this.ctx.beginPath();
                this.ctx.arc(
                    Math.random() * this.gameCanvas.width,
                    Math.random() * this.gameCanvas.height,
                    Math.random() * 2,
                    0, Math.PI * 2
                );
                this.ctx.fill();
            }
        }
        
        // Draw celestial bodies
        this.renderCelestialBodies();
        
        // Draw power-ups
        this.renderPowerUps();
        
        // Draw particles
        this.renderParticles();
        
        // Draw projectiles
        this.renderProjectiles();
        
        // Draw enemies
        this.renderEnemies();
        
        // Draw spaceship
        this.renderSpaceship();
        
        // Draw targeting reticle if auto-targeting is enabled
        if (this.spaceship.autoTargeting && this.targetedEnemy) {
            this.renderTargetingReticle();
        }
        
        // Draw HUD
        this.renderHUD();
        
        // Update minimap
        this.updateMinimap();
    }
    
    renderCelestialBodies() {
        this.celestialBodies.forEach(body => {
            // Only render if visible on screen
            if (
                body.x + body.radius < this.mapPosition.x ||
                body.x - body.radius > this.mapPosition.x + this.gameCanvas.width ||
                body.y + body.radius < this.mapPosition.y ||
                body.y - body.radius > this.mapPosition.y + this.gameCanvas.height
            ) {
                return;
            }
            
            this.ctx.save();
            
            // Draw with rotation for asteroids
            if (body.type === 'asteroid') {
                body.rotation += body.rotationSpeed;
                
                this.ctx.translate(
                    body.x - this.mapPosition.x,
                    body.y - this.mapPosition.y
                );
                this.ctx.rotate(body.rotation);
                
                // Draw asteroid with irregular shape
                this.ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = body.radius * (0.8 + Math.sin(i * 5) * 0.2);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fillStyle = body.color;
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
            } else {
                // Draw planet with gradient
                const x = body.x - this.mapPosition.x;
                const y = body.y - this.mapPosition.y;
                
                const gradient = this.ctx.createRadialGradient(
                    x - body.radius * 0.3, y - body.radius * 0.3, 0,
                    x, y, body.radius
                );
                gradient.addColorStop(0, body.color);
                gradient.addColorStop(1, this.adjustColor(body.color, -50));
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, body.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add atmosphere glow
                const glowGradient = this.ctx.createRadialGradient(
                    x, y, body.radius * 0.9,
                    x, y, body.radius * 1.1
                );
                glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, body.radius * 1.1, 0, Math.PI * 2);
                this.ctx.fillStyle = glowGradient;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    // Helper function to adjust color brightness
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            const x = powerUp.x - this.mapPosition.x;
            const y = powerUp.y - this.mapPosition.y;
            
            // Skip if not visible
            if (x < -powerUp.radius || x > this.gameCanvas.width + powerUp.radius ||
                y < -powerUp.radius || y > this.gameCanvas.height + powerUp.radius) {
                return;
            }
            
            // Power-up color based on type
            let color;
            switch(powerUp.type) {
                case 'shield':
                    color = '#4CAF50'; // Green
                    break;
                case 'weapon':
                    color = '#FF5722'; // Orange
                    break;
                case 'speed':
                    color = '#2196F3'; // Blue
                    break;
            }
            
            // Draw power-up with pulsing effect
            const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.1;
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                x, y, 0,
                x, y, powerUp.radius * pulseScale * 1.5
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color + '88');
            gradient.addColorStop(1, color + '00');
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, powerUp.radius * pulseScale * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Core
            this.ctx.beginPath();
            this.ctx.arc(x, y, powerUp.radius * pulseScale * 0.7, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
            
            // Icon based on type
            this.ctx.fillStyle = color;
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            let icon;
            switch(powerUp.type) {
                case 'shield': icon = '🛡️'; break;
                case 'weapon': icon = '⚡'; break;
                case 'speed': icon = '💨'; break;
            }
            
            this.ctx.fillText(icon, x, y);
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            const x = particle.x - this.mapPosition.x;
            const y = particle.y - this.mapPosition.y;
            
            // Skip if not visible
            if (x < -particle.size || x > this.gameCanvas.width + particle.size ||
                y < -particle.size || y > this.gameCanvas.height + particle.size) {
                return;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
            this.ctx.fill();
        });
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => {
            const x = projectile.x - this.mapPosition.x;
            const y = projectile.y - this.mapPosition.y;
            
            // Skip if not visible
            if (x < -10 || x > this.gameCanvas.width + 10 ||
                y < -10 || y > this.gameCanvas.height + 10) {
                return;
            }
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(projectile.angle);
            
            if (projectile.isEnemyProjectile) {
                // Enemy projectile
                this.ctx.fillStyle = projectile.color || '#ff4444';
                this.ctx.fillRect(-5, -2, 10, 4);
            } else if (projectile.homing) {
                // Homing missile
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.beginPath();
                this.ctx.moveTo(8, 0);
                this.ctx.lineTo(-8, 4);
                this.ctx.lineTo(-4, 0);
                this.ctx.lineTo(-8, -4);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Thruster effect
                this.ctx.fillStyle = '#ff4400';
                this.ctx.beginPath();
                this.ctx.moveTo(-8, 0);
                this.ctx.lineTo(-12 - Math.random() * 4, 2);
                this.ctx.lineTo(-12 - Math.random() * 4, -2);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                // Standard projectile
                this.ctx.fillStyle = '#88ccff';
                this.ctx.fillRect(-8, -2, 16, 4);
                
                // Glow effect
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
                gradient.addColorStop(0, 'rgba(136, 204, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(136, 204, 255, 0)');
                
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            const x = enemy.x - this.mapPosition.x;
            const y = enemy.y - this.mapPosition.y;
            
            // Skip if not visible
            if (x < -enemy.width || x > this.gameCanvas.width + enemy.width ||
                y < -enemy.height || y > this.gameCanvas.height + enemy.height) {
                return;
            }
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(enemy.angle);
            
            // Use the appropriate enemy image based on type
            if (this.enemyImages.length > 0 && enemy.type <= this.enemyImages.length) {
                const enemyImg = this.enemyImages[enemy.type - 1];
                if (enemyImg && enemyImg.complete) {
                    this.ctx.drawImage(
                        enemyImg,
                        -enemy.width/2,
                        -enemy.height/2,
                        enemy.width,
                        enemy.height
                    );
                } else {
                    // Fallback if image isn't loaded
                    this.ctx.fillStyle = enemy.type === 1 ? '#F44336' : 
                                        enemy.type === 2 ? '#7c4dff' : '#43a047';
                    this.ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
                }
            } else {
                // Fallback if no images are available
                this.ctx.fillStyle = '#F44336';
                this.ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
            }
            
            // Draw health bar above enemy
            const healthBarWidth = enemy.width;
            const healthBarHeight = 4;
            const healthPercent = enemy.health / (enemy.type === 1 ? 50 : enemy.type === 2 ? 100 : 200);
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(-healthBarWidth/2, -enemy.height/2 - 10, healthBarWidth, healthBarHeight);
            
            this.ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : 
                              healthPercent > 0.3 ? '#FFC107' : '#F44336';
            this.ctx.fillRect(
                -healthBarWidth/2, 
                -enemy.height/2 - 10, 
                healthBarWidth * healthPercent, 
                healthBarHeight
            );
            
            this.ctx.restore();
        });
    }
    
    renderSpaceship() {
        this.ctx.save();
        this.ctx.translate(this.spaceship.x - this.mapPosition.x, this.spaceship.y - this.mapPosition.y);
        this.ctx.rotate(this.spaceship.angle);
        
        if (this.spaceshipImage && this.spaceshipImage.complete) {
            this.ctx.drawImage(
                this.spaceshipImage,
                -this.spaceship.width/2,
                -this.spaceship.height/2,
                this.spaceship.width,
                this.spaceship.height
            );
            
            // Add engine glow effect when thrusting
            if (this.spaceship.thrusting) {
                this.ctx.save();
                
                // Create engine glow gradient
                const glowGradient = this.ctx.createRadialGradient(
                    -this.spaceship.width/2, 0, 0,
                    -this.spaceship.width/2, 0, this.spaceship.width/2
                );
                glowGradient.addColorStop(0, 'rgba(0, 195, 255, 0.7)');
                glowGradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
                glowGradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
                
                // Draw engine glow
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(-this.spaceship.width/2, 0, this.spaceship.width/2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            }
        } else {
            // Fallback shape if image isn't loaded
            this.ctx.beginPath();
            this.ctx.moveTo(this.spaceship.width/2, 0);
            this.ctx.lineTo(-this.spaceship.width/2, this.spaceship.height/2);
            this.ctx.lineTo(-this.spaceship.width/2, -this.spaceship.height/2);
            this.ctx.closePath();
            this.ctx.fillStyle = '#2196F3';
            this.ctx.fill();
            
            // Add simple engine effect when thrusting
            if (this.spaceship.thrusting) {
                this.ctx.beginPath();
                this.
        
        // Weapon switch button
                this.ctx.moveTo(-this.spaceship.width/2, 0);
                this.ctx.lineTo(-this.spaceship.width/2 - 20, 10);
                this.ctx.lineTo(-this.spaceship.width/2 - 20, -10);
                this.ctx.closePath();
                this.ctx.fillStyle = '#ff4400';
                this.ctx.fill();
            }
        } // End of renderSpaceship if-else block
