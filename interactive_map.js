// Interactive Map System for Space Arm Game

class InteractiveMap {
    constructor(gameController, mapCanvas) {
        this.gameController = gameController;
        this.mapCanvas = mapCanvas;
        this.mapCtx = mapCanvas.getContext('2d');
        
        // Map settings
        this.mapScale = 0.1; // Scale factor for the minimap
        this.mapBorderColor = 'rgba(64, 128, 255, 0.7)';
        this.mapBackgroundColor = 'rgba(0, 10, 30, 0.7)';
        this.playerMarkerColor = '#4080ff';
        this.enemyMarkerColor = '#ff4040';
        this.asteroidMarkerColor = '#aaaaaa';
        this.dangerZoneColor = 'rgba(255, 0, 0, 0.3)';
        this.safeZoneColor = 'rgba(0, 255, 0, 0.2)';
        
        // Interactive elements
        this.asteroids = [];
        this.dangerZones = [];
        this.safeZones = [];
        this.wormholes = [];
        
        // Initialize map elements
        this.initializeMapElements();
    }
    
    initializeMapElements() {
        // Generate asteroids
        this.generateAsteroids(20);
        
        // Create danger zones
        this.createDangerZones(3);
        
        // Create safe zones
        this.createSafeZones(2);
        
        // Create wormholes
        this.createWormholes(2);
    }
    
