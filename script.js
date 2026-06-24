// --- ĐỊNH NGHĨA CÁC ICON SVG ---
const svgWeapon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF" style="vertical-align: text-bottom; margin-right: 5px;"><path d="M21 9a1 1 0 0 0-1-1h-6.5L12 6H5a1 1 0 0 0-1 1v4h4v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5h4l3 2h2V9z"/></svg>`;
const svgAmmo = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F1C40F" stroke="#F39C12" stroke-width="1" style="vertical-align: text-bottom; margin-right: 5px;"><path d="M8 10V6a4 4 0 1 1 8 0v4H8zm0 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V10H8z"/></svg>`;
const svgMedkitMenu = `<svg width="18" height="18" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 5px;"><rect x="2" y="6" width="20" height="14" rx="2" ry="2" fill="#ECF0F1" stroke="#7F8C8D" stroke-width="1.5"/><path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" fill="none" stroke="#7F8C8D" stroke-width="1.5"/><path d="M15 14h-2v2h-2v-2H9v-2h2v-2h2v2h2v2z" fill="#E74C3C"/></svg>`;
const svgMedkitBtn = `<svg width="18" height="18" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 3px;"><path d="M17 6h-2V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM11 4h2v2h-2V4z" fill="#FFF"/><path d="M15 14h-2v2h-2v-2H9v-2h2v-2h2v2h2v2z" fill="#E74C3C"/></svg>`;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0; 
let mapSize = 5500; // ĐÃ THU NHỎ MAP XUỐNG 5500
let environment = [];
let collidables = []; 
let bullets = [];
let enemies = [];
let bloodDecals = []; 
let victoryAnim = 0; 

const player = { 
    x: mapSize/2, y: mapSize/2, z: 250, radius: 16, speed: 4.5, angle: 0, 
    landed: false, hp: 100, inBush: false,
    weaponCount: 0, currentAmmo: 0, reserveAmmo: 0, 
    backpack: 0, 
    reloading: false, reloadEndTime: 0, reloadTotalTime: 0,
    medkits: 0, healing: false, healEndTime: 0, healTotalTime: 3000, 
    recoil: 0, 
    pickupTimer: 0 
};

const keys = {};
const mouse = { x: canvas.width/2, y: canvas.height/2, down: false };
let isMobile = false; 
let mobileShooting = false;
let joyX = 0, joyY = 0;

let interactPressed = false;
let lastInteractTime = 0; 

function initUI() {
    let uiLayer = document.getElementById('ui-layer');
    if (!document.getElementById('aliveText')) {
        let pScore = document.createElement('p');
        pScore.innerHTML = 'Kills: <span id="scoreText" style="color: #FFD700;">0</span> | Còn: <span id="aliveText" style="color: #FF0000;">50</span> | HP: <span id="hpText">100</span><br>Đạn: <span id="ammoText">0/0</span> | Balo: <span id="bpText">0</span>%';
        let oldScoreP = document.getElementById('scoreText').parentElement;
        uiLayer.replaceChild(pScore, oldScoreP);
    }
}

// --- MENU NHẶT ĐỒ (TRONG SUỐT) ---
const lootMenu = document.createElement('div');
lootMenu.id = 'loot-menu';
lootMenu.style.position = 'fixed'; 
lootMenu.style.top = '50%'; 
lootMenu.style.left = '55%'; 
lootMenu.style.transform = 'translateY(-50%)'; 
lootMenu.style.background = 'transparent'; 
lootMenu.style.padding = '5px';
lootMenu.style.display = 'none';
lootMenu.style.zIndex = '1000';
lootMenu.style.fontFamily = 'sans-serif';
lootMenu.style.pointerEvents = 'auto';

lootMenu.style.maxHeight = '140px'; 
lootMenu.style.overflowY = 'auto';
lootMenu.style.display = 'flex';
lootMenu.style.flexDirection = 'column';
lootMenu.style.gap = '4px';
lootMenu.style.touchAction = 'auto'; 
document.body.appendChild(lootMenu);

let nearbyItems = []; 

// --- NÚT NẠP ĐẠN ---
const reloadBtn = document.createElement('div');
reloadBtn.id = 'reload-btn';
reloadBtn.style.position = 'absolute';
reloadBtn.style.bottom = '50px'; 
reloadBtn.style.right = '150px'; 
reloadBtn.style.width = '70px';
reloadBtn.style.height = '70px';
reloadBtn.style.background = 'radial-gradient(circle, #F39C12 0%, #D68910 100%)';
reloadBtn.style.border = '3px solid rgba(255,255,255,0.5)';
reloadBtn.style.borderRadius = '50%';
reloadBtn.style.color = 'white';
reloadBtn.style.fontWeight = 'bold';
reloadBtn.style.fontSize = '14px';
reloadBtn.style.display = 'none';
reloadBtn.style.alignItems = 'center';
reloadBtn.style.justifyContent = 'center';
reloadBtn.style.zIndex = '10';
reloadBtn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
reloadBtn.style.userSelect = 'none';
reloadBtn.innerHTML = 'NẠP';
document.body.appendChild(reloadBtn);

// --- NÚT HỒI MÁU ---
const healBtn = document.createElement('div');
healBtn.id = 'heal-btn';
healBtn.style.position = 'absolute';
healBtn.style.bottom = '140px'; 
healBtn.style.right = '150px'; 
healBtn.style.width = '60px';
healBtn.style.height = '60px';
healBtn.style.background = 'radial-gradient(circle, #27AE60 0%, #1E8449 100%)';
healBtn.style.border = '3px solid rgba(255,255,255,0.5)';
healBtn.style.borderRadius = '50%';
healBtn.style.color = 'white';
healBtn.style.fontWeight = 'bold';
healBtn.style.fontSize = '12px';
healBtn.style.display = 'none';
healBtn.style.alignItems = 'center';
healBtn.style.justifyContent = 'center';
healBtn.style.zIndex = '10';
healBtn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
healBtn.style.userSelect = 'none';
healBtn.innerHTML = svgMedkitBtn + '(0)';
document.body.appendChild(healBtn);

function startReload() {
    if (player.weaponCount > 0 && player.currentAmmo < 31 && player.reserveAmmo > 0 && !player.reloading) {
        player.reloading = true; player.healing = false; 
        let reloadTime = (player.currentAmmo === 0 && player.reserveAmmo === 31 && player.weaponCount === 1) 
                       ? Math.floor(Math.random() * 3000) + 5000 : 2500;
        player.reloadTotalTime = reloadTime;
        player.reloadEndTime = Date.now() + reloadTime; 
    }
}

function startHealing() {
    if (player.medkits > 0 && player.hp < 100 && !player.healing) {
        player.healing = true;
        player.reloading = false; 
        player.healTotalTime = 3000;
        player.healEndTime = Date.now() + 3000;
    }
}

reloadBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startReload(); }, {passive: false});
reloadBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startReload(); });

healBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHealing(); }, {passive: false});
healBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startHealing(); });

function doPickup(lootObj) {
    if (!lootObj) return;
    let actualItem = lootObj.item || lootObj;
    let success = false;

    if (actualItem.type === 'weapon' && player.weaponCount < 2) {
        let weight = 2.5; 
        if (player.backpack + weight <= 100) {
            player.weaponCount++; player.reserveAmmo += 31; player.backpack += weight;
            player.pickupTimer = Date.now() + 200; 
            if (!player.reloading && player.currentAmmo === 0) startReload(); 
            success = true;
        } else document.getElementById('statusText').innerText = "Balo đầy!";
    } 
    else if (actualItem.type === 'ammo') {
        let weight = Math.ceil(actualItem.amount / 31) * 2.5; 
        if (player.backpack + weight <= 100) {
            player.reserveAmmo += actualItem.amount; player.backpack += weight;
            player.pickupTimer = Date.now() + 200; success = true;
        } else document.getElementById('statusText').innerText = "Balo đầy!";
    }
    else if (actualItem.type === 'medkit') {
        let weight = 3; 
        if (player.backpack + weight <= 100) {
            player.medkits += 1; player.backpack += weight;
            player.pickupTimer = Date.now() + 200; success = true;
        } else document.getElementById('statusText').innerText = "Balo đầy!";
    }

    if (success) {
        if (lootObj.crate) {
            let idx = lootObj.crate.items.indexOf(actualItem);
            if (idx > -1) lootObj.crate.items.splice(idx, 1);
            if (lootObj.crate.items.length === 0) environment.splice(environment.indexOf(lootObj.crate), 1);
        } else {
            environment.splice(environment.indexOf(lootObj), 1);
        }
        lootMenu.dataset.state = ""; 
    }
}

let currentPhase = 0;
let zoneState = 'WAITING'; 
let zonePhaseTimer = Date.now();
let lastDamageTime = 0;

