// src/systems/Inventory.js

export class Inventory {
    constructor(capacity = 10) {
        this.items = []; // Danh sách vật phẩm đang chứa
        this.capacity = capacity;
    }

    // Thêm vật phẩm vào túi
    addItem(item) {
        if (this.items.length < this.capacity) {
            this.items.push(item);
            return true; // Nhặt thành công
        }
        return false; // Túi đầy
    }

    // Loại bỏ vật phẩm (Sẽ dùng cho tính năng vứt đồ hoặc ăn uống sau này)
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
        }
    }
}
