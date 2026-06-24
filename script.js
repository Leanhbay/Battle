// --- BẢO VỆ GIAO DIỆN ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85)) { e.preventDefault(); }
});
document.addEventListener('touchmove', e => { if(e.scale !== 1) e.preventDefault(); }, { passive: false });

// --- BIẾN TOÀN CỤC CHỨA INFO SAU TRẬN ĐỂ CẬP NHẬT ---
let tempMatchResult = { rankPoints: 0, kills: 0, gunPoints: 0 };

// --- DATA NGƯỜI CHƠI & KHỞI TẠO 1000 BOT (RESET VỀ 0 ĐỂ CÔNG BẰNG) ---
let playersData = [
    { id: "me", name: "Lẻ Anh Bảy", rankPoints: 0, kills: 0, matches: 0, gunPoints: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lẻ Anh Bảy&backgroundColor=b6e3f4" }
];

// Tạo kho tên ngẫu nhiên độc nhất (10 * 10 * 10 = 1000 tổ hợp tên không trùng)
const prefixes = ['SátThủ', 'Trùm', 'Vua', 'Kẻ', 'Thần', 'HuyềnThoại', 'ThợSăn', 'ChiếnBinh', 'LãngTử', 'CaoThủ'];
const roots = ['BắnTỉa', 'NúpBụi', 'ChạyBo', 'SinhTồn', 'LootĐồ', 'GánhTạ', 'CânTeam', 'BoDạo', 'BấtBại', 'HủyDiệt'];
const suffixes = ['VN', 'Pro', 'GG', 'Gaming', 'Top1', 'Solo', 'No1', '9x', '2k', 'Víp'];

let botCount = 1;
for (let p of prefixes) {
    for (let r of roots) {
        for (let s of suffixes) {
            let botName = `${p}${r}_${s}`;
            playersData.push({
                id: "bot_" + botCount,
                name: botName,
                rankPoints: 0,
                kills: 0,
                matches: 0,
                gunPoints: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botName}&backgroundColor=bfdbfe`
            });
            botCount++;
        }
    }
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

// --- RENDER BẢNG XẾP HẠNG SIÊU ĐẸP (GIỚI HẠN 50 BẬC) ---
function renderLeaderboards() {
    const renderList = (id, sortKey, label) => {
        const ul = document.getElementById(id);
        ul.innerHTML = "";
        
        // Sắp xếp và chỉ cắt lấy đúng TOP 50 người cao điểm nhất
        let sorted = [...playersData].sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 50);
        
        sorted.forEach((p, index) => {
            let li = document.createElement("li");
            // Rút ngắn thời gian delay animation để cuộn mượt và không bị lag khi render lại
            li.style.animationDelay = `${index * 0.01}s`;
            
            let rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : (index === 2 ? 'rank-3' : ''));
            if (p.id === "me") rankClass += " is-me";
            li.className = rankClass.trim();

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
            ul.appendChild(li);
        });
    };

    renderList('list-rank', 'rankPoints', 'Điểm Rank');
    renderList('list-kills', 'kills', 'Tổng Kills');
    renderList('list-matches', 'matches', 'Trận Chơi');
    renderList('list-gun', 'gunPoints', 'Điểm Súng');
}

// Chạy lần đầu
renderLeaderboards();

// --- MÔ PHỎNG BOT TỰ ĐỘNG CỘNG ĐIỂM NGẪU NHIÊN (1-15 ĐIỂM) TỪNG CHÚT MỘT ---
setInterval(() => {
    // Chọn ngẫu nhiên từ 2 đến 4 con bot hoàn thành trận đấu cùng lúc
    const botsActiveCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < botsActiveCount; i++) {
        // Lấy ngẫu nhiên vị trí bot trong mảng (bỏ qua vị trí index 0 của người chơi)
        let randomBotIndex = Math.floor(Math.random() * (playersData.length - 1)) + 1;
        let bot = playersData[randomBotIndex];

        // Cộng điểm ngẫu nhiên từ 1 đến 15 theo yêu cầu
        let pointsGained = Math.floor(Math.random() * 15) + 1;

        bot.rankPoints += pointsGained;
        bot.gunPoints += pointsGained;
        bot.kills += Math.max(1, Math.floor(pointsGained / 3)); // Kills tăng thực tế theo điểm số
        bot.matches += 1; // Tăng thêm 1 trận đấu
    }

    // Làm mới bảng xếp hạng theo thời gian thực
    renderLeaderboards();
}, 4000); // Cứ mỗi 4 giây sẽ có bot được cộng điểm, giúp BXH tăng tiến liên tục nhưng không quá nhanh.

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

// --- CẬP NHẬT LÊN BẢNG XẾP HẠNG (THỜI GIAN THỰC) ---
function backToLobbyAndSave() {
    let myData = playersData.find(p => p.id === "me");
    myData.rankPoints += tempMatchResult.rankPoints;
    // Điểm số của bạn không được âm dưới 0
    if(myData.rankPoints < 0) myData.rankPoints = 0;
    
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

    // Đã loại bỏ hoàn toàn việc gọi hàm showToast thông báo tại đây
}
