// Targeting System Integration for Space Combat Game

// This file integrates the improved targeting system with the main game

class TargetingSystemIntegration {
    constructor(gameController) {
        this.gameController = gameController;
        
        // Initialize the improved targeting system
        this.targetingSystem = new ImprovedTargetingSystem(gameController);
        
        // Add keyboard shortcut for toggling targeting system
        this.setupKeyboardShortcuts();
        
        // Add HUD elements for targeting information
        this.createTargetingHUD();
    }
    
    setupKeyboardShortcuts() {
        // Listen for the 'T' key to toggle targeting system
        window.addEventListener('keydown', (e) => {
            if (e.key === 't' || e.key === 'T') {
                const enabled = this.targetingSystem.toggle();
                this.updateTargetingStatus(enabled);
            }
            
            // Listen for the 'P' key to toggle prediction
            if (e.key === 'p' || e.key === 'P') {
                const predictionEnabled = this.targetingSystem.togglePrediction();
                this.updatePredictionStatus(predictionEnabled);
            }
        });
    }
    
    createTargetingHUD() {
        // Create HUD container if it doesn't exist
        let hudContainer = document.getElementById('targeting-hud');
        if (!hudContainer) {
            hudContainer = document.createElement('div');
            hudContainer.id = 'targeting-hud';
            hudContainer.style.position = 'absolute';
            hudContainer.style.top = '100px';
            hudContainer.style.left = '20px';
            hudContainer.style.color = '#4080ff';
            hudContainer.style.fontFamily = 'Orbitron, sans-serif';
            hudContainer.style.fontSize = '12px';
            hudContainer.style.textShadow = '0 0 5px rgba(64, 128, 255, 0.7)';
            hudContainer.style.pointerEvents = 'none';
            hudContainer.style.zIndex = '10';
            document.body.appendChild(hudContainer);
        }
        
        // Create targeting status element
        const targetingStatus = document.createElement('div');
        targetingStatus.id = 'targeting-status';
        targetingStatus.textContent = 'MIRA AUTOMÁTICA: ATIVADA';
        hudContainer.appendChild(targetingStatus);
        
        // Create prediction status element
        const predictionStatus = document.createElement('div');
        predictionStatus.id = 'prediction-status';
        predictionStatus.textContent = 'PREDIÇÃO DE MOVIMENTO: ATIVADA';
        hudContainer.appendChild(predictionStatus);
        
        // Create target info element
        const targetInfo = document.createElement('div');
        targetInfo.id = 'target-info';
        targetInfo.style.marginTop = '10px';
        targetInfo.style.display = 'none';
        hudContainer.appendChild(targetInfo);
    }
    
    updateTargetingStatus(enabled) {
        const statusElement = document.getElementById('targeting-status');
        if (statusElement) {
            statusElement.textContent = `MIRA AUTOMÁTICA: ${enabled ? 'ATIVADA' : 'DESATIVADA'}`;
            statusElement.style.color = enabled ? '#4080ff' : '#808080';
        }
    }
    
    updatePredictionStatus(enabled) {
        const statusElement = document.getElementById('prediction-status');
        if (statusElement) {
            statusElement.textContent = `PREDIÇÃO DE MOVIMENTO: ${enabled ? 'ATIVADA' : 'DESATIVADA'}`;
            statusElement.style.color = enabled ? '#4080ff' : '#808080';
        }
    }
    
    update() {
        // Update the targeting system
        this.targetingSystem.update();
        
        // Update HUD with target information
        this.updateTargetInfoHUD();
        
        // Apply aim assist to player ship if enabled
        this.applyAimAssist();
    }
    
    updateTargetInfoHUD() {
        const targetInfoElement = document.getElementById('target-info');
        if (!targetInfoElement) return;
        
        const targetInfo = this.targetingSystem.getTargetInfo();
        
        if (targetInfo) {
            // Show target info
            targetInfoElement.style.display = 'block';
            
            // Format enemy type
            let enemyType = 'DESCONHECIDO';
            switch(targetInfo.type) {
                case 1:
                    enemyType = 'BATEDOR';
                    break;
                case 2:
                    enemyType = 'CAÇA';
                    break;
                case 3:
                    enemyType = 'DESTRUIDOR';
                    break;
            }
            
            // Update info text
            targetInfoElement.innerHTML = `
                <div>ALVO: ${enemyType}</div>
                <div>DISTÂNCIA: ${targetInfo.distance}m</div>
                <div>INTEGRIDADE: ${typeof targetInfo.health === 'number' ? Math.floor(targetInfo.health) : targetInfo.health}</div>
                <div>BLOQUEIO: ${targetInfo.lockPercentage}%</div>
            `;
            
            // Color based on lock percentage
            if (targetInfo.lockPercentage < 30) {
                targetInfoElement.style.color = '#ff4040'; // Red for low lock
            } else if (targetInfo.lockPercentage < 70) {
                targetInfoElement.style.color = '#ffff40'; // Yellow for medium lock
            } else {
                targetInfoElement.style.color = '#40ff40'; // Green for strong lock
            }
        } else {
            // Hide target info when no target
            targetInfoElement.style.display = 'none';
        }
    }
    
    applyAimAssist() {
        // Only apply aim assist if targeting is enabled
        if (!this.targetingSystem.enabled) return;
        
        // Get aim assist angle adjustment
        const aimAssistAngle = this.targetingSystem.getAimAssistAngle();
        
        // Apply aim assist to player ship rotation if an adjustment is available
        if (aimAssistAngle !== null) {
            this.gameController.spaceship.angle += aimAssistAngle;
            
            // Normalize angle
            while (this.gameController.spaceship.angle > Math.PI * 2) {
                this.gameController.spaceship.angle -= Math.PI * 2;
            }
            while (this.gameController.spaceship.angle < 0) {
                this.gameController.spaceship.angle += Math.PI * 2;
            }
        }
    }
    
    // Method to adjust targeting parameters based on difficulty
    adjustForDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.targetingSystem.setTargetingRange(500);
                this.targetingSystem.setAssistStrength(0.25);
                break;
            case 'normal':
                this.targetingSystem.setTargetingRange(400);
                this.targetingSystem.setAssistStrength(0.15);
                break;
            case 'hard':
                this.targetingSystem.setTargetingRange(300);
                this.targetingSystem.setAssistStrength(0.08);
                break;
        }
    }
    
    // Clean up resources when no longer needed
    destroy() {
        // Clean up targeting system
        this.targetingSystem.destroy();
        
        // Remove HUD elements
        const hudElement = document.getElementById('targeting-hud');
        if (hudElement && hudElement.parentNode) {
            hudElement.parentNode.removeChild(hudElement);
        }
    }
}

// Add initialization code to be run when the game starts
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game controller to be initialized
    const initInterval = setInterval(() => {
        if (window.gameController) {
            // Initialize targeting system integration
            window.gameController.targetingIntegration = new TargetingSystemIntegration(window.gameController);
            
            // Add to game loop
            const originalGameLoop = window.gameController.gameLoop;
            window.gameController.gameLoop = function() {
                // Call original game loop
                originalGameLoop.call(this);
                
                // Update targeting integration
                if (this.targetingIntegration) {
                    this.targetingIntegration.update();
                }
            };
            
            clearInterval(initInterval);
        }
    }, 100);
});