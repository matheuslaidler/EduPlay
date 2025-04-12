class WordGame {
    constructor() {
        this.words = [
            { word: 'CASA', hint: 'Lugar onde moramos' },
            { word: 'BOLA', hint: 'Objeto redondo usado em esportes' },
            { word: 'GATO', hint: 'Animal doméstico que mia' },
            { word: 'ÁRVORE', hint: 'Planta grande com tronco e folhas' },
            { word: 'ESCOLA', hint: 'Lugar onde estudamos' },
            { word: 'LIVRO', hint: 'Objeto com páginas para ler' },
            { word: 'SOL', hint: 'Estrela que ilumina a Terra' },
            { word: 'CHUVA', hint: 'Água que cai do céu' }
        ];
        
        this.currentWord = null;
        this.score = 0;
        this.level = 1;
        
        this.wordDisplay = document.getElementById('wordDisplay');
        this.letterButtons = document.getElementById('letterButtons');
        this.wordInput = document.getElementById('wordInput');
        this.checkButton = document.getElementById('checkWord');
        this.nextButton = document.getElementById('nextWord');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.hintElement = document.getElementById('hint');
        this.notification = document.getElementById('gameNotification');

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.selectRandomWord();
        this.createLetterButtons();
    }

    setupEventListeners() {
        this.checkButton.addEventListener('click', () => {
            this.checkWord();
        });

        this.nextButton.addEventListener('click', () => {
            this.selectRandomWord();
            this.createLetterButtons();
        });

        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkWord();
            }
        });
    }

    selectRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.currentWord = this.words[randomIndex];
        this.wordDisplay.textContent = this.scrambleWord(this.currentWord.word);
        this.hintElement.textContent = `Dica: ${this.currentWord.hint}`;
        this.wordInput.value = '';
    }

    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    }

    createLetterButtons() {
        this.letterButtons.innerHTML = '';
        const letters = this.scrambleWord(this.currentWord.word).split('');
        
        letters.forEach(letter => {
            const button = document.createElement('button');
            button.className = 'letter-button';
            button.textContent = letter;
            button.addEventListener('click', () => {
                this.wordInput.value += letter;
            });
            this.letterButtons.appendChild(button);
        });
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `game-notification ${type}`;
        this.notification.style.display = 'block';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }

    checkWord() {
        const userWord = this.wordInput.value.toUpperCase();
        
        if (userWord === this.currentWord.word) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.showNotification('Parabéns! Você acertou! 🎉', 'success');
            this.selectRandomWord();
            this.createLetterButtons();
        } else {
            this.showNotification('Ops! Tente novamente!', 'error');
        }
        
        this.wordInput.value = '';
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new WordGame();
}); 