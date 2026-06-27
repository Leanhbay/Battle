// src/systems/Crafting.js

export class CraftingSystem {
    constructor() {
        // TỪ ĐIỂN CÔNG THỨC CHẾ TẠO (Recipes)
        this.recipes = [
            {
                name: 'Băng Cứu Thương',
                desc: 'Hồi 50 Máu',
                ingredients: [{ name: 'Vải Vụn', qty: 2 }], // Yêu cầu 2 tấm Vải Vụn
                result: { type: 'heal', value: 50, color: '#ffffff' }
            },
            {
                name: 'Thịt Nướng',
                desc: 'Cộng 80 No',
                ingredients: [{ name: 'Thịt Sống', qty: 1 }, { name: 'Gỗ', qty: 1 }], // Yêu cầu 1 Thịt + 1 Gỗ để nấu
                result: { type: 'food', value: 80, color: '#e67e22' }
            }
        ];
    }

    // Kiểm tra túi đồ xem có đủ số lượng nguyên liệu yêu cầu không
    canCraft(inventory, recipe) {
        for (let ing of recipe.ingredients) {
            let count = inventory.items.filter(i => i.name === ing.name).length;
            if (count < ing.qty) return false;
        }
        return true;
    }

    // Hàm gọi khi nhấn nút Chế tạo
    craft(inventory, recipe, ItemClass) {
        if (!this.canCraft(inventory, recipe)) return false;

        // BƯỚC 1: Xóa nguyên liệu khỏi túi đồ
        for (let ing of recipe.ingredients) {
            let removedCount = 0;
            // Duyệt ngược mảng để xóa không bị lỗi index
            for (let i = inventory.items.length - 1; i >= 0; i--) {
                if (inventory.items[i].name === ing.name) {
                    inventory.removeItem(i);
                    removedCount++;
                    if (removedCount === ing.qty) break; // Đủ số lượng cần xóa thì dừng
                }
            }
        }

        // BƯỚC 2: Tạo ra thành phẩm và nhét vào túi đồ
        // (Tọa độ x=0, y=0 không quan trọng vì vật phẩm nằm trong túi, không nằm dưới đất)
        const newItem = new ItemClass(
            recipe.name, 0, 0, 
            recipe.result.color, recipe.result.type, recipe.result.value
        );
        
        inventory.addItem(newItem);
        return true;
    }
}