    generateAsteroids(count) {
        const worldSize = this.gameController.worldSize;
        
        for (let i = 0; i < count; i++) {
            // Create asteroid with random properties
            const asteroid = {
                id: 'asteroid_' + i,
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                radius: Math.random() * 30 + 20, // Random size between 20-50
                velocity: {
                    x: (Math.random() - 0.5) * 0.5, // Slow movement
                    y: (Math.random() - 0.5) * 0.5
                },
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                health: 100,
                destructible: Math.random() > 0.3, // 70% are destructible
                texture: Math.floor(Math.random() * 3) // 3 different asteroid textures
            };
            
            // Ensure asteroids aren't too close to the player at start
            const dx = asteroid.x - this.gameController.spaceship.x;
            const dy = asteroid.y - this.gameController.spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 300) {
                asteroid.x = this.gameController.spaceship.x + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200);
                asteroid.y = this.gameController.spaceship.y + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200);
            }
            
            this.asteroids.push(asteroid);
        }
    }
    
    createDangerZones(count) {
        const worldSize = this.gameController.worldSize;
        
        for (let i = 0; i < count; i++) {
            // Create danger zone with random properties
            const dangerZone = {
                id: 'danger_' + i,
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                radius: Math.random() * 100 + 150, // Large radius between 150-250
                damagePerSecond: Math.random() * 5 + 5, // 5-10 damage per second
                pulseRate: 1 + Math.random(), // Visual effect pulse rate
                pulsePhase: Math.random() * Math.PI * 2 // Random starting phase
            };
            
            // Ensure danger zones aren't too close to the player at start
            const dx = dangerZone.x - this.gameController.spaceship.x;
            const dy = dangerZone.y - this.gameController.spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 400) {
                dangerZone.x = this.gameController.spaceship.x + (Math.random() > 0.5 ? 1 : -1) * (400 + Math.random() * 200);
                dangerZone.y = this.gameController.spaceship.y + (Math.random() > 0.5 ? 1 : -1) * (400 + Math.random() * 200);
            }
            
            this.dangerZones.push(dangerZone);
        }
    }
    
    createSafeZones(count) {
        const worldSize = this.gameController.worldSize;
        
        for (let i = 0; i < count; i++) {
            // Create safe zone with random properties
            const safeZone = {
                id: 'safe_' + i,
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                radius: Math.random() * 50 + 100, // Medium radius between 100-150
                healPerSecond: Math.random() * 2 + 1, // 1-3 healing per second
                pulseRate: 0.5 + Math.random() * 0.5, // Visual effect pulse rate
                pulsePhase: Math.random() * Math.PI * 2 // Random starting phase
            };
            
            this.safeZones.push(safeZone);
        }
    }
    
    createWormholes(count) {
        const worldSize = this.gameController.worldSize;
        const wormholePairs = [];
        
        for (let i = 0; i < count; i++) {
            // Create a pair of connected wormholes
            const wormhole1 = {
                id: 'wormhole_' + i + '_a',
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                radius: 30,
                pairId: 'wormhole_' + i + '_b',
                cooldown: 0,
                maxCooldown: 5000, // 5 seconds cooldown after use
                rotationSpeed: 0.02,
                rotation: 0
            };
            
            // Ensure second wormhole is far from the first
            let x2, y2, distance;
            do {
                x2 = Math.random() * worldSize.width;
                y2 = Math.random() * worldSize.height;
                const dx = x2 - wormhole1.x;
                const dy = y2 - wormhole1.y;
                distance = Math.sqrt(dx * dx + dy * dy);
            } while (distance < worldSize.width / 3); // Ensure they're reasonably far apart
            
            const wormhole2 = {
                id: 'wormhole_' + i + '_b',
                x: x2,
                y: y2,
                radius: 30,
                pairId: 'wormhole_' + i + '_a',
                cooldown: 0,
                maxCooldown: 5000,
                rotationSpeed: -0.02, // Rotate in opposite direction
                rotation: 0
            };
            
            this.wormholes.push(wormhole1, wormhole2);
        }
    }
    
    update() {
        // Update asteroid positions and rotations
        for (const asteroid of this.asteroids) {
            // Apply physics
            asteroid.x += asteroid.velocity.x;
            asteroid.y += asteroid.velocity.y;
            asteroid.rotation += asteroid.rotationSpeed;
            
            // Wrap around world boundaries
            const worldSize = this.gameController.worldSize;
            if (asteroid.x < -asteroid.radius) asteroid.x = worldSize.width + asteroid.radius;
            if (asteroid.x > worldSize.width + asteroid.radius) asteroid.x = -asteroid.radius;
            if (asteroid.y < -asteroid.radius) asteroid.y = worldSize.height + asteroid.radius;
            if (asteroid.y > worldSize.height + asteroid.radius) asteroid.y = -asteroid.radius;
        }
        
        // Update wormhole rotations and cooldowns
        for (const wormhole of this.wormholes) {
            wormhole.rotation += wormhole.rotationSpeed;
            if (wormhole.cooldown > 0) {
                wormhole.cooldown -= 16; // Assuming 60fps, ~16ms per frame
                if (wormhole.cooldown < 0) wormhole.cooldown = 0;
            }
        }
        
        // Check if player is in any special zone
        this.checkPlayerInZones();
    }
    
    checkPlayerInZones() {
        const spaceship = this.gameController.spaceship;
        
        // Check danger zones
        for (const zone of this.dangerZones) {
            const dx = spaceship.x - zone.x;
            const dy = spaceship.y - zone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < zone.radius) {
                // Player is in danger zone, apply damage
                spaceship.shield -= zone.damagePerSecond / 60; // Assuming 60fps
                
                // Create visual effect
                if (Math.random() < 0.05) { // Occasional particle effect
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * zone.radius * 0.8;
                    const x = zone.x + Math.cos(angle) * distance;
                    const y = zone.y + Math.sin(angle) * distance;
                    
                    if (this.gameController.physics) {
                        const particles = this.gameController.physics.createParticleEffect(
                            x, y, '#ff0000', 3, 1, 500
                        );
                        this.gameController.particles.push(...particles);
                    }
                }
            }
        }
        
        // Check safe zones
        for (const zone of this.safeZones) {
            const dx = spaceship.x - zone.x;
            const dy = spaceship.y - zone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < zone.radius) {
                // Player is in safe zone, apply healing
                spaceship.shield = Math.min(
                    spaceship.shield + zone.healPerSecond / 60,
                    spaceship.maxShield
                );
                
                // Create visual effect
                if (Math.random() < 0.05) { // Occasional particle effect
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * zone.radius * 0.8;
                    const x = zone.x + Math.cos(angle) * distance;
                    const y = zone.y + Math.sin(angle) * distance;
                    
                    if (this.gameController.physics) {
                        const particles = this.gameController.physics.createParticleEffect(
                            x, y, '#00ff00', 3, 1, 500
                        );
                        this.gameController.particles.push(...particles);
                    }
                }
            }
        }
        
        // Check wormholes
        for (const wormhole of this.wormholes) {
            if (wormhole.cooldown > 0) continue; // Wormhole is on cooldown
            
            const dx = spaceship.x - wormhole.x;
            const dy = spaceship.y - wormhole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < wormhole.radius) {
                // Player entered wormhole, teleport to paired wormhole
                const pairedWormhole = this.wormholes.find(w => w.id === wormhole.pairId);
                
                if (pairedWormhole) {
                    // Teleport player
                    spaceship.x = pairedWormhole.x;
                    spaceship.y = pairedWormhole.y;
                    
                    // Set cooldown on both wormholes
                    wormhole.cooldown = wormhole.maxCooldown;
                    pairedWormhole.cooldown = pairedWormhole.maxCooldown;
                    
                    // Create teleport effect
                    if (this.gameController.physics) {
                        // Effect at departure point
                        const departParticles = this.gameController.physics.createParticleEffect(
                            wormhole.x, wormhole.y, '#00ffff', 20, 3, 1000
                        );
                        
                        // Effect at arrival point
                        const arriveParticles = this.gameController.physics.createParticleEffect(
                            pairedWormhole.x, pairedWormhole.y, '#00ffff', 20, 3, 1000
                        );
                        
                        this.gameController.particles.push(...departParticles, ...arriveParticles);
                    }
                }
                
                break; // Exit the loop after teleporting
            }
        }
    }
    
    // Check collision between player projectiles and asteroids
    checkProjectileAsteroidCollisions() {
        const projectiles = this.gameController.projectiles;
        const destroyedAsteroids = [];
        const destroyedProjectiles = [];
        
        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i];
            
            // Only check player projectiles
            if (!projectile.isPlayerProjectile) continue;
            
            for (let j = 0; j < this.asteroids.length; j++) {
                const asteroid = this.asteroids[j];
                
                // Skip non-destructible asteroids
                if (!asteroid.destructible) continue;
                
                // Check collision
                const dx = projectile.x - asteroid.x;
                const dy = projectile.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < asteroid.radius) {
                    // Collision detected
                    destroyedProjectiles.push(i);
                    
                    // Reduce asteroid health
                    asteroid.health -= projectile.damage || 10;
                    
                    // Check if asteroid is destroyed
                    if (asteroid.health <= 0) {
                        destroyedAsteroids.push(j);
                        
                        // Create explosion effect
                        if (this.gameController.physics) {
                            const particles = this.gameController.physics.createParticleEffect(
                                asteroid.x, asteroid.y, '#ffaa00', 20, 2, 1000
                            );
                            this.gameController.particles.push(...particles);
                        }
                        
                        // Add score to player
                        if (this.gameController.spaceship) {
                            this.gameController.spaceship.score += 50;
                        }
                        
                        // Random chance to spawn a power-up
                        if (Math.random() < 0.3 && this.gameController.generatePowerUp) {
                            const powerUp = this.gameController.generatePowerUp(asteroid.x, asteroid.y);
                            this.gameController.powerUps.push(powerUp);
                        }
                    }
                    
                    break; // Exit inner loop after collision
                }
            }
        }
        
        // Remove destroyed asteroids (in reverse order to avoid index issues)
        for (let i = destroyedAsteroids.length - 1; i >= 0; i--) {
            this.asteroids.splice(destroyedAsteroids[i], 1);
        }
        
        // Remove destroyed projectiles (in reverse order)
        for (let i = destroyedProjectiles.length - 1; i >= 0; i--) {
            this.gameController.projectiles.splice(destroyedProjectiles[i], 1);
        }
    }
    
    // Draw the minimap
    drawMinimap() {
        const ctx = this.mapCtx;
        const canvas = this.mapCanvas;
        const worldSize = this.gameController.worldSize;
        const spaceship = this.gameController.spaceship;
        
        // Clear the minimap
        ctx.fillStyle = this.mapBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = this.mapBorderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scale factors
        const scaleX = canvas.width / worldSize.width;
        const scaleY = canvas.height / worldSize.height;
        
        // Draw asteroids
        ctx.fillStyle = this.asteroidMarkerColor;
        for (const asteroid of this.asteroids) {
            const x = asteroid.x * scaleX;
            const y = asteroid.y * scaleY;
            const radius = Math.max(2, asteroid.radius * scaleX * 0.5);
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw danger zones
        for (const zone of this.dangerZones) {
            ctx.fillStyle = this.dangerZoneColor;
            const x = zone.x * scaleX;
            const y = zone.y * scaleY;
            const radius = zone.radius * scaleX;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw safe zones
        for (const zone of this.safeZones) {
            ctx.fillStyle = this.safeZoneColor;
            const x = zone.x * scaleX;
            const y = zone.y * scaleY;
            const radius = zone.radius * scaleX;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw wormholes
        for (const wormhole of this.wormholes) {
            // Use a pulsing effect for wormholes
            const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
            const cooldownFactor = wormhole.cooldown > 0 ? 0.5 : 1; // Dim when on cooldown
            
            ctx.fillStyle = `rgba(0, 255, 255, ${0.6 * pulseIntensity * cooldownFactor})`;
            const x = wormhole.x * scaleX;
            const y = wormhole.y * scaleY;
            const radius = wormhole.radius * scaleX;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw enemies if available
        if (this.gameController.enemies) {
            ctx.fillStyle = this.enemyMarkerColor;
            for (const enemy of this.gameController.enemies) {
                const x = enemy.x * scaleX;
                const y = enemy.y * scaleY;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw player
        if (spaceship) {
            ctx.fillStyle = this.playerMarkerColor;
            const x = spaceship.x * scaleX;
            const y = spaceship.y * scaleY;
            
            // Draw player as a triangle pointing in the direction of movement
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(spaceship.angle);
            
            ctx.beginPath();
            ctx.moveTo(5, 0);
            ctx.lineTo(-3, -3);
            ctx.lineTo(-3, 3);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}