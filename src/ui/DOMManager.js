// src/ui/DOMManager.js

// Hàm hỗ trợ vẽ Pixel Art trực tiếp bằng CSS Box-Shadow
function getPixelArtHTML(matrix, palette, scale = 2) {
    let shadows = [];
    const h = matrix.length;
    const w = matrix[0].length;
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const char = matrix[r][c];
            if (char !== '0' && palette[char]) {
                shadows.push(`${c * scale}px ${r * scale}px 0 ${palette[char]}`);
            }
        }
    }
    return `<div style="width: ${scale}px; height: ${scale}px; box-shadow: ${shadows.join(', ')}; margin-right: ${(w-1) * scale}px; margin-bottom: ${(h-1) * scale}px;"></div>`;
}

// --- DỮ LIỆU PIXEL CHO CÁC ICON ---
const palSword = { '1': '#e2e8f0', '2': '#94a3b8', '3': '#475569', '4': '#8b4513', '5': '#f59e0b', '6': '#000000' };
const mSword = [
    "0000000000000666", "0000000000006126", "0000000000061126", "0000000000611260",
    "0000000006112600", "0000000061126000", "0000000611260000", "0000006112600000",
    "0000061126000000", "0000611260000000", "0006112666000000", "0062266444600000",
    "0666644464460000", "6126064606446000", "6260006000646000", "6600000000066000"
];

const palTrophy = { '1': '#fde047', '2': '#eab308', '6': '#000000' };
const mTrophy = [
    "0000000000000000", "0666666666666600", "6111111111111160", "6166666666666160",
    "6162221222226160", "6162222222226160", "0616222222226160", "0066222222226600",
    "0006622222266000", "0000662222660000", "0000066226600000", "0000006226000000",
    "0000666226660000", "0006222222226000", "0006666666666000", "0000000000000000"
];

const palChar = { '1': '#fcd34d', '2': '#f59e0b', '3': '#451a03', '4': '#1e3a8a', '6': '#000000' };
const mChar = [
    "0000066666600000", "0000633333360000", "0006333333336000", "0063331111333600",
    "0063311111133600", "0063161111613600", "0063111111113600", "0063111661113600",
    "0006111111116000", "0000611221160000", "0000061111600000", "0000646666460000",
    "0006444444446000", "0064444444444600", "0066666666666600", "0000000000000000"
];

const palChest = { '1': '#fcd34d', '2': '#854d0e', '3': '#451a03', '4': '#a8a29e', '5': '#d946ef', '6': '#000000', '7': '#0ea5e9' };
const mChest = [
    "0000000000000000", "0006666666666000", "0064444444444600", "0642222222222460",
    "0642233333322460", "6443355775533446", "6443355775533446", "6666666666666666",
    "6111116666111116", "6122216116122216", "6122216116122216", "6122216666122216",
    "6111111111111116", "6666666666666666", "0000000000000000", "0000000000000000"
];

const palShield = { '1': '#94a3b8', '2': '#475569', '3': '#1e293b' };
const mShield = [
    "033333333330", "311111111113", "312222222213", "312222222213",
    "312222222213", "312222222213", "031222222130", "031122221130",
    "003112211300", "000311113000", "000031130000", "000003300000"
];

