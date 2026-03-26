/* ========================================
   explore.js — 探索行走场景
   每关不同的场景主题 + 右侧角色信息HUD
   ======================================== */

// 4种场景主题配置
const SceneThemes = {
    // 第1关：黄昏街道 → 公交站
    busStop: {
        name: '黄昏街道',
        sky: [ [0,'#1a1a3e'],[0.2,'#2d1b4e'],[0.4,'#5c2d5b'],[0.6,'#b8475a'],[0.78,'#e8834a'],[1,'#d4587a'] ],
        hasSun: true, sunColor: 'rgba(255, 220, 150, 0.8)', sunGlowColor: [255,200,100],
        groundColor: '#1a1520', sidewalkColor: '#252030', roadColor: '#2a2530',
        buildingColor: '#15101f', windowColor: 'rgba(255, 200, 100, 0.25)',
        cloudColor: [200, 150, 120],
        leafColors: ['#e8834a','#d4587a','#ffe066','#c45a3a'],
        treeCanopy: '#1a3a2a', treeCanopyLight: '#2a5a3a',
        autumnOverlay: true,
        triggerSign: '公交站', triggerText: '「……你能看见我吗？」', triggerColor: '#a8e0ff',
        sceneryPresets: [
            { type: 'tree', positions: [150,350,600,900,1200,1500,1700] },
            { type: 'bench', positions: [250, 1000] },
            { type: 'vending', positions: [500] },
            { type: 'cat', positions: [700] },
            { type: 'sign', positions: [1400], text: '→ 公交站' },
        ],
        drawYokai: 'drawRainWomanPortrait',
    },
    // 第2关：深夜居酒屋小巷
    alley: {
        name: '深夜小巷',
        sky: [ [0,'#050510'],[0.3,'#0a0a1e'],[0.6,'#0f0f28'],[1,'#1a1520'] ],
        hasSun: false,
        groundColor: '#0d0d12', sidewalkColor: '#181818', roadColor: '#111116',
        buildingColor: '#0a0a14', windowColor: 'rgba(255, 180, 80, 0.15)',
        cloudColor: [60, 50, 70],
        leafColors: ['#333','#444','#2a2a3a','#222'],
        treeCanopy: '#111a22', treeCanopyLight: '#1a2a30',
        autumnOverlay: false,
        triggerSign: '居酒屋', triggerText: '「喵——」', triggerColor: '#ffe066',
        sceneryPresets: [
            { type: 'lantern', positions: [200,500,800,1100,1400] },
            { type: 'trash', positions: [300, 900] },
            { type: 'barrel', positions: [450, 1050] },
            { type: 'noren', positions: [600, 1200] },
            { type: 'sign', positions: [1500], text: '→ 居酒屋' },
        ],
        drawYokai: 'drawLanternCatPortrait',
        hasNeonGlow: true,
    },
    // 第3关：凌晨旧书店街
    bookshop: {
        name: '凌晨书店街',
        sky: [ [0,'#1a1a2e'],[0.3,'#2a2a44'],[0.5,'#3a3a55'],[0.7,'#4a4055'],[1,'#3a3040'] ],
        hasSun: false,
        groundColor: '#1a1518', sidewalkColor: '#222028', roadColor: '#1e1c24',
        buildingColor: '#121018', windowColor: 'rgba(255, 220, 150, 0.1)',
        cloudColor: [80, 70, 90],
        leafColors: ['#d4c4a0','#e8d4aa','#c4b490','#f5e6c8'],
        treeCanopy: '#1a2020', treeCanopyLight: '#2a3030',
        autumnOverlay: false,
        triggerSign: '旧书店', triggerText: '「嘘——别那么大声。」', triggerColor: '#f5e6c8',
        sceneryPresets: [
            { type: 'bookshelf', positions: [250, 600, 1000, 1400] },
            { type: 'tree', positions: [150, 800, 1200] },
            { type: 'streetlamp', positions: [400, 900, 1300] },
            { type: 'sign', positions: [1550], text: '→ 旧书店' },
        ],
        drawYokai: 'drawBookSpiritPortrait',
        hasPageParticles: true,
    },
    // 第4关：午夜铁道口
    train: {
        name: '午夜铁道口',
        sky: [ [0,'#020208'],[0.2,'#080818'],[0.5,'#0a0a20'],[0.8,'#151525'],[1,'#0f0f1a'] ],
        hasSun: false,
        groundColor: '#0a0a10', sidewalkColor: '#151515', roadColor: '#0e0e14',
        buildingColor: '#080810', windowColor: 'rgba(200, 200, 255, 0.08)',
        cloudColor: [40, 40, 60],
        leafColors: ['#2a2a3a','#333344','#222233','#1a1a2a'],
        treeCanopy: '#0a1a1a', treeCanopyLight: '#152525',
        autumnOverlay: false,
        triggerSign: '踏切', triggerText: '「汪。」', triggerColor: '#e8a050',
        sceneryPresets: [
            { type: 'rail', positions: [100, 400, 700, 1000, 1300, 1600] },
            { type: 'telegraph', positions: [300, 800, 1300] },
            { type: 'tree', positions: [200, 500, 1100] },
            { type: 'sign', positions: [1550], text: '→ 踏切' },
        ],
        drawYokai: 'drawTrainDogPortrait',
        hasStars: true,
    }
};

