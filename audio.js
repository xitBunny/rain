/* ========================================
   audio.js — Web Audio API 像素风音效
   ======================================== */

const AudioManager = {
    ctx: null,
    masterVolume: 0.3,
    initialized: false,
    bgmEnabled: false,
    bgmOscillators: [],
    
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Play a beep/tone
    playTone(freq, duration = 0.1, type = 'square', volume = 0.3) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Rain drop catch sound
    playCatch() {
        this.playTone(800, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(1200, 0.06, 'square', 0.15), 50);
    },

    // Tear drop catch (special)
    playTearCatch() {
        this.playTone(600, 0.15, 'sine', 0.3);
        setTimeout(() => this.playTone(900, 0.15, 'sine', 0.25), 100);
        setTimeout(() => this.playTone(1200, 0.2, 'sine', 0.2), 200);
    },

    // Thunder hit
    playThunder() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        source.start();
    },

    // Rain miss sound
    playMiss() {
        this.playTone(200, 0.15, 'sawtooth', 0.2);
    },

    // Victory jingle
    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square', 0.25), i * 150);
        });
    },

    // Defeat sound
    playDefeat() {
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.2), i * 200);
        });
    },

    // Menu select
    playSelect() {
        this.playTone(660, 0.05, 'square', 0.15);
    },

    // Menu confirm
    playConfirm() {
        this.playTone(880, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(1100, 0.1, 'square', 0.15), 60);
    },

    // Dialog text tick
    playTextTick() {
        this.playTone(440 + Math.random() * 100, 0.02, 'square', 0.05);
    },

    // Page turn
    playPageTurn() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1 * Math.sin(i / 50) * Math.exp(-i / (bufferSize * 0.3));
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.3 * this.masterVolume, this.ctx.currentTime);
        source.start();
    },

    // Ambient rain (looping noise)
    rainNode: null,
    rainGain: null,

    startRain() {
        if (!this.ctx || this.rainNode) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate rain noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }

        this.rainNode = this.ctx.createBufferSource();
        this.rainGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        this.rainNode.buffer = buffer;
        this.rainNode.loop = true;
        this.rainNode.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(this.ctx.destination);
        this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.rainGain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, this.ctx.currentTime + 1);
        this.rainNode.start();
    },

    stopRain() {
        if (this.rainGain) {
            this.rainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
            setTimeout(() => {
                if (this.rainNode) {
                    this.rainNode.stop();
                    this.rainNode = null;
                    this.rainGain = null;
                }
            }, 600);
        }
    },
    // ==========================================
    // Generative BGM System
    // ==========================================
    bgmNode: null,
    bgmGain: null,
    bgmIntervals: [],

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) {
            this.stopBGM();
        }
        return this.bgmEnabled;
    },

    stopBGM() {
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.bgmOscillators = [];
        
        this.bgmIntervals.forEach(clearInterval);
        this.bgmIntervals = [];

        if (this.bgmGain) {
            this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        }
        
        this.stopRain();
    },

    startBGM(stageId) {
        if (!this.bgmEnabled || !this.ctx) return;
        this.stopBGM(); // ensure clean state

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
        this.bgmGain.gain.setValueAtTime(0.15 * this.masterVolume, this.ctx.currentTime);

        const playMelody = (notes, speed = 400, type = 'sine', octave = 1) => {
            let i = 0;
            const interval = setInterval(() => {
                const note = notes[i % notes.length];
                if (note > 0) {
                    this.playTone(note * octave, speed / 1000 * 0.8, type, 0.1);
                }
                i++;
            }, speed);
            this.bgmIntervals.push(interval);
        };

        if (stageId === 'busStop') {
            // 雨女：忧伤、缓慢的雨夜旋律
            this.startRain(); // mix with rain noise
            // A minor pentatonic slow melody
            const melody = [440, 0, 523, 0, 659, 0, 440, 0, 329, 0, 0, 0];
            playMelody(melody, 800, 'sine', 0.5);
            
        } else if (stageId === 'alley') {
            // 提灯猫又：轻快、夜市感
            const melody = [523, 659, 783, 659, 523, 0, 523, 587, 659, 587, 523, 0];
            playMelody(melody, 300, 'square', 1);
            
        } else if (stageId === 'bookshop') {
            // 纸鱼书灵：安静、空灵
            const melody = [523, 0, 0, 783, 0, 0, 1046, 0, 0, 783, 0, 0];
            playMelody(melody, 600, 'triangle', 1.5);
            playMelody([261, 0, 392, 0, 329, 0, 392, 0], 1200, 'sine', 0.5);

        } else if (stageId === 'train') {
            // 踏切犬：节奏感、急促
            // Bass line heartbeat
            playMelody([110, 0, 110, 0, 0, 0, 0, 0], 200, 'sawtooth', 0.5);
            // High pitch urgency
            playMelody([880, 0, 880, 0, 880, 0, 0, 0], 400, 'square', 1);
        }
    }
};
