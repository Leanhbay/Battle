// src/entities/Player.js
import { Inventory } from '../systems/Inventory.js';
import { WeaponManager } from './Weapon.js';

export class Player {
    constructor(startX, startY) {
        this.type = 'player';
        this.gridX = startX; this.gridY = startY;
        this.speed = 5; this.width = 24; this.height = 42; this.hitbox = 0.3;

        this.maxHealth = 100; this.health = 100;
        this.maxStamina = 100; this.stamina = 100; 
        this.maxThirst = 100; this.thirst = 100; 
        this.invulnerableTimer = 0;
        
        this.facingX = 1; this.facingY = 0;
        this.shootCooldown = 0; this.actionCooldown = 0; this.uiCooldown = 0; 
        this.inventory = new Inventory(10);

        this.weapon = 'none'; 
        this.unlockedWeapons = []; 
        
        this.ammo = {
            m4a1: { current: 0, max: 31, type: '5.56mm' },  
            scar: { current: 0, max: 31, type: '5.56mm' },
            famas: { current: 0, max: 25, type: '5.56mm' },
            akm: { current: 0, max: 30, type: '7.62mm' },
            shotgun: { current: 0, max: 8, type: '12.0mm' },
            p90: { current: 0, max: 50, type: '9mm' },
            uzi: { current: 0, max: 32, type: '9mm' },
            glock: { current: 0, max: 17, type: '9.19mm' }
        };
        this.reserveAmmo = {
            '5.56mm': 0, '7.62mm': 0, '12.0mm': 0, '9mm': 0, '9.19mm': 0
        };

        this.isReloading = false; this.reloadTimer = 0; this.reloadDuration = 5.0; 

        this.healingTimer = 0; this.healAmount = 0;
        this.drinkingTimer = 0; this.drinkAmount = 0;
        this.waterBuffTimer = 0;

        this.isSwinging = 0; this.animTime = 0; this.interactTimer = 0; this.eatTimer = 0; 
        this.currentState = 'idle'; this.muzzleFlashTimer = 0;
        
        this.sprites = {
            side: {
                idle: this.generatePixelSprite(this.getFrameData('side_idle')),
                walk1: this.generatePixelSprite(this.getFrameData('side_walk1')),
                walk2: this.generatePixelSprite(this.getFrameData('side_walk2')),
                interact: this.generatePixelSprite(this.getFrameData('side_interact')),
                eat: this.generatePixelSprite(this.getFrameData('side_eat')),
                limp1: this.generatePixelSprite(this.getFrameData('side_walk1')),
                limp2: this.generatePixelSprite(this.getLimpFrame(this.getFrameData('side_walk2')))
            }, front: {
                idle: this.generatePixelSprite(this.getFrameData('front_idle')),
                walk1: this.generatePixelSprite(this.getFrameData('front_walk1')),
                walk2: this.generatePixelSprite(this.getFrameData('front_walk2')),
                interact: this.generatePixelSprite(this.getFrameData('front_idle')),
                eat: this.generatePixelSprite(this.getFrameData('front_idle')),
                limp1: this.generatePixelSprite(this.getFrameData('front_walk1')),
                limp2: this.generatePixelSprite(this.getLimpFrame(this.getFrameData('front_walk2')))
            }, back: {
                idle: this.generatePixelSprite(this.getFrameData('back_idle')),
                walk1: this.generatePixelSprite(this.getFrameData('back_walk1')),
                walk2: this.generatePixelSprite(this.getFrameData('back_walk2')),
                interact: this.generatePixelSprite(this.getFrameData('back_idle')),
                eat: this.generatePixelSprite(this.getFrameData('back_idle')),
                limp1: this.generatePixelSprite(this.getFrameData('back_walk1')),
                limp2: this.generatePixelSprite(this.getLimpFrame(this.getFrameData('back_walk2')))
            }
        };

        this.weaponData = {
            m4a1: WeaponManager.generateSprite('m4a1_body'),
            m4a1_mag: WeaponManager.generateSprite('m4a1_mag'),
            scar: WeaponManager.generateSprite('scar_body'),
            scar_mag: WeaponManager.generateSprite('scar_mag'),
            famas: WeaponManager.generateSprite('famas_body'),
            famas_mag: WeaponManager.generateSprite('famas_mag'),
            akm: WeaponManager.generateSprite('akm_body'),
            akm_mag: WeaponManager.generateSprite('akm_mag'),
            shotgun: WeaponManager.generateSprite('shotgun_body'),
            shotgun_mag: WeaponManager.generateSprite('shotgun_mag'),
            p90: WeaponManager.generateSprite('p90_body'),
            p90_mag: WeaponManager.generateSprite('p90_mag'),
            uzi: WeaponManager.generateSprite('uzi_body'),
            uzi_mag: WeaponManager.generateSprite('uzi_mag'),
            glock: WeaponManager.generateSprite('glock_body'),
            glock_mag: WeaponManager.generateSprite('glock_mag'),
            melee: WeaponManager.generateSprite('melee')
        };
    }

