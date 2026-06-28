// src/main.js
import { GameLoop } from './core/GameLoop.js';
import { InputHandler } from './core/InputHandler.js';
import { Player } from './entities/Player.js';
import { Bot } from './entities/Bot.js'; 
import { Camera } from './core/Camera.js';
import { gridToScreen } from './utils/Isometric.js';
import { GameMap } from './world/Map.js';
import { HealthBar } from './ui/HealthBar.js';
import { Bullet } from './entities/Bullet.js';
import { Grenade } from './entities/Grenade.js';
import { InventoryUI } from './ui/InventoryUI.js';
import { DayNightCycle } from './systems/DayNightCycle.js';
import { NoiseManager } from './systems/NoiseManager.js';
import { SoundManager } from './systems/SoundManager.js';
import { ParticleManager } from './systems/ParticleManager.js';
import { Prop } from './entities/Prop.js';

import { setupDOM } from './ui/DOMManager.js';
import { spawnRandomLoot } from './systems/LootSpawner.js';
import { explosionFrames, expColors, renderSpriteShadow, renderEntityShadow } from './utils/RenderHelpers.js';
import { TILE_WIDTH, TILE_HEIGHT, isGun, createGlobalNoisePattern } from './utils/Constants.js';
import { setupProximityLoot } from './ui/ProximityLoot.js';
import { renderCharacter } from './utils/CharacterRenderer.js';
import { generateCharacterSprites } from './utils/SpriteGenerator.js';

import { updateEnvironment } from './systems/EnvironmentManager.js';
import { updateProjectiles } from './systems/CombatManager.js';
import { renderMap } from './world/MapRenderer.js';
import { DropManager } from './systems/DropSystem.js';

let gameState = 'lobby'; 

window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
window.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
    if(!e.target.closest('#proximity-loot') && !e.target.closest('#mobile-controls') && !e.target.closest('#action-controls')) e.preventDefault(); 
}, { passive: false });

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.filter = "contrast(1.4) saturate(1.5) brightness(1.15)";

const input = new InputHandler();
const camera = new Camera(canvas);
const gameMap = new GameMap(); 
const healthBar = new HealthBar();
const inventoryUI = new InventoryUI();
const timeCycle = new DayNightCycle();
const noiseManager = new NoiseManager();
const sfx = new SoundManager();
const particleManager = new ParticleManager();

const dropManager = new DropManager();

let gameTime = 0; 
let killFeed = []; 
let gibs = []; 
let corpses = []; 
let bullets = []; 
let spentMags = [];
let bots = [];
let props = [];
let itemsOnGround = [];
let flocks = [];
let player = new Player(10, 15);

const { lobbyDiv, matchEndDiv } = setupDOM({
    onStartClick: () => { 
        lobbyDiv.style.display = 'none'; 
        matchEndDiv.style.display = 'none'; 
        initOrResetMatch(); 
        gameState = 'dropping'; 
        dropManager.startFlight();
        const ac = document.getElementById('action-controls'); 
        if (ac) ac.style.display = 'none';
        sfx.play('pickup'); 
    },
    onReturnClick: () => { 
        initOrResetMatch(); 
        matchEndDiv.style.display = 'none'; 
        lobbyDiv.style.display = 'flex'; 
        gameState = 'lobby'; 
        sfx.play('pickup'); 
    },
    getPlayer: () => player, 
    getSfx: () => sfx
});

function addKillFeed(killer, victim) {
    killFeed.push({ text: `${killer} tiêu diệt ${victim}`, timer: 4.0 });
    if (killFeed.length > 5) killFeed.shift();
}

const renderLootMenu = setupProximityLoot(() => ({ player, itemsOnGround }), (itm) => pushItem(itm), sfx);

window.addEventListener('mousedown', (e) => { if (e.button === 2) { player.isAiming = !player.isAiming; sfx.play('pickup'); } });
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'z') { if ((!player.kbTimer || player.kbTimer <= 0) && player.health > 0) { player.isProne = !player.isProne; sfx.play('pickup'); } } });

window.spawnBlood = function(x, y, dx, dy) { particleManager.addBlood(x, y, dx, dy); };
window.spawnGibs = function(x, y) {
    const fleshColors = ['#7b241c', '#922b21', '#641e16', '#212f3d']; 
    for(let i=0; i<12; i++) { 
        gibs.push({ x: x, y: y, z: Math.random() * 10 + 5, vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16, vz: Math.random() * 15 + 10, rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 1.5, color: fleshColors[Math.floor(Math.random() * fleshColors.length)], size: Math.random() * 5 + 3 }); 
    }
};

const originalIsSolid = gameMap.isSolid.bind(gameMap);
gameMap.isSolid = function(x, y) {
    if (originalIsSolid(x, y)) return true; 
    for(let p of props) { if (p.propType === 'bush') continue; if (Math.sqrt(Math.pow(x - p.gridX, 2) + Math.pow(y - p.gridY, 2)) <= p.radius) return true; }
    if (x < 1 || x > 199 || y < 1 || y > 199) return true;
    return false;
};

