// Optimized Game Launcher for Space Combat Game

class OptimizedGameLauncher {
    constructor() {
        this.gameController = null;
        this.physicsEngine = null;
        this.mapSystem = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = 0;
        this.currentFps = 0;
        this.fpsElement = null;
        
        // Performance optimization flags
        this.settings = {
            enableParticleLimit: true,
            maxParticles: 200,
            useRequestAnimationFrame: true,
            optimizeCollisionDetection: true,
            useObjectPooling: true,
            enableOcclusion: true,
            renderDistance: 1500,
            lowDetailDistance: 1000,
            enableFpsCounter: true
        };
        
        // Object pools
        this.projectilePool = [];
        this.particlePool = [];
        this.enemyPool = [];
    }
    
    init() {
        console.log('Initializing optimized game launcher...');
        
        // Create FPS counter if enabled
        if (this.settings.enableFpsCounter) {
            this.createFpsCounter();
        }
        
        // Find the game canvas and map canvas
        const gameCanvas = document.getElementById('game-canvas');
        const mapCanvas = document.getElementById('map-canvas');
        
        if (!gameCanvas || !mapCanvas) {
            console.error('Game canvas or map canvas not found!');
            return;
        }
        
        // Initialize physics engine
        this.physicsEngine = new EnhancedPhysics();
        
        // Initialize game controller with optimized settings
        const gameSettings = {
            difficulty: 'normal',
            soundEnabled: true,
            musicEnabled: true,
            controlType: 'keyboard',
            optimized: true
        };
        
        this.gameController = new SpaceshipController(gameCanvas, mapCanvas, gameSettings);
        
        // Set physics engine reference in game controller
        this.gameController.physics = this.physicsEngine;
        this.physicsEngine.gameController = this.gameController;
        
        // Initialize map system
        this.mapSystem = new InteractiveMap(this.gameController, mapCanvas);
        
        // Apply optimizations
        this.applyOptimizations();
        
        // Start the optimized game loop
        this.startGameLoop();
        
        console.log('Optimized game launcher initialized successfully!');
    }
    
    createFpsCounter() {
        this.fpsElement = document.createElement('div');
        this.fpsElement.id = 'fps-counter';
        this.fpsElement.style.position = 'fixed';
        this.fpsElement.style.top = '10px';
        this.fpsElement.style.right = '10px';
        this.fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.fpsElement.style.color = '#4080ff';
        this.fpsElement.style.padding = '5px 10px';
        this.fpsElement.style.borderRadius = '5px';
        this.fpsElement.style.fontFamily = 'monospace';
        this.fpsElement.style.zIndex = '1000';
        document.body.appendChild(this.fpsElement);
    }
    
    applyOptimizations() {
        // 1. Optimize collision detection
        if (this.settings.optimizeCollisionDetection && this.physicsEngine) {
            // Use spatial partitioning for collision detection
            this.physicsEngine.useSpatialPartitioning = true;
            this.physicsEngine.gridCellSize = 200; // Size of each grid cell
        }
        
        // 2. Set up object pooling
        if (this.settings.useObjectPooling) {
            this.initializeObjectPools();
        }
        
        // 3. Optimize rendering
        if (this.gameController && this.gameController.ctx) {
            // Disable image smoothing for pixel art
            this.gameController.ctx.imageSmoothingEnabled = false;
        }
        
        // 4. Optimize particle system
        if (this.settings.enableParticleLimit && this.gameController) {
            this.gameController.maxParticles = this.settings.maxParticles;
        }
    }
    
    initializeObjectPools() {
        // Pre-allocate projectiles
        for (let i = 0; i < 50; i++) {
            this.projectilePool.push({
                active: false,
                x: 0,
                y: 0,
                velocity: { x: 0, y: 0 },
                angle: 0,
                speed: 0,
                damage: 0,
                lifeTime: 0,
                isPlayerProjectile: false
            });
        }
        
        // Pre-allocate particles
        for (let i = 0; i < this.settings.maxParticles; i++) {
            this.particlePool.push({
                active: false,
                x: 0,
                y: 0,
                velocity: { x: 0, y: 0 },
                color: '#ffffff',
                size: 1,
                lifeTime: 0,
                maxLifeTime: 0,
                alpha: 1
            });
        }
    }
    