    startInteract(time = 0.3) { this.interactTimer = time; }
    startEat() { this.eatTimer = 0.8; } 
    startHealing(duration, amount) { this.healingTimer = duration; this.healAmount = amount; }
    startDrinking(duration, amount) { this.drinkingTimer = duration; this.drinkAmount = amount; }

    startReload() {
        if (this.isReloading || this.weapon === 'melee' || this.weapon === 'none') return;
        const gun = this.ammo[this.weapon];
        if (gun.current < gun.max && this.reserveAmmo[gun.type] > 0) {
            this.isReloading = true;
            if (['m4a1', 'scar', 'akm'].includes(this.weapon)) this.reloadDuration = 5.0;
            else if (['p90', 'famas'].includes(this.weapon)) this.reloadDuration = 4.5;
            else if (['shotgun', 'uzi'].includes(this.weapon)) this.reloadDuration = 4.0;
            else this.reloadDuration = 3.5;
            this.reloadTimer = this.reloadDuration;
            
            // SỬA CƠ CHẾ: Đang thay đạn ép hủy hành động Uống nước / Cứu thương ngay lập tức
            this.healingTimer = 0;
            this.drinkingTimer = 0;
        }
    }

    completeReload() {
        const gun = this.ammo[this.weapon];
        const needed = gun.max - gun.current;
        const toLoad = Math.min(needed, this.reserveAmmo[gun.type]);
        gun.current += toLoad; this.reserveAmmo[gun.type] -= toLoad; 
    }

    getLimpFrame(frameData) {
        let arr = [...frameData]; arr.pop(); arr.unshift("000000000000000"); return arr;
    }

