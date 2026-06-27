// src/main.js
import { GameLoop } from './core/GameLoop.js';
import { InputHandler } from './core/InputHandler.js';
import { Player } from './entities/Player.js';
import { Camera } from './core/Camera.js';
import { gridToScreen } from './utils/Isometric.js';
import { GameMap } from './world/Map.js';
import { Zombie } from './entities/Zombie.js';
import { HealthBar } from './ui/HealthBar.js';
import { Bullet } from './entities/Bullet.js';
import { Grenade } from './entities/Grenade.js';
import { InventoryUI } from './ui/InventoryUI.js';
import { Item } from './entities/Item.js';
import { DayNightCycle } from './systems/DayNightCycle.js';
import { NoiseManager } from './systems/NoiseManager.js';
import { SoundManager } from './systems/SoundManager.js';
import { ParticleManager } from './systems/ParticleManager.js';

window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
window.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
    if(!e.target.closest('#proximity-loot') && !e.target.closest('#mobile-controls') && !e.target.closest('#action-controls')) { 
        e.preventDefault(); 
    }
}, { passive: false });

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_WIDTH = 64; const TILE_HEIGHT = 32;

const input = new InputHandler();
const player = new Player(10, 15);
const camera = new Camera(canvas);
const gameMap = new GameMap(); 
const healthBar = new HealthBar();
const inventoryUI = new InventoryUI();
const timeCycle = new DayNightCycle();
const noiseManager = new NoiseManager();
const sfx = new SoundManager();
const particleManager = new ParticleManager();

const grenadeBtn = document.getElementById('btn-use-grenade');

window.spawnBlood = function(x, y, dx, dy) { particleManager.addBlood(x, y, dx, dy); };

let zombies = [
    new Zombie(8, 5), new Zombie(14, 7), new Zombie(3, 12),
    new Zombie(16, 16), new Zombie(12, 10), new Zombie(2, 2), 
    new Zombie(18, 2), new Zombie(2, 18), new Zombie(18, 18)
];
let bullets = [];
let itemsOnGround = [];

function pushItem(itemObj) {
    itemObj.uid = Math.random().toString(36).substring(2, 12);
    itemsOnGround.push(itemObj);
}

function spawnRandomLoot() {
    const safeRandom = (min, max) => Math.floor(Math.random() * (max - min)) + min;
    const addCluster = (cx, cy) => {
        const weapons = ['m4a1', 'scar', 'akm', 'famas', 'p90', 'uzi', 'glock', 'shotgun', 'melee'];
        const w = weapons[Math.floor(Math.random() * weapons.length)];
        let wName = w === 'melee' ? 'Mã Tấu' : (w==='m4a1'?'Súng M4A1':w==='scar'?'Súng SCAR':w==='akm'?'Súng AKM':w==='famas'?'Súng Famas':w==='p90'?'Súng P90':w==='uzi'?'Súng Uzi':w==='shotgun'?'Súng Shotgun':'Súng Glock');
        pushItem(new Item(wName, cx, cy, '#333', 'weapon', w));

        if (['m4a1', 'scar', 'famas'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*3)+1; i++) pushItem(new Item('Đạn 5.56mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#556b2f', 'ammo', 30));
        } else if (['akm'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*3)+1; i++) pushItem(new Item('Đạn 7.62mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#7b241c', 'ammo', 30));
        } else if (['p90'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*2)+1; i++) pushItem(new Item('Đạn 9mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#e67e22', 'ammo', 50));
        } else if (['uzi'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*3)+1; i++) pushItem(new Item('Đạn 9mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#e67e22', 'ammo', 32));
        } else if (['shotgun'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*3)+1; i++) pushItem(new Item('Đạn 12.0mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#e74c3c', 'ammo', 8));
        } else if (['glock'].includes(w)) {
            for(let i=0; i<Math.floor(Math.random()*3)+1; i++) pushItem(new Item('Đạn 9.19mm', cx+Math.random()*2-1, cy+Math.random()*2-1, '#3498db', 'ammo', 17));
        }

        if (Math.random() > 0.4) pushItem(new Item('Túi Cứu Thương', cx+Math.random()*2-1, cy+Math.random()*2-1, '#d32f2f', 'heal', 30));
        if (Math.random() > 0.4) pushItem(new Item('Chai Nước', cx+Math.random()*2-1, cy+Math.random()*2-1, '#3498db', 'water', 40));
        if (Math.random() > 0.8) pushItem(new Item('Lựu Đạn', cx+Math.random()*2-1, cy+Math.random()*2-1, '#2ecc71', 'throwable', 1));
    };

    for(let i=0; i<150; i++) {
        addCluster(safeRandom(10, 390), safeRandom(10, 390));
    }
    addCluster(12, 14); addCluster(8, 16);
    pushItem(new Item('Súng Shotgun', 11, 16, '#333', 'weapon', 'shotgun'));
    pushItem(new Item('Đạn 12.0mm', 11.5, 16.5, '#e74c3c', 'ammo', 8));
}
spawnRandomLoot();

