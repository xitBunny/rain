/* ========================================
   encounter.js (Generic Encounter Scene)
   ======================================== */

const EncounterScene = {
    canvas: null,
    ctx: null,
    dialogIndex: 0,
    dialogCharIndex: 0,
    dialogTimer: 0,
    dialogComplete: false,
    phase: 'intro', // intro, dialog, ready
    introTimer: 0,
    yokaiId: 'rainWoman',
    yokaiData: null,

    init(canvas, ctx, yokaiId) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.yokaiId = yokaiId || 'rainWoman';
        this.yokaiData = YokaiData[this.yokaiId];
        
        this.dialogIndex = 0;
        this.dialogCharIndex = 0;
        this.dialogTimer = 0;
        this.dialogComplete = false;
        this.phase = 'intro';
        this.introTimer = 0;

        document.getElementById('ui-overlay').classList.remove('hidden');
    },

    update(dt) {
        if (this.phase === 'intro') {
            this.introTimer += dt;
            if (this.introTimer > 1) {
                this.phase = 'dialog';
                this._showDialog();
            }
        } else if (this.phase === 'dialog') {
            if (!this.dialogComplete) {
                this.dialogTimer += dt;
                const dialogText = this.yokaiData.dialogue[this.dialogIndex];
                if (dialogText && this.dialogTimer > 0.04) {
                    this.dialogTimer = 0;
                    this.dialogCharIndex++;
                    if (this.dialogCharIndex % 2 === 0) AudioManager.playTextTick();
                    if (this.dialogCharIndex >= dialogText.length) {
                        this.dialogComplete = true;
                    }
                    this._updateDialogText(dialogText);
                }
            }
        }
    },

    draw() {
        // Just draw the ExploreScene as background
        ExploreScene.draw();

        // Darken screen slightly for dialogue focus
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    _showDialog() {
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        document.getElementById('dialog-speaker').textContent = this.yokaiData.name;
        this.dialogCharIndex = 0;
        this.dialogComplete = false;
        this.dialogTimer = 0;
        this._updateDialogText(this.yokaiData.dialogue[this.dialogIndex]);
    },

    _updateDialogText(text) {
        document.getElementById('dialog-text').textContent = text.substring(0, this.dialogCharIndex);
    },

    handleClick(mx, my) {
        if (this.phase === 'dialog') {
            const dialogText = this.yokaiData.dialogue[this.dialogIndex];
            if (!this.dialogComplete) {
                this.dialogCharIndex = dialogText.length;
                this.dialogComplete = true;
                this._updateDialogText(dialogText);
            } else {
                this.dialogIndex++;
                if (this.dialogIndex >= this.yokaiData.dialogue.length) {
                    document.getElementById('dialog-box').classList.add('hidden');
                    return 'startGame';
                }
                this.dialogCharIndex = 0;
                this.dialogComplete = false;
                this.dialogTimer = 0;
                AudioManager.playSelect();
                this._updateDialogText(this.yokaiData.dialogue[this.dialogIndex]);
            }
        }
        return null;
    },

    handleKeyDown(key) {
        if (key === ' ') {
            // Treat space as a click in the center
            return this.handleClick(this.canvas.width / 2, this.canvas.height / 2);
        }
        return null;
    }
};

window.EncounterScene = EncounterScene;
