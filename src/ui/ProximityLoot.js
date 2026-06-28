// src/ui/ProximityLoot.js
import { Item } from '../entities/Item.js';
import { isGun } from '../utils/Constants.js';

export function setupProximityLoot(getState, pushItemCallback, sfx) {
    const lootMenu = document.getElementById('proximity-loot');
    if (!lootMenu) return () => {};

    const handleLoot = (e) => {
        const { player, itemsOnGround } = getState();
        const target = e.target.closest('.loot-item');
        if (target && player.health > 0) {
            e.preventDefault(); e.stopPropagation(); 
            const itemUid = target.getAttribute('data-uid');
            const idx = itemsOnGround.findIndex(i => i.uid === itemUid);
            if (idx !== -1) {
                const itm = itemsOnGround[idx];
                if (itm.itemType === 'ammo') {
                    if (!player.reserveAmmo) player.reserveAmmo = {};
                    if (itm.name === 'Đạn 5.56mm') { player.reserveAmmo['5.56mm'] = (player.reserveAmmo['5.56mm']||0) + itm.value; if(player.ammo && player.ammo['m4a1']) player.ammo['m4a1'].reserve = player.reserveAmmo['5.56mm']; }
                    if (itm.name === 'Đạn 7.62mm') { player.reserveAmmo['7.62mm'] = (player.reserveAmmo['7.62mm']||0) + itm.value; if(player.ammo && player.ammo['akm']) player.ammo['akm'].reserve = player.reserveAmmo['7.62mm']; }
                    if (itm.name === 'Đạn 12.0mm') { player.reserveAmmo['12.0mm'] = (player.reserveAmmo['12.0mm']||0) + itm.value; if(player.ammo && player.ammo['shotgun']) player.ammo['shotgun'].reserve = player.reserveAmmo['12.0mm']; }
                    if (itm.name === 'Đạn 9mm') { player.reserveAmmo['9mm'] = (player.reserveAmmo['9mm']||0) + itm.value; if(player.ammo && player.ammo['uzi']) player.ammo['uzi'].reserve = player.reserveAmmo['9mm']; }
                    if (itm.name === 'Đạn 9.19mm') { player.reserveAmmo['9.19mm'] = (player.reserveAmmo['9.19mm']||0) + itm.value; if(player.ammo && player.ammo['glock']) player.ammo['glock'].reserve = player.reserveAmmo['9.19mm']; }
                    itemsOnGround.splice(idx, 1); player.startInteract(0.3); sfx.play('pickup');
                } else if (itm.itemType === 'weapon') {
                    let gunCount = player.unlockedWeapons.filter(w => isGun(w)).length; 
                    let weaponToDrop = null;
                    if (!player.unlockedWeapons.includes(itm.value) && gunCount >= 2) { 
                        if (isGun(player.weapon)) weaponToDrop = player.weapon; 
                        else weaponToDrop = player.unlockedWeapons.find(w => isGun(w)); 
                    }
                    if (weaponToDrop) {
                        player.unlockedWeapons = player.unlockedWeapons.filter(w => w !== weaponToDrop);
                        let dropName = '';
                        switch(weaponToDrop) {
                            case 'm4a1': dropName = 'Súng M4A1'; break; case 'scar': dropName = 'Súng SCAR'; break; case 'akm': dropName = 'Súng AKM'; break;
                            case 'famas': dropName = 'Súng Famas'; break; case 'shotgun': dropName = 'Súng Shotgun'; break; case 'p90': dropName = 'Súng P90'; break;
                            case 'uzi': dropName = 'Súng Uzi'; break; case 'glock': dropName = 'Súng Glock'; break;
                        }
                        pushItemCallback(new Item(dropName, player.gridX, player.gridY, '#333', 'weapon', weaponToDrop));
                    }
                    if (!player.unlockedWeapons.includes(itm.value)) player.unlockedWeapons.push(itm.value);
                    player.weapon = itm.value; itemsOnGround.splice(idx, 1); player.startInteract(0.3); sfx.play('pickup');
                } else {
                    if (player.inventory.addItem(itm)) { itemsOnGround.splice(idx, 1); player.startInteract(0.3); sfx.play('pickup'); }
                }
            }
        }
    };
    lootMenu.addEventListener('pointerdown', handleLoot, {passive: false});

    // Hàm này sẽ trả về để nhúng vào render()
    return function renderLootMenu() {
        const { player, itemsOnGround } = getState();
        let nearbyItems = [];
        for (let i = 0; i < itemsOnGround.length; i++) {
            const itm = itemsOnGround[i]; const dx = player.gridX - itm.gridX; const dy = player.gridY - itm.gridY;
            if (Math.sqrt(dx * dx + dy * dy) < 3.0) nearbyItems.push({ item: itm, index: i });
        }
        if (nearbyItems.length > 0 && player.health > 0) {
            lootMenu.style.display = 'block'; let contentHtml = '';
            nearbyItems.forEach(ni => { 
                if (!ni.item.uid) ni.item.uid = Math.random().toString(36).substr(2, 9);
                let imgHtml = (ni.item.iconUrl && ni.item.iconUrl !== 'undefined') ? `<img src="${ni.item.iconUrl}" style="width: 20px; height: 20px; image-rendering: pixelated;">` : `<div style="width:16px; height:16px; background:${ni.item.color || '#fff'}; border-radius:3px; display:inline-block; margin-right:5px;"></div>`;
                contentHtml += `<div class="loot-item" data-uid="${ni.item.uid}">${imgHtml}<span>${ni.item.name}</span></div>`; 
            });
            if (lootMenu.getAttribute('data-content') !== contentHtml) { lootMenu.innerHTML = contentHtml; lootMenu.setAttribute('data-content', contentHtml); }
        } else { lootMenu.style.display = 'none'; lootMenu.setAttribute('data-content', ''); }
    };
}
