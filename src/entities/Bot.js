// src/entities/Bot.js
import { Bullet } from './Bullet.js';

export class Bot {
    constructor(id, name, x, y, weaponData) {
        this.id = id; 
        this.name = name; 
        this.type = 'bot';
        this.gridX = x; 
        this.gridY = y;
        this.width = 64; 
        this.height = 64;
        this.health = 100; 
        this.kbTimer = 0;
        this.facingX = 1; 
        this.facingY = 0;
        this.speed = 2.0 + Math.random() * 1.4;
        this.weapon = 'none';
        this.unlockedWeapons = [];
        this.weaponData = weaponData; // Lấy dữ liệu súng từ tham số truyền vào
        this.shootCooldown = 0;
        this.stateTimer = 0;
        this.targetX = x; 
        this.targetY = y;
        this.currentState = 'idle';
        this.walkAnimTimer = 0;
        this.inventory = { heal: 0 };
        this.explodedToPieces = false;

        this.colors = {
            skin: ['#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#ffdbac'][Math.floor(Math.random()*5)],
            skinDark: '#5c3a21',
            shirt: ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#ecf0f1', '#e67e22'][Math.floor(Math.random()*7)],
            shirtDark: '#1a252f',
            pants: ['#2980b9', '#2c3e50', '#7f8c8d', '#d35400'][Math.floor(Math.random()*4)],
            pantsDark: '#111722',
            hair: ['#2c3e50', '#000000', '#7f8c8d', '#f1c40f', '#e67e22'][Math.floor(Math.random()*5)]
        };
        this.sprites = this.generateSprites();
    }

