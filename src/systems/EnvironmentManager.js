// src/systems/EnvironmentManager.js

export function updateEnvironment(safeDelta, flocks, gibs, props, player) {
    // Cập nhật bầy chim
    flocks.forEach(flock => {
        flock.timer -= safeDelta;
        if (flock.timer <= 0) {
            if (flock.state === 'flying') { flock.state = 'resting'; flock.timer = 5 + Math.random() * 15; if (props.length > 0) flock.targetProp = props[Math.floor(Math.random() * props.length)]; } 
            else { flock.state = 'flying'; flock.timer = 10 + Math.random() * 15; flock.targetProp = null; flock.targetX = (player.gridX || 100) + (Math.random() - 0.5) * 40; flock.targetY = (player.gridY || 100) + (Math.random() - 0.5) * 40; flock.targetX = Math.max(5, Math.min(195, flock.targetX)); flock.targetY = Math.max(5, Math.min(195, flock.targetY)); }
        }
        let tX, tY, tZ;
        if (flock.state === 'resting' && flock.targetProp) { tX = flock.targetProp.gridX; tY = flock.targetProp.gridY; if (flock.targetProp.propType === 'tree_large') tZ = 4.2; else if (flock.targetProp.propType === 'rock_large') tZ = 1.0; else tZ = 0.5; } 
        else { tX = flock.targetX; tY = flock.targetY; tZ = 6; }
        flock.birds.forEach(b => {
            b.flapTimer += safeDelta * (15 + Math.random() * 5); let myTX = tX + b.offsetX; let myTY = tY + b.offsetY;
            if (flock.state === 'resting' && tZ <= 1.0) { if (Math.random() < 0.01) { b.offsetX = (Math.random() - 0.5) * 2; b.offsetY = (Math.random() - 0.5) * 2; b.z = tZ + 0.5; } }
            let dx = myTX - b.x; let dy = myTY - b.y; let dz = tZ - b.z; let dist = Math.sqrt(dx*dx + dy*dy); let speed = flock.state === 'flying' ? 5 : 3;
            if (dist > 0.2) { b.vx += (dx / dist * speed - b.vx) * safeDelta * 3; b.vy += (dy / dist * speed - b.vy) * safeDelta * 3; } else { b.vx *= 0.8; b.vy *= 0.8; }
            b.z += dz * safeDelta * 3; if (b.z < tZ && flock.state === 'resting') b.z = tZ; b.x += b.vx * safeDelta; b.y += b.vy * safeDelta;
        });
    });

    // Cập nhật các mảnh xác
    gibs.forEach(g => {
        g.x += g.vx * safeDelta; g.y += g.vy * safeDelta; g.z += g.vz * safeDelta; g.vz -= 35 * safeDelta; g.rot += g.vRot;
        if (g.z <= 0) { g.z = 0; g.vx *= 0.5; g.vy *= 0.5; g.vRot *= 0.5; if (Math.abs(g.vz) > 3) { g.vz *= -0.3; window.spawnBlood(Math.floor(g.x), Math.floor(g.y), 0, 0); } else { g.vz = 0; } }
    });
}
