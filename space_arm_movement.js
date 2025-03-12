class SpaceshipController {
    constructor(gameCanvas, mapCanvas) {
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
            weapons: []
        };
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            fire: false
        };
        
        this.gameCanvas = gameCanvas;
        this.ctx = gameCanvas.getContext('2d');
        
        this.mapCanvas = mapCanvas;
        this.mapCtx = mapCanvas.getContext('2d');
        
        this.mapPosition = { x: 0, y: 0 };
        this.celestialBodies = this.generateCelestialBodies();
        this.enemies = [];
        this.projectiles = [];
        this.enemyImages = [];
        
        // Load game assets
        this.loadGameAssets();
        
        this.init();
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
        const numBodies = Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < numBodies; i++) {
            bodies.push({
                x: Math.random() * this.gameCanvas.width * 2,
                y: Math.random() * this.gameCanvas.height * 2,
                radius: Math.random() * 50 + 20,
                type: Math.random() > 0.5 ? 'planet' : 'asteroid'
            });
        }
        
        return bodies;
    }
    
    generateEnemies(count) {
        // Use the GameAssets helper to create enemies with different types
        this.enemies = GameAssets.createEnemyShips(count);
        
        // Make sure enemies are not too close to the player at start
        this.enemies.forEach(enemy => {
            // Calculate distance to player
            const dx = this.spaceship.x - enemy.x;
            const dy = this.spaceship.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too close, reposition
            if (distance < 300) {
                enemy.x = this.spaceship.x + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200);
                enemy.y = this.spaceship.y + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200);
            }
        });
    }
    
    init() {
        // Configurar tamanho dos canvas
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;
        
        this.mapCanvas.width = 200;
        this.mapCanvas.height = 200;
        
        // Inicializar inimigos
        this.generateEnemies(10);
        
        // Inicializar armas
        this.spaceship.weapons.push(
            new HomingWeapon(this.spaceship, 10, 8, 1000)
        );
        
        // Configurar controles
        this.setupControls();
        
        // Iniciar loop do jogo
        this.gameLoop();
    }
    
    setupControls() {
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
        
        this.addTouchControls();
    }
    
    addTouchControls() {
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        document.body.appendChild(touchControls);
        
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(dir => {
            const btn = document.createElement('button');
            btn.className = `touch-btn touch-${dir}`;
            btn.innerHTML = `<i class="arrow-${dir}"></i>`;
            
            btn.addEventListener('touchstart', () => {
                this.keys[dir] = true;
                if (dir === 'up') this.spaceship.thrusting = true;
            });
            
            btn.addEventListener('touchend', () => {
                this.keys[dir] = false;
                if (dir === 'up') this.spaceship.thrusting = false;
            });
            
            touchControls.appendChild(btn);
        });
        
        const fireBtn = document.createElement('button');
        fireBtn.className = 'touch-btn touch-fire';
        fireBtn.innerText = 'FIRE';
        
        fireBtn.addEventListener('touchstart', () => {
            this.keys.fire = true;
        });
        
        fireBtn.addEventListener('touchend', () => {
            this.keys.fire = false;
        });
        
        touchControls.appendChild(fireBtn);
    }
    
    update() {
        // Atualiza a rotação da nave
        if (this.keys.left) {
            this.spaceship.angle -= this.spaceship.rotationSpeed;
        }
        
        if (this.keys.right) {
            this.spaceship.angle += this.spaceship.rotationSpeed;
        }
        
        // Movimento para frente/trás
        if (this.keys.up) {
            this.spaceship.velocity.x += Math.cos(this.spaceship.angle) * 0.1;
            this.spaceship.velocity.y += Math.sin(this.spaceship.angle) * 0.1;
        }
        
        if (this.keys.down) {
            this.spaceship.velocity.x -= Math.cos(this.spaceship.angle) * 0.1;
            this.spaceship.velocity.y -= Math.sin(this.spaceship.angle) * 0.1;
        }
        
        // Aplicar velocidade máxima
        const speed = Math.sqrt(
            this.spaceship.velocity.x ** 2 + 
            this.spaceship.velocity.y ** 2
        );
        
        if (speed > this.spaceship.maxVelocity) {
            const ratio = this.spaceship.maxVelocity / speed;
            this.spaceship.velocity.x *= ratio;
            this.spaceship.velocity.y *= ratio;
        }
        
        // Aplicar fricção
        this.spaceship.velocity.x *= this.spaceship.friction;
        this.spaceship.velocity.y *= this.spaceship.friction;
        
        // Atualizar posição da nave
        this.spaceship.x += this.spaceship.velocity.x;
        this.spaceship.y += this.spaceship.velocity.y;
        
        // Manter a nave dentro da tela
        this.spaceship.x = (this.spaceship.x + this.gameCanvas.width) % this.gameCanvas.width;
        this.spaceship.y = (this.spaceship.y + this.gameCanvas.height) % this.gameCanvas.height;
        
        // Atualizar projéteis
        this.updateProjectiles();
        
        // Atualizar inimigos
        this.updateEnemies();
        
        // Verificar colisões
        this.checkCollisions();
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;
            
            // Remover projéteis fora da tela
            if (
                projectile.x < 0 ||
                projectile.x > this.gameCanvas.width ||
                projectile.y < 0 ||
                projectile.y > this.gameCanvas.height
            ) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Movement towards the spaceship with different behaviors based on type
            const dx = this.spaceship.x - enemy.x;
            const dy = this.spaceship.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Different behavior based on enemy type
            switch(enemy.type) {
                case 1: // Scout - Fast, erratic movement
                    const jitter = Math.sin(Date.now() / 200) * 0.3;
                    enemy.x += Math.cos(angle + jitter) * enemy.speed;
                    enemy.y += Math.sin(angle + jitter) * enemy.speed;
                    break;
                    
                case 2: // Fighter - Standard pursuit with slight flanking
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
                    
                case 3: // Destroyer - Slow but steady, maintains distance
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
        });
    }
    
    checkCollisions() {
        // Verificar colisões entre projéteis e inimigos
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.width / 2) {
                    // Damage enemy based on projectile damage
                    const damage = projectile.damage || 10;
                    enemy.health -= damage;
                    
                    // Remove projectile
                    this.projectiles.splice(i, 1);
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                    }
                    
                    break;
                }
            }
        }
        
        // Check collisions between player and enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = this.spaceship.x - enemy.x;
            const dy = this.spaceship.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (this.spaceship.width / 2 + enemy.width / 2) * 0.7) {
                // Slow down both objects on collision
                this.spaceship.velocity.x *= 0.8;
                this.spaceship.velocity.y *= 0.8;
                
                // Push player away from enemy
                const angle = Math.atan2(dy, dx);
                this.spaceship.x += Math.cos(angle) * 2;
                this.spaceship.y += Math.sin(angle) * 2;
                
                // Push enemy away from player
                enemy.x -= Math.cos(angle) * 2;
                enemy.y -= Math.sin(angle) * 2;
            }
        }
    }
    
    updateGameInfo() {
        // Update speed display
        const speedInfo = document.getElementById('speed-info');
        if (speedInfo) {
            const speed = Math.sqrt(
                this.spaceship.velocity.x ** 2 + 
                this.spaceship.velocity.y ** 2
            ).toFixed(2);
            speedInfo.textContent = speed;
        }
        
        // Update position display
        const positionInfo = document.getElementById('position-info');
        if (positionInfo) {
            positionInfo.textContent = `${Math.round(this.spaceship.x)},${Math.round(this.spaceship.y)}`;
        }
        
        // Update enemies count
        const enemiesInfo = document.getElementById('enemies-info');
        if (enemiesInfo) {
            enemiesInfo.textContent = this.enemies.length;
        }
    }
    
    render() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // Desenhar fundo
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.gameCanvas.width, this.gameCanvas.height);
        } else {
            // Fallback background if image isn't loaded
            this.ctx.fillStyle = '#050a1c';
            this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
            
            // Draw some simple stars
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
        
        // Desenhar corpos celestes
        this.renderCelestialBodies();
        
        // Desenhar projéteis
        this.renderProjectiles();
        
        // Desenhar inimigos
        this.renderEnemies();
        
        // Desenhar nave
        this.renderSpaceship();
        
        // Update game info
        this.updateGameInfo();
        
        // Atualizar minimapa
        this.updateMinimap();
    }
    
    renderCelestialBodies() {
        this.celestialBodies.forEach(body => {
            this.ctx.beginPath();
            this.ctx.arc(body.x - this.mapPosition.x, body.y - this.mapPosition.y, body.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = body.type === 'planet' ? '#4CAF50' : '#795548';
            this.ctx.fill();
            this.ctx.closePath();
        });
    }
    
    renderProjectiles() {
        this.ctx.fillStyle = '#FFF';
        this.projectiles.forEach(projectile => {
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        });
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
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
        this.ctx.translate(this.spaceship.x, this.spaceship.y);
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
                    -this.spaceship.width/4, 0, 0,
                    -this.spaceship.width/4, 0, this.spaceship.width/2
                );
                glowGradient.addColorStop(0, 'rgba(0, 195, 255, 0.7)');
                glowGradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
                glowGradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
                
                // Draw engine glow
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(-this.spaceship.width/4, 0, this.spaceship.width/2, 0, Math.PI * 2);
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
                this.ctx.moveTo(-this.spaceship.width/2, 0);
                this.ctx.lineTo(-this.spaceship.width, -this.spaceship.height/4);
                this.ctx.lineTo(-this.spaceship.width, this.spaceship.height/4);
                this.ctx.closePath();
                this.ctx.fillStyle = '#FF5722';
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    updateMinimap() {
        // Limpar minimapa
        this.mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        
        // Desenhar fundo do minimapa
        this.mapCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.mapCtx.fillRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        
        // Fator de escala para o minimapa
        const scaleX = this.mapCanvas.width / (this.gameCanvas.width * 2);
        const scaleY = this.mapCanvas.height / (this.gameCanvas.height * 2);
        
        // Desenhar corpos celestes no minimapa
        this.celestialBodies.forEach(body => {
            this.mapCtx.beginPath();
            this.mapCtx.arc(
                body.x * scaleX,
                body.y * scaleY,
                body.radius * scaleX * 0.5,
                0,
                Math.PI * 2
            );
            this.mapCtx.fillStyle = body.type === 'planet' ? '#4CAF50' : '#795548';
            this.mapCtx.fill();
            this.mapCtx.closePath();
        });
        
        // Desenhar inimigos no minimapa
        this.mapCtx.fillStyle = '#F44336';
        this.enemies.forEach(enemy => {
            this.mapCtx.fillRect(
                enemy.x * scaleX - 2,
                enemy.y * scaleY - 2,
                4,
                4
            );
        });
        
        // Desenhar nave no minimapa
        this.mapCtx.fillStyle = '#2196F3';
        this.mapCtx.fillRect(
            this.spaceship.x * scaleX - 3,
            this.spaceship.y * scaleY - 3,
            6,
            6
        );
        
        // Desenhar área visível no minimapa
        this.mapCtx.strokeStyle = '#FFFFFF';
        this.mapCtx.strokeRect(
            this.mapPosition.x * scaleX,
            this.mapPosition.y * scaleY,
            this.gameCanvas.width * scaleX,
            this.gameCanvas.height * scaleY
        );
    }
    
    shootProjectile() {
        if (this.keys.fire) {
            // Verificar se há armas disponíveis
            if (this.spaceship.weapons.length > 0) {
                // Usar a primeira arma disponível
                const weapon = this.spaceship.weapons[0];
                const projectile = weapon.fire();
                
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            } else {
                // Arma padrão se não houver armas especiais
                this.projectiles.push({
                    x: this.spaceship.x,
                    y: this.spaceship.y,
                    angle: this.spaceship.angle,
                    speed: 10,
                    damage: 10
                });
            }
            
            // Cooldown para evitar disparos contínuos
            this.keys.fire = false;
            setTimeout(() => {
                this.keys.fire = true;
            }, 200);
        }
    }
    
    gameLoop() {
        // Atualizar estado do jogo
        this.update();
        
        // Verificar disparo
        if (this.keys.fire) {
            this.shootProjectile();
        }
        
        // Renderizar
        this.render();
        
        // Continuar loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Classe de arma com projéteis teleguiados
class HomingWeapon {
    constructor(spaceship, damage, speed, range) {
        this.spaceship = spaceship;
        this.damage = damage;
        this.speed = speed;
        this.range = range;
        this.cooldown = false;
    }
    
    fire() {
        if (this.cooldown) return null;
        
        // Criar projétil teleguiado
        const projectile = {
            x: this.spaceship.x,
            y: this.spaceship.y,
            angle: this.spaceship.angle,
            speed: this.speed,
            damage: this.damage,
            range: this.range,
            distanceTraveled: 0,
            homing: true
        };
        
        // Aplicar cooldown
        this.cooldown = true;
        setTimeout(() => {
            this.cooldown = false;
        }, 500);
        
        return projectile;
    }
}