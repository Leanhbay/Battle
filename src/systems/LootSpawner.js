// src/systems/LootSpawner.js
import { Item } from '../entities/Item.js';

export function spawnRandomLoot(props, gameMap, pushItemCallback) {
    const getValidSpawnPoint = () => {
        let cx, cy; const rand = Math.random();
        if (rand < 0.7 && props.length > 0) { let p = props[Math.floor(Math.random() * props.length)]; cx = p.gridX + (Math.random() * 3 - 1.5); cy = p.gridY + (Math.random() * 3 - 1.5); } 
        else if (rand < 0.9) { if (Math.random() > 0.5) { cx = Math.random() < 0.5 ? Math.random() * 15 + 2 : 185 + Math.random() * 10; cy = Math.random() * 195 + 2; } else { cx = Math.random() * 195 + 2; cy = Math.random() < 0.5 ? Math.random() * 15 + 2 : 185 + Math.random() * 10; } } 
        else { cx = Math.random() * 190 + 5; cy = Math.random() * 190 + 5; }
        return { cx: Math.max(2, Math.min(198, cx)), cy: Math.max(2, Math.min(198, cy)) };
    };

    const tryPushItem = (item) => { let attempts = 0; while(gameMap.isSolid(item.gridX, item.gridY) && attempts < 5) { item.gridX += (Math.random() - 0.5); item.gridY += (Math.random() - 0.5); attempts++; } pushItemCallback(item); };

    const weaponsList = [
        { id: 'm4a1', name: 'Súng M4A1', ammoName: 'Đạn 5.56mm', ammoColor: '#556b2f', ammoPack: 30 }, { id: 'scar', name: 'Súng SCAR', ammoName: 'Đạn 5.56mm', ammoColor: '#556b2f', ammoPack: 30 },
        { id: 'famas', name: 'Súng Famas', ammoName: 'Đạn 5.56mm', ammoColor: '#556b2f', ammoPack: 30 }, { id: 'akm', name: 'Súng AKM', ammoName: 'Đạn 7.62mm', ammoColor: '#7b241c', ammoPack: 30 },
        { id: 'p90', name: 'Súng P90', ammoName: 'Đạn 9mm', ammoColor: '#e67e22', ammoPack: 50 }, { id: 'uzi', name: 'Súng Uzi', ammoName: 'Đạn 9mm', ammoColor: '#e67e22', ammoPack: 32 },
        { id: 'shotgun', name: 'Súng Shotgun', ammoName: 'Đạn 12.0mm', ammoColor: '#e74c3c', ammoPack: 8 }, { id: 'glock', name: 'Súng Glock', ammoName: 'Đạn 9.19mm', ammoColor: '#3498db', ammoPack: 17 }
    ];

    weaponsList.forEach(w => { for(let i=0; i < 40; i++) { let pt = getValidSpawnPoint(); tryPushItem(new Item(w.name, pt.cx, pt.cy, '#333', 'weapon', w.id)); if (w.ammoName) tryPushItem(new Item(w.ammoName, pt.cx + 0.4, pt.cy + 0.4, w.ammoColor, 'ammo', w.ammoPack)); } });

    const ammoSpecs = [
        { name: 'Đạn 5.56mm', color: '#556b2f', pack: 30, total: 1800 }, { name: 'Đạn 7.62mm', color: '#7b241c', pack: 30, total: 1800 },
        { name: 'Đạn 9mm', color: '#e67e22', pack: 50, total: 1800 }, { name: 'Đạn 12.0mm', color: '#e74c3c', pack: 8, total: 1000 },
        { name: 'Đạn 9.19mm', color: '#3498db', pack: 17, total: 1800 }
    ];
    ammoSpecs.forEach(a => { let totalBoxes = Math.ceil(a.total / a.pack); for(let i=0; i < totalBoxes; i++) { let pt = getValidSpawnPoint(); tryPushItem(new Item(a.name, pt.cx, pt.cy, a.color, 'ammo', a.pack)); } });

    for(let i=0; i < 70; i++) { let pt = getValidSpawnPoint(); tryPushItem(new Item('Lựu Đạn', pt.cx, pt.cy, '#2ecc71', 'throwable', 1)); }
    for(let i=0; i < 150; i++) { let pt = getValidSpawnPoint(); tryPushItem(new Item('Túi Cứu Thương', pt.cx, pt.cy, '#d32f2f', 'heal', 30)); pt = getValidSpawnPoint(); tryPushItem(new Item('Chai Nước', pt.cx, pt.cy, '#3498db', 'water', 40)); }
    tryPushItem(new Item('Súng Shotgun', 11, 16, '#333', 'weapon', 'shotgun')); tryPushItem(new Item('Đạn 12.0mm', 11.5, 16.5, '#e74c3c', 'ammo', 8));
}
