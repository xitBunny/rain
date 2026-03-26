/* ========================================
   genderSelect.js — 性别选择场景
   ======================================== */

const GenderSelectScene = {
    canvas: null,
    ctx: null,
    animTimer: 0,
    hoverGender: null, // 'boy' or 'girl' or null
    particles: Pixel.createParticleSystem(),
    fadeIn: 0,

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.animTimer = 0;
        this.hoverGender = null;
        this.fadeIn = 0;
        this.particles.clear();
    },

    update(dt) {
        this.animTimer += dt;
        this.fadeIn = Math.min(1, this.fadeIn + dt * 1.2);

        // Firefly particles
        if (Math.random() < 0.04) {
            this.particles.emit({
                x: () => Math.random() * this.canvas.width,
                y: () => this.canvas.height * 0.3 + Math.random() * this.canvas.height * 0.5,
                speedX: () => (Math.random() - 0.5) * 0.3,
                speedY: () => -0.15 - Math.random() * 0.2,
                life: () => 100 + Math.random() * 100,
                size: () => 1 + Math.random() * 1.5,
                color: () => Math.random() < 0.5 ? '#7cff8a' : '#ffe066',
                gravity: -0.002,
                fadeOut: true
            });
        }
        this.particles.update();
    },

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Background — deep night sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0a0a1e');
        skyGrad.addColorStop(0.4, '#1a1a3e');
        skyGrad.addColorStop(0.7, '#2d1b4e');
        skyGrad.addColorStop(1, '#1a1520');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 30; i++) {
            const sx = (Math.sin(i * 127.3) * 0.5 + 0.5) * w;
            const sy = (Math.cos(i * 93.7) * 0.5 + 0.5) * h * 0.5;
            const twinkle = 0.3 + Math.sin(this.animTimer * 2 + i) * 0.4;
            ctx.globalAlpha = twinkle;
            ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
        }
        ctx.globalAlpha = 1;

        this.particles.draw(ctx);

        // Ground
        ctx.fillStyle = '#0d0d15';
        ctx.fillRect(0, h * 0.82, w, h * 0.18);

        // Grassy path hint
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, h * 0.82, w, 4);

        ctx.globalAlpha = Pixel.easeOutCubic(this.fadeIn);

        // Title
        Pixel.drawText(ctx, '选择你的旅人', w / 2, h * 0.1, {
            size: Math.min(26, w * 0.05),
            color: '#e0d0c0',
            align: 'center',
            shadow: true,
            shadowColor: 'rgba(0,0,0,0.6)'
        });

        Pixel.drawText(ctx, '你将踏上一段奇异的旅途……', w / 2, h * 0.17, {
            size: Math.min(13, w * 0.025),
            color: 'rgba(168, 224, 255, 0.7)',
            align: 'center',
            shadow: true,
            shadowColor: 'rgba(0,0,0,0.4)',
            shadowOffset: 1
        });

        // Two character cards
        const cardW = Math.min(180, w * 0.28);
        const cardH = cardW * 1.4;
        const gap = Math.min(60, w * 0.08);
        const totalW = cardW * 2 + gap;
        const startX = (w - totalW) / 2;
        const cardY = h * 0.26;

        // Boy card
        this._drawCharCard(ctx, '少年', 'boy', startX, cardY, cardW, cardH, this.hoverGender === 'boy');

        // Girl card
        this._drawCharCard(ctx, '少女', 'girl', startX + cardW + gap, cardY, cardW, cardH, this.hoverGender === 'girl');

        ctx.globalAlpha = 1;

        // Bottom hint
        const hintAlpha = 0.3 + Math.sin(this.animTimer * 1.5) * 0.15;
        ctx.globalAlpha = hintAlpha;
        Pixel.drawText(ctx, '点击选择角色', w / 2, h * 0.93, {
            size: 10, color: '#888', align: 'center', shadow: false
        });
        ctx.globalAlpha = 1;
    },

    _drawCharCard(ctx, label, gender, x, y, w, h, isHover) {
        const float = Math.sin(this.animTimer * 2 + (gender === 'girl' ? 1 : 0)) * 3;
        const cy = y + float;

        // Card glow on hover
        if (isHover) {
            ctx.save();
            ctx.shadowColor = gender === 'boy' ? 'rgba(74, 143, 204, 0.5)' : 'rgba(212, 88, 122, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(x - 5, cy - 5, w + 10, h + 10);
            ctx.restore();
        }

        // Card background
        ctx.fillStyle = isHover ? 'rgba(255,255,255,0.1)' : 'rgba(13, 13, 26, 0.7)';
        ctx.fillRect(x, cy, w, h);

        // Card border
        ctx.strokeStyle = isHover
            ? (gender === 'boy' ? '#6eb0e6' : '#e88aaa')
            : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.strokeRect(x, cy, w, h);

        // Draw character sprite inside card
        const spriteData = Player.sprites[gender].idle;
        const colorMap = gender === 'boy'
            ? {
                'h': Player.sprites.boy.hair, 'H': Player.sprites.boy.hairLight,
                's': Player.sprites.boy.skin, 'S': Player.sprites.boy.skinShadow,
                'e': Player.sprites.boy.eye,
                't': Player.sprites.boy.shirt, 'T': Player.sprites.boy.shirtLight,
                'p': Player.sprites.boy.pants, 'P': Player.sprites.boy.pantsLight,
                'x': Player.sprites.boy.shoes,
                'k': Player.sprites.boy.pants, 'K': Player.sprites.boy.pantsLight,
                'd': Player.sprites.boy.shirt, 'D': Player.sprites.boy.shirtLight
            }
            : {
                'h': Player.sprites.girl.hair, 'H': Player.sprites.girl.hairLight,
                's': Player.sprites.girl.skin, 'S': Player.sprites.girl.skinShadow,
                'e': Player.sprites.girl.eye,
                'd': Player.sprites.girl.dress, 'D': Player.sprites.girl.dressLight,
                'k': Player.sprites.girl.skirt, 'K': Player.sprites.girl.dressLight,
                'x': Player.sprites.girl.shoes,
                't': Player.sprites.girl.dress, 'T': Player.sprites.girl.dressLight,
                'p': Player.sprites.girl.skirt, 'P': Player.sprites.girl.dressLight
            };

        const spriteScale = Math.max(3, Math.floor(w / 40));
        const spriteW = 12 * spriteScale;
        const spriteH = 18 * spriteScale;
        const spriteX = x + (w - spriteW) / 2;
        const spriteY = cy + h * 0.15;

        // Character backing glow
        if (isHover) {
            const glow = ctx.createRadialGradient(
                spriteX + spriteW / 2, spriteY + spriteH / 2, 5,
                spriteX + spriteW / 2, spriteY + spriteH / 2, spriteH * 0.7
            );
            glow.addColorStop(0, gender === 'boy' ? 'rgba(74,143,204,0.2)' : 'rgba(212,88,122,0.2)');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(spriteX - 30, spriteY - 30, spriteW + 60, spriteH + 60);
        }

        for (let row = 0; row < spriteData.length; row++) {
            for (let col = 0; col < spriteData[row].length; col++) {
                const val = spriteData[row][col];
                if (val !== 0 && val !== '') {
                    ctx.fillStyle = colorMap[val] || '#ff00ff';
                    ctx.fillRect(
                        Math.floor(spriteX + col * spriteScale),
                        Math.floor(spriteY + row * spriteScale),
                        spriteScale, spriteScale
                    );
                }
            }
        }

        // Label
        Pixel.drawText(ctx, label, x + w / 2, cy + h - 40, {
            size: Math.min(18, w * 0.1),
            color: isHover ? '#fff' : '#bbb',
            align: 'center',
            shadow: true,
            shadowOffset: 1
        });
    },

    handleClick(mx, my) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const cardW = Math.min(180, w * 0.28);
        const cardH = cardW * 1.4;
        const gap = Math.min(60, w * 0.08);
        const totalW = cardW * 2 + gap;
        const startX = (w - totalW) / 2;
        const cardY = h * 0.26;

        const float1 = Math.sin(this.animTimer * 2) * 3;
        const float2 = Math.sin(this.animTimer * 2 + 1) * 3;

        // Boy card
        if (mx >= startX && mx <= startX + cardW &&
            my >= cardY + float1 && my <= cardY + float1 + cardH) {
            AudioManager.playConfirm();
            return 'boy';
        }

        // Girl card
        const girlX = startX + cardW + gap;
        if (mx >= girlX && mx <= girlX + cardW &&
            my >= cardY + float2 && my <= cardY + float2 + cardH) {
            AudioManager.playConfirm();
            return 'girl';
        }

        return null;
    },

    handleMove(mx, my) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const cardW = Math.min(180, w * 0.28);
        const cardH = cardW * 1.4;
        const gap = Math.min(60, w * 0.08);
        const totalW = cardW * 2 + gap;
        const startX = (w - totalW) / 2;
        const cardY = h * 0.26;

        const float1 = Math.sin(this.animTimer * 2) * 3;
        const float2 = Math.sin(this.animTimer * 2 + 1) * 3;

        let newHover = null;
        if (mx >= startX && mx <= startX + cardW &&
            my >= cardY + float1 && my <= cardY + float1 + cardH) {
            newHover = 'boy';
        }

        const girlX = startX + cardW + gap;
        if (mx >= girlX && mx <= girlX + cardW &&
            my >= cardY + float2 && my <= cardY + float2 + cardH) {
            newHover = 'girl';
        }

        if (newHover !== this.hoverGender && newHover) {
            AudioManager.playSelect();
        }
        this.hoverGender = newHover;
    }
};