// VÒNG BO UPDATE CHO MAP 5500
const phases = [
    { wait: 90000, shrink: 45000, targetR: mapSize * 0.45, dmg: 5 },  
    { wait: 75000, shrink: 45000, targetR: mapSize * 0.25, dmg: 10 }, 
    { wait: 60000, shrink: 30000, targetR: mapSize * 0.1,  dmg: 18 }, 
    { wait: 45000, shrink: 30000, targetR: mapSize * 0.04, dmg: 25 }, 
    { wait: 45000, shrink: 30000, targetR: 0,              dmg: 35 }  
];

let oldZone = { x: mapSize/2, y: mapSize/2, r: mapSize * 0.8 }; 
let currentZone = { x: oldZone.x, y: oldZone.y, r: oldZone.r };
let safeZone = { x: 0, y: 0, r: 0 };

function initZone() {
    oldZone = { x: mapSize/2, y: mapSize/2, r: mapSize * 0.8 };
    currentZone = { x: oldZone.x, y: oldZone.y, r: oldZone.r };
    safeZone.r = phases[0].targetR;
    
    let maxD = oldZone.r - safeZone.r;
    let a = Math.random() * Math.PI * 2;
    let d = Math.random() * maxD;
    safeZone.x = oldZone.x + Math.cos(a) * d;
    safeZone.y = oldZone.y + Math.sin(a) * d;
    
    zonePhaseTimer = Date.now(); currentPhase = 0; zoneState = 'WAITING'; lastDamageTime = 0;
    
    if (!document.getElementById('zoneText')) {
        let p = document.createElement('p');
        p.innerHTML = 'Vòng bo: <span id="zoneText" style="color: #FFF;">Đang chờ...</span>';
        document.getElementById('ui-layer').appendChild(p);
    }
}

