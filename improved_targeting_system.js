// Improved Auto-Targeting System for Space Combat Game

class ImprovedTargetingSystem {
    constructor(gameController) {
        this.gameController = gameController;
        this.enabled = true;
        this.targetingRange = 450; // Increased default targeting range
        this.currentTarget = null;
        this.targetLockTime = 0;
        this.targetLockDuration = 6000; // Increased lock duration (ms)
        this.targetingReticle = null;
        this.targetPrediction = true; // Enable target movement prediction
        this.assistStrength = 0.15; // Increased aim assist strength
        
        // Create targeting reticle element
        this.createTargetingReticle();
        
        // Add targeting sound effects
        this.targetingSound = {
            lock: null,
            tracking: null,
            lost: null
        };
        
        // Initialize sound effects if enabled
        if (this.gameController.settings && this.gameController.settings.soundEnabled) {
            this.initSoundEffects();
        }
    }
    
    createTargetingReticle() {
        // Create enhanced targeting reticle for visual feedback
        this.targetingReticle = document.createElement('div');
        this.targetingReticle.className = 'targeting-reticle';
        this.targetingReticle.style.position = 'absolute';
        this.targetingReticle.style.width = '70px';
        this.targetingReticle.style.height = '70px';
        this.targetingReticle.style.borderRadius = '50%';
        this.targetingReticle.style.border = '2px solid rgba(255, 0, 0, 0.7)';
        this.targetingReticle.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        this.targetingReticle.style.pointerEvents = 'none';
        this.targetingReticle.style.zIndex = '5';
        this.targetingReticle.style.display = 'none';
        this.targetingReticle.style.transform = 'translate(-50%, -50%)';
        
        // Add inner elements for targeting effect
        const innerCircle = document.createElement('div');
        innerCircle.style.position = 'absolute';
        innerCircle.style.top = '50%';
        innerCircle.style.left = '50%';
        innerCircle.style.width = '10px';
        innerCircle.style.height = '10px';
        innerCircle.style.borderRadius = '50%';
        innerCircle.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        innerCircle.style.transform = 'translate(-50%, -50%)';
        
        // Add crosshair lines
        const horizontalLine = document.createElement('div');
        horizontalLine.style.position = 'absolute';
        horizontalLine.style.top = '50%';
        horizontalLine.style.left = '0';
        horizontalLine.style.width = '100%';
        horizontalLine.style.height = '1px';
        horizontalLine.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        horizontalLine.style.transform = 'translateY(-50%)';
        
        const verticalLine = document.createElement('div');
        verticalLine.style.position = 'absolute';
        verticalLine.style.top = '0';
        verticalLine.style.left = '50%';
        verticalLine.style.width = '1px';
        verticalLine.style.height = '100%';
        verticalLine.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        verticalLine.style.transform = 'translateX(-50%)';
        
        // Add corner brackets for enhanced visual
        const createCornerBracket = (position) => {
            const bracket = document.createElement('div');
            bracket.style.position = 'absolute';
            bracket.style.width = '15px';
            bracket.style.height = '15px';
            bracket.style.borderColor = 'rgba(255, 0, 0, 0.9)';
            bracket.style.borderStyle = 'solid';
            bracket.style.borderWidth = '0';
            
            switch(position) {
                case 'topLeft':
                    bracket.style.top = '0';
                    bracket.style.left = '0';
                    bracket.style.borderTopWidth = '2px';
                    bracket.style.borderLeftWidth = '2px';
                    break;
                case 'topRight':
                    bracket.style.top = '0';
                    bracket.style.right = '0';
                    bracket.style.borderTopWidth = '2px';
                    bracket.style.borderRightWidth = '2px';
                    break;
                case 'bottomLeft':
                    bracket.style.bottom = '0';
                    bracket.style.left = '0';
                    bracket.style.borderBottomWidth = '2px';
                    bracket.style.borderLeftWidth = '2px';
                    break;
                case 'bottomRight':
                    bracket.style.bottom = '0';
                    bracket.style.right = '0';
                    bracket.style.borderBottomWidth = '2px';
                    bracket.style.borderRightWidth = '2px';
                    break;
            }
            
            return bracket;
        };
        
        this.targetingReticle.appendChild(innerCircle);
        this.targetingReticle.appendChild(horizontalLine);
        this.targetingReticle.appendChild(verticalLine);
        this.targetingReticle.appendChild(createCornerBracket('topLeft'));
        this.targetingReticle.appendChild(createCornerBracket('topRight'));
        this.targetingReticle.appendChild(createCornerBracket('bottomLeft'));
        this.targetingReticle.appendChild(createCornerBracket('bottomRight'));
        
        // Add lock status indicator
        const lockStatus = document.createElement('div');
        lockStatus.className = 'lock-status';
        lockStatus.style.position = 'absolute';
        lockStatus.style.bottom = '-20px';
        lockStatus.style.left = '50%';
        lockStatus.style.transform = 'translateX(-50%)';
        lockStatus.style.color = 'rgba(255, 0, 0, 0.9)';
        lockStatus.style.fontSize = '10px';
        lockStatus.style.fontFamily = 'Orbitron, sans-serif';
        lockStatus.style.whiteSpace = 'nowrap';
        lockStatus.textContent = 'ALVO BLOQUEADO';
        this.targetingReticle.appendChild(lockStatus);
        
        // Add target info display
        const targetInfo = document.createElement('div');
        targetInfo.className = 'target-info';
        targetInfo.style.position = 'absolute';
        targetInfo.style.top = '-25px';
        targetInfo.style.left = '50%';
        targetInfo.style.transform = 'translateX(-50%)';
        targetInfo.style.color = 'rgba(255, 0, 0, 0.9)';
        targetInfo.style.fontSize = '10px';
        targetInfo.style.fontFamily = 'Orbitron, sans-serif';
        targetInfo.style.whiteSpace = 'nowrap';
        targetInfo.textContent = 'INIMIGO';
        this.targetingReticle.appendChild(targetInfo);
        
        // Add to document
        document.body.appendChild(this.targetingReticle);
    }
    
