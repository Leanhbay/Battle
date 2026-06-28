// src/entities/Zombie.js

export class Zombie {
    constructor(startX, startY) {
        this.type = 'zombie';
        this.gridX = startX;
        this.gridY = startY;
        this.speed = 1.2;
        this.baseSpeed = 1.2; // Lưu lại tốc độ gốc ban đêm
        this.width = 24; 
        this.height = 42; 
        this.hitbox = 0.3;
        
        this.aggroRange = 8;      
        this.attackDamage = 20;   
        this.attackRange = 0.6;   
        this.attackCooldown = 0;  
        this.health = 50; 
        this.investigateX = null;
        this.investigateY = null;

        // Định hướng và Hoạt ảnh
        this.facingX = 1; this.facingY = 0;
        this.animTime = 0;
        this.currentState = 'idle';

        this.docile = false; // Trạng thái ngủ ngày uể oải

        this.sprites = {
            idle: this.generatePixelSprite(this.getFrameData('idle')),
            walk1: this.generatePixelSprite(this.getFrameData('walk1')),
            walk2: this.generatePixelSprite(this.getFrameData('walk2')),
            attack: this.generatePixelSprite(this.getFrameData('attack')),
            eat: this.generatePixelSprite(this.getFrameData('eat'))
        };
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    getFrameData(state) {
        const frames = {
            idle: [
                "000003333300000", "000033311330000", "000331111130000", "000311818113000",
                "000311111113000", "000011441110000", "000022111220000", "000055545500000",
                "000555544555000", "005555444555500", "055555544455550", "011555555555110",
                "011555555555110", "000555555555000", "000555555555000", "000666666666000",
                "000666666666000", "000666000666000", "000666000111000", "000111000111000",
                "000111000111000", "000111000111000", "000111000111000", "003333000333300",
                "003333000333300"
            ],
            walk1: [
                "000003333300000", "000033311330000", "000331111130000", "000311818113000",
                "000311111113000", "000011441110000", "000551141220000", "000155545500000",
                "001155544555000", "000055544455550", "000055554445555", "000055555555111",
                "000055555555000", "000555555555000", "000555555555000", "000666666666000",
                "000666666666000", "000666000666000", "000666000000000", "000111000111000",
                "000111000111000", "003333000111000", "003333000111000", "000000000333300",
                "000000000333300"
            ],
            walk2: [
                "000003333300000", "000033311330000", "000331111130000", "000311818113000",
                "000311111113000", "000011441110000", "000022141550000", "000005545551000",
                "000555544555110", "005555544455500", "011555554445500", "000555555555000",
                "000555555555000", "000555555555000", "000555555555000", "000666666666000",
                "000666666666000", "000666000666000", "000000000111000", "000111000111000",
                "000111000111000", "000111000333300", "000111000333300", "003333000000000",
                "003333000000000"
            ],
            attack: [
                "000000000000000", "000000000000000", "000000033333000", "000000333113300",
                "000003311111300", "000003118181130", "000003114441130", "000000114411100",
                "000000221412200", "000011555455000", "000111555445550", "001115555444555",
                "000005555544455", "000005555555551", "000005555555551", "000006666666660",
                "000006666666660", "000006660006660", "000006660001110", "000001110001110",
                "000001110001110", "000001110001110", "000001110001110", "000033330003333",
                "000033330003333"
            ],
            eat: [
                "000000000000000", "000000000000000", "000000000000000", "000000000000000",
                "000000000000000", "000000000000000", "000000000000000", "000000000000000",
                "000000000000000", "000000333330000", "000003331133000", "000003311111300",
                "000003118181130", "000003111411130", "000011114441100", "000111221412200",
                "000005555455000", "000055555445550", "000555555444555", "000666555555555",
                "006666666666666", "066666666666666", "011166666666111", "033366666666333",
                "033300000000333"
            ]
        };
        return frames[state];
    }

    generatePixelSprite(pixelArray) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cols = 15; const rows = 25; const pixelSize = 1.6; 
        
        canvas.width = cols * pixelSize; canvas.height = rows * pixelSize;
        const colors = {
            0: 'transparent', 1: '#8da87c', 2: '#5a7350', 3: '#2a2a2a', 
            4: '#8a0303', 5: '#546573', 6: '#2f3e46', 8: '#ff0000'
        };

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const colorIndex = pixelArray[y][x];
                if (colorIndex !== '0') {
                    ctx.fillStyle = colors[colorIndex];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        return canvas; 
    }

    update(deltaTime, player, gameMap, noiseManager, timeCycle) {
        if (this.health <= 0) return;
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;

        // SỬA SỰ CỐ SẬP CODE: Lọc quét mảng tiếng động thủ công an toàn, không gọi hàm lỗi nữa
        let isLoudNoise = false;
        if (noiseManager) {
            noiseManager.noises.forEach(noise => {
                const distToNoise = Math.sqrt((noise.gridX - this.gridX)**2 + (noise.gridY - this.gridY)**2);
                if (distToNoise <= noise.radius) {
                    this.investigateX = noise.gridX;
                    this.investigateY = noise.gridY;
                    if (noise.radius > 10) { // Nếu bán kính âm thanh > 10 ô (tiếng nổ súng)
                        isLoudNoise = true;
                    }
                }
            });
        }

        const distToPlayer = Math.sqrt((player.gridX - this.gridX)**2 + (player.gridY - this.gridY)**2);
        const isPlayerTouching = distToPlayer < 0.6; // Kiểm tra chạm trực tiếp vào người chơi

        // Cập nhật mốc Ngày/Đêm
        const isDay = timeCycle.time >= 6 && timeCycle.time < 18;

        if (isDay) {
            this.docile = true;
            this.speed = this.baseSpeed * 0.25; // Tốc độ lững thững ban ngày cực chậm
        } else {
            this.docile = false;
            this.speed = this.baseSpeed;
        }

        // ĐẶC TÍNH: Thức giấc hung hãn nếu nổ súng hoặc bị chạm trúng
        if (this.docile && (isLoudNoise || isPlayerTouching)) {
            this.docile = false;
            this.speed = this.baseSpeed;
        }

        let isMoving = false;

        // XỬ LÝ TRẠNG THÁI AI BAN NGÀY VS BAN ĐÊM
        if (player.health <= 0 && distToPlayer < 1.5) {
            this.currentState = 'eat'; // Ngồi ăn xác khi người chơi ngã xuống
            const dirX = player.gridX - this.gridX; const dirY = player.gridY - this.gridY;
            if (dirX !== 0 || dirY !== 0) {
                const length = Math.sqrt(dirX * dirX + dirY * dirY);
                this.facingX = dirX / length; this.facingY = dirY / length;
            }
        }
        else if (this.docile) {
            // LÒGIC BAN NGÀY: Đi lững thững hoặc đứng yên, KHÔNG cắn người
            this.animTime += deltaTime * 2.5;
            
            if (Math.random() < 0.01) { // Thỉnh thoảng đổi hướng ngẫu nhiên bâng quơ
                this.facingX = (Math.random() - 0.5) * 2;
                this.facingY = (Math.random() - 0.5) * 2;
                const len = Math.sqrt(this.facingX**2 + this.facingY**2) || 1;
                this.facingX /= len; this.facingY /= len;
            }

            if (Math.random() < 0.02) { // 30% tỷ lệ dừng lại đứng im ngủ gật
                this.speed = 0;
            } else if (this.speed === 0 && Math.random() < 0.04) {
                this.speed = this.baseSpeed * 0.25; // Tiếp tục lết thọt chân
            }

            if (this.speed > 0) {
                this.moveTo(this.gridX + this.facingX, this.gridY + this.facingY, deltaTime, gameMap);
                isMoving = true;
            }
        }
        else if (!this.docile && distToPlayer < this.aggroRange && player.health > 0) {
            // LÔGIC BAN ĐÊM HOẶC KHI BỊ CHỌC GIẬN: Đuổi cắn điên cuồng
            this.investigateX = null; 

            const dirX = player.gridX - this.gridX; const dirY = player.gridY - this.gridY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            this.facingX = dirX / length; this.facingY = dirY / length;

            if (distToPlayer <= this.attackRange) {
                this.currentState = 'attack'; // Phát động hoạt ảnh vồ cào
                if (this.attackCooldown <= 0) {
                    player.takeDamage(15);
                    this.attackCooldown = 1.2; 
                    if (window.spawnBlood) window.spawnBlood(player.gridX, player.gridY, this.facingX, this.facingY);
                }
            } else if (distToPlayer > 0.2) {
                this.moveTo(player.gridX, player.gridY, deltaTime, gameMap);
                isMoving = true;
            }
        } 
        else if (this.investigateX !== null && this.investigateY !== null) {
            // Đi kiểm tra nguồn âm thanh khả nghi
            const distToInv = Math.sqrt((this.investigateX - this.gridX)**2 + (this.investigateY - this.gridY)**2);
            const dirX = this.investigateX - this.gridX; const dirY = this.investigateY - this.gridY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            if (length > 0) { this.facingX = dirX / length; this.facingY = dirY / length; }

            if (distToInv > 0.5) {
                this.moveTo(this.investigateX, this.investigateY, deltaTime, gameMap);
                isMoving = true;
            } else {
                this.investigateX = null; this.investigateY = null;
            }
        }

        // Cập nhật khung hình Chuyển động
        if (isMoving) {
            this.currentState = Math.floor(this.animTime) % 2 === 0 ? 'walk1' : 'walk2';
        } else if (this.currentState !== 'attack' && this.currentState !== 'eat') {
            this.currentState = 'idle';
        }
    }

    moveTo(targetX, targetY, deltaTime, gameMap) {
        const dx = targetX - this.gridX;
        const dy = targetY - this.gridY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        const dirX = dx / distance;
        const dirY = dy / distance;

        let nextX = this.gridX + dirX * this.speed * deltaTime;
        let nextY = this.gridY + dirY * this.speed * deltaTime;

        let checkX = nextX + (dirX > 0 ? this.hitbox : -this.hitbox);
        if (!gameMap.isSolid(checkX, this.gridY)) this.gridX = nextX;

        let checkY = nextY + (dirY > 0 ? this.hitbox : -this.hitbox);
        if (!gameMap.isSolid(this.gridX, checkY)) this.gridY = nextY;
    }
}
