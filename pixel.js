/* ========================================
   pixel.js — 像素绘制工具
   ======================================== */

const Pixel = {
    // Draw pixel text (using canvas font)
    drawText(ctx, text, x, y, options = {}) {
        const {
            size = 16,
            color = '#fff',
            align = 'left',
            shadow = true,
            shadowColor = 'rgba(0,0,0,0.7)',
            shadowOffset = 2,
            font = null,
            maxWidth = null
        } = options;

        ctx.save();
        ctx.font = `${size}px ${font || "'ZCOOL QingKe HuangYou', monospace"}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'top';

        if (shadow) {
            ctx.fillStyle = shadowColor;
            ctx.fillText(text, x + shadowOffset, y + shadowOffset, maxWidth || undefined);
            ctx.fillStyle = color;
        }

        ctx.fillText(text, x, y, maxWidth || undefined);
        ctx.restore();
    },

    // Draw wrapped text, returns total height used
    drawWrappedText(ctx, text, x, y, maxWidth, options = {}) {
        const { size = 14, lineHeight = 1.8, color = '#fff' } = options;
        ctx.save();
        ctx.font = `${size}px 'ZCOOL QingKe HuangYou', monospace`;
        
        const words = text.split('');
        let line = '';
        let currentY = y;
        const lh = size * lineHeight;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillStyle = options.shadowColor || 'rgba(0,0,0,0.7)';
                ctx.fillText(line, x + 1, currentY + 1);
                ctx.fillStyle = color;
                ctx.fillText(line, x, currentY);
                line = words[i];
                currentY += lh;
            } else {
                line = testLine;
            }
        }
        ctx.fillStyle = options.shadowColor || 'rgba(0,0,0,0.7)';
        ctx.fillText(line, x + 1, currentY + 1);
        ctx.fillStyle = color;
        ctx.fillText(line, x, currentY);
        ctx.restore();
        return currentY - y + lh;
    },

    // Draw pixel rectangle
    drawRect(ctx, x, y, w, h, color, borderColor = null, borderWidth = 2) {
        ctx.save();
        if (borderColor) {
            ctx.fillStyle = borderColor;
            ctx.fillRect(
                Math.floor(x - borderWidth),
                Math.floor(y - borderWidth),
                Math.floor(w + borderWidth * 2),
                Math.floor(h + borderWidth * 2)
            );
        }
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
        ctx.restore();
    },

    // Draw pixel sprite from a 2D array of color strings
    drawSprite(ctx, spriteData, x, y, pixelSize = 4) {
        ctx.save();
        for (let row = 0; row < spriteData.length; row++) {
            for (let col = 0; col < spriteData[row].length; col++) {
                const color = spriteData[row][col];
                if (color && color !== '' && color !== 0) {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        Math.floor(x + col * pixelSize),
                        Math.floor(y + row * pixelSize),
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
        ctx.restore();
    },

    // Particle system
    createParticleSystem() {
        return {
            particles: [],

            emit(config) {
                const {
                    x, y, count = 1,
                    speedX = () => (Math.random() - 0.5) * 2,
                    speedY = () => -Math.random() * 2,
                    life = () => 60 + Math.random() * 60,
                    size = () => 2 + Math.random() * 2,
                    color = '#fff',
                    gravity = 0,
                    fadeOut = true
                } = config;

                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        x: typeof x === 'function' ? x() : x,
                        y: typeof y === 'function' ? y() : y,
                        vx: typeof speedX === 'function' ? speedX() : speedX,
                        vy: typeof speedY === 'function' ? speedY() : speedY,
                        life: typeof life === 'function' ? life() : life,
                        maxLife: 0,
                        size: typeof size === 'function' ? size() : size,
                        color: typeof color === 'function' ? color() : color,
                        gravity,
                        fadeOut
                    });
                    this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life;
                }
            },

            update() {
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.life--;
                    if (p.life <= 0) {
                        this.particles.splice(i, 1);
                    }
                }
            },

            draw(ctx) {
                for (const p of this.particles) {
                    ctx.save();
                    const alpha = p.fadeOut ? (p.life / p.maxLife) : 1;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(
                        Math.floor(p.x),
                        Math.floor(p.y),
                        Math.ceil(p.size),
                        Math.ceil(p.size)
                    );
                    ctx.restore();
                }
            },

            clear() {
                this.particles = [];
            }
        };
    },

    // Screen shake effect
    shake: {
        intensity: 0,
        duration: 0,
        offsetX: 0,
        offsetY: 0,

        trigger(intensity = 5, duration = 10) {
            this.intensity = intensity;
            this.duration = duration;
        },

        update() {
            if (this.duration > 0) {
                this.offsetX = (Math.random() - 0.5) * this.intensity * 2;
                this.offsetY = (Math.random() - 0.5) * this.intensity * 2;
                this.duration--;
                this.intensity *= 0.9;
            } else {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
    },

    // Easing functions
    easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); },
    easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },

    // Lerp
    lerp(a, b, t) { return a + (b - a) * t; }
};
