// src/systems/ParticleManager.js

export class ParticleManager {
    constructor() {
        this.particles = []; 
        this.stains = [];    
    }

    addBlood(gridX, gridY, dirX, dirY) {
        let count = Math.floor(Math.random() * 15) + 15; 
        for(let i = 0; i < count; i++) {
            const angle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 1.5; 
            const speed = Math.random() * 4 + 1; 
            
            this.particles.push({
                type: 'blood',
                x: gridX, 
                y: gridY,
                vx: Math.cos(angle) * speed, 
                vy: Math.sin(angle) * speed,
                vz: Math.random() * 6 + 3, 
                z: 15, 
                life: 1.5,
                size: Math.random() * 1.0 + 0.5, 
                color: Math.random() > 0.4 ? '#8a0303' : '#6b0000' 
            });
        }
    }

    update(deltaTime) {
        // SỬA: Đồng bộ hóa tiến trình thời gian của vết máu theo tỷ lệ chu kỳ 12 phút mới (0.033333)
        const inGameHoursPassed = deltaTime * 0.033333;

        this.particles.forEach(p => {
            p.vx *= 0.95; p.vy *= 0.95;
            p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.z += p.vz * deltaTime;
            p.vz -= 25 * deltaTime; p.life -= deltaTime;

            if(p.z <= 0) {
                p.z = 0; p.vx = 0; p.vy = 0;
                if(this.stains.length < 800 && Math.random() > 0.2) {
                    this.stains.push({
                        x: p.x + (Math.random() - 0.5) * 0.1, 
                        y: p.y + (Math.random() - 0.5) * 0.1, 
                        color: Math.random() > 0.5 ? '#520101' : '#3d0000', 
                        size: (Math.random() * 0.02 + 0.01) * p.size, 
                        stretchX: 1 + Math.random() * 0.8,
                        stretchY: 1 + Math.random() * 0.8,
                        rot: Math.random() * Math.PI * 2,
                        age: 0,
                        alpha: 0.85
                    });
                }
                p.life = 0; 
            }
        });
        
        this.particles = this.particles.filter(p => p.life > 0);

        this.stains.forEach(s => {
            s.age += inGameHoursPassed;
            if (s.age > 24 && s.age <= 72) {
                s.color = '#111111'; 
                s.alpha = 0.6;       
            }
            else if (s.age > 72) {
                const fadeProgress = (s.age - 72) / 24; 
                s.alpha = Math.max(0, 0.6 - fadeProgress * 0.6);
            }
        });

        this.stains = this.stains.filter(s => s.age < 96);
    }

    renderStains(ctx, gridToScreen, TILE_WIDTH, TILE_HEIGHT, camX, camY) {
        this.stains.forEach(s => {
            const pos = gridToScreen(s.x, s.y, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            if (pos.x < -50 || pos.x > window.innerWidth + 50 || pos.y < -50 || pos.y > window.innerHeight + 50) return;

            ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(s.rot); ctx.fillStyle = s.color; ctx.globalAlpha = s.alpha;
            ctx.beginPath(); ctx.ellipse(0, 0, s.size * TILE_WIDTH * s.stretchX, s.size * TILE_HEIGHT * s.stretchY, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
        });
    }
}
