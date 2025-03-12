// Enhanced Physics System for Space Arm Game

class EnhancedPhysics {
    constructor(gameController) {
        this.gameController = gameController;
        this.gravity = 0; // Zero gravity in space
        this.friction = 0.98; // Default friction in space
        this.elasticity = 0.7; // Default elasticity for collisions
        this.maxSpeed = 12; // Maximum speed for any object
        this.minSpeed = 0.01; // Minimum speed threshold (to prevent endless tiny movements)
        
        // Collision groups
        this.collisionGroups = {
            PLAYER: 1,
            ENEMY: 2,
            PROJECTILE: 4,
            ASTEROID: 8,
            POWERUP: 16,
            BOUNDARY: 32
        };
    }
    
    // Apply physics to an object with velocity
    updateObjectPhysics(obj) {
        // Apply velocity
        obj.x += obj.velocity.x;
        obj.y += obj.velocity.y;
        
        // Apply friction
        obj.velocity.x *= this.friction;
        obj.velocity.y *= this.friction;
        
        // Limit speed
        const speed = Math.sqrt(obj.velocity.x * obj.velocity.x + obj.velocity.y * obj.velocity.y);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            obj.velocity.x *= ratio;
            obj.velocity.y *= ratio;
        }
        
        // Stop very slow movements
        if (speed < this.minSpeed) {
            obj.velocity.x = 0;
            obj.velocity.y = 0;
        }
        
        // Apply world boundaries if enabled
        if (this.gameController.worldBoundaries) {
            this.applyWorldBoundaries(obj);
        }
    }
    
    // Apply thrust to an object in the direction of its angle
    applyThrust(obj, thrustPower) {
        const thrustX = Math.cos(obj.angle) * thrustPower;
        const thrustY = Math.sin(obj.angle) * thrustPower;
        
        obj.velocity.x += thrustX;
        obj.velocity.y += thrustY;
    }
    
    // Apply world boundaries (wrap around or bounce)
    applyWorldBoundaries(obj) {
        const worldSize = this.gameController.worldSize;
        const boundaryMode = this.gameController.boundaryMode || 'wrap'; // 'wrap' or 'bounce'
        
        if (boundaryMode === 'wrap') {
            // Wrap around edges
            if (obj.x < 0) obj.x = worldSize.width;
            if (obj.x > worldSize.width) obj.x = 0;
            if (obj.y < 0) obj.y = worldSize.height;
            if (obj.y > worldSize.height) obj.y = 0;
        } else if (boundaryMode === 'bounce') {
            // Bounce off edges
            if (obj.x < 0) {
                obj.x = 0;
                obj.velocity.x = -obj.velocity.x * this.elasticity;
            } else if (obj.x > worldSize.width) {
                obj.x = worldSize.width;
                obj.velocity.x = -obj.velocity.x * this.elasticity;
            }
            
            if (obj.y < 0) {
                obj.y = 0;
                obj.velocity.y = -obj.velocity.y * this.elasticity;
            } else if (obj.y > worldSize.height) {
                obj.y = worldSize.height;
                obj.velocity.y = -obj.velocity.y * this.elasticity;
            }
        }
    }
    
    // Check collision between two objects using circle collision
    checkCollision(obj1, obj2) {
        // Calculate distance between objects
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Get collision radius (average of both objects' sizes)
        const radius1 = obj1.radius || Math.max(obj1.width, obj1.height) / 2;
        const radius2 = obj2.radius || Math.max(obj2.width, obj2.height) / 2;
        
        // Check if distance is less than combined radii
        return distance < radius1 + radius2;
    }
    
    // Resolve collision between two objects
    resolveCollision(obj1, obj2) {
        // Calculate collision vector
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const vx = obj1.velocity.x - obj2.velocity.x;
        const vy = obj1.velocity.y - obj2.velocity.y;
        
        // Calculate velocity along collision normal
        const velocityAlongNormal = vx * nx + vy * ny;
        
        // Don't resolve if objects are moving away from each other
        if (velocityAlongNormal > 0) return;
        
        // Calculate impulse scalar
        const impulseScalar = -(1 + this.elasticity) * velocityAlongNormal;
        
        // Calculate mass ratios (assuming equal mass if not specified)
        const mass1 = obj1.mass || 1;
        const mass2 = obj2.mass || 1;
        const totalMass = mass1 + mass2;
        
        // Apply impulse
        const impulse1 = impulseScalar * (mass2 / totalMass);
        const impulse2 = impulseScalar * (mass1 / totalMass);
        
        obj1.velocity.x += nx * impulse1;
        obj1.velocity.y += ny * impulse1;
        obj2.velocity.x -= nx * impulse2;
        obj2.velocity.y -= ny * impulse2;
    }
    
    // Apply gravitational force between two objects
    applyGravity(obj1, obj2, gravityStrength = 0.1) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distSq = dx * dx + dy * dy;
        
        // Avoid division by zero and limit extreme gravity at very close distances
        if (distSq < 1) return;
        
        // Calculate gravitational force
        const force = gravityStrength / distSq;
        
        // Calculate mass factors
        const mass1 = obj1.mass || 1;
        const mass2 = obj2.mass || 1;
        
        // Apply force to velocity
        const forceX = dx * force * mass2;
        const forceY = dy * force * mass2;
        
        obj1.velocity.x += forceX / mass1;
        obj1.velocity.y += forceY / mass1;
    }
    
    // Create a particle effect at a position
    createParticleEffect(x, y, color, count = 10, speed = 2, lifetime = 1000) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;
            
            particles.push({
                x: x,
                y: y,
                velocity: {
                    x: Math.cos(angle) * velocity,
                    y: Math.sin(angle) * velocity
                },
                color: color,
                alpha: 1,
                size: Math.random() * 3 + 1,
                lifetime: lifetime,
                createdAt: Date.now()
            });
        }
        
        return particles;
    }
    
    // Update particles
    updateParticles(particles) {
        const now = Date.now();
        const updatedParticles = [];
        
        for (const particle of particles) {
            // Calculate age
            const age = now - particle.createdAt;
            
            // Remove expired particles
            if (age >= particle.lifetime) continue;
            
            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // Update alpha based on age
            particle.alpha = 1 - (age / particle.lifetime);
            
            // Apply friction
            particle.velocity.x *= this.friction;
            particle.velocity.y *= this.friction;
            
            updatedParticles.push(particle);
        }
        
        return updatedParticles;
    }
    
    // Set physics parameters
    setParameters(params) {
        if (params.friction !== undefined) this.friction = params.friction;
        if (params.elasticity !== undefined) this.elasticity = params.elasticity;
        if (params.maxSpeed !== undefined) this.maxSpeed = params.maxSpeed;
        if (params.minSpeed !== undefined) this.minSpeed = params.minSpeed;
        if (params.gravity !== undefined) this.gravity = params.gravity;
    }
}
