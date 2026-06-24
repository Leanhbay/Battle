// --- BẢO VỆ GIAO DIỆN ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85)) { e.preventDefault(); }
});
document.addEventListener('touchmove', e => { if(e.scale !== 1) e.preventDefault(); }, { passive: false });

// --- BIẾN TOÀN CỤC CHỨA INFO SAU TRẬN ĐỂ CẬP NHẬT ---
let tempMatchResult = { rankPoints: 0, kills: 0, gunPoints: 0 };

// --- DATA NGƯỜI CHƠI (Tích hợp Avatars) ---
let playersData = [
    { id: "me", name: "Lẻ Anh Bảy", rankPoints: 4500, kills: 542, matches: 120, gunPoints: 1150, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lẻ Anh Bảy&backgroundColor=b6e3f4" },
    { id: "p1", name: "FakerVN", rankPoints: 4800, kills: 610, matches: 150, gunPoints: 1300, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FakerVN&backgroundColor=c0aede" },
    { id: "p2", name: "NoobMaster", rankPoints: 3900, kills: 450, matches: 150, gunPoints: 900, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NoobMaster&backgroundColor=ffdfbf" },
    { id: "p3", name: "ProSniper", rankPoints: 4200, kills: 500, matches: 110, gunPoints: 1010, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProSniper&backgroundColor=d1d4f9" },
    { id: "p4", name: "ChickenLover", rankPoints: 3800, kills: 420, matches: 140, gunPoints: 850, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChickenLover&backgroundColor=ffd5dc" }
];

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
    
    // Mỗi kill cộng dồn thêm 1 điểm Rank
    return basePoints + kills;
}

function calculateGunPoints(rank, kills) {
    let base = kills * 2;
    if (rank === 1) return base + 3;
    if (rank === 2) return base + 2;
    if (rank === 3) return base + 1;
    return base;
}

// --- RENDER BẢNG XẾP HẠNG SIÊU ĐẸP ---
function renderLeaderboards() {
    const renderList = (id, sortKey, label) => {
        const ul = document.getElementById(id);
        ul.innerHTML = "";
        
        let sorted = [...playersData].sort((a, b) => b[sortKey] - a[sortKey]);
        
        sorted.forEach((p, index) => {
            let li = document.createElement("li");
            // Delay hoạt ảnh trượt vào để mượt mà hơn
            li.style.animationDelay = `${index * 0.1}s`;
            
            // Đánh dấu Top 1 2 3 và acc của tôi
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

    // Lưu tạm vào biến để lát cộng dồn
    tempMatchResult = { rankPoints: rankPts, kills: kills, gunPoints: gunPts };

    document.getElementById('stat-top').innerText = rank;
    document.getElementById('stat-kills').innerText = kills;
    document.getElementById('stat-rank-pts').innerText = (rankPts > 0 ? "+" : "") + rankPts;
    document.getElementById('stat-rank-pts').style.color = rankPts < 0 ? "#ef4444" : "#4ade80"; // Đỏ nếu trừ, xanh nếu cộng
    document.getElementById('stat-gun-pts').innerText = "+" + gunPts;
}

// --- CẬP NHẬT LÊN BẢNG XẾP HẠNG (THỜI GIAN THỰC) ---
function backToLobbyAndSave() {
    // 1. Cập nhật dữ liệu vào acc của mình
    let myData = playersData.find(p => p.id === "me");
    myData.rankPoints += tempMatchResult.rankPoints;
    myData.kills += tempMatchResult.kills;
    myData.gunPoints += tempMatchResult.gunPoints;
    myData.matches += 1;

    // 2. Cập nhật giao diện Profile
    document.getElementById('my-matches').innerText = myData.matches;
    document.getElementById('my-kills').innerText = myData.kills;
    document.getElementById('my-gun-points').innerText = myData.gunPoints;

    // 3. Render lại Bảng Xếp Hạng với dữ liệu mới
    renderLeaderboards();

    // 4. Đổi màn hình về sảnh
    document.getElementById('match-stats').classList.remove('active');
    document.getElementById('lobby-container').classList.add('active');
    
    // Reset bo thu
    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none'; zone.classList.remove('shrinking');

    // 5. Hiện thông báo (Toast)
    showToast("Đã lưu và cập nhật Bảng Xếp Hạng!");
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
