// src/utils/CharacterRenderer.js
import { isGun, TILE_WIDTH, TILE_HEIGHT } from './Constants.js';
import { renderEntityShadow } from './RenderHelpers.js';

export function renderCharacter(ctx, item, pos, player, spentMags, input, gameTime = performance.now() / 1000) {
    const ent = item.ent; let eW = ent.width || 48; let eH = ent.height || 48;
    let isProne = false; if (ent === player) isProne = player.isProne || player.kbTimer > 0 || player.health <= 0; else isProne = ent.kbTimer > 0; 

    renderEntityShadow(ctx, pos.x, pos.y + TILE_HEIGHT/2 - 2, 12, 5, isProne); 
    ctx.save(); if (ent.invulnerableTimer > 0 && Math.floor(ent.invulnerableTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
    
    const fX = ent.facingX || 1; const fY = ent.facingY || 0;
    const screenFacingX = (fX - fY) * (TILE_WIDTH / 2); const screenFacingY = (fX + fY) * (TILE_HEIGHT / 2);
    let screenAngle = Math.atan2(screenFacingY, screenFacingX) || 0; let deg = screenAngle * (180 / Math.PI);
    let dirStr = 'side'; let flipX = false;
    
    if (deg >= 45 && deg <= 135) dirStr = 'front'; else if (deg >= -135 && deg <= -45) dirStr = 'back'; else { dirStr = 'side'; if (Math.abs(deg) > 135) flipX = true; }

    const drawBody = () => {
        ctx.save(); ctx.imageSmoothingEnabled = false; 
        let currentSprite = null; 
        if (ent.sprites && ent.sprites[dirStr]) currentSprite = ent.sprites[dirStr][ent.currentState] || ent.sprites[dirStr]['idle'];
        if (!currentSprite && ent.sprites) currentSprite = ent.sprites[ent.currentState] || ent.sprites['idle']; 
        if (!currentSprite) currentSprite = ent.sprite; 

        if (currentSprite && currentSprite.width > 0) {
            if (isProne) { 
                ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2)); ctx.scale(1, 0.4); ctx.rotate(screenAngle); 
                if (Math.abs(screenAngle) > Math.PI / 2) ctx.scale(1, -1); 
                ctx.drawImage(currentSprite, Math.round(-eW / 2), Math.round(-eH/1.5), eW, eH); 
            } else { 
                if (flipX) { 
                    ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - eH)); ctx.scale(-1, 1); 
                    ctx.drawImage(currentSprite, Math.round(-eW / 2), 0, eW, eH); 
                } else { 
                    ctx.drawImage(currentSprite, Math.round(pos.x - eW / 2), Math.round(pos.y + TILE_HEIGHT / 2 - eH), eW, eH); 
                } 
            }
        }
        
        // Thanh máu của Bot
        if (item.type === 'bot' && ent.health > 0 && ent.health < 100 && !isProne) {
            ctx.fillStyle = '#000'; ctx.fillRect(Math.round(pos.x - 15), Math.round(pos.y + TILE_HEIGHT/2 - eH - 10), 30, 4);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(Math.round(pos.x - 14), Math.round(pos.y + TILE_HEIGHT/2 - eH - 9), 28 * (ent.health/100), 2);
        }
        ctx.restore();
    };

    const drawHolster = () => {
        if (ent.health <= 0 || !ent.weaponData) return; ctx.save(); ctx.imageSmoothingEnabled = false; 
        let proneOffset = isProne ? eH - 15 : 0; ctx.translate(Math.round(pos.x), Math.round(pos.y + TILE_HEIGHT / 2 - eH + 15 + proneOffset)); if (!isProne && flipX) ctx.scale(-1, 1);
        let holsterOffset = 0; const guns = ['m4a1', 'scar', 'akm', 'famas', 'shotgun', 'p90', 'uzi'];
        guns.forEach(g => {
            if (ent.unlockedWeapons && ent.unlockedWeapons.includes(g) && ent.weapon !== g && ent.weaponData[g]) {
                ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, holsterOffset); ctx.rotate(-Math.PI / 4); 
                const wData = ent.weaponData[g]; const wMag = ent.weaponData[g + '_mag']; 
                if (wData && wData.img && wData.img.width > 0) ctx.drawImage(wData.img, Math.round(-(wData.w||32) / 2), Math.round(-(wData.h||16) / 2), wData.w||32, wData.h||16); 
                if (wMag && wMag.img && wMag.img.width > 0) ctx.drawImage(wMag.img, Math.round(-(wData.w||32)/2 + (wData.magX||0)), Math.round(-(wData.h||16)/2 + (wData.magY||0))); 
                ctx.restore(); holsterOffset += 5; 
            }
        });

        if (ent.unlockedWeapons && ent.unlockedWeapons.includes('melee') && ent.weapon !== 'melee' && ent.weaponData['melee']) {
            ctx.save(); ctx.translate(flipX ? 4 : -6, 12); ctx.rotate(Math.PI / 2.5); const wData = ent.weaponData['melee']; if (wData && wData.img && wData.img.width > 0) ctx.drawImage(wData.img, Math.round(-(wData.w||32) / 2), Math.round(-(wData.h||16) / 2), wData.w||32, wData.h||16); ctx.restore();
        } else if (ent.unlockedWeapons && ent.unlockedWeapons.includes('glock') && ent.weapon !== 'glock' && ent.weaponData['glock']) {
            ctx.save(); ctx.translate(flipX ? 4 : -6, 12); ctx.rotate(Math.PI / 2.5); const wData = ent.weaponData['glock']; const wMag = ent.weaponData['glock_mag']; if (wData && wData.img && wData.img.width > 0) ctx.drawImage(wData.img, Math.round(-(wData.w||32) / 2), Math.round(-(wData.h||16) / 2), wData.w||32, wData.h||16); if (wMag && wMag.img && wMag.img.width > 0) ctx.drawImage(wMag.img, Math.round(-(wData.w||32)/2 + (wData.magX||0)), Math.round(-(wData.h||16)/2 + (wData.magY||0))); ctx.restore();
        } 
        ctx.restore();
    };

    const drawActiveWep = () => {
        if (ent.weapon === 'none' || ent.currentState === 'eat' || ent.health <= 0 || !ent.weaponData || !ent.weaponData[ent.weapon]) return; 
        const wData = ent.weaponData[ent.weapon]; if (!wData || !wData.img || wData.img.width === 0) return;
        ctx.save(); ctx.imageSmoothingEnabled = false; 
        
        // Chỉnh Offset ngang dọc để khớp với size tay của Character 48x48
        let proneYOffset = isProne ? 10 : 0; 
        let scopeYOffset = (ent.type === 'player' && ((input && input.isPressed('use_grenade')) || player.isAiming)) ? 15 : 24; 
        
        ctx.translate(Math.round(pos.x + (flipX ? -2 : 2)), Math.round(pos.y + TILE_HEIGHT / 2 - eH + scopeYOffset + proneYOffset)); 
        ctx.rotate(screenAngle); 
        if (Math.abs(screenAngle) > Math.PI / 2) ctx.scale(1, -1); 
        
        let swingAngle = 0; let kickbackX = 0; let drawHandLeft = true;
        let reloadHandX = 0; let reloadHandY = 0;

        // XỬ LÝ HOẠT ẢNH NẠP ĐẠN CHÂN THỰC
        if (ent.isReloading && ent.reloadTimer > 0) { 
            let t = 1 - (ent.reloadTimer / (ent.reloadDuration||1)); 
            swingAngle = Math.sin(t * Math.PI) * (Math.PI / 4.5); // Súng hất nhẹ lên
            drawHandLeft = false; 

            if (t < 0.2) { 
                // Vứt băng đạn
                reloadHandX = -6; reloadHandY = (t / 0.2) * -10;
                if (!ent.magDropped && ent.weapon !== 'shotgun' && ent.weaponData[ent.weapon + '_mag']) { 
                    spentMags.push({ type: ent.weapon + '_mag', sprite: ent.weaponData[ent.weapon + '_mag'].img, w: ent.weaponData[ent.weapon + '_mag'].w, h: ent.weaponData[ent.weapon + '_mag'].h, gridX: ent.gridX, gridY: ent.gridY, restX: Math.random() * 0.4 - 0.2, restY: Math.random() * 0.4 - 0.2, rot: (Math.random() - 0.5) * 1.0 }); 
                    ent.magDropped = true; 
                } 
            } else if (t >= 0.2 && t < 0.4) { 
                // Thò tay xuống túi quần
                reloadHandX = -12; reloadHandY = 10;
                ent.magDropped = false; 
            } else if (t >= 0.4 && t < 0.7) { 
                // Cầm băng đạn mới nhét vào
                reloadHandX = -10; reloadHandY = 10 - ((t - 0.4) / 0.3) * 10;
            } else { 
                // Kéo chốt súng
                reloadHandX = -4 - Math.sin(((t - 0.7) / 0.3) * Math.PI) * 4;
                reloadHandY = -2;
            } 
        } 
        // XỬ LÝ HOẠT ẢNH CHÉM DAO VÀ BẮN SÚNG GIẬT LÙI
        else if (ent.interactTimer > 0) { 
            if (ent.weapon === 'melee') { 
                let p = 1 - (ent.interactTimer / 0.15); 
                swingAngle = (Math.pow(p, 1.5) * Math.PI * 1.5) - (Math.PI / 1.5); 
                kickbackX = -Math.sin(p * Math.PI) * 4; // Lao tay chém về phía trước
            } 
            else { 
                let timeElapsed = 0.3 - ent.interactTimer; 
                if (timeElapsed < 0.1) { 
                    let recoilP = 1 - (timeElapsed / 0.1); 
                    swingAngle = -recoilP * 0.04; 
                    kickbackX = recoilP * 4; // Độ giật súng về sau
                } 
            } 
        }

        // HOẠT ẢNH TAY BẤP BÊNH KHI ĐI BỘ (BOBBING)
        if (!isProne && (ent.currentState === 'walk1' || ent.currentState === 'walk2')) {
            let bobY = Math.sin(gameTime * 12) * 1.2;
            ctx.translate(0, bobY);
        }

        ctx.rotate(swingAngle);
        
        let gripOffsetX = -6; 
        if (['m4a1', 'scar', 'akm'].includes(ent.weapon)) gripOffsetX = -8; 
        else if (ent.weapon === 'famas') gripOffsetX = -12; 
        else if (ent.weapon === 'shotgun') gripOffsetX = -10; 
        else if (ent.weapon === 'p90') gripOffsetX = -3; 
        else if (['glock', 'uzi'].includes(ent.weapon)) gripOffsetX = -3;
        else if (ent.weapon === 'melee') gripOffsetX = 0; // Dao nhích ra xíu

        const startX = Math.round(gripOffsetX - kickbackX); 
        const startY = Math.round(-(wData.h||16) / 2); 
        
        // Vẽ thân súng
        ctx.drawImage(wData.img, startX, startY, wData.w||32, wData.h||16);
        
        // Xử lý hiển thị băng đạn có dính vào súng không
        let magT = ent.isReloading ? 1 - ((ent.reloadTimer||0) / (ent.reloadDuration||1)) : 1; 
        const wMag = ent.weaponData[ent.weapon + '_mag'];
        let showMagAttached = (isGun(ent.weapon) && ent.weapon !== 'shotgun') && (!ent.isReloading || magT < 0.2 || magT >= 0.7);

        if (showMagAttached && wMag && wMag.img && wMag.img.width > 0) { 
            ctx.drawImage(wMag.img, Math.round(startX + (wData.magX||0)), Math.round(startY + (wData.magY||0))); 
        }

        // HÀM VẼ KHỐI TAY SIÊU NÉT (Bo góc)
        const drawHand = (hx, hy) => {
            ctx.fillStyle = '#ffcd94'; 
            ctx.strokeStyle = '#c0885c'; 
            ctx.lineWidth = 1; 
            ctx.beginPath(); 
            if(ctx.roundRect) ctx.roundRect(Math.round(hx), Math.round(hy), 6, 6, 2); 
            else ctx.fillRect(Math.round(hx), Math.round(hy), 6, 6); 
            ctx.fill(); ctx.stroke();
        };

        // Vẽ Tay Phải (Tay giữ cò súng)
        drawHand(gripOffsetX + 1 - kickbackX, -2);

        // Vẽ Tay Trái (Tay đỡ nòng hoặc đang cầm đạn)
        if (['m4a1', 'scar', 'akm', 'famas', 'shotgun'].includes(ent.weapon)) { 
            if (drawHandLeft) { 
                const leftGripX = gripOffsetX + 14 - kickbackX; 
                drawHand(leftGripX, -2);
            } else if (ent.isReloading) {
                drawHand(startX + reloadHandX, startY + reloadHandY);
                if (magT >= 0.2 && magT < 0.7 && wMag && wMag.img) {
                    ctx.drawImage(wMag.img, startX + reloadHandX + 2, startY + reloadHandY + 2);
                }
            }
        } else {
            // Súng lục / Uzi / Dao
            if (drawHandLeft && isGun(ent.weapon)) {
                drawHand(gripOffsetX + 5 - kickbackX, -1);
            } else if (ent.isReloading) {
                drawHand(startX + reloadHandX, startY + reloadHandY);
                if (magT >= 0.2 && magT < 0.7 && wMag && wMag.img) {
                    ctx.drawImage(wMag.img, startX + reloadHandX + 2, startY + reloadHandY + 2);
                }
            }
        }
        
        // Tia lửa đạn
        if (wData.muzzleX && ent.muzzleFlashTimer > 0 && !ent.isReloading) { 
            ctx.save(); ctx.translate(startX + wData.muzzleX, startY + (wData.muzzleY||0)); 
            const flashGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 15); 
            flashGrad.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
            flashGrad.addColorStop(0.3, 'rgba(255, 255, 0, 0.9)'); 
            flashGrad.addColorStop(1, 'rgba(255, 0, 0, 0)'); 
            ctx.fillStyle = flashGrad; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.restore(); 
        }
        ctx.restore(); 
    };

    // Render thứ tự Body, Back Holster, Front Active Wep theo Hướng Mặt
    if (dirStr === 'back') { drawActiveWep(); drawBody(); drawHolster(); } else { drawHolster(); drawBody(); drawActiveWep(); }
    
    // UI Phụ cho Player
    if (ent.type === 'player') {
        if (ent.isReloading && ent.reloadTimer > 0) { ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - eH - 25); const radius = 10; const progress = 1 - (ent.reloadTimer / (ent.reloadDuration||1)); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill(); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
        if (ent.healingTimer > 0) { ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - eH - 25); const radius = 10; const progress = 1 - (ent.healingTimer / 5.0); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill(); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
        if (ent.drinkingTimer > 0) { ctx.save(); const textY = Math.round(pos.y + TILE_HEIGHT / 2 - eH - 25); const radius = 10; const progress = 1 - (ent.drinkingTimer / 5.0); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill(); ctx.beginPath(); ctx.arc(Math.round(pos.x), textY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress)); ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
    }
    ctx.restore(); 
}
