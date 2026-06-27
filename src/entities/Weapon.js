// src/entities/Weapon.js

export class WeaponManager {
    static generateSprite(type) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const colors = {
            '0': 'transparent', 
            '1': '#111111', '2': '#1c1c1c', '3': '#050505', '4': '#2b2b2b', 
            't': '#c5a982', 'd': '#947a5d', 'r': '#6e5a43', 
            'g': '#888888', 'h': '#555555', 
            'w': '#8B4513', 'x': '#5C4033', 'y': '#ffd700',
            'c': '#e74c3c' // Đỏ chót cho vỏ đạn Shotgun
        };

        const drawMatrix = (map, pixelSize) => {
            const rows = map.length; const cols = map[0].length;
            canvas.width = cols * pixelSize; canvas.height = rows * pixelSize;
            for(let y=0; y<rows; y++) { 
                for(let x=0; x<cols; x++) { 
                    if(map[y][x] !== '0') { 
                        ctx.fillStyle = colors[map[y][x]]; ctx.fillRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize); 
                    } 
                } 
            }
            return { w: cols*pixelSize, h: rows*pixelSize };
        };

        if (type === 'm4a1_body') {
            const pixelSize = 0.9; 
            const map = [
                "000000000000000000000000000000000000000000000",
                "000000000000000033333330000000000000003000000",
                "000000000000000030000030000000000000033000000",
                "000000000000000033333330000000000000333000000",
                "033333333333333333333333333333333333333333330",
                "034444444444444444444444111111111111113000000",
                "003444430034444444444444122222222222213000000",
                "000000000003444034444300000000000000000000000",
                "000000000000343000000000000000000000000000000",
                "000000000000033000000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 19*pixelSize, magY: 6*pixelSize, muzzleX: 43*pixelSize, muzzleY: 4.5*pixelSize };
        }
        else if (type === 'm4a1_mag') {
            const pixelSize = 0.9;
            const map = ["333333000", "344443000", "342243000", "034224300", "034224300", "034224430", "003422430", "003444430", "003333330", "000000000"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'scar_body') {
            const pixelSize = 0.9; 
            const map = [
                "00000000000000000000000000000000000030000000000000",
                "00000000000300000000000000000000000030000000000000",
                "00000000000303030303030303030303030030000000000000",
                "00000000000333tttttttttttttttttttttt30000000000000",
                "000000000003ttdddddddddddddddddddddt30000000000000",
                "033000000003tdtttttttttttttttdtttdtt33330000000000",
                "03t333330003tr111111111111111dtttdtt30033333333330",
                "03tttdd33333tr111111111111111dtttdtt30000000000000",
                "03tttdddddd3tr333333333333333dtttdtt30000000000000",
                "03tttdrrrrr0000000tt30000000rrtttdtt30000000000000",
                "03tttdr00000000000tt3000000000rttdtt30000000000000",
                "03tttdr00000000000tt30000000000rrrdd30000000000000",
                "03tttdr00000000000tt300000000000000000000000000000",
                "03333330000000000000000000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 18*pixelSize, magY: 9*pixelSize, muzzleX: 49*pixelSize, muzzleY: 6.5*pixelSize };
        }
        else if (type === 'scar_mag') {
            const pixelSize = 0.9;
            const map = ["33333330", "3ddrrdd3", "3ddrrdd3", "3ddrrdd3", "3ddrrdd3", "3ddrrdd3", "3ddrrdd3", "33333330"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'akm_body') {
            const pixelSize = 0.9; 
            const map = [
                "00000000000000000000000000000000000000030000",
                "00000000000000000000000000000000000000030000",
                "00000000000000000000000000000000000000033300",
                "00000000000000000033333333333330000033330000",
                "000000000000003333444yy444wwwww3333330000000",
                "00000000000033444444444444wwwww3000000000000",
                "000wwwww000344444300333333333330000000000000",
                "000wwwwwxx3344444300000000000000000000000000",
                "000xwwwwxx0034443000000000000000000000000000",
                "000xwwwwx00003w30000000000000000000000000000",
                "0000xxxx000003w30000000000000000000000000000",
                "00000000000000300000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 19*pixelSize, magY: 7*pixelSize, muzzleX: 42*pixelSize, muzzleY: 4.5*pixelSize };
        }
        else if (type === 'akm_mag') {
            const pixelSize = 0.9;
            const map = ["333330000", "344443000", "344443000", "034444300", "034444300", "003444430", "003444430", "000344443", "000333330", "000000000"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'famas_body') {
            const pixelSize = 0.85; 
            const map = [
                "00000000000000000000000000000000000000000",
                "00000000000000000033333333333333000000000",
                "00000000000000000030000000g00003000000000",
                "00000000000000000030000000000003000000000",
                "03330000g00000000033333333333333000000000",
                "03133333g33333333333333333333333333333000",
                "03111111111111111111111111111111111113000",
                "03111110000000333000030000333000000000000",
                "00331110000000000000030000300300000000000",
                "00000000000000000000033333300000000000000",
                "00000000000000000000031113000000000000000",
                "00000000000000000000031113000000000000000",
                "00000000000000000000033333000000000000000",
                "00000000000000000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 7*pixelSize, magY: 7*pixelSize, muzzleX: 38*pixelSize, muzzleY: 5.5*pixelSize };
        }
        else if (type === 'famas_mag') {
            const pixelSize = 0.85; 
            const map = ["33330", "34430", "34430", "34430", "34430", "34430", "33330"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        // TÍNH NĂNG MỚI: SHOTGUN PIXEL ART SIÊU THỰC
        else if (type === 'shotgun_body') {
            const pixelSize = 0.9; 
            const map = [
                "00000000000000000000000000000000000000000000000010",
                "00000000000000000000222222222222222222222222222211", 
                "00000000000000000000333333333333311111111111111000", 
                "01111111000000000000333333333333314141414141411000", 
                "01111111110000000000333333333333314141414141411000",
                "01111111111100000000333333330000011111111111111000",
                "01111111111111111111333033000000000000000000000000",
                "01111111111111111111110000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            // Shotgun có độ dài lớn, cần lệch nòng xa hơn
            return { img: canvas, w: dims.w, h: dims.h, magX: 0, magY: 0, muzzleX: 49*pixelSize, muzzleY: 1.5*pixelSize };
        }
        else if (type === 'shotgun_mag') {
            // Khi shotgun bắn/nạp đạn sẽ văng vỏ đạn đỏ ra
            const pixelSize = 0.9; 
            const map = [
                "111",
                "ccc",
                "ccc",
                "ccc",
                "yyy"
            ];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'p90_body') {
            const pixelSize = 0.8; 
            const map = [
                "000000000000000000000000000000000",
                "000000000000333333333000000000000",
                "000000000000311111113000000000000",
                "000000000000311111113333333330000",
                "033333333333311111111111111130000",
                "032222222222211111111111111133333",
                "032222222222211111111111111122223",
                "032222223333311111113333333333333",
                "032222230000031111130000000000000",
                "003222300000003333300000000000000",
                "000323000000000322300000000000000",
                "000322333333333222300000000000000",
                "000032222222222223000000000000000",
                "000003333333333330000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 13*pixelSize, magY: 1*pixelSize, muzzleX: 32*pixelSize, muzzleY: 6*pixelSize };
        }
        else if (type === 'p90_mag') {
            const pixelSize = 0.8; 
            const map = ["00000000000000000", "hghghghghghghghg0", "hghghghghghghghg0", "hghghghghghghghg0"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'uzi_body') {
            const pixelSize = 0.7; 
            const map = [
                "003000000000300",
                "003334444433300",
                "333333333333333",
                "333000330000000",
                "000000330000000",
                "000000330000000",
                "000000330000000",
                "000000330000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 6*pixelSize, magY: 6*pixelSize, muzzleX: 14*pixelSize, muzzleY: 2.5*pixelSize };
        }
        else if (type === 'uzi_mag') {
            const pixelSize = 0.7; const map = ["33", "34", "34", "34", "34", "34", "33"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }

        else if (type === 'glock_body') {
            const pixelSize = 0.6; 
            const map = [
                "0000000000000000000000", "0033333333333333333330", "0343434344444444444443",
                "0344444444444444444443", "0333333333333333333330", "0311111111111111111113",
                "0311111111133333333330", "0031111111300300000000", "0031111113000000000000",
                "0003111113000000000000", "0003111113000000000000", "0000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize);
            return { img: canvas, w: dims.w, h: dims.h, magX: 3*pixelSize, magY: 10*pixelSize, muzzleX: 21*pixelSize, muzzleY: 2.5*pixelSize };
        }
        else if (type === 'glock_mag') {
            const pixelSize = 0.6; const map = ["33330", "03433", "03433", "03433", "03433", "03333", "00000"];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
        else if (type === 'melee') {
            const pixelSize = 0.8; 
            const map = [
                "00000000000000000000000000000000000", "0000000000000000000000000000gghg000",
                "0000000000000000000000000gghhhhg000", "0000000000000004444444444gghhhhg000", 
                "00000333333333344gggggggggggggg0000", "00003331111113344gggggggggggg000000", 
                "00003331111113344gggggg000000000000", "00000000000000044000000000000000000", 
                "00000000000000000000000000000000000", "00000000000000000000000000000000000"
            ];
            const dims = drawMatrix(map, pixelSize); return { img: canvas, w: dims.w, h: dims.h };
        }
    }
}
