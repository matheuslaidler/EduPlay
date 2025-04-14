class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.size = 4; // Sudoku 4x4 para crianças
        this.level = 1;
        this.selectedCell = null;
        this.selectedNumber = null;
        this.isFillMode = true; // Por padrão, começa em modo de preenchimento
        this.hintsUsed = 0; // Contador de dicas usadas
        this.solutionUsed = false; // Flag para verificar se o botão de solução foi usado
        
        this.sudokuBoard = document.getElementById('sudokuBoard');
        this.numberSelection = document.getElementById('numberSelection');
        this.levelElement = document.getElementById('level');
        this.checkButton = document.getElementById('checkButton');
        this.newGameButton = document.getElementById('newGameButton');
        this.hintButton = document.getElementById('hintButton');
        this.solutionButton = document.getElementById('solutionButton');
        this.selectionModeButton = document.getElementById('selectionModeButton');
        this.fillModeButton = document.getElementById('fillModeButton');
        
        // Criar elemento de notificação
        this.notification = document.getElementById('gameNotification');
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.generateSudoku();
        this.renderBoard();
        this.renderNumberSelection();
        this.updateModeDisplay();
        this.hintsUsed = 0; // Resetar contador de dicas ao iniciar novo jogo
        this.solutionUsed = false; // Resetar flag de solução
        this.updateSolutionButton(); // Atualizar estado do botão de solução
    }
    
    setupEventListeners() {
        this.checkButton.addEventListener('click', () => {
            this.checkSolution();
        });
        
        this.newGameButton.addEventListener('click', () => {
            this.level = 1; // Volta para o nível 1
            this.levelElement.textContent = this.level;
            this.initializeGame();
            this.showNotification('Novo jogo iniciado no nível 1! 🎮', 'info');
        });
        
        this.hintButton.addEventListener('click', () => {
            this.giveHint();
        });
        
        this.solutionButton.addEventListener('click', () => {
            this.showFullSolution();
        });
        
        // Adicionar eventos para os botões de modo
        this.selectionModeButton.addEventListener('click', () => {
            this.setMode(false);
        });
        
        this.fillModeButton.addEventListener('click', () => {
            this.setMode(true);
        });
    }
    
    // Definir o modo de jogo (seleção ou preenchimento)
    setMode(isFillMode) {
        this.isFillMode = isFillMode;
        this.updateModeDisplay();
    }
    
    // Atualizar a exibição dos botões de modo
    updateModeDisplay() {
        if (this.isFillMode) {
            this.selectionModeButton.classList.remove('active');
            this.fillModeButton.classList.add('active');
        } else {
            this.selectionModeButton.classList.add('active');
            this.fillModeButton.classList.remove('active');
        }
    }
    
    // Gerar o tabuleiro do Sudoku
    generateSudoku() {
        // Inicializar o tabuleiro vazio
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        // Gerar a solução
        this.generateSolution();
        
        // Copiar a solução
        this.solution = this.board.map(row => [...row]);
        
        // Remover alguns números com base no nível
        const cellsToRemove = this.getDifficultyConfig();
        this.removeRandomCells(cellsToRemove);
    }
    
    // Gerar uma solução válida para o tabuleiro do Sudoku
    generateSolution() {
        // Para um Sudoku 4x4 Junior, usaremos um padrão Latin Square
        // que garante números não repetidos em linhas e colunas
        
        // Base do tabuleiro 4x4 (um Latin Square válido)
        const patterns = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 1, 4, 3],
            [4, 3, 2, 1]
        ];
        
        // Embaralhar as linhas (preserva a propriedade de Latin Square)
        const shuffledRowIndices = this.shuffleArray([0, 1, 2, 3]);
        
        // Embaralhar as colunas (preserva a propriedade de Latin Square)
        const shuffledColIndices = this.shuffleArray([0, 1, 2, 3]);
        
        // Embaralhar os números (1-4)
        const shuffledNumbers = this.shuffleArray([1, 2, 3, 4]);
        
        // Construir o tabuleiro embaralhado
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const patternRow = shuffledRowIndices[row];
                const patternCol = shuffledColIndices[col];
                const value = patterns[patternRow][patternCol];
                
                // Mapear o valor original para o valor embaralhado
                this.board[row][col] = shuffledNumbers[value - 1];
            }
        }
    }
    
    // Remover células aleatórias para criar o puzzle
    removeRandomCells(count) {
        const positions = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                positions.push([i, j]);
            }
        }
        
        // Embaralhar as posições
        this.shuffleArray(positions);
        
        // Remover células
        for (let i = 0; i < count; i++) {
            if (i < positions.length) {
                const [row, col] = positions[i];
                this.board[row][col] = 0;
            }
        }
    }
    
    // Configuração de dificuldade com base no nível
    getDifficultyConfig() {
        // Número de células para remover baseado no nível
        switch(this.level) {
            case 1:
                return 6;  // Nível 1: Remove 6 células (mais fácil)
            case 2:
                return 8;  // Nível 2: Remove 8 células
            case 3:
                return 10; // Nível 3: Remove 10 células
            case 4:
                return 12; // Nível 4: Remove 12 células (mais difícil)
            default:
                return 12; // Níveis acima de 4 mantêm a dificuldade máxima
        }
    }
    
    // Renderizar o tabuleiro do Sudoku
    renderBoard() {
        this.sudokuBoard.innerHTML = '';
        
        // Adicionar evento para limpar seleção ao clicar no tabuleiro
        this.sudokuBoard.addEventListener('click', (e) => {
            // Se clicar no fundo do tabuleiro (não em uma célula)
            if (e.target === this.sudokuBoard) {
                this.clearSelection();
            }
        });
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Verificar se a célula tem um valor fixo
                if (this.board[row][col] !== 0) {
                    cell.textContent = this.board[row][col];
                    cell.classList.add('fixed');
                }
                
                // Adicionar evento de clique
                cell.addEventListener('click', () => {
                    this.selectCell(cell, row, col);
                });
                
                this.sudokuBoard.appendChild(cell);
            }
        }
    }
    
    // Renderizar a seleção de números
    renderNumberSelection() {
        this.numberSelection.innerHTML = '';
        
        // Adicionar opção para limpar célula (vazio)
        const clearElement = document.createElement('div');
        clearElement.className = 'sudoku-number clear-cell';
        clearElement.textContent = 'X';
        clearElement.title = 'Apagar número';
        
        // Adicionar evento de clique para o botão de limpar
        clearElement.addEventListener('click', () => {
            this.clearSelectedCell();
        });
        
        this.numberSelection.appendChild(clearElement);
        
        // Adicionar números de 1 a 4
        for (let num = 1; num <= this.size; num++) {
            const numberElement = document.createElement('div');
            numberElement.className = 'sudoku-number';
            numberElement.textContent = num;
            
            // Adicionar evento de clique
            numberElement.addEventListener('click', () => {
                this.selectNumber(numberElement, num);
            });
            
            this.numberSelection.appendChild(numberElement);
        }
    }
    
    // Selecionar uma célula
    selectCell(cell, row, col) {
        // Verificar se a célula é fixa
        if (this.board[row][col] !== 0 && cell.classList.contains('fixed')) {
            this.clearSelection();
            return;
        }
        
        // Remover a seleção anterior
        document.querySelectorAll('.sudoku-cell.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Adicionar a seleção
        cell.classList.add('selected');
        this.selectedCell = { row, col, element: cell };
        
        // Se um número estiver selecionado E estivermos no modo de preenchimento, preenchê-lo
        if (this.selectedNumber && this.isFillMode) {
            this.fillCell();
        }
    }
    
    // Selecionar um número
    selectNumber(element, num) {
        // Remover a seleção anterior
        document.querySelectorAll('.sudoku-number.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Adicionar a seleção
        element.classList.add('selected');
        this.selectedNumber = { value: num, element };
        
        // Se uma célula estiver selecionada E estivermos no modo de preenchimento, preenchê-la
        if (this.selectedCell && this.isFillMode) {
            this.fillCell();
        }
    }
    
    // Preencher a célula selecionada com o número selecionado
    fillCell() {
        if (!this.selectedCell || !this.selectedNumber) return;
        
        const { row, col, element } = this.selectedCell;
        const { value } = this.selectedNumber;
        
        // Limpar todos os erros antes de preencher
        document.querySelectorAll('.sudoku-cell.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Atualizar o valor no tabuleiro
        this.board[row][col] = value;
        
        // Atualizar a interface
        element.textContent = value;
        
        // Verificar conflitos
        this.checkForErrors(row, col, value);
    }
    
    // Verificar erros em uma célula específica
    checkForErrors(rowToCheck, colToCheck, valueToCheck) {
        // Verificar conflitos na linha
        const rowCells = [];
        for (let c = 0; c < this.size; c++) {
            if (c !== colToCheck && this.board[rowToCheck][c] === valueToCheck) {
                rowCells.push({ row: rowToCheck, col: c });
            }
        }
        
        if (rowCells.length > 0) {
            // Marcar a célula atual
            const currentCell = this.sudokuBoard.querySelector(`[data-row="${rowToCheck}"][data-col="${colToCheck}"]`);
            currentCell.classList.add('error');
            
            // Marcar as células conflitantes
            rowCells.forEach(pos => {
                const cellElement = this.sudokuBoard.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                cellElement.classList.add('error');
            });
        }
        
        // Verificar conflitos na coluna
        const colCells = [];
        for (let r = 0; r < this.size; r++) {
            if (r !== rowToCheck && this.board[r][colToCheck] === valueToCheck) {
                colCells.push({ row: r, col: colToCheck });
            }
        }
        
        if (colCells.length > 0) {
            // Marcar a célula atual
            const currentCell = this.sudokuBoard.querySelector(`[data-row="${rowToCheck}"][data-col="${colToCheck}"]`);
            currentCell.classList.add('error');
            
            // Marcar as células conflitantes
            colCells.forEach(pos => {
                const cellElement = this.sudokuBoard.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                cellElement.classList.add('error');
            });
        }
        
        // No Sudoku 4x4 Junior, não verificamos conflitos nos quadrantes 2x2
    }
    
    // Verificar se o tabuleiro está completo
    isComplete() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Verificar a solução atual
    checkSolution() {
        if (!this.isComplete()) {
            this.showNotification('Complete todo o tabuleiro primeiro!', 'error');
            return;
        }

        if (this.isSolutionValid()) {
            if (this.level < 4) {
                this.level++;
                this.showNotification(`Parabéns! Você avançou para o nível ${this.level}! 🎉`, 'success');
                this.levelElement.textContent = this.level;
                setTimeout(() => {
                    this.initializeGame();
                }, 2000);
            } else if (this.level === 4) {
                this.showNotification('Parabéns! Você completou todos os níveis! 🏆', 'success');
            }
        } else {
            this.showNotification('Ops! Ainda há erros no tabuleiro!', 'error');
        }
    }
    
    // Verificar se a solução atual do usuário é válida
    isSolutionValid() {
        // Verificar linhas
        for (let row = 0; row < this.size; row++) {
            const rowNumbers = new Set();
            for (let col = 0; col < this.size; col++) {
                const value = this.board[row][col];
                if (value === 0 || rowNumbers.has(value)) {
                    return false;
                }
                rowNumbers.add(value);
            }
        }
        
        // Verificar colunas
        for (let col = 0; col < this.size; col++) {
            const colNumbers = new Set();
            for (let row = 0; row < this.size; row++) {
                const value = this.board[row][col];
                if (value === 0 || colNumbers.has(value)) {
                    return false;
                }
                colNumbers.add(value);
            }
        }
        
        return true;
    }
    
    // Dar uma dica ao jogador (até 3 dicas por jogo)
    giveHint() {
        if (this.hintsUsed >= 3) {
            this.showNotification('Você já usou todas as dicas disponíveis!', 'error');
            return;
        }

        if (this.isComplete()) {
            this.showNotification('O tabuleiro já está completo!', 'info');
            return;
        }

        // Encontrar uma célula vazia
        let emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) {
            this.showNotification('Não há mais células vazias!', 'info');
            return;
        }

        // Escolher uma célula aleatória
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];

        // Preencher com a solução correta
        this.board[row][col] = this.solution[row][col];
        
        // Atualizar a célula no tabuleiro
        const cell = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = this.board[row][col];
        cell.classList.add('hint');
        
        this.hintsUsed++;
        this.showNotification(`Dica usada! Restam ${3 - this.hintsUsed} dicas.`, 'info');
    }
    
    // Mostrar a solução completa
    showFullSolution() {
        if (this.solutionUsed) {
            this.showNotification('Você já usou a solução completa!', 'error');
            return;
        }

        this.solutionUsed = true;
        this.updateSolutionButton();

        // Mostrar a solução completa
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.board[row][col] = this.solution[row][col];
                const cell = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.textContent = this.board[row][col];
                cell.classList.add('hint');
            }
        }

        this.showNotification('Solução completa mostrada!', 'info');
    }
    
    // Atualizar o estado do botão de solução
    updateSolutionButton() {
        if (this.solutionUsed) {
            this.solutionButton.disabled = true;
            this.solutionButton.style.opacity = '0.5';
            this.solutionButton.style.cursor = 'not-allowed';
        } else {
            this.solutionButton.disabled = false;
            this.solutionButton.style.opacity = '1';
            this.solutionButton.style.cursor = 'pointer';
        }
    }
    
    // Embaralhar um array
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Limpar seleção
    clearSelection() {
        // Remover seleção da célula
        document.querySelectorAll('.sudoku-cell.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Remover seleção do número
        document.querySelectorAll('.sudoku-number.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.selectedCell = null;
        this.selectedNumber = null;
    }
    
    // Limpar a célula selecionada
    clearSelectedCell() {
        if (!this.selectedCell) return;
        
        const { row, col, element } = this.selectedCell;
        
        // Verificar se a célula é fixa
        if (element.classList.contains('fixed')) {
            return;
        }
        
        // Limpar todos os erros antes de limpar a célula
        document.querySelectorAll('.sudoku-cell.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Atualizar o valor no tabuleiro
        this.board[row][col] = 0;
        
        // Atualizar a interface
        element.textContent = '';
        
        // Desselecionar apenas a célula atual, mantendo o número selecionado
        document.querySelectorAll('.sudoku-cell.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.selectedCell = null;
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

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new SudokuGame();
}); 