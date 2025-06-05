class PianoGame {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.3;
        this.gainNode.connect(this.audioContext.destination);
        
        // Mapeamento das teclas do teclado para as notas
        this.keyMap = {
            'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B', 'k': 'C', 'l': 'D',
            'w': 'C#', 'e': 'D#', 'r': 'F#', 't': 'G#', 'y': 'A#', 'u': 'C#'
        };
        
        this.octaves = [4, 5];
        
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.notification = document.getElementById('gameNotification');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createPiano();
    }

    setupEventListeners() {
        // Adiciona suporte para teclado
        document.addEventListener('keydown', (e) => {
            const note = this.keyMap[e.key.toLowerCase()];
            if (note) {
                this.playNote(note + this.octaves[0]);
                const key = document.querySelector(`[data-key="${e.key.toLowerCase()}"]`);
                if (key) {
                    key.classList.add('active');
                    setTimeout(() => key.classList.remove('active'), 200);
                }
            }
        });
    }

    createPiano() {
        const pianoContainer = document.getElementById('pianoContainer');
        pianoContainer.innerHTML = '';

        // Cria as teclas do piano na ordem correta
        const keyOrder = ['a', 'w', 's', 'e', 'd', 'f', 'r', 'g', 't', 'h', 'y', 'j', 'u', 'k', 'l'];
        
        keyOrder.forEach(key => {
            const note = this.keyMap[key];
            const keyElement = document.createElement('div');
            keyElement.className = 'piano-key';
            if (note.includes('#')) {
                keyElement.className += ' black';
            }
            keyElement.textContent = note;
            keyElement.dataset.note = note;
            keyElement.dataset.key = key;

            keyElement.addEventListener('mousedown', () => {
                this.playNote(note + this.octaves[0]);
                keyElement.classList.add('active');
            });

            keyElement.addEventListener('mouseup', () => {
                keyElement.classList.remove('active');
            });

            keyElement.addEventListener('mouseleave', () => {
                keyElement.classList.remove('active');
            });

            pianoContainer.appendChild(keyElement);
        });
    }

    playNote(note) {
        const frequency = this.getNoteFrequency(note);
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        const envelope = this.audioContext.createGain();
        envelope.gain.value = 0;
        
        oscillator.connect(envelope);
        envelope.connect(this.gainNode);
        
        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        envelope.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    getNoteFrequency(note) {
        const noteMap = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };

        const baseNote = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const baseFrequency = noteMap[baseNote];
        return baseFrequency * Math.pow(2, octave - 4);
    }
}

// Inicia o piano quando a página carregar
window.addEventListener('load', () => {
    new PianoGame();
}); 