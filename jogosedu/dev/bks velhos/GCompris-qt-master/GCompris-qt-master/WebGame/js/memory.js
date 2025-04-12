class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.pairsFound = 0;
        this.attempts = 0;
        this.gameBoard = document.getElementById('gameBoard');
        this.pairsFoundElement = document.getElementById('pairsFound');
        this.attemptsElement = document.getElementById('attempts');
        this.restartButton = document.getElementById('restartButton');

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();

        // Verificar se é dispositivo móvel e ajustar o número de colunas
        this.checkDeviceAndAdjust();
        
        // Adicionar listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            this.checkDeviceAndAdjust();
        });
    }

    createCards() {
        // Criar pares de cartas
        const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        this.cards = [...symbols, ...symbols];
    }

    shuffleCards() {
        // Embaralhar as cartas (algoritmo Fisher-Yates)
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        this.gameBoard.innerHTML = '';
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.addEventListener('click', () => this.flipCard(card));
            this.gameBoard.appendChild(card);
        });
    }

    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card || card.classList.contains('flipped') || this.flippedCards.length >= 2) return;

            this.flipCard(card);
        });

        this.restartButton.addEventListener('click', () => {
            this.resetGame();
        });
    }

    flipCard(card) {
        card.classList.add('flipped');
        card.innerHTML = `<span class="card-symbol">${card.dataset.symbol}</span>`;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.attemptsElement.textContent = this.attempts;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.symbol === card2.dataset.symbol;

        if (match) {
            this.pairsFound++;
            this.pairsFoundElement.textContent = this.pairsFound;
            this.flippedCards = [];
            
            if (this.pairsFound === this.cards.length / 2) {
                setTimeout(() => {
                    alert('Parabéns! Você completou o jogo!');
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.innerHTML = '';
                card2.innerHTML = '';
                this.flippedCards = [];
            }, 1000);
        }
    }

    resetGame() {
        this.flippedCards = [];
        this.pairsFound = 0;
        this.attempts = 0;
        this.pairsFoundElement.textContent = '0';
        this.attemptsElement.textContent = '0';
        this.initializeGame();
    }

    checkDeviceAndAdjust() {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;
        
        // Ajustar número de colunas com base na largura da tela
        if (window.innerWidth < 480) {
            gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (window.innerWidth < 768) {
            gameBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
            gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new MemoryGame();
}); 