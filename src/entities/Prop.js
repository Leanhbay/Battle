// src/entities/Prop.js

export class Prop {
    static spriteCache = {};
    static shadowCache = {}; // Lưu trữ sẵn bóng râm để tối ưu FPS

    static getSprite(type) {
        if (this.spriteCache[type]) return this.spriteCache[type];
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const drawPixelCircle = (cx, cy, radius, colors, pixelSize = 2) => {
            for(let x = cx - radius; x <= cx + radius; x += pixelSize) {
                for(let y = cy - radius; y <= cy + radius; y += pixelSize) {
                    let distSq = Math.pow(x - cx + pixelSize/2, 2) + Math.pow(y - cy + pixelSize/2, 2);
                    if (distSq <= radius * radius) {
                        if (Math.random() < 0.95) {
                            let colorIdx = Math.floor(Math.random() * colors.length);
                            if (y > cy + radius * 0.3) colorIdx = 0; 
                            else if (y < cy - radius * 0.3 && x < cx) colorIdx = colors.length - 1; 
                            
                            ctx.fillStyle = colors[colorIdx];
                            ctx.fillRect(x, y, pixelSize, pixelSize);
                        }
                    }
                }
            }
        };

        if (type === 'tree_large') {
            canvas.width = 96; canvas.height = 160;
            
            ctx.fillStyle = '#2d1a11'; ctx.fillRect(42, 80, 16, 80); 
            ctx.fillStyle = '#3e2723'; ctx.fillRect(42, 80, 10, 80); 
            ctx.fillStyle = '#4e342e'; ctx.fillRect(42, 80, 4, 80);  
            
            ctx.fillStyle = '#2d1a11'; ctx.fillRect(36, 150, 6, 10); 
            ctx.fillRect(54, 145, 8, 15); 
            
            const leafColors = ['#143a16', '#1b5e20', '#2e7d32', '#388e3c', '#4caf50', '#81c784'];
            drawPixelCircle(48, 90, 36, leafColors);
            drawPixelCircle(48, 55, 30, leafColors);
            drawPixelCircle(48, 25, 24, leafColors);
            drawPixelCircle(48, 10, 16, leafColors);

        } else if (type === 'bush') {
            canvas.width = 64; canvas.height = 48;
            const bushColors = ['#1b5e20', '#2e7d32', '#388e3c', '#4caf50', '#8bc34a'];
            drawPixelCircle(32, 24, 22, bushColors);
            
            ctx.fillStyle = '#e74c3c'; 
            ctx.fillRect(20, 16, 4, 4); 
            ctx.fillRect(44, 28, 4, 4); 
            ctx.fillRect(32, 12, 4, 4);
            ctx.fillRect(24, 32, 4, 4);

        } else if (type === 'rock_large') {
            canvas.width = 80; canvas.height = 64;
            const rockColors = ['#1a1a1a', '#212121', '#424242', '#616161', '#757575', '#9e9e9e'];
            
            for(let x = 8; x <= 72; x += 2) {
                for(let y = 20; y <= 56; y += 2) {
                    if (Math.pow(x - 40, 2)/3.5 + Math.pow(y - 38, 2) <= 220) {
                        let cIdx = Math.floor(Math.random() * 4); 
                        if (y < 32 && x < 48) cIdx = Math.floor(Math.random() * 2) + 4; 
                        ctx.fillStyle = rockColors[cIdx];
                        ctx.fillRect(x, y, 2, 2);
                    }
                }
            }
            ctx.fillStyle = '#2e7d32'; 
            ctx.fillRect(24, 24, 12, 4); 
            ctx.fillRect(20, 28, 8, 4); 
            ctx.fillRect(48, 48, 16, 4);
            ctx.fillRect(52, 44, 8, 4);
        }

        this.spriteCache[type] = canvas;
        return canvas;
    }

    // TÍNH NĂNG MỚI: Tự động đúc khuôn 1 phiên bản Bóng râm hình dáng giống hệt vật thể gốc
    static getShadowSprite(type) {
        if (this.shadowCache[type]) return this.shadowCache[type];
        const sprite = this.getSprite(type);
        const canvas = document.createElement('canvas');
        canvas.width = sprite.width;
        canvas.height = sprite.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(sprite, 0, 0);
        // Biến toàn bộ chi tiết thành khối màu tối
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = '#0c1424'; // Tông xanh hải quân bóng tối (HDR)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.shadowCache[type] = canvas;
        return canvas;
    }

    constructor(type, gridX, gridY) {
        this.type = 'prop';
        this.propType = type; 
        this.gridX = gridX;
        this.gridY = gridY;
        this.sprite = Prop.getSprite(type);
        this.shadowSprite = Prop.getShadowSprite(type); // Load sẵn Shadow
        this.width = this.sprite.width;
        this.height = this.sprite.height;

        if (type === 'tree_large') this.radius = 0.4;
        else if (type === 'rock_large') this.radius = 0.65;
        else if (type === 'bush') this.radius = 0; 
    }
}
