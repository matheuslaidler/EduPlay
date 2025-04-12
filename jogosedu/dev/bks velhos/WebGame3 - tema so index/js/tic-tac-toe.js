class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];

        this.boardElement = document.getElementById('gameBoard');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.restartButton = document.getElementById('restartButton');
        this.notification = document.getElementById('gameNotification');

        this.initializeGame();
    }

    initializeGame() {
        this.createBoard();
        this.restartButton.addEventListener('click', () => this.restartGame());
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.index = index;
            cellElement.addEventListener('click', () => this.handleCellClick(index));
            this.boardElement.appendChild(cellElement);
        });
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') return;

        this.board[index] = this.currentPlayer;
        this.updateBoard();
        
        if (this.checkWin()) {
            this.showNotification(`Jogador ${this.currentPlayer} venceu! 🎉`, 'success');
            this.gameStatusElement.textContent = `Jogador ${this.currentPlayer} venceu!`;
            this.gameActive = false;
            return;
        }

        if (this.checkDraw()) {
            this.showNotification('Empate! 😊', 'info');
            this.gameStatusElement.textContent = 'Empate!';
            this.gameActive = false;
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.currentPlayerElement.textContent = this.currentPlayer;
    }

    updateBoard() {
        const cells = this.boardElement.children;
        this.board.forEach((value, index) => {
            const cell = cells[index];
            cell.className = 'cell';
            if (value === 'X') cell.classList.add('x');
            if (value === 'O') cell.classList.add('o');
        });
    }

    checkWin() {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Marca as células vencedoras
                const cells = this.boardElement.children;
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                
                return true;
            }
        }
        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.currentPlayerElement.textContent = 'X';
        this.gameStatusElement.textContent = 'Boa sorte!';
        this.createBoard();
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `game-notification ${type}`;
        this.notification.style.display = 'block';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 