    getFrameData(state) {
        const frames = {
            side_idle: ["000003333300000", "000033333330000", "000331111133000", "000011111110000", "000011111110000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "008888000888800", "008888000888800"],
            side_walk1: ["000003333300000", "000033333330000", "000331111133000", "000311919113000", "000311111113000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000000000", "000777000777000", "000777000777000", "008888000777000", "008888000777000", "000000000888800", "000000000888800"],
            side_walk2: ["000003333300000", "000033333330000", "000331111133000", "000311919113000", "000311111113000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000000000777000", "000777000777000", "000777000777000", "000777000888800", "000777000888800", "008888000000000", "008888000000000"],
            side_interact: ["000000000000000", "000000000000000", "000000033333000", "000000333333300", "000003311111330", "000003119191130", "000003111111130", "000000111111100", "000000221112200", "000000044444000", "000004444444440", "000044455555444", "000444555555544", "000445555555554", "000005555555550", "000008888888880", "000006666666660", "000006660006660", "000007770007770", "000007770007770", "000007770007770", "000007770007770", "000007770007770", "000088880008888", "000088880008888"],
            side_eat: ["000003333300000", "000033333330000", "000331111133000", "000311919113000", "000311111113000", "000011111110000", "000044111220000", "004444444400000", "044111444444000", "001115555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "008888000888800", "008888000888800"],
            front_idle: ["000003333300000", "000033333330000", "000331111133000", "000319111913000", "000311111113000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "008888000888800", "008888000888800"],
            front_walk1: ["000003333300000", "000033333330000", "000331111133000", "000319111913000", "000311111113000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000000000", "000777000777000", "000777000777000", "008888000777000", "008888000777000", "000000000888800", "000000000888800"],
            front_walk2: ["000003333300000", "000033333330000", "000331111133000", "000319111913000", "000311111113000", "000011111110000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000000000777000", "000777000777000", "000777000777000", "000777000888800", "000777000888800", "008888000000000", "008888000000000"],
            back_idle: ["000003333300000", "000033333330000", "000333333333000", "000333333333000", "000333333333000", "000033333330000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "000777000777000", "008888000888800", "008888000888800"],
            back_walk1: ["000003333300000", "000033333330000", "000333333333000", "000333333333000", "000333333333000", "000033333330000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000777000000000", "000777000777000", "000777000777000", "008888000777000", "008888000777000", "000000000888800", "000000000888800"],
            back_walk2: ["000003333300000", "000033333330000", "000333333333000", "000333333333000", "000333333333000", "000033333330000", "000022111220000", "000004444400000", "000444444444000", "004445555544400", "044455555554440", "044555555555440", "044555555555440", "000555555555000", "000888888888000", "000666666666000", "000666666666000", "000666000666000", "000000000777000", "000777000777000", "000777000777000", "000777000888800", "000777000888800", "008888000000000", "008888000000000"]
        };
        return frames[state];
    }

    generatePixelSprite(pixelArray) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cols = 15; const rows = 25; const pixelSize = 1.6; 
        canvas.width = cols * pixelSize; canvas.height = rows * pixelSize;
        const colors = { 0: 'transparent', 1: '#ffcd94', a: '#e0a96d', 2: '#c0885c', 3: '#3e2723', c: '#231513', 4: '#3c8b4d', d: '#2b6337', 5: '#2e6b3b', 6: '#275d8a', 7: '#1a405f', 8: '#111111', 9: '#000000' };
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const colorIndex = pixelArray[y][x];
                if (colorIndex !== '0') { ctx.fillStyle = colors[colorIndex] || colors['9']; ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize); }
            }
        }
        return canvas; 
    }

