// Thêm đoạn này vào ngay dưới phần khai báo // --- BIẾN TOÀN CỤC ---
const RANK_TIERS = [
    { name: "Gỗ 1", min: 0, max: 499, css: "tier-wood", short: "G1", tierLvl: 1 },
    { name: "Gỗ 2", min: 500, max: 999, css: "tier-wood", short: "G2", tierLvl: 1 },
    { name: "Gỗ 3", min: 1000, max: 1499, css: "tier-wood", short: "G3", tierLvl: 1 },
    { name: "Đá 1", min: 1500, max: 1999, css: "tier-stone", short: "Đ1", tierLvl: 2 },
    { name: "Đá 2", min: 2000, max: 2499, css: "tier-stone", short: "Đ2", tierLvl: 2 },
    { name: "Đá 3", min: 2500, max: 2999, css: "tier-stone", short: "Đ3", tierLvl: 2 },
    { name: "Đá 4", min: 3000, max: 3499, css: "tier-stone", short: "Đ4", tierLvl: 2 },
    { name: "Sắt 1", min: 3500, max: 3999, css: "tier-iron", short: "S1", tierLvl: 3 },
    { name: "Sắt 2", min: 4000, max: 4499, css: "tier-iron", short: "S2", tierLvl: 3 },
    { name: "Sắt 3", min: 4500, max: 4999, css: "tier-iron", short: "S3", tierLvl: 3 },
    { name: "Sắt 4", min: 5000, max: 5499, css: "tier-iron", short: "S4", tierLvl: 3 },
    { name: "Sắt 5", min: 5500, max: 5999, css: "tier-iron", short: "S5", tierLvl: 3 },
    { name: "Vàng 1", min: 6000, max: 6499, css: "tier-gold", short: "V1", tierLvl: 4 },
    { name: "Vàng 2", min: 6500, max: 6999, css: "tier-gold", short: "V2", tierLvl: 4 },
    { name: "Vàng 3", min: 7000, max: 7999, css: "tier-gold", short: "V3", tierLvl: 4 },
    { name: "Kim Cương 1", min: 8000, max: 8999, css: "tier-diamond", short: "KC1", tierLvl: 5 },
    { name: "Kim Cương 2", min: 9000, max: 9999, css: "tier-diamond", short: "KC2", tierLvl: 5 },
    { name: "Kim Cương 3", min: 10000, max: 11999, css: "tier-diamond", short: "KC3", tierLvl: 5 },
    { name: "Cao Thủ 1", min: 12000, max: 12999, css: "tier-master", short: "CT1", tierLvl: 6 },
    { name: "Cao Thủ 2", min: 13000, max: 13999, css: "tier-master", short: "CT2", tierLvl: 6 },
    { name: "Cao Thủ 3", min: 14000, max: 14999, css: "tier-master", short: "CT3", tierLvl: 6 },
    { name: "Đại Cao Thủ", min: 15000, max: 19999, css: "tier-grandmaster", short: "ĐCT", tierLvl: 7 },
    { name: "Chuyên Nghiệp", min: 20000, max: 29999, css: "tier-pro", short: "CN", tierLvl: 8 },
    { name: "Kiện Tướng Chuyên Nghiệp", min: 30000, max: 1000000, css: "tier-champion", short: "KT", tierLvl: 9 }
];

function getRankData(points) {
    if (points > 1000000) points = 1000000;
    for (let r of RANK_TIERS) {
        if (points >= r.min && points <= r.max) return r;
    }
    return RANK_TIERS[RANK_TIERS.length - 1];
}

// Thay thế hàm updateMyStatsUI() cũ bằng hàm này:
function updateMyStatsUI(oldPoints = null) {
    let myData = playersData.find(p => p.id === "me");
    let currentPts = myData.rankPoints;
    let rankInfo = getRankData(currentPts);

    document.getElementById('my-matches').innerText = myData.matches;
    document.getElementById('my-kills').innerText = myData.kills;
    document.getElementById('my-gun-points').innerText = myData.gunPoints;
    document.getElementById('my-top1').innerText = myData.top1;

    // Cập nhật giao diện Rank
    let badge = document.getElementById('my-rank-badge');
    let fill = document.getElementById('rank-progress-fill');
    let rankName = document.getElementById('my-rank-name');
    
    badge.className = `rank-shield ${rankInfo.css}`;
    badge.innerHTML = `<span>${rankInfo.short}</span>`;
    rankName.innerText = rankInfo.name;
    rankName.style.color = window.getComputedStyle(badge).boxShadow.split(')')[0] + ')'; // Lấy màu glow làm màu chữ

    fill.className = `progress-fill ${rankInfo.css}-bg`;
    document.getElementById('rank-max-pts').innerText = rankInfo.max === 1000000 ? "MAX" : rankInfo.max;

    // Hiệu ứng số điểm chạy
    animateScoreCounter('animated-rank-pts', oldPoints !== null ? oldPoints : currentPts, currentPts, rankInfo.min, rankInfo.max);
}

