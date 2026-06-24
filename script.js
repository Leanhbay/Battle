// --- CẤU HÌNH 9 BẬC RANK & ĐIỂM ---
const RANK_SYSTEM = [
    { name: "Gỗ 1", min: 0, max: 499, cssClass: "wood", textClass: "wood-text", tierName: "Gỗ" },
    { name: "Gỗ 2", min: 500, max: 999, cssClass: "wood", textClass: "wood-text", tierName: "Gỗ" },
    { name: "Gỗ 3", min: 1000, max: 1499, cssClass: "wood", textClass: "wood-text", tierName: "Gỗ" },
    { name: "Đá 1", min: 1500, max: 1999, cssClass: "stone", textClass: "stone-text", tierName: "Đá" },
    { name: "Đá 2", min: 2000, max: 2499, cssClass: "stone", textClass: "stone-text", tierName: "Đá" },
    { name: "Đá 3", min: 2500, max: 2999, cssClass: "stone", textClass: "stone-text", tierName: "Đá" },
    { name: "Đá 4", min: 3000, max: 3499, cssClass: "stone", textClass: "stone-text", tierName: "Đá" },
    { name: "Sắt 1", min: 3500, max: 3999, cssClass: "iron", textClass: "iron-text", tierName: "Sắt" },
    { name: "Sắt 2", min: 4000, max: 4499, cssClass: "iron", textClass: "iron-text", tierName: "Sắt" },
    { name: "Sắt 3", min: 4500, max: 4999, cssClass: "iron", textClass: "iron-text", tierName: "Sắt" },
    { name: "Sắt 4", min: 5000, max: 5499, cssClass: "iron", textClass: "iron-text", tierName: "Sắt" },
    { name: "Sắt 5", min: 5500, max: 5999, cssClass: "iron", textClass: "iron-text", tierName: "Sắt" },
    { name: "Vàng 1", min: 6000, max: 6499, cssClass: "gold", textClass: "gold-text", tierName: "Vàng" },
    { name: "Vàng 2", min: 6500, max: 6999, cssClass: "gold", textClass: "gold-text", tierName: "Vàng" },
    { name: "Vàng 3", min: 7000, max: 7999, cssClass: "gold", textClass: "gold-text", tierName: "Vàng" },
    { name: "Kim Cương 1", min: 8000, max: 8999, cssClass: "diamond", textClass: "diamond-text", tierName: "Kim Cương" },
    { name: "Kim Cương 2", min: 9000, max: 9999, cssClass: "diamond", textClass: "diamond-text", tierName: "Kim Cương" },
    { name: "Kim Cương 3", min: 10000, max: 11999, cssClass: "diamond", textClass: "diamond-text", tierName: "Kim Cương" },
    { name: "Cao Thủ 1", min: 12000, max: 12999, cssClass: "master", textClass: "master-text", tierName: "Cao Thủ" },
    { name: "Cao Thủ 2", min: 13000, max: 13999, cssClass: "master", textClass: "master-text", tierName: "Cao Thủ" },
    { name: "Cao Thủ 3", min: 14000, max: 14999, cssClass: "master", textClass: "master-text", tierName: "Cao Thủ" },
    { name: "Đại Cao Thủ", min: 15000, max: 19999, cssClass: "grandmaster", textClass: "grandmaster-text", tierName: "Đại Cao Thủ" },
    { name: "Chuyên Nghiệp", min: 20000, max: 29999, cssClass: "pro", textClass: "pro-text", tierName: "Chuyên Nghiệp" },
    { name: "Kiện Tướng Chuyên Nghiệp", min: 30000, max: 1000000, cssClass: "pro-master", textClass: "pro-master-text", tierName: "Kiện Tướng" }
];

// Hàm xác định Rank dựa trên điểm
function getRankInfo(points) {
    if (points > 1000000) points = 1000000;
    for (let i = 0; i < RANK_SYSTEM.length; i++) {
        if (points >= RANK_SYSTEM[i].min && points <= RANK_SYSTEM[i].max) {
            return { ...RANK_SYSTEM[i], index: i };
        }
    }
    return { ...RANK_SYSTEM[RANK_SYSTEM.length - 1], index: RANK_SYSTEM.length - 1 };
}

