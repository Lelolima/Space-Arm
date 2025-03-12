// Continuation of Improved Targeting System

// This file contains the remaining code for the ImprovedTargetingSystem class
// that was cut off in the previous file

// Update lock status
const lockStatus = this.targetingReticle.querySelector('.lock-status');
if (lockStatus) {
    const lockTimeRemaining = Math.max(0, this.targetLockDuration - (Date.now() - this.targetLockTime));
    const lockPercentage = Math.floor((lockTimeRemaining / this.targetLockDuration) * 100);
    lockStatus.textContent = `ALVO BLOQUEADO ${lockPercentage}%`;
    
    // Visual effect based on lock time
    const pulseRate = 0.5 + (lockPercentage / 200); // Pulse faster as lock weakens
    this.targetingReticle.style.animation = `pulse ${pulseRate}s infinite`;
}

// Add a CSS animation if it doesn't exist yet
if (!document.getElementById('targeting-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'targeting-animations';
    styleSheet.textContent = `
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
            50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
        }
    `;
    document.head.appendChild(styleSheet);
}
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

// Enhanced aim assist with prediction
getAimAssistAngle() {
    if (!this.currentTarget) return null;
    
    const spaceship = this.gameController.spaceship;
    let targetX = this.currentTarget.x;
    let targetY = this.currentTarget.y;
    
    // Apply target movement prediction
    if (this.targetPrediction && this.currentTarget.velocity) {
        // Calculate time to impact based on distance and projectile speed
        const dx = targetX - spaceship.x;
        const dy = targetY - spaceship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Assume projectile speed (should match the actual weapon's projectile speed)
        const projectileSpeed = 10;
        const timeToImpact = distance / projectileSpeed;
        
        // Predict where the target will be
        targetX += this.currentTarget.velocity.x * timeToImpact;
        targetY += this.currentTarget.velocity.y * timeToImpact;
    }
    
    // Calculate angle to predicted position
    const dx = targetX - spaceship.x;
    const dy = targetY - spaceship.y;
    const targetAngle = Math.atan2(dy, dx);
    
    // Calculate the difference between current ship angle and target angle
    const angleDiff = this.normalizeAngle(targetAngle - spaceship.angle);
    
    // Return a smoothed angle adjustment (partial assist)
    return angleDiff * this.assistStrength;
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

// Set aim assist strength
setAssistStrength(strength) {
    this.assistStrength = Math.max(0, Math.min(1, strength));
}

// Toggle target prediction
togglePrediction() {
    this.targetPrediction = !this.targetPrediction;
    return this.targetPrediction;
}

// Get current target info for HUD display
getTargetInfo() {
    if (!this.currentTarget) return null;
    
    return {
        id: this.currentTarget.id,
        type: this.currentTarget.type || 'unknown',
        distance: Math.sqrt(
            Math.pow(this.currentTarget.x - this.gameController.spaceship.x, 2) +
            Math.pow(this.currentTarget.y - this.gameController.spaceship.y, 2)
        ).toFixed(0),
        health: this.currentTarget.health || 'unknown',
        lockPercentage: Math.floor(((this.targetLockDuration - (Date.now() - this.targetLockTime)) / this.targetLockDuration) * 100)
    };
}

// Clean up resources when no longer needed
destroy() {
    if (this.targetingReticle && this.targetingReticle.parentNode) {
        this.targetingReticle.parentNode.removeChild(this.targetingReticle);
    }
    
    const styleSheet = document.getElementById('targeting-animations');
    if (styleSheet && styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
    }
}