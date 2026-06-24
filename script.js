// --- BẢO VỆ GIAO DIỆN ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85)) { e.preventDefault(); }
});
document.addEventListener('touchmove', e => { if(e.scale !== 1) e.preventDefault(); }, { passive: false });

// --- BIẾN TOÀN CỤC ---
let tempMatchResult = { rankPoints: 0, kills: 0, gunPoints: 0, rank: 0 };
let playersData = [];

// Danh sách tên Bot để random
const botNamesList = [
    "FakerVN", "NoobMaster", "ProSniper", "ChickenLover", "DarkKnight", "ShadowNinja", "GhostRider", 
    "DragonSlayer", "IronMan", "Captain", "Thor", "Hulk", "BlackWidow", "Hawkeye", "Superman", 
    "Batman", "Flash", "Aquaman", "WonderWoman", "Cyborg", "Joker", "HarleyQuinn", "Thanos", 
    "Loki", "Ultron", "Venom", "Deadpool", "Wolverine", "Magneto", "ProfessorX", "Storm", 
    "JeanGrey", "Cyclops", "Beast", "Nightcrawler", "Rogue", "Gambit", "Iceman", "Colossus", 
    "KittyPryde", "EmmaFrost", "Mystique", "Sabretooth", "Juggernaut", "Toad", "Blob", "Pyro"
];

// --- KHỞI TẠO HOẶC TẢI DỮ LIỆU TỪ TRƯỚC ---
function loadData() {
    let savedData = localStorage.getItem('esports_game_data');
    let lastOnline = localStorage.getItem('esports_lastOnline');
    let now = Date.now();

    if (savedData) {
        playersData = JSON.parse(savedData);

        // --- CƠ CHẾ BÙ THỜI GIAN KHI THOÁT GAME ---
        if (lastOnline) {
            let offlineTimeMs = now - parseInt(lastOnline);
            let offlineCycles = Math.floor(offlineTimeMs / 5000); // Mỗi 5s offline = 1 nhịp game trôi qua

            if (offlineCycles > 0) {
                // Giới hạn số chu kỳ bù tối đa để trình duyệt không bị treo nếu người chơi nghỉ quá lâu
                if (offlineCycles > 10000) offlineCycles = 10000;
                for (let i = 0; i < offlineCycles; i++) {
                    simulateBots(false); // Chạy mô phỏng các bot tự bắn ngầm, không lưu giữa chừng
                }
            }
        }
    } else {
        initBots(); // Nếu là người chơi mới
    }

    saveData();
    updateMyStatsUI();
    renderLeaderboards();
}