window.addEventListener('keydown', e => { 
    keys[e.key.toLowerCase()] = true; 
    if(e.key.toLowerCase() === 'h') startHealing(); 
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', e => { if(e.button === 0) mouse.down = true; });
window.addEventListener('mouseup', e => { if(e.button === 0) mouse.down = false; });
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const joyZone = document.getElementById('joystick-zone');
const joyKnob = document.getElementById('joystick-knob');
const shootBtn = document.getElementById('shoot-btn');
const interactBtn = document.getElementById('interact-btn'); 

let joyActive = false, joyCenter = {x:0, y:0};

window.addEventListener('touchstart', () => isMobile = true, {once: true});

joyZone.addEventListener('touchstart', e => {
    joyActive = true;
    let rect = joyZone.getBoundingClientRect();
    joyCenter = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    handleJoystick(e.touches[0]);
});
joyZone.addEventListener('touchmove', e => {
    if(joyActive) { e.preventDefault(); handleJoystick(e.touches[0]); }
}, {passive: false});
joyZone.addEventListener('touchend', () => {
    joyActive = false; joyX = 0; joyY = 0;
    joyKnob.style.transform = `translate(0px, 0px)`;
});

function handleJoystick(touch) {
    let dx = touch.clientX - joyCenter.x;
    let dy = touch.clientY - joyCenter.y;
    let maxDist = 35;
    let dist = Math.hypot(dx, dy);
    if (dist > maxDist) { dx = (dx/dist)*maxDist; dy = (dy/dist)*maxDist; }
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    joyX = dx / maxDist; joyY = dy / maxDist;
}

shootBtn.addEventListener('touchstart', e => { e.preventDefault(); mobileShooting = true; }, {passive: false});
shootBtn.addEventListener('touchend', e => { e.preventDefault(); mobileShooting = false; }, {passive: false});

interactBtn.addEventListener('touchstart', e => { e.preventDefault(); interactPressed = true; }, {passive: false});
interactBtn.addEventListener('touchend', e => { e.preventDefault(); interactPressed = false; }, {passive: false});

function createBlood(x, y) {
    let drops = Math.floor(Math.random() * 3) + 3;
    for(let k = 0; k < drops; k++) {
        bloodDecals.push({ x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 20, r: Math.random() * 5 + 3 });
    }
    if(bloodDecals.length > 500) bloodDecals.splice(0, bloodDecals.length - 500);
}

function getHouseAt(px, py) {
    for (let obj of environment) {
        if (obj.type === 'house' && px > obj.x && px < obj.x + obj.w && py > obj.y && py < obj.y + obj.h) {
            return obj;
        }
    }
    return null;
}

function initEnvironment() {
    initUI();
    environment = []; collidables = []; enemies = []; let houses = []; bloodDecals = [];
    victoryAnim = 0;
    
    const roofThemes = [ { light: '#A52A2A', dark: '#7B241C' }, { light: '#2E86C1', dark: '#21618C' }, { light: '#27AE60', dark: '#196F3D' }, { light: '#707B7C', dark: '#515A5A' }, { light: '#D35400', dark: '#873600' } ];

    for (let i = 0; i < 35; i++) {
        let scale = Math.random() * 0.6 + 0.8, w = 240 * scale, h = 180 * scale;
        let overlap = true, attempts = 0, x, y;
        while (overlap && attempts < 50) {
            attempts++; x = Math.random() * (mapSize - 300) + 150; y = Math.random() * (mapSize - 300) + 150; overlap = false;
            for (let existing of houses) {
                if (x < existing.x + existing.w + 120 && x + w > existing.x - 120 && y < existing.y + existing.h + 120 && y + h > existing.y - 120) { overlap = true; break; }
            }
        }
        if (!overlap) {
            let obj = {
                type: 'house', x: x, y: y, size: 30 * scale, w: w, h: h, wt: 15, doorW: 80, 
                doorDir: Math.floor(Math.random() * 4), doorOpenAnim: 0, isOpen: false, 
                roofAlpha: 1, roofL: roofThemes[Math.floor(Math.random() * roofThemes.length)].light, roofD: roofThemes[Math.floor(Math.random() * roofThemes.length)].dark 
            };
            houses.push(obj); environment.push(obj);
        }
    }

    let placedCrates = 0, attemptsCrate = 0;
    while(placedCrates < 50 && attemptsCrate < 1000) {
        attemptsCrate++; let size = 15; 
        let x = Math.random() * (mapSize - 100) + 50, y = Math.random() * (mapSize - 100) + 50;
        let overlap = false;
        for (let obj of houses) {
            if (x + size + 40 > obj.x && x - size - 40 < obj.x + obj.w && y + size + 40 > obj.y && y - size - 40 < obj.y + obj.h) { overlap = true; break; }
        }
        if (!overlap) {
            let count = Math.random() > 0.6 ? 2 : 1; 
            environment.push({ type: 'crate', x: x, y: y, size: size }); placedCrates++;
            if (count === 2 && placedCrates < 50) {
                let x2 = x + (Math.random() > 0.5 ? 1 : -1) * (size * 2 + 5), y2 = y + (Math.random() > 0.5 ? 1 : -1) * (size * 2 + 5);
                let overlap2 = false;
                for (let obj of houses) { if (x2 + size + 40 > obj.x && x2 - size - 40 < obj.x + obj.w && y2 + size + 40 > obj.y && y2 - size - 40 < obj.y + obj.h) { overlap2 = true; break; } }
                if (!overlap2) { environment.push({ type: 'crate', x: x2, y: y2, size: size }); placedCrates++; }
            }
        }
    }

    const types = ['tree', 'tree', 'rock', 'bush'];
    let placedOthers = 0, attempts = 0;
    while(placedOthers < 450 && attempts < 1500) {
        attempts++;
        let size = Math.random() * 20 + 20, x = Math.random() * (mapSize - 100) + 50, y = Math.random() * (mapSize - 100) + 50;
        let overlap = false;
        for (let obj of houses) { if (x + size + 50 > obj.x && x - size - 50 < obj.x + obj.w && y + size + 50 > obj.y && y - size - 50 < obj.y + obj.h) { overlap = true; break; } }
        if (!overlap) { environment.push({ type: types[Math.floor(Math.random() * types.length)], x: x, y: y, size: size }); placedOthers++; }
    }

    for(let i = 0; i < 150; i++) {
        let x = Math.random() * (mapSize - 200) + 100;
        let y = Math.random() * (mapSize - 200) + 100;
        let hObj = getHouseAt(x, y);
        environment.push({ type: 'weapon', x: x, y: y, inHouse: hObj });
        
        let numMags = Math.floor(Math.random() * 3) + 1;
        for(let j = 0; j < numMags; j++) {
            let ax = x + (Math.random()*60 - 30); let ay = y + (Math.random()*60 - 30);
            environment.push({ type: 'ammo', x: ax, y: ay, amount: 31, inHouse: getHouseAt(ax, ay) });
        }

        if(Math.random() > 0.7) {
            let mx = x + (Math.random()*60 - 30); let my = y + (Math.random()*60 - 30);
            environment.push({ type: 'medkit', x: mx, y: my, inHouse: getHouseAt(mx, my) });
        }
    }

    for (let house of houses) {
        if (Math.random() > 0.2) {
            let itemX = house.x + 40 + Math.random() * (house.w - 80);
            let itemY = house.y + 40 + Math.random() * (house.h - 80);
            environment.push({ type: 'weapon', x: itemX, y: itemY, inHouse: house });
            let numMags = Math.floor(Math.random() * 3) + 1;
            for(let j = 0; j < numMags; j++) {
                let ax = itemX + (Math.random()*50 - 25); let ay = itemY + (Math.random()*50 - 25);
                environment.push({ type: 'ammo', x: ax, y: ay, amount: 31, inHouse: getHouseAt(ax, ay) });
            }
            if(Math.random() > 0.5) { 
                let mx = itemX + (Math.random()*50 - 25); let my = itemY + (Math.random()*50 - 25);
                environment.push({ type: 'medkit', x: mx, y: my, inHouse: getHouseAt(mx, my) });
            }
        }
    }

    for (let i = 0; i < 49; i++) {
        enemies.push({
            id: i, x: Math.random() * (mapSize - 400) + 200, y: Math.random() * (mapSize - 400) + 200,
            z: 250 + Math.random() * 200, radius: 16, speed: Math.random() * 1.5 + 2.5, hp: 100,
            angle: 0, landed: false, inBush: false, hasWeapon: false, reloading: false, reloadEndTime: 0, reloadTotalTime: 0,
            currentAmmo: 0, lastShot: 0, targetWeapon: null, pickupTimer: 0,
            medkits: 1, healing: false, healEndTime: 0, healTotalTime: 3000, recoil: 0 
        });
    }

    collidables = environment.filter(obj => obj.type === 'house' || obj.type === 'crate' || obj.type === 'tree' || obj.type === 'rock');

    initZone(); 
}

function getFloorZ(px, py, pr) {
    let maxZ = 0; 
    for (let obj of collidables) { 
        let bw = obj.w || 0; let bh = obj.h || 0;
        if (px < obj.x - 300 || px > obj.x + bw + 300 || py < obj.y - 300 || py > obj.y + bh + 300) continue;
        
        if (obj.type === 'house') {
            if (px > obj.x - 15 - pr && px < obj.x + obj.w + 15 + pr && py > obj.y - 15 - pr && py < obj.y + obj.h + 15 + pr) { maxZ = Math.max(maxZ, obj.size * 2.5); }
        } else if (obj.type === 'crate') {
            if (px > obj.x - obj.size - pr && px < obj.x + obj.size + pr && py > obj.y - obj.size - pr && py < obj.y + obj.size + pr) { maxZ = Math.max(maxZ, obj.size * 1.5); }
        } else if (obj.type === 'tree') {
            if (Math.hypot(px - obj.x, py - obj.y) < obj.size * 1.2 + pr) { maxZ = Math.max(maxZ, obj.size * 1.5); }
        } else if (obj.type === 'rock') {
            if (Math.hypot(px - obj.x, py - obj.y) < obj.size + pr) { maxZ = Math.max(maxZ, obj.size * 0.5); }
        }
    }
    return maxZ;
}

function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
    let testX = cx, testY = cy;
    if (cx < rx) testX = rx; else if (cx > rx + rw) testX = rx + rw;
    if (cy < ry) testY = ry; else if (cy > ry + rh) testY = ry + rh;
    return ((cx - testX)*(cx - testX) + (cy - testY)*(cy - testY)) < cr*cr; 
}

function isColliding(px, py, pr, pz = 0) {
    for (let obj of collidables) { 
        let bw = obj.w || 0; let bh = obj.h || 0;
        if (px < obj.x - 300 || px > obj.x + bw + 300 || py < obj.y - 300 || py > obj.y + bh + 300) continue;
        
        if (obj.type === 'house') {
            if (pz >= obj.size * 2.5 - 5) continue; 
            let walls = [], wt = obj.wt, w = obj.w, h = obj.h, dw = obj.doorW;

            if (obj.doorDir === 0) { walls.push([obj.x, obj.y, (w-dw)/2, wt]); walls.push([obj.x + (w+dw)/2, obj.y, (w-dw)/2, wt]); } else walls.push([obj.x, obj.y, w, wt]);
            if (obj.doorDir === 1) { walls.push([obj.x + w - wt, obj.y, wt, (h-dw)/2]); walls.push([obj.x + w - wt, obj.y + (h+dw)/2, wt, (h-dw)/2]); } else walls.push([obj.x + w - wt, obj.y, wt, h]);
            if (obj.doorDir === 2) { walls.push([obj.x, obj.y + h - wt, (w-dw)/2, wt]); walls.push([obj.x + (w+dw)/2, obj.y + h - wt, (w-dw)/2, wt]); } else walls.push([obj.x, obj.y + h - wt, w, wt]);
            if (obj.doorDir === 3) { walls.push([obj.x, obj.y, wt, (h-dw)/2]); walls.push([obj.x, obj.y + (h+dw)/2, wt, (h-dw)/2]); } else walls.push([obj.x, obj.y, wt, h]);

            let currentDoorW = dw * (1 - obj.doorOpenAnim);
            if (currentDoorW > 5) {
                if (obj.doorDir === 0) walls.push([obj.x + (w-dw)/2 + (dw - currentDoorW), obj.y, currentDoorW, wt]);
                if (obj.doorDir === 1) walls.push([obj.x + w - wt, obj.y + (h-dw)/2 + (dw - currentDoorW), wt, currentDoorW]);
                if (obj.doorDir === 2) walls.push([obj.x + (w-dw)/2 + (dw - currentDoorW), obj.y + h - wt, currentDoorW, wt]);
                if (obj.doorDir === 3) walls.push([obj.x, obj.y + (h-dw)/2 + (dw - currentDoorW), wt, currentDoorW]);
            }
            for (let rect of walls) { if (circleRectCollide(px, py, pr, rect[0], rect[1], rect[2], rect[3])) return true; }
        }
        else if (obj.type === 'crate') { if (pz >= obj.size * 1.5 - 5) continue; if (circleRectCollide(px, py, pr, obj.x - obj.size, obj.y - obj.size, obj.size * 2, obj.size * 2)) return true; }
        else if (obj.type === 'tree') { if (pz >= obj.size * 1.5 - 5) continue; if (Math.hypot(px - obj.x, py - obj.y) < pr + 10) return true; }
        else if (obj.type === 'rock') { if (pz >= obj.size * 0.5 - 5) continue; if (Math.hypot(px - obj.x, py - obj.y) < pr + obj.size * 0.7) return true; }
    }
    return false;
}

function checkLineOfSight(x1, y1, x2, y2) {
    let dx = x2 - x1; let dy = y2 - y1; let dist = Math.hypot(dx, dy);
    let steps = Math.max(2, Math.ceil(dist / 8)); 
    for (let i = 1; i < steps; i++) {
        let px = x1 + (dx * i / steps); let py = y1 + (dy * i / steps);
        if (isColliding(px, py, 2, 0)) return false; 
    }
    return true;
}

let lastShot = 0;

function update() {
    let aliveCount = enemies.length + (player.hp > 0 ? 1 : 0);
    let aliveEl = document.getElementById('aliveText');
    if (aliveEl) aliveEl.innerText = aliveCount;
    
    let bpEl = document.getElementById('bpText');
    if (bpEl) bpEl.innerText = player.backpack.toFixed(1);

    if (player.hp <= 0) {
        lootMenu.style.display = 'none'; reloadBtn.style.display = 'none'; healBtn.style.display = 'none';
        return;
    }

    player.recoil = Math.max(0, player.recoil - 0.8);

    let currentFloorZ = getFloorZ(player.x, player.y, player.radius);
    if (player.z > currentFloorZ) {
        if (!player.landed) player.z -= 0.6; else player.z -= 5.0; 
        if (player.z <= currentFloorZ) { player.z = currentFloorZ; if (!player.landed) player.landed = true; }
    }

    if (keys['r']) startReload();

    if (player.landed) {
        let statusEl = document.getElementById('statusText');
        let ammoEl = document.getElementById('ammoText');
        if (ammoEl) ammoEl.innerText = `${player.currentAmmo}/${player.reserveAmmo}`;

        if (player.healing) {
            if (Date.now() >= player.healEndTime) {
                player.healing = false;
                player.hp = Math.min(100, player.hp + 30);
                player.medkits--;
                document.getElementById('hpText').innerText = player.hp;
            } else {
                statusEl.innerText = "Đang hồi máu..."; statusEl.style.color = "#27AE60"; 
            }
        }
        else if (player.reloading) {
            if (Date.now() >= player.reloadEndTime) {
                player.reloading = false;
                let needed = 31 - player.currentAmmo;
                let taking = Math.min(needed, player.reserveAmmo);
                player.currentAmmo += taking;
                player.reserveAmmo -= taking;
            } else { 
                statusEl.innerText = "Đang nạp đạn..."; statusEl.style.color = "#FFD700"; 
            }
        }
        else {
            if (player.weaponCount === 0) { statusEl.innerText = "Chưa có súng! Hãy nhặt súng"; statusEl.style.color = "#FF0000"; } 
            else if (player.currentAmmo === 0 && player.reserveAmmo === 0) { statusEl.innerText = "Hết đạn!"; statusEl.style.color = "#FF0000"; }
            else { statusEl.innerText = "Sẵn sàng chiến đấu!"; statusEl.style.color = "#00FF00"; }
        }

        healBtn.innerHTML = svgMedkitBtn + `(${player.medkits})`;
        if (isMobile && player.medkits > 0) healBtn.style.display = 'flex'; else healBtn.style.display = 'none';
    }

    player.inBush = false;
    if (player.z === 0) { 
        for (let obj of environment) {
            if (Math.abs(player.x - obj.x) > 100) continue;
            if (obj.type === 'bush' && Math.hypot(player.x - obj.x, player.y - obj.y) < obj.size * 0.8) { player.inBush = true; break; }
        }
    }

    nearbyItems = [];
    let isNearAnyDoor = false;
    let playerHouse = (player.landed && player.z === 0) ? getHouseAt(player.x, player.y) : null;

    for (let i = environment.length - 1; i >= 0; i--) {
        let obj = environment[i];
        
        let bw = obj.w || 0; let bh = obj.h || 0;
        if (player.x < obj.x - 200 || player.x > obj.x + bw + 200 || player.y < obj.y - 200 || player.y > obj.y + bh + 200) continue;

        if (obj.type === 'weapon' || obj.type === 'ammo' || obj.type === 'medkit' || obj.type === 'death_crate') {
            if (obj.inHouse && obj.inHouse !== playerHouse) continue;

            if (obj.type !== 'death_crate') {
                if (Math.hypot(player.x - obj.x, player.y - obj.y) < 80) nearbyItems.push(obj);
            }
            else {
                if (Math.hypot(player.x - obj.x, player.y - obj.y) < 80) {
                    obj.items.forEach(item => nearbyItems.push({ crate: obj, item: item }));
                }
            }
        }
        else if (obj.type === 'house') {
            let doorCx, doorCy;
            if (obj.doorDir === 0) { doorCx = obj.x + obj.w/2; doorCy = obj.y; }
            else if (obj.doorDir === 1) { doorCx = obj.x + obj.w; doorCy = obj.y + obj.h/2; }
            else if (obj.doorDir === 2) { doorCx = obj.x + obj.w/2; doorCy = obj.y + obj.h; }
            else if (obj.doorDir === 3) { doorCx = obj.x; doorCy = obj.y + obj.h/2; }
            
            let playerDistToDoor = Math.hypot(player.x - doorCx, player.y - doorCy);
            
            if (playerDistToDoor < 110 && player.landed && player.z === 0) {
                isNearAnyDoor = true; 
                if ((keys['f'] || interactPressed) && Date.now() - lastInteractTime > 300) {
                    obj.isOpen = !obj.isOpen; lastInteractTime = Date.now();
                }
            }
            
            if (obj.isOpen) obj.doorOpenAnim += 0.08; else obj.doorOpenAnim -= 0.08;
            obj.doorOpenAnim = Math.max(0, Math.min(1, obj.doorOpenAnim));

            let playerInside = (player.landed && player.z === 0 && player.x > obj.x && player.x < obj.x + obj.w && player.y > obj.y && player.y < obj.y + obj.h);
            
            if (obj.isOpen && ((playerDistToDoor < 150 && player.landed && player.z === 0) || playerInside)) {
                obj.roofAlpha -= 0.1; 
            } else { 
                obj.roofAlpha += 0.1; 
            }
            obj.roofAlpha = Math.max(0, Math.min(1, obj.roofAlpha));
        }
    }

    if (nearbyItems.length > 0 && player.landed) {
        let stateStr = nearbyItems.length.toString();
        if (lootMenu.dataset.state !== stateStr) {
            lootMenu.innerHTML = ''; lootMenu.style.display = 'flex';
            nearbyItems.forEach(lootObj => {
                let actualItem = lootObj.item || lootObj;
                let btn = document.createElement('div');
                btn.style.background = 'rgba(0, 0, 0, 0.6)';
                btn.style.color = '#FFF';
                btn.style.padding = '8px 12px'; 
                btn.style.borderRadius = '4px'; 
                btn.style.border = '1px solid rgba(255,255,255,0.2)'; 
                btn.style.fontWeight = 'bold';
                btn.style.textShadow = '1px 1px 2px #000';
                
                if (actualItem.type === 'weapon') btn.innerHTML = svgWeapon + 'Súng';
                else if (actualItem.type === 'ammo') btn.innerHTML = svgAmmo + `Đạn (${actualItem.amount})`;
                else if (actualItem.type === 'medkit') btn.innerHTML = svgMedkitMenu + `Hồi máu`;

                let pickupFn = (e) => { e.preventDefault(); e.stopPropagation(); doPickup(lootObj); };
                btn.ontouchstart = pickupFn; btn.onmousedown = pickupFn;
                lootMenu.appendChild(btn);
            });
            lootMenu.dataset.state = stateStr;
        }
        if (keys['f'] && Date.now() - lastInteractTime > 300) { doPickup(nearbyItems[0]); lastInteractTime = Date.now(); }
    } else { lootMenu.style.display = 'none'; lootMenu.dataset.state = "0"; }

    if (isMobile) {
        if (player.weaponCount > 0) reloadBtn.style.display = 'flex'; else reloadBtn.style.display = 'none';
        if (isNearAnyDoor) interactBtn.style.display = 'flex'; else { interactBtn.style.display = 'none'; interactPressed = false; }
    }

    let now = Date.now();
    if (player.landed) { 
        if (currentPhase < phases.length) {
            let phaseInfo = phases[currentPhase];
            let zt = document.getElementById('zoneText');
            
            if (zoneState === 'WAITING') {
                let elapsed = now - zonePhaseTimer;
                if (elapsed >= phaseInfo.wait) { zoneState = 'SHRINKING'; zonePhaseTimer = now; }
                let timeLeft = Math.ceil((phaseInfo.wait - Math.min(elapsed, phaseInfo.wait)) / 1000);
                if (zt) { zt.innerText = `Thu bo sau: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`; zt.style.color = "#FFF"; }
            } else if (zoneState === 'SHRINKING') {
                let elapsed = now - zonePhaseTimer; let progress = elapsed / phaseInfo.shrink;
                if (progress >= 1) {
                    progress = 1; zoneState = 'WAITING'; currentPhase++; zonePhaseTimer = now;
                    oldZone = { x: safeZone.x, y: safeZone.y, r: safeZone.r }; currentZone = { x: oldZone.x, y: oldZone.y, r: oldZone.r };
                    if (currentPhase < phases.length) {
                        safeZone.r = phases[currentPhase].targetR;
                        let maxDist = oldZone.r - safeZone.r; let angle = Math.random() * Math.PI * 2; let dist = Math.random() * maxDist;
                        safeZone.x = oldZone.x + Math.cos(angle) * dist; safeZone.y = oldZone.y + Math.sin(angle) * dist;
                    } else { safeZone = { x: oldZone.x, y: oldZone.y, r: 0 }; }
                } else {
                    currentZone.r = oldZone.r - (oldZone.r - safeZone.r) * progress;
                    currentZone.x = oldZone.x - (oldZone.x - safeZone.x) * progress;
                    currentZone.y = oldZone.y - (oldZone.y - safeZone.y) * progress;
                }
                if (zt) { zt.innerText = `Đang thu bo!`; zt.style.color = "#FF4500"; }
            }
        } else { let zt = document.getElementById('zoneText'); if (zt) zt.innerText = `Bo cuối đã khép!`; }

        if (Math.hypot(player.x - currentZone.x, player.y - currentZone.y) > currentZone.r) {
            if (now - lastDamageTime >= 3000) {
                if (enemies.length > 0) {
                    player.hp -= phases[Math.min(currentPhase, phases.length - 1)].dmg;
                    document.getElementById('hpText').innerText = player.hp;
                    document.getElementById('blood').style.opacity = 1; setTimeout(() => document.getElementById('blood').style.opacity = 0, 200);
                    if (player.hp <= 0) { document.getElementById('statusText').innerText = "TỬ TRẬN NGOÀI BO!"; document.getElementById('statusText').style.color = "#FF0000"; }
                }
                lastDamageTime = now;
            }
        } else { lastDamageTime = now - 3000; }
    }

    let baseSpeed = player.speed - (player.weaponCount === 2 ? 0.5 : 0);
    let currentSpeed = player.landed ? (player.healing ? baseSpeed * 0.5 : baseSpeed) : baseSpeed * 0.4;
    let moveX = 0, moveY = 0;
    
    if (keys['w']) moveY -= currentSpeed; if (keys['s']) moveY += currentSpeed;
    if (keys['a']) moveX -= currentSpeed; if (keys['d']) moveX += currentSpeed;
    if (isMobile) { moveX = joyX * currentSpeed; moveY = joyY * currentSpeed; }

    let steps = 5, stepX = moveX / steps, stepY = moveY / steps;
    for (let i = 0; i < steps; i++) {
        if (!isColliding(player.x + stepX, player.y, player.radius, player.z)) player.x += stepX;
        if (!isColliding(player.x, player.y + stepY, player.radius, player.z)) player.y += stepY;
    }

    player.x = Math.max(player.radius, Math.min(mapSize - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(mapSize - player.radius, player.y));

    if (player.landed) {
        if (!isMobile) { player.angle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2); } 
        else {
            if (mobileShooting && enemies.length > 0) {
                let closest = null, minD = Infinity;
                for(let i=0; i<enemies.length; i++) {
                    let d = Math.hypot(player.x - enemies[i].x, player.y - enemies[i].y);
                    if(d < 800 && d < minD && checkLineOfSight(player.x, player.y, enemies[i].x, enemies[i].y)) { 
                        minD = d; closest = enemies[i]; 
                    }
                }
                if (closest) player.angle = Math.atan2(closest.y - player.y, closest.x - player.x);
                else if (moveX !== 0 || moveY !== 0) player.angle = Math.atan2(moveY, moveX);
            } else if (moveX !== 0 || moveY !== 0) player.angle = Math.atan2(moveY, moveX);
        }
    }

    if ((mouse.down || mobileShooting) && player.landed && player.weaponCount > 0 && !player.reloading && Date.now() - lastShot > 150) {
        player.healing = false; 
        if (player.currentAmmo > 0) {
            player.currentAmmo--; 
            player.recoil = 6; 
            let spread = (Math.random() - 0.5) * 0.1;
            bullets.push({
                x: player.x + Math.cos(player.angle) * 25, y: player.y + Math.sin(player.angle) * 25,
                vx: Math.cos(player.angle + spread) * 20, vy: Math.sin(player.angle + spread) * 20, 
                life: 80, z: player.z, owner: player
            });
            lastShot = Date.now();
            
            if (player.currentAmmo <= 0 && player.reserveAmmo > 0) startReload();
        } else if (player.reserveAmmo > 0) { startReload(); }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        e.recoil = Math.max(0, e.recoil - 0.8);

        let eFloorZ = getFloorZ(e.x, e.y, e.radius);
        if (e.z > eFloorZ) {
            if (!e.landed) e.z -= 0.6; else e.z -= 5.0;
            if (e.z <= eFloorZ) { e.z = eFloorZ; e.landed = true; }
        }
        if (!e.landed) continue; 

        let moveEx = 0, moveEy = 0;

        for (let obj of collidables) { 
            let bw = obj.w || 0; let bh = obj.h || 0;
            if (obj.type === 'house' && e.x > obj.x - 200 && e.x < obj.x + bw + 200 && e.y > obj.y - 200 && e.y < obj.y + bh + 200) {
                let doorCx, doorCy;
                if (obj.doorDir === 0) { doorCx = obj.x + obj.w/2; doorCy = obj.y; }
                else if (obj.doorDir === 1) { doorCx = obj.x + obj.w; doorCy = obj.y + obj.h/2; }
                else if (obj.doorDir === 2) { doorCx = obj.x + obj.w/2; doorCy = obj.y + obj.h; }
                else if (obj.doorDir === 3) { doorCx = obj.x; doorCy = obj.y + obj.h/2; }
                
                if (Math.hypot(e.x - doorCx, e.y - doorCy) < 110 && !obj.isOpen) obj.isOpen = true; 
            }
        }

        if (e.hp < 50 && e.medkits > 0 && !e.healing) {
            e.healing = true; e.reloading = false; e.healTotalTime = 3000; e.healEndTime = now + 3000;
        }

        if (e.healing) {
            if (now >= e.healEndTime) {
                e.healing = false; e.hp = Math.min(100, e.hp + 30); e.medkits--;
            } else {
                let nearest = player; let dMin = player.hp > 0 ? Math.hypot(e.x - player.x, e.y - player.y) : Infinity;
                for (let other of enemies) {
                    if (other === e) continue;
                    let d = Math.hypot(e.x - other.x, e.y - other.y);
                    if(d < dMin) { dMin = d; nearest = other; }
                }
                if (nearest && dMin < 800) {
                    e.angle = Math.atan2(e.y - nearest.y, e.x - nearest.x);
                    moveEx = Math.cos(e.angle) * e.speed * 0.7; moveEy = Math.sin(e.angle) * e.speed * 0.7;
                }
            }
        }
        else if (!e.hasWeapon) {
            if (!e.targetWeapon || environment.indexOf(e.targetWeapon) === -1) {
                let wMinD = Infinity, nearestW = null;
                for (let obj of environment) {
                    if (obj.type === 'weapon') {
                        let d = Math.hypot(e.x - obj.x, e.y - obj.y);
                        if (d < wMinD) { wMinD = d; nearestW = obj; }
                    }
                }
                e.targetWeapon = nearestW;
            }

            if (e.targetWeapon) {
                let tx = e.targetWeapon.x, ty = e.targetWeapon.y;
                if (e.targetWeapon.inHouse && e.targetWeapon.inHouse !== getHouseAt(e.x, e.y)) {
                    let h = e.targetWeapon.inHouse;
                    if (h.doorDir === 0) { tx = h.x + h.w/2; ty = h.y; }
                    else if (h.doorDir === 1) { tx = h.x + h.w; ty = h.y + h.h/2; }
                    else if (h.doorDir === 2) { tx = h.x + h.w/2; ty = h.y + h.h; }
                    else if (h.doorDir === 3) { tx = h.x; ty = h.y + h.h/2; }
                }
                e.angle = Math.atan2(ty - e.y, tx - e.x);
                moveEx = Math.cos(e.angle) * e.speed; moveEy = Math.sin(e.angle) * e.speed;
                
                if (Math.hypot(e.x - e.targetWeapon.x, e.y - e.targetWeapon.y) < 20) {
                    e.hasWeapon = true; e.reloading = true; e.currentAmmo = 0;
                    e.pickupTimer = now + 200; 
                    let rTime = 5000 + Math.random() * 3000; e.reloadEndTime = now + rTime; e.reloadTotalTime = rTime;
                    let idx = environment.indexOf(e.targetWeapon); if (idx > -1) environment.splice(idx, 1);
                }
            }
        } 
        else if (e.reloading) {
            if (now >= e.reloadEndTime) { e.reloading = false; e.currentAmmo = 31; }
        } 
        else {
            let possibleTargets = [];
            if (player.hp > 0 && player.landed) {
                possibleTargets.push({ entity: player, d: Math.hypot(e.x - player.x, e.y - player.y) });
            }
            for (let other of enemies) {
                if (other === e || !other.landed) continue;
                possibleTargets.push({ entity: other, d: Math.hypot(e.x - other.x, e.y - other.y) });
            }
            possibleTargets.sort((a, b) => a.d - b.d); 

            let target = null;
            let tMinD = Infinity;
            let hasLoS = false;
            
            for (let pt of possibleTargets) {
                if (pt.d > 1200) break; 
                if (checkLineOfSight(e.x, e.y, pt.entity.x, pt.entity.y)) {
                    target = pt.entity; tMinD = pt.d; hasLoS = true; break;
                }
            }
            if (!target && possibleTargets.length > 0) {
                target = possibleTargets[0].entity; tMinD = possibleTargets[0].d; hasLoS = false;
            }

            if (target && tMinD < 1200) {
                if (hasLoS) { 
                    e.angle = Math.atan2(target.y - e.y, target.x - e.x); 
                    if (tMinD > 400) { moveEx = Math.cos(e.angle) * e.speed; moveEy = Math.sin(e.angle) * e.speed; } 
                    else if (tMinD < 250) { moveEx = -Math.cos(e.angle) * e.speed * 0.4; moveEy = -Math.sin(e.angle) * e.speed * 0.4; }

                    if (tMinD < 900 && now - e.lastShot > 1000 + Math.random() * 1000) {
                        if (e.currentAmmo > 0) {
                            e.currentAmmo--; e.recoil = 6;
                            let spread = (Math.random() - 0.5) * 0.25;
                            bullets.push({ x: e.x + Math.cos(e.angle) * 25, y: e.y + Math.sin(e.angle) * 25, vx: Math.cos(e.angle + spread) * 16, vy: Math.sin(e.angle + spread) * 16, life: 80, z: e.z, owner: e });
                            e.lastShot = now;
                            if (e.currentAmmo <= 0) { e.reloading = true; let rTime = 3000 + Math.random()*2000; e.reloadEndTime = now + rTime; e.reloadTotalTime = rTime; }
                        } else { e.reloading = true; let rTime = 3000 + Math.random()*2000; e.reloadEndTime = now + rTime; e.reloadTotalTime = rTime; }
                    }
                } else { 
                    e.angle = Math.atan2(target.y - e.y, target.x - e.x); 
                    moveEx = Math.cos(e.angle) * e.speed; moveEy = Math.sin(e.angle) * e.speed;
                }
            } else {
                e.angle += (Math.random() - 0.5) * 0.1;
                moveEx = Math.cos(e.angle) * e.speed * 0.5; moveEy = Math.sin(e.angle) * e.speed * 0.5;
            }
        }
        
        let testHitX = isColliding(e.x + moveEx * 3, e.y, e.radius, 0);
        let testHitY = isColliding(e.x, e.y + moveEy * 3, e.radius, 0);
        
        if (testHitX || testHitY) {
            let rightEx = Math.cos(e.angle + Math.PI/4) * e.speed;
            let rightEy = Math.sin(e.angle + Math.PI/4) * e.speed;
            if (!isColliding(e.x + rightEx * 2, e.y + rightEy * 2, e.radius, 0)) {
                moveEx = rightEx; moveEy = rightEy; e.angle += Math.PI/4;
            } else {
                let leftEx = Math.cos(e.angle - Math.PI/4) * e.speed;
                let leftEy = Math.sin(e.angle - Math.PI/4) * e.speed;
                moveEx = leftEx; moveEy = leftEy; e.angle -= Math.PI/4;
            }
        }

        let stepsE = 5, stepEx = moveEx / stepsE, stepEy = moveEy / stepsE;
        for (let s = 0; s < stepsE; s++) {
            if (!isColliding(e.x + stepEx, e.y, e.radius, 0)) e.x += stepEx;
            if (!isColliding(e.x, e.y + stepEy, e.radius, 0)) e.y += stepEy;
        }

        if (Math.hypot(e.x - currentZone.x, e.y - currentZone.y) > currentZone.r) {
            if (now % 3000 < 50) { 
                e.hp -= phases[Math.min(currentPhase, phases.length - 1)].dmg;
                if (e.hp <= 0) { 
                    let dropped = [];
                    if (e.hasWeapon) dropped.push({type: 'weapon'});
                    if (e.currentAmmo > 0) dropped.push({type: 'ammo', amount: 31}); 
                    if (e.medkits > 0) dropped.push({type: 'medkit'}); 
                    if (dropped.length > 0) environment.push({type: 'death_crate', x: e.x, y: e.y, size: 15, items: dropped, inHouse: getHouseAt(e.x, e.y)});
                    
                    enemies.splice(i, 1); createBlood(e.x, e.y); continue; 
                }
            }
        }
    }

    let maxVisibleDistX = canvas.width / 2 + 50;
    let maxVisibleDistY = canvas.height / 2 + 50;

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i], hit = false;
        
        if (Math.abs(b.x - player.x) > maxVisibleDistX || Math.abs(b.y - player.y) > maxVisibleDistY) {
            bullets.splice(i, 1); continue;
        }
        
        for (let s = 1; s <= 3; s++) { if (isColliding(b.x + (b.vx * s / 3), b.y + (b.vy * s / 3), 4, b.z)) { hit = true; break; } }
        b.life--;
        
        if (!hit) {
            if (b.owner !== player && player.landed && Math.hypot(b.x - player.x, b.y - player.y) < player.radius + 6) {
                player.hp -= 15; document.getElementById('hpText').innerText = player.hp;
                createBlood(player.x, player.y);
                document.getElementById('blood').style.opacity = 1; setTimeout(() => document.getElementById('blood').style.opacity = 0, 200);
                if (player.hp <= 0) { document.getElementById('statusText').innerText = "TỬ TRẬN!"; document.getElementById('statusText').style.color = "#FF0000"; }
                hit = true;
            } 
            else {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    let e = enemies[j];
                    if (b.owner !== e && e.landed && Math.hypot(b.x - e.x, b.y - e.y) < e.radius + 6) {
                        e.hp -= 20; createBlood(e.x, e.y); hit = true;
                        if (e.hp <= 0) { 
                            let dropped = [];
                            if (e.hasWeapon) dropped.push({type: 'weapon'});
                            if (e.currentAmmo > 0) dropped.push({type: 'ammo', amount: 31});
                            if (e.medkits > 0) dropped.push({type: 'medkit'});
                            if (dropped.length > 0) environment.push({type: 'death_crate', x: e.x, y: e.y, size: 15, items: dropped, inHouse: getHouseAt(e.x, e.y)});

                            enemies.splice(j, 1); 
                            if (b.owner === player) { score++; document.getElementById('scoreText').innerText = score; }
                        }
                        break;
                    }
                }
            }
        }
        if (hit || b.life <= 0) { bullets.splice(i, 1); continue; }
        b.x += b.vx; b.y += b.vy;
    }
}

