// src/utils/SpriteGenerator.js

const frames = {
    front: {
        idle: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hsSssSsh0000", "0000sEwsEwsS0000",
            "0000sSSssSSs0000", "00000sSSSSs00000", "00000tTTTTt00000", "000ttTTTTTTtt000",
            "00ssTtTTTTtTss00", "00SS0tTTTTt0SS00", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "0000pPPppPPp0000", "0000pPP00PPp0000", "000bbBB00BBbb000", "000BBBB00BBBB000"
        ],
        walk1: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hsSssSsh0000", "0000sEwsEwsS0000",
            "0000sSSssSSs0000", "00000sSSSSs00000", "00000tTTTTt00000", "000ttTTTTTTt0000",
            "00ssTtTTTTtT0000", "00SS0tTTTTtS0000", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "0000pPPppPP00000", "0000pPP00pPP0000", "000bbBB000bBB000", "000BBBB000BBB000"
        ],
        walk2: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hsSssSsh0000", "0000sEwsEwsS0000",
            "0000sSSssSSs0000", "00000sSSSSs00000", "00000tTTTTt00000", "0000tTTTTTTtt000",
            "0000TtTTTTtTss00", "0000StTTTTt0SS00", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "00000PPppPPp0000", "0000PPp00PPp0000", "000bBB000BBbb000", "000BBB000BBBB000"
        ]
    },
    back: {
        idle: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hhhhhhhh0000", "0000hHhhhhHh0000",
            "0000hHhhhhHh0000", "00000hhhhhh00000", "00000tTTTTt00000", "000ttTTTTTTtt000",
            "00ssTtTTTTtTss00", "00SS0tTTTTt0SS00", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "0000pPPppPPp0000", "0000pPP00PPp0000", "000bbBB00BBbb000", "000BBBB00BBBB000"
        ],
        walk1: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hhhhhhhh0000", "0000hHhhhhHh0000",
            "0000hHhhhhHh0000", "00000hhhhhh00000", "00000tTTTTt00000", "000ttTTTTTTt0000",
            "00ssTtTTTTtT0000", "00SS0tTTTTtS0000", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "0000pPPppPP00000", "0000pPP00pPP0000", "000bbBB000bBB000", "000BBBB000BBB000"
        ],
        walk2: [
            "00000hhhhhh00000", "0000hHhhhhHh0000", "0000hhhhhhhh0000", "0000hHhhhhHh0000",
            "0000hHhhhhHh0000", "00000hhhhhh00000", "00000tTTTTt00000", "0000tTTTTTTtt000",
            "0000TtTTTTtTss00", "0000StTTTTt0SS00", "00000AAAAAA00000", "0000pPPPPPPp0000",
            "00000PPppPPp0000", "0000PPp00PPp0000", "000bBB000BBbb000", "000BBB000BBBB000"
        ]
    },
    // Đã lật ngược (reverse string) 100% mảng side để mặt mặc định nhìn sang phải
    side: {
        idle: [
            "000000hhhh000000", "00000HhhhHh00000", "000000SssSh00000", "000000SswEs00000",
            "000000SsSSs00000", "000000sSSs000000", "000000tTTt000000", "00000tTTtTs00000",
            "00000TTTttS00000", "00000TTTt0000000", "000000AAAA000000", "000000PPPp000000",
            "000000PPPp000000", "000000PPPp000000", "000000BBBb000000", "000000BBBB000000"
        ],
        walk1: [
            "000000hhhh000000", "00000HhhhHh00000", "000000SssSh00000", "000000SswEs00000",
            "000000SsSSs00000", "000000sSSs000000", "000000tTTt000000", "00000tTTtTs00000",
            "00000TTTttS00000", "00000TTTt0000000", "000000AAAA000000", "000000pPPp000000",
            "00000pP0PPp00000", "0000Pp000Pp00000", "000BBb000BBb0000", "000BBB000BBB0000"
        ],
        walk2: [
            "000000hhhh000000", "00000HhhhHh00000", "000000SssSh00000", "000000SswEs00000",
            "000000SsSSs00000", "000000sSSs000000", "000000tTTt000000", "00000tTTtTs00000",
            "00000TTTttS00000", "00000TTTt0000000", "000000AAAA000000", "000000pPPp000000",
            "0000000PPp000000", "0000000PPp000000", "0000000BBb000000", "0000000BBB000000"
        ]
    }
};

export function generateCharacterSprites(shirtD, shirtL, pantsD, pantsL) {
    const pal = {
        '0': null,
        'H': '#2c1b18', 'h': '#4a3525', 
        'S': '#c0885c', 's': '#ffcd94', 
        'E': '#000000', 'w': '#ffffff', 
        'T': shirtD, 't': shirtL,       
        'P': pantsD, 'p': pantsL,       
        'B': '#2d3436', 'b': '#636e72', 
        'A': '#2d2d2d'                  
    };
    
    // Đã thay đổi Scale xuống 3 -> Hình ảnh xuất ra sẽ là 48x48 Pixel (Kích thước Chuẩn)
    const scale = 3; 
    const result = {};

    for (const dir in frames) {
        result[dir] = {};
        for (const state in frames[dir]) {
            const matrix = frames[dir][state];
            const canvas = document.createElement('canvas');
            canvas.width = matrix[0].length * scale;   
            canvas.height = matrix.length * scale;     
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            for (let r = 0; r < matrix.length; r++) {
                for (let c = 0; c < matrix[r].length; c++) {
                    const char = matrix[r][c];
                    if (pal[char]) {
                        ctx.fillStyle = pal[char];
                        ctx.fillRect(c * scale, r * scale, scale, scale);
                    }
                }
            }
            result[dir][state] = canvas;
        }
    }
    return result;
}