export function setupDOM(callbacks) {
    const { onStartClick, onReturnClick, getPlayer, getSfx } = callbacks;

    if(!document.getElementById('pixel-font')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'pixel-font';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        #action-controls .d-btn, #btn-use-grenade, #btn-attack, #action-controls button, #action-controls div {
            width: 60px !important; height: 60px !important; border-radius: 50% !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            padding: 0 !important; margin: 0 5px !important; box-sizing: border-box !important;
        }
        #action-controls {
            display: flex !important; flex-direction: row !important; gap: 5px !important; width: max-content !important;
        }

        .game-lobby-wrapper {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at center, rgba(32,40,56,0.85) 0%, rgba(15,20,28,0.98) 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 9999; font-family: 'Press Start 2P', cursive; color: white;
            overflow: hidden;
        }

        .ambient-sparks { position: absolute; width: 100%; height: 100%; pointer-events: none; }
        .spark { position: absolute; background: #fde462; width: 4px; height: 4px; box-shadow: 0 0 10px #d95726; animation: float-up 3s linear infinite; }
        @keyframes float-up { 0% { transform: translateY(100vh) scale(1); opacity: 1; } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }

        .pixel-frame-modal {
            position: relative; background: #202532;
            border: 6px solid #4a5462; border-radius: 4px;
            padding: 70px 40px 40px 40px; 
            box-shadow: inset 0 0 0 4px #151922, inset 0 0 0 8px #31384a, 0 15px 40px rgba(0,0,0,0.8), 0 0 0 6px #111;
            display: flex; flex-direction: column; gap: 25px; 
            width: 650px; max-width: 92%;
        }
        
        .pixel-frame-modal::before {
            content: ''; position: absolute; top: 16px; left: 16px; right: 16px; bottom: 16px;
            border: 2px dashed #4a5462; pointer-events: none; opacity: 0.5;
        }

        .corner-shield { position: absolute; width: 24px; height: 24px; z-index: 10; }
        .cs-tl { top: -12px; left: -12px; }
        .cs-tr { top: -12px; right: -12px; }
        .cs-bl { bottom: -12px; left: -12px; }
        .cs-br { bottom: -12px; right: -12px; }

        .frame-header {
            position: absolute; top: -45px; left: 50%; transform: translateX(-50%);
            display: flex; flex-direction: column; align-items: center; z-index: 20;
        }
        .main-title-text {
            font-size: 42px; margin: 0;
            background: linear-gradient(to bottom, #fde462 45%, #d89617 55%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            filter: drop-shadow(3px 3px 0px #3b1c0a) drop-shadow(-2px -2px 0px #3b1c0a) drop-shadow(2px -2px 0px #3b1c0a) drop-shadow(-2px 2px 0px #3b1c0a);
            line-height: 1.1; letter-spacing: 1px; white-space: nowrap;
        }
        .sub-title-ribbon {
            background: #d11124; color: #fde462; font-size: 16px; padding: 8px 24px;
            border: 3px solid #3b1c0a; box-shadow: inset 0 -4px 0 rgba(0,0,0,0.3);
            margin-top: -6px; border-radius: 4px; white-space: nowrap;
        }

        .btn-pixel-art {
            font-family: 'Press Start 2P', cursive; color: #fff; border: none;
            position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; 
            border-radius: 6px; outline: 4px solid #111; transition: transform 0.1s, filter 0.2s;
        }
        .btn-pixel-art:active { transform: translateY(4px); }

        .btn-matchmaking {
            background: #d94221; padding: 15px 45px; width: max-content; margin: 0 auto; gap: 15px;
            box-shadow: inset -4px -8px 0px rgba(100,20,10,0.6), inset 4px 4px 0px rgba(255,150,50,0.5), 0 6px 0 #111;
        }
        .btn-matchmaking span { font-size: 24px; color: #fde462; text-shadow: 3px 3px 0 #5c1811; }
        .btn-matchmaking:active { box-shadow: inset -4px -4px 0px rgba(100,20,10,0.6), inset 4px 4px 0px rgba(255,150,50,0.5), 0 3px 0 #111; }

        .action-row { display: flex; justify-content: space-between; gap: 15px; width: 100%; }
        .btn-sub { flex: 1; padding: 12px 15px; gap: 10px; }
        .btn-sub span { line-height: 1.4; font-size: 11px; text-shadow: 2px 2px 0 #000; text-align: left; }
        
        .btn-blue { background: #1ea7e1; box-shadow: inset -4px -6px 0px rgba(10,80,120,0.6), inset 4px 4px 0px rgba(100,200,255,0.5), 0 6px 0 #111; }
        .btn-blue:active { box-shadow: inset -4px -4px 0px rgba(10,80,120,0.6), inset 4px 4px 0px rgba(100,200,255,0.5), 0 3px 0 #111; }
        
        .btn-green { background: #4caf50; box-shadow: inset -4px -6px 0px rgba(30,100,40,0.6), inset 4px 4px 0px rgba(130,220,140,0.5), 0 6px 0 #111; }
        .btn-green:active { box-shadow: inset -4px -4px 0px rgba(30,100,40,0.6), inset 4px 4px 0px rgba(130,220,140,0.5), 0 3px 0 #111; }
        
        .btn-yellow { background: #f1c40f; box-shadow: inset -4px -6px 0px rgba(150,110,10,0.6), inset 4px 4px 0px rgba(255,230,100,0.5), 0 6px 0 #111; }
        .btn-yellow:active { box-shadow: inset -4px -4px 0px rgba(150,110,10,0.6), inset 4px 4px 0px rgba(255,230,100,0.5), 0 3px 0 #111; }

        .icon-box { position: relative; display: flex; align-items: center; justify-content: center; }
    `;
    document.head.appendChild(style);

    const lobbyDiv = document.createElement('div');
    lobbyDiv.id = 'game-lobby-screen';
    lobbyDiv.className = 'game-lobby-wrapper';
    
    let sparksHtml = '';
    for(let i=0; i<15; i++) {
        let left = Math.random() * 100; let delay = Math.random() * 3; let dur = 2 + Math.random() * 2;
        sparksHtml += `<div class="spark" style="left: ${left}%; animation-delay: ${delay}s; animation-duration: ${dur}s;"></div>`;
    }

    lobbyDiv.innerHTML = `
        <div class="ambient-sparks">${sparksHtml}</div>
        <div class="pixel-frame-modal">
            <div class="corner-shield cs-tl">${getPixelArtHTML(mShield, palShield, 2)}</div>
            <div class="corner-shield cs-tr">${getPixelArtHTML(mShield, palShield, 2)}</div>
            <div class="corner-shield cs-bl">${getPixelArtHTML(mShield, palShield, 2)}</div>
            <div class="corner-shield cs-br">${getPixelArtHTML(mShield, palShield, 2)}</div>

            <div class="frame-header">
                <h1 class="main-title-text">BATTLE LEGENDS</h1>
                <div class="sub-title-ribbon">PIXEL WAR</div>
            </div>

            <button id="btn-start-match" class="btn-pixel-art btn-matchmaking">
                <div class="icon-box" style="width:36px; height:36px;">
                    <div style="position:absolute; top:0; left:0; transform: rotate(45deg);">${getPixelArtHTML(mSword, palSword, 2.2)}</div>
                    <div style="position:absolute; top:0; left:0; transform: rotate(-45deg) scaleY(-1);">${getPixelArtHTML(mSword, palSword, 2.2)}</div>
                </div>
                <span>GHÉP TRẬN</span>
            </button>

            <div class="action-row">
                <button class="btn-pixel-art btn-sub btn-blue">
                    <div class="icon-box">${getPixelArtHTML(mTrophy, palTrophy, 2)}</div>
                    <span>BẢNG<br>XẾP HẠNG</span>
                </button>
                <button class="btn-pixel-art btn-sub btn-green">
                    <div class="icon-box">${getPixelArtHTML(mChar, palChar, 2)}</div>
                    <span>THAY<br>NHÂN VẬT</span>
                </button>
                <button class="btn-pixel-art btn-sub btn-yellow">
                    <div class="icon-box">${getPixelArtHTML(mChest, palChest, 2)}</div>
                    <span>SHOP<br>GIAO DỊCH</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(lobbyDiv);

    const matchEndDiv = document.createElement('div');
    matchEndDiv.id = 'game-end-screen';
    matchEndDiv.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(11, 17, 30, 0.92); display:none; flex-direction:column; align-items:center; justify-content:center; z-index:9998; font-family:'Press Start 2P', cursive; color:white;`;
    matchEndDiv.innerHTML = `
        <h1 id="end-match-status" style="font-size: 32px; margin-bottom: 20px; text-shadow: 4px 4px 0px #000; line-height: 1.5; text-align: center;"></h1>
        <p id="end-match-stats" style="font-size: 14px; color: #cbd5e1; margin-bottom: 35px; line-height: 2; text-shadow: 2px 2px 0px #000; text-align: center;"></p>
        <button id="btn-return-lobby" class="btn-pixel-art btn-matchmaking" style="font-size: 18px; padding: 12px 35px;">
            <span style="font-size: 18px;">THOÁT RA SẢNH</span>
        </button>
    `;
    document.body.appendChild(matchEndDiv);

    // --- LOGIC ĐẾM NGƯỢC RANDOM KHI GHÉP TRẬN ---
    const btnStartMatch = document.getElementById('btn-start-match');
    const spanStartText = btnStartMatch.querySelector('span');
    let isMatching = false; // Cờ khóa nút chống spam

    btnStartMatch.addEventListener('click', () => {
        if (isMatching) return; // Đang tìm trận rồi thì không bấm được nữa
        isMatching = true;
        
        if (getSfx) getSfx().play('pickup'); // Âm thanh click
        
        let waitTime = Math.floor(Math.random() * 9) + 1; // Random từ 1 đến 9 giây
        spanStartText.style.fontSize = '18px'; // Thu nhỏ chữ lại một xíu cho vừa chữ ĐANG TÌM
        spanStartText.innerText = `ĐANG TÌM: ${waitTime}S`;
        btnStartMatch.style.filter = 'brightness(0.8)'; // Làm tối nút đi 1 chút thể hiện đang chờ
        btnStartMatch.style.cursor = 'wait'; // Đổi icon chuột

        const timer = setInterval(() => {
            waitTime--;
            if (waitTime <= 0) {
                clearInterval(timer);
                isMatching = false;
                
                // Khôi phục lại UI của nút như cũ
                spanStartText.style.fontSize = '24px';
                spanStartText.innerText = `GHÉP TRẬN`;
                btnStartMatch.style.filter = 'none';
                btnStartMatch.style.cursor = 'pointer';
                
                // Gọi hàm vào game
                onStartClick();
            } else {
                spanStartText.innerText = `ĐANG TÌM: ${waitTime}S`;
            }
        }, 1000);
    });

    document.getElementById('btn-return-lobby').addEventListener('click', onReturnClick);

    setTimeout(() => {
        const actionControls = document.getElementById('action-controls');
        if (actionControls) {
            if (!document.getElementById('btn-scope')) {
                const scopeBtn = document.createElement('div'); scopeBtn.id = 'btn-scope'; scopeBtn.className = 'd-btn';
                scopeBtn.style.backgroundColor = 'rgba(41, 128, 185, 0.4)'; scopeBtn.style.borderColor = '#2980b9';
                scopeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:55%; height:55%; fill:none; stroke:white; stroke-width:2;"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>`;
                actionControls.appendChild(scopeBtn);
                scopeBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); getPlayer().isAiming = !getPlayer().isAiming; getSfx().play('pickup'); });
            }
            if (!document.getElementById('btn-reload')) {
                const reloadBtn = document.createElement('div'); reloadBtn.id = 'btn-reload'; reloadBtn.className = 'd-btn';
                reloadBtn.style.backgroundColor = 'rgba(243, 156, 18, 0.4)'; reloadBtn.style.borderColor = '#f39c12';
                reloadBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:55%; height:55%; fill:none; stroke:white; stroke-width:2.5; stroke-linecap:round;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`;
                actionControls.appendChild(reloadBtn);
                reloadBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (!getPlayer().isReloading) getPlayer().startReload(); });
            }
            if (!document.getElementById('btn-prone')) {
                const proneBtn = document.createElement('div'); proneBtn.id = 'btn-prone'; proneBtn.className = 'd-btn';
                proneBtn.style.backgroundColor = 'rgba(46, 204, 113, 0.4)'; proneBtn.style.borderColor = '#27ae60';
                proneBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:60%; height:60%; fill:none; stroke:white; stroke-width:2.5; stroke-linecap:round;"><path d="M2 20h20M5 16h8l4-4h4M9 16v-4m-4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`;
                actionControls.appendChild(proneBtn);
                proneBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); const p = getPlayer(); if ((!p.kbTimer || p.kbTimer <= 0) && p.health > 0) { p.isProne = !p.isProne; getSfx().play('pickup'); } });
            }
        }
    }, 100);

    return { lobbyDiv, matchEndDiv };
}
