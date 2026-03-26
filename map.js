/* ========================================
   map.js — 地图系统
   ======================================== */

const StageOrder = ['busStop', 'alley', 'bookshop', 'train'];
const StageNames = {
    'busStop': '黄昏站台',
    'alley': '影之夜市',
    'bookshop': '忘忧书屋',
    'train': '午夜铁道'
};

const MapSystem = {
    overlay: null,
    canvas: null,
    ctx: null,
    isOpen: false,

    init() {
        this.overlay = document.getElementById('map-overlay');
        this.canvas = document.getElementById('map-canvas');
        this.ctx = this.canvas.getContext('2d');

        document.getElementById('map-close').addEventListener('click', () => {
            this.close();
        });
        document.getElementById('map-toggle').addEventListener('click', () => {
            if (this.isOpen) return;
            this.open();
        });

        // Click on canvas to travel
        this.canvas.addEventListener('click', (e) => {
            if (!this.isOpen) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.handleClick(x, y);
        });
    },

    open() {
        if (!this.overlay || this.isOpen) return;
        this.isOpen = true;
        this.overlay.classList.remove('hidden');
        AudioManager.playPageTurn();
        this.drawMap();
    },

    close() {
        if (!this.overlay || !this.isOpen) return;
        this.isOpen = false;
        this.overlay.classList.add('hidden');
        AudioManager.playSelect();
    },

    drawMap() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        this.ctx.clearRect(0, 0, cw, ch);

        // Draw path line
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(100, 200);
        this.ctx.lineTo(233, 100);
        this.ctx.lineTo(366, 300);
        this.ctx.lineTo(500, 200);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        const points = [
            { x: 100, y: 200, id: 'busStop' },
            { x: 233, y: 100, id: 'alley' },
            { x: 366, y: 300, id: 'bookshop' },
            { x: 500, y: 200, id: 'train' }
        ];

        const obtainedCount = CollectionSystem.data.length;
        // The player is currently at obtainedCount index
        const currentIndex = Math.min(obtainedCount, StageOrder.length - 1);

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const isCompleted = i < obtainedCount;
            const isCurrent = i === currentIndex;
            const isUnknown = i > currentIndex;

            // Draw Node
            this.ctx.fillStyle = isCurrent ? '#2ed573' : (isCompleted ? '#f0932b' : '#333');
            this.ctx.strokeStyle = isCurrent ? '#fff' : '#000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw Node Text / Icon
            this.ctx.fillStyle = isUnknown ? '#666' : '#fff';
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            let iconText = '';
            if (isUnknown) iconText = '?';
            else if (isCurrent) iconText = '!';
            else iconText = '★';
            
            this.ctx.fillText(iconText, p.x, p.y);

            // Draw Name Below
            this.ctx.fillStyle = '#ccc';
            this.ctx.font = '14px zpix, monospace';
            this.ctx.fillText(StageNames[p.id], p.x, p.y + 35);
        }
    },

    handleClick(mx, my) {
        const points = [
            { x: 100, y: 200, id: 'busStop' },
            { x: 233, y: 100, id: 'alley' },
            { x: 366, y: 300, id: 'bookshop' },
            { x: 500, y: 200, id: 'train' }
        ];

        const obtainedCount = Object.keys(CollectionSystem.data).length;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const dist = Math.sqrt((mx - p.x)**2 + (my - p.y)**2);
            if (dist < 25) {
                // If unlocked or current
                if (i <= obtainedCount) {
                    ExploreScene.currentStage = i;
                    AudioManager.playSelect();
                    this.close();
                    // Force refresh explore scene
                    if (window.app && window.app.state === 'EXPLORE') {
                        ExploreScene.init(window.app.canvas, window.app.ctx);
                    }
                } else {
                    AudioManager.playMiss();
                }
                break;
            }
        }
    }
};

window.MapSystem = MapSystem;