function draw() {
    ctx.fillStyle = '#1E88E5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);
    
    ctx.fillStyle = '#4A6E3B'; ctx.fillRect(0, 0, mapSize, mapSize);
    ctx.strokeStyle = '#E6C280'; ctx.lineWidth = 150; ctx.strokeRect(0, 0, mapSize, mapSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 20; ctx.strokeRect(-75, -75, mapSize + 150, mapSize + 150); 

    ctx.fillStyle = '#610a0a';
    bloodDecals.forEach(b => {
        if(Math.abs(b.x - player.x) > canvas.width/2 + 500 || Math.abs(b.y - player.y) > canvas.height/2 + 500) return;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    });

    let renderQueue = [...environment, ...enemies];
    let cullDistX = canvas.width / 2 + 500;
    let cullDistY = canvas.height / 2 + 500;
    renderQueue = renderQueue.filter(obj => Math.abs(obj.x - player.x) < cullDistX && Math.abs(obj.y - player.y) < cullDistY);

    renderQueue.sort((a, b) => a.y - b.y);
    
    let playerHouse = (player.landed && player.z === 0) ? getHouseAt(player.x, player.y) : null;

    renderQueue.forEach(obj => {
        if ((obj.type === 'weapon' || obj.type === 'ammo' || obj.type === 'medkit' || obj.type === 'death_crate') && obj.inHouse && obj.inHouse !== playerHouse) return; 

        if (obj.hp !== undefined) drawEntity(obj, false); 
        else if (obj.type === 'tree') { drawTreeTrunk(obj); if (player.z >= obj.size * 1.5 - 10) drawTreeCanopy(obj); }
        else if (obj.type === 'rock') drawRock(obj);
        else if (obj.type === 'bush') drawBush(obj);
        else if (obj.type === 'crate') drawCrate(obj);
        else if (obj.type === 'house') drawHouse(obj);
        else if (obj.type === 'weapon') drawGroundWeapon(obj);
        else if (obj.type === 'ammo') drawAmmo(obj);
        else if (obj.type === 'medkit') drawMedkit(obj);
        else if (obj.type === 'death_crate') drawDeathCrate(obj);
    });

    drawEntity(player, true); 

    bullets.forEach(b => {
        if(Math.abs(b.x - player.x) > cullDistX || Math.abs(b.y - player.y) > cullDistY) return;
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); 
        ctx.fillStyle = b.owner === player ? '#F4CE14' : '#FF3300'; 
        ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = b.owner === player ? '#F4CE14' : '#FF0000'; 
        ctx.fillStyle = '#FFF'; ctx.fill(); ctx.shadowBlur = 0; 
    });
    
    renderQueue.forEach(obj => { if (obj.type === 'tree' && player.z < obj.size * 1.5 - 10) drawTreeCanopy(obj); });

    ctx.save();
    ctx.beginPath();
    ctx.rect(-mapSize*2, -mapSize*2, mapSize * 5, mapSize * 5);
    ctx.arc(currentZone.x, currentZone.y, currentZone.r, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(0, 50, 255, 0.35)'; 
    ctx.fill();

    if (currentPhase < phases.length && safeZone.r > 0 && zoneState === 'WAITING') {
        ctx.beginPath(); ctx.arc(safeZone.x, safeZone.y, safeZone.r, 0, Math.PI*2);
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4; ctx.setLineDash([15, 15]); ctx.stroke(); ctx.setLineDash([]);
    }
    
    ctx.beginPath(); ctx.arc(currentZone.x, currentZone.y, currentZone.r, 0, Math.PI*2);
    ctx.strokeStyle = '#0055FF'; ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();
    
    ctx.restore(); 

    if (player.reloading) {
        let cx = canvas.width / 2; let cy = canvas.height / 2 - 40; 
        let progress = 1 - ((player.reloadEndTime - Date.now()) / player.reloadTotalTime);
        if (progress > 1) progress = 1;
        let timeLeft = ((player.reloadEndTime - Date.now()) / 1000).toFixed(1);

        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 18, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
        ctx.strokeStyle = '#F39C12'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(timeLeft + 's', cx, cy);
    }
    else if (player.healing) {
        let cx = canvas.width / 2; let cy = canvas.height / 2 - 40; 
        let progress = 1 - ((player.healEndTime - Date.now()) / player.healTotalTime);
        if (progress > 1) progress = 1;
        let timeLeft = ((player.healEndTime - Date.now()) / 1000).toFixed(1);

        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 18, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(timeLeft + 's', cx, cy);
    }
}

function drawMedkit(m) {
    ctx.save(); ctx.translate(m.x, m.y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-8, -6, 16, 12);
    ctx.fillStyle = '#ECF0F1'; ctx.fillRect(-7, -7, 14, 10);
    ctx.fillStyle = '#E74C3C'; ctx.fillRect(-1.5, -5, 3, 6); ctx.fillRect(-3, -3.5, 6, 3);
    
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(39, 174, 96, 0.1)'; ctx.fill();
    ctx.strokeStyle = 'rgba(39, 174, 96, 0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
}

function drawDeathCrate(c) {
    ctx.save(); ctx.translate(c.x, c.y);
    let s = c.size; let h = c.size * 0.8; 
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-s + 5, -s + 5, s * 2, s * 2);
    ctx.fillStyle = '#3E4A3D'; ctx.fillRect(-s, s - h, s * 2, h);
    ctx.translate(0, -h);
    ctx.fillStyle = '#4E5A4D'; ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = '#2E3A2D'; ctx.lineWidth = 2; ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.fillStyle = '#AAB7B8'; ctx.fillRect(-4, -s/2, 8, s); ctx.fillRect(-s/2, -4, s, 8);
    ctx.restore();
}

