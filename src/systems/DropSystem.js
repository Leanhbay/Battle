// src/systems/DropSystem.js
import { TILE_WIDTH, TILE_HEIGHT } from '../utils/Constants.js';

function generateParachuteSprite() {
    const pal = { '1': '#1e8449', '2': '#2ecc71', '3': '#f1c40f', '4': '#e74c3c', '6': '#111111' };
    const matrix = [
        "00000000000666666666600000000000", "00000000666222222222266600000000",
        "00000066222222222222222266000000", "00006622221111111111112222660000",
        "00062222113333333333331122226000", "00622211333333333333333311222600",
        "06221133344444444444444333112260", "62211334444444444444444443311226",
        "62113344446666666666664444331126", "61133444660000000000006644433116",
        "61133446000000000000000064433116", "06666660000000000000000006666660"
    ];
    const scale = 4;
    const canvas = document.createElement('canvas'); canvas.width = matrix[0].length * scale; canvas.height = matrix.length * scale;
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    for (let r = 0; r < matrix.length; r++) { for (let c = 0; c < matrix[r].length; c++) { if (pal[matrix[r][c]]) { ctx.fillStyle = pal[matrix[r][c]]; ctx.fillRect(c * scale, r * scale, scale, scale); } } }
    return canvas;
}

function generatePlaneSprites() {
    const pal = { '1': '#bdc3c7', '2': '#7f8c8d', '3': '#2c3e50', '4': '#c0392b', '5': '#ecf0f1', '6': '#222222' };
    const matrix = [
        "0000000000000000006666000000000000000000", "0000000000000000061111600000000000000000",
        "0000000000000000615555160000000000000000", "0000000000000000613333160000000000000000",
        "0000000000000006113333116000000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061111111111600000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061122221111600000000000000", "0000000000000061122221111600000000000000",
        "0000000000000061111111111600000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061111111111600000000000000", "0006660000000061111111111600000000666000",
        "0061166666666661111111111666666666116000", "0611111111111111111111111111111111111600",
        "0611111111111111111111111111111111111600", "6111111111111111111111111111111111111160",
        "6411336111336111111111111133611133611460", "0666666666666611111111111666666666666600",
        "0000000000000061111111111600000000000000", "0000000000000061122221111600000000000000",
        "0000000000000061122221111600000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061111111111600000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061111111111600000000000000", "0000000000000061111111111600000000000000",
        "0000000000000061111111111600000000000000", "0000000000000611111111111160000000000000",
        "0000000000006111111111111116000000000000", "0000000000061111111111111111600000000000",
        "0000000000062222111111222222600000000000", "0000000006662222222222222222666000000000",
        "0000000061122222222222222222211600000000", "0000000611111111111111111111111160000000",
        "0000000066666666664466666666666600000000", "0000000000000000064460000000000000000000",
        "0000000000000000006600000000000000000000"
    ];
    const scale = 5; 
    const canvas = document.createElement('canvas'); canvas.width = matrix[0].length * scale; canvas.height = matrix.length * scale;
    const shadow = document.createElement('canvas'); shadow.width = canvas.width; shadow.height = canvas.height;
    
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const sCtx = shadow.getContext('2d'); sCtx.imageSmoothingEnabled = false;

    for (let r = 0; r < matrix.length; r++) { 
        for (let c = 0; c < matrix[r].length; c++) { 
            const char = matrix[r][c];
            if (char !== '0') { 
                if (pal[char]) { ctx.fillStyle = pal[char]; ctx.fillRect(c * scale, r * scale, scale, scale); }
                sCtx.fillStyle = '#000000'; sCtx.fillRect(c * scale, r * scale, scale, scale); 
            } 
        } 
    }
    return { plane: canvas, shadow: shadow };
}