function animateScoreCounter(elementId, start, end, min, max) {
    let obj = document.getElementById(elementId);
    let fill = document.getElementById('rank-progress-fill');
    let duration = 1500;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        let currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = currentVal;
        
        let percent = max === 1000000 ? 100 : ((currentVal - min) / (max - min)) * 100;
        fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end; // Chốt số chính xác
        }
    }
    window.requestAnimationFrame(step);
}

// Thay thế hàm triggerTop1() để thêm tham số điểm test linh hoạt hơn
function triggerTop1(rank, kills, testRankPts = null) {
    if (rank === 1) {
        const animBox = document.getElementById('top1-animation');
        const text = animBox.querySelector('.chicken-dinner');
        animBox.style.display = 'flex';
        text.classList.add('show');
        setTimeout(() => {
            animBox.style.display = 'none';
            text.classList.remove('show');
            showStats(rank, kills, testRankPts);
        }, 4000);
    } else {
        showStats(rank, kills, testRankPts);
    }
}

function showStats(rank, kills, testRankPts) {
    document.getElementById('game-container').classList.remove('active');
    document.getElementById('match-stats').classList.add('active');

    // Nếu truyền vào điểm test thì dùng điểm test, nếu không thì dùng tính toán mặc định
    let rankPts = testRankPts !== null ? testRankPts : calculateRankPoints(rank, kills);
    let gunPts = calculateGunPoints(rank, kills);

    tempMatchResult = { rankPoints: rankPts, kills: kills, gunPoints: gunPts, rank: rank };

    document.getElementById('stat-top').innerText = rank;
    document.getElementById('stat-kills').innerText = kills;
    document.getElementById('stat-rank-pts').innerText = (rankPts > 0 ? "+" : "") + rankPts;
    document.getElementById('stat-rank-pts').style.color = rankPts < 0 ? "#ef4444" : "#4ade80";
    document.getElementById('stat-gun-pts').innerText = "+" + gunPts;
}

// Thay thế hàm backToLobbyAndSave() để kích hoạt Animation Thăng Hạng
function backToLobbyAndSave() {
    let myData = playersData.find(p => p.id === "me");
    let oldPoints = myData.rankPoints;
    let oldRankInfo = getRankData(oldPoints);

    myData.rankPoints += tempMatchResult.rankPoints;
    if (myData.rankPoints < 0) myData.rankPoints = 0; 
    if (myData.rankPoints > 1000000) myData.rankPoints = 1000000;

    myData.kills += tempMatchResult.kills;
    myData.gunPoints += tempMatchResult.gunPoints;
    myData.matches += 1;
    if (tempMatchResult.rank === 1) myData.top1 += 1;

    saveData();
    renderLeaderboards();

    let newRankInfo = getRankData(myData.rankPoints);

    document.getElementById('match-stats').classList.remove('active');
    
    // NẾU TĂNG BẬC RANK CHÍNH (Ví dụ: Gỗ lên Đá, Đá lên Sắt) HOẶC thăng cấp nhỏ
    // Ở đây tôi thiết lập: Chỉ cần Lên Tier là báo, hoặc Lên cấp (G1->G2) cũng báo cho máu lửa!
    if (newRankInfo.tierLvl > oldRankInfo.tierLvl || (newRankInfo.min > oldRankInfo.min && tempMatchResult.rankPoints > 0)) {
        triggerRankUpScreen(newRankInfo, oldPoints);
    } else {
        document.getElementById('lobby-container').classList.add('active');
        updateMyStatsUI(oldPoints);
    }
    
    let zone = document.getElementById('blue-zone');
    zone.style.display = 'none'; zone.classList.remove('shrinking');
}

// Hàm xử lý Màn hình Thăng Hạng
function triggerRankUpScreen(rankInfo, oldPoints) {
    let overlay = document.getElementById('rank-up-overlay');
    let badge = document.getElementById('overlay-rank-badge');
    let nameText = document.getElementById('overlay-rank-name');

    badge.className = `rank-shield rank-up-anim ${rankInfo.css}`;
    badge.innerHTML = `<span>${rankInfo.short}</span>`;
    nameText.innerText = rankInfo.name;
    nameText.style.color = window.getComputedStyle(badge).boxShadow.split(')')[0] + ')'; // Đồng bộ màu chữ với glow

    // Lưu oldPoints vào attribute để khi tắt overlay, thanh bar ngoài sảnh sẽ chạy animation
    overlay.setAttribute('data-old-pts', oldPoints);
    overlay.style.display = 'flex';
}

function closeRankUp() {
    let overlay = document.getElementById('rank-up-overlay');
    let oldPoints = parseInt(overlay.getAttribute('data-old-pts'));
    overlay.style.display = 'none';
    
    document.getElementById('lobby-container').classList.add('active');
    updateMyStatsUI(oldPoints); // Gọi lại để thanh tiến trình chạy số cực mượt
}
