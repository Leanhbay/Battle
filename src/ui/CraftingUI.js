// src/ui/CraftingUI.js

export class CraftingUI {
    constructor() {
        this.isOpen = false;
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    render(ctx, player, craftingSystem, ItemClass, canvasWidth, canvasHeight, inputManager) {
        if (!this.isOpen) return;

        const panelWidth = 350;
        const panelHeight = 400;
        const startX = (canvasWidth - panelWidth) / 2 + (canvasWidth > 700 ? 180 : 0); 
        const startY = (canvasHeight - panelHeight) / 2;

        ctx.fillStyle = 'rgba(20, 20, 60, 0.95)'; 
        ctx.fillRect(startX, startY, panelWidth, panelHeight);
        ctx.strokeStyle = '#88f'; ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, panelWidth, panelHeight);

        ctx.fillStyle = 'white'; ctx.font = 'bold 20px Arial';
        ctx.fillText('BÀN CHẾ TẠO', startX + 20, startY + 40);
        ctx.beginPath(); ctx.moveTo(startX + 20, startY + 50); ctx.lineTo(startX + panelWidth - 20, startY + 50); ctx.stroke();

        ctx.font = '14px Arial';
        
        craftingSystem.recipes.forEach((recipe, index) => {
            const itemX = startX + 20;
            const itemY = startY + 60 + (index * 85);
            const itemW = panelWidth - 40;
            const itemH = 75;

            const canCraft = craftingSystem.canCraft(player.inventory, recipe);

            ctx.fillStyle = canCraft ? 'rgba(100, 255, 100, 0.15)' : 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(itemX, itemY, itemW, itemH);
            ctx.strokeStyle = canCraft ? '#5f5' : '#555';
            ctx.strokeRect(itemX, itemY, itemW, itemH);

            // TÍNH NĂNG MỚI: Gọi Class Item để lấy Sprite mẫu và in ra
            ctx.imageSmoothingEnabled = false;
            const resultSprite = ItemClass.getSprite(recipe.name);
            ctx.drawImage(resultSprite, itemX + 10, itemY + 10, 28, 28);

            ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial';
            ctx.fillText(recipe.name, itemX + 50, itemY + 25);
            ctx.font = '13px Arial'; ctx.fillStyle = '#aaa';
            ctx.fillText(recipe.desc, itemX + 50, itemY + 45);

            let reqText = "Cần: ";
            recipe.ingredients.forEach(ing => {
                let currentHas = player.inventory.items.filter(i => i.name === ing.name).length;
                reqText += `${ing.name} (${currentHas}/${ing.qty})  `;
            });
            ctx.fillStyle = canCraft ? '#5f5' : '#f55';
            ctx.fillText(reqText, itemX + 10, itemY + 65);

            if (inputManager.mouse.clicked && canCraft) {
                const mx = inputManager.mouse.x;
                const my = inputManager.mouse.y;
                if (mx >= itemX && mx <= itemX + itemW && my >= itemY && my <= itemY + itemH) {
                    craftingSystem.craft(player.inventory, recipe, ItemClass);
                    inputManager.mouse.clicked = false; 
                }
            }
        });
    }
}