// Hàm chạy hiệu ứng tăng số điểm mềm mại
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- CẬP NHẬT GIAO DIỆN HỒ SƠ ---
function updateMyStatsUI(oldRankPoints = null) {
    let myData = playersData.find(p => p.id === "me");
    let currentPoints = myData.rankPoints;
    
    // Cập nhật các thông số cũ
    document.getElementById('my-matches').innerText = myData.matches;
    document.getElementById('my-kills').innerText = myData.kills;
    document.getElementById('my-gun-points').innerText = myData.gunPoints;
    document.getElementById('my-top1').innerText = myData.top1;

    // Phân tích Rank
    let rankInfo = getRankInfo(currentPoints);
    let badge = document.getElementById('my-rank-badge');
    let title = document.getElementById('my-rank-name');
    let barFill = document.getElementById('rank-progress-fill');
    
    // Thay đổi CSS class cho badge & text
    badge.className = `rank-badge ${rankInfo.cssClass}`;
    title.className = `rank-title ${rankInfo.textClass}`;
    title.innerText = rankInfo.name;

    // Tính toán thanh tiến trình
    let range = rankInfo.max - rankInfo.min;
    let pointInRank = currentPoints - rankInfo.min;
    let percent = (pointInRank / range) * 100;
    
    if(currentPoints >= 1000000) percent = 100; // MAX

    barFill.style.width = percent + '%';
    document.getElementById('next-rank-points').innerText = currentPoints >= 1000000 ? "MAX" : rankInfo.max + 1;

    // Hoạt ảnh số điểm nếu có thay đổi
    let pointText = document.getElementById('current-points-anim');
    if (oldRankPoints !== null && oldRankPoints !== currentPoints) {
        animateValue(pointText, oldRankPoints, currentPoints, 1500);
        
        // Hiển thị floater (Ví dụ: +15 điểm)
        let floater = document.getElementById('point-floater');
        let diff = currentPoints - oldRankPoints;
        floater.innerText = (diff > 0 ? "+" : "") + diff;
        floater.style.color = diff > 0 ? "#4ade80" : "#ef4444";
        
        floater.classList.remove('animate');
        void floater.offsetWidth; // Trigger reflow
        floater.classList.add('animate');
    } else {
        pointText.innerText = currentPoints;
    }
}

// --- CẬP NHẬT HÀM BACKTOLOBBY LƯU KẾT QUẢ ---
function backToLobbyAndSave() {
    let myData = playersData.find(p => p.id === "me");
    let oldPoints = myData.rankPoints;
    let oldRankInfo = getRankInfo(oldPoints);

    // Cộng điểm
    myData.rankPoints += tempMatchResult.rankPoints;
    if (myData.rankPoints < 0) myData.rankPoints = 0;
    if (myData.rankPoints > 1000000) myData.rankPoints = 1000000;

    myData.kills += tempMatchResult.kills;
    myData.gunPoints += tempMatchResult.gunPoints;
    myData.matches += 1;
    if (tempMatchResult.rank === 1) myData.top1 += 1;

    saveData();
    renderLeaderboards();

    // Check thăng hạng lớn (Khác Tier name. VD: Gỗ -> Đá)
    let newRankInfo = getRankInfo(myData.rankPoints);
    if (newRankInfo.tierName !== oldRankInfo.tierName && myData.rankPoints > oldPoints) {
        showRankUpOverlay(newRankInfo);
    }

    // Về sảnh và chạy hiệu ứng điểm
    document.getElementById('match-stats').classList.remove('active');
    document.getElementById('lobby-container').classList.add('active');
    
    updateMyStatsUI(oldPoints);

    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none'; zone.classList.remove('shrinking');
}

// --- HIỆU ỨNG THĂNG CẤP LỚN ---
function showRankUpOverlay(rankInfo) {
    const overlay = document.getElementById('rank-up-overlay');
    const badge = document.getElementById('promo-badge');
    const name = document.getElementById('promo-name');

    badge.className = `rank-badge ${rankInfo.cssClass}`;
    name.className = `promo-name ${rankInfo.textClass}`;
    name.innerText = rankInfo.tierName; // Chỉ hiện chữ to: ĐÁ, SẮT, ĐẠI CAO THỦ...

    overlay.classList.add('active');
}

function closeRankUp() {
    document.getElementById('rank-up-overlay').classList.remove('active');
}
