// src/world/Map.js

export class GameMap {
    constructor() {
        this.tiles = new Map(); 
        this.width = 400;
        this.height = 400;
    }

    getKey(x, y) {
        return `${Math.floor(x)},${Math.floor(y)}`;
    }

    getTile(x, y) {
        const fx = Math.floor(x); 
        const fy = Math.floor(y);
        
        // Nước biển ở bên ngoài ranh giới
        if (fx < 0 || fx >= this.width || fy < 0 || fy >= this.height) {
            return 3; 
        }

        // TÍNH NĂNG MỚI: Bãi cát trải rộng 4 ô từ mép bờ biển
        if (fx < 4 || fx >= this.width - 4 || fy < 4 || fy >= this.height - 4) {
            return 4; // 4 là Cát
        }

        const key = this.getKey(x, y);
        if (this.tiles.has(key)) {
            return this.tiles.get(key);
        }
        
        return 0; // Cỏ/Đất liền
    }

    setBlock(x, y, type) {
        const fx = Math.floor(x); 
        const fy = Math.floor(y);
        if (fx >= 0 && fx < this.width && fy >= 0 && fy < this.height) {
            this.tiles.set(this.getKey(x, y), type);
        }
    }

    isSolid(x, y) {
        const type = this.getTile(x, y);
        // Không đi xuyên qua biển (3) và tường (2). Cát (4) đi qua bình thường
        return type === 2 || type === 3; 
    }
}