    initSoundEffects() {
        // Initialize sound effects (placeholder for actual sound implementation)
        // In a real implementation, these would load actual audio files
        this.targetingSound.lock = { play: () => console.log('Target lock sound') };
        this.targetingSound.tracking = { play: () => console.log('Target tracking sound') };
        this.targetingSound.lost = { play: () => console.log('Target lost sound') };
    }
    
    update() {
        if (!this.enabled) {
            this.hideReticle();
            this.currentTarget = null;
            return;
        }
        
        const now = Date.now();
        let targetChanged = false;
        
        // If we have a current target, check if it's still valid
        if (this.currentTarget) {
            // Check if target is still alive
            const targetStillExists = this.gameController.enemies.some(enemy => enemy.id === this.currentTarget.id);
            
            // Check if target is still in range
            const targetInRange = targetStillExists && this.isEnemyInRange(this.currentTarget);
            
            // Check if lock time has expired
            const lockExpired = now - this.targetLockTime > this.targetLockDuration;
            
            if (!targetStillExists || !targetInRange || lockExpired) {
                // Play target lost sound
                if (this.targetingSound.lost && this.gameController.settings.soundEnabled) {
                    this.targetingSound.lost.play();
                }
                
                this.currentTarget = null;
                targetChanged = true;
            }
        }
        
        // If we don't have a target, find the closest enemy in range
        if (!this.currentTarget) {
            this.findNewTarget();
            if (this.currentTarget) {
                this.targetLockTime = now;
                targetChanged = true;
                
                // Play target lock sound
                if (this.targetingSound.lock && this.gameController.settings.soundEnabled) {
                    this.targetingSound.lock.play();
                }
            }
        }
        
        // Update reticle position if we have a target
        if (this.currentTarget) {
            this.updateReticlePosition();
            
            // Occasionally play tracking sound
            if (this.targetingSound.tracking && this.gameController.settings.soundEnabled && Math.random() < 0.01) {
                this.targetingSound.tracking.play();
            }
        } else {
            this.hideReticle();
        }
    }
    
