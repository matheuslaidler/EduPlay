class Piano {
    constructor() {
        this.piano = document.getElementById('piano');
        this.recordButton = document.getElementById('recordButton');
        this.playButton = document.getElementById('playButton');
        this.clearButton = document.getElementById('clearButton');
        
        this.notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        this.keyboardKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
        this.recordedNotes = [];
        this.isRecording = false;
        
        // Inicializar o contexto de áudio
        this.initAudio();
        
        this.initializePiano();
        this.setupEventListeners();
        
        // Carregar os sons do piano
        this.loadPianoSounds();
    }
    
    initAudio() {
        // Criar o contexto de áudio
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('Contexto de áudio inicializado com sucesso');
        } catch (e) {
            console.error('Erro ao criar contexto de áudio:', e);
            alert('Seu navegador não suporta a API Web Audio. O piano pode não funcionar corretamente.');
        }
    }
    
    loadPianoSounds() {
        // Mapear as frequências das notas
        this.noteFrequencies = {
            'C4': 261.63, 'C#4': 277.18,
            'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63,
            'F4': 349.23, 'F#4': 369.99,
            'G4': 392.00, 'G#4': 415.30,
            'A4': 440.00, 'A#4': 466.16,
            'B4': 493.88,
            'C5': 523.25
        };
    }

    initializePiano() {
        this.notes.forEach((note, index) => {
            const key = document.createElement('div');
            key.className = 'piano-key';
            key.dataset.note = note;
            key.dataset.key = this.keyboardKeys[index];
            
            // Adicionar teclas pretas
            if (['C4', 'D4', 'F4', 'G4', 'A4'].includes(note)) {
                const blackKey = document.createElement('div');
                blackKey.className = 'piano-key black';
                blackKey.dataset.note = this.getBlackKeyNote(note);
                this.piano.appendChild(blackKey);
            }
            
            this.piano.appendChild(key);
        });
    }

    getBlackKeyNote(note) {
        const blackNotes = {
            'C4': 'C#4',
            'D4': 'D#4',
            'F4': 'F#4',
            'G4': 'G#4',
            'A4': 'A#4'
        };
        return blackNotes[note];
    }

    setupEventListeners() {
        // Eventos do mouse
        this.piano.addEventListener('mousedown', (e) => {
            const key = e.target.closest('.piano-key');
            if (key) {
                this.playNote(key.dataset.note);
                key.classList.add('active');
                if (this.isRecording) {
                    this.recordedNotes.push({
                        note: key.dataset.note,
                        time: Date.now()
                    });
                }
            }
        });

        this.piano.addEventListener('mouseup', (e) => {
            const key = e.target.closest('.piano-key');
            if (key) {
                key.classList.remove('active');
            }
        });
        
        // Adicionar evento de mouseout para remover a classe ativa
        this.piano.addEventListener('mouseout', (e) => {
            const key = e.target.closest('.piano-key');
            if (key && key.classList.contains('active')) {
                key.classList.remove('active');
            }
        });

        // Eventos do teclado
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return; // Evitar repetição quando a tecla é mantida pressionada
            
            const index = this.keyboardKeys.indexOf(e.key.toLowerCase());
            if (index !== -1) {
                const note = this.notes[index];
                this.playNote(note);
                const key = this.piano.querySelector(`[data-note="${note}"]`);
                if (key) key.classList.add('active');
                if (this.isRecording) {
                    this.recordedNotes.push({
                        note: note,
                        time: Date.now()
                    });
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            const index = this.keyboardKeys.indexOf(e.key.toLowerCase());
            if (index !== -1) {
                const note = this.notes[index];
                const key = this.piano.querySelector(`[data-note="${note}"]`);
                if (key) key.classList.remove('active');
            }
        });

        // Eventos de toque para dispositivos móveis
        this.piano.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = e.target.closest('.piano-key');
            if (key) {
                this.playNote(key.dataset.note);
                key.classList.add('active');
                if (this.isRecording) {
                    this.recordedNotes.push({
                        note: key.dataset.note,
                        time: Date.now()
                    });
                }
            }
        }, { passive: false });
        
        this.piano.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = e.target.closest('.piano-key');
            if (key) {
                key.classList.remove('active');
            }
        }, { passive: false });

        // Controles
        this.recordButton.addEventListener('click', () => {
            this.isRecording = !this.isRecording;
            this.recordButton.textContent = this.isRecording ? 'Parar' : 'Gravar';
            
            // Se começou a gravar, limpa as notas anteriores
            if (this.isRecording) {
                this.recordedNotes = [];
            }
        });

        this.playButton.addEventListener('click', () => {
            this.playRecordedNotes();
        });

        this.clearButton.addEventListener('click', () => {
            this.recordedNotes = [];
            alert('Gravação apagada!');
        });
    }

    playNote(note) {
        if (!this.audioContext) {
            try {
                this.initAudio();
            } catch (e) {
                console.error('Não foi possível inicializar o áudio:', e);
                return;
            }
        }
        
        // Reativar o contexto de áudio se estiver suspenso (política de autoplay)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Criar os nós de áudio
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Conectar os nós
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Configurar o oscilador
        oscillator.type = 'sine'; // Tipo de onda (sine, square, sawtooth, triangle)
        
        // Definir a frequência baseada na nota
        const frequency = this.getFrequency(note);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Configurar o volume (envelope ADSR simplificado)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.2); // Decay
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.5); // Release
        
        // Iniciar e parar o oscilador
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1.5);
        
        console.log(`Tocando nota ${note} (${frequency} Hz)`);
    }

    getFrequency(note) {
        return this.noteFrequencies[note] || 440; // A4 (Lá) como padrão se a nota não for encontrada
    }

    async playRecordedNotes() {
        if (this.recordedNotes.length === 0) {
            alert('Nenhuma nota gravada. Grave algumas notas primeiro!');
            return;
        }
        
        // Desabilitar o botão de reprodução durante a reprodução
        this.playButton.disabled = true;
        
        // Referência de tempo inicial
        const startTime = this.recordedNotes[0].time;
        
        // Reproduzir cada nota no momento correto
        for (const note of this.recordedNotes) {
            const delay = note.time - startTime;
            
            // Esperar até o momento certo para tocar a nota
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Tocar a nota
            this.playNote(note.note);
            
            // Destacar visualmente a tecla
            const key = this.piano.querySelector(`[data-note="${note.note}"]`);
            if (key) {
                key.classList.add('active');
                setTimeout(() => {
                    key.classList.remove('active');
                }, 200);
            }
        }
        
        // Reativar o botão de reprodução
        this.playButton.disabled = false;
    }
}

// Inicializar o piano quando a página carregar
window.addEventListener('load', () => {
    new Piano();
}); 