/* ========================================
   result.js — 结算场景
   ======================================== */

const ResultScene = {
    canvas: null,
    ctx: null,
    result: null,
    yokaiData: null,
    phase: 'reveal', // reveal, dialog, done
    revealTimer: 0,
    dialogIndex: 0,
    dialogCharIndex: 0,
    dialogTimer: 0,
    dialogComplete: false,
    particles: Pixel.createParticleSystem(),
    animTimer: 0,
    statsShown: false,
    showStoryButton: false,

    init(canvas, ctx, result) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.result = result;
        this.yokaiData = YokaiData[this.result.yokaiId] || YokaiData.rainWoman;
        this.phase = 'reveal';
        this.revealTimer = 0;
        this.dialogIndex = 0;
        this.dialogCharIndex = 0;
        this.dialogTimer = 0;
        this.dialogComplete = false;
        this.particles.clear();
        this.animTimer = 0;
        this.statsShown = false;
        this.showStoryButton = false;

        document.getElementById('ui-overlay').classList.remove('hidden');
    },

    update(dt) {
        this.animTimer += dt;
        this.particles.update();

        if (this.phase === 'reveal') {
            this.revealTimer += dt;

            // Emit particles
            if (this.result.won) {
                if (Math.random() < 0.1) {
                    this.particles.emit({
                        x: () => Math.random() * this.canvas.width,
                        y: () => this.canvas.height,
                        speedX: () => (Math.random() - 0.5) * 1.5,
                        speedY: () => -2 - Math.random() * 2,
                        life: () => 80 + Math.random() * 60,
                        size: () => 2 + Math.random() * 2,
                        color: () => ['#6ec6ff', '#a8e0ff', '#7cff8a', '#ffe066'][Math.floor(Math.random() * 4)],
                        gravity: -0.01,
                        fadeOut: true
                    });
                }
            } else {
                if (Math.random() < 0.3) {
                    this.particles.emit({
                        x: () => Math.random() * this.canvas.width,
                        y: -5,
                        speedX: () => (Math.random() - 0.5) * 0.5,
                        speedY: () => 2 + Math.random() * 2,
                        life: 60,
                        size: 1,
                        color: 'rgba(110, 198, 255, 0.4)',
                        gravity: 0.02,
                        fadeOut: false
                    });
                }
            }

            if (this.revealTimer > 2) {
                this.phase = 'dialog';
                this._showDialog();
            }
        } else if (this.phase === 'dialog') {
            if (!this.dialogComplete) {
                this.dialogTimer += dt;
                const dialogs = this.result.won ? this.yokaiData.victoryDialogs : this.yokaiData.defeatDialogs;
                const currentDialog = dialogs[this.dialogIndex];
                if (currentDialog && this.dialogTimer > 0.04) {
                    this.dialogTimer = 0;
                    this.dialogCharIndex++;
                    if (this.dialogCharIndex % 2 === 0) AudioManager.playTextTick();
                    if (this.dialogCharIndex >= currentDialog.text.length) {
                        this.dialogComplete = true;
                    }
                    this._updateDialogText();
                }
            }
        }
    },

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Background
        if (this.result.won) {
            // Warmer, calmer sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#1a1a3e');
            skyGrad.addColorStop(0.4, '#2d1b4e');
            skyGrad.addColorStop(0.7, '#5c3d6e');
            skyGrad.addColorStop(1, '#e8834a');
            ctx.fillStyle = skyGrad;
        } else {
            // Darker, sadder sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#0a0a15');
            skyGrad.addColorStop(0.5, '#1a1a2e');
            skyGrad.addColorStop(1, '#1a1520');
            ctx.fillStyle = skyGrad;
        }
        ctx.fillRect(0, 0, w, h);

        // Particles
        this.particles.draw(ctx);

        // Result text
        const revealProgress = Math.min(1, this.revealTimer / 1.5);
        ctx.globalAlpha = Pixel.easeOutCubic(revealProgress);

        if (this.result.won) {
            Pixel.drawText(ctx, '— 结 缘 成 功 —', w / 2, h * 0.12, {
                size: Math.min(28, w * 0.06),
                color: '#ffe066',
                align: 'center',
                shadow: true,
                shadowColor: 'rgba(0,0,0,0.6)'
            });
        } else {
            Pixel.drawText(ctx, '— 缘 未 至 —', w / 2, h * 0.12, {
                size: Math.min(28, w * 0.06),
                color: '#6ec6ff',
                align: 'center',
                shadow: true,
                shadowColor: 'rgba(0,0,0,0.6)'
            });
        }

        // Stats
        if (revealProgress > 0.5 && !this.statsShown) {
            this.statsShown = true;
        }

        if (this.statsShown) {
            const statsAlpha = Math.min(1, (revealProgress - 0.5) * 3);
            ctx.globalAlpha = statsAlpha;

            const statsY = h * 0.22;
            const rate = Math.round(this.result.protectionRate * 100);

            Pixel.drawText(ctx, `保护率：${rate}%`, w / 2, statsY, {
                size: 14,
                color: rate >= 75 ? '#2ed573' : '#ff4757',
                align: 'center'
            });

            Pixel.drawText(ctx, `接住：${this.result.caughtDrops}  漏掉：${this.result.missedDrops}`, w / 2, statsY + 24, {
                size: 11,
                color: '#aaa',
                align: 'center'
            });

            if (this.result.umbrellaBroken) {
                Pixel.drawText(ctx, '☂ 伞已损坏', w / 2, statsY + 46, {
                    size: 11,
                    color: '#ff4757',
                    align: 'center'
                });
            }
        }

        ctx.globalAlpha = 1;

        // Yokai portrait in center
        if (revealProgress > 0.3) {
            const portraitAlpha = Math.min(1, (revealProgress - 0.3) * 2);
            ctx.globalAlpha = portraitAlpha;

            const portraitScale = Math.max(3, Math.floor(w / 150));
            const portraitW = 16 * portraitScale;
            const portraitH = 18 * portraitScale;
            const portraitX = w / 2 - portraitW / 2;
            const portraitY = h * 0.35;

            // Glow behind
            if (this.result.won) {
                const glow = ctx.createRadialGradient(
                    w / 2, portraitY + portraitH / 2, 5,
                    w / 2, portraitY + portraitH / 2, 80
                );
                glow.addColorStop(0, 'rgba(110, 198, 255, 0.2)');
                glow.addColorStop(1, 'rgba(110, 198, 255, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(portraitX - 50, portraitY - 50, portraitW + 100, portraitH + 100);
            }

            const portraitFn = this.yokaiData.drawYokai;
            if (typeof ExploreScene[portraitFn] === 'function') {
                ExploreScene[portraitFn](ctx, w / 2, portraitY + portraitH / 2, portraitAlpha);
            } else {
                // Fallback
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(portraitX, portraitY, portraitW, portraitH);
            }
            ctx.globalAlpha = 1;

            // Name below portrait
            Pixel.drawText(ctx, this.yokaiData.name, w / 2, portraitY + portraitH + 10, {
                size: 16,
                color: '#e0e0e0',
                align: 'center'
            });
            Pixel.drawText(ctx, this.yokaiData.nameJP, w / 2, portraitY + portraitH + 30, {
                size: 10,
                color: 'rgba(168, 224, 255, 0.6)',
                align: 'center'
            });
        }

        // Bottom buttons (after dialog is done)
        if (this.phase === 'done') {
            // Show buttons
            if (this.result.won) {
                this._drawButton(ctx, '阅读故事', w / 2, h * 0.82, 160, 38, '#e8834a');
                this._drawButton(ctx, '返回', w / 2, h * 0.90, 120, 34, '#555');
            } else {
                this._drawButton(ctx, '再次挑战', w / 2, h * 0.82, 160, 38, '#d4587a');
                this._drawButton(ctx, '返回', w / 2, h * 0.90, 120, 34, '#555');
            }
        }
    },

    _drawButton(ctx, text, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        Pixel.drawText(ctx, text, x, y - 8, {
            size: 14,
            color: '#fff',
            align: 'center',
            shadow: false
        });
    },

    _showDialog() {
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        this.dialogCharIndex = 0;
        this.dialogComplete = false;
        this.dialogTimer = 0;
        this._updateDialogText();
    },

    _updateDialogText() {
        const dialogs = this.result.won ? this.yokaiData.victoryDialogs : this.yokaiData.defeatDialogs;
        const dialog = dialogs[this.dialogIndex];
        if (!dialog) return;

        document.getElementById('dialog-speaker').textContent = dialog.speaker;
        document.getElementById('dialog-text').textContent = dialog.text.substring(0, this.dialogCharIndex);
    },

    _hideDialog() {
        document.getElementById('dialog-box').classList.add('hidden');
    },

    handleClick(mx, my) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.phase === 'reveal') {
            this.revealTimer = 3;
            return null;
        }

        if (this.phase === 'dialog') {
            const dialogs = this.result.won ? this.yokaiData.victoryDialogs : this.yokaiData.defeatDialogs;
            if (!this.dialogComplete) {
                const dialog = dialogs[this.dialogIndex];
                this.dialogCharIndex = dialog.text.length;
                this.dialogComplete = true;
                this._updateDialogText();
            } else {
                this.dialogIndex++;
                if (this.dialogIndex >= dialogs.length) {
                    this._hideDialog();
                    this.phase = 'done';

                    // Save to collection
                    if (this.result.won) {
                        CollectionSystem.collectYokai(this.result.yokaiId);
                    } else {
                        CollectionSystem.recordFailure(this.result.yokaiId);
                    }
                    return null;
                }
                this.dialogCharIndex = 0;
                this.dialogComplete = false;
                this.dialogTimer = 0;
                AudioManager.playSelect();
                this._updateDialogText();
            }
            return null;
        }

        if (this.phase === 'done') {
            // Check button clicks
            if (this.result.won) {
                // "阅读故事" button
                if (mx >= w / 2 - 80 && mx <= w / 2 + 80 &&
                    my >= h * 0.82 - 19 && my <= h * 0.82 + 19) {
                    AudioManager.playConfirm();
                    this._showStory();
                    return null;
                }
                // "返回" button
                if (mx >= w / 2 - 60 && mx <= w / 2 + 60 &&
                    my >= h * 0.90 - 17 && my <= h * 0.90 + 17) {
                    AudioManager.playConfirm();
                    return 'menu';
                }
            } else {
                // "再次挑战" button
                if (mx >= w / 2 - 80 && mx <= w / 2 + 80 &&
                    my >= h * 0.82 - 19 && my <= h * 0.82 + 19) {
                    AudioManager.playConfirm();
                    return 'retry';
                }
                // "返回" button
                if (mx >= w / 2 - 60 && mx <= w / 2 + 60 &&
                    my >= h * 0.90 - 17 && my <= h * 0.90 + 17) {
                    AudioManager.playConfirm();
                    return 'menu';
                }
            }
        }

        return null;
    },

    _showStory() {
        const storyOverlay = document.getElementById('story-overlay');
        const storyContent = document.getElementById('story-content');
        
        let html = '';
        this.yokaiData.story.forEach(p => {
            if (p.startsWith('【')) {
                html += `<h3>${p}</h3>`;
            } else if (p.startsWith('『')) {
                html += `<div class="story-divider">♦</div><p style="color:var(--paper-cream);text-align:center;">${p}</p>`;
            } else {
                html += `<p>${p}</p>`;
            }
        });
        
        html += `<div class="story-token">${this.yokaiData.item.icon} ${this.yokaiData.item.name}：<br>${this.yokaiData.item.desc}</div>`;
        
        storyContent.innerHTML = html;
        storyOverlay.classList.remove('hidden');

        document.getElementById('story-close').onclick = () => {
            storyOverlay.classList.add('hidden');
            AudioManager.playPageTurn();
        };
    },

        // Could add button hover effects
    },

    handleKeyDown(key) {
        if (key === ' ') {
            return this.handleClick(this.canvas.width / 2, this.canvas.height / 2);
        }
        return null;
    },

    cleanup() {
        this._hideDialog();
        document.getElementById('story-overlay').classList.add('hidden');
        document.getElementById('ui-overlay').classList.add('hidden');
    }
};