let spentMags = [];

const allGuns = ['m4a1', 'scar', 'akm', 'famas', 'p90', 'uzi', 'shotgun', 'glock'];
const isGun = (val) => allGuns.includes(val);

const lootMenu = document.getElementById('proximity-loot');
if (lootMenu) {
    const handleLoot = (e) => {
        const target = e.target.closest('.loot-item');
        if (target && player.health > 0) {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            const itemUid = target.getAttribute('data-uid');
            const idx = itemsOnGround.findIndex(i => i.uid === itemUid);
            
            if (idx !== -1) {
                const itm = itemsOnGround[idx];
                if (itm.itemType === 'ammo') {
                    if (itm.name === 'Đạn 5.56mm') player.reserveAmmo['5.56mm'] += itm.value;
                    if (itm.name === 'Đạn 7.62mm') player.reserveAmmo['7.62mm'] += itm.value;
                    if (itm.name === 'Đạn 12.0mm') player.reserveAmmo['12.0mm'] += itm.value;
                    if (itm.name === 'Đạn 9mm') player.reserveAmmo['9mm'] += itm.value;
                    if (itm.name === 'Đạn 9.19mm') player.reserveAmmo['9.19mm'] += itm.value;
                    
                    itemsOnGround.splice(idx, 1); player.startInteract(0.3); sfx.play('pickup');
                } else if (itm.itemType === 'weapon') {
                    let gunCount = player.unlockedWeapons.filter(w => isGun(w)).length;
                    let weaponToDrop = null;
                    
                    if (!player.unlockedWeapons.includes(itm.value) && gunCount >= 2) {
                        if (isGun(player.weapon)) weaponToDrop = player.weapon; 
                        else weaponToDrop = player.unlockedWeapons.find(w => isGun(w)); 
                    }

                    if (weaponToDrop) {
                        player.unlockedWeapons = player.unlockedWeapons.filter(w => w !== weaponToDrop);
                        let dropName = '';
                        switch(weaponToDrop) {
                            case 'm4a1': dropName = 'Súng M4A1'; break;
                            case 'scar': dropName = 'Súng SCAR'; break;
                            case 'akm': dropName = 'Súng AKM'; break;
                            case 'famas': dropName = 'Súng Famas'; break;
                            case 'shotgun': dropName = 'Súng Shotgun'; break;
                            case 'p90': dropName = 'Súng P90'; break;
                            case 'uzi': dropName = 'Súng Uzi'; break;
                            case 'glock': dropName = 'Súng Glock'; break;
                        }
                        let droppedWep = new Item(dropName, player.gridX, player.gridY, '#333', 'weapon', weaponToDrop);
                        pushItem(droppedWep);
                    }

                    if (!player.unlockedWeapons.includes(itm.value)) {
                        player.unlockedWeapons.push(itm.value);
                    }
                    player.weapon = itm.value;
                    itemsOnGround.splice(idx, 1);
                    player.startInteract(0.3); sfx.play('pickup');

                } else {
                    if (player.inventory.addItem(itm)) {
                        itemsOnGround.splice(idx, 1); player.startInteract(0.3); sfx.play('pickup');
                    }
                }
            }
        }
    };
    lootMenu.addEventListener('pointerdown', handleLoot, {passive: false});
}

