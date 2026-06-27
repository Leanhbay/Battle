// src/ui/HealthBar.js

export class HealthBar {
    render(ctx, player, canvasWidth, canvasHeight) {
        const barWidth = 200;
        const barHeight = 20;
        const x = 30; 
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(x, 30, barWidth, barHeight);
        const healthP = player.health / player.maxHealth;
        ctx.fillStyle = healthP > 0.3 ? '#c42525' : '#ff0000'; 
        ctx.fillRect(x, 30, barWidth * Math.max(0, healthP), barHeight);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(x, 30, barWidth, barHeight);
        ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.fillText(`Máu: ${Math.floor(player.health)} / ${player.maxHealth}`, x + 10, 45);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(x, 60, barWidth, barHeight);
        const staminaP = player.stamina / player.maxStamina;
        ctx.fillStyle = staminaP > 0.3 ? '#2ecc71' : '#ff0000'; 
        ctx.fillRect(x, 60, barWidth * Math.max(0, staminaP), barHeight);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(x, 60, barWidth, barHeight);
        ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.fillText(`Thể lực: ${Math.floor(player.stamina)} / ${player.maxStamina}`, x + 10, 75);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(x, 90, barWidth, barHeight);
        const thirstP = player.thirst / player.maxThirst;
        ctx.fillStyle = thirstP > 0.3 ? '#3498db' : '#ff0000'; 
        ctx.fillRect(x, 90, barWidth * Math.max(0, thirstP), barHeight);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(x, 90, barWidth, barHeight);
        ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.fillText(`Khát: ${Math.floor(player.thirst)} / ${player.maxThirst}`, x + 10, 105);

        ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial';
        let weaponText = '';
        
        if (player.weapon === 'none') {
            weaponText = 'Vũ khí: Tay không (Tối đa 2 khẩu)';
            ctx.fillStyle = '#ffaa00';
        } else if (player.weapon === 'm4a1') {
            weaponText = `M4A1: ${player.ammo.m4a1.current}/${player.ammo.m4a1.max} (Dự trữ: ${player.reserveAmmo['5.56mm']})`;
            if (player.reserveAmmo['5.56mm'] <= 0 && player.ammo.m4a1.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'scar') {
            weaponText = `SCAR: ${player.ammo.scar.current}/${player.ammo.scar.max} (Dự trữ: ${player.reserveAmmo['5.56mm']})`;
            if (player.reserveAmmo['5.56mm'] <= 0 && player.ammo.scar.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'famas') {
            weaponText = `Famas: ${player.ammo.famas.current}/${player.ammo.famas.max} (Dự trữ: ${player.reserveAmmo['5.56mm']})`;
            if (player.reserveAmmo['5.56mm'] <= 0 && player.ammo.famas.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'akm') {
            weaponText = `AKM: ${player.ammo.akm.current}/${player.ammo.akm.max} (Dự trữ: ${player.reserveAmmo['7.62mm']})`;
            if (player.reserveAmmo['7.62mm'] <= 0 && player.ammo.akm.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'shotgun') {
            weaponText = `Shotgun: ${player.ammo.shotgun.current}/${player.ammo.shotgun.max} (Dự trữ: ${player.reserveAmmo['12.0mm']})`;
            if (player.reserveAmmo['12.0mm'] <= 0 && player.ammo.shotgun.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'glock') {
            weaponText = `Glock: ${player.ammo.glock.current}/${player.ammo.glock.max} (Dự trữ: ${player.reserveAmmo['9.19mm']})`;
            if (player.reserveAmmo['9.19mm'] <= 0 && player.ammo.glock.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'p90') {
            weaponText = `P90: ${player.ammo.p90.current}/${player.ammo.p90.max} (Dự trữ: ${player.reserveAmmo['9mm']})`;
            if (player.reserveAmmo['9mm'] <= 0 && player.ammo.p90.current <= 0) ctx.fillStyle = 'red';
        } else if (player.weapon === 'uzi') {
            weaponText = `Uzi: ${player.ammo.uzi.current}/${player.ammo.uzi.max} (Dự trữ: ${player.reserveAmmo['9mm']})`;
            if (player.reserveAmmo['9mm'] <= 0 && player.ammo.uzi.current <= 0) ctx.fillStyle = 'red';
        } else {
            weaponText = 'Vũ khí: Mã Tấu (Cận chiến)';
        }
        
        if (player.isReloading) {
            weaponText += ' [ĐANG NẠP...]';
            ctx.fillStyle = '#ffaa00'; 
        } 

        ctx.fillText(weaponText, x, 135);

        if (player.health <= 0) {
            ctx.fillStyle = 'red'; ctx.font = 'bold 50px Arial'; ctx.textAlign = 'center';
            ctx.fillText('YOU DIED', canvasWidth / 2, canvasHeight / 2);
            ctx.textAlign = 'left'; 
        }
    }
}
