// src/utils/Isometric.js
export function gridToScreen(gridX, gridY, tileWidth, tileHeight, offsetX, offsetY) {
    const screenX = (gridX - gridY) * (tileWidth / 2) + offsetX;
    const screenY = (gridX + gridY) * (tileHeight / 2) + offsetY;
    return { x: screenX, y: screenY };
}
