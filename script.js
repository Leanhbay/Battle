/* ========================================================
   1. BẢO VỆ GIAO DIỆN (CHỐNG CHUỘT PHẢI, TRƯỢT, PHÓNG TO)
   ======================================================== */
document.addEventListener('contextmenu', event => event.preventDefault()); // Chống chuột phải
document.addEventListener('keydown', function(event) {
    // Chống F12, Ctrl+Shift+I, Ctrl+U
    if (event.keyCode == 123 || 
       (event.ctrlKey && event.shiftKey && event.keyCode == 73) || 
       (event.ctrlKey && event.keyCode == 85)) {
        event.preventDefault();
    }
});
// Chống trượt vuốt (pull-to-refresh) trên mobile
document.addEventListener('touchmove', function(event) {
    if(event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

/* ========================================================
   2. LOGIC CHUYỂN TAB SẢNH GAME
   ======================================================== */
function switchTab(tabId) {
    // Xóa active ở tất cả các nút
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    // Thêm active vào nút được click
    event.target.classList.add('active');
    
    // Cập nhật nội dung hiển thị
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

/* ========================================================
   3. CƠ CHẾ TÍNH ĐIỂM (Cập nhật 1 Kill = +1 Điểm Rank)
   ======================================================== */
function calculateRankPoints(rank, kills) {
    let basePoints = 0; // Điểm hạng cơ bản

    if (rank === 1) basePoints = 20;
    else if (rank === 2) basePoints = 15;
    else if (rank === 3) basePoints = 10;
    else if (rank === 4) basePoints = 8;
    else if (rank === 5) basePoints = 5;
    else if (rank >= 6 && rank <= 15) basePoints = 1;
    else if (rank >= 16 && rank <= 21) basePoints = 0; // "từ top 15 đến 21 không cộng"
    else if (rank >= 22 && rank <= 30) basePoints = -5;
    else if (rank >= 31 && rank <= 40) basePoints = -10;
    else if (rank >= 41 && rank <= 50) basePoints = -25;

    // Tổng điểm Rank = Điểm hạng cơ bản + Số kill
    return basePoints + kills;
}

function calculateGunPoints(rank, kills) {
    let baseGunPoints = kills * 2; // 1 mạng = 2 điểm súng
    let bonus = 0;
    if (rank === 1) bonus = 3;
    if (rank === 2) bonus = 2;
    if (rank === 3) bonus = 1;
    return baseGunPoints + bonus;
}

/* ========================================================
   4. RENDER BẢNG XẾP HẠNG (DỮ LIỆU MẪU)
   ======================================================== */
const mockPlayers = [
    { name: "Lẻ Anh Bảy", rankPoints: 4500, kills: 542, matches: 120, gunPoints: 1150 },
    { name: "ProSniper99", rankPoints: 4200, kills: 500, matches: 110, gunPoints: 1010 },
    { name: "NoobMaster", rankPoints: 3900, kills: 450, matches: 150, gunPoints: 900 },
    { name: "ChickenLover", rankPoints: 3800, kills: 420, matches: 140, gunPoints: 850 },
    { name: "GodOfWar", rankPoints: 3500, kills: 380, matches: 100, gunPoints: 780 }
];

function renderLeaderboards() {
    const renderList = (id, sortKey, label) => {
        const ul = document.getElementById(id);
        ul.innerHTML = "";
        let sorted = [...mockPlayers].sort((a, b) => b[sortKey] - a[sortKey]);
        sorted.forEach((p, index) => {
            let li = document.createElement("li");
            li.innerHTML = `<span>#${index + 1} - ${p.name}</span> <span>${p[sortKey]} ${label}</span>`;
            ul.appendChild(li);
        });
    };

    renderList('list-rank', 'rankPoints', 'Điểm');
    renderList('list-kills', 'kills', 'Kills');
    renderList('list-matches', 'matches', 'Trận');
    renderList('list-gun', 'gunPoints', 'Điểm Súng');
}
renderLeaderboards();

/* ========================================================
   5. LUỒNG TRẠNG THÁI TRẬN ĐẤU
   ======================================================== */
function startGame() {
    document.getElementById('lobby-container').classList.remove('active');
    document.getElementById('game-container').classList.add('active');
}

function backToLobby() {
    document.getElementById('match-stats').classList.remove('active');
    document.getElementById('lobby-container').classList.add('active');
    
    // Reset bo thu nếu đang bật
    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none';
    zone.classList.remove('shrinking');
}

/* ========================================================
   6. HOẠT ẢNH BO THU (PUBG ZONE)
   ======================================================== */
function triggerZoneShrink() {
    const zone = document.getElementById('blue-zone');
    zone.style.display = 'block';
    
    // Đợi 1 chút để DOM cập nhật rồi mới bắt đầu thu hẹp
    setTimeout(() => {
        zone.classList.add('shrinking');
    }, 100);
}

/* ========================================================
   7. HOẠT ẢNH TOP 1 & HIỂN THỊ BẢNG THỐNG KÊ
   ======================================================== */
function triggerTop1(rank, kills) {
    if (rank === 1) {
        const animBox = document.getElementById('top1-animation');
        const text = animBox.querySelector('.chicken-dinner');
        
        animBox.style.display = 'flex';
        text.classList.add('show');

        // Đợi 5 giây sau đó ẩn hoạt ảnh và hiện bảng thống kê
        setTimeout(() => {
            animBox.style.display = 'none';
            text.classList.remove('show');
            showStats(rank, kills);
        }, 5000);
    } else {
        // Nếu không phải top 1, chuyển sang thẳng bảng thống kê
        showStats(rank, kills);
    }
}

function showStats(rank, kills) {
    document.getElementById('game-container').classList.remove('active');
    document.getElementById('match-stats').classList.add('active');

    let rankPts = calculateRankPoints(rank, kills);
    let gunPts = calculateGunPoints(rank, kills);

    document.getElementById('stat-top').innerText = rank;
    document.getElementById('stat-kills').innerText = kills;
    document.getElementById('stat-rank-pts').innerText = (rankPts > 0 ? "+" : "") + rankPts;
    document.getElementById('stat-gun-pts').innerText = "+" + gunPts;
}