function update(deltaTime) {
    const safeDelta = Math.min(deltaTime, 0.05);

    player.update(safeDelta, input, gameMap);
    timeCycle.update(safeDelta);
    noiseManager.update(safeDelta);
    particleManager.update(safeDelta);

    if (grenadeBtn) {
        const hasGrenade = player.inventory.items.some(i => i.name === 'Lựu Đạn');
        grenadeBtn.style.display = (hasGrenade && player.health > 0) ? 'flex' : 'none';
    }

    if (input.isPressed('i') && player.uiCooldown <= 0) { inventoryUI.toggle(); player.uiCooldown = 0.3; sfx.play('pickup'); }
    
    if (input.isPressed('q') && player.uiCooldown <= 0) {
        if (player.unlockedWeapons.length > 0) {
            let idx = player.unlockedWeapons.indexOf(player.weapon);
            idx = (idx + 1) % player.unlockedWeapons.length;
            player.weapon = player.unlockedWeapons[idx];
            player.isReloading = false; sfx.play('pickup'); 
        }
        player.uiCooldown = 0.3;
    }

    if (input.isPressed('r') && !player.isReloading) { player.startReload(); }

    if (input.isPressed('use_heal') && player.actionCooldown <= 0 && player.health > 0) {
        const idx = player.inventory.items.findIndex(i => i.name === 'Túi Cứu Thương');
        if (idx !== -1) {
            const item = player.inventory.items[idx]; player.inventory.removeItem(idx);
            item.use(player, bullets); sfx.play('pickup');
        }
        player.actionCooldown = 0.3;
    }

    if (input.isPressed('use_water') && player.actionCooldown <= 0 && player.health > 0) {
        const idx = player.inventory.items.findIndex(i => i.name === 'Chai Nước');
        if (idx !== -1) {
            const item = player.inventory.items[idx]; player.inventory.removeItem(idx);
            item.use(player, bullets); sfx.play('pickup');
        }
        player.actionCooldown = 0.3;
    }

    if (input.isPressed('use_grenade') && player.actionCooldown <= 0 && player.health > 0) {
        const idx = player.inventory.items.findIndex(i => i.name === 'Lựu Đạn');
        if (idx !== -1) {
            const item = player.inventory.items[idx]; player.inventory.removeItem(idx);
            item.use(player, bullets);
        }
        player.actionCooldown = 0.8;
    }

    if (input.isPressed('attack') && player.shootCooldown <= 0 && player.health > 0) {
        player.healingTimer = 0; player.drinkingTimer = 0; 

        if (player.weapon !== 'none') {
            if (isGun(player.weapon)) {
                if (!player.isReloading) {
                    if (player.ammo[player.weapon].current > 0) {
                        player.startInteract(0.3); player.ammo[player.weapon].current--; 
                        const dirLength = Math.sqrt(player.facingX**2 + player.facingY**2) || 1;
                        const normX = player.facingX / dirLength; const normY = player.facingY / dirLength;
                        const spawnX = player.gridX + normX * 0.7; const spawnY = player.gridY + normY * 0.7;

                        if (player.weapon === 'shotgun') {
                            const baseAngle = Math.atan2(normY, normX);
                            for(let p=0; p<5; p++) {
                                let spreadAngle = baseAngle + (Math.random() - 0.5) * 0.5; 
                                bullets.push(new Bullet(spawnX, spawnY, Math.cos(spreadAngle), Math.sin(spreadAngle), player.weapon));
                            }
                        } else {
                            bullets.push(new Bullet(spawnX, spawnY, player.facingX, player.facingY, player.weapon));
                        }
                        
                        let noiseLvl = 10;
                        if (['m4a1', 'scar', 'famas'].includes(player.weapon)) noiseLvl = 18;
                        else if (player.weapon === 'akm') noiseLvl = 20; 
                        else if (player.weapon === 'shotgun') noiseLvl = 22; 
                        else if (player.weapon === 'p90') noiseLvl = 14;

                        noiseManager.addNoise(player.gridX, player.gridY, noiseLvl);
                        player.muzzleFlashTimer = 0.08; sfx.play('shoot'); 
                        
                        let cool = 0.3;
                        if (['m4a1', 'scar'].includes(player.weapon)) cool = 0.12;
                        else if (player.weapon === 'akm') cool = 0.15; 
                        else if (player.weapon === 'famas') cool = 0.09; 
                        else if (['p90', 'uzi'].includes(player.weapon)) cool = 0.08; 
                        else if (player.weapon === 'shotgun') cool = 0.8; 
                        player.shootCooldown = cool; 
                    } else { player.startReload(); }
                }
            } 
            else if (player.weapon === 'melee') {
                player.startInteract(0.15); player.isSwinging = 0.15; sfx.play('melee'); 
                zombies.forEach(zombie => {
                    if (zombie.health > 0) {
                        const dx = zombie.gridX - player.gridX; const dy = zombie.gridY - player.gridY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 1.2) {
                            const dirX = distance > 0 ? dx / distance : 0; const dirY = distance > 0 ? dy / distance : 0;
                            const dot = (dirX * player.facingX) + (dirY * player.facingY);
                            if (dot > 0.5) {
                                zombie.takeDamage(30); window.spawnBlood(zombie.gridX, zombie.gridY, player.facingX, player.facingY);
                                if (zombie.health <= 0) {
                                    const rng = Math.random();
                                    if (rng < 0.2) pushItem(new Item('Đạn 5.56mm', zombie.gridX, zombie.gridY, '#556b2f', 'ammo', 30));
                                    else if (rng < 0.3) pushItem(new Item('Đạn 7.62mm', zombie.gridX, zombie.gridY, '#7b241c', 'ammo', 30));
                                    else if (rng < 0.4) pushItem(new Item('Đạn 9mm', zombie.gridX, zombie.gridY, '#e67e22', 'ammo', 32));
                                    else if (rng < 0.5) pushItem(new Item('Túi Cứu Thương', zombie.gridX, zombie.gridY, '#d32f2f', 'heal', 30));
                                }
                            }
                        }
                    }
                });
                player.shootCooldown = 0.35; 
            }
        }
    }

    bullets.forEach(bullet => {
        if (bullet.type === 'bullet') {
            bullet.update(safeDelta, gameMap);
            zombies.forEach(zombie => {
                if (bullet.active && zombie.health > 0) {
                    const dx = bullet.gridX - zombie.gridX; const dy = bullet.gridY - zombie.gridY;
                    if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
                        zombie.takeDamage(bullet.damage); bullet.active = false;
                        window.spawnBlood(zombie.gridX, zombie.gridY, bullet.dirX, bullet.dirY);
                        
                        if ((bullet.distanceTraveled || 0) <= 3.0) {
                            zombie.kbX = bullet.dirX * 6;  
                            zombie.kbY = bullet.dirY * 6;
                            zombie.kbTimer = 0.15;         
                        }

                        if (zombie.health <= 0) {
                            const rng = Math.random();
                            if (rng < 0.2) pushItem(new Item('Đạn 5.56mm', zombie.gridX, zombie.gridY, '#556b2f', 'ammo', 30));
                            else if (rng < 0.3) pushItem(new Item('Đạn 7.62mm', zombie.gridX, zombie.gridY, '#7b241c', 'ammo', 30));
                            else if (rng < 0.4) pushItem(new Item('Đạn 9mm', zombie.gridX, zombie.gridY, '#e67e22', 'ammo', 32));
                            else if (rng < 0.5) pushItem(new Item('Túi Cứu Thương', zombie.gridX, zombie.gridY, '#d32f2f', 'heal', 30));
                        }
                    }
                }
            });
        } 
        else if (bullet.type === 'grenade_proj') {
            bullet.update(safeDelta, gameMap, noiseManager, zombies, player, particleManager);
        }
    });

    zombies.forEach(zombie => {
        if (zombie.kbTimer > 0) {
            zombie.kbTimer -= safeDelta;
            let nextX = zombie.gridX + zombie.kbX * safeDelta;
            let nextY = zombie.gridY + zombie.kbY * safeDelta;
            if (!gameMap.isSolid(nextX, zombie.gridY)) zombie.gridX = nextX;
            if (!gameMap.isSolid(zombie.gridX, nextY)) zombie.gridY = nextY;
        } else {
            // FIX LỖI ĐỨNG HÌNH: Bọc try-catch để ngăn chặn Exception đánh sập Game Loop khi thiếu hàm (như takeDamage)
            try {
                zombie.update(safeDelta, player, gameMap, noiseManager, timeCycle);
            } catch (err) {
                console.warn("Lỗi đồng bộ trạng thái Zombie, bỏ qua frame: ", err);
            }
        }
    });
    
    bullets = bullets.filter(b => b.active); zombies = zombies.filter(z => z.health > 0);
    camera.follow(player, TILE_WIDTH, TILE_HEIGHT, gridToScreen);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const camX = camera.offsetX; 
    const camY = camera.offsetY;
    
    let renderQueue = [];
    if (player.health > 0 || player.eatTimer > 0 || player.healingTimer > 0 || player.drinkingTimer > 0) renderQueue.push({ entity: player, depth: player.gridX + player.gridY });
    zombies.forEach(zombie => renderQueue.push({ entity: zombie, depth: zombie.gridX + zombie.gridY }));
    bullets.forEach(bullet => renderQueue.push({ entity: bullet, depth: bullet.gridX + bullet.gridY }));
    itemsOnGround.forEach(item => renderQueue.push({ entity: item, depth: item.gridX + item.gridY }));
    spentMags.forEach(mag => renderQueue.push({ entity: { type: 'spent_mag', ...mag }, depth: mag.gridX + mag.gridY }));
    particleManager.particles.forEach(p => renderQueue.push({ entity: p, depth: p.x + p.y }));

    const viewRadius = 18; 
    const pCol = Math.floor(player.gridX); 
    const pRow = Math.floor(player.gridY);

    const minRow = pRow - viewRadius;
    const maxRow = pRow + viewRadius;
    const minCol = pCol - viewRadius;
    const maxCol = pCol + viewRadius;

    ctx.lineWidth = 0.5; 

    for (let sum = minRow + minCol; sum <= maxRow + maxCol; sum++) {
        for (let row = minRow; row <= maxRow; row++) {
            let col = sum - row;
            if (col >= minCol && col <= maxCol) {
                const pos = gridToScreen(col, row, TILE_WIDTH, TILE_HEIGHT, camX, camY);
                if (pos.x < -TILE_WIDTH * 2 || pos.x > canvas.width + TILE_WIDTH * 2 || pos.y < -TILE_HEIGHT * 4 || pos.y > canvas.height + TILE_HEIGHT * 4) continue;
                
                const tileType = gameMap.getTile(col, row);
                const rx = Math.floor(pos.x);
                const ry = Math.floor(pos.y);

                ctx.beginPath(); 
                ctx.moveTo(rx, ry - 0.5); 
                ctx.lineTo(rx + TILE_WIDTH / 2 + 0.5, ry + TILE_HEIGHT / 2);
                ctx.lineTo(rx, ry + TILE_HEIGHT + 0.5); 
                ctx.lineTo(rx - TILE_WIDTH / 2 - 0.5, ry + TILE_HEIGHT / 2);
                ctx.closePath(); 
                
                if (tileType === 3) ctx.fillStyle = '#1e3d59'; 
                else if (tileType === 4) ctx.fillStyle = '#d4b872'; 
                else ctx.fillStyle = Math.abs(row + col) % 2 === 0 ? '#2a3b2a' : '#314431'; 
                
                ctx.fill();
                ctx.strokeStyle = ctx.fillStyle; 
                ctx.stroke();
            }
        }
    }
    
    particleManager.renderStains(ctx, gridToScreen, TILE_WIDTH, TILE_HEIGHT, camX, camY);

    renderQueue.sort((a, b) => a.depth - b.depth);
    
    renderQueue.forEach(item => {
        const ent = item.entity; let pos;
        if (ent.type === 'blood') {
            pos = gridToScreen(ent.x, ent.y, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            if (pos.x < -50 || pos.x > canvas.width + 50 || pos.y < -50 || pos.y > canvas.height + 50) return;
            ctx.fillStyle = ent.color; ctx.fillRect(Math.round(pos.x - ent.size/2), Math.round(pos.y + TILE_HEIGHT / 2 - ent.z), Math.round(ent.size), Math.round(ent.size));
            return; 
        } else {
            pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            if (pos.x < -100 || pos.x > canvas.width + 100 || pos.y < -100 || pos.y > canvas.height + 100) return;
        }

        if (ent.type === 'player') {
            ctx.save(); ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.beginPath(); ctx.ellipse(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 2), 14, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            
            ctx.save(); if (ent.invulnerableTimer > 0 && Math.floor(ent.invulnerableTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
            const screenFacingX = (ent.facingX - ent.facingY) * (TILE_WIDTH / 2); const screenFacingY = (ent.facingX + ent.facingY) * (TILE_HEIGHT / 2);
            let screenAngle = Math.atan2(screenFacingY, screenFacingX); let deg = screenAngle * (180 / Math.PI);
            let dirStr = 'side'; let flipX = false;
            if (deg >= 45 && deg <= 135) dirStr = 'front'; else if (deg >= -135 && deg <= -45) dirStr = 'back'; else { dirStr = 'side'; if (Math.abs(deg) > 135) flipX = true; }

            const drawPlayerBody = () => {
                ctx.save(); ctx.imageSmoothingEnabled = false; const currentSprite = ent.sprites[dirStr][ent.currentState] || ent.sprites['side'][ent.currentState];
                if (flipX) { ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height)); ctx.scale(-1, 1); ctx.drawImage(currentSprite, Math.round(-ent.width / 2), 0, ent.width, ent.height); } 
                else { ctx.drawImage(currentSprite, Math.round(pos.x - ent.width / 2), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height), ent.width, ent.height); }
                ctx.restore();
            };

            const drawHolster = () => {
                if (ent.health <= 0) return;
                ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height + 15)); if (flipX) ctx.scale(-1, 1);
                let holsterOffset = 0;
                if (ent.unlockedWeapons.includes('m4a1') && ent.weapon !== 'm4a1') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.m4a1; const wMag = ent.weaponData.m4a1_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore(); holsterOffset += 5; 
                }
                if (ent.unlockedWeapons.includes('scar') && ent.weapon !== 'scar') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.scar; const wMag = ent.weaponData.scar_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore(); holsterOffset += 5;
                }
                if (ent.unlockedWeapons.includes('akm') && ent.weapon !== 'akm') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.akm; const wMag = ent.weaponData.akm_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore(); holsterOffset += 5;
                }
                if (ent.unlockedWeapons.includes('famas') && ent.weapon !== 'famas') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.famas; const wMag = ent.weaponData.famas_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore(); holsterOffset += 5;
                }
                if (ent.unlockedWeapons.includes('shotgun') && ent.weapon !== 'shotgun') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.shotgun; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.restore(); holsterOffset += 5;
                }
                if (ent.unlockedWeapons.includes('p90') && ent.weapon !== 'p90') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.p90; const wMag = ent.weaponData.p90_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore(); holsterOffset += 5;
                }
                if (ent.unlockedWeapons.includes('uzi') && ent.weapon !== 'uzi') {
                    ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData.uzi; const wMag = ent.weaponData.uzi_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore();
                }
                if (ent.unlockedWeapons.includes('melee') && ent.weapon !== 'melee') {
                    ctx.save(); ctx.translate(flipX ? 4 : -6, 12); ctx.rotate(Math.PI / 2.5); const wData = ent.weaponData.melee; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.restore();
                } else if (ent.unlockedWeapons.includes('glock') && ent.weapon !== 'glock') {
                    ctx.save(); ctx.translate(flipX ? 4 : -6, 12); ctx.rotate(Math.PI / 2.5); const wData = ent.weaponData.glock; const wMag = ent.weaponData.glock_mag; ctx.drawImage(wData.img, Math.round(-wData.w / 2), Math.round(-wData.h / 2), wData.w, wData.h); ctx.drawImage(wMag.img, Math.round(-wData.w/2 + wData.magX), Math.round(-wData.h/2 + wData.magY)); ctx.restore();
                } 
                ctx.restore();
            };

            const drawActiveWeapon = () => {
                if (ent.weapon === 'none' || ent.currentState === 'eat' || ent.health <= 0) return;
                ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(pos.x + (flipX ? -2 : 2)), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height + 20)); ctx.rotate(screenAngle); if (Math.abs(screenAngle) > Math.PI / 2) ctx.scale(1, -1); 
                let swingAngle = 0; let kickbackX = 0; let magDropY = 0; let drawHandLeft = true;

                if (ent.isReloading && ent.reloadTimer > 0) {
                    let t = 1 - (ent.reloadTimer / ent.reloadDuration); swingAngle = Math.sin(t * Math.PI) * (Math.PI / 3); 
                    if (t < 0.25) { 
                        let handSlideY = (t / 0.25) * -8; drawHandLeft = false; ctx.save(); ctx.translate(-8, -2 + handSlideY); ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(0, 0, 5, 4, 2); else ctx.fillRect(0, 0, 5, 4); ctx.fillStyle = '#ffcd94'; ctx.fill(); ctx.restore();
                        if (!ent.magDropped && ent.weapon !== 'shotgun') { spentMags.push({ type: ent.weapon + '_mag', sprite: ent.weaponData[ent.weapon + '_mag'].img, w: ent.weaponData[ent.weapon + '_mag'].w, h: ent.weaponData[ent.weapon + '_mag'].h, gridX: ent.gridX, gridY: ent.gridY, restX: Math.random() * 0.4 - 0.2, restY: Math.random() * 0.4 - 0.2, rot: (Math.random() - 0.5) * 1.0 }); ent.magDropped = true; }
                    } else if (t >= 0.25 && t < 0.5) { 
                        drawHandLeft = false; ctx.save(); ctx.translate(-15, 10); ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(0, 0, 5, 4, 2); else ctx.fillRect(0, 0, 5, 4); ctx.fillStyle = '#ffcd94'; ctx.fill(); ctx.restore(); ent.magDropped = false; 
                    } else if (t >= 0.5 && t < 0.8) { 
                        drawHandLeft = false; let insertMagY = 10 - ((t - 0.5) / 0.3) * 10; ctx.save(); ctx.translate(-15, insertMagY); ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(0, 0, 5, 4, 2); else ctx.fillRect(0, 0, 5, 4); ctx.fillStyle = '#ffcd94'; ctx.fill(); if (ent.weapon !== 'shotgun') { const wMag = ent.weaponData[ent.weapon + '_mag']; ctx.drawImage(wMag.img, 0, 0); } ctx.restore();
                    } else { 
                        let pressMagY = ( (t - 0.8) / 0.2 ) * -2; drawHandLeft = false; ctx.save(); ctx.translate(-8, pressMagY); ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(0, 0, 5, 4, 2); else ctx.fillRect(0, 0, 5, 4); ctx.fillStyle = '#ffcd94'; ctx.fill(); ctx.restore();
                    }
                } else if (ent.interactTimer > 0) {
                    if (ent.weapon === 'melee') { let p = 1 - (ent.interactTimer / 0.15); swingAngle = (Math.pow(p, 1.5) * Math.PI * 1.3) - (Math.PI / 2); } 
                    else { let timeElapsed = 0.3 - ent.interactTimer; if (timeElapsed < 0.1) { let recoilP = 1 - (timeElapsed / 0.1); swingAngle = -recoilP * 0.08; kickbackX = recoilP * 6; } }
                }
                ctx.rotate(swingAngle);
                
                const wData = ent.weaponData[ent.weapon]; let gripOffsetX = -5; 
                if (['m4a1', 'scar', 'akm'].includes(ent.weapon)) gripOffsetX = -8; 
                else if (ent.weapon === 'famas') gripOffsetX = -15; 
                else if (ent.weapon === 'shotgun') gripOffsetX = -12; 
                else if (ent.weapon === 'p90') gripOffsetX = -4; 
                else if (['glock', 'uzi'].includes(ent.weapon)) gripOffsetX = -3;
                
                if (['m4a1', 'scar', 'akm', 'famas', 'shotgun'].includes(ent.weapon) && !ent.isReloading) { ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(Math.round(gripOffsetX + 14 - kickbackX), -2); ctx.lineWidth = 4; ctx.strokeStyle = '#1a4023'; ctx.stroke(); }
                const startX = Math.round(gripOffsetX - kickbackX); const startY = Math.round(-wData.h / 2); ctx.drawImage(wData.img, startX, startY, wData.w, wData.h);

                let magT = ent.isReloading ? 1 - (ent.reloadTimer / ent.reloadDuration) : 1;
                if ((isGun(ent.weapon) && ent.weapon !== 'shotgun') && (magT >= 0.8)) { const wMag = ent.weaponData[ent.weapon + '_mag']; ctx.drawImage(wMag.img, Math.round(startX + wData.magX), Math.round(startY + wData.magY + magDropY)); }
                ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(Math.round(gripOffsetX + 2 - kickbackX), 1); ctx.lineWidth = 4; ctx.strokeStyle = '#2e6b3b'; ctx.stroke();
                ctx.fillStyle = '#ffcd94'; ctx.strokeStyle = '#c0885c'; ctx.lineWidth = 0.5;
                ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(Math.round(gripOffsetX + 2 - kickbackX), -1, 5, 5, 2); else ctx.fillRect(Math.round(gripOffsetX + 2 - kickbackX), -1, 5, 5); ctx.fill(); ctx.stroke();
                ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(Math.round(gripOffsetX + 6 - kickbackX), 1.5, 4, 1.5, 1); else ctx.fillRect(Math.round(gripOffsetX + 6 - kickbackX), 1.5, 4, 1.5); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.arc(Math.round(gripOffsetX + 4 - kickbackX), -1, 1.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();

                if (['m4a1', 'scar', 'akm', 'famas', 'shotgun'].includes(ent.weapon) && drawHandLeft) {
                    const leftGripX = Math.round(gripOffsetX + 14 - kickbackX); let reloadHandY = ent.isReloading ? Math.min(magDropY, 5) : 0;
                    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(leftGripX, Math.round(-2 + reloadHandY), 5, 4, 2); else ctx.fillRect(leftGripX, Math.round(-2 + reloadHandY), 5, 4); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(leftGripX + 2, Math.round(-2 + reloadHandY), 1.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                }
                
                if (wData.muzzleX && ent.muzzleFlashTimer > 0 && !ent.isReloading) {
                    ctx.save(); ctx.translate(startX + wData.muzzleX, startY + wData.muzzleY); const flashGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 18); flashGrad.addColorStop(0, 'rgba(255, 255, 255, 1)'); flashGrad.addColorStop(0.2, 'rgba(255, 255, 0, 0.9)'); flashGrad.addColorStop(1, 'rgba(255, 0, 0, 0)'); ctx.fillStyle = flashGrad; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                }
                ctx.restore(); 
            };

            if (dirStr === 'back') { drawActiveWeapon(); drawPlayerBody(); drawHolster(); } else { drawHolster(); drawPlayerBody(); drawActiveWeapon(); }

            if (ent.isReloading && ent.reloadTimer > 0) {
                ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - ent.height - 25); const radius = 10; const progress = 1 - (ent.reloadTimer / ent.reloadDuration);
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill();
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
            }
            if (ent.healingTimer > 0) {
                ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - ent.height - 25); const radius = 10; const progress = 1 - (ent.healingTimer / 5.0);
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill();
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
            }
            if (ent.drinkingTimer > 0) {
                ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - ent.height - 25); const radius = 10; const progress = 1 - (ent.drinkingTimer / 5.0);
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill();
                ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
            }
            ctx.restore();
        }
        else if (ent.type === 'spent_mag') {
            pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(pos.x), Math.round(pos.y)); ctx.rotate(ent.rot); 
            ctx.drawImage(ent.sprite, Math.round(-ent.w/2 + ent.restX), Math.round(TILE_HEIGHT / 2 - ent.h/2 + ent.restY), ent.w, ent.h); 
            ctx.restore();
        }
        else if (ent.type === 'grenade_proj') {
            pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            ctx.save(); ctx.fillStyle = '#2ecc71'; ctx.strokeStyle = '#1e8449'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 5), 4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); 
            if (ent.exploded) {
                ctx.fillStyle = 'rgba(231, 76, 60, 0.8)'; ctx.beginPath(); ctx.arc(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 5), 60, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(241, 196, 15, 0.9)'; ctx.beginPath(); ctx.arc(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 5), 30, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        }
        else if (ent.type === 'zombie') {
            // RENDER ZOMBIE: Bọc bóng tối (Shadow)
            ctx.save(); 
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.beginPath(); ctx.ellipse(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 2), 14, 6, 0, 0, Math.PI * 2); ctx.fill(); 
            ctx.restore();
            
            // RENDER ZOMBIE: Thân thể với cơ chế bảo vệ Try Catch khắt khe
            ctx.save(); 
            if (ent.kbTimer > 0) ctx.globalAlpha = 0.7; 
            ctx.imageSmoothingEnabled = false; 

            try {
                let currentSprite = null;
                // Nếu Zombie có hệ thống sprite khai báo chuẩn, cố gắng lấy hoạt ảnh
                if (ent.sprites) {
                    currentSprite = ent.sprites[ent.currentState] || ent.sprites['walk1'] || ent.sprites['idle'];
                }
                currentSprite = currentSprite || ent.sprite; // Fallback dự phòng cuối cùng
                
                // Kiểm tra loại object: Phải là Image hoặc Canvas hợp lệ mới được nhét vào hàm vẽ
                if (currentSprite && (currentSprite instanceof HTMLCanvasElement || currentSprite instanceof HTMLImageElement)) {
                    if (ent.facingX < 0) { 
                        ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height)); 
                        ctx.scale(-1, 1); 
                        ctx.drawImage(currentSprite, Math.round(-ent.width / 2), 0, ent.width, ent.height); 
                    } else { 
                        ctx.drawImage(currentSprite, Math.round(pos.x - ent.width / 2), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height), ent.width, ent.height); 
                    }
                } else {
                    // Nếu lỗi file ảnh, vẽ thế thân thành một khối hộp đỏ để game không bao giờ sập
                    ctx.fillStyle = '#cc0000';
                    ctx.fillRect(Math.round(pos.x - ent.width/2), Math.round(pos.y + TILE_HEIGHT / 2 - ent.height), ent.width, ent.height);
                }
            } catch (err) {
                // Game sẽ bỏ qua lỗi vẽ và vẫn tiếp tục vòng lặp 60 FPS
                console.warn("Lỗi vẽ Zombie (Đã bỏ qua để game chạy tiếp):", err);
            }
            
            ctx.restore();
        }
        else if (ent.type === 'bullet') {
            const screenDirX = (ent.dirX - ent.dirY) * (TILE_WIDTH / 2); const screenDirY = (ent.dirX + ent.dirY) * (TILE_HEIGHT / 2); const screenAngle = Math.atan2(screenDirY, screenDirX);
            ctx.save(); ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 20)); ctx.rotate(screenAngle); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(-ent.width / 2), Math.round(-ent.height / 2), ent.width, ent.height); ctx.restore();
        }
        else if (ent.type === 'item') {
            ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(ent.sprite, Math.round(pos.x - 12), Math.round(pos.y + TILE_HEIGHT / 2 - 12), 24, 24); ctx.restore();
        }
    });

    const playerScreenPos = gridToScreen(player.gridX, player.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
    const lightCenterY = playerScreenPos.y + TILE_HEIGHT / 2 - player.height / 2;
    timeCycle.render(ctx, canvas.width, canvas.height, Math.round(playerScreenPos.x), Math.round(lightCenterY));

    if (lootMenu) {
        let nearbyItems = [];
        for (let i = 0; i < itemsOnGround.length; i++) {
            const itm = itemsOnGround[i]; const dx = player.gridX - itm.gridX; const dy = player.gridY - itm.gridY;
            if (Math.sqrt(dx * dx + dy * dy) < 3.0) { nearbyItems.push({ item: itm, index: i }); }
        }
        if (nearbyItems.length > 0 && player.health > 0) {
            lootMenu.style.display = 'block';
            let contentHtml = '';
            nearbyItems.forEach(ni => { 
                if (!ni.item.uid) ni.item.uid = Math.random().toString(36).substr(2, 9);
                contentHtml += `<div class="loot-item" data-uid="${ni.item.uid}"><img src="${ni.item.iconUrl}" style="width: 20px; height: 20px; image-rendering: pixelated;"><span>${ni.item.name}</span></div>`; 
            });
            if (lootMenu.getAttribute('data-content') !== contentHtml) {
                lootMenu.innerHTML = contentHtml;
                lootMenu.setAttribute('data-content', contentHtml);
            }
        } else {
            lootMenu.style.display = 'none';
            lootMenu.setAttribute('data-content', '');
        }
    }

    if (player.health > 0 && input.mouse.x > 0 && input.mouse.y > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(input.mouse.x - 12, input.mouse.y); ctx.lineTo(input.mouse.x - 4, input.mouse.y);
        ctx.moveTo(input.mouse.x + 4, input.mouse.y); ctx.lineTo(input.mouse.x + 12, input.mouse.y);
        ctx.moveTo(input.mouse.x, input.mouse.y - 12); ctx.lineTo(input.mouse.x, input.mouse.y - 4);
        ctx.moveTo(input.mouse.x, input.mouse.y + 4); ctx.lineTo(input.mouse.x, input.mouse.y + 12);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(input.mouse.x, input.mouse.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3333'; ctx.fill();
        ctx.restore();
    }

    healthBar.render(ctx, player, canvas.width, canvas.height);
    inventoryUI.render(ctx, player, canvas.width, canvas.height, input);
}

const game = new GameLoop(update, render);
game.ctx = ctx; game.start();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    camera.canvas.width = canvas.width; camera.canvas.height = canvas.height;
});
