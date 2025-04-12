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
            this.level = 1;
            this.levelElement.textContent = this.level;
            this.initializeGame();
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
        // Número total de células: 16
        switch (this.level) {
            case 1: return 6; // Remover 6 células - muito fácil
            case 2: return 8; // Remover 8 células - fácil
            case 3: return 10; // Remover 10 células - médio
            default: return 12; // Remover 12 células - difícil
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
        
        // Verificar conflitos - usando o mesmo método da função checkSolution
        this.checkForErrors(row, col, value);
        
        // Verificar se o jogo foi concluído
        if (this.isComplete() && this.isSolutionValid()) {
            setTimeout(() => {
                alert('Parabéns! Você completou o Sudoku!');
                this.level++;
                this.levelElement.textContent = this.level;
                this.initializeGame();
            }, 500);
        }
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
        let isCorrect = true;
        let isComplete = true;
        
        // Limpar todos os erros antes de verificar
        document.querySelectorAll('.sudoku-cell.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Verificar se há células vazias
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    isComplete = false;
                }
            }
        }
        
        // Verificar se há conflitos nas regras do Sudoku
        // Verificar se há números repetidos nas linhas
        for (let row = 0; row < this.size; row++) {
            const rowNumbers = new Map(); // Usando Map para armazenar valor -> posições
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== 0) {
                    const value = this.board[row][col];
                    if (!rowNumbers.has(value)) {
                        rowNumbers.set(value, []);
                    }
                    rowNumbers.get(value).push(col);
                }
            }
            
            // Verificar duplicatas
            for (const [value, positions] of rowNumbers.entries()) {
                if (positions.length > 1) {
                    isCorrect = false;
                    // Marcar apenas as células com duplicatas como erro
                    positions.forEach(col => {
                        const elem = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        elem.classList.add('error');
                    });
                }
            }
        }
        
        // Verificar se há números repetidos nas colunas
        for (let col = 0; col < this.size; col++) {
            const colNumbers = new Map(); // Usando Map para armazenar valor -> posições
            for (let row = 0; row < this.size; row++) {
                if (this.board[row][col] !== 0) {
                    const value = this.board[row][col];
                    if (!colNumbers.has(value)) {
                        colNumbers.set(value, []);
                    }
                    colNumbers.get(value).push(row);
                }
            }
            
            // Verificar duplicatas
            for (const [value, positions] of colNumbers.entries()) {
                if (positions.length > 1) {
                    isCorrect = false;
                    // Marcar apenas as células com duplicatas como erro
                    positions.forEach(row => {
                        const elem = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        elem.classList.add('error');
                    });
                }
            }
        }
        
        // No Sudoku 4x4 Junior, não verificamos conflitos nos quadrantes 2x2
        
        if (isCorrect) {
            if (isComplete) {
                setTimeout(() => {
                    alert('Parabéns! Você completou o Sudoku!');
                    this.level++;
                    this.levelElement.textContent = this.level;
                    this.initializeGame();
                }, 500);
            } else {
                alert('Tudo certo até agora! Continue completando o tabuleiro.');
            }
        } else {
            alert('Há erros no tabuleiro. Verifique os números destacados em vermelho.');
        }
    }
    
    // Verificar se a solução atual do usuário é válida (mesmo que diferente da solução gerada)
    isSolutionValid() {
        // Verificar linhas
        for (let row = 0; row < this.size; row++) {
            const rowNumbers = new Set();
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== 0) {
                    if (rowNumbers.has(this.board[row][col])) {
                        return false;
                    } else {
                        rowNumbers.add(this.board[row][col]);
                    }
                }
            }
            // Se a linha estiver completa, deve ter exatamente 4 números
            if (rowNumbers.size === this.size) {
                for (let i = 1; i <= this.size; i++) {
                    if (!rowNumbers.has(i)) return false;
                }
            }
        }
        
        // Verificar colunas
        for (let col = 0; col < this.size; col++) {
            const colNumbers = new Set();
            for (let row = 0; row < this.size; row++) {
                if (this.board[row][col] !== 0) {
                    if (colNumbers.has(this.board[row][col])) {
                        return false;
                    } else {
                        colNumbers.add(this.board[row][col]);
                    }
                }
            }
            // Se a coluna estiver completa, deve ter exatamente 4 números
            if (colNumbers.size === this.size) {
                for (let i = 1; i <= this.size; i++) {
                    if (!colNumbers.has(i)) return false;
                }
            }
        }
        
        // No Sudoku 4x4 Junior, não fazemos validação de quadrantes
        // pois é impossível construir um tabuleiro 4x4 que satisfaça
        // todas as regras ao mesmo tempo (linhas, colunas e quadrantes 2x2)
        
        return true;
    }
    
    // Dar uma dica ao jogador (até 3 dicas por jogo)
    giveHint() {
        // Encontrar todas as células vazias ou com erro
        const emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0 || this.board[row][col] !== this.solution[row][col]) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) {
            alert('Não há mais dicas disponíveis!');
            return;
        }
        
        // Verificar quantas dicas ainda pode usar
        const remainingHints = 3 - this.hintsUsed;
        if (remainingHints <= 0) {
            alert('Você já usou suas 3 dicas para este jogo! Use o botão "Solução" se quiser ver a resposta completa.');
            return;
        }
        
        // Determinar quantas dicas fornecer (máximo de dicas restantes ou células vazias)
        let hintCount = Math.min(remainingHints, emptyCells.length);
        
        // Embaralhar as células vazias para escolher aleatoriamente
        this.shuffleArray(emptyCells);
        
        // Fornecer as dicas
        for (let i = 0; i < hintCount; i++) {
            const { row, col } = emptyCells[i];
            
            // Preencher a célula com o valor correto
            this.board[row][col] = this.solution[row][col];
            
            // Atualizar a interface
            const element = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            element.textContent = this.solution[row][col];
            element.classList.remove('error');
            element.classList.add('hint');
            
            // Incrementar o contador de dicas
            this.hintsUsed++;
        }
        
        // Informar ao usuário quantas dicas ainda restam
        if (remainingHints - hintCount <= 0) {
            alert(`Dica aplicada! Você usou todas as suas dicas disponíveis.`);
        } else {
            alert(`Dica aplicada! Você ainda tem ${remainingHints - hintCount} dica(s) disponível(is).`);
        }
        
        // Verificar se o jogo foi concluído usando dicas
        if (this.isComplete()) {
            setTimeout(() => {
                alert('Parabéns! Você completou o Sudoku!');
                this.level++;
                this.levelElement.textContent = this.level;
                this.initializeGame();
            }, 500);
        }
    }
    
    // Mostrar a solução completa
    showFullSolution() {
        // Verificar se o botão de solução já foi usado
        if (this.solutionUsed) {
            return;
        }
        
        // Confirmar com o usuário
        const confirmed = window.confirm('Isso mostrará a solução completa, mas você não avançará de nível. Deseja continuar?\n\nClique em "OK" para mostrar a solução ou "Cancelar" para voltar ao jogo.');
        
        if (!confirmed) {
            return;
        }
        
        // Encontrar todas as células vazias ou com erro
        const emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0 || this.board[row][col] !== this.solution[row][col]) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) {
            alert('O tabuleiro já está completo e correto!');
            return;
        }
        
        // Preencher todas as células vazias com a solução
        for (const cell of emptyCells) {
            const { row, col } = cell;
            
            // Preencher a célula com o valor correto
            this.board[row][col] = this.solution[row][col];
            
            // Atualizar a interface
            const element = this.sudokuBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            element.textContent = this.solution[row][col];
            element.classList.remove('error');
            element.classList.add('hint');
        }
        
        // Marcar que o botão de solução foi usado
        this.solutionUsed = true;
        this.updateSolutionButton();
        
        // Alertar que o jogo foi concluído, mas não avançar de nível
        setTimeout(() => {
            alert('Solução completa exibida! Inicie um novo jogo para tentar resolver por conta própria.');
        }, 500);
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
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new SudokuGame();
}); 