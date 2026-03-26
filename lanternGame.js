/* ========================================
   lanternGame.js — 用伞护住魂火的小游戏（提灯猫又）
   ======================================== */

const LanternGameScene = {
    canvas: null,
    ctx: null,

    // Game state
    gameTime: 0,         // elapsed time in seconds
    isRunning: false,
    isOver: false,
    won: false,

    // Config (from yokai data)
    config: null,
    difficultyMultiplier: 1.0,

    // Tool (Umbrella from Level 1)
    tool: {
        x: 0, y: 0,
        width: 80,
        durability: 5,
        maxDurability: 5,
        broken: false,
        hitFlash: 0
    },

    // Drops
    drops: [],
    dropSpawnTimer: 0,
    tearSpawnTimer: 0,
    thunderSpawnTimer: 0,

    // Score tracking
    totalDrops: 0,
    caughtDrops: 0,
    missedDrops: 0,
    spawnedTears: 0,
    caughtTears: 0,
    bonusPoints: 0,

    // Visual
    bgParticles: Pixel.createParticleSystem(),
    splashParticles: Pixel.createParticleSystem(),
    animTimer: 0,
    flashEffect: 0,    // screen flash for thunder
    warningText: '',
    warningTimer: 0,
    comboCount: 0,
    comboTimer: 0,
    mouseX: 0,
    mouseY: 0,

    // Difficulty progression
    currentSpeed: 2,
    currentInterval: 300,

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = YokaiData.lanternCat.gameConfig;

        // Calculate difficulty based on current collection progress
        const collectedCount = Object.keys(CollectionSystem.data).length;
        // Base is 0.7 (easy) for the first encounter, scaling up to 1.3 (hard) for later ones
        this.difficultyMultiplier = 0.7 + (collectedCount * 0.2);

        // Reset state
        this.gameTime = 0;
        this.isRunning = true;
        this.isOver = false;
        this.won = false;

        this.umbrella.x = canvas.width / 2;
        this.umbrella.y = canvas.height * 0.72;
        this.umbrella.width = this.config.umbrellaWidth;
        this.umbrella.durability = this.config.umbrellaDurability;
        this.umbrella.maxDurability = this.config.umbrellaDurability;
        this.umbrella.broken = false;
        this.umbrella.hitFlash = 0;

        this.drops = [];
        this.dropSpawnTimer = 0;
        this.tearSpawnTimer = 0;
        this.thunderSpawnTimer = 3000; // delay first thunder

        this.totalDrops = 0;
        this.caughtDrops = 0;
        this.missedDrops = 0;
        this.spawnedTears = 0;
        this.caughtTears = 0;
        this.bonusPoints = 0;

        this.bgParticles.clear();
        this.splashParticles.clear();
        this.animTimer = 0;
        this.flashEffect = 0;
        this.warningText = '';
        this.warningTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;

        this.currentSpeed = this.config.rainBaseSpeed;
        this.currentInterval = this.config.rainInterval;

        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height * 0.72;

        // Show HUD
        document.getElementById('game-hud').classList.remove('hidden');

        // Start rain
        AudioManager.startRain();
    },

    update(dt) {
        if (!this.isRunning) return;
        if (this.isOver) return;

        this.animTimer += dt;
        const dtMs = dt * 1000;

        // Update game time
        this.gameTime += dt;

        // Check if time is up
        if (this.gameTime >= this.config.duration) {
            this._endGame();
            return;
        }

        // Difficulty escalation
        const progress = this.gameTime / this.config.duration;
        this.currentSpeed = Pixel.lerp(
            this.config.rainBaseSpeed,
            this.config.rainMaxSpeed,
            progress
        ) * this.difficultyMultiplier;

        this.currentInterval = Pixel.lerp(
            this.config.rainInterval,
            this.config.rainMinInterval,
            progress * progress // quadratic ramp
        ) / this.difficultyMultiplier;

        // Spawn rain drops
        this.dropSpawnTimer += dtMs;
        if (this.dropSpawnTimer >= this.currentInterval) {
            this.dropSpawnTimer = 0;
            this._spawnRainDrop();
        }

        // Spawn tear drops
        this.tearSpawnTimer += dtMs;
        const tearInt = (this.config.tearInterval / this.difficultyMultiplier) * (1 - progress * 0.3);
        if (this.tearSpawnTimer >= tearInt) {
            this.tearSpawnTimer = 0;
            this._spawnTearDrop();
        }

        // Spawn thunder orbs (after 10 seconds, or sooner if hard)
        const thunderStartTime = 10 / this.difficultyMultiplier;
        if (this.gameTime > thunderStartTime) {
            this.thunderSpawnTimer += dtMs;
            const thunderInt = (this.config.thunderInterval / this.difficultyMultiplier) * (1 - progress * 0.3);
            if (this.thunderSpawnTimer >= thunderInt) {
                this.thunderSpawnTimer = 0;
                this._spawnThunderOrb();
            }
        }

        // Add wind gusts in later half
        const windChance = 0.01 * this.difficultyMultiplier;
        if (progress > 0.5 && Math.random() < windChance) {
            this._triggerWindGust();
        }

        // Smooth umbrella movement towards mouse
        const targetX = Math.max(this.umbrella.width / 2,
            Math.min(this.canvas.width - this.umbrella.width / 2, this.mouseX));
        this.umbrella.x += (targetX - this.umbrella.x) * 0.15;

        // Update drops
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];

            // Apply wind
            drop.x += drop.windX || 0;

            // Apply speed
            drop.y += drop.speed;

            // Wobble for tear drops
            if (drop.type === 'tear') {
                drop.x += Math.sin(this.animTimer * 5 + drop.wobble) * 0.5;
            }

            // Thunder orb glow
            if (drop.type === 'thunder') {
                drop.glowTimer = (drop.glowTimer || 0) + dt;
            }

            // Check umbrella collision
            const umbrellaTop = this.umbrella.y;
            const umbrellaLeft = this.umbrella.x - this.umbrella.width / 2;
            const umbrellaRight = this.umbrella.x + this.umbrella.width / 2;

            if (drop.y >= umbrellaTop - 5 && drop.y <= umbrellaTop + 15 &&
                drop.x >= umbrellaLeft && drop.x <= umbrellaRight &&
                !this.umbrella.broken) {

                if (drop.type === 'thunder') {
                    // Thunder hit umbrella — BAD
                    this.umbrella.durability--;
                    this.umbrella.hitFlash = 0.5;
                    this.flashEffect = 0.8;
                    Pixel.shake.trigger(8, 15);
                    AudioManager.playThunder();
                    this.comboCount = 0;

                    if (this.umbrella.durability <= 0) {
                        this.umbrella.broken = true;
                        this.warningText = '伞坏了！！';
                        this.warningTimer = 2;
                    }

                    // Splash particles
                    this.splashParticles.emit({
                        x: drop.x, y: umbrellaTop,
                        count: 12,
                        speedX: () => (Math.random() - 0.5) * 5,
                        speedY: () => -2 - Math.random() * 3,
                        life: () => 20 + Math.random() * 20,
                        size: () => 2 + Math.random() * 2,
                        color: '#ffe066',
                        gravity: 0.15,
                        fadeOut: true
                    });
                } else {
                    // Rain / tear caught — GOOD
                    this.caughtDrops++;

                    if (drop.type === 'tear') {
                        this.caughtTears++;
                        AudioManager.playTearCatch();
                        this.comboCount += 3;
                        // Bonus splash
                        this.splashParticles.emit({
                            x: drop.x, y: umbrellaTop,
                            count: 8,
                            speedX: () => (Math.random() - 0.5) * 3,
                            speedY: () => -1 - Math.random() * 2,
                            life: () => 30 + Math.random() * 30,
                            size: () => 2,
                            color: () => Math.random() < 0.5 ? '#4a9eff' : '#a8e0ff',
                            gravity: 0.08,
                            fadeOut: true
                        });
                    } else {
                        this.bonusPoints++;
                        AudioManager.playCatch();
                        this.comboCount++;
                        // Normal splash
                        this.splashParticles.emit({
                            x: drop.x, y: umbrellaTop,
                            count: 3,
                            speedX: () => (Math.random() - 0.5) * 2,
                            speedY: () => -1 - Math.random(),
                            life: () => 15 + Math.random() * 15,
                            size: () => 1 + Math.random(),
                            color: 'rgba(110, 198, 255, 0.6)',
                            gravity: 0.1,
                            fadeOut: true
                        });
                    }
                    this.comboTimer = 1.5;
                }

                this.drops.splice(i, 1);
                continue;
            }

            // Check if drop hit ground
            if (drop.y > this.canvas.height + 10) {
                if (drop.type !== 'thunder') {
                    this.missedDrops++;
                    this.comboCount = 0;
                    if (drop.type === 'tear') {
                        // Missing tear is worse
                        this.missedDrops += 2;
                        AudioManager.playMiss();
                    }
                }
                this.drops.splice(i, 1);
            }
        }

        // Update totalDrops for protection rate
        this.totalDrops = this.caughtDrops + this.missedDrops;

        // Update visual effects
        if (this.umbrella.hitFlash > 0) this.umbrella.hitFlash -= dt * 2;
        if (this.flashEffect > 0) this.flashEffect -= dt * 3;
        if (this.warningTimer > 0) this.warningTimer -= dt;
        if (this.comboTimer > 0) this.comboTimer -= dt;
        else this.comboCount = 0;

        Pixel.shake.update();
        this.splashParticles.update();

        // Background rain particles
        if (Math.random() < 0.3) {
            this.bgParticles.emit({
                x: () => Math.random() * this.canvas.width,
                y: () => -5,
                speedX: () => -0.3,
                speedY: () => 6 + Math.random() * 2,
                life: 50,
                size: 1,
                color: 'rgba(110, 198, 255, 0.2)',
                gravity: 0,
                fadeOut: false
            });
        }
        this.bgParticles.update();

        // Update HUD
        this._updateHUD();
    },

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.translate(Pixel.shake.offsetX, Pixel.shake.offsetY);

        // Dark rainy sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0d0d1a');
        skyGrad.addColorStop(0.3, '#1a1a2e');
        skyGrad.addColorStop(0.6, '#2d1b3e');
        skyGrad.addColorStop(1, '#1a1520');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(-10, -10, w + 20, h + 20);

        // Background rain
        this.bgParticles.draw(ctx);

        // Lightning flash
        if (this.flashEffect > 0) {
            ctx.fillStyle = `rgba(255, 255, 200, ${this.flashEffect * 0.3})`;
            ctx.fillRect(0, 0, w, h);
        }

        // Ground
        ctx.fillStyle = '#1a1520';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);

        // Puddles
        ctx.fillStyle = 'rgba(110, 198, 255, 0.08)';
        for (let px = 20; px < w; px += 80 + Math.random() * 60) {
            ctx.fillRect(px, h * 0.87, 40 + Math.random() * 30, 2);
        }

        // Draw drops
        for (const drop of this.drops) {
            if (drop.type === 'rain') {
                ctx.fillStyle = 'rgba(180, 100, 255, 0.7)'; // Purple resentment rain
                ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 2, 7);
                ctx.shadowColor = '#ffe066';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#fff9e3';
                // Fireball shape
                ctx.beginPath();
                ctx.arc(drop.x, drop.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(drop.x - 3, drop.y + 2);
                ctx.lineTo(drop.x, drop.y - 5);
                ctx.lineTo(drop.x + 3, drop.y + 2);
                ctx.fill();
                ctx.restore();
            } else if (drop.type === 'thunder') {
                // Thunder orb — yellow, dangerous
                ctx.save();
                const glow = 0.5 + Math.sin((drop.glowTimer || 0) * 10) * 0.3;
                ctx.shadowColor = '#ffe066';
                ctx.shadowBlur = 12;
                ctx.fillStyle = `rgba(255, 224, 102, ${0.8 + glow * 0.2})`;
                ctx.beginPath();
                ctx.arc(drop.x, drop.y, 5, 0, Math.PI * 2);
                ctx.fill();
                // Lightning bolts around it
                ctx.strokeStyle = `rgba(255, 255, 150, ${glow})`;
                ctx.lineWidth = 1;
                for (let j = 0; j < 3; j++) {
                    const angle = (drop.glowTimer || 0) * 3 + j * 2.1;
                    const bx = drop.x + Math.cos(angle) * 8;
                    const by = drop.y + Math.sin(angle) * 8;
                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(bx, by);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        // Draw Tool
        this._drawTool(ctx);

        // Splash particles
        this.splashParticles.draw(ctx);

        // Combo text
        if (this.comboCount >= 5 && this.comboTimer > 0) {
            const comboAlpha = Math.min(1, this.comboTimer);
            ctx.globalAlpha = comboAlpha;
            const comboText = this.comboCount >= 20 ? '完美！！' :
                             this.comboCount >= 10 ? '太厉害了！' : `连续 ${this.comboCount}`;
            Pixel.drawText(ctx, `保护魂火！挡住怨方的雨滴！`, w / 2, h * 0.8, {
                size: 18,
                color: '#ffe066',
                align: 'center'
            });
            Pixel.drawText(ctx, `(手中握着：雨女的永湿之伞)`, w / 2, h * 0.84, {
                size: 12,
                color: 'rgba(255, 255, 255, 0.5)',
                align: 'center'
            });
            ctx.globalAlpha = 1;
        }

        // Warning text
        if (this.warningTimer > 0) {
            const wAlpha = Math.min(1, this.warningTimer);
            ctx.globalAlpha = wAlpha;
            Pixel.drawText(ctx, this.warningText, w / 2, h * 0.4, {
                size: 22,
                color: '#ff4757',
                align: 'center'
            });
            ctx.globalAlpha = 1;
        }

        // Progress (time) bar at bottom
        const progress = this.gameTime / this.config.duration;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, h - 4, w, 4);
        ctx.fillStyle = progress > 0.8 ? '#2ed573' : '#6ec6ff';
        ctx.fillRect(0, h - 4, w * progress, 4);

        ctx.restore();
    },

    _drawTool(ctx) {
        const u = this.tool;
        const cx = Math.floor(u.x);
        const cy = Math.floor(u.y);
        const halfW = Math.floor(u.width / 2);

        ctx.save();
        if (u.hitFlash > 0) ctx.globalAlpha = 0.5 + u.hitFlash;

        if (u.broken) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - halfW, cy + 5);
            ctx.lineTo(cx + halfW, cy + 2);
            ctx.stroke();
        } else {
            // Draw Level 1 Umbrella (Blue/Cyan theme for cat's stage)
            const umbrellGrad = ctx.createLinearGradient(cx - halfW, cy - 12, cx + halfW, cy);
            umbrellGrad.addColorStop(0, '#6ec6ff');
            umbrellGrad.addColorStop(0.5, '#4a9eff');
            umbrellGrad.addColorStop(1, '#6ec6ff');
            ctx.fillStyle = umbrellGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, halfW, Math.PI, 0);
            ctx.fill();
            
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Handle
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, cy + 20);
            ctx.stroke();
        }
        ctx.restore();
    },

    _spawnRainDrop() {
        this.drops.push({
            type: 'rain',
            x: Math.random() * this.canvas.width,
            y: -10 - Math.random() * 30,
            speed: this.currentSpeed + (Math.random() - 0.5),
            windX: 0
        });
    },

    _spawnTearDrop() {
        this.spawnedTears++;
        this.drops.push({
            type: 'tear',
            x: Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1,
            y: -15,
            speed: this.currentSpeed * 0.7,
            wobble: Math.random() * Math.PI * 2,
            windX: 0
        });
        // Warning
        this.warningText = '魂火！护住它！';
        this.warningTimer = 1;
    },

    _spawnThunderOrb() {
        // Thunder orb targets near umbrella position
        const targetX = this.umbrella.x + (Math.random() - 0.5) * 100;
        this.drops.push({
            type: 'thunder',
            x: Math.max(20, Math.min(this.canvas.width - 20, targetX)),
            y: -20,
            speed: this.currentSpeed * 0.85,
            glowTimer: 0,
            windX: 0
        });
        // Warning
        this.warningText = '⚡ 雷珠！躲开！';
        this.warningTimer = 1.2;
        // Flash warning
        this.flashEffect = 0.3;
    },

    _triggerWindGust() {
        const windDir = Math.random() < 0.5 ? -1 : 1;
        const windStr = 1 + Math.random() * 2;
        for (const drop of this.drops) {
            drop.windX = windDir * windStr * (0.5 + Math.random() * 0.5);
        }
        this.warningText = windDir > 0 ? '大风！→' : '← 大风！';
        this.warningTimer = 0.8;
        // Wind fades
        setTimeout(() => {
            for (const drop of this.drops) {
                drop.windX = 0;
            }
        }, 1500);
    },

    _endGame() {
        this.isOver = true;
        this.isRunning = false;

        // Big tear condition: caught > 50%
        const neededTears = Math.ceil(this.spawnedTears / 2);
        this.won = (this.caughtTears >= neededTears) && !this.umbrella.broken && (this.spawnedTears > 0);

        // Hide HUD
        document.getElementById('game-hud').classList.add('hidden');
        AudioManager.stopRain();

        if (this.won) {
            AudioManager.playVictory();
        } else {
            AudioManager.playDefeat();
        }
    },

    _updateHUD() {
        const timeLeft = Math.max(0, Math.ceil(this.config.duration - this.gameTime));

        // Tear Counter
        document.getElementById('tear-text').textContent = `${this.caughtTears} / ${this.spawnedTears}`;
        
        // Bonus Points
        document.getElementById('bonus-text').textContent = this.bonusPoints;

        // Umbrella durability
        const durFill = document.getElementById('umbrella-bar-fill');
        const durPercent = (this.umbrella.durability / this.umbrella.maxDurability) * 100;
        durFill.style.width = `${durPercent}%`;
        if (durPercent <= 20) {
            durFill.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
        }

        // Timer
        const timerEl = document.getElementById('timer');
        timerEl.textContent = timeLeft;
        timerEl.className = timeLeft <= 5 ? 'danger' : timeLeft <= 15 ? 'warning' : '';
    },

    handleClick(mx, my) {
        // No click needed, mouse controls umbrella
        return null;
    },

    handleMove(mx, my) {
        this.mouseX = mx;
        this.mouseY = my;
    },

    getResult() {
        const neededTears = Math.ceil(this.spawnedTears / 2);
        return {
            won: this.won,
            caughtTears: this.caughtTears,
            spawnedTears: this.spawnedTears,
            bonusPoints: this.bonusPoints,
            totalDrops: this.totalDrops,
            umbrellaBroken: this.umbrella.broken
        };
    },

    cleanup() {
        document.getElementById('game-hud').classList.add('hidden');
        AudioManager.stopRain();
    }
};