function drawGroundWeapon(w) {
    ctx.save(); ctx.translate(w.x, w.y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-10, -5, 20, 10); 
    ctx.rotate(Math.PI/4); 
    ctx.fillStyle = '#2C3E50'; ctx.fillRect(-8, -2, 16, 4); 
    ctx.fillStyle = '#1A252F'; ctx.fillRect(8, -1.5, 12, 3); 
    ctx.fillStyle = '#000'; ctx.fillRect(0, -4, 4, 2); 
    
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
}

function drawAmmo(a) {
    ctx.save(); ctx.translate(a.x, a.y);
    ctx.fillStyle = '#556B2F'; ctx.fillRect(-6, -6, 12, 12);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(-2, -4, 4, 8);
    
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'; ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
}

function drawEntity(entity, isPlayer) {
    ctx.save(); ctx.translate(entity.x, entity.y);

    if (!isPlayer && entity.healing) {
        let progress = 1 - ((entity.healEndTime - Date.now()) / entity.healTotalTime);
        if(progress > 1) progress = 1;
        ctx.fillStyle = '#000'; ctx.fillRect(-10, -25, 20, 4);
        ctx.fillStyle = '#27AE60'; ctx.fillRect(-10, -25, 20 * progress, 4);
    }

    if (isPlayer && entity.inBush) ctx.globalAlpha = 0.2;

    if(!entity.landed) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(0, 0, 16 - (entity.z / 25), 0, Math.PI*2); ctx.fill();
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(5, 5, entity.radius, entity.radius*0.8, 0, 0, Math.PI*2); ctx.fill();
    }
    
    ctx.translate(0, -entity.z);
    ctx.rotate(entity.angle);

    if (!entity.landed) {
        let pSize = 50 + entity.z * 0.35; 
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 1.5;
        let strings = [[-pSize*0.8, -pSize*0.5], [-pSize*0.8, pSize*0.5], [0, -pSize*0.9], [0, pSize*0.9], [pSize*0.8, -pSize*0.5], [pSize*0.8, pSize*0.5]];
        ctx.beginPath(); for(let pt of strings) { ctx.moveTo(0, 0); ctx.lineTo(pt[0], pt[1]); } ctx.stroke();

        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pSize);
        grad.addColorStop(0, '#E74C3C'); grad.addColorStop(1, '#922B21'); 
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, pSize, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#641E16'; ctx.lineWidth = 2;
        for(let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(i*Math.PI/4)*pSize, Math.sin(i*Math.PI/4)*pSize); ctx.stroke(); }
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, pSize*0.12, 0, Math.PI*2); ctx.fill();
    } else {
        let hasGun = (isPlayer && player.weaponCount > 0) || (!isPlayer && entity.hasWeapon);
        
        let lArmX = entity.radius + 2, lArmY = -6;
        let rArmX = entity.radius + 2, rArmY = 6;

        if (hasGun) {
            ctx.save();
            ctx.translate(-entity.recoil, 0); 

            ctx.fillStyle = '#2C3E50'; ctx.fillRect(entity.radius - 8, -4, 16, 7); 
            ctx.fillStyle = '#1A252F'; ctx.fillRect(entity.radius + 8, -2.5, 20, 4); 
            ctx.fillStyle = '#000'; ctx.fillRect(entity.radius, -6, 6, 2); 
            
            lArmX = entity.radius + 14 - entity.recoil; lArmY = -1.5;
            rArmX = entity.radius - 2 - entity.recoil; rArmY = 4.5;

            ctx.restore();

            if (entity.reloading) lArmX -= Math.abs(Math.sin(Date.now() / 50)) * 8; 
        }

        if (entity.pickupTimer > Date.now()) { lArmX += 8; rArmX += 8; }

        ctx.fillStyle = '#FFC3A0'; ctx.beginPath(); ctx.arc(lArmX, lArmY, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rArmX, rArmY, 4, 0, Math.PI*2); ctx.fill();

        let shoulderGrad = ctx.createLinearGradient(-15, -15, 15, 15);
        if(isPlayer) { shoulderGrad.addColorStop(0, '#3498DB'); shoulderGrad.addColorStop(1, '#21618C'); }
        else { shoulderGrad.addColorStop(0, '#E74C3C'); shoulderGrad.addColorStop(1, '#7B241C'); }
        ctx.fillStyle = shoulderGrad; ctx.beginPath(); ctx.ellipse(0, 0, entity.radius + 2, entity.radius - 4, 0, 0, Math.PI*2); ctx.fill();
        
        let headGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 10);
        if(isPlayer) { headGrad.addColorStop(0, '#FFE0BD'); headGrad.addColorStop(1, '#E0AC69'); }
        else { headGrad.addColorStop(0, '#AAB7B8'); headGrad.addColorStop(1, '#515A5A'); } 
        ctx.fillStyle = headGrad; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
}

