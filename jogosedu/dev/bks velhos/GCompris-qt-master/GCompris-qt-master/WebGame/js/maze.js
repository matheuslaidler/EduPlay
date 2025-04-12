class MazeGame {
    constructor() {
        this.maze = document.getElementById('maze');
        this.levelElement = document.getElementById('level');
        this.movesElement = document.getElementById('moves');
        this.restartButton = document.getElementById('restartButton');
        this.nextLevelButton = document.getElementById('nextLevel');
        
        this.level = 1;
        this.moves = 0;
        this.playerPosition = { x: 0, y: 0 };
        this.exitPosition = { x: 0, y: 0 };
        this.mazeSize = 10;
        this.isLevelComplete = false;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createMaze();
        this.setupKeyboardControls();
    }

    setupEventListeners() {
        this.restartButton.addEventListener('click', () => {
            this.resetGame();
        });

        this.nextLevelButton.addEventListener('click', () => {
            this.level++;
            this.levelElement.textContent = this.level;
            this.resetGame();
        });
        
        // Adicionar suporte para controles móveis
        const moveUpButton = document.getElementById('moveUp');
        const moveDownButton = document.getElementById('moveDown');
        const moveLeftButton = document.getElementById('moveLeft');
        const moveRightButton = document.getElementById('moveRight');
        
        if (moveUpButton) {
            moveUpButton.addEventListener('click', () => {
                if (!this.isLevelComplete) {
                    this.movePlayer(this.playerPosition.x, Math.max(0, this.playerPosition.y - 1));
                }
            });
        }
        
        if (moveDownButton) {
            moveDownButton.addEventListener('click', () => {
                if (!this.isLevelComplete) {
                    this.movePlayer(this.playerPosition.x, Math.min(this.mazeSize - 1, this.playerPosition.y + 1));
                }
            });
        }
        
        if (moveLeftButton) {
            moveLeftButton.addEventListener('click', () => {
                if (!this.isLevelComplete) {
                    this.movePlayer(Math.max(0, this.playerPosition.x - 1), this.playerPosition.y);
                }
            });
        }
        
        if (moveRightButton) {
            moveRightButton.addEventListener('click', () => {
                if (!this.isLevelComplete) {
                    this.movePlayer(Math.min(this.mazeSize - 1, this.playerPosition.x + 1), this.playerPosition.y);
                }
            });
        }
        
        // Adicionar suporte para gestos de deslize na versão móvel
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.maze.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, false);
        
        this.maze.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Impedir rolagem da página
        }, false);
        
        this.maze.addEventListener('touchend', (e) => {
            if (this.isLevelComplete) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Determinar qual direção teve o maior movimento
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Movimento horizontal
                if (diffX > 50) {
                    // Deslize para direita
                    this.movePlayer(Math.min(this.mazeSize - 1, this.playerPosition.x + 1), this.playerPosition.y);
                } else if (diffX < -50) {
                    // Deslize para esquerda
                    this.movePlayer(Math.max(0, this.playerPosition.x - 1), this.playerPosition.y);
                }
            } else {
                // Movimento vertical
                if (diffY > 50) {
                    // Deslize para baixo
                    this.movePlayer(this.playerPosition.x, Math.min(this.mazeSize - 1, this.playerPosition.y + 1));
                } else if (diffY < -50) {
                    // Deslize para cima
                    this.movePlayer(this.playerPosition.x, Math.max(0, this.playerPosition.y - 1));
                }
            }
        }, false);
    }

    createMaze() {
        this.maze.innerHTML = '';
        this.maze.style.gridTemplateColumns = `repeat(${this.mazeSize}, 1fr)`;
        
        // Criar grid inicial com todas as células como caminhos
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                this.maze.appendChild(cell);
            }
        }

        // Definir posição inicial do jogador (sempre no canto superior esquerdo)
        this.playerPosition = { x: 0, y: 0 };
        this.getCell(0, 0).classList.add('player');

        // Definir posição da saída (sempre no canto inferior direito)
        this.exitPosition = { 
            x: this.mazeSize - 1, 
            y: this.mazeSize - 1 
        };
        this.getCell(this.exitPosition.x, this.exitPosition.y).classList.add('exit');

        // Adicionar paredes baseado no nível
        this.addWalls();
    }

    addWalls() {
        // Calcular quantas paredes adicionar baseado no nível
        const maxWalls = Math.floor((this.mazeSize * this.mazeSize) * 0.3 * Math.min(this.level * 0.1, 0.7));
        
        // Manter registro de células em um caminho garantido
        const path = this.createGuaranteedPath();
        
        // Contador de paredes adicionadas
        let wallsAdded = 0;
        
        // Tentar adicionar paredes nas células que não fazem parte do caminho garantido
        while (wallsAdded < maxWalls) {
            const x = Math.floor(Math.random() * this.mazeSize);
            const y = Math.floor(Math.random() * this.mazeSize);
            
            // Verificar se a célula não é o jogador, saída e não faz parte do caminho garantido
            if ((x !== 0 || y !== 0) && 
                (x !== this.exitPosition.x || y !== this.exitPosition.y) && 
                !path.some(cell => cell.x === x && cell.y === y)) {
                
                const cell = this.getCell(x, y);
                if (!cell.classList.contains('wall')) {
                    cell.classList.add('wall');
                    wallsAdded++;
                }
            }
        }
        
        // Adicionar padrões diferentes baseados no nível
        if (this.level > 1) {
            this.addPatternWalls();
        }
    }
    
    createGuaranteedPath() {
        const path = [];
        let x = 0;
        let y = 0;
        
        // Adicionar posição inicial ao caminho
        path.push({x, y});
        
        // Criar caminho direto até a saída
        while (x < this.exitPosition.x || y < this.exitPosition.y) {
            if (x < this.exitPosition.x && Math.random() < 0.7) {
                x++;
            } else if (y < this.exitPosition.y) {
                y++;
            } else {
                x++;
            }
            path.push({x, y});
        }
        
        return path;
    }
    
    addPatternWalls() {
        // Obter caminho garantido novamente para preservá-lo
        const safePath = this.createGuaranteedPath();
        
        // Adicionar padrões baseados no nível
        switch (this.level % 3) {
            case 1: // Padrão de ziguezague
                for (let i = 2; i < this.mazeSize - 2; i += 2) {
                    for (let j = 0; j < this.mazeSize - 1; j++) {
                        if (j !== i) {
                            // Verificar se a célula não está no caminho garantido
                            if (!safePath.some(cell => cell.x === i && cell.y === j)) {
                                const cell = this.getCell(i, j);
                                if (!cell.classList.contains('player') && 
                                    !cell.classList.contains('exit')) {
                                    cell.classList.add('wall');
                                }
                            }
                        }
                    }
                }
                break;
                
            case 2: // Padrão de espiral
                for (let layer = 1; layer < this.mazeSize / 2; layer++) {
                    if (layer % 2 === 1) {
                        for (let i = layer; i < this.mazeSize - layer; i++) {
                            // Verificar se a célula não está no caminho garantido
                            if (!safePath.some(cell => cell.x === i && cell.y === layer)) {
                                const cell = this.getCell(i, layer);
                                if (!cell.classList.contains('player') && 
                                    !cell.classList.contains('exit')) {
                                    cell.classList.add('wall');
                                }
                            }
                        }
                    }
                }
                break;
                
            case 0: // Padrão de grade
                for (let i = 2; i < this.mazeSize; i += 2) {
                    for (let j = 2; j < this.mazeSize; j += 2) {
                        // Verificar se a célula não está no caminho garantido
                        if (!safePath.some(cell => cell.x === i && cell.y === j)) {
                            const cell = this.getCell(i, j);
                            if (!cell.classList.contains('player') && 
                                !cell.classList.contains('exit')) {
                                cell.classList.add('wall');
                            }
                        }
                    }
                }
                break;
        }
        
        // Verificar e garantir que o caminho seguro esteja livre
        safePath.forEach(position => {
            const cell = this.getCell(position.x, position.y);
            if (cell.classList.contains('wall')) {
                cell.classList.remove('wall');
            }
        });
    }

    getCell(x, y) {
        return this.maze.children[y * this.mazeSize + x];
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Só processa teclas se o nível não estiver completo
            if (!this.isLevelComplete) {
                let newX = this.playerPosition.x;
                let newY = this.playerPosition.y;
                
                switch(e.key) {
                    case 'ArrowUp':
                        newY = Math.max(0, this.playerPosition.y - 1);
                        break;
                    case 'ArrowDown':
                        newY = Math.min(this.mazeSize - 1, this.playerPosition.y + 1);
                        break;
                    case 'ArrowLeft':
                        newX = Math.max(0, this.playerPosition.x - 1);
                        break;
                    case 'ArrowRight':
                        newX = Math.min(this.mazeSize - 1, this.playerPosition.x + 1);
                        break;
                }
                
                this.movePlayer(newX, newY);
            }
        });
    }

    movePlayer(newX, newY) {
        const newCell = this.getCell(newX, newY);
        
        if (!newCell.classList.contains('wall')) {
            // Remover classe do jogador da posição atual
            this.getCell(this.playerPosition.x, this.playerPosition.y).classList.remove('player');
            
            // Atualizar posição do jogador
            this.playerPosition = { x: newX, y: newY };
            
            // Adicionar classe do jogador na nova posição
            newCell.classList.add('player');
            
            // Incrementar contador de movimentos
            this.moves++;
            this.movesElement.textContent = this.moves;
            
            // Verificar se o jogador chegou à saída
            if (newX === this.exitPosition.x && newY === this.exitPosition.y && !this.isLevelComplete) {
                this.isLevelComplete = true;
                this.completeLevel();
            }
        }
    }

    resetGame() {
        this.moves = 0;
        this.movesElement.textContent = this.moves;
        this.isLevelComplete = false;
        this.createMaze();
    }

    completeLevel() {
        setTimeout(() => {
            alert('Parabéns! Você completou o labirinto!');
            this.level++;
            this.levelElement.textContent = this.level;
            this.resetGame();
        }, 100);
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new MazeGame();
}); 