// 关卡顺序
const StageOrder = ['busStop', 'alley', 'bookshop', 'train'];

const ExploreScene = {
    canvas: null,
    ctx: null,

    // World / camera
    worldWidth: 2000,
    cameraX: 0,
    groundY: 0,

    // Current stage / theme
    currentStage: 0,  // index into StageOrder
    theme: null,

    // State
    phase: 'walking',
    animTimer: 0,
    encounterTimer: 0,
    triggerZone: 1700,
    yokaiAlpha: 0,

    // Environment
    leaves: Pixel.createParticleSystem(),
    clouds: [],
    buildings: [],
    sceneryItems: [],
    lampPosts: [],

    // Movement & hints
    arrowBlink: 0,
    showHint: true,
    isHolding: false,
    moveDir: 0,

    // HUD
    hudWidth: 180,
    hudOpen: false,
    hudAnimProgress: 0, // 0 = closed, 1 = open

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'walking';
        this.animTimer = 0;
        this.encounterTimer = 0;
        this.yokaiAlpha = 0;
        this.cameraX = 0;
        this.groundY = canvas.height * 0.78;
        this.leaves.clear();
        this.arrowBlink = 0;
        this.showHint = true;
        this.isHolding = false;
        this.hudOpen = false;
        this.hudAnimProgress = 0;

        // Toggle button
        const toggleBtn = document.getElementById('hud-toggle');
        toggleBtn.classList.remove('hidden');
        toggleBtn.onclick = () => {
            this.hudOpen = !this.hudOpen;
            AudioManager.playSelect();
        };

        // Init scene based on progress (only if not already set by Map)
        if (this.currentStage === undefined) {
            const obtainedCount = Object.keys(CollectionSystem.data).length;
            this.currentStage = Math.min(obtainedCount, StageOrder.length - 1);
        }
        
        const stageId = StageOrder[this.currentStage];
        this.theme = SceneThemes[stageId];

        // Init player position
        Player.x = 60;
        Player.y = this.groundY - 18 * Player.scale + 4;
        Player.state = 'idle';
        Player.facing = 1;

        this._generateWorld();
    },

    setStage(stageIndex) {
        this.currentStage = stageIndex;
    },

    _generateWorld() {
        const w = this.worldWidth;
        const theme = this.theme;

        // Clouds
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * w,
                y: 20 + Math.random() * 80,
                w: 40 + Math.random() * 60,
                h: 15 + Math.random() * 10,
                speed: 0.1 + Math.random() * 0.2,
                alpha: 0.08 + Math.random() * 0.12
            });
        }

        // Background buildings
        this.buildings = [];
        let bx = 0;
        while (bx < w) {
            const bw = 30 + Math.random() * 50;
            const bh = 40 + Math.random() * 80;
            this.buildings.push({ x: bx, w: bw, h: bh, windows: Math.floor(Math.random() * 4) });
            bx += bw + 10 + Math.random() * 30;
        }

        // Scenery from theme presets
        this.sceneryItems = [];
        if (theme.sceneryPresets) {
            for (const preset of theme.sceneryPresets) {
                for (const px of preset.positions) {
                    this.sceneryItems.push({
                        type: preset.type,
                        x: px + (Math.random() - 0.5) * 20,
                        size: 0.8 + Math.random() * 0.5,
                        text: preset.text || ''
                    });
                }
            }
        }

        // Lamp posts
        this.lampPosts = [];
        for (let lx = 200; lx < w; lx += 250 + Math.random() * 100) {
            this.lampPosts.push({ x: lx });
        }
    },

    update(dt) {
        this.animTimer += dt;
        this.arrowBlink += dt;

        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x > this.worldWidth + 100) cloud.x = -80;
        }

        // Particles
        if (Math.random() < 0.03) {
            const theme = this.theme;
            const colors = theme.leafColors || ['#888'];
            this.leaves.emit({
                x: () => this.cameraX + Math.random() * this.canvas.width,
                y: () => -10,
                speedX: () => 0.3 + Math.random() * 0.5,
                speedY: () => 0.5 + Math.random() * 0.8,
                life: () => 200 + Math.random() * 100,
                size: () => 2 + Math.random() * 2,
                color: () => colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.002,
                fadeOut: true
            });
        }
        this.leaves.update();

        if (this.phase === 'walking') {
            const moving = this.moveDir !== 0 || this.isHolding;
            if (moving) {
                const dir = this.moveDir !== 0 ? this.moveDir : 1;
                Player.state = 'walk';
                Player.facing = dir;
                Player.x += Player.speed * dir;
                Player.x = Math.max(10, Math.min(Player.x, this.worldWidth - 50));
                this.showHint = false;
                Player.frameTimer += dt;
                if (Player.frameTimer > 0.2) {
                    Player.frameTimer = 0;
                    Player.frame = (Player.frame + 1) % 2;
                }
            } else {
                if (Player.state === 'walk') {
                    Player.state = 'idle';
                    Player.frame = 0;
                }
            }

            const targetCam = Player.x - (this.canvas.width - this.hudWidth) * 0.35;
            this.cameraX += (targetCam - this.cameraX) * 0.08;
            this.cameraX = Math.max(0, Math.min(this.worldWidth - (this.canvas.width - this.hudWidth), this.cameraX));

            if (Player.x >= this.triggerZone) {
                this.phase = 'encounterTrigger';
                Player.state = 'idle';
                Player.facing = 1;
                this.showHint = false;
                this.isHolding = false;
                this.moveDir = 0;
            }
        } else if (this.phase === 'encounterTrigger') {
            this.encounterTimer += dt;
            this.yokaiAlpha = Math.min(1, this.encounterTimer * 0.5);
            if (this.encounterTimer > 3) {
                this.phase = 'encounterAnim';
            }
        }

        // HUD Animation
        if (this.hudOpen) {
            this.hudAnimProgress += dt * 4;
            if (this.hudAnimProgress > 1) this.hudAnimProgress = 1;
        } else {
            this.hudAnimProgress -= dt * 4;
            if (this.hudAnimProgress < 0) this.hudAnimProgress = 0;
        }
    },

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;
        const cam = this.cameraX;
        const theme = this.theme;
        
        // Easing for HUD slide
        const easeHUD = this.hudAnimProgress === 1 ? 1 : 1 - Math.pow(2, -10 * this.hudAnimProgress);
        const currentHudWidth = this.hudWidth * easeHUD;
        const gameW = w - currentHudWidth; // 游戏区域宽度

        // ════════════════════════════════════
        // 游戏场景区（左侧）
        // ════════════════════════════════════
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, gameW, h);
        ctx.clip();

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        for (const [stop, col] of theme.sky) {
            skyGrad.addColorStop(stop, col);
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, gameW, h);

        // Stars (for night themes)
        if (theme.hasStars) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            for (let i = 0; i < 40; i++) {
                const sx = (Math.sin(i * 127.3) * 0.5 + 0.5) * gameW;
                const sy = (Math.cos(i * 93.7) * 0.5 + 0.5) * h * 0.5;
                const tw = 0.3 + Math.sin(this.animTimer * 2 + i) * 0.4;
                ctx.globalAlpha = tw;
                ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
            }
            ctx.globalAlpha = 1;
        }

        // Sun
        if (theme.hasSun) {
            const sunX = gameW * 0.8 - cam * 0.02;
            const sunY = h * 0.6;
            const sc = theme.sunGlowColor;
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 80);
            sunGlow.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]}, 0.6)`);
            sunGlow.addColorStop(0.3, `rgba(${sc[0]},${sc[1]},${sc[2]}, 0.2)`);
            sunGlow.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]}, 0)`);
            ctx.fillStyle = sunGlow;
            ctx.fillRect(0, 0, gameW, h);
            ctx.fillStyle = theme.sunColor;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Neon glow (for alley theme)
        if (theme.hasNeonGlow) {
            const neonX = gameW * 0.3;
            const glow = ctx.createRadialGradient(neonX, h * 0.4, 5, neonX, h * 0.4, 120);
            glow.addColorStop(0, 'rgba(255, 80, 120, 0.06)');
            glow.addColorStop(1, 'rgba(255, 80, 120, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, gameW, h);
            const glow2 = ctx.createRadialGradient(gameW * 0.7, h * 0.35, 5, gameW * 0.7, h * 0.35, 100);
            glow2.addColorStop(0, 'rgba(80, 200, 255, 0.05)');
            glow2.addColorStop(1, 'rgba(80, 200, 255, 0)');
            ctx.fillStyle = glow2;
            ctx.fillRect(0, 0, gameW, h);
        }

        // Clouds
        const cc = theme.cloudColor;
        for (const cloud of this.clouds) {
            const cx = cloud.x - cam * 0.3;
            if (cx > -100 && cx < gameW + 100) {
                ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]}, ${cloud.alpha})`;
                ctx.beginPath();
                ctx.ellipse(cx, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Background buildings
        for (const b of this.buildings) {
            const bx = b.x - cam * 0.4;
            if (bx > -100 && bx < gameW + 100) {
                ctx.fillStyle = theme.buildingColor;
                ctx.fillRect(bx, this.groundY - b.h, b.w, b.h);
                ctx.fillStyle = theme.windowColor;
                for (let wi = 0; wi < b.windows; wi++) {
                    const wx = bx + 5 + (wi % 2) * (b.w / 2);
                    const wy = this.groundY - b.h + 10 + Math.floor(wi / 2) * 18;
                    ctx.fillRect(wx, wy, 6, 8);
                }
            }
        }

        // Ground
        ctx.fillStyle = theme.groundColor;
        ctx.fillRect(0, this.groundY, gameW, h - this.groundY);
        ctx.fillStyle = theme.sidewalkColor;
        ctx.fillRect(0, this.groundY, gameW, 8);
        ctx.fillStyle = theme.roadColor;
        ctx.fillRect(0, this.groundY + 8, gameW, h - this.groundY - 8);

        // Road markings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let rx = -cam % 40; rx < gameW; rx += 40) {
            ctx.fillRect(rx, this.groundY + h * 0.1, 20, 2);
        }

        // Scenery items
        for (const item of this.sceneryItems) {
            const ix = item.x - cam;
            if (ix < -60 || ix > gameW + 60) continue;
            this._drawSceneryItem(ctx, item, ix, this.groundY);
        }

        // Lamp posts
        for (const lamp of this.lampPosts) {
            const lx = lamp.x - cam;
            if (lx < -20 || lx > gameW + 20) continue;
            this._drawLamp(ctx, lx, this.groundY);
        }

        // Leaves
        ctx.save();
        ctx.translate(-cam, 0);
        this.leaves.draw(ctx);
        ctx.restore();

        // Player
        ctx.save();
        ctx.translate(-cam, 0);
        Player.draw(ctx);
        ctx.restore();

        // Trigger area sign
        const signX = this.triggerZone - 30 - cam;
        if (signX > -60 && signX < gameW + 60) {
            ctx.fillStyle = '#444';
            ctx.fillRect(signX, this.groundY - 60, 4, 60);
            ctx.fillStyle = '#2d4466';
            ctx.fillRect(signX - 16, this.groundY - 64, 40, 24);
            ctx.fillStyle = '#6ec6ff';
            ctx.fillRect(signX - 14, this.groundY - 62, 36, 20);
            Pixel.drawText(ctx, theme.triggerSign || '站', signX + 4, this.groundY - 60, {
                size: 10, color: '#1a1a3e', align: 'center', shadow: false
            });
            // Shelter
            ctx.fillStyle = 'rgba(50, 50, 70, 0.8)';
            ctx.fillRect(signX - 50, this.groundY - 68, 120, 5);
            ctx.fillStyle = '#333';
            ctx.fillRect(signX + 66, this.groundY - 68, 4, 68);
        }

        // Yokai encounter
        if (this.phase === 'encounterTrigger' || this.phase === 'encounterAnim') {
            const yokaiX = this.triggerZone + 100 - cam;
            const yokaiY = this.groundY - 80;

            ctx.save();
            ctx.globalAlpha = this.yokaiAlpha;
            const glow = ctx.createRadialGradient(yokaiX + 30, yokaiY + 30, 5, yokaiX + 30, yokaiY + 30, 70);
            glow.addColorStop(0, 'rgba(110, 198, 255, 0.3)');
            glow.addColorStop(1, 'rgba(110, 198, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(yokaiX - 50, yokaiY - 50, 160, 160);

            const drawFunc = getYokaiDrawFunc(StageOrder[this.currentStage]);
            drawFunc(ctx, yokaiX, yokaiY, Math.max(3, Math.floor(gameW / 200)), this.animTimer);
            ctx.restore();

            if (this.encounterTimer > 1.5) {
                const textAlpha = Math.min(1, (this.encounterTimer - 1.5) * 1.5);
                ctx.globalAlpha = textAlpha;
                Pixel.drawText(ctx, theme.triggerText, gameW / 2, h * 0.15, {
                    size: Math.min(18, gameW * 0.04),
                    color: theme.triggerColor,
                    align: 'center',
                    shadow: true,
                    shadowColor: 'rgba(0,0,0,0.6)'
                });
                ctx.globalAlpha = 1;
            }

            const vignette = ctx.createRadialGradient(gameW / 2, h / 2, h * 0.3, gameW / 2, h / 2, h);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, `rgba(0,0,0,${this.yokaiAlpha * 0.5})`);
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, gameW, h);
        }

        // Walking hint
        if (this.showHint && this.phase === 'walking') {
            const hintAlpha = 0.5 + Math.sin(this.arrowBlink * 3) * 0.3;
            ctx.globalAlpha = hintAlpha;
            Pixel.drawText(ctx, 'A/D 键盘 或 点击屏幕左右两侧 移动', gameW / 2, h * 0.15, {
                size: Math.min(14, gameW * 0.03),
                color: '#e0d0c0',
                align: 'center',
                shadow: true
            });
            ctx.globalAlpha = 1;
            
            // Draw left and right screen arrows for touch hint
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.2 + hintAlpha * 0.2) + ')';
            // Left arrow (<-)
            ctx.beginPath();
            ctx.moveTo(30, h / 2);
            ctx.lineTo(50, h / 2 - 20);
            ctx.lineTo(50, h / 2 + 20);
            ctx.fill();
            // Right arrow (->)
            ctx.beginPath();
            ctx.moveTo(gameW - 30, h / 2);
            ctx.lineTo(gameW - 50, h / 2 - 20);
            ctx.lineTo(gameW - 50, h / 2 + 20);
            ctx.fill();
        }

        ctx.restore(); // 结束游戏区clip

        // ════════════════════════════════════
        // 右侧HUD面板 (只在展开时绘制)
        // ════════════════════════════════════
        if (this.hudAnimProgress > 0) {
            this._drawHUD(ctx, w, h, gameW, currentHudWidth);
        }
    },

    // ───────── HUD 面板 ─────────
    _drawHUD(ctx, w, h, gameW, hw) {
        const hx = gameW;

        // 背景
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.fillRect(hx, 0, hw, h);
        // 左边框线
        ctx.fillStyle = 'rgba(110, 198, 255, 0.15)';
        ctx.fillRect(hx, 0, 1, h);

        const px = hx + 12;
        let py = 16;

        // ── 角色名 ──
        Pixel.drawText(ctx, `旅人 · ${genderLabel}`, hx + hw / 2, py, {
            size: 13, color: '#e0d0c0', align: 'center', shadow: true
        });
        py += 17;
        
        // Switch Button
        ctx.fillStyle = 'rgba(110, 198, 255, 0.2)';
        ctx.fillRect(hx + hw/2 - 35, py, 70, 16);
        ctx.strokeStyle = '#6ec6ff';
        ctx.strokeRect(hx + hw/2 - 35, py, 70, 16);
        Pixel.drawText(ctx, '切换主角', hx + hw / 2, py + 4, {
            size: 8, color: '#fff', align: 'center'
        });
        py += 24;

        // 角色小像素头像
        if (Player.gender) {
            const spriteData = Player.sprites[Player.gender].idle;
            const colorMap = Player.getColorMap();
            const miniScale = 2;
            const spriteW = 12 * miniScale;
            const spriteX = hx + (hw - spriteW) / 2;
            for (let row = 0; row < Math.min(8, spriteData.length); row++) {
                for (let col = 0; col < spriteData[row].length; col++) {
                    const val = spriteData[row][col];
                    if (val !== 0 && val !== '') {
                        ctx.fillStyle = colorMap[val] || '#ff00ff';
                        ctx.fillRect(Math.floor(spriteX + col * miniScale), Math.floor(py + row * miniScale), miniScale, miniScale);
                    }
                }
            }
        }
        py += 22;

        // 分割线
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, hw - 24, 1);
        py += 10;

        // ── 当前关卡 ──
        Pixel.drawText(ctx, '当前区域', px, py, {
            size: 9, color: '#888', align: 'left', shadow: false
        });
        py += 14;
        Pixel.drawText(ctx, this.theme.name, px, py, {
            size: 11, color: '#e8834a', align: 'left', shadow: true
        });
        py += 18;

        // 分割线
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, hw - 24, 1);
        py += 10;

        // ── 妖怪图鉴进度 ──
        Pixel.drawText(ctx, '妖怪图鉴', px, py, {
            size: 9, color: '#888', align: 'left', shadow: false
        });
        py += 14;

        const yokaiList = ['rainWoman', 'lanternCat', 'bookSpirit', 'trainDog'];
        const yokaiNames = ['雨女', '提灯猫又', '纸鱼书灵', '踏切犬'];
        const yokaiIcons = ['🌧', '🏮', '📖', '🐕'];

        for (let i = 0; i < yokaiList.length; i++) {
            const isCollected = CollectionSystem.isCollected(yokaiList[i]);
            const isCurrent = i === this.currentStage;
            const isLocked = i > this.currentStage && !isCollected;

            // Icon
            ctx.fillStyle = isCollected ? '#7cff8a' : (isCurrent ? '#ffe066' : '#444');
            ctx.font = '12px serif';
            ctx.fillText(yokaiIcons[i], px, py + 10);

            // Name
            const nameColor = isCollected ? '#7cff8a' : (isCurrent ? '#ffe066' : '#555');
            Pixel.drawText(ctx, isLocked ? '???' : yokaiNames[i], px + 18, py, {
                size: 10, color: nameColor, align: 'left', shadow: false
            });

            // Status tag
            const tag = isCollected ? '✓' : (isCurrent ? '◆' : '·');
            const tagColor = isCollected ? '#7cff8a' : (isCurrent ? '#ffe066' : '#444');
            Pixel.drawText(ctx, tag, hx + hw - 16, py, {
                size: 10, color: tagColor, align: 'center', shadow: false
            });

            py += 18;
        }
        py += 4;

        // 分割线
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, hw - 24, 1);
        py += 10;

        // ── 关卡地图 ──
        Pixel.drawText(ctx, '旅途地图', px, py, {
            size: 9, color: '#888', align: 'left', shadow: false
        });
        py += 14;

        const mapW = hw - 28;
        const nodeSpacing = mapW / 3;
        const mapY = py + 8;
        const stageLabels = ['街', '巷', '书', '铁'];

        // Draw connecting line
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(px + 8, mapY + 8, mapW - 16, 2);

        // Draw nodes
        for (let i = 0; i < 4; i++) {
            const nx = px + 8 + i * nodeSpacing;
            const isCurrent = i === this.currentStage;
            const isDone = CollectionSystem.isCollected(yokaiList[i]);

            // Node circle
            if (isDone) {
                ctx.fillStyle = '#7cff8a';
            } else if (isCurrent) {
                const pulse = 0.6 + Math.sin(this.animTimer * 3) * 0.4;
                ctx.fillStyle = `rgba(255, 224, 102, ${pulse})`;
            } else {
                ctx.fillStyle = '#333';
            }
            ctx.beginPath();
            ctx.arc(nx, mapY + 9, 7, 0, Math.PI * 2);
            ctx.fill();

            // Label
            Pixel.drawText(ctx, stageLabels[i], nx, mapY + 4, {
                size: 8, color: isDone ? '#1a1a2e' : (isCurrent ? '#1a1a2e' : '#666'),
                align: 'center', shadow: false
            });
        }
        py = mapY + 28;

        // ── 收集信物 ──
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, hw - 24, 1);
        py += 10;

        Pixel.drawText(ctx, '收集信物', px, py, {
            size: 9, color: '#888', align: 'left', shadow: false
        });
        py += 14;

        const tokenNames = ['永湿之伞', '不灭灯笼', '不褪书页', '狗铃铛'];
        let collectedCount = 0;
        for (let i = 0; i < yokaiList.length; i++) {
            if (CollectionSystem.isCollected(yokaiList[i])) {
                collectedCount++;
                Pixel.drawText(ctx, `· ${tokenNames[i]}`, px + 4, py, {
                    size: 9, color: '#d4587a', align: 'left', shadow: false
                });
                py += 14;
            }
        }
        if (collectedCount === 0) {
            Pixel.drawText(ctx, '尚无', px + 4, py, {
                size: 9, color: '#444', align: 'left', shadow: false
            });
            py += 14;
        }

        py += 10;
        // Detailed Collection Button
        ctx.fillStyle = 'rgba(232, 131, 74, 0.2)';
        ctx.fillRect(hx + hw/2 - 40, py, 80, 20);
        ctx.strokeStyle = '#e8834a';
        ctx.strokeRect(hx + hw/2 - 40, py, 80, 20);
        Pixel.drawText(ctx, '查看图鉴', hx + hw / 2, py + 5, {
            size: 9, color: '#fff', align: 'center'
        });

        // ── 底部操作提示 ──
        py = h - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, hw - 24, 1);
        py += 10;
        Pixel.drawText(ctx, 'A/D 移动 · 空格 对话', hx + hw / 2, py, {
            size: 8, color: '#555', align: 'center', shadow: false
        });
    },

    // ───────── 场景道具绘制 ─────────
    _drawSceneryItem(ctx, item, x, groundY) {
        const theme = this.theme;
        switch (item.type) {
            case 'tree': {
                const s = item.size;
                ctx.fillStyle = '#3a2a1a';
                ctx.fillRect(x + 6 * s, groundY - 40 * s, 6 * s, 40 * s);
                ctx.fillStyle = theme.treeCanopy;
                ctx.beginPath();
                ctx.arc(x + 9 * s, groundY - 45 * s, 20 * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = theme.treeCanopyLight;
                ctx.beginPath();
                ctx.arc(x + 14 * s, groundY - 50 * s, 15 * s, 0, Math.PI * 2);
                ctx.fill();
                if (theme.autumnOverlay) {
                    ctx.fillStyle = `rgba(232, 131, 74, ${0.2 + Math.random() * 0.15})`;
                    ctx.beginPath();
                    ctx.arc(x + 9 * s, groundY - 48 * s, 16 * s, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            }
            case 'bench': {
                ctx.fillStyle = '#5a3a2a';
                ctx.fillRect(x, groundY - 12, 30, 4);
                ctx.fillRect(x + 3, groundY - 8, 3, 8);
                ctx.fillRect(x + 24, groundY - 8, 3, 8);
                ctx.fillRect(x, groundY - 22, 2, 14);
                ctx.fillRect(x + 28, groundY - 22, 2, 14);
                ctx.fillRect(x, groundY - 22, 30, 3);
                break;
            }
            case 'vending': {
                ctx.fillStyle = '#2a3a4a';
                ctx.fillRect(x, groundY - 36, 20, 36);
                ctx.fillStyle = 'rgba(110, 198, 255, 0.3)';
                ctx.fillRect(x + 2, groundY - 34, 16, 20);
                ctx.fillStyle = '#ff6b81';
                ctx.fillRect(x + 4, groundY - 30, 4, 8);
                ctx.fillStyle = '#6ec6ff';
                ctx.fillRect(x + 10, groundY - 30, 4, 8);
                break;
            }
            case 'cat': {
                const bob = Math.sin(this.animTimer * 2) * 1;
                ctx.fillStyle = '#e8834a';
                ctx.fillRect(x + 2, groundY - 10 + bob, 8, 6);
                ctx.fillRect(x + 3, groundY - 14 + bob, 6, 5);
                ctx.fillRect(x + 3, groundY - 16 + bob, 2, 3);
                ctx.fillRect(x + 7, groundY - 16 + bob, 2, 3);
                ctx.fillRect(x + 10, groundY - 12 + bob, 2, 2);
                ctx.fillRect(x + 12, groundY - 14 + bob, 2, 2);
                ctx.fillStyle = '#ffe066';
                ctx.fillRect(x + 4, groundY - 13 + bob, 1, 1);
                ctx.fillRect(x + 7, groundY - 13 + bob, 1, 1);
                break;
            }
            case 'sign': {
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 8, groundY - 30, 3, 30);
                ctx.fillStyle = '#444';
                ctx.fillRect(x - 5, groundY - 34, 30, 16);
                Pixel.drawText(ctx, item.text, x + 10, groundY - 32, {
                    size: 8, color: '#e0e0e0', align: 'center', shadow: false
                });
                break;
            }
            // 小巷主题道具
            case 'lantern': {
                const swing = Math.sin(this.animTimer * 2 + x) * 3;
                ctx.fillStyle = '#cc4400';
                ctx.fillRect(x + swing, groundY - 50, 10, 14);
                ctx.fillStyle = '#ff8844';
                ctx.fillRect(x + 2 + swing, groundY - 48, 6, 10);
                const glow = ctx.createRadialGradient(x + 5 + swing, groundY - 43, 2, x + 5 + swing, groundY - 43, 30);
                glow.addColorStop(0, 'rgba(255,120,40,0.15)');
                glow.addColorStop(1, 'rgba(255,120,40,0)');
                ctx.fillStyle = glow;
                ctx.fillRect(x - 30 + swing, groundY - 75, 70, 60);
                break;
            }
            case 'trash': {
                ctx.fillStyle = '#333';
                ctx.fillRect(x, groundY - 14, 12, 14);
                ctx.fillStyle = '#444';
                ctx.fillRect(x - 1, groundY - 16, 14, 3);
                break;
            }
            case 'barrel': {
                ctx.fillStyle = '#3a2a1a';
                ctx.fillRect(x, groundY - 20, 14, 20);
                ctx.fillStyle = '#555';
                ctx.fillRect(x - 1, groundY - 5, 16, 2);
                ctx.fillRect(x - 1, groundY - 15, 16, 2);
                break;
            }
            case 'noren': {
                // 门帘
                const sway = Math.sin(this.animTimer * 1.5 + x) * 2;
                ctx.fillStyle = '#8b2252';
                ctx.fillRect(x, groundY - 45, 30, 3);
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#8b2252' : '#aa3366';
                    ctx.fillRect(x + 2 + i * 7 + sway * (i % 2 === 0 ? 1 : -1), groundY - 42, 5, 25);
                }
                break;
            }
            // 书店主题道具
            case 'bookshelf': {
                ctx.fillStyle = '#3a2a1a';
                ctx.fillRect(x, groundY - 40, 24, 40);
                ctx.fillStyle = '#5a4030';
                ctx.fillRect(x + 2, groundY - 38, 20, 2);
                ctx.fillRect(x + 2, groundY - 26, 20, 2);
                ctx.fillRect(x + 2, groundY - 14, 20, 2);
                // Books
                const bookColors = ['#cc4444','#4488cc','#44aa66','#cc8844','#8844aa'];
                for (let r = 0; r < 3; r++) {
                    for (let b = 0; b < 4; b++) {
                        ctx.fillStyle = bookColors[(r * 4 + b) % bookColors.length];
                        ctx.fillRect(x + 3 + b * 5, groundY - 37 + r * 12, 4, 10);
                    }
                }
                break;
            }
            case 'streetlamp': {
                ctx.fillStyle = '#555';
                ctx.fillRect(x, groundY - 50, 2, 50);
                ctx.fillStyle = 'rgba(255,220,150,0.6)';
                ctx.fillRect(x - 2, groundY - 52, 6, 4);
                const lampGlow = ctx.createRadialGradient(x + 1, groundY - 48, 2, x + 1, groundY - 48, 35);
                lampGlow.addColorStop(0, 'rgba(255,220,150,0.1)');
                lampGlow.addColorStop(1, 'rgba(255,220,150,0)');
                ctx.fillStyle = lampGlow;
                ctx.fillRect(x - 35, groundY - 85, 72, 70);
                break;
            }
            // 铁道主题道具
            case 'rail': {
                ctx.fillStyle = '#555';
                ctx.fillRect(x, groundY - 2, 40, 2);
                ctx.fillRect(x, groundY + 4, 40, 2);
                // Sleepers
                ctx.fillStyle = '#3a2a1a';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(x + i * 10, groundY - 4, 3, 10);
                }
                break;
            }
            case 'telegraph': {
                ctx.fillStyle = '#444';
                ctx.fillRect(x, groundY - 80, 3, 80);
                ctx.fillRect(x - 12, groundY - 78, 27, 2);
                ctx.fillRect(x - 8, groundY - 72, 19, 2);
                // Wires
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 12, groundY - 77);
                ctx.quadraticCurveTo(x + 80, groundY - 70, x + 150, groundY - 77);
                ctx.stroke();
                break;
            }
        }
    },

    _drawLamp(ctx, x, groundY) {
        const flicker = 0.6 + Math.sin(this.animTimer * 8 + x) * 0.1 + Math.random() * 0.1;
        ctx.fillStyle = '#444';
        ctx.fillRect(x, groundY - 70, 3, 70);
        ctx.fillRect(x - 8, groundY - 74, 20, 3);
        ctx.fillStyle = `rgba(255, 220, 130, ${flicker})`;
        ctx.fillRect(x - 1, groundY - 70, 6, 4);
        const glow = ctx.createRadialGradient(x + 2, groundY - 66, 2, x + 2, groundY - 66, 50);
        glow.addColorStop(0, `rgba(255, 200, 100, ${0.15 * flicker})`);
        glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 50, groundY - 120, 104, 120);
    },

    // ───────── 输入 ─────────
    handleHoldStart(mx, my) {
        if (this.phase === 'walking') {
            this.isHolding = true;
            this.moveDir = (mx < this.canvas.width / 2) ? -1 : 1;
        }
    },
    handleHoldEnd() {
        this.isHolding = false;
        this.moveDir = 0;
    },
    handleKeyDown(key) {
        if (this.phase === 'walking') {
            if (key === 'd' || key === 'D' || key === 'ArrowRight') this.moveDir = 1;
            else if (key === 'a' || key === 'A' || key === 'ArrowLeft') this.moveDir = -1;
        }
    },
    handleKeyUp(key) {
        if (key === 'd' || key === 'D' || key === 'ArrowRight') { if (this.moveDir === 1) this.moveDir = 0; }
        else if (key === 'a' || key === 'A' || key === 'ArrowLeft') { if (this.moveDir === -1) this.moveDir = 0; }
    },
    handleClick(mx, my) {
        const gameW = this.canvas.width * (this.hudOpen ? 0.75 : 1);
        const hw = this.canvas.width * 0.25;

        // Check HUD interaction if open
        if (this.hudOpen && mx > gameW) {
            // Switch Role Button
            if (my > 35 && my < 65) {
                Player.gender = Player.gender === 'boy' ? 'girl' : 'boy';
                AudioManager.playSelect();
                return null;
            }
            // Detailed Collection Button (Rough Y check based on py accumulation)
            // It's usually near the bottom of the list
            if (my > 320 && my < 360) {
                CollectionSystem.open();
                return null;
            }
        }

        if (this.phase === 'encounterTrigger' && this.encounterTimer > 1) return 'encounter';
        if (this.phase === 'encounterAnim') return 'encounter';
        return null;
    },
    handleMove(mx, my) {
        if (this.isHolding && this.phase === 'walking') {
            this.moveDir = (mx < this.canvas.width / 2) ? -1 : 1;
        }
    },
    cleanup() {
        this.leaves.clear();
        this.moveDir = 0;
        this.isHolding = false;
        document.getElementById('hud-toggle').classList.add('hidden');
    },

    // ───────── Portrait Drawing ─────────
    drawRainWomanPortrait(ctx, x, y, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Float effect
        const floatY = Math.sin(this.animTimer * 2) * 5;
        const py = y + floatY;

        // Cloak
        ctx.fillStyle = 'rgba(60, 100, 180, 0.6)';
        ctx.beginPath();
        ctx.moveTo(x - 20, py + 40);
        ctx.lineTo(x, py - 40);
        ctx.lineTo(x + 20, py + 40);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#0a0a20';
        ctx.fillRect(x - 12, py - 42, 24, 60);

        // Face (pale)
        ctx.fillStyle = '#f0f0ff';
        ctx.fillRect(x - 8, py - 35, 16, 15);

        // Eyes (tears)
        ctx.fillStyle = '#4a9eff';
        ctx.fillRect(x - 5, py - 30, 2, 2);
        ctx.fillRect(x + 3, py - 30, 2, 2);
        
        // Ghost fire
        this._drawGhostFire(ctx, x - 15, py + 35, alpha);
        this._drawGhostFire(ctx, x + 15, py + 35, alpha);

        ctx.restore();
    },

    drawLanternCatPortrait(ctx, x, y, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const floatY = Math.sin(this.animTimer * 2.5) * 4;
        const py = y + floatY;

        // Cat Shadow
        ctx.fillStyle = 'rgba(20, 20, 30, 0.7)';
        ctx.beginPath();
        ctx.arc(x, py, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.beginPath();
        ctx.moveTo(x - 20, py - 15);
        ctx.lineTo(x - 25, py - 35);
        ctx.lineTo(x - 10, py - 20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 20, py - 15);
        ctx.lineTo(x + 25, py - 35);
        ctx.lineTo(x + 10, py - 20);
        ctx.fill();

        // Eyes (Glowing Yellow)
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(x - 12, py - 5, 6, 2);
        ctx.fillRect(x + 6, py - 5, 6, 2);

        // Lantern (hanging from tail)
        const lx = x + 30;
        const ly = py + 10;
        ctx.fillStyle = '#f0932b';
        ctx.fillRect(lx - 10, ly, 20, 25);
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
        ctx.fillRect(lx - 6, ly + 4, 12, 17);
        
        // Ghost fire base
        this._drawGhostFire(ctx, x, py + 25, alpha);

        ctx.restore();
    },

    drawBookSpiritPortrait(ctx, x, y, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const floatY = Math.sin(this.animTimer * 1.5) * 6;
        const py = y + floatY;

        // Paper body
        ctx.fillStyle = 'rgba(240, 230, 200, 0.7)';
        ctx.fillRect(x - 25, py - 40, 50, 70);
        
        // Writing (pixel noise)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for(let i=0; i<8; i++) {
            ctx.fillRect(x - 15 + Math.random()*30, py - 30 + i*8, 5, 1);
        }

        // Eyes (Gentle green)
        ctx.fillStyle = '#7cff8a';
        ctx.beginPath();
        ctx.arc(x - 10, py - 10, 3, 0, Math.PI * 2);
        ctx.arc(x + 10, py - 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Spinning pages (particles)
        if (Math.random() < 0.1) {
            this.leaves.emit({
                x: x, y: py,
                count: 1,
                speedX: () => (Math.random()-0.5)*4,
                speedY: () => (Math.random()-0.5)*4,
                life: 30,
                size: 4,
                color: '#fff9e3',
                gravity: 0,
                fadeOut: true
            });
        }
        
        ctx.restore();
    },

    drawTrainDogPortrait(ctx, x, y, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const shake = (Math.random()-0.5) * 2;
        const py = y + shake;

        // Dog silhouette
        ctx.fillStyle = 'rgba(40, 30, 20, 0.8)';
        ctx.beginPath();
        ctx.ellipse(x, py + 10, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc(x - 20, py - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears (droopy)
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 40, py - 10, 10, 20);
        
        // Eyes (Red - troubled)
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(x - 28, py - 15, 4, 4);
        
        // Red rail signal glow
        const glow = 0.5 + Math.sin(this.animTimer * 10) * 0.4;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255, 0, 0, ${glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(x + 40, py - 30, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    _drawGhostFire(ctx, x, y, alpha) {
        const flicker = 0.5 + Math.sin(this.animTimer * 10 + x) * 0.5;
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 8 + flicker * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(200, 240, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(x, y, 4 + flicker * 2, 0, Math.PI * 2);
        ctx.fill();
    }
};