    generateSprites() {
        const createFrame = (dir, state) => {
            const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 64; const cx = cvs.getContext('2d');
            let bounce = (state === 'walk1' || state === 'walk2') ? 2 : 0;
            let legS1 = state === 'walk1' ? -5 : (state === 'walk2' ? 5 : 0);
            let legS2 = state === 'walk1' ? 5 : (state === 'walk2' ? -5 : 0);
            let armS1 = state === 'walk1' ? 4 : (state === 'walk2' ? -4 : 0);
            let armS2 = state === 'walk1' ? -4 : (state === 'walk2' ? 4 : 0);
            
            cx.imageSmoothingEnabled = false;
            const pxBox = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(x, y, w, h); };

            if (dir === 'side') {
                pxBox(28 + legS2, 44 + bounce, 8, 14, this.colors.pantsDark); pxBox(28 + legS2, 58 + bounce, 10, 4, '#111'); 
                pxBox(28 + armS2, 26 + bounce, 6, 14, this.colors.shirtDark); pxBox(28 + armS2, 38 + bounce, 6, 4, this.colors.skinDark); 
                pxBox(24, 26 + bounce, 14, 18, this.colors.shirt); pxBox(24, 40 + bounce, 14, 4, '#222'); 
                pxBox(26 + legS1, 44 + bounce, 8, 16, this.colors.pants); pxBox(26 + legS1, 58 + bounce, 10, 4, '#000'); 
                pxBox(24, 10 + bounce, 14, 16, this.colors.skin); pxBox(24, 10 + bounce, 14, 6, this.colors.hair); 
                pxBox(28 + armS1, 26 + bounce, 6, 14, this.colors.shirt); pxBox(28 + armS1, 38 + bounce, 6, 4, this.colors.skin); 
            } else if (dir === 'front') {
                pxBox(22, 44 + bounce + legS1, 8, 16, this.colors.pants); pxBox(22, 58 + bounce + legS1, 8, 4, '#000');
                pxBox(34, 44 + bounce + legS2, 8, 16, this.colors.pantsDark); pxBox(34, 58 + bounce + legS2, 8, 4, '#111');
                pxBox(18, 26 + bounce, 26, 18, this.colors.shirt); pxBox(18, 42 + bounce, 26, 4, '#222');
                pxBox(22, 10 + bounce, 18, 16, this.colors.skin); pxBox(22, 10 + bounce, 18, 6, this.colors.hair);
                pxBox(25, 16 + bounce, 2, 2, '#fff'); pxBox(35, 16 + bounce, 2, 2, '#fff');
                pxBox(12, 26 + bounce + armS1, 6, 14, this.colors.shirt); pxBox(12, 38 + bounce + armS1, 6, 4, this.colors.skin);
                pxBox(44, 26 + bounce + armS2, 6, 14, this.colors.shirtDark); pxBox(44, 38 + bounce + armS2, 6, 4, this.colors.skinDark);
            } else if (dir === 'back') {
                pxBox(22, 44 + bounce + legS2, 8, 16, this.colors.pantsDark); pxBox(22, 58 + bounce + legS2, 8, 4, '#111');
                pxBox(34, 44 + bounce + legS1, 8, 16, this.colors.pants); pxBox(34, 58 + bounce + legS1, 8, 4, '#000');
                pxBox(12, 26 + bounce + armS2, 6, 14, this.colors.shirtDark); pxBox(12, 38 + bounce + armS2, 6, 4, this.colors.skinDark);
                pxBox(44, 26 + bounce + armS1, 6, 14, this.colors.shirt); pxBox(44, 38 + bounce + armS1, 6, 4, this.colors.skin);
                pxBox(18, 26 + bounce, 26, 18, this.colors.shirtDark); pxBox(18, 42 + bounce, 26, 4, '#111');
                pxBox(22, 10 + bounce, 18, 16, this.colors.skinDark); pxBox(22, 10 + bounce, 18, 16, this.colors.hair); 
            }
            return cvs;
        }
        return {
            front: { idle: createFrame('front', 'idle'), walk1: createFrame('front', 'walk1'), walk2: createFrame('front', 'walk2') },
            back:  { idle: createFrame('back', 'idle'), walk1: createFrame('back', 'walk1'), walk2: createFrame('back', 'walk2') },
            side:  { idle: createFrame('side', 'idle'), walk1: createFrame('side', 'walk1'), walk2: createFrame('side', 'walk2') }
        };
    }

    update(dt, map, playersAndBots, items, bulletsArr, noiseManager) {
        if (this.health <= 0) return;
        if (this.kbTimer > 0) {
            this.kbTimer -= dt;
            let nX = this.gridX + (this.kbX || 0) * dt; let nY = this.gridY + (this.kbY || 0) * dt;
            if (!map.isSolid(nX, this.gridY)) this.gridX = nX; if (!map.isSolid(this.gridX, nY)) this.gridY = nY;
            return;
        }

        let isMoving = false;
        this.shootCooldown -= dt;
        this.stateTimer -= dt;

        if (this.health < 40 && this.inventory.heal > 0) { this.health += 35; this.inventory.heal--; }

        let closestEnemy = null; let minEnemyDist = 16;
        playersAndBots.forEach(e => {
            if (e.id !== this.id && e.health > 0) {
                let d = Math.hypot(e.gridX - this.gridX, e.gridY - this.gridY);
                if (d < minEnemyDist) { minEnemyDist = d; closestEnemy = e; }
            }
        });

        if (closestEnemy) {
            let dx = closestEnemy.gridX - this.gridX; let dy = closestEnemy.gridY - this.gridY;
            let dist = Math.hypot(dx, dy); this.facingX = dx / dist; this.facingY = dy / dist;
            
            let atkRange = this.weapon !== 'none' ? 10 : 1.2;
            if (minEnemyDist > atkRange - 1.5) {
                let nX = this.gridX + this.facingX * this.speed * dt; let nY = this.gridY + this.facingY * this.speed * dt;
                if (!map.isSolid(nX, this.gridY)) this.gridX = nX; if (!map.isSolid(this.gridX, nY)) this.gridY = nY;
                isMoving = true;
            }

            if (minEnemyDist <= atkRange && this.shootCooldown <= 0) {
                if (this.weapon !== 'none') {
                    let angle = Math.atan2(this.facingY, this.facingX);
                    if (Math.random() > 0.60) { angle += (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.3); }
                    let dirX = Math.cos(angle); let dirY = Math.sin(angle);
                    
                    let b = new Bullet(this.gridX + dirX * 0.7, this.gridY + dirY * 0.7, dirX, dirY, this.weapon);
                    b.owner = this.id; bulletsArr.push(b); 
                    if(noiseManager) noiseManager.addNoise(this.gridX, this.gridY, 15);
                    this.shootCooldown = 0.4 + Math.random() * 0.5;
                } else {
                    closestEnemy.health -= 12; 
                    if(window.spawnBlood) window.spawnBlood(closestEnemy.gridX, closestEnemy.gridY, this.facingX, this.facingY);
                    this.shootCooldown = 0.9;
                }
            }
        } else {
            let closestLoot = null; let minLootDist = 14;
            items.forEach(i => {
                let needed = (i.itemType === 'weapon' && this.weapon === 'none') || (i.itemType === 'heal' && this.inventory.heal < 2);
                if (needed) {
                    let d = Math.hypot(i.gridX - this.gridX, i.gridY - this.gridY);
                    if (d < minLootDist) { minLootDist = d; closestLoot = i; }
                }
            });

            if (closestLoot) {
                if (minLootDist < 1.0) {
                    if (closestLoot.itemType === 'weapon') {
                        this.weapon = closestLoot.value; if (!this.unlockedWeapons.includes(this.weapon)) this.unlockedWeapons.push(this.weapon);
                    } else if (closestLoot.itemType === 'heal') { this.inventory.heal++; }
                    let idx = items.findIndex(i => i.uid === closestLoot.uid); if(idx !== -1) items.splice(idx, 1);
                } else {
                    let dx = closestLoot.gridX - this.gridX; let dy = closestLoot.gridY - this.gridY;
                    this.facingX = dx/minLootDist; this.facingY = dy/minLootDist;
                    let nX = this.gridX + this.facingX * this.speed * dt; let nY = this.gridY + this.facingY * this.speed * dt;
                    if (!map.isSolid(nX, this.gridY)) this.gridX = nX; if (!map.isSolid(this.gridX, nY)) this.gridY = nY;
                    isMoving = true;
                }
            } else {
                if (this.stateTimer <= 0) {
                    this.targetX = this.gridX + (Math.random() - 0.5) * 16; this.targetY = this.gridY + (Math.random() - 0.5) * 16;
                    this.stateTimer = 2.5 + Math.random() * 3;
                }
                let dTX = this.targetX - this.gridX; let dTY = this.targetY - this.gridY; let distT = Math.hypot(dTX, dTY);
                if (distT > 0.5) {
                    this.facingX = dTX/distT; this.facingY = dTY/distT;
                    let nX = this.gridX + this.facingX * (this.speed*0.6) * dt; let nY = this.gridY + this.facingY * (this.speed*0.6) * dt;
                    if (!map.isSolid(nX, this.gridY)) this.gridX = nX; if (!map.isSolid(this.gridX, nY)) this.gridY = nY;
                    isMoving = true;
                }
            }
        }

        if (isMoving) {
            this.walkAnimTimer += dt * 8; if (this.walkAnimTimer > Math.PI * 2) this.walkAnimTimer = 0;
            this.currentState = this.walkAnimTimer < Math.PI ? 'walk1' : 'walk2';
        } else {
            this.currentState = 'idle'; this.walkAnimTimer = 0;
        }
    }
}
