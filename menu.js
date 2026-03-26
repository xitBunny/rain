/* ========================================
   menu.js — 主菜单场景
   ======================================== */

const MenuScene = {
    particles: Pixel.createParticleSystem(),
    titleAlpha: 0,
    titleY: 0,
    buttons: [],
    selectedButton: -1,
    hoverButton: -1,
    animTimer: 0,
    starField: [],

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.titleAlpha = 0;
        this.titleY = -30;
        this.animTimer = 0;
        this.particles.clear();
        
        // Generate starfield
        this.starField = [];
        for (let i = 0; i < 60; i++) {
            this.starField.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.6,
                size: Math.random() < 0.3 ? 2 : 1,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            });
        }

        // Buttons
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 60;
        this.buttons = [
            { text: '开 始 旅 途', x: centerX, y: centerY, w: 200, h: 44, action: 'start' },
            { text: '妖 怪 图 鉴', x: centerX, y: centerY + 60, w: 200, h: 44, action: 'collection' }
        ];
    },

    update(dt) {
        this.animTimer += dt;

        // Title animation
        if (this.titleAlpha < 1) {
            this.titleAlpha = Math.min(1, this.titleAlpha + dt * 0.8);
            this.titleY = Pixel.lerp(-30, 0, Pixel.easeOutCubic(this.titleAlpha));
        }

        // Emit floating particles (firefly-like)
        if (Math.random() < 0.05) {
            this.particles.emit({
                x: () => Math.random() * this.canvas.width,
                y: () => this.canvas.height * 0.4 + Math.random() * this.canvas.height * 0.4,
                speedX: () => (Math.random() - 0.5) * 0.3,
                speedY: () => -0.2 - Math.random() * 0.3,
                life: () => 120 + Math.random() * 120,
                size: () => 1 + Math.random() * 2,
                color: () => Math.random() < 0.5 ? '#7cff8a' : '#ffe066',
                gravity: -0.002,
                fadeOut: true
            });
        }

        this.particles.update();

        // Update star twinkle
        for (const star of this.starField) {
            star.twinkle += star.speed;
        }
    },

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Sky gradient (dusk)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0d0d2b');
        skyGrad.addColorStop(0.3, '#1a1a4e');
        skyGrad.addColorStop(0.5, '#2d1b4e');
        skyGrad.addColorStop(0.7, '#6b2d5b');
        skyGrad.addColorStop(0.85, '#d4587a');
        skyGrad.addColorStop(1, '#e8834a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        for (const star of this.starField) {
            const alpha = 0.3 + Math.sin(star.twinkle) * 0.4 + 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        }
        ctx.globalAlpha = 1;

        // Silhouette ground
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);

        // Simple rooftop silhouettes
        const roofY = h * 0.85;
        ctx.fillStyle = '#0a0a15';
        this._drawBuildings(ctx, w, roofY);

        // Particles (fireflies)
        this.particles.draw(ctx);

        // Title
        const titleX = w / 2;
        const titleBaseY = h * 0.22 + this.titleY;
        ctx.globalAlpha = this.titleAlpha;

        // Title glow
        ctx.save();
        ctx.shadowColor = 'rgba(212, 88, 122, 0.6)';
        ctx.shadowBlur = 20;
        Pixel.drawText(ctx, '不 可 结 缘', titleX, titleBaseY, {
            size: Math.min(42, w * 0.08),
            color: '#fff',
            align: 'center',
            shadow: true,
            shadowColor: 'rgba(45, 27, 78, 0.8)',
            shadowOffset: 3
        });
        ctx.restore();

        // Subtitle
        Pixel.drawText(ctx, '— 万物皆有灵的羁绊 —', titleX, titleBaseY + 55, {
            size: Math.min(14, w * 0.03),
            color: 'rgba(168, 224, 255, 0.8)',
            align: 'center',
            shadow: true,
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowOffset: 1
        });

        ctx.globalAlpha = 1;

        // Buttons
        for (let i = 0; i < this.buttons.length; i++) {
            const btn = this.buttons[i];
            const isHover = this.hoverButton === i;
            const float = Math.sin(this.animTimer * 2 + i * 0.5) * 2;

            // Button background
            const bx = btn.x - btn.w / 2;
            const by = btn.y + float - btn.h / 2;

            // Glow on hover
            if (isHover) {
                ctx.save();
                ctx.shadowColor = 'rgba(110, 198, 255, 0.5)';
                ctx.shadowBlur = 15;
                ctx.fillStyle = 'rgba(110, 198, 255, 0.15)';
                ctx.fillRect(bx - 4, by - 4, btn.w + 8, btn.h + 8);
                ctx.restore();
            }

            ctx.fillStyle = isHover ? 'rgba(110, 198, 255, 0.2)' : 'rgba(13, 13, 26, 0.7)';
            ctx.fillRect(bx, by, btn.w, btn.h);

            // Border
            ctx.strokeStyle = isHover ? '#6ec6ff' : 'rgba(110, 198, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, btn.w, btn.h);

            // Text
            Pixel.drawText(ctx, btn.text, btn.x, by + 12, {
                size: 16,
                color: isHover ? '#fff' : 'rgba(224, 224, 224, 0.9)',
                align: 'center',
                shadow: true,
                shadowOffset: 1
            });
        }

        // Bottom hint
        const hintAlpha = 0.4 + Math.sin(this.animTimer * 1.5) * 0.2;
        ctx.globalAlpha = hintAlpha;
        Pixel.drawText(ctx, '点击开始', w / 2, h - 30, {
            size: 10,
            color: '#aaa',
            align: 'center',
            shadow: false
        });
        ctx.globalAlpha = 1;
    },

    _drawBuildings(ctx, w, baseY) {
        const buildings = [
            { x: 0, w: 60, h: 40 },
            { x: 55, w: 40, h: 65 },
            { x: 90, w: 50, h: 30 },
            { x: 140, w: 35, h: 55 },
            { x: 170, w: 55, h: 35 },
        ];
        // Repeat across screen
        let offsetX = 0;
        while (offsetX < w) {
            for (const b of buildings) {
                ctx.fillRect(offsetX + b.x, baseY - b.h, b.w, b.h);
                // Occasional lit window
                if (Math.random() < 0.3) {
                    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
                    const winX = offsetX + b.x + 8 + Math.floor(Math.random() * (b.w - 16));
                    const winY = baseY - b.h + 8 + Math.floor(Math.random() * (b.h - 16));
                    ctx.fillRect(winX, winY, 4, 6);
                    ctx.fillStyle = '#0a0a15';
                }
            }
            offsetX += 250;
        }
    },

    handleClick(mx, my) {
        for (let i = 0; i < this.buttons.length; i++) {
            const btn = this.buttons[i];
            const float = Math.sin(this.animTimer * 2 + i * 0.5) * 2;
            const bx = btn.x - btn.w / 2;
            const by = btn.y + float - btn.h / 2;
            if (mx >= bx && mx <= bx + btn.w && my >= by && my <= by + btn.h) {
                AudioManager.playConfirm();
                return btn.action;
            }
        }
        return null;
    },

    handleMove(mx, my) {
        let newHover = -1;
        for (let i = 0; i < this.buttons.length; i++) {
            const btn = this.buttons[i];
            const float = Math.sin(this.animTimer * 2 + i * 0.5) * 2;
            const bx = btn.x - btn.w / 2;
            const by = btn.y + float - btn.h / 2;
            if (mx >= bx && mx <= bx + btn.w && my >= by && my <= by + btn.h) {
                newHover = i;
            }
        }
        if (newHover !== this.hoverButton && newHover >= 0) {
            AudioManager.playSelect();
        }
        this.hoverButton = newHover;
    }
};