    update(deltaTime, inputManager, gameMap) {
        if (this.health > 0) {
            this.thirst -= deltaTime * 0.666667; 
            if (this.thirst <= 0) { this.thirst = 0; this.takeDamage(deltaTime * 8); }
        }

        if (this.shootCooldown > 0) this.shootCooldown -= deltaTime;
        if (this.actionCooldown > 0) this.actionCooldown -= deltaTime;
        if (this.uiCooldown > 0) this.uiCooldown -= deltaTime;
        if (this.isSwinging > 0) this.isSwinging -= deltaTime;
        if (this.invulnerableTimer > 0) this.invulnerableTimer -= deltaTime;
        if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= deltaTime;

        if (this.waterBuffTimer > 0) { this.waterBuffTimer -= deltaTime; }

        if (this.healingTimer > 0) {
            this.healingTimer -= deltaTime;
            if (this.healingTimer <= 0) { this.health = Math.min(this.maxHealth, this.health + this.healAmount); this.healingTimer = 0; }
        }

        if (this.drinkingTimer > 0) {
            this.drinkingTimer -= deltaTime;
            if (this.drinkingTimer <= 0) { this.thirst = Math.min(this.maxThirst, this.thirst + this.drinkAmount); this.drinkingTimer = 0; this.waterBuffTimer = 15.0; }
        }

        if (this.isReloading) {
            this.reloadTimer -= deltaTime;
            if (this.reloadTimer <= 0) { this.isReloading = false; this.completeReload(); }
        }

        if (this.health <= 0) return;

        let rawDx = 0; let rawDy = 0;
        if (inputManager.joystick && (inputManager.joystick.dx !== 0 || inputManager.joystick.dy !== 0)) {
            rawDx = inputManager.joystick.dx; rawDy = inputManager.joystick.dy;
        } else {
            if (inputManager.isPressed('ArrowUp') || inputManager.isPressed('w')) rawDy -= 1;
            if (inputManager.isPressed('ArrowDown') || inputManager.isPressed('s')) rawDy += 1;
            if (inputManager.isPressed('ArrowLeft') || inputManager.isPressed('a')) rawDx -= 1;
            if (inputManager.isPressed('ArrowRight') || inputManager.isPressed('d')) rawDx += 1;
        }

        let moveDx = 0; let moveDy = 0; let isMoving = false;
        let isAttacking = inputManager.isPressed('attack') && this.weapon !== 'none';
        let actualSprinting = false;

        if (rawDx !== 0 || rawDy !== 0) {
            const length = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
            const normX = rawDx / length; const normY = rawDy / length;
            this.facingX = normX; this.facingY = normY;

            let currentSpeed = this.speed;

            if (this.healingTimer > 0 || this.drinkingTimer > 0) {
                currentSpeed = 1.5; 
            } else if (this.isReloading) {
                if (['m4a1', 'scar', 'akm'].includes(this.weapon)) currentSpeed = 2.0; 
                else if (['p90', 'famas'].includes(this.weapon)) currentSpeed = 2.5; 
                else if (['shotgun', 'uzi'].includes(this.weapon)) currentSpeed = 3.0; 
                else if (this.weapon === 'glock') currentSpeed = 3.5; 
            } else if (inputManager.toggles && inputManager.toggles['sprint']) {
                if (this.health >= 50 && this.stamina > 0) { currentSpeed = 8.0; actualSprinting = true; }
            }

            if (this.health < 50) currentSpeed *= 0.5; 
            if (this.stamina <= 0) currentSpeed *= 0.6; 

            moveDx = normX * currentSpeed * deltaTime; moveDy = normY * currentSpeed * deltaTime; isMoving = true;
        } 
        
        if (isMoving || isAttacking) {
            if (actualSprinting && isMoving) { this.stamina -= deltaTime * 0.20; } else { this.stamina -= deltaTime * 0.08; }
            if (this.stamina <= 0) { this.stamina = 0; if (inputManager.toggles && inputManager.toggles['sprint']) inputManager.setSprint(false); }
        } else if (this.health >= 50) {
            let regenRate = 0.2; if (this.waterBuffTimer > 0) regenRate *= 1.5; 
            this.stamina += regenRate * deltaTime; if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
        }

        if (this.eatTimer > 0 || this.healingTimer > 0 || this.drinkingTimer > 0) {
            this.currentState = 'eat'; if(this.eatTimer > 0) this.eatTimer -= deltaTime;
        } else if (this.interactTimer > 0) {
            this.interactTimer -= deltaTime; this.currentState = 'interact';
        } else if (isMoving) {
            if (this.health < 50) {
                this.animTime += deltaTime * 5; this.currentState = Math.floor(this.animTime) % 2 === 0 ? 'limp1' : 'limp2';
            } else {
                this.animTime += deltaTime * (actualSprinting ? 12 : 8); this.currentState = Math.floor(this.animTime) % 2 === 0 ? 'walk1' : 'walk2';
            }
        } else {
            this.animTime = 0; this.currentState = 'idle'; 
        }

        let nextX = this.gridX + moveDx; let nextY = this.gridY + moveDy;
        let checkX = nextX + (moveDx > 0 ? this.hitbox : (moveDx < 0 ? -this.hitbox : 0));
        if (!gameMap.isSolid(checkX, this.gridY)) this.gridX = nextX;
        let checkY = nextY + (moveDy > 0 ? this.hitbox : (moveDy < 0 ? -this.hitbox : 0));
        if (!gameMap.isSolid(this.gridX, checkY)) this.gridY = nextY;
    }
}
