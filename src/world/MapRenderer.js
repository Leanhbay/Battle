// src/world/MapRenderer.js
import { TILE_WIDTH, TILE_HEIGHT, colorGrass1, colorGrass2, colorSand, colorWater } from '../utils/Constants.js';

export function renderMap(ctx, gameMap, minRow, maxRow, minCol, maxCol, camX, camY, gameTime, gridToScreen) {
    ctx.lineWidth = 0; 
    for (let sum = minRow + minCol; sum <= maxRow + maxCol; sum++) {
        for (let row = minRow; row <= maxRow; row++) {
            let col = sum - row;
            if (col >= minCol && col <= maxCol) {
                const pos = gridToScreen(col, row, TILE_WIDTH, TILE_HEIGHT, camX, camY);
                if (!pos || pos.x < -TILE_WIDTH * 2 || pos.x > ctx.canvas.width + TILE_WIDTH * 2 || pos.y < -TILE_HEIGHT * 4 || pos.y > ctx.canvas.height + TILE_HEIGHT * 4) continue;
                const tileType = gameMap.getTile(col, row); const pX = Math.round(pos.x); const pY = Math.round(pos.y);

                ctx.beginPath(); ctx.moveTo(pX, pY - 0.5); ctx.lineTo(pX + TILE_WIDTH / 2 + 0.5, pY + TILE_HEIGHT / 2); ctx.lineTo(pX, pY + TILE_HEIGHT + 0.5); ctx.lineTo(pX - TILE_WIDTH / 2 - 0.5, pY + TILE_HEIGHT / 2); ctx.closePath(); 
                let colHex = (Math.abs(row + col) % 2 === 0) ? colorGrass1 : colorGrass2; if (tileType === 3) colHex = colorWater; else if (tileType === 4) colHex = colorSand; 
                ctx.fillStyle = colHex; ctx.fill(); 

                if (tileType === 3) {
                    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1;
                    let waveX = (gameTime * 15) % (TILE_WIDTH); ctx.beginPath(); ctx.moveTo(pX - TILE_WIDTH/2 + waveX, pY + TILE_HEIGHT/2 + Math.sin(gameTime*2 + col)*4); ctx.lineTo(pX + waveX, pY + TILE_HEIGHT/2 + Math.cos(gameTime*2 + row)*4); ctx.stroke(); ctx.restore();
                }
            }
        }
    }
}
