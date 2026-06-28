// src/core/Camera.js

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        // Tọa độ bù trừ (offset) để đẩy toàn bộ thế giới di chuyển
        this.offsetX = 0;
        this.offsetY = 0;
    }

    // Hàm gọi liên tục mỗi khung hình để bám theo mục tiêu (Player)
    follow(target, tileWidth, tileHeight, gridToScreenFunc) {
        // Tính toán tọa độ của Player nếu bản đồ đứng yên ở gốc (0,0)
        const targetScreenPos = gridToScreenFunc(target.gridX, target.gridY, tileWidth, tileHeight, 0, 0);

        // Tính tọa độ điểm giữa của màn hình thiết bị
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;

        // Cập nhật Offset để ép mục tiêu nằm ngay giữa màn hình
        this.offsetX = screenCenterX - targetScreenPos.x;
        this.offsetY = screenCenterY - targetScreenPos.y;
    }
}