function pushItem(itemObj) { itemObj.uid = Math.random().toString(36).substring(2, 12); itemsOnGround.push(itemObj); }

function initOrResetMatch() {
    gameTime = 0; 
    bullets = []; spentMags = []; gibs = []; corpses = []; killFeed = []; itemsOnGround = []; props = []; flocks = []; bots = [];
    
    player = new Player(10, 15); 
    player.id = 'player'; player.name = 'Bạn'; player.isProne = false; player.explodedToPieces = false; player.kills = 0;
    
    player.width = 48; player.height = 48; 
    player.sprites = generateCharacterSprites('#2980b9', '#3498db', '#2c3e50', '#34495e');

    const propTypes = ['tree_large', 'tree_large', 'tree_large', 'bush', 'bush', 'bush', 'rock_large'];
    for(let i=0; i < 1500; i++) { 
        let rx = Math.floor(Math.random() * 190) + 5; let ry = Math.floor(Math.random() * 190) + 5; 
        if (Math.abs(rx - 10) > 4 || Math.abs(ry - 15) > 4) props.push(new Prop(propTypes[Math.floor(Math.random() * propTypes.length)], rx + 0.5, ry + 0.5)); 
    }

    spawnRandomLoot(props, gameMap, pushItem);

    const botColors = [ 
        { d: '#c0392b', l: '#e74c3c' }, { d: '#1e8449', l: '#2ecc71' }, { d: '#d35400', l: '#e67e22' }, 
        { d: '#8e44ad', l: '#9b59b6' }, { d: '#7f8c8d', l: '#95a5a6' }, { d: '#b9770e', l: '#f1c40f' }, 
        { d: '#111111', l: '#333333' } 
    ];

    for (let i = 1; i <= 29; i++) {
        let bx = 0, by = 0; 
        let bot = new Bot(`bot_${i}`, `Người chơi ${i}`, bx, by, player.weaponData); 
        
        bot.width = 48; bot.height = 48;
        bot.dropState = 'in_plane';
        bot.altitude = 250; 
        bot.jumpTarget = Math.random() * 0.8 + 0.1; 
        
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 6.0;
        bot.steerX = Math.cos(angle) * speed; 
        bot.steerY = Math.sin(angle) * speed;

        const shirt = botColors[Math.floor(Math.random() * botColors.length)]; 
        const pants = botColors[Math.floor(Math.random() * botColors.length)];
        bot.sprites = generateCharacterSprites(shirt.d, shirt.l, pants.d, pants.l);
        bots.push(bot);
    }

    for (let i = 0; i < 8; i++) { 
        let flock = { id: i, birds: [], targetProp: null, state: 'flying', timer: Math.random() * 5, targetX: Math.random() * 190 + 5, targetY: Math.random() * 190 + 5 }; 
        let numBirds = Math.floor(Math.random() * 5) + 2; const birdColors = ['#e74c3c', '#3498db', '#f1c40f', '#34495e', '#e67e22', '#8d6e63']; let flockColor = birdColors[Math.floor(Math.random() * birdColors.length)]; 
        for (let j = 0; j < numBirds; j++) { flock.birds.push({ x: flock.targetX + (Math.random() - 0.5) * 2, y: flock.targetY + (Math.random() - 0.5) * 2, z: 5 + Math.random() * 3, vx: 0, vy: 0, flapTimer: Math.random() * Math.PI * 2, offsetX: (Math.random() - 0.5) * 1.5, offsetY: (Math.random() - 0.5) * 1.5, color: flockColor }); } 
        flocks.push(flock); 
    }
}

initOrResetMatch();

const texGlobalNoise = ctx.createPattern(createGlobalNoisePattern(), 'repeat');