    findNewTarget() {
        let bestTarget = null;
        let bestScore = -Infinity;
        
        const spaceship = this.gameController.spaceship;
        
        // Find the best target based on multiple factors
        for (const enemy of this.gameController.enemies) {
            const dx = enemy.x - spaceship.x;
            const dy = enemy.y - spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Skip enemies out of range
            if (distance > this.targetingRange) continue;
            
            // Calculate angle to enemy
            const angleToEnemy = Math.atan2(dy, dx);
            
            // Calculate angle difference (how much in front of the ship)
            let angleDiff = Math.abs(this.normalizeAngle(angleToEnemy - spaceship.angle));
            
            // Calculate threat level based on enemy type and behavior
            let threatLevel = 1;
            if (enemy.type === 3) { // Destroyer type
                threatLevel = 3;
            } else if (enemy.type === 2) { // Fighter type
                threatLevel = 2;
            }
            
            // Calculate target score (higher is better)
            // Prioritize enemies that are:
            // 1. Closer to the player
            // 2. More in front of the player
            // 3. More threatening
            const distanceScore = 1 - (distance / this.targetingRange); // 0 to 1, higher for closer enemies
            const angleScore = 1 - (angleDiff / Math.PI); // 0 to 1, higher for enemies more in front
            const threatScore = threatLevel / 3; // 0.33 to 1, higher for more threatening enemies
            
            const totalScore = (distanceScore * 0.5) + (angleScore * 0.3) + (threatScore * 0.2);
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestTarget = enemy;
            }
        }
        
        this.currentTarget = bestTarget;
    }
    
    isEnemyInRange(enemy) {
        const spaceship = this.gameController.spaceship;
        const dx = enemy.x - spaceship.x;
        const dy = enemy.y - spaceship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.targetingRange;
    }
    
    updateReticlePosition() {
        if (!this.currentTarget || !this.targetingReticle) return;
        
        // Get target position
        let targetX = this.currentTarget.x;
        let targetY = this.currentTarget.y;
        
        // Apply target movement prediction if enabled
        if (this.targetPrediction && this.currentTarget.velocity) {
            // Predict where the target will be in a short time
            const predictionTime = 0.5; // seconds
            targetX += this.currentTarget.velocity.x * predictionTime;
            targetY += this.currentTarget.velocity.y * predictionTime;
        }
        
        // Calculate screen position of the target
        const targetScreenX = targetX - this.gameController.mapPosition.x;
        const targetScreenY = targetY - this.gameController.mapPosition.y;
        
        // Update reticle position
        this.targetingReticle.style.display = 'block';
        this.targetingReticle.style.left = `${targetScreenX}px`;
        this.targetingReticle.style.top = `${targetScreenY}px`;
        
        // Update target info
        const targetInfo = this.targetingReticle.querySelector('.target-info');
        if (targetInfo) {
            const distance = Math.sqrt(
                Math.pow(this.currentTarget.x - this.gameController.spaceship.x, 2) +
                Math.pow(this.currentTarget.y - this.gameController.spaceship.y, 2)
            ).toFixed(0);
            
            let enemyType = 'INIMIGO';
            if (this.currentTarget.type === 3) {
                enemyType = 'DESTRUIDOR';
            } else if (this.currentTarget.type === 2) {
                enemyType = 'CAÇA';
            } else if (this.currentTarget.type === 1) {
                enemyType = 'BATEDOR';
            }
            
            targetInfo.textContent = `${enemyType} - ${distance}m`;
        }
        
        // Update lock status
        const lockStatus = this.targetingRe