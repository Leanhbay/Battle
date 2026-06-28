// src/entities/Grenade.js

export class Grenade {
    constructor(x, y, dirX, dirY) {
        this.type = 'grenade_proj';
        this.gridX = x;
        this.gridY = y;
        this.vx = dirX * 10;
        this.vy = dirY * 10;
        this.active = true;
        this.timer = 1.5; // Giảm thời gian chờ nổ xuống 1.5s để nhịp độ game dồn dập hơn
        this.exploded = false;
    }
    
    update(deltaTime, gameMap, noiseManager, zombies, player, particleManager) {
        if (!this.active) return;
        
        if (this.timer > 0) {
            this.gridX += this.vx * deltaTime;
            this.gridY += this.vy * deltaTime;
            this.vx *= 0.92;
            this.vy *= 0.92;
            
            this.timer -= deltaTime;
            
            if (gameMap.isSolid(this.gridX, this.gridY)) {
                this.vx *= -0.5;
                this.vy *= -0.5;
            }
            
            if (this.timer <= 0) {
                this.explode(noiseManager, zombies, player, particleManager);
            }
        } else {
            this.timer -= deltaTime;
            if (this.timer < -0.25) this.active = false;
        }
    }
    
    explode(noiseManager, zombies, player, particleManager) {
        this.exploded = true;
        const radius = 5.0;
        const maxDmg = 250;
        
        // Hàm xử lý chung cho cả Người và Zombie khi trúng nổ
        const applyBlastPhysics = (ent) => {
            const dx = ent.gridX - this.gridX;
            const dy = ent.gridY - this.gridY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            
            if (dist <= radius) {
                const dmg = maxDmg * Math.pow(1 - (dist / radius), 1.5);
                const force = (1 - (dist / radius)) * 12; // Lực hất văng cực mạnh
                
                ent.takeDamage(dmg);
                ent.kbX = (dx / dist) * force;
                ent.kbY = (dy / dist) * force;
                ent.kbTimer = 0.6; // Nằm la liệt 0.6 giây
                
                // Nếu sát thương nổ rút sạch máu -> Banh xác
                if (ent.health <= 0) {
                    ent.explodedToPieces = true;
                    if (window.spawnGibs) window.spawnGibs(ent.gridX, ent.gridY); // Gọi hàm xả thịt vụn
                    for (let i = 0; i < 6; i++) particleManager.addBlood(ent.gridX, ent.gridY, (dx / dist) * Math.random(), (dy / dist) * Math.random());
                } else {
                    particleManager.addBlood(ent.gridX, ent.gridY, dx / dist, dy / dist);
                }
            }
        };
        
        zombies.forEach(z => {
            if (z.health > 0) applyBlastPhysics(z);
        });
        
        if (player.health > 0) {
            applyBlastPhysics(player);
        }
        
        noiseManager.addNoise(this.gridX, this.gridY, 60);
    }
}