function drawCrate(c) {
    ctx.save(); ctx.translate(c.x, c.y);
    let s = c.size; let h = c.size * 1.5; 
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-s + 12, -s + 12, s * 2, s * 2);
    ctx.fillStyle = '#5C3A21'; ctx.fillRect(-s, s - h, s * 2, h);
    ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 2; ctx.strokeRect(-s, s - h, s * 2, h);
    ctx.translate(0, -h);
    ctx.fillStyle = '#8B5A2B'; ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = '#6B4226'; ctx.lineWidth = 1; ctx.beginPath();
    let pseudoRandom = (c.x * 13 + c.y * 31) % 100;
    for(let i = -s + 4; i < s - 2; i += 6) { ctx.moveTo(-s + 2, i); let wave = ((pseudoRandom + i) % 5) - 2; ctx.lineTo(0, i + wave); ctx.lineTo(s - 2, i - wave); }
    ctx.stroke();
    ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 4; ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-s + 2, -s + 2); ctx.lineTo(s - 2, s - 2); ctx.moveTo(s - 2, -s + 2); ctx.lineTo(-s + 2, s - 2); ctx.stroke();
    ctx.restore();
}

function drawTreeTrunk(t) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(t.x + t.size*0.4, t.y + t.size*0.3, t.size, t.size*0.6, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#271915'; ctx.beginPath(); ctx.ellipse(t.x, t.y, 10, 5, 0, 0, Math.PI*2); ctx.fill();
    let trunkGrad = ctx.createLinearGradient(t.x - 10, 0, t.x + 10, 0); 
    trunkGrad.addColorStop(0, '#3E2723'); trunkGrad.addColorStop(0.5, '#5D4037'); trunkGrad.addColorStop(1, '#271915'); 
    ctx.fillStyle = trunkGrad; ctx.fillRect(t.x - 10, t.y - t.size - 10, 20, t.size + 10);
}

