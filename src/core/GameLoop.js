// src/core/GameLoop.js

export class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.lastTime = 0;
        this.isRunning = false;
        this.ctx = null; // Thêm ctx để lưu trữ context
    }

    start() {
        this.lastTime = performance.now();
        this.isRunning = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(currentTime) {
        if (!this.isRunning) return;
        requestAnimationFrame(this.loop.bind(this));

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Tăng độ nét: Đặt imageSmoothingEnabled thành false
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = false;
        }

        this.update(deltaTime);
        this.render();
    }
}
