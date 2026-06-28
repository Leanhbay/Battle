// src/utils/RenderHelpers.js

export const explosionFrames = [
    ["0000344430000", "0034422244300", "0342211122430", "0421111111240", "3421111111243", "4211111111124", "4211111111124", "3421111111243", "0421111111240", "0342211122430", "0034422244300", "0000344430000"],
    ["000005555500000", "000554444455000", "005443333344500", "054332222233450", "054322111223450", "543221111122345", "543211111112345", "543211111112345", "543221111122345", "054322111223450", "054332222233450", "005443333344500", "000554444455000", "000005555500000"],
    ["0000566650000", "0056655566500", "0565000005650", "0650000000560", "5600000000065", "6500000000056", "6500000000056", "5600000000065", "0650000000560", "0565000005650", "0056655566500", "0000566650000"]
];

export const expColors = { '1': '#ffffff', '2': '#ffea00', '3': '#ff9d00', '4': '#e74c3c', '5': '#333333', '6': '#7f8c8d' };

export function renderSpriteShadow(ctx, shadowSprite, posX, posY, width, height, sway = 0) {
    if(!shadowSprite || !shadowSprite.width) return;
    ctx.save(); ctx.translate(Math.round(posX), Math.round(posY)); ctx.transform(1, 0, 1.2 - sway * 1.5, -0.4, 0, 0); ctx.globalAlpha = 0.55; ctx.imageSmoothingEnabled = false; ctx.drawImage(shadowSprite, Math.round(-width / 2), Math.round(-height), width, height); ctx.restore();
}

export function renderEntityShadow(ctx, posX, posY, sizeX, sizeY, isProne = false) {
    ctx.save(); ctx.translate(Math.round(posX), Math.round(posY)); ctx.transform(1, 0, 1.2, -0.4, 0, 0); ctx.fillStyle = 'rgba(12, 20, 36, 0.55)'; ctx.beginPath();
    if (isProne) ctx.ellipse(0, -sizeX * 0.4, sizeY * 1.5, sizeX * 0.5, 0, 0, Math.PI * 2); else ctx.ellipse(0, -sizeX * 1.1, sizeY, sizeX * 1.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

export function drawWeaponOnBack(ctx, ent, wepId, offset, dirStr, flipX) {
    if (ent.unlockedWeapons && ent.unlockedWeapons.includes(wepId) && ent.weapon !== wepId && ent.weaponData && ent.weaponData[wepId]) {
        ctx.save(); if (dirStr === 'front') ctx.translate(flipX ? 4 : -4, -2); ctx.translate(-5, offset); ctx.rotate(-Math.PI / 4); const wData = ent.weaponData[wepId];
        if (wData && wData.img && wData.img.width > 0) ctx.drawImage(wData.img, Math.round(-(wData.w||32) / 2), Math.round(-(wData.h||16) / 2), wData.w||32, wData.h||16);
        const wMag = ent.weaponData[wepId + '_mag']; if (wMag && wMag.img && wMag.img.width > 0) ctx.drawImage(wMag.img, Math.round(-(wData.w||32)/2 + (wData.magX||0)), Math.round(-(wData.h||16)/2 + (wData.magY||0)));
        ctx.restore(); return offset + 5;
    }
    return offset;
}