// -------------------------------------------------------------
// VÒNG LẶP UPDATE CHÍNH
// -------------------------------------------------------------
function update(deltaTime) {
    if (gameState === 'lobby' || gameState === 'gameover') return;

    try {
        const safeDelta = Math.min(deltaTime, 0.05) || 0.016; 
        gameTime += safeDelta;
        
        timeCycle.update(safeDelta); noiseManager.update(safeDelta); particleManager.update(safeDelta);
        updateEnvironment(safeDelta, flocks, gibs, props, player);

        if (gameState === 'dropping') {
            const pDropState = dropManager.update(safeDelta, input, player, bots);
                
            if (pDropState === 'in_plane' || pDropState === 'falling') {
                let camTargetX = pDropState === 'falling' ? player.gridX : dropManager.planeX;
                let camTargetY = pDropState === 'falling' ? player.gridY : dropManager.planeY;
                let camTargetAlt = pDropState === 'falling' ? dropManager.playerAlt : dropManager.altitude;

                const targetScreen = gridToScreen(camTargetX, camTargetY, TILE_WIDTH, TILE_HEIGHT, 0, 0);
                
                camera.offsetX = window.innerWidth / 2 - targetScreen.x;
                camera.offsetY = window.innerHeight / 2 - (targetScreen.y - camTargetAlt * 3);
                return; 
            } else if (pDropState === 'landed') {
                gameState = 'playing'; 
                const ac = document.getElementById('action-controls');
                if (ac) ac.style.display = 'flex';
                sfx.play('pickup'); 
            }
        }

        const baseSpeed = 3.5; let currentSpeed = baseSpeed;
        if (player.kbTimer > 0 || player.health <= 0) currentSpeed = 0; 
        else if (player.isProne) currentSpeed = 0.8; 
        else if (player.isAiming) currentSpeed = 1.8; 
        
        if (player.thirst <= 0 && player.health > 0) { if (currentSpeed > 1.5) currentSpeed = 1.5; } 
        player.speed = currentSpeed;

        if (player.kbTimer > 0) {
            player.kbTimer -= safeDelta; let nextX = player.gridX + (player.kbX || 0) * safeDelta; let nextY = player.gridY + (player.kbY || 0) * safeDelta;
            if (!gameMap.isSolid(nextX, player.gridY)) player.gridX = nextX; if (!gameMap.isSolid(player.gridX, nextY)) player.gridY = nextY;
        } else if (player.health > 0) {
            let realThirst = player.thirst; let bypassThirst = false;
            if (player.thirst <= 0) { player.thirst = 0.1; bypassThirst = true; }
            let pLastX = player.gridX; let pLastY = player.gridY;
            player.update(safeDelta, input, gameMap);
            if (Math.abs(player.gridX - pLastX) > 0.005 || Math.abs(player.gridY - pLastY) > 0.005) { player.currentState = Math.floor(gameTime * 8) % 2 === 0 ? 'walk1' : 'walk2'; } else { player.currentState = 'idle'; }
            if (bypassThirst) { let diff = player.thirst - 0.1; player.thirst = realThirst + diff; if (player.thirst < 0) player.thirst = 0; }
        }
        
        if (player.health > 0 && player.thirst <= 0) { player.health -= safeDelta * 0.04; if (player.health <= 0) { player.health = 0; player.isProne = true; } }

        if (player.health > 0 && (input.mouse.clicked || (!('ontouchstart' in window) && input.mouse.x > 0))) {
            const pScreenForFacing = gridToScreen(player.gridX, player.gridY, TILE_WIDTH, TILE_HEIGHT, camera.offsetX, camera.offsetY);
            if (pScreenForFacing) {
                const pCenterYForFacing = pScreenForFacing.y + TILE_HEIGHT / 2 - (player.height || 64) / 2; let dx = input.mouse.x - pScreenForFacing.x; let dy = input.mouse.y - pCenterYForFacing;
                if (dx !== 0 || dy !== 0) { let isoDx = (dx / (TILE_WIDTH / 2) + dy / (TILE_HEIGHT / 2)) / 2; let isoDy = (dy / (TILE_HEIGHT / 2) - dx / (TILE_WIDTH / 2)) / 2; let len = Math.sqrt(isoDx * isoDx + isoDy * isoDy); if (len > 0) { player.facingX = isoDx / len; player.facingY = isoDy / len; } }
            }
        }

        const dynamicGrenadeBtn = document.getElementById('btn-use-grenade');
        if (dynamicGrenadeBtn) { const hasGrenade = player.inventory && player.inventory.items && player.inventory.items.some(i => i.name === 'Lựu Đạn'); dynamicGrenadeBtn.style.display = (hasGrenade && player.health > 0) ? 'flex' : 'none'; }

        if (input.isPressed('i') && player.uiCooldown <= 0 && player.health > 0) { inventoryUI.toggle(); player.uiCooldown = 0.3; sfx.play('pickup'); }
        if (input.isPressed('q') && player.uiCooldown <= 0 && player.health > 0) { if (player.unlockedWeapons.length > 0) { let idx = player.unlockedWeapons.indexOf(player.weapon); player.weapon = player.unlockedWeapons[(idx + 1) % player.unlockedWeapons.length]; player.isReloading = false; sfx.play('pickup'); } player.uiCooldown = 0.3; }
        if (input.isPressed('r') && !player.isReloading && player.health > 0) player.startReload(); 
        
        if (input.isPressed('use_heal') && player.actionCooldown <= 0 && player.health > 0) { const idx = player.inventory.items.findIndex(i => i.name === 'Túi Cứu Thương'); if (idx !== -1) { player.inventory.items[idx].use(player, bullets); player.inventory.removeItem(idx); sfx.play('pickup'); } player.actionCooldown = 0.3; }
        if (input.isPressed('use_water') && player.actionCooldown <= 0 && player.health > 0) { const idx = player.inventory.items.findIndex(i => i.name === 'Chai Nước'); if (idx !== -1) { player.inventory.items[idx].use(player, bullets); player.inventory.removeItem(idx); sfx.play('pickup'); } player.actionCooldown = 0.3; }
        if (input.isPressed('use_grenade') && player.actionCooldown <= 0 && player.health > 0) { const idx = player.inventory.items.findIndex(i => i.name === 'Lựu Đạn'); if (idx !== -1) { player.inventory.removeItem(idx); const dirLength = Math.sqrt(Math.pow(player.facingX || 1, 2) + Math.pow(player.facingY || 0, 2)) || 1; const normX = (player.facingX || 1) / dirLength; const normY = (player.facingY || 0) / dirLength; bullets.push(new Grenade(player.gridX + normX, player.gridY + normY, normX, normY)); sfx.play('shoot'); } player.actionCooldown = 0.8; }
        
        if (input.isPressed('attack') && player.shootCooldown <= 0 && player.health > 0) {
            player.healingTimer = 0; player.drinkingTimer = 0; 
            if (player.weapon !== 'none') {
                if (isGun(player.weapon)) {
                    if (!player.isReloading && player.ammo && player.ammo[player.weapon]) {
                        if (player.ammo[player.weapon].current > 0) {
                            player.startInteract(0.3); player.ammo[player.weapon].current--; 
                            const dirLength = Math.sqrt(Math.pow(player.facingX || 1, 2) + Math.pow(player.facingY || 0, 2)) || 1; const normX = (player.facingX || 1) / dirLength; const normY = (player.facingY || 0) / dirLength; let proneMultiplier = player.isProne ? 0.3 : 0.7; const spawnX = player.gridX + normX * proneMultiplier; const spawnY = player.gridY + normY * proneMultiplier;
                            if (player.weapon === 'shotgun') { const baseAngle = Math.atan2(normY, normX); for(let p=0; p<5; p++) { let spreadAngle = baseAngle + (Math.random() - 0.5) * 0.5; let b = new Bullet(spawnX, spawnY, Math.cos(spreadAngle), Math.sin(spreadAngle), player.weapon); b.owner = player.id; bullets.push(b); } } else { let b = new Bullet(spawnX, spawnY, player.facingX || 1, player.facingY || 0, player.weapon); b.owner = player.id; bullets.push(b); }
                            let noiseLvl = 10; if (['m4a1', 'scar', 'famas'].includes(player.weapon)) noiseLvl = 18; else if (player.weapon === 'akm') noiseLvl = 20; else if (player.weapon === 'shotgun') noiseLvl = 22; else if (player.weapon === 'p90') noiseLvl = 14; noiseManager.addNoise(player.gridX, player.gridY, noiseLvl); player.muzzleFlashTimer = 0.08; sfx.play('shoot'); 
                            let cool = 0.3; if (['m4a1', 'scar'].includes(player.weapon)) cool = 0.12; else if (player.weapon === 'akm') cool = 0.15; else if (player.weapon === 'famas') cool = 0.09; else if (['p90', 'uzi'].includes(player.weapon)) cool = 0.08; else if (player.weapon === 'shotgun') cool = 0.8; player.shootCooldown = cool; 
                        } else { player.startReload(); }
                    }
                } 
                else if (player.weapon === 'melee') {
                    player.startInteract(0.15); player.isSwinging = 0.15; sfx.play('melee'); 
                    bots.forEach(bot => { 
                        if (bot.health > 0 && bot.dropState === 'landed') { 
                            const dx = bot.gridX - player.gridX; const dy = bot.gridY - player.gridY; const distance = Math.sqrt(dx * dx + dy * dy); 
                            if (distance < 1.2) { 
                                const dirX = distance > 0 ? dx / distance : 0; const dirY = distance > 0 ? dy / distance : 0; const dot = (dirX * (player.facingX || 1)) + (dirY * (player.facingY || 0)); 
                                if (dot > 0.5) { 
                                    bot.health -= 30; window.spawnBlood(bot.gridX, bot.gridY, player.facingX || 1, player.facingY || 0); 
                                    if (bot.health <= 0) { player.kills++; addKillFeed(player.name, bot.name); } 
                                } 
                            } 
                        } 
                    });
                    player.shootCooldown = 0.35; 
                }
            }
        }

        let allEntities = [player, ...bots];
        let aliveEntities = allEntities.filter(e => e.health > 0 && (e === player || e.dropState === 'landed'));
        
        for (let i = 0; i < aliveEntities.length; i++) {
            for (let j = i + 1; j < aliveEntities.length; j++) {
                let e1 = aliveEntities[i]; let e2 = aliveEntities[j]; 
                let dx = e1.gridX - e2.gridX; let dy = e1.gridY - e2.gridY; let dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < 0.6) { 
                    let overlap = (0.6 - dist) / 2; let nx = dx / dist; let ny = dy / dist;
                    if (!gameMap.isSolid(e1.gridX + nx * overlap, e1.gridY)) e1.gridX += nx * overlap; 
                    if (!gameMap.isSolid(e1.gridX, e1.gridY + ny * overlap)) e1.gridY += ny * overlap;
                    if (!gameMap.isSolid(e2.gridX - nx * overlap, e2.gridY)) e2.gridX -= nx * overlap; 
                    if (!gameMap.isSolid(e2.gridX, e2.gridY - ny * overlap)) e2.gridY -= ny * overlap;
                }
            }
        }

        bots.forEach(bot => {
            if (bot.dropState !== 'landed') return; 

            let bLastX = bot.gridX; let bLastY = bot.gridY;
            let hasGun = false; if (bot.unlockedWeapons) hasGun = bot.unlockedWeapons.some(w => isGun(w)); else hasGun = isGun(bot.weapon);
            let perceivedEntities = allEntities.filter(e => e === player || e.dropState === 'landed'); 

            if (!hasGun && bot.health > 0) {
                perceivedEntities = [bot]; 
                let nearestGun = null; let minDist = 9999;
                itemsOnGround.forEach(itm => { if (itm.itemType === 'weapon' && isGun(itm.value)) { let d = Math.hypot(bot.gridX - itm.gridX, bot.gridY - itm.gridY); if (d < minDist) { minDist = d; nearestGun = itm; } } });
                if (nearestGun) {
                    let dx = nearestGun.gridX - bot.gridX; let dy = nearestGun.gridY - bot.gridY; let dist = Math.hypot(dx, dy) || 0.01;
                    if (dist > 0.1) { bot.facingX = dx / dist; bot.facingY = dy / dist; let speed = (bot.speed || 3.0) * safeDelta; if (!gameMap.isSolid(bot.gridX + bot.facingX * speed, bot.gridY)) bot.gridX += bot.facingX * speed; if (!gameMap.isSolid(bot.gridX, bot.gridY + bot.facingY * speed)) bot.gridY += bot.facingY * speed; }
                    if (dist <= 0.6) { if (!bot.unlockedWeapons) bot.unlockedWeapons = []; if (!bot.unlockedWeapons.includes(nearestGun.value)) bot.unlockedWeapons.push(nearestGun.value); bot.weapon = nearestGun.value; let idx = itemsOnGround.indexOf(nearestGun); if (idx !== -1) itemsOnGround.splice(idx, 1); }
                }
            }
            
            bot.update(safeDelta, gameMap, perceivedEntities, itemsOnGround, bullets, noiseManager);
            if (Math.abs(bot.gridX - bLastX) > 0.005 || Math.abs(bot.gridY - bLastY) > 0.005) { bot.currentState = Math.floor(gameTime * 8) % 2 === 0 ? 'walk1' : 'walk2'; } else { bot.currentState = 'idle'; }
            
            if (bot.health <= 0 && !bot.explodedToPieces) { 
                let zSprite = null; if (bot.sprites && bot.sprites['side'] && bot.sprites['side']['idle']) zSprite = bot.sprites['side']['idle']; 
                corpses.push({ type: 'corpse', gridX: bot.gridX, gridY: bot.gridY, facingX: bot.facingX || 1, facingY: bot.facingY || 0, width: bot.width || 64, height: bot.height || 64, sprite: zSprite }); 
                bot.explodedToPieces = true; 
            }
        });

        bullets = updateProjectiles(safeDelta, gameMap, bullets, bots, player, particleManager, noiseManager, addKillFeed);
        
        let botsAlive = bots.filter(b => b.health > 0).length;
        if (player.health <= 0) { 
            gameState = 'gameover'; document.getElementById('end-match-status').innerText = "BẠN ĐÃ BỊ LOẠI!"; document.getElementById('end-match-status').style.color = "#ef4444"; document.getElementById('end-match-stats').innerText = `Hạng: # ${botsAlive + 1} | Tiêu diệt: ${player.kills}`; matchEndDiv.style.display = 'flex'; 
        } else if (botsAlive === 0 && bots.length > 0) { 
            gameState = 'gameover'; document.getElementById('end-match-status').innerText = "CHIẾN THẮNG! TOP 1"; document.getElementById('end-match-status').style.color = "#22c55e"; document.getElementById('end-match-stats').innerText = `Chúc mừng bạn đã làm trùm bản đồ! | Mạng hạ gục: ${player.kills}`; matchEndDiv.style.display = 'flex'; 
        }

        bots = bots.filter(b => b.health > 0 || !b.explodedToPieces); 
        camera.follow(player, TILE_WIDTH, TILE_HEIGHT, gridToScreen);
        
    } catch (updateError) { console.warn("Update Shield Protected:", updateError); }
}

