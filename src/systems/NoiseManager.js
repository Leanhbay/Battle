// src/systems/NoiseManager.js

export class NoiseManager {
    constructor() {
        this.noises = [];
    }

    // Tạo ra một tiếng ồn tại tọa độ (x, y) với bán kính (theo ô lưới)
    addNoise(gridX, gridY, radius) {
        this.noises.push({
            gridX: gridX,
            gridY: gridY,
            radius: radius,
            maxTime: 1.0,  // Sóng âm tồn tại trong 1 giây
            timeLeft: 1.0
        });
    }

    update(deltaTime) {
        // Trừ thời gian tồn tại của các tiếng ồn
        this.noises.forEach(n => n.timeLeft -= deltaTime);
        // Lọc bỏ các tiếng ồn đã tan biến
        this.noises = this.noises.filter(n => n.timeLeft > 0);
    }

    // Hàm này sẽ được gọi trong vòng lặp Render của main.js
    render(ctx, gridToScreen, TILE_WIDTH, TILE_HEIGHT, camX, camY) {
        this.noises.forEach(noise => {
            const pos = gridToScreen(noise.gridX, noise.gridY, TILE_WIDTH, TILE_HEIGHT, camX, camY);
            
            // Tính toán bán kính hiện tại (Mở rộng dần theo thời gian)
            const progress = 1 - (noise.timeLeft / noise.maxTime);
            
            // Chuyển đổi bán kính từ ô lưới sang pixel màn hình
            // Vì bản đồ bị bẹp đi một nửa theo trục Y (Isometric 2:1), 
            // bán kính vẽ trên màn hình cũng phải là một hình Elip (bán kính Y = bán kính X / 2)
            const radiusX = noise.radius * (TILE_WIDTH / 2) * progress;
            const radiusY = radiusX / 2;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y, radiusX, radiusY, 0, 0, Math.PI * 2);
            
            // Màu đỏ mờ dần khi sóng lan xa
            ctx.strokeStyle = `rgba(255, 50, 50, ${noise.timeLeft / noise.maxTime})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });
    }
}
