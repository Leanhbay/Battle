// src/systems/CombatManager.js

export function updateProjectiles(safeDelta, gameMap, bullets, bots, player, particleManager, noiseManager, addKillFeed) {
    bullets.forEach(bullet => {
        if (bullet.type === 'bullet') {
            bullet.update(safeDelta, gameMap);
            bots.forEach(bot => {
                if (bullet.active && bot.health > 0 && bullet.owner !== bot.id) {
                    const dx = bullet.gridX - bot.gridX; const dy = bullet.gridY - bot.gridY;
                    if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
                        bot.health -= bullet.damage; bullet.active = false; window.spawnBlood(bot.gridX, bot.gridY, bullet.dirX, bullet.dirY);
                        if ((bullet.distanceTraveled || 0) <= 3.0) { bot.kbX = bullet.dirX * 6; bot.kbY = bullet.dirY * 6; bot.kbTimer = 0.15; }
                        if (bot.health <= 0) { let killerName = bullet.owner === 'player' ? player.name : (bots.find(b => b.id === bullet.owner)?.name || "Kẻ địch"); if (bullet.owner === 'player') player.kills++; addKillFeed(killerName, bot.name); }
                    }
                }
            });
            if (bullet.active && player.health > 0 && bullet.owner !== player.id) {
                const dx = bullet.gridX - player.gridX; const dy = bullet.gridY - player.gridY;
                if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
                    player.health -= bullet.damage; bullet.active = false; window.spawnBlood(player.gridX, player.gridY, bullet.dirX, bullet.dirY);
                    if ((bullet.distanceTraveled || 0) <= 3.0) { player.kbX = bullet.dirX * 6; player.kbY = bullet.dirY * 6; player.kbTimer = 0.15; }
                    if (player.health <= 0) { let killerName = bots.find(b => b.id === bullet.owner)?.name || "Kẻ địch"; addKillFeed(killerName, player.name); }
                }
            }
        } else if (bullet.type === 'grenade_proj') {
            if (bullet.timer > 0) {
                bullet.gridX += bullet.vx * safeDelta; bullet.gridY += bullet.vy * safeDelta; bullet.vx *= 0.92; bullet.vy *= 0.92; bullet.timer -= safeDelta;
                if (gameMap.isSolid(bullet.gridX, bullet.gridY)) { bullet.vx *= -0.5; bullet.vy *= -0.5; }
                if (bullet.timer <= 0) {
                    bullet.exploded = true; noiseManager.addNoise(bullet.gridX, bullet.gridY, 60);
                    const applyBlast = (ent) => {
                        const dx = ent.gridX - bullet.gridX; const dy = ent.gridY - bullet.gridY; const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                        if (dist <= 5.0) {
                            ent.health -= 250 * Math.pow(1 - (dist / 5.0), 1.5); ent.kbX = (dx/dist) * 12; ent.kbY = (dy/dist) * 12; ent.kbTimer = 0.6;
                            if (ent.health <= 0) { ent.explodedToPieces = true; window.spawnGibs(ent.gridX, ent.gridY); for(let i=0; i<6; i++) particleManager.addBlood(ent.gridX, ent.gridY, (dx/dist)*Math.random(), (dy/dist)*Math.random()); } 
                            else { particleManager.addBlood(ent.gridX, ent.gridY, dx/dist, dy/dist); }
                        }
                    };
                    bots.forEach(b => { if (b.health > 0) applyBlast(b); }); if (player.health > 0) applyBlast(player);
                }
            } else { bullet.timer -= safeDelta; if (bullet.timer < -0.25) bullet.active = false; }
        }
    });

    return bullets.filter(b => b.active); 
}