// -------------------------------------------------------------
// VÒNG LẶP ĐỒ HỌA RENDER
// -------------------------------------------------------------
function render() {
    const camX = Math.round(camera.offsetX) || 0; const camY = Math.round(camera.offsetY) || 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.imageSmoothingEnabled = false;
    
    let mapFocusX = player.gridX; let mapFocusY = player.gridY;
    if (gameState === 'dropping') {
        mapFocusX = dropManager.playerState === 'falling' ? player.gridX : dropManager.planeX; 
        mapFocusY = dropManager.playerState === 'falling' ? player.gridY : dropManager.planeY;
    }

    const viewRadius = 22; const pCol = Math.floor(mapFocusX) || 0; const pRow = Math.floor(mapFocusY) || 0;
    const minRow = pRow - viewRadius; const maxRow = pRow + viewRadius; const minCol = pCol - viewRadius; const maxCol = pCol + viewRadius;
    const isVis = (gx, gy) => gx >= minCol && gx <= maxCol && gy >= minRow && gy <= maxRow;

    renderMap(ctx, gameMap, minRow, maxRow, minCol, maxCol, camX, camY, gameTime, gridToScreen);
    ctx.save(); ctx.translate(camX, camY); ctx.globalAlpha = 0.4; ctx.fillStyle = texGlobalNoise; ctx.fillRect(-camX - 128, -camY - 128, canvas.width + 256, canvas.height + 256); ctx.restore();
    particleManager.renderStains(ctx, gridToScreen, TILE_WIDTH, TILE_HEIGHT, camX, camY);

    if (gameState === 'lobby') return; 

    try {
        let renderQueue = [];
        flocks.forEach(flock => { flock.birds.forEach(b => { if (isVis(b.x, b.y)) renderQueue.push({ type: 'bird', ent: b, depth: b.x + b.y + 0.6 }); }); });
        props.forEach(p => { if (isVis(p.gridX, p.gridY)) { let sway = 0; if (p.propType === 'tree_large' || p.propType === 'bush') sway = Math.sin(gameTime * 2.5 + p.gridX * 10 + p.gridY * 10) * 0.035; renderQueue.push({ type: 'prop', ent: p, depth: p.gridX + p.gridY + 0.3, sway: sway }); } });
        
        corpses.forEach(c => { if (isVis(c.gridX, c.gridY)) renderQueue.push({ type: 'corpse', ent: c, depth: c.gridX + c.gridY + 0.15 }); });
        bullets.forEach(b => { if (isVis(b.gridX, b.gridY)) renderQueue.push({ type: 'projectile', ent: b, depth: b.gridX + b.gridY + 0.2 }); });
        spentMags.forEach(m => { if (isVis(m.gridX, m.gridY)) renderQueue.push({ type: 'spent_mag', ent: m, depth: m.gridX + m.gridY + 0.1 }); });
        gibs.forEach(g => { if (isVis(g.x, g.y)) { let gPos = gridToScreen(g.x, g.y, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(gPos) renderQueue.push({ type: 'gib', ent: g, pos: gPos, depth: g.x + g.y + 0.1 }); } });
        itemsOnGround.forEach(i => { if (isVis(i.gridX, i.gridY)) renderQueue.push({ type: 'loot', ent: i, depth: i.gridX + i.gridY + 0.1 }); });
        particleManager.particles.forEach(p => { if (isVis(p.x, p.y) && p.color) renderQueue.push({ type: 'blood_part', ent: p, depth: p.x + p.y - 0.1 }); });

        if (gameState === 'playing' || gameState === 'gameover') {
            if (!player.explodedToPieces && dropManager.playerState === 'landed') renderQueue.push({ type: 'player', ent: player, depth: player.gridX + player.gridY + 0.5 });
            bots.forEach(b => { if (isVis(b.gridX, b.gridY) && b.health > 0 && b.dropState === 'landed') renderQueue.push({ type: 'bot', ent: b, depth: b.gridX + b.gridY + 0.5 }); });
        }

        renderQueue.sort((a, b) => a.depth - b.depth);
        
        renderQueue.forEach(item => {
            const ent = item.ent; let pos; let eW = ent.width || 64; let eH = ent.height || 64;
            
            if (item.type === 'bird') {
                pos = gridToScreen(ent.x, ent.y, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return;
                let screenZ = ent.z * 16; if (ent.z > 0.2) { ctx.save(); ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT/2)); ctx.transform(1, 0, 1.2, -0.4, 0, 0); ctx.fillStyle = 'rgba(12, 20, 36, 0.3)'; ctx.beginPath(); let sR = Math.max(0.5, 3 - ent.z * 0.3); ctx.ellipse(0, 0, sR * 1.5, sR, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
                ctx.save(); ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - screenZ)); let isFlying = Math.abs(ent.vx) > 0.5 || Math.abs(ent.vy) > 0.5 || ent.z > 2; ctx.fillStyle = ent.color || '#34495e';
                if (isFlying) { let flap = Math.sin(ent.flapTimer) * 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, flap); ctx.lineTo(-2, flap - 1); ctx.moveTo(0, 0); ctx.lineTo(4, flap); ctx.lineTo(2, flap - 1); ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillRect(-1.5, -1, 3, 3); } else { ctx.fillRect(-1.5, -3, 3, 4); ctx.fillStyle = '#e74c3c'; ctx.fillRect(-1, -1, 2, 2); ctx.fillStyle = '#f1c40f'; ctx.fillRect((ent.vx > 0 ? 1 : -2), -2, 1, 1); } ctx.restore(); return;
            }

            if (item.type === 'projectile') {
                pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return;
                if (ent.type === 'grenade_proj') { ctx.save(); if (ent.exploded) { let t = -ent.timer; let frameIndex = 0; if (t > 0.15) frameIndex = 2; else if (t > 0.05) frameIndex = 1; const matrix = explosionFrames[frameIndex]; const pixelSize = 6; const w = matrix[0].length * pixelSize; const h = matrix.length * pixelSize; const startX = Math.round(pos.x - w/2); const startY = Math.round(pos.y + TILE_HEIGHT/2 - h/2 - 10); for(let r=0; r<matrix.length; r++) { for(let c=0; c<matrix[r].length; c++) { let char = matrix[r][c]; if (char !== '0') { ctx.fillStyle = expColors[char]; ctx.fillRect(startX + c*pixelSize, startY + r*pixelSize, pixelSize, pixelSize); } } } } else { ctx.fillStyle = '#2ecc71'; ctx.strokeStyle = '#1e8449'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 5), 4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); } ctx.restore(); } else if (ent.type === 'bullet') { const screenDirX = (ent.dirX - ent.dirY) * (TILE_WIDTH / 2); const screenDirY = (ent.dirX + ent.dirY) * (TILE_HEIGHT / 2); const screenAngle = Math.atan2(screenDirY, screenDirX); ctx.save(); ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - 20)); ctx.rotate(screenAngle); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(-ent.width / 2), Math.round(-ent.height / 2), ent.width, ent.height); ctx.restore(); }
                return;
            }
            
            if (item.type === 'prop') {
                pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return;
                if (pos.x < -ent.width || pos.x > canvas.width + ent.width || pos.y < -ent.height || pos.y > canvas.height + ent.height) return;
                renderSpriteShadow(ctx, ent.shadowSprite, pos.x, pos.y + TILE_HEIGHT/2, ent.width, ent.height, item.sway);
                ctx.save(); ctx.imageSmoothingEnabled = false; if (ent.propType === 'bush') { const dx = mapFocusX - ent.gridX; const dy = mapFocusY - ent.gridY; if (Math.sqrt(dx*dx + dy*dy) < 0.6) ctx.globalAlpha = 0.5; }
                ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT/2)); if (item.sway !== 0) ctx.rotate(item.sway);
                if(ent.sprite && ent.sprite.width > 0) ctx.drawImage(ent.sprite, Math.round(-ent.width / 2), Math.round(-ent.height), ent.width, ent.height); ctx.restore(); return;
            }

            if (item.type === 'corpse') { pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return; renderEntityShadow(ctx, pos.x, pos.y + TILE_HEIGHT/2, 12, 5, true); ctx.save(); ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2)); ctx.scale(1, 0.4); const sFacingX = (ent.facingX - ent.facingY) * (TILE_WIDTH / 2); const sFacingY = (ent.facingX + ent.facingY) * (TILE_HEIGHT / 2); let sAngle = Math.atan2(sFacingY, sFacingX); ctx.rotate(sAngle); if (Math.abs(sAngle) > Math.PI / 2) ctx.scale(1, -1); if (ent.sprite && ent.sprite.width > 0) ctx.drawImage(ent.sprite, Math.round(-eW / 2), Math.round(-eH/1.5), eW, eH); ctx.restore(); return; }
            if (item.type === 'spent_mag') { pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(pos.x), Math.round(pos.y)); ctx.rotate(ent.rot); if(ent.sprite && ent.sprite.width > 0) ctx.drawImage(ent.sprite, Math.round(-ent.w/2 + ent.restX), Math.round(TILE_HEIGHT / 2 - ent.h/2 + ent.restY), ent.w, ent.h); ctx.restore(); return; }
            if (item.type === 'gib') { ctx.save(); ctx.translate(Math.round(item.pos.x), Math.round(item.pos.y + TILE_HEIGHT/2 - ent.z)); ctx.rotate(ent.rot); ctx.fillStyle = ent.color; ctx.fillRect(-ent.size/2, -ent.size/2, ent.size, ent.size); ctx.restore(); return; }
            if (item.type === 'blood_part') { pos = gridToScreen(ent.x, ent.y, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return; if (pos.x < -50 || pos.x > canvas.width + 50 || pos.y < -50 || pos.y > canvas.height + 50) return; ctx.fillStyle = ent.color; ctx.fillRect(Math.round(pos.x - ent.size/2), Math.round(pos.y + TILE_HEIGHT / 2 - ent.z), Math.round(ent.size), Math.round(ent.size)); return; }
            if (item.type === 'loot') { pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return; ctx.save(); ctx.imageSmoothingEnabled = false; if(ent.sprite && ent.sprite.width > 0) ctx.drawImage(ent.sprite, Math.round(pos.x - 12), Math.round(pos.y + TILE_HEIGHT / 2 - 12), 24, 24); else { ctx.fillStyle = ent.color || '#fff'; ctx.fillRect(Math.round(pos.x - 6), Math.round(pos.y + TILE_HEIGHT / 2 - 6), 12, 12); } ctx.restore(); return; }
            
            if (item.type === 'bot' || item.type === 'player') { pos = gridToScreen(ent.gridX, ent.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); if(!pos) return; renderCharacter(ctx, item, pos, player, spentMags, input, gameTime); return; }
        });

        if (gameState === 'dropping') {
            dropManager.render(ctx, camX, camY, gridToScreen, player, bots, gameTime);
            return; 
        }

        const playerScreenPos = gridToScreen(player.gridX, player.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY); 
        if (playerScreenPos && player.health > 0 && input && input.mouse && input.mouse.x > 0 && input.mouse.y > 0) {
            const lightCenterY = playerScreenPos.y + TILE_HEIGHT / 2 - (player.height||64) / 2;
            ctx.save(); const screenFacingX = ((player.facingX||1) - (player.facingY||0)) * (TILE_WIDTH / 2); const screenFacingY = ((player.facingX||1) + (player.facingY||0)) * (TILE_HEIGHT / 2); const gunAngle = Math.atan2(screenFacingY, screenFacingX) || 0; const mouseRadius = Math.sqrt((input.mouse.x - playerScreenPos.x)**2 + (input.mouse.y - lightCenterY)**2); const aimX = playerScreenPos.x + Math.cos(gunAngle) * mouseRadius; const aimY = lightCenterY + Math.sin(gunAngle) * mouseRadius;
            if (player.isAiming) {
                let laserStartX = playerScreenPos.x; let laserStartY = lightCenterY;
                if (player.weapon !== 'none' && player.weapon !== 'melee' && player.weaponData && player.weaponData[player.weapon]) {
                    const wData = player.weaponData[player.weapon]; const flipX = (Math.abs(gunAngle) > Math.PI / 2);
                    let scopeYOffset = (input && input.isPressed('use_grenade')) || player.isAiming ? 9 : 20; if (player.isProne) scopeYOffset += 18;
                    const transX = playerScreenPos.x + (flipX ? -2 : 2); const transY = playerScreenPos.y + TILE_HEIGHT / 2 - (player.height||64) + scopeYOffset;
                    let gripOffsetX = -5; if (['m4a1', 'scar', 'akm'].includes(player.weapon)) gripOffsetX = -8; else if (player.weapon === 'famas') gripOffsetX = -15; else if (player.weapon === 'shotgun') gripOffsetX = -12; else if (player.weapon === 'p90') gripOffsetX = -4; else if (['glock', 'uzi'].includes(player.weapon)) gripOffsetX = -3;
                    let localMuzzleX = gripOffsetX + (wData.muzzleX || 0); let localMuzzleY = -(wData.h||16) / 2 + (wData.muzzleY || 0); if (flipX) localMuzzleY = -localMuzzleY;
                    laserStartX = transX + localMuzzleX * Math.cos(gunAngle) - localMuzzleY * Math.sin(gunAngle); laserStartY = transY + localMuzzleX * Math.sin(gunAngle) + localMuzzleY * Math.cos(gunAngle);
                }
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(laserStartX, laserStartY); ctx.lineTo(aimX, aimY); ctx.stroke(); ctx.setLineDash([]); 
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(aimX - 12, aimY); ctx.lineTo(aimX - 4, aimY); ctx.moveTo(aimX + 4, aimY); ctx.lineTo(aimX + 12, aimY); ctx.moveTo(aimX, aimY - 12); ctx.lineTo(aimX, aimY - 4); ctx.moveTo(aimX, aimY + 4); ctx.lineTo(aimX, aimY + 12); ctx.stroke(); ctx.beginPath(); ctx.arc(aimX, aimY, 2, 0, Math.PI * 2); ctx.fillStyle = '#ff3333'; ctx.fill(); ctx.restore();
        }

        renderLootMenu();

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(canvas.width - 150, 15, 135, 60, 8); else ctx.fillRect(canvas.width - 150, 15, 135, 60); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'right';
        ctx.fillText(`Sống sót: ${bots.length + (player.health > 0 ? 1 : 0)}/30`, canvas.width - 25, 38);
        ctx.fillStyle = '#e74c3c'; ctx.fillText(`Tiêu diệt: ${player.kills}`, canvas.width - 25, 62);
        ctx.textAlign = 'left'; ctx.font = 'bold 14px Arial';
        killFeed.forEach((kf, idx) => { if (kf.timer > 0) { kf.timer -= 0.016; ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, kf.timer)})`; ctx.fillText(kf.text, 20, 50 + idx * 25); } });
        ctx.restore();

        if (healthBar) healthBar.render(ctx, player, canvas.width, canvas.height);
        if (inventoryUI) inventoryUI.render(ctx, player, canvas.width, canvas.height, input);

    } catch (renderCriticalError) { console.error("Critical Render Protected:", renderCriticalError); }
}

const game = new GameLoop(update, render);
game.ctx = ctx; game.start();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    camera.canvas.width = canvas.width; camera.canvas.height = canvas.height;
});