// Khởi tạo 2000 Bot vào Server (Chỉ chạy 1 lần duy nhất cho tài khoản mới)
function initBots() {
    playersData = [
        { id: "me", name: "Lẻ Anh Bảy", rankPoints: 0, kills: 0, matches: 0, gunPoints: 0, top1: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lẻ Anh Bảy&backgroundColor=b6e3f4" }
    ];

    let shuffledNames = botNamesList.sort(() => 0.5 - Math.random());
    const bgColors = ['b6e3f4','c0aede','ffdfbf','d1d4f9','ffd5dc', 'ffc0cb', 'a0cecb'];

    for(let i = 1; i <= 2000; i++) {
        let baseName = shuffledNames[i % shuffledNames.length];
        // Thêm hậu tố số ngẫu nhiên để tên 2000 bot không bị trùng
        let botName = i > shuffledNames.length ? baseName + "_" + Math.floor(Math.random() * 9999) : baseName;
        
        playersData.push({
            id: "bot_" + i,
            name: botName,
            rankPoints: 0,
            kills: 0,
            matches: 0,
            gunPoints: 0,
            top1: 0, // Dữ liệu Top 1
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botName}&backgroundColor=${bgColors[Math.floor(Math.random() * bgColors.length)]}`
        });
    }
}

// Lưu mọi tiến trình xuống Local Storage
function saveData() {
    localStorage.setItem('esports_game_data', JSON.stringify(playersData));
    localStorage.setItem('esports_lastOnline', Date.now().toString());
}

// Cập nhật UI trong Hồ Sơ
function updateMyStatsUI() {
    let myData = playersData.find(p => p.id === "me");
    document.getElementById('my-matches').innerText = myData.matches;
    document.getElementById('my-kills').innerText = myData.kills;
    document.getElementById('my-gun-points').innerText = myData.gunPoints;
    document.getElementById('my-top1').innerText = myData.top1;
}

// --- LOGIC CHUYỂN TAB ---
function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- CƠ CHẾ TÍNH ĐIỂM ---
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

// --- RENDER BẢNG XẾP HẠNG THÔNG MINH ---
function renderLeaderboards() {
    const renderList = (id, sortKey, label) => {
        const ul = document.getElementById(id);
        if(!ul) return;
        
        // MẸO: Mặc dù có 2000 Bot nhưng ta chỉ render TOP 100 bằng slice(0, 100) để máy không bị lag giật
        let sorted = [...playersData].sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 100);
        
        // Tạo cấu trúc DOM lúc load lần đầu
        if (ul.children.length === 0) {
            sorted.forEach((p, index) => {
                let li = document.createElement("li");
                li.className = "animate-slide";
                li.style.animationDelay = `${index * 0.02}s`;
                ul.appendChild(li);
            });
        }
        
        // Update lại nội dung của đúng 100 elements (Rất nhẹ và nhanh)
        sorted.forEach((p, index) => {
            let li = ul.children[index];
            let rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : (index === 2 ? 'rank-3' : ''));
            if (p.id === "me") rankClass += " is-me";
            li.className = rankClass.trim() || 'normal-rank';

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
    renderList('list-top1', 'top1', 'Số Trận Top 1'); // Bảng mới
}

// --- HỆ THỐNG MÔ PHỎNG BOT TỰ ĐỘNG CHƠI (Tối ưu để chạy ngầm) ---
function simulateBots(isOnline = true) {
    // Giả lập 5 đến 15 trận đấu đang diễn ra ngầm cùng lúc
    let numMatches = Math.floor(Math.random() * 11) + 5; 
    
    for(let i = 0; i < numMatches; i++) {
        // 1. Chọn 1 bot đoạt Top 1
        let winnerIndex = Math.floor(Math.random() * 2000) + 1; // Random từ 1 đến 2000
        let winner = playersData[winnerIndex];
        if(!winner) continue;
        
        winner.top1 += 1;
        winner.matches += 1;
        winner.rankPoints += Math.floor(Math.random() * 10) + 15;
        winner.kills += Math.floor(Math.random() * 10) + 5;
        winner.gunPoints += Math.floor(Math.random() * 15) + 5;

        // 2. Chọn thêm một nhóm bot thua (cộng ít điểm hơn hoặc bị trừ điểm)
        let numLosers = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < numLosers; j++) {
            let loserIndex = Math.floor(Math.random() * 2000) + 1;
            let loser = playersData[loserIndex];
            if(!loser) continue;
            
            loser.matches += 1;
            loser.kills += Math.floor(Math.random() * 4);
            loser.rankPoints += Math.floor(Math.random() * 5) - 2; // Bắn kém bị trừ rank
            if (loser.rankPoints < 0) loser.rankPoints = 0;
            loser.gunPoints += Math.floor(Math.random() * 5);
        }
    }
    
    // Nếu đang chạy thực thì lưu và cập nhật giao diện
    if (isOnline) {
        saveData();
        if (document.getElementById('lobby-container').classList.contains('active')) {
            renderLeaderboards();
        }
    }
}

// Chạy mô phỏng vòng lặp game mỗi 5 giây
setInterval(() => simulateBots(true), 5000);

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

    // Lưu biến Rank lại để sử dụng cho việc cộng TOP 1
    tempMatchResult = { rankPoints: rankPts, kills: kills, gunPoints: gunPts, rank: rank };

    document.getElementById('stat-top').innerText = rank;
    document.getElementById('stat-kills').innerText = kills;
    document.getElementById('stat-rank-pts').innerText = (rankPts > 0 ? "+" : "") + rankPts;
    document.getElementById('stat-rank-pts').style.color = rankPts < 0 ? "#ef4444" : "#4ade80";
    document.getElementById('stat-gun-pts').innerText = "+" + gunPts;
}

// --- CẬP NHẬT LÊN BẢNG XẾP HẠNG & LƯU LẠI ---
function backToLobbyAndSave() {
    let myData = playersData.find(p => p.id === "me");
    myData.rankPoints += tempMatchResult.rankPoints;
    
    // Cấm để điểm Rank bị âm kịch sàn
    if (myData.rankPoints < 0) myData.rankPoints = 0; 

    myData.kills += tempMatchResult.kills;
    myData.gunPoints += tempMatchResult.gunPoints;
    myData.matches += 1;
    
    // Nếu hạng = 1 thì cộng thêm tổng số trận Top 1
    if (tempMatchResult.rank === 1) {
        myData.top1 += 1;
    }

    saveData(); // LƯU XUỐNG BỘ NHỚ LOCAL
    updateMyStatsUI();
    renderLeaderboards();

    document.getElementById('match-stats').classList.remove('active');
    document.getElementById('lobby-container').classList.add('active');
    
    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none'; zone.classList.remove('shrinking');
}

// --- CHẠY KHỞI TẠO LÚC VỪA MỞ TRANG LÊN ---
loadData();
