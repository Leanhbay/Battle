// src/systems/SoundManager.js

export class SoundManager {
    constructor() {
        this.ctx = null;

        // MẸO: Tự động khởi tạo AudioContext ngay lần chạm màn hình đầu tiên
        // Giúp âm thanh không bị trình duyệt chặn trên Mobile/Chrome
        const unlockAudio = () => {
            this.init();
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('mousedown', unlockAudio);
        };
        window.addEventListener('touchstart', unlockAudio, { once: true });
        window.addEventListener('mousedown', unlockAudio, { once: true });
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        try {
            if (!this.ctx) this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            const now = this.ctx.currentTime;
            
            if (type === 'shoot') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
                // Giảm gain (âm lượng) xuống để tránh bị vỡ tiếng (Clipping) khi bắn liên tục
                gain.gain.setValueAtTime(0.15, now); 
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
            } 
            else if (type === 'melee') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(250, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now); osc.stop(now + 0.15);
            } 
            else if (type === 'pickup') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(900, now + 0.05);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
            } 
            else if (type === 'build') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
            }

            // TÍNH NĂNG QUAN TRỌNG: Dọn dẹp bộ nhớ (Garbage Collection)
            // Ngay khi phát xong, lập tức gỡ Oscillator ra khỏi RAM để không bị tắc nghẽn
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };

        } catch (e) {
            console.log("Audio Error:", e);
        }
    }
}
