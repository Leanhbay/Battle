// src/utils/Constants.js
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export const colorGrass1 = '#2d402d';
export const colorGrass2 = '#354c35';
export const colorSand = '#d6b971';
export const colorWater = '#1e405e';

export const allGuns = ['m4a1', 'scar', 'akm', 'famas', 'p90', 'uzi', 'shotgun', 'glock'];
export const isGun = (val) => allGuns.includes(val);

export const createGlobalNoisePattern = () => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const ctxTex = c.getContext('2d');
    ctxTex.clearRect(0, 0, 128, 128); 
    ctxTex.fillStyle = 'rgba(0, 0, 0, 0.15)'; for(let i=0; i<300; i++) ctxTex.fillRect(Math.floor(Math.random()*64)*2, Math.floor(Math.random()*64)*2, 2, 2);
    ctxTex.fillStyle = 'rgba(255, 255, 255, 0.1)'; for(let i=0; i<300; i++) ctxTex.fillRect(Math.floor(Math.random()*64)*2, Math.floor(Math.random()*64)*2, 2, 2);
    return c; // Trả về canvas để main.js tạo pattern
};
