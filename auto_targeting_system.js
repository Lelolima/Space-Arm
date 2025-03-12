// Auto-Targeting System for Space Arm Game

class AutoTargetingSystem {
    constructor(gameController) {
        this.gameController = gameController;
        this.enabled = true;
        this.targetingRange = 400; // Default targeting range
        this.currentTarget = null;
        this.targetLockTime = 0; // Time when target was locked
        this.targetLockDuration = 5000; // How long a target stays locked (ms)
        this.targetingReticle = null;
        
        // Create targeting reticle element
        this.createTargetingReticle();
    }
    
    createTargetingReticle() {
        // Create targeting reticle for visual feedback
        this.targetingReticle = document.createElement('div');
        this.targetingReticle.className = 'targeting-reticle';
        this.targetingReticle.style.position = 'absolute';
        this.targetingReticle.style.width = '60px';
        this.targetingReticle.style.height = '60px';
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
        
        this.targetingReticle.appendChild(innerCircle);
        this.targetingReticle.appendChild(horizontalLine);
        this.targetingReticle.appendChild(verticalLine);
        
        document.body.appendChild(this.targetingReticle);
    }
    
    update() {
        if (!this.enabled) {
            this.hideReticle();
            this.currentTarget = null;
            return;
        }
        
        const now = Date.now();
        
        // If we have a current target, check if it's still valid
        if (this.currentTarget) {
            // Check if target is still alive
            const targetStillExists = this.gameController.enemies.some(enemy => enemy.id === this.currentTarget.id);
            
            // Check if target is still in range
            const targetInRange = targetStillExists && this.isEnemyInRange(this.currentTarget);
            
            // Check if lock time has expired
            const lockExpired = now - this.targetLockTime > this.targetLockDuration;
            
            if (!targetStillExists || !targetInRange || lockExpired) {
                this.currentTarget = null;
            }
        }
        
        // If we don't have a target, find the closest enemy in range
        if (!this.currentTarget) {
            this.findNewTarget();
            if (this.currentTarget) {
                this.targetLockTime = now;
            }
        }
        
        // Update reticle position if we have a target
        if (this.currentTarget) {
            this.updateReticlePosition();
        } else {
            this.hideReticle();
        }
    }
    
    findNewTarget() {
        let closestEnemy = null;
        let closestDistance = this.targetingRange;
        
        const spaceship = this.gameController.spaceship;
        
        // Find the closest enemy within range
        for (const enemy of this.gameController.enemies) {
            const dx = enemy.x - spaceship.x;
            const dy = enemy.y - spaceship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        this.currentTarget = closestEnemy;
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
        
        // Calculate screen position of the target
        const targetScreenX = this.currentTarget.x - this.gameController.mapPosition.x;
        const targetScreenY = this.currentTarget.y - this.gameController.mapPosition.y;
        
        // Update reticle position
        this.targetingReticle.style.display = 'block';
        this.targetingReticle.style.left = `${targetScreenX}px`;
        this.targetingReticle.style.top = `${targetScreenY}px`;
        
        // Add pulsing animation
        this.targetingReticle.style.animation = 'pulse 1.5s infinite';
    }
    
    hideReticle() {
        if (this.targetingReticle) {
            this.targetingReticle.style.display = 'none';
        }
    }
    
    getTargetAngle() {
        if (!this.currentTarget) return null;
        
        const spaceship = this.gameController.spaceship;
        const dx = this.currentTarget.x - spaceship.x;
        const dy = this.currentTarget.y - spaceship.y;
        
        return Math.atan2(dy, dx);
    }
    
    // Helper method to assist with auto-aiming
    getAimAssistAngle() {
        if (!this.currentTarget) return null;
        
        const targetAngle = this.getTargetAngle();
        if (targetAngle === null) return null;
        
        // Calculate the difference between current ship angle and target angle
        const spaceship = this.gameController.spaceship;
        const angleDiff = this.normalizeAngle(targetAngle - spaceship.angle);
        
        // Return a smoothed angle adjustment (partial assist)
        return angleDiff * 0.1; // Adjust this factor to control assist strength
    }
    
    // Normalize angle to be between -PI and PI
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    // Toggle targeting system on/off
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.hideReticle();
            this.currentTarget = null;
        }
        return this.enabled;
    }
    
    // Set targeting range
    setTargetingRange(range) {
        this.targetingRange = range;
    }
}
