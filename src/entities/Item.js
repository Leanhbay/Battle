// src/entities/Item.js
import { Grenade } from './Grenade.js';

export class Item {
    static spriteCache = {};

    static getSprite(name) {
        if (this.spriteCache[name]) return this.spriteCache[name];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cols = 20; const rows = 16; const pixelSize = 1.3; 
        canvas.width = cols * pixelSize; canvas.height = rows * pixelSize;

        let map = [];
        const colors = {
            '0': 'transparent',
            '4': '#ffffff', '5': '#bdbdbd',                 
            '6': '#b71c1c', '7': '#e53935', '8': '#ffcdd2', 
            'e': '#1565c0', 'f': '#4fc3f7', 'g': '#b3e5fc', 'h': '#ffffff', 
            
            'k': '#0a0a0a', 
            't': '#7cb342', 'l': '#558b2f', 'r': '#33691e', 'y': '#f1c40f',
            'p': '#85c1e9', 'm': '#3498db', 'q': '#21618c', 'v': '#ecf0f1',
            'o': '#e67e22', 'i': '#d35400', 'u': '#a04000', 
            'w': '#a93226', 'x': '#7b241c', 'z': '#641e16', 
            'B': '#e74c3c', 'C': '#c0392b', 'F': '#922b21', 
            
            // Màu Lựu đạn
            'G': '#2ecc71', 'H': '#27ae60', 'J': '#1e8449', 'K': '#d0d3d4',
            
            'a': '#333333', 'b': '#1c1c1c', 'c': '#cfa97a', 'd': '#91714d', 's': '#8B4513' 
        };

        if (name === 'Chai Nước') { 
            map = [
                "0000000eee0000000000", "0000000eee0000000000", "0000000f4f0000000000", "000000ffgff000000000",
                "000000ffgff000000000", "000000ffgff000000000", "00000hhhhhhh00000000", "00000heeeegh00000000",
                "00000hhhhhhh00000000", "000000ffgff000000000", "000000ffgff000000000", "000000ffffff00000000",
                "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        } 
        else if (name === 'Túi Cứu Thương') {
            map = [
                "00000000000000000000", "000000kkkk0000000000", "000000k44k0000000000", "0000kkkkkkkkk0000000",
                "000k666666666k000000", "00k66664466666k00000", "00k66664466666k00000", "00k66444444666k00000", 
                "00k66444444666k00000", "00k66664466666k00000", "00k66664466666k00000", "000k666666666k000000",
                "0000kkkkkkkkk0000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        }
        else if (name === 'Đạn 5.56mm') {
            map = [
                "000000000kkkkkkkkk00", "00000000kttttttttk00", "0000000kttttttttkr00", "000000kttttttttkrr00",
                "00000kkkkkkkkkkrrr00", "00000kllllllllkrrk00", "00000klyyyylllkrrk00", "00000klkkkklllkrrk00",
                "00000klyyyylllkrk000", "00000klkkkklllkrk000", "00000kllllllllkrk000", "00000kllllllllkk0000",
                "00000kkkkkkkkkk00000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        }
        else if (name === 'Đạn 9.19mm') {
            map = [
                "000000000kkkkkkkkk00", "00000000kppppppppk00", "0000000kppppppppkq00", "000000kppppppppkqq00",
                "00000kkkkkkkkkkqqq00", "00000kmmmmmmmmkqqk00", "00000kmvvvvmmmkqqk00", "00000kmkkkkmmmkqqk00",
                "00000kmvvvvmmmkqk000", "00000kmkkkkmmmkqk000", "00000kmmmmmmmmkqk000", "00000kmmmmmmmmkk0000",
                "00000kkkkkkkkkk00000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        } 
        else if (name === 'Đạn 9mm') {
            map = [
                "000000000kkkkkkkkk00", "00000000kooooooook00", "0000000kooooooooku00", "000000kooooooookuu00",
                "00000kkkkkkkkkkuuu00", "00000kiiiiiiiikuuk00", "00000kivvvviiikuuk00", "00000kikkkkiiikuuk00",
                "00000kivvvviiikuk000", "00000kikkkkiiikuk000", "00000kiiiiiiiikuk000", "00000kiiiiiiiikk0000",
                "00000kkkkkkkkkk00000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        } 
        else if (name === 'Đạn 7.62mm') {
            map = [
                "000000000kkkkkkkkk00", "00000000kwwwwwwwwk00", "0000000kwwwwwwwwkz00", "000000kwwwwwwwwkzz00",
                "00000kkkkkkkkkkzzz00", "00000kxxxxxxxxkzzk00", "00000kxvvvvxxxkzzk00", "00000kxkkkkxxxkzzk00",
                "00000kxvvvvxxxkzk000", "00000kxkkkkxxxkzk000", "00000kxxxxxxxxkzk000", "00000kxxxxxxxxkk0000",
                "00000kkkkkkkkkk00000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        } 
        else if (name === 'Đạn 12.0mm') {
            map = [
                "000000000kkkkkkkkk00", "00000000kBBBBBBBBk00", "0000000kBBBBBBBBkF00", "000000kBBBBBBBBkFF00",
                "00000kkkkkkkkkkFFF00", "00000kCCCCCCCCkFFk00", "00000kCvvvvCCCkFFk00", "00000kCkkkkCCCkFFk00",
                "00000kCvvvvCCCkFk000", "00000kCkkkkCCCkFk000", "00000kCCCCCCCCkFk000", "00000kCCCCCCCCkk0000",
                "00000kkkkkkkkkk00000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        }
        // TÍNH NĂNG MỚI: Icon Lựu Đạn Nét
        else if (name === 'Lựu Đạn') {
            map = [
                "00000000000000000000", "000000kkkkk000000000", "00000kGGGGkKkk000000", "00000kGGHk0000k00000",
                "000000kkkk0000k00000", "00000kGGGGkKkk000000", "0000kkkkkkkk00000000", "000kHkJJJkHk00000000",
                "00kGGkJJJkGGk0000000", "00kHkJJJkHk000000000", "000kkkkkkkk000000000", "00000000000000000000",
                "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"
            ];
        }
        else if (name === 'Súng M4A1') { map = ["00000000000000000000", "00000000000000000000", "00000000000000000000", "000000000000kkk00000", "0000000kkkkkkk000000", "00kkkkkkkkkkkkkkk000", "00kkkkkkkkkk00000000", "0000kk000k0000000000", "0000kk00000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng SCAR') { map = ["00000000000000000000", "00000000000000000000", "0000000000000k000000", "000000000k000kk00000", "0000000cccccccccd000", "00dcccdddddddddd0000", "0000cc000c0000000000", "0000cc00000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng AKM') { map = ["00000000000000000000", "00000000000000000000", "0000000000000k000000", "0000000kkkkkkk000000", "00000kkkkyksss000000", "00kkkkkkkkkk00000000", "00ss000k000000000000", "000000ks000000000000", "000000ks000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng Famas') { map = ["00000000000000000000", "00000000000000000000", "000000000kkkkkk00000", "000000000k00x0k00000", "0000kk00xkkkkkk00000", "0000kkkkkkkkkkkkkkk0", "0000kkk00000k00k0000", "000000000000k0k00000", "00000000000kkkk00000", "00000000000kk0000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng Shotgun') { map = ["00000000000000000000", "00000000000000000000", "0000000000000000000k", "0000000kkkkkkkkkkkkk", "0kkkk00kaaaaaakkkkk0", "0kkkkkkkaaaaaa000000", "0kkkkkkk00k000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng Uzi') { map = ["00000000000000000000", "00000000000000000000", "00000000000000000000", "00000k0000k000000000", "0000kkkkkkkkkk000000", "0000kkkkkkkkkkkk0000", "0000kk00k00000000000", "00000000k00000000000", "00000000k00000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng Glock') { map = ["00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "0000000kkkkkkk000000", "0000000kaaaaak000000", "0000000000kkkk000000", "00000000000kk0000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Súng P90') { map = ["00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000k00000000000", "0000000k555555k00000", "00000kkkkkkkkkkk0000", "00000kk000kk000k0000", "0000000kkkkkk0000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else if (name === 'Mã Tấu') { map = ["00000000000000000000", "00000000000000044000", "00000000000000440000", "00000000000004400000", "00000000000044000000", "00000000000440000000", "000000000a4400000000", "00000000aa0000000000", "0000000aa00000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000000"]; }
        else { map = ["0k0", "k0k", "0k0"]; }

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if(map[y][x] !== '0') {
                    ctx.fillStyle = colors[map[y][x]];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        
        this.spriteCache[name] = canvas;
        return canvas;
    }

    constructor(name, gridX, gridY, color, itemType = 'heal', value = 20) {
        this.type = 'item';
        this.itemType = itemType; 
        this.name = name;
        this.value = value;
        this.gridX = gridX;
        this.gridY = gridY;
        this.color = color;
        this.width = 16; 
        this.height = 16;
        this.sprite = Item.getSprite(name);
        this.iconUrl = this.sprite.toDataURL();
    }

    use(player, bulletsArray) {
        if (this.itemType === 'ammo' || this.itemType === 'weapon') return; 
        if (this.name === 'Túi Cứu Thương') { player.startHealing(5.0, 30); return; }
        if (this.itemType === 'water') { player.startDrinking(5.0, this.value); return; }
        // TÍNH NĂNG MỚI: Nếu sử dụng lựu đạn thì quăng ra mặt đất theo hướng đang quay
        if (this.name === 'Lựu Đạn') {
            const dirLength = Math.sqrt(player.facingX**2 + player.facingY**2) || 1;
            const normX = player.facingX / dirLength; 
            const normY = player.facingY / dirLength;
            const spawnX = player.gridX + normX; 
            const spawnY = player.gridY + normY;
            bulletsArray.push(new Grenade(spawnX, spawnY, normX, normY));
        }
    }
}
