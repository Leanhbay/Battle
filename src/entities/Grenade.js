// src/entities/Grenade.js

export class Grenade {
    constructor(x, y, dirX, dirY) {
        this.type = 'grenade_proj';
        this.gridX = x;
        this.gridY = y;
        
        // Quăng ra một lực ném ban đầu
        this.vx = dirX * 8; 
        this.vy = dirY * 8;
        
        this.active = true;
        this.timer = 2.0; // Nổ sau 2 giây
        this.exploded = false;
    }

    update(deltaTime, gameMap, noiseManager, zombies, player, particleManager) {
        if (!this.active) return;

        if (this.timer > 0) {
            // Lựu đạn trượt trên đất và ma sát
            this.gridX += this.vx * deltaTime;
            this.gridY += this.vy * deltaTime;
            this.vx *= 0.95; // Lực cản
            this.vy *= 0.95;
            
            this.timer -= deltaTime;

            if (gameMap.isSolid(this.gridX, this.gridY)) {
                this.vx *= -0.5;
                this.vy *= -0.5;
            }

            if (this.timer <= 0) {
                this.explode(noiseManager, zombies, player, particleManager);
            }
        } else {
            // Đợi hiệu ứng nổ hiển thị xong thì xóa sổ (0.2 giây)
            this.timer -= deltaTime;
            if (this.timer < -0.2) {
                this.active = false;
            }
        }
    }

    explode(noiseManager, zombies, player, particleManager) {
        this.exploded = true;
        // Bán kính nổ (Blast radius) = 3 ô vuông
        const radius = 3.0; 
        const maxDmg = 80;

        // Sát thương lên Zombie
        zombies.forEach(z => {
            if (z.health <= 0) return;
            const dx = z.gridX - this.gridX; const dy = z.gridY - this.gridY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= radius) {
                // Sát thương giảm dần theo khoảng cách
                const dmg = maxDmg * (1 - (dist / radius));
                z.takeDamage(dmg);
                particleManager.addBlood(z.gridX, z.gridY, dx/dist, dy/dist);
            }
        });

        // Sát thương lên Player
        if (player.health > 0) {
            const dx = player.gridX - this.gridX; const dy = player.gridY - this.gridY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= radius) {
                const dmg = maxDmg * (1 - (dist / radius));
                player.takeDamage(dmg);
                particleManager.addBlood(player.gridX, player.gridY, dx/dist, dy/dist);
            }
        }

        noiseManager.addNoise(this.gridX, this.gridY, 35); // Tiếng nổ cực to thu hút zombie từ xa
    }
}
