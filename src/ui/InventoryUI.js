// src/ui/InventoryUI.js

export class InventoryUI {
    constructor() {
        this.isOpen = false;
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    render(ctx, player, canvasWidth, canvasHeight, inputManager) {
        if (!this.isOpen) return;

        const inventory = player.inventory;
        const panelWidth = 300;
        const panelHeight = 400;
        const startX = (canvasWidth - panelWidth) / 2;
        const startY = (canvasHeight - panelHeight) / 2;

        ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
        ctx.fillRect(startX, startY, panelWidth, panelHeight);
        ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, panelWidth, panelHeight);

        ctx.fillStyle = 'white'; ctx.font = 'bold 20px Arial';
        ctx.fillText(`TÚI ĐỒ (${inventory.items.length}/${inventory.capacity})`, startX + 20, startY + 40);
        ctx.beginPath(); ctx.moveTo(startX + 20, startY + 50); ctx.lineTo(startX + panelWidth - 20, startY + 50); ctx.stroke();

        ctx.font = '16px Arial';
        if (inventory.items.length === 0) {
            ctx.fillStyle = '#aaa';
            ctx.fillText('Túi đồ trống...', startX + 20, startY + 90);
        } else {
            inventory.items.forEach((item, index) => {
                const itemX = startX + 20;
                const itemY = startY + 60 + (index * 40);
                const itemW = panelWidth - 40;
                const itemH = 35;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(itemX, itemY, itemW, itemH);

                // TÍNH NĂNG MỚI: In hình ảnh Pixel Art của Item vào trong Túi đồ
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(item.sprite, itemX + 5, itemY + 5, 24, 24);
                
                ctx.fillStyle = 'white';
                const desc = item.itemType === 'heal' ? `(Hồi ${item.value} Máu)` : `(Cộng ${item.value} No)`;
                ctx.fillText(`${item.name} ${desc}`, itemX + 40, itemY + 23);

                if (inputManager.mouse.clicked) {
                    const mx = inputManager.mouse.x;
                    const my = inputManager.mouse.y;
                    if (mx >= itemX && mx <= itemX + itemW && my >= itemY && my <= itemY + itemH) {
                        item.use(player); 
                        inventory.removeItem(index); 
                        inputManager.mouse.clicked = false; 
                    }
                }
            });
        }
    }
}
