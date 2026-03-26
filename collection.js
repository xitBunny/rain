/* ========================================
   collection.js — 妖怪收集册（图鉴系统）
   ======================================== */

const CollectionSystem = {
    data: {},
    isOpen: false,
    currentPage: 0,
    portraitCanvases: {},

    // All yokai IDs in order
    yokaiList: ['rainWoman', 'lanternCat', 'bookSpirit', 'trainDog'],

    init() {
        this._loadData();
        this._setupEventListeners();
    },

    _loadData() {
        try {
            const saved = localStorage.getItem('yokai_collection');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load collection data');
        }
    },

    _saveData() {
        try {
            localStorage.setItem('yokai_collection', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save collection data');
        }
    },

    collectYokai(yokaiId) {
        if (!this.data[yokaiId]) {
            this.data[yokaiId] = {};
        }
        this.data[yokaiId].collected = true;
        this.data[yokaiId].collectedAt = Date.now();
        this._saveData();
    },

    recordFailure(yokaiId) {
        if (!this.data[yokaiId]) {
            this.data[yokaiId] = {};
        }
        this.data[yokaiId].failed = true;
        this.data[yokaiId].failedAt = Date.now();
        this._saveData();
    },

    isCollected(yokaiId) {
        return this.data[yokaiId] && this.data[yokaiId].collected;
    },

    hasFailed(yokaiId) {
        return this.data[yokaiId] && this.data[yokaiId].failed && !this.data[yokaiId].collected;
    },

    open() {
        this.isOpen = true;
        this.currentPage = 0;
        this._render();
        document.getElementById('ui-overlay').classList.remove('hidden');
        document.getElementById('collection-overlay').classList.remove('hidden');
        AudioManager.playPageTurn();
    },

    close() {
        this.isOpen = false;
        document.getElementById('collection-overlay').classList.add('hidden');
        AudioManager.playPageTurn();
    },

    _render() {
        const container = document.getElementById('collection-pages');
        container.innerHTML = '';

        const yokaiId = this.yokaiList[this.currentPage];
        if (!yokaiId) return;

        const yokaiInfo = YokaiData[yokaiId];
        if (!yokaiInfo) return;

        const entry = document.createElement('div');
        entry.className = 'yokai-entry';

        const isCollected = this.isCollected(yokaiId);
        const hasFailed = this.hasFailed(yokaiId);

        if (!isCollected && !hasFailed) {
            entry.classList.add('locked');
        }

        // Header
        const header = document.createElement('div');
        header.className = 'yokai-entry-header';

        // Portrait canvas
        const portraitCanvas = document.createElement('canvas');
        portraitCanvas.width = 64;
        portraitCanvas.height = 72;
        portraitCanvas.className = 'yokai-portrait';
        const pCtx = portraitCanvas.getContext('2d');

        if (isCollected) {
            // Draw actual portrait
            pCtx.fillStyle = '#1a1a3e';
            pCtx.fillRect(0, 0, 64, 72);
            const drawFunc = getYokaiDrawFunc(yokaiId);
            drawFunc(pCtx, 2, 2, 3, 0);
        } else {
            // Draw silhouette
            pCtx.fillStyle = '#2a2a3a';
            pCtx.fillRect(0, 0, 64, 72);
            pCtx.fillStyle = '#1a1a2a';
            // Simple silhouette
            pCtx.fillRect(16, 4, 32, 12);
            pCtx.fillRect(12, 16, 40, 20);
            pCtx.fillRect(8, 36, 48, 32);
            // Question mark
            pCtx.fillStyle = '#444';
            pCtx.font = '24px monospace';
            pCtx.textAlign = 'center';
            pCtx.fillText('?', 32, 50);
        }

        header.appendChild(portraitCanvas);

        // Info
        const info = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'yokai-name';
        name.textContent = isCollected ? yokaiInfo.name : '???';
        info.appendChild(name);

        if (isCollected) {
            const subtitle = document.createElement('div');
            subtitle.className = 'yokai-subtitle';
            subtitle.textContent = `${yokaiInfo.nameJP} · ${yokaiInfo.scene}`;
            info.appendChild(subtitle);

            const token = document.createElement('div');
            token.className = 'yokai-token';
            token.textContent = `信物：${yokaiInfo.token.name}`;
            info.appendChild(token);
        } else if (hasFailed) {
            const subtitle = document.createElement('div');
            subtitle.className = 'yokai-subtitle';
            subtitle.textContent = yokaiInfo.scene;
            info.appendChild(subtitle);
        } else {
            const subtitle = document.createElement('div');
            subtitle.className = 'yokai-subtitle';
            subtitle.textContent = '尚未邂逅';
            info.appendChild(subtitle);
        }

        header.appendChild(info);
        entry.appendChild(header);

        // Taunt (if failed but not collected)
        if (hasFailed) {
            const taunt = document.createElement('div');
            taunt.className = 'yokai-taunt';
            taunt.textContent = yokaiInfo.taunt;
            entry.appendChild(taunt);
        }

        // Story button (if collected)
        if (isCollected) {
            const storyBtn = document.createElement('button');
            storyBtn.className = 'yokai-story-btn';
            storyBtn.textContent = '阅读故事';
            storyBtn.onclick = () => {
                this._showStory(yokaiId);
            };
            entry.appendChild(storyBtn);

            // Token description
            const tokenDesc = document.createElement('div');
            tokenDesc.style.cssText = 'font-size: 12px; color: #886644; margin-top: 12px; line-height: 1.6; font-style: italic;';
            tokenDesc.textContent = yokaiInfo.token.description;
            entry.appendChild(tokenDesc);
        }

        container.appendChild(entry);

        // Update page nav
        document.getElementById('col-page-num').textContent = `${this.currentPage + 1}/${this.yokaiList.length}`;
    },

    _showStory(yokaiId) {
        const yokaiInfo = YokaiData[yokaiId];
        const storyOverlay = document.getElementById('story-overlay');
        const storyContent = document.getElementById('story-content');
        storyContent.innerHTML = yokaiInfo.story;
        storyOverlay.classList.remove('hidden');

        document.getElementById('story-close').onclick = () => {
            storyOverlay.classList.add('hidden');
            AudioManager.playPageTurn();
        };
    },

    _setupEventListeners() {
        document.getElementById('collection-close').addEventListener('click', () => {
            this.close();
        });

        document.getElementById('col-prev').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this._render();
                AudioManager.playPageTurn();
            }
        });

        document.getElementById('col-next').addEventListener('click', () => {
            if (this.currentPage < this.yokaiList.length - 1) {
                this.currentPage++;
                this._render();
                AudioManager.playPageTurn();
            }
        });
    }
};
