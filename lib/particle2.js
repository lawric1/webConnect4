import { lerp, randomInt, toRadians } from "./math.js";

export class Particle {
    constructor(x = 0, y = 0) {
        this.active = false;

        this.x = x;
        this.y = y;
        this.direction;
        this.velx;
        this.vely;
        this.gravity;

        this.scale;

        this.angle;
        this.angularVelocity;

        this.initialLifetime;
        this.lifetime;

        this.texture;
        this.maxFrames;
        this.frameWidth;
        this.frameHeight;
        this.currentFrame = 0;
    }

    applySpread(direction, spread) {
        const randomAngle = (Math.random() - 0.5) * toRadians(spread);
        const x = direction.x;
        const y = direction.y;
        const cosTheta = Math.cos(randomAngle);
        const sinTheta = Math.sin(randomAngle);

        const newX = x * cosTheta - y * sinTheta;
        const newY = x * sinTheta + y * cosTheta;

        return { x: newX, y: newY };
    }

    init(x, y, config) {
        this.x = randomInt(-config.emissionShape.x, config.emissionShape.x) + x;
        this.y = randomInt(-config.emissionShape.y, config.emissionShape.y) + y;

        this.direction = this.applySpread(config.direction, config.spread);

        this.velx = config.velocity * this.direction.x;
        this.vely = config.velocity * this.direction.y;

        this.gravity = config.gravity;

        this.scale = config.randomScale ? randomInt(1, config.scale) : config.scale;

        this.angle = config.randomAngle ? randomInt(-config.angle, config.angle) : config.angle;
        this.angularVelocity = config.angularVelocity

        this.initialLifetime = config.lifetime;
        this.lifetime = config.lifetime;

        this.texture = config.texture;
        this.maxFrames = config.maxFrames;
        this.frameWidth = config.frameWidth;
        this.frameHeight = config.frameHeight;

        this.currentFrame = 0;

        this.active = true;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime

        this.vely += this.gravity * deltaTime;
        this.velx += randomInt(-10, 10) * deltaTime;

        this.x += this.velx * deltaTime;
        this.y += this.vely * deltaTime;

        this.angle += this.angularVelocity * deltaTime;
        // this.size = lerp(this.initialSize, this.finalSize, 1 - this.lifetime, "");

        if (this.maxFrames === 1){
            this.currentFrame = 0;
        } else {
            this.currentFrame = Math.floor(lerp(0, this.maxFrames, this.initialLifetime - this.lifetime, ""));
        }


        if (this.lifetime < 0) {
            this.active = false;
            this.lifetime = this.initialLifetime;
            this.size = this.initialSize
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(this.x, this.y);
        ctx.rotate(toRadians(this.angle));
        ctx.translate(-this.x, -this.y);
        ctx.drawImage(
            this.texture, 
            this.currentFrame * this.frameWidth, 0, 
            this.frameWidth, this.frameHeight, 
            this.x - this.frameWidth/2, this.y - this.frameHeight/2, 
            this.frameWidth * this.scale, this.frameHeight * this.scale
        );
        ctx.restore();
    }
}

export class Emitter {
    constructor() {
        this.usedParticles = [];

        this.currentTime = 0;
        this.emissionRate = 1;

        this.emitting = false;
    }

    start() {
        if (this.usedParticles.length === 0) {
            this.emitting = true;
        }
    }

    stop() {
        this.emitting = false;
    }

    update(deltaTime, x, y, config, particlePool) {
        let reachedMaxParticles = this.usedParticles.length === config.maxParticles;
        // Update the particles while they are active;
        // Recycle the particle if possible;
        for (const particle of this.usedParticles) {
            if (particle.active) {
                particle.update(deltaTime);
            } else {
                const canReuse = !config.explosive && !config.oneshot && this.emitting;
                if (canReuse) {
                    particle.init(x, y, config);
                }
            }
        }
        
        
        // Temporary pool is filled and particles can only trigger once;
        if (reachedMaxParticles && config.oneshot) {
            this.emitting = false;
        }
        // All particles are dead, clear temporary pool;
        if ((!this.emitting || reachedMaxParticles) && this.usedParticles.every((p) => p.active === false)) {
            this.usedParticles = [];
        }

        if (!this.emitting) {
            return;
        }


        this.emissionRate = config.lifetime / config.maxParticles;
        this.currentTime += deltaTime;

        // Emit until maxParticles is reached;
        if (config.explosive) {
            for (const particle of particlePool) {
                let used = this.usedParticles.includes(particle);
                if (!particle.active && !used) {
                    particle.init(x, y, config);

                    this.usedParticles.push(particle);
                }
                if (this.usedParticles.length === config.maxParticles) {
                    return;
                }
            }
        }
        // Emit in intervals while temporary pool is not filled;
        else if (this.currentTime >= this.emissionRate && this.usedParticles.length < config.maxParticles) {
            for (const particle of particlePool) {
                let used = this.usedParticles.includes(particle);
                if (!particle.active && !used) {
                    particle.init(x, y, config);

                    this.usedParticles.push(particle);
                    
                    this.currentTime = 0;
                    break;
                }
            }
        }
    }

    draw(ctx) {
        for (const particle of this.usedParticles) {
            if (particle.active) {
                particle.draw(ctx);
            }
        }
    }
}


// let config = {
//     texture: textures.p2,
//     maxFrames: 6,
//     frameWidth: 16,
//     frameHeight: 16,
    
//     direction: { x: 0, y: -1 },
//     velocity: 40,
//     gravity: 0,
//     spread: 90,
    
//     scale: 2,
//     randomScale: true,
    
//     angle: 90,
//     angularVelocity: 0,
//     randomAngle: true,
    
//     lifetime: 1,

//     emissionShape: { x: 40, y: 20 },
//     oneshot: false,
//     explosive: false,
//     maxParticles: 20,
// }