    getProjectileFromPool() {
        for (let i = 0; i < this.projectilePool.length; i++) {
            if (!this.projectilePool[i].active) {
                this.projectilePool[i].active = true;
                return this.projectilePool[i];
            }
        }
        
        // If no inactive projectiles, create a new one
        const newProjectile = {
            active: true,
            x: 0,
            y: 0,
            velocity: { x: 0, y: 0 },
            angle: 0,
            speed: 0,
            damage: 0,
            lifeTime: 0,
            isPlayerProjectile: false
        };
        
        this.projectilePool.push(newProjectile);
        return newProjectile;
    }
    
    getParticleFromPool() {
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].active) {
                this.particlePool[i].active = true;
                return this.particlePool[i];
            }
        }
        
        // If we've reached the particle limit, reuse the oldest particle
        if (this.settings.enableParticleLimit) {
            const particle = this.particlePool[0];
            particle.active = true;
            return particle;
        }
        
        return null;
    }
    
    startGameLoop() {
        // Use requestAnimationFrame for optimal performance
        if (this.settings.useRequestAnimationFrame) {
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            // Fallback to setInterval if needed
            setInterval(this.gameLoop.bind(this), 16); // ~60 FPS
        }
    }
    
    gameLoop(timestamp) {
        // Calculate delta time for smooth animation
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate > this.fpsUpdateInterval) {
            this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            if (this.fpsElement) {
                this.fpsElement.textContent = `FPS: ${this.currentFps}`;
            }
            this.lastFpsUpdate = timestamp;
            this.frameCount = 0;
        }
        
        // Skip frames if performance is poor (deltaTime too high)
        if (deltaTime > 100) {
            console.warn('Performance warning: Frame skipped due to high delta time');
            if (this.settings.useRequestAnimationFrame) {
                requestAnimationFrame(this.gameLoop.bind(this));
            }
            return;
        }
        
        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue the game loop
        if (this.settings.useRequestAnimationFrame) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    update(deltaTime) {
        // Normalize deltaTime to ensure consistent movement regardless of frame rate
        const normalizedDelta = deltaTime / 16.667; // 60 FPS = 16.667ms per frame
        
        // Update game controller
        if (this.gameController) {
            // Update player and enemies
            this.gameController.update(normalizedDelta);
            
            // Update interactive map
            if (this.mapSystem) {
                this.mapSystem.update();
            }
            
            // Optimized collision detection
            if (this.settings.optimizeCollisionDetection) {
                this.performOptimizedCollisionDetection();
            }
            
            // Limit particles if needed
            if (this.settings.enableParticleLimit && this.gameController.particles) {
                while (this.gameController.particles.length > this.settings.maxParticles) {
                    this.gameController.particles.shift(); // Remove oldest particle
                }
            }
        }
    }
    
    performOptimizedCollisionDetection() {
        if (!this.gameController) return;
        
        // Only check collisions for objects within view distance
        const player = this.gameController.spaceship;
        const renderDistance = this.settings.renderDistance;
        
        // Check projectile-enemy collisions
        if (this.gameController.projectiles && this.gameController.enemies) {
            for (let i = 0; i < this.gameController.projectiles.length; i++) {
                const projectile = this.gameController.projectiles[i];
                
                // Skip if not player projectile
                if (!projectile.isPlayerProjectile) continue;
                
                // Skip if too far from player
                const distToPlayer = Math.hypot(projectile.x - player.x, projectile.y - player.y);
                if (distToPlayer > renderDistance) continue;
                
                for (let j = 0; j < this.gameController.enemies.length; j++) {
                    const enemy = this.gameController.enemies[j];
                    
                    // Skip if too far from player
                    const enemyDistToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
                    if (enemyDistToPlayer > renderDistance) continue;
                    
                    // Check collision
                    const dx = projectile.x - enemy.x;
                    const dy = projectile.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < enemy.radius) {
                        // Handle collision
                        enemy.health -= projectile.damage;
                        projectile.active = false;
                        
                        // Create hit effect
                        if (this.gameController.physics) {
                            const particles = this.gameController.physics.createParticleEffect(
                                enemy.x, enemy.y, '#ffaa00', 5, 1, 300
                            );
                            this.gameController.particles.push(...particles);
                        }
                        
                        break;
                    }
                }
            }
        }
        
        // Check player-asteroid collisions
        if (this.mapSystem && this.mapSystem.asteroids) {
            for (let i = 0; i < this.mapSystem.asteroids.length; i++) {
                const asteroid = this.mapSystem.asteroids[i];
                
                // Skip if too far from player
                const distToPlayer = Math.hypot(asteroid.x - player.x, asteroid.y - player.y);
                if (distToPlayer > renderDistance) continue;
                
                // Check collision
                const dx = player.x - asteroid.x;
                const dy = player.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < asteroid.radius + 30) { // 30 is approximate player radius
                    // Handle collision
                    player.shield -= 5;
                    
                    // Bounce effect
                    const angle = Math.atan2(dy, dx);
                    player.velocity.x += Math.cos(angle) * 2;
                    player.velocity.y += Math.sin(angle) * 2;
                    
                    // Create collision effect
                    if (this.gameController.physics) {
                        const particles = this.gameController.physics.createParticleEffect(
                            player.x, player.y, '#ffffff', 10, 2, 500
                        );
                        this.gameController.particles.push(...particles);
                    }
                }
            }
        }
    }
    
    render() {
        if (!this.gameController || !this.gameController.ctx) return;
        
        const ctx = this.gameController.ctx;
        const player = this.gameController.spaceship;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.gameController.gameCanvas.width, this.gameController.gameCanvas.height);
        
        // Draw background
        this.gameController.drawBackground();
        
        // Render only objects within view distance
        const renderDistance = this.settings.renderDistance;
        const lowDetailDistance = this.settings.lowDetailDistance;
        
        // Draw asteroids with level of detail based on distance
        if (this.mapSystem && this.mapSystem.asteroids) {
            for (let i = 0; i < this.mapSystem.asteroids.length; i++) {
                const asteroid = this.mapSystem.asteroids[i];
                
                // Calculate distance to player
                const dx = asteroid.x - player.x;
                const dy = asteroid.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Skip if too far
                if (this.settings.enableOcclusion && distance > renderDistance) continue;
                
                // Draw with appropriate level of detail
                if (distance > lowDetailDistance) {
                    // Low detail rendering
                    ctx.fillStyle = '#aaaaaa';
                    // ===== Reconstruído em 2026-11-22 (o arquivo original estava truncado) =====
                    ctx.beginPath();
                    ctx.arc(dx + player.x - this.gameController.mapPosition.x,
                            dy + player.y - this.gameController.mapPosition.y,
                            asteroid.radius, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // High detail rendering: rotated irregular polygon with outline
                    const sx = asteroid.x - this.gameController.mapPosition.x;
                    const sy = asteroid.y - this.gameController.mapPosition.y;
                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(asteroid.rotation);
                    ctx.beginPath();
                    const points = 8;
                    for (let p = 0; p < points; p++) {
                        const a = (p / points) * Math.PI * 2;
                        const r = asteroid.radius * (p % 2 === 0 ? 1 : 0.85);
                        if (p === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                    }
                    ctx.closePath();
                    ctx.fillStyle = '#888888';
                    ctx.fill();
                    ctx.strokeStyle = '#cccccc';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        
        // Draw the remaining game layers using the controller's renderers
        const gc = this.gameController;
        gc.renderCelestialBodies();
        gc.renderPowerUps();
        gc.renderParticles();
        gc.renderProjectiles();
        gc.renderEnemies();
        gc.renderSpaceship();
        if (gc.spaceship.autoTargeting && gc.targetedEnemy) {
            gc.renderTargetingReticle();
        }
        gc.renderHUD();
        
        // Minimap from the interactive map system
        if (this.mapSystem) {
            this.mapSystem.drawMinimap();
        }
    }
}
