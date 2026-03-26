/* ========================================
   main.js — 游戏主循环 & 场景管理
   流程: MENU → GENDER_SELECT → EXPLORE → ENCOUNTER → MINIGAME → RESULT
   ======================================== */

const Game = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    state: 'MENU',
    lastTime: 0,
    running: false,
    cursorX: 0,
    cursorY: 0,
    customCursorVisible: false,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Input listeners
        this.canvas.addEventListener('click', (e) => this._handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this._handleMove(e));

        // Right-click hold to walk (desktop)
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right mouse button
                e.preventDefault();
                const { x, y } = this._getCanvasCoords(e);
                this._handleHoldStart(x, y);
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this._handleHoldEnd();
            }
        });
        // Also support left-click hold in explore
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.state === 'EXPLORE') {
                const { x, y } = this._getCanvasCoords(e);
                this._handleHoldStart(x, y);
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0 && this.state === 'EXPLORE') {
                this._handleHoldEnd();
            }
        });

        // Touch to walk (mobile) — hold = walk, tap = click
        this._touchStartTime = 0;
        this._touchMoved = false;
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            AudioManager.init();
            AudioManager.resume();
            this._touchStartTime = Date.now();
            this._touchMoved = false;
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const { x, y } = this._getCanvasCoords({ clientX: touch.clientX, clientY: touch.clientY });
                this._handleHoldStart(x, y);
                this._handleMove({ clientX: touch.clientX, clientY: touch.clientY });
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this._touchMoved = true;
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this._handleMove({ clientX: touch.clientX, clientY: touch.clientY });
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this._handleHoldEnd();
            // If it was a short tap (not a drag), treat as click
            const duration = Date.now() - this._touchStartTime;
            if (duration < 300 && !this._touchMoved) {
                this._handleClick({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
            }
        }, { passive: false });

        // Keyboard controls (A/D movement + Space for dialog)
        document.addEventListener('keydown', (e) => {
            if (this.state === 'EXPLORE') {
                ExploreScene.handleKeyDown(e.key);
                // Space to skip encounter anim
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    const action = ExploreScene.handleClick(0, 0);
                    if (action === 'encounter') {
                        this._switchState('ENCOUNTER');
                    }
                }
            } else if (this.state === 'ENCOUNTER') {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    const action = EncounterScene.handleClick(0, 0);
                    if (action === 'startGame') {
                        this._switchState('MINIGAME');
                    }
                }
            } else if (this.state === 'MENU') {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this._switchState('GENDER_SELECT');
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            if (this.state === 'EXPLORE') {
                ExploreScene.handleKeyUp(e.key);
            }
        });

        // Init collection system
        CollectionSystem.init();

        // Init Map system
        if (window.MapSystem) MapSystem.init();

        // Init BGM toggle
        const bgmToggle = document.getElementById('bgm-toggle');
        bgmToggle.addEventListener('click', () => {
            AudioManager.init();
            const isEnabled = AudioManager.toggleBGM();
            bgmToggle.textContent = `🎵音效: ${isEnabled ? '开' : '关'}`;
            bgmToggle.classList.toggle('active', isEnabled);
            
            if (isEnabled && this.state === 'EXPLORE') {
                const stageId = StageOrder[ExploreScene.currentStage] || 'busStop';
                AudioManager.startBGM(stageId);
            }
        });

        // Init Character Switch toggle
        const charSwitchToggle = document.getElementById('char-switch-toggle');
        charSwitchToggle.addEventListener('click', () => {
            window.gameData.gender = window.gameData.gender === 'boy' ? 'girl' : 'boy';
            if (this.state === 'EXPLORE' && ExploreScene.player) {
                ExploreScene.player.gender = window.gameData.gender;
            }
        });

        // Start
        this._switchState('MENU');
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this._loop(t));
    },

    _resize() {
        const containerW = window.innerWidth;
        const containerH = window.innerHeight;
        const aspect = 4 / 3;

        let w, h;
        if (containerW / containerH > aspect) {
            h = containerH;
            w = h * aspect;
        } else {
            w = containerW;
            h = w / aspect;
        }

        this.width = Math.floor(w * 0.9);
        this.height = Math.floor(h * 0.9);

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;

        this.ctx.imageSmoothingEnabled = false;
    },

    _getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    _handleClick(e) {
        AudioManager.init();
        AudioManager.resume();

        const { x, y } = this._getCanvasCoords(e);
        let action = null;

        switch (this.state) {
            case 'MENU':
                action = MenuScene.handleClick(x, y);
                if (action === 'start') {
                    this._switchState('GENDER_SELECT');
                } else if (action === 'collection') {
                    CollectionSystem.open();
                }
                break;

            case 'GENDER_SELECT':
                action = GenderSelectScene.handleClick(x, y);
                if (action === 'boy' || action === 'girl') {
                    Player.setGender(action);
                    this._switchState('EXPLORE');
                }
                break;

            case 'EXPLORE':
                action = ExploreScene.handleClick(x, y);
                if (action === 'encounter') {
                    this._switchState('ENCOUNTER');
                }
                break;

            case 'ENCOUNTER':
                action = EncounterScene.handleClick(x, y);
                if (action === 'startGame') {
                    this._switchState('MINIGAME');
                }
                break;

            case 'MINIGAME':
                action = this._getMinigame().handleClick(x, y);
                break;

            case 'RESULT':
                action = ResultScene.handleClick(x, y);
                if (action === 'menu') {
                    this._switchState('MENU');
                } else if (action === 'retry') {
                    this._switchState('ENCOUNTER');
                }
                break;
        }
    },

    _handleMove(e) {
        const { x, y } = this._getCanvasCoords(e);
        this.cursorX = x;
        this.cursorY = y;

        switch (this.state) {
            case 'MENU': MenuScene.handleMove(x, y); break;
            case 'GENDER_SELECT': GenderSelectScene.handleMove(x, y); break;
            case 'EXPLORE': ExploreScene.handleMove(x, y); break;
            case 'ENCOUNTER': EncounterScene.handleMove(x, y); break;
            case 'MINIGAME': this._getMinigame().handleMove(x, y); break;
            case 'RESULT': ResultScene.handleMove(x, y); break;
        }
    },

    _handleHoldStart(x, y) {
        if (this.state === 'EXPLORE') {
            ExploreScene.handleHoldStart(x, y);
        }
    },

    _handleHoldEnd() {
        if (this.state === 'EXPLORE') {
            ExploreScene.handleHoldEnd();
        }
    },


    _getMinigame() {
        if (!window.ExploreScene) return window.RainGameScene;
        const stageId = StageOrder[ExploreScene.currentStage] || 'busStop';
        if (stageId === 'alley') return window.LanternGameScene;
        if (stageId === 'bookshop') return window.BookGameScene;
        if (stageId === 'train') return window.TrainGameScene;
        return window.RainGameScene;
    },

    _switchState(newState) {
        // Cleanup old state
        switch (this.state) {
            case 'EXPLORE': ExploreScene.cleanup(); break;
            case 'ENCOUNTER': EncounterScene.cleanup(); break;
            case 'MINIGAME': this._getMinigame().cleanup(); break;
            case 'RESULT': ResultScene.cleanup(); break;
        }

        this.state = newState;

        const stageId = StageOrder[ExploreScene.currentStage] || 'busStop';

        switch (newState) {
            case 'MENU':
                document.getElementById('top-right-controls').classList.add('hidden');
                document.getElementById('dialog-box').classList.add('hidden');
                MenuScene.init(this.canvas, this.ctx);
                AudioManager.startBGM('menu');
                break;
            case 'GENDER_SELECT':
                GenderSelectScene.init(this.canvas, this.ctx);
                break;
            case 'EXPLORE':
                document.getElementById('top-right-controls').classList.remove('hidden');
                ExploreScene.init(this.canvas, this.ctx);
                if (AudioManager.bgmEnabled) AudioManager.startBGM(stageId);
                break;
            case 'ENCOUNTER':
                let yokaiId = 'rainWoman';
                if (stageId === 'alley') yokaiId = 'lanternCat';
                else if (stageId === 'bookshop') yokaiId = 'bookSpirit';
                else if (stageId === 'train') yokaiId = 'trainDog';
                EncounterScene.init(this.canvas, this.ctx, yokaiId);
                break;
            case 'MINIGAME':
                if (stageId === 'alley') LanternGameScene.init(this.canvas, this.ctx);
                else if (stageId === 'bookshop') BookGameScene.init(this.canvas, this.ctx);
                else if (stageId === 'train') TrainGameScene.init(this.canvas, this.ctx);
                else RainGameScene.init(this.canvas, this.ctx);
                break;
            case 'RESULT':
                let result = {};
                if (stageId === 'alley') result = LanternGameScene.getResult();
                else if (stageId === 'bookshop') result = BookGameScene.getResult();
                else if (stageId === 'train') result = TrainGameScene.getResult();
                else result = RainGameScene.getResult();
                
                result.yokaiId = stageId === 'alley' ? 'lanternCat' : 
                                 stageId === 'bookshop' ? 'bookSpirit' : 
                                 stageId === 'train' ? 'trainDog' : 'rainWoman';
                ResultScene.init(this.canvas, this.ctx, result);
                break;
        }
    },

    _loop(timestamp) {
        if (!this.running) return;

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        // Update
        switch (this.state) {
            case 'MENU': MenuScene.update(dt); break;
            case 'GENDER_SELECT': GenderSelectScene.update(dt); break;
            case 'EXPLORE': ExploreScene.update(dt); break;
            case 'ENCOUNTER': EncounterScene.update(dt); break;
            case 'MINIGAME': 
                const mg = this._getMinigame();
                mg.update(dt);
                if (mg.isOver) {
                    this._switchState('RESULT');
                }
                break;
            case 'RESULT': ResultScene.update(dt); break;
        }

        // ====== DRAW ======
        this.ctx.fillRect(0, 0, this.width, this.height);

        switch (this.state) {
            case 'MENU': MenuScene.draw(); break;
            case 'GENDER_SELECT': GenderSelectScene.draw(); break;
            case 'EXPLORE': ExploreScene.draw(); break;
            case 'ENCOUNTER': EncounterScene.draw(); break;
            case 'MINIGAME': this._getMinigame().draw(); break;
            case 'RESULT': ResultScene.draw(); break;
        }

        // Custom cursor
        this._drawCursor();

        requestAnimationFrame((t) => this._loop(t));
    },

    _drawCursor() {
        const ctx = this.ctx;
        const x = Math.floor(this.cursorX);
        const y = Math.floor(this.cursorY);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y); ctx.lineTo(x - 2, y);
        ctx.moveTo(x + 2, y); ctx.lineTo(x + 6, y);
        ctx.moveTo(x, y - 6); ctx.lineTo(x, y - 2);
        ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 6);
        ctx.stroke();
        ctx.restore();
    }
};

window.addEventListener('load', () => {
    Game.init();
});