export class DropManager {
    constructor() {
        this.planeState = 'idle'; // idle, flying, done
        this.playerState = 'idle'; // in_plane, falling, landed
        
        this.planeX = 0; this.planeY = 0;
        this.startX = 0; this.startY = 0;
        this.endX = 0; this.endY = 0;
        
        this.altitude = 250; 
        this.playerAlt = 250; 
        
        this.speed = 10; 
        this.dropSpeed = 10; 
        
        this.paraSprite = generateParachuteSprite(); 
        const planes = generatePlaneSprites();
        this.planeSprite = planes.plane;
        this.planeShadow = planes.shadow;

        this.jumpBtn = document.createElement('button');
        this.jumpBtn.innerHTML = '<span>NHẢY DÙ</span>';
        this.jumpBtn.style.cssText = `
            position: fixed; bottom: 20%; left: 50%; transform: translateX(-50%);
            background: #d94221; padding: 15px 40px; border: none; border-radius: 6px;
            outline: 4px solid #111; cursor: pointer; z-index: 9000; display: none;
            box-shadow: inset -4px -8px 0px rgba(100,20,10,0.6), inset 4px 4px 0px rgba(255,150,50,0.5), 0 6px 0 #111;
            font-family: 'Press Start 2P', cursive, Arial; color: #fde462; font-size: 20px; text-shadow: 2px 2px 0 #5c1811;
        `;
        document.body.appendChild(this.jumpBtn);

        this.jumpBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (this.playerState === 'in_plane') this.jump();
        });
    }

    startFlight() {
        this.planeState = 'flying';
        this.playerState = 'in_plane';
        this.playerAlt = this.altitude;
        this.jumpBtn.style.display = 'block';

        if (Math.random() > 0.5) {
            this.startX = 5; this.startY = Math.random() * 160 + 20;
            this.endX = 195; this.endY = Math.random() * 160 + 20;
        } else {
            this.startX = Math.random() * 160 + 20; this.startY = 5;
            this.endX = Math.random() * 160 + 20; this.endY = 195;
        }
        this.planeX = this.startX; this.planeY = this.startY;
    }

    jump() {
        this.playerState = 'falling';
        this.jumpBtn.style.display = 'none'; 
    }

    update(dt, input, player, bots) {
        if (this.planeState === 'idle' && this.playerState === 'idle') return this.playerState;

        const flightDist = Math.hypot(this.endX - this.startX, this.endY - this.startY);
        
        // --- UPDATE MÁY BAY ---
        if (this.planeState === 'flying') {
            const dx = this.endX - this.planeX; const dy = this.endY - this.planeY;
            const dist = Math.hypot(dx, dy);
            if (dist < 1.0) {
                this.planeState = 'done'; 
                if (this.playerState === 'in_plane') this.jump(); 
            } else {
                this.planeX += (dx / dist) * this.speed * dt;
                this.planeY += (dy / dist) * this.speed * dt;
            }
        }

        const currentDist = Math.hypot(this.planeX - this.startX, this.planeY - this.startY);
        const progress = currentDist / flightDist;

        // --- UPDATE PLAYER ---
        if (this.playerState === 'in_plane') {
            player.gridX = this.planeX; player.gridY = this.planeY;
            this.playerAlt = this.altitude;
        } 
        else if (this.playerState === 'falling') {
            this.playerAlt -= this.dropSpeed * dt; 
            
            let steerX = 0; let steerY = 0; let steerSpeed = 6.0; 
            let screenMoveX = 0; let screenMoveY = 0;

            // Xóa click chuột, CHỈ LẤY ĐIỀU HƯỚNG TỪ JOYSTICK HOẶC PHÍM (WASD)
            if (input.axisX !== undefined || input.axisY !== undefined) { 
                screenMoveX = input.axisX || 0; screenMoveY = input.axisY || 0; 
            }
            else if (input.joystickX !== undefined || input.joystickY !== undefined) { 
                screenMoveX = input.joystickX || 0; screenMoveY = input.joystickY || 0; 
            }
            else if (input.isPressed) {
                if (input.isPressed('a') || input.isPressed('left')) screenMoveX -= 1;
                if (input.isPressed('d') || input.isPressed('right')) screenMoveX += 1;
                if (input.isPressed('w') || input.isPressed('up')) screenMoveY -= 1;
                if (input.isPressed('s') || input.isPressed('down')) screenMoveY += 1;
            }

            // Tính vector chuyển động
            if (screenMoveX !== 0 || screenMoveY !== 0) {
                let len = Math.hypot(screenMoveX, screenMoveY); 
                screenMoveX /= len; screenMoveY /= len;
                steerX = (screenMoveX / (TILE_WIDTH/2) + screenMoveY / (TILE_HEIGHT/2)) * steerSpeed;
                steerY = (screenMoveY / (TILE_HEIGHT/2) - screenMoveX / (TILE_WIDTH/2)) * steerSpeed;
            }

            player.gridX += steerX * dt; player.gridY += steerY * dt;
            player.gridX = Math.max(5, Math.min(195, player.gridX)); player.gridY = Math.max(5, Math.min(195, player.gridY));
            if (this.playerAlt <= 0) {
                this.playerAlt = 0;
                this.playerState = 'landed'; 
            }
        }

        // --- UPDATE BOTS ---
        bots.forEach(bot => {
            if (bot.dropState === 'in_plane') {
                bot.gridX = this.planeX; bot.gridY = this.planeY; bot.altitude = this.altitude;
                // Bắt buộc Bot nhảy từ máy bay theo độ trễ ngẫu nhiên (jumpTarget)
                if (progress >= bot.jumpTarget || this.planeState === 'done') bot.dropState = 'falling';
            } 
            else if (bot.dropState === 'falling') {
                // Tốc độ rơi y hệt người chơi
                bot.altitude -= this.dropSpeed * dt;
                bot.gridX += bot.steerX * dt; bot.gridY += bot.steerY * dt;
                bot.gridX = Math.max(5, Math.min(195, bot.gridX)); bot.gridY = Math.max(5, Math.min(195, bot.gridY));
                if (bot.altitude <= 0) {
                    bot.altitude = 0;
                    bot.dropState = 'landed';
                }
            }
        });

        return this.playerState;
    }

    drawParachutist(ctx, pos, altitude, ent, gameTime) {
        const shadowScale = 1.0 - (altitude / 250);
        ctx.fillStyle = `rgba(0,0,0,${Math.max(0.1, 0.5 * shadowScale)})`;
        ctx.beginPath(); ctx.ellipse(pos.x, pos.y + TILE_HEIGHT/2, 25 * shadowScale, 12 * shadowScale, 0, 0, Math.PI*2); ctx.fill();

        const screenAlt = altitude * 3; 
        const swing = Math.sin(gameTime * 2.5 + ent.gridX) * 0.15; 
        
        ctx.save();
        ctx.translate(pos.x, pos.y - screenAlt);
        ctx.rotate(swing);

        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(-45, -50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(45, -50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(-15, -55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(15, -55); ctx.stroke();

        ctx.drawImage(this.paraSprite, -this.paraSprite.width/2, -60 - this.paraSprite.height/2);

        if (ent && ent.sprites && ent.sprites.front && ent.sprites.front.idle) {
            const pSprite = ent.sprites.front.idle;
            const legSwing = Math.sin(gameTime * 8 + ent.gridX) * 0.1;
            ctx.translate(0, 30); 
            ctx.rotate(-swing + legSwing); 
            ctx.drawImage(pSprite, -pSprite.width/2, -pSprite.height/1.5);
        }
        ctx.restore();
    }

    render(ctx, camX, camY, gridToScreen, player, bots, gameTime) {
        if (this.planeState === 'flying') {
            const pos = gridToScreen(this.planeX, this.planeY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            if (pos) {
                ctx.save();
                const screenDx = (this.endX - this.planeX - (this.endY - this.planeY)) * (TILE_WIDTH/2);
                const screenDy = (this.endX - this.planeX + (this.endY - this.planeY)) * (TILE_HEIGHT/2);
                const angle = Math.atan2(screenDy, screenDx);
                
                // Vẽ Bóng Máy bay di chuyển dưới đất
                ctx.globalAlpha = 0.35;
                ctx.translate(pos.x + 50, pos.y + 120); 
                ctx.rotate(angle);
                ctx.drawImage(this.planeShadow, -this.planeShadow.width/2, -this.planeShadow.height/2);
                
                // Vẽ Máy bay lơ lửng trên trời
                ctx.globalAlpha = 1.0;
                ctx.setTransform(1, 0, 0, 1, 0, 0); 
                ctx.translate(pos.x, pos.y - this.altitude * 3); // Độ cao render = altitude * 3
                ctx.rotate(angle);
                ctx.drawImage(this.planeSprite, -this.planeSprite.width/2, -this.planeSprite.height/2);
                ctx.restore();
            }
        }

        if (this.playerState === 'falling') {
            const pos = gridToScreen(player.gridX, player.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            if (pos) this.drawParachutist(ctx, pos, this.playerAlt, player, gameTime);
        }

        bots.forEach(b => {
            if (b.dropState === 'falling') {
                const bPos = gridToScreen(b.gridX, b.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
                if (bPos) this.drawParachutist(ctx, bPos, b.altitude, b, gameTime);
            }
        });
    }
}
