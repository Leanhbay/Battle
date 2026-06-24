// --- BẢO VỆ GIAO DIỆN ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85)) { e.preventDefault(); }
});
document.addEventListener('touchmove', e => { if(e.scale !== 1) e.preventDefault(); }, { passive: false });

// --- BIẾN TOÀN CỤC CHỨA INFO SAU TRẬN ĐỂ CẬP NHẬT ---
let tempMatchResult = { rankPoints: 0, kills: 0, gunPoints: 0 };

// --- DATA NGƯỜI CHƠI (Tất cả điểm số đều Reset về 0) ---
let playersData = [
    { id: "me", name: "Lẻ Anh Bảy", rankPoints: 0, kills: 0, matches: 0, gunPoints: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lẻ Anh Bảy&backgroundColor=b6e3f4" }
];

// Danh sách tên Bot để random không bị trùng lặp
const botNamesList = [
    "FakerVN", "NoobMaster", "ProSniper", "ChickenLover", "DarkKnight", "ShadowNinja", "GhostRider", 
    "DragonSlayer", "IronMan", "Captain", "Thor", "Hulk", "BlackWidow", "Hawkeye", "Superman", 
    "Batman", "Flash", "Aquaman", "WonderWoman", "Cyborg", "Joker", "HarleyQuinn", "Thanos", 
    "Loki", "Ultron", "Venom", "Deadpool", "Wolverine", "Magneto", "ProfessorX", "Storm", 
    "JeanGrey", "Cyclops", "Beast", "Nightcrawler", "Rogue", "Gambit", "Iceman", "Colossus", 
    "KittyPryde", "EmmaFrost", "Mystique", "Sabretooth", "Juggernaut", "Toad", "Blob", "Pyro", 
    "Avalanche", "Gosu", "Kuroky", "Miracle", "Topson", "Ana", "Dendi", "Puppey"
];

// Trộn mảng tên Bot ngẫu nhiên
let shuffledNames = botNamesList.sort(() => 0.5 - Math.random());
const bgColors = ['b6e3f4','c0aede','ffdfbf','d1d4f9','ffd5dc', 'ffc0cb', 'a0cecb'];

// Khởi tạo 49 Bot vào Server
for(let i = 0; i < 49; i++) {
    playersData.push({
        id: "bot_" + i,
        name: shuffledNames[i] || ("Bot_" + i),
        rankPoints: 0,
        kills: 0,
        matches: 0,
        gunPoints: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffledNames[i]}&backgroundColor=${bgColors[Math.floor(Math.random() * bgColors.length)]}`
    });
}

// --- LOGIC CHUYỂN TAB ---
function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- CƠ CHẾ TÍNH ĐIỂM HOÀN THIỆN ---
function calculateRankPoints(rank, kills) {
    let basePoints = 0;
    if (rank === 1) basePoints = 20;
    else if (rank === 2) basePoints = 15;
    else if (rank === 3) basePoints = 10;
    else if (rank === 4) basePoints = 8;
    else if (rank === 5) basePoints = 5;
    else if (rank >= 6 && rank <= 15) basePoints = 1;
    else if (rank >= 16 && rank <= 21) basePoints = 0;
    else if (rank >= 22 && rank <= 30) basePoints = -5;
    else if (rank >= 31 && rank <= 40) basePoints = -10;
    else if (rank >= 41 && rank <= 50) basePoints = -25;
    
    return basePoints + kills;
}

function calculateGunPoints(rank, kills) {
    let base = kills * 2;
    if (rank === 1) return base + 3;
    if (rank === 2) return base + 2;
    if (rank === 3) return base + 1;
    return base;
}

// --- RENDER BẢNG XẾP HẠNG THÔNG MINH (Không bị giật mất thanh cuộn) ---
function renderLeaderboards() {
    const renderList = (id, sortKey, label) => {
        const ul = document.getElementById(id);
        let sorted = [...playersData].sort((a, b) => b[sortKey] - a[sortKey]);
        
        // Cập nhật DOM khéo léo để không làm mất Scroll
        if (ul.children.length === 0) {
            sorted.forEach((p, index) => {
                let li = document.createElement("li");
                li.className = "animate-slide";
                li.style.animationDelay = `${index * 0.02}s`;
                ul.appendChild(li);
            });
        }
        
        sorted.forEach((p, index) => {
            let li = ul.children[index];
            let rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : (index === 2 ? 'rank-3' : ''));
            if (p.id === "me") rankClass += " is-me";
            li.className = rankClass.trim() || 'normal-rank'; // Cập nhật Class mới nhất

            li.innerHTML = `
                <div class="player-info">
                    <div class="rank-number">#${index + 1}</div>
                    <img src="${p.avatar}" class="player-avatar">
                    <span class="player-name">${p.name}</span>
                </div>
                <div class="player-score">
                    <span class="score-value">${p[sortKey]}</span>
                    <span class="score-label">${label}</span>
                </div>
            `;
        });
    };

    renderList('list-rank', 'rankPoints', 'Điểm Rank');
    renderList('list-kills', 'kills', 'Tổng Kills');
    renderList('list-matches', 'matches', 'Trận Chơi');
    renderList('list-gun', 'gunPoints', 'Điểm Súng');
}

// Chạy lần đầu
renderLeaderboards();

// --- SIMULATE SERVER (Bot chơi tự động cạnh tranh BXH) ---
setInterval(() => {
    // Giả lập 2 đến 5 Bot tham gia xong trận mỗi 5 giây
    let numBots = Math.floor(Math.random() * 4) + 2; 
    for(let i = 0; i < numBots; i++) {
        let randomBotIndex = Math.floor(Math.random() * 49) + 1; // Từ 1 đến 49 (bỏ qua 'me' ở index 0)
        let bot = playersData[randomBotIndex];
        
        // Bot nhận điểm ngẫu nhiên từ 1 - 15
        bot.rankPoints += Math.floor(Math.random() * 15) + 1;
        bot.kills += Math.floor(Math.random() * 15) + 1;
        bot.gunPoints += Math.floor(Math.random() * 15) + 1;
        bot.matches += 1;
    }
    
    // Nếu đang đứng ở Sảnh thì Render lại bảng ngay để thấy Bot leo rank
    if (document.getElementById('lobby-container').classList.contains('active')) {
        renderLeaderboards();
    }
}, 5000); // 5000 ms = mỗi 5 giây cộng điểm cho vài Bot

// --- LOGIC TRẬN ĐẤU & LƯU THỐNG KÊ ---
function startGame() {
    document.getElementById('lobby-container').classList.remove('active');
    document.getElementById('game-container').classList.add('active');
}

function triggerZoneShrink() {
    const zone = document.getElementById('blue-zone');
    zone.style.display = 'block';
    setTimeout(() => zone.classList.add('shrinking'), 100);
}

function triggerTop1(rank, kills) {
    if (rank === 1) {
        const animBox = document.getElementById('top1-animation');
        const text = animBox.querySelector('.chicken-dinner');
        animBox.style.display = 'flex';
        text.classList.add('show');
        setTimeout(() => {
            animBox.style.display = 'none';
            text.classList.remove('show');
            showStats(rank, kills);
        }, 4000);
    } else {
        showStats(rank, kills);
    }
}

function showStats(rank, kills) {
    document.getElementById('game-container').classList.remove('active');
    document.getElementById('match-stats').classList.add('active');

    let rankPts = calculateRankPoints(rank, kills);
    let gunPts = calculateGunPoints(rank, kills);

    tempMatchResult = { rankPoints: rankPts, kills: kills, gunPoints: gunPts };

    document.getElementById('stat-top').innerText = rank;
    document.getElementById('stat-kills').innerText = kills;
    document.getElementById('stat-rank-pts').innerText = (rankPts > 0 ? "+" : "") + rankPts;
    document.getElementById('stat-rank-pts').style.color = rankPts < 0 ? "#ef4444" : "#4ade80";
    document.getElementById('stat-gun-pts').innerText = "+" + gunPts;
}

// --- CẬP NHẬT LÊN BẢNG XẾP HẠNG ---
function backToLobbyAndSave() {
    let myData = playersData.find(p => p.id === "me");
    myData.rankPoints += tempMatchResult.rankPoints;
    
    // Cấm để điểm Rank bị âm kịch sàn quá mức
    if (myData.rankPoints < 0) myData.rankPoints = 0; 

    myData.kills += tempMatchResult.kills;
    myData.gunPoints += tempMatchResult.gunPoints;
    myData.matches += 1;

    document.getElementById('my-matches').innerText = myData.matches;
    document.getElementById('my-kills').innerText = myData.kills;
    document.getElementById('my-gun-points').innerText = myData.gunPoints;

    renderLeaderboards();

    document.getElementById('match-stats').classList.remove('active');
    document.getElementById('lobby-container').classList.add('active');
    
    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none'; zone.classList.remove('shrinking');
}
