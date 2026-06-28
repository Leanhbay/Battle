// src/core/InputHandler.js

export class InputHandler {
    constructor() {
        this.keys = {};
        this.toggles = { sprint: false };
        this.mouse = { x: 0, y: 0, clicked: false };
        this.joystick = { active: false, id: null, dx: 0, dy: 0, maxRadius: 40 };

        window.addEventListener('keydown', e => {
            if (e.code === 'Space') this.keys['attack'] = true;
            else {
                const key = e.key.toLowerCase();
                this.keys[key] = true; 
                if (e.key === 'Shift' && !e.repeat) this.toggleSprint();
                if (key === 'h') this.keys['use_heal'] = true;
                if (key === 'j') this.keys['use_water'] = true;
                if (key === 'g') this.keys['use_grenade'] = true;
            }
        });
        
        window.addEventListener('keyup', e => {
            if (e.code === 'Space') this.keys['attack'] = false;
            else {
                const key = e.key.toLowerCase();
                this.keys[key] = false;
                if (key === 'h') this.keys['use_heal'] = false;
                if (key === 'j') this.keys['use_water'] = false;
                if (key === 'g') this.keys['use_grenade'] = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Bắt tọa độ ngón tay vẽ tâm ngắm, loại trừ các vùng bấm UI
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (!t.target.closest('#mobile-controls') && !t.target.closest('#action-controls') && !t.target.closest('#proximity-loot')) {
                    this.mouse.x = t.clientX; this.mouse.y = t.clientY; this.mouse.clicked = true; break;
                }
            }
        }, {passive: true});
        
        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (!t.target.closest('#mobile-controls') && !t.target.closest('#action-controls') && !t.target.closest('#proximity-loot')) {
                    this.mouse.x = t.clientX; this.mouse.y = t.clientY; break;
                }
            }
        }, {passive: true});

        window.addEventListener('touchend', (e) => { if (e.touches.length === 0) this.mouse.clicked = false; });

        this.initMobileButton('btn-attack', 'attack');
        this.initMobileButton('btn-inventory', 'i');
        this.initMobileButton('btn-swap', 'q');
        this.initToggleButton('btn-sprint');
        this.initMobileButton('btn-use-heal', 'use_heal');
        this.initMobileButton('btn-use-water', 'use_water');
        this.initMobileButton('btn-use-grenade', 'use_grenade');

        this.initJoystick();
    }

    setSprint(active) {
        this.toggles['sprint'] = active;
        const btn = document.getElementById('btn-sprint');
        if (btn) btn.style.backgroundColor = this.toggles['sprint'] ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
    }

    toggleSprint() { this.setSprint(!this.toggles['sprint']); }

    initToggleButton(btnId) {
        const btn = document.getElementById(btnId); if (!btn) return;
        const handler = (e) => { e.preventDefault(); this.toggleSprint(); };
        btn.addEventListener('touchstart', handler, {passive: false});
        btn.addEventListener('mousedown', handler);
    }

    initJoystick() {
        const container = document.getElementById('joystick-container');
        const knob = document.getElementById('joystick-knob');
        if (!container || !knob) return;
        let centerX, centerY;
        
        const updateKnob = (clientX, clientY) => {
            let deltaX = clientX - centerX; let deltaY = clientY - centerY;
            const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            if (distance > this.joystick.maxRadius) {
                const ratio = this.joystick.maxRadius / distance;
                deltaX *= ratio; deltaY *= ratio;
            }
            knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
            this.joystick.dx = deltaX / this.joystick.maxRadius;
            this.joystick.dy = deltaY / this.joystick.maxRadius;
        };
        
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            centerX = rect.left + rect.width / 2; centerY = rect.top + rect.height / 2;
            this.joystick.active = true; this.joystick.id = e.changedTouches[0].identifier;
            updateKnob(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }, {passive: false});
        
        window.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === this.joystick.id) {
                    updateKnob(e.touches[i].clientX, e.touches[i].clientY); break;
                }
            }
        }, {passive: false});
        
        const endJoy = (e) => {
            if (!this.joystick.active) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystick.id) {
                    this.joystick.active = false; knob.style.transform = `translate(-50%, -50%)`; 
                    this.joystick.dx = 0; this.joystick.dy = 0; break;
                }
            }
        };
        window.addEventListener('touchend', endJoy);
        window.addEventListener('touchcancel', endJoy);
    }

    initMobileButton(btnId, keyMapped) {
        const btn = document.getElementById(btnId); if (!btn) return;
        const press = (e) => { e.preventDefault(); e.stopPropagation(); this.keys[keyMapped] = true; };
        const release = (e) => { e.preventDefault(); e.stopPropagation(); this.keys[keyMapped] = false; };
        
        btn.addEventListener('touchstart', press, {passive: false});
        btn.addEventListener('touchend', release, {passive: false});
        btn.addEventListener('touchcancel', release, {passive: false});
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
    }

    isPressed(keyConfig) { return !!this.keys[keyConfig]; }
}
