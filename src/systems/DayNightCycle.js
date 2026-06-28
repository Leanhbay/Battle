// src/systems/DayNightCycle.js
import { gridToScreen } from '../utils/Isometric.js';

export class DayNightCycle {
    constructor() {
        this.time = 12; 
        // SỬA: 1 ngày = 12 phút = 720 giây thực tế. Vận tốc = 24 giờ / 720 giây = 1/30 = 0.033333
        this.timeSpeed = 0.033333; 
        this.darkness = 0; 
        this.lightColor = 'rgba(0, 0, 0, 0)'; 
    }

    update(deltaTime) {
        this.time += deltaTime * this.timeSpeed;
        if (this.time >= 24) this.time -= 24;

        if (this.time >= 6 && this.time < 18) {
            const p = Math.abs(this.time - 12) / 6; 
            this.darkness = p * 0.3; 
            this.lightColor = 'rgba(255, 255, 255, 0)'; 
        } else {
            const nTime = this.time >= 18 ? this.time - 18 : this.time + 6;
            const p = Math.abs(nTime - 6) / 6; 
            this.darkness = 0.3 + (1 - p) * 0.6; 
            this.lightColor = 'rgba(255, 220, 150, 0.25)'; 
        }
    }

    render(ctx, canvasWidth, canvasHeight, playerX, playerY) {
        ctx.save();

        if (this.darkness > 0.05) {
            const radius = 220; 
            const gradient = ctx.createRadialGradient(
                playerX, playerY, 20,       
                playerX, playerY, radius    
            );
            
            gradient.addColorStop(0, this.lightColor); 
            gradient.addColorStop(1, `rgba(5, 5, 15, ${this.darkness})`); 

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        ctx.restore();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        
        const hours = Math.floor(this.time).toString().padStart(2, '0');
        const minutes = Math.floor((this.time % 1) * 60).toString().padStart(2, '0');
        ctx.fillText(`Thời gian: ${hours}:${minutes}`, canvasWidth - 20, 30);
        ctx.textAlign = 'left';
    }
}
