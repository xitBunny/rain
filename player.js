/* ========================================
   player.js — 玩家角色精灵 & 状态
   ======================================== */

const Player = {
    gender: null, // 'boy' or 'girl'
    x: 0,
    y: 0,
    targetX: 0,
    width: 16,
    height: 24,
    frame: 0,
    frameTimer: 0,
    facing: 1, // 1=right, -1=left
    state: 'idle', // idle, walk
    speed: 2,
    scale: 4,

    // Sprite data (each frame is a 16x24 pixel grid)
    sprites: {
        boy: {
            hair: '#3a2a1a',
            hairLight: '#5c4430',
            skin: '#f0d4b8',
            skinShadow: '#d4a88c',
            eye: '#2d1b4e',
            shirt: '#4a8fcc',
            shirtLight: '#6eb0e6',
            shirtDark: '#2d5f8f',
            pants: '#3a3a5c',
            pantsLight: '#5a5a7c',
            shoes: '#2a1f14',

            idle: [
                // Simplified 12x20 pixel art for boy character
                [0,0,0,0,'h','h','h','h',0,0,0,0],
                [0,0,0,'h','h','H','H','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h',0,0,0],
                [0,0,'h','s','s','s','s','s','h',0,0,0],
                [0,0,'h','s','e','s','s','e','h',0,0,0],
                [0,0,0,'s','s','s','s','s',0,0,0,0],
                [0,0,0,'s','s','S','s','s',0,0,0,0],
                [0,0,0,0,'s','s','s',0,0,0,0,0],
                [0,0,'t','t','t','t','t','t','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,0,'t','t','t','t','t','t',0,0,0,0],
                [0,0,'p','p','p','p','p','p',0,0,0,0],
                [0,0,'p','P','p','p','P','p',0,0,0,0],
                [0,0,'p','P','p','p','P','p',0,0,0,0],
                [0,0,'p','p',0,0,'p','p',0,0,0,0],
                [0,0,'x','x',0,0,'x','x',0,0,0,0],
            ],

            walk1: [
                [0,0,0,0,'h','h','h','h',0,0,0,0],
                [0,0,0,'h','h','H','H','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h',0,0,0],
                [0,0,'h','s','s','s','s','s','h',0,0,0],
                [0,0,'h','s','e','s','s','e','h',0,0,0],
                [0,0,0,'s','s','s','s','s',0,0,0,0],
                [0,0,0,'s','s','S','s','s',0,0,0,0],
                [0,0,0,0,'s','s','s',0,0,0,0,0],
                [0,0,'t','t','t','t','t','t','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,0,'t','t','t','t','t','t',0,0,0,0],
                [0,0,'p','p','p','p','p','p',0,0,0,0],
                [0,'p','P','p',0,0,'p','P',0,0,0,0],
                ['p','P','p',0,0,0,0,'p','P',0,0,0],
                ['x','x',0,0,0,0,0,0,'x','x',0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
            ],

            walk2: [
                [0,0,0,0,'h','h','h','h',0,0,0,0],
                [0,0,0,'h','h','H','H','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h',0,0,0],
                [0,0,'h','s','s','s','s','s','h',0,0,0],
                [0,0,'h','s','e','s','s','e','h',0,0,0],
                [0,0,0,'s','s','s','s','s',0,0,0,0],
                [0,0,0,'s','s','S','s','s',0,0,0,0],
                [0,0,0,0,'s','s','s',0,0,0,0,0],
                [0,0,'t','t','t','t','t','t','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,'t','T','T','t','t','T','T','t',0,0,0],
                [0,0,'t','t','t','t','t','t',0,0,0,0],
                [0,0,'p','p','p','p','p','p',0,0,0,0],
                [0,0,0,'p','P',0,'p','P','p',0,0,0],
                [0,0,0,0,'p','P','P','p',0,0,0,0],
                [0,0,0,0,'x','x','x','x',0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
            ]
        },

        girl: {
            hair: '#1a0a2e',
            hairLight: '#3a2060',
            skin: '#f5dcc8',
            skinShadow: '#d4a88c',
            eye: '#6ec6ff',
            dress: '#d4587a',
            dressLight: '#e88aaa',
            dressDark: '#a03058',
            skirt: '#d4587a',
            shoes: '#2a1f14',

            idle: [
                [0,0,0,'h','h','h','h','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h','h',0,0],
                [0,'h','h','H','H','H','H','H','h','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,'h','s','e','s','s','s','e','s','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,0,'s','s','s','S','s','s',0,0,0,0],
                [0,0,0,'s','s','s','s',0,0,0,0,0],
                [0,0,'d','d','d','d','d','d','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','d','d','d','d','D','d',0,0,0],
                [0,0,'k','k','k','k','k','k',0,0,0,0],
                [0,'k','k','K','k','k','K','k','k',0,0,0],
                [0,'k','K','K','k','k','K','K','k',0,0,0],
                [0,0,'k','K','k','k','K','k',0,0,0,0],
                [0,0,0,'s','s',0,'s','s',0,0,0,0],
                [0,0,0,'x','x',0,'x','x',0,0,0,0],
            ],

            walk1: [
                [0,0,0,'h','h','h','h','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h','h',0,0],
                [0,'h','h','H','H','H','H','H','h','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,'h','s','e','s','s','s','e','s','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,0,'s','s','s','S','s','s',0,0,0,0],
                [0,0,0,'s','s','s','s',0,0,0,0,0],
                [0,0,'d','d','d','d','d','d','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','d','d','d','d','D','d',0,0,0],
                [0,0,'k','k','k','k','k','k',0,0,0,0],
                [0,'k','k','K','k','k','K','k','k',0,0,0],
                [0,'k','K','k',0,0,'k','K','k',0,0,0],
                ['k','K','k',0,0,0,0,'k','K',0,0,0],
                ['x','x',0,0,0,0,0,0,'x','x',0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
            ],

            walk2: [
                [0,0,0,'h','h','h','h','h','h',0,0,0],
                [0,0,'h','h','H','H','H','H','h','h',0,0],
                [0,'h','h','H','H','H','H','H','h','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,'h','s','e','s','s','s','e','s','h',0,0],
                [0,'h','s','s','s','s','s','s','s','h',0,0],
                [0,0,'s','s','s','S','s','s',0,0,0,0],
                [0,0,0,'s','s','s','s',0,0,0,0,0],
                [0,0,'d','d','d','d','d','d','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','D','d','d','D','D','d',0,0,0],
                [0,'d','D','d','d','d','d','D','d',0,0,0],
                [0,0,'k','k','k','k','k','k',0,0,0,0],
                [0,'k','k','K','k','k','K','k','k',0,0,0],
                [0,0,'k','K','k','k','k',0,0,0,0,0],
                [0,0,0,'k','K','K','k',0,0,0,0,0],
                [0,0,0,'x','x','x','x',0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
            ]
        }
    },

    setGender(gender) {
        this.gender = gender;
    },

    getColorMap() {
        const s = this.sprites[this.gender];
        if (!s) return {};

        if (this.gender === 'boy') {
            return {
                'h': s.hair, 'H': s.hairLight,
                's': s.skin, 'S': s.skinShadow,
                'e': s.eye,
                't': s.shirt, 'T': s.shirtLight,
                'p': s.pants, 'P': s.pantsLight,
                'x': s.shoes,
                'k': s.pants, 'K': s.pantsLight,
                'd': s.shirt, 'D': s.shirtLight
            };
        } else {
            return {
                'h': s.hair, 'H': s.hairLight,
                's': s.skin, 'S': s.skinShadow,
                'e': s.eye,
                'd': s.dress, 'D': s.dressLight,
                'k': s.skirt, 'K': s.dressLight,
                'x': s.shoes,
                't': s.dress, 'T': s.dressLight,
                'p': s.skirt, 'P': s.dressLight
            };
        }
    },

    getCurrentFrame() {
        const s = this.sprites[this.gender];
        if (!s) return [];
        if (this.state === 'idle') return s.idle;
        return this.frame === 0 ? s.walk1 : s.walk2;
    },

    update(dt) {
        if (this.state === 'walk') {
            this.frameTimer += dt;
            if (this.frameTimer > 0.2) {
                this.frameTimer = 0;
                this.frame = (this.frame + 1) % 2;
            }

            // Move towards target
            const diff = this.targetX - this.x;
            if (Math.abs(diff) > 1) {
                this.facing = diff > 0 ? 1 : -1;
                this.x += Math.sign(diff) * this.speed;
            } else {
                this.state = 'idle';
                this.frame = 0;
            }
        }
    },

    draw(ctx) {
        if (!this.gender) return;
        const spriteData = this.getCurrentFrame();
        const colorMap = this.getColorMap();
        const scale = this.scale;

        ctx.save();

        // Flip horizontally if facing left
        if (this.facing === -1) {
            ctx.translate(this.x + (spriteData[0].length * scale) / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(spriteData[0].length * scale) / 2, 0);
        } else {
            ctx.translate(this.x, 0);
        }

        for (let row = 0; row < spriteData.length; row++) {
            for (let col = 0; col < spriteData[row].length; col++) {
                const val = spriteData[row][col];
                if (val !== 0 && val !== '') {
                    ctx.fillStyle = colorMap[val] || '#ff00ff';
                    ctx.fillRect(
                        Math.floor(col * scale),
                        Math.floor(this.y + row * scale),
                        scale, scale
                    );
                }
            }
        }

        ctx.restore();
    },

    walkTo(x) {
        this.targetX = x;
        this.state = 'walk';
        this.facing = x > this.x ? 1 : -1;
    }
};