function drawTreeCanopy(t) {
    let yOffset = t.y - t.size - 10; 
    let wind = Math.sin(Date.now() / 1200 + t.x / 100) * 0.08;
    ctx.save(); ctx.translate(t.x, yOffset); ctx.rotate(wind);
    let canopyGrad = ctx.createRadialGradient(-t.size*0.2, -t.size*0.2, t.size*0.1, 0, 0, t.size*1.2); 
    canopyGrad.addColorStop(0, '#8BC34A'); canopyGrad.addColorStop(0.7, '#33691E'); canopyGrad.addColorStop(1, '#1B5E20'); 
    ctx.fillStyle = canopyGrad; 
    ctx.beginPath(); ctx.arc(0, 0, t.size, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-t.size*0.4, t.size*0.3, t.size * 0.7, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(t.size*0.4, t.size*0.3, t.size * 0.7, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -t.size*0.4, t.size * 0.8, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

function drawHouse(h) {
    let w = h.w, hh = h.h, wt = h.wt, dw = h.doorW;
    ctx.fillStyle = '#8D6E63'; ctx.fillRect(h.x, h.y, w, hh);
    ctx.fillStyle = '#A6ACAF'; 
    let pDepth = 25; let pWidth = dw + 30; 
    if (h.doorDir === 0) ctx.fillRect(h.x + (w - pWidth)/2, h.y - pDepth, pWidth, pDepth);
    if (h.doorDir === 1) ctx.fillRect(h.x + w, h.y + (hh - pWidth)/2, pDepth, pWidth);
    if (h.doorDir === 2) ctx.fillRect(h.x + (w - pWidth)/2, h.y + hh, pWidth, pDepth);
    if (h.doorDir === 3) ctx.fillRect(h.x - pDepth, h.y + (hh - pWidth)/2, pDepth, pWidth);
    ctx.fillStyle = '#D4C4A8'; let wallZ = h.size * 1.5;
    if (h.doorDir === 0) {
        ctx.fillRect(h.x, h.y, (w-dw)/2, wt); ctx.fillRect(h.x + (w+dw)/2, h.y, (w-dw)/2, wt);
        ctx.fillStyle = '#C2B29A'; ctx.fillRect(h.x, h.y - wallZ, (w-dw)/2, wallZ); ctx.fillRect(h.x + (w+dw)/2, h.y - wallZ, (w-dw)/2, wallZ);
    } else { ctx.fillRect(h.x, h.y, w, wt); ctx.fillStyle = '#C2B29A'; ctx.fillRect(h.x, h.y - wallZ, w, wallZ); }
    ctx.fillStyle = '#D4C4A8';
    if (h.doorDir === 1) { ctx.fillRect(h.x + w - wt, h.y, wt, (hh-dw)/2); ctx.fillRect(h.x + w - wt, h.y + (hh+dw)/2, wt, (hh-dw)/2); } else ctx.fillRect(h.x + w - wt, h.y, wt, hh); 
    if (h.doorDir === 2) { ctx.fillRect(h.x, h.y + hh - wt, (w-dw)/2, wt); ctx.fillRect(h.x + (w+dw)/2, h.y + hh - wt, (w-dw)/2, wt); } else ctx.fillRect(h.x, h.y + hh - wt, w, wt); 
    if (h.doorDir === 3) { ctx.fillRect(h.x, h.y, wt, (hh-dw)/2); ctx.fillRect(h.x, h.y + (hh+dw)/2, wt, (hh-dw)/2); } else ctx.fillRect(h.x, h.y, wt, hh); 
    ctx.save(); ctx.fillStyle = '#5D4037'; let doorAngle = h.doorOpenAnim * (Math.PI / 2); 
    if (h.doorDir === 0) { ctx.translate(h.x + (w-dw)/2, h.y + wt/2); ctx.rotate(doorAngle); ctx.fillRect(0, -wt/2, dw, wt); } 
    else if (h.doorDir === 1) { ctx.translate(h.x + w - wt/2, h.y + (hh-dw)/2); ctx.rotate(doorAngle); ctx.fillRect(-wt/2, 0, wt, dw); }
    else if (h.doorDir === 2) { ctx.translate(h.x + (w-dw)/2, h.y + hh - wt/2); ctx.rotate(-doorAngle); ctx.fillRect(0, -wt/2, dw, wt); }
    else if (h.doorDir === 3) { ctx.translate(h.x + wt/2, h.y + (hh-dw)/2); ctx.rotate(-doorAngle); ctx.fillRect(-wt/2, 0, wt, dw); }
    ctx.restore();
    if (h.roofAlpha > 0) {
        ctx.save(); ctx.globalAlpha = h.roofAlpha; 
        let pad = 15, roofZ = h.size * 2.5; 
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(h.x + 5, h.y + 5, w, hh); 
        ctx.save(); ctx.beginPath(); ctx.moveTo(h.x - pad, h.y + hh + pad); ctx.lineTo(h.x - pad, h.y - pad); ctx.lineTo(h.x + w/2, h.y - roofZ); ctx.lineTo(h.x + w/2, h.y + hh + pad); ctx.closePath(); ctx.fillStyle = h.roofL; ctx.fill();
        ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5;
        for(let i=0; i < hh + pad*2 + roofZ; i+=12) { ctx.beginPath(); ctx.moveTo(h.x - pad, h.y + hh + pad - i); ctx.lineTo(h.x + w/2, h.y + hh + pad - i); ctx.stroke(); }
        for(let i=0; i < w; i+=15) { ctx.beginPath(); ctx.moveTo(h.x - pad + i, h.y + hh + pad); ctx.lineTo(h.x - pad + i + w/4, h.y - roofZ); ctx.stroke(); } ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.moveTo(h.x + w + pad, h.y + hh + pad); ctx.lineTo(h.x + w + pad, h.y - pad); ctx.lineTo(h.x + w/2, h.y - roofZ); ctx.lineTo(h.x + w/2, h.y + hh + pad); ctx.closePath(); ctx.fillStyle = h.roofD; ctx.fill();
        ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
        for(let i=0; i < hh + pad*2 + roofZ; i+=12) { ctx.beginPath(); ctx.moveTo(h.x + w/2, h.y + hh + pad - i); ctx.lineTo(h.x + w + pad, h.y + hh + pad - i); ctx.stroke(); }
        for(let i=0; i < w; i+=15) { ctx.beginPath(); ctx.moveTo(h.x + w/2 + i, h.y + hh + pad); ctx.lineTo(h.x + w/2 + i - w/4, h.y - roofZ); ctx.stroke(); } ctx.restore();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(h.x + w/2, h.y - roofZ); ctx.lineTo(h.x + w/2, h.y + hh + pad); ctx.stroke();
        ctx.restore(); 
    }
}

function drawRock(r) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(r.x + 8, r.y + 8, r.size, r.size*0.7, 0, 0, Math.PI*2); ctx.fill();
    let rGrad = ctx.createLinearGradient(r.x - r.size, r.y - r.size, r.x + r.size, r.y + r.size); rGrad.addColorStop(0, '#BDC3C7'); rGrad.addColorStop(1, '#566573'); ctx.fillStyle = rGrad;
    ctx.beginPath(); ctx.moveTo(r.x, r.y - r.size); ctx.lineTo(r.x + r.size*0.8, r.y - r.size*0.4); ctx.lineTo(r.x + r.size, r.y + r.size*0.5); ctx.lineTo(r.x - r.size*0.5, r.y + r.size*0.8); ctx.lineTo(r.x - r.size, r.y); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(r.x, r.y - r.size); ctx.lineTo(r.x + r.size*0.8, r.y - r.size*0.4); ctx.lineTo(r.x, r.y); ctx.fill();
}

function drawBush(b) {
    let wind = Math.sin(Date.now() / 1000 + b.x / 50) * 0.05;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(wind);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(3, 3, b.size, b.size*0.6, 0, 0, Math.PI*2); ctx.fill();
    let bushGrad = ctx.createRadialGradient(0, -b.size*0.2, 0, 0, 0, b.size); bushGrad.addColorStop(0, '#8BC34A'); bushGrad.addColorStop(1, '#33691E'); ctx.fillStyle = bushGrad;
    [[-1,0], [1,0], [0,-1], [0.5, 0.5], [-0.5, 0.5]].forEach(offset => { ctx.beginPath(); ctx.arc(offset[0]*b.size*0.5, offset[1]*b.size*0.5, b.size*0.6, 0, Math.PI*2); ctx.fill(); });
    ctx.restore();
}

function gameLoop() {
    if (player.hp > 0) {
        update();
        draw();
    }
    
    // --- MÀN HÌNH TỬ TRẬN HOẶC TOP 1 ---
    if (player.hp <= 0) {
        draw(); 
        ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#E74C3C'; ctx.font = 'bold 50px Arial'; ctx.textAlign = 'center';
        ctx.fillText('BẠN ĐÃ TỬ TRẬN', canvas.width/2, canvas.height/2 - 20);
        ctx.fillStyle = 'white'; ctx.font = '30px Arial'; ctx.fillText('Kills: ' + score, canvas.width/2, canvas.height/2 + 30);
    } else if (enemies.length === 0) {
        victoryAnim += 0.05;
        let scale = Math.min(1.2, 1 + Math.sin(victoryAnim) * 0.05); 
        let alpha = Math.min(0.7, victoryAnim * 0.5); 
        
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = '#F4CE14'; 
        ctx.font = 'bold 45px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#F39C12';
        ctx.shadowBlur = 20;
        ctx.fillText('WINNER WINNER CHICKEN DINNER!', 0, -20);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 25px Arial';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000';
        ctx.fillText('TOP 1 | KILLS: ' + score, 0, 30);
        
        ctx.restore();
    }

    if (player.hp > 0) requestAnimationFrame(gameLoop);
}

initEnvironment();
gameLoop();
