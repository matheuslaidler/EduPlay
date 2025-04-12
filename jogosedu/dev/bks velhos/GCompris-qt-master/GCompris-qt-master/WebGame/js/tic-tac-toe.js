class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameBoard = document.getElementById('gameBoard');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.restartButton = document.getElementById('restartButton');

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createBoard();
    }

    createBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'tic-tac-toe-cell';
            cell.dataset.index = i;
            this.gameBoard.appendChild(cell);
        }
    }

    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            const cell = e.target.closest('.tic-tac-toe-cell');
            if (!cell || cell.textContent) return;

            const index = parseInt(cell.dataset.index);
            this.makeMove(index);
        });

        this.restartButton.addEventListener('click', () => {
            this.resetGame();
        });
    }

    makeMove(index) {
        if (this.board[index] || this.checkWinner()) return;

        this.board[index] = this.currentPlayer;
        this.updateBoard();
        
        if (this.checkWinner()) {
            setTimeout(() => {
                alert(`Jogador ${this.currentPlayer} venceu!`);
            }, 100);
            return;
        }

        if (this.board.every(cell => cell)) {
            setTimeout(() => {
                alert('Empate!');
            }, 100);
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.currentPlayerElement.textContent = this.currentPlayer;
    }

    updateBoard() {
        const cells = this.gameBoard.children;
        for (let i = 0; i < 9; i++) {
            cells[i].textContent = this.board[i];
        }
    }

    checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];

        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.currentPlayerElement.textContent = this.currentPlayer;
        this.createBoard();
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new TicTacToe();
}); 