// src/entities/Bullet.js

export class Bullet {
    constructor(x, y, dirX, dirY, weaponType = 'm4a1') {
        this.type = 'bullet';
        this.gridX = x;
        this.gridY = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.active = true;
        this.width = 4;
        this.height = 4;
        this.distanceTraveled = 0;

        this.speed = 20; 
        this.maxDistance = 15; 
        this.damage = 25; 

        switch (weaponType) {
            case 'akm':
                this.speed = 28; this.maxDistance = 25; this.damage = 38; 
                break;
            case 'm4a1':
            case 'scar':
            case 'famas':
                this.speed = 30; this.maxDistance = 24; this.damage = 30; 
                break;
            case 'p90':
                this.speed = 26; this.maxDistance = 16; this.damage = 22; 
                break;
            case 'glock':
                this.speed = 22; this.maxDistance = 14; this.damage = 20; 
                break;
            case 'uzi':
                this.speed = 22; this.maxDistance = 12; this.damage = 18; 
                break;
            case 'shotgun':
                this.speed = 25; this.maxDistance = 6; this.damage = 25; 
                break;
        }
    }

    update(deltaTime, gameMap) {
        const moveAmt = this.speed * deltaTime;
        this.gridX += this.dirX * moveAmt;
        this.gridY += this.dirY * moveAmt;
        this.distanceTraveled += moveAmt;

        // Đã sửa: Nếu khoảng cách bay lớn hơn maxDistance thì hủy đạn
        if (this.distanceTraveled >= this.maxDistance) {
            this.active = false;
            return;
        }

        if (gameMap.isSolid(this.gridX, this.gridY)) {
            this.active = false;
        }
    }
}
