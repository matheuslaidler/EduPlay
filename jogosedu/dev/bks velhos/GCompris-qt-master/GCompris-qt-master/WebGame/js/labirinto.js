class MazeGame {
    constructor() {
        // Elementos do DOM
        this.maze = document.getElementById('maze');
        this.levelElement = document.getElementById('level');
        this.movesElement = document.getElementById('moves');
        this.restartButton = document.getElementById('restartButton');
        this.nextLevelButton = document.getElementById('nextLevel');
        
        // Controles de direção
        this.upButton = document.getElementById('up');
        this.rightButton = document.getElementById('right');
        this.downButton = document.getElementById('down');
        this.leftButton = document.getElementById('left');
        
        // Estado do jogo
        this.level = 1;
        this.moves = 0;
        this.playerPosition = { x: 0, y: 0 };
        this.exitPosition = { x: 0, y: 0 };
        this.isLevelComplete = false;
        
        // Detecção de dispositivo móvel
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Configurações do labirinto
        this.mazeConfigs = {
            1: { size: 5, wallPercentage: 0.2 },
            2: { size: 6, wallPercentage: 0.25 },
            3: { size: 7, wallPercentage: 0.3 },
            4: { size: 8, wallPercentage: 0.3 },
            5: { size: 9, wallPercentage: 0.35 },
            6: { size: 10, wallPercentage: 0.35 }
        };
        
        // Ajustar tamanhos para dispositivos móveis
        this.adjustConfigsForMobile();
        
        // Direções de movimento
        this.directions = {
            up: { x: 0, y: -1 },
            right: { x: 1, y: 0 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 }
        };
        
        // Inicializar o jogo
        this.initializeGame();
        
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    // Ajustar configurações para dispositivos móveis - Melhorado
    adjustConfigsForMobile() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Tamanho disponível para o labirinto (considerando os outros elementos)
        const availableSpace = Math.min(screenWidth * 0.9, screenHeight * 0.6);
        
        // Ajustar tamanho das células com base no espaço disponível
        const cellSize = availableSpace / 10; // Para o nível mais difícil (10x10)
        
        // Definir tamanhos máximos com base no espaço disponível
        let maxSize = Math.floor(availableSpace / 50); // Célula mínima de 50px
        if (maxSize > 10) maxSize = 10;
        if (maxSize < 4) maxSize = 4;
        
        // Phones muito pequenos (menores que Galaxy Fold)
        if (screenWidth < 280) {
            this.mazeConfigs = {
                1: { size: 4, wallPercentage: 0.15 },
                2: { size: 4, wallPercentage: 0.15 },
                3: { size: 5, wallPercentage: 0.2 },
                4: { size: 5, wallPercentage: 0.2 },
                5: { size: 6, wallPercentage: 0.2 },
                6: { size: 6, wallPercentage: 0.25 }
            };
        }
        // Phones muito estreitos (Galaxy Fold, etc)
        else if (screenWidth < 320) {
            this.mazeConfigs = {
                1: { size: 4, wallPercentage: 0.15 },
                2: { size: 4, wallPercentage: 0.15 },
                3: { size: 5, wallPercentage: 0.2 },
                4: { size: 5, wallPercentage: 0.2 },
                5: { size: 6, wallPercentage: 0.25 },
                6: { size: 6, wallPercentage: 0.25 }
            };
        }
        // Phones pequenos
        else if (screenWidth < 380) {
            this.mazeConfigs = {
                1: { size: 4, wallPercentage: 0.2 },
                2: { size: 5, wallPercentage: 0.2 },
                3: { size: 5, wallPercentage: 0.25 },
                4: { size: 6, wallPercentage: 0.25 },
                5: { size: 6, wallPercentage: 0.25 },
                6: { size: 7, wallPercentage: 0.25 }
            };
        }
        // Phones médios
        else if (screenWidth < 480) {
            this.mazeConfigs = {
                1: { size: 5, wallPercentage: 0.2 },
                2: { size: 5, wallPercentage: 0.2 },
                3: { size: 6, wallPercentage: 0.25 },
                4: { size: 6, wallPercentage: 0.25 },
                5: { size: 7, wallPercentage: 0.25 },
                6: { size: 7, wallPercentage: 0.3 }
            };
        }
        // Telas maiores (tablets pequenos, etc)
        else if (screenWidth < 768) {
            this.mazeConfigs = {
                1: { size: 5, wallPercentage: 0.2 },
                2: { size: 6, wallPercentage: 0.2 },
                3: { size: 7, wallPercentage: 0.25 },
                4: { size: 7, wallPercentage: 0.25 },
                5: { size: 8, wallPercentage: 0.25 },
                6: { size: 8, wallPercentage: 0.3 }
            };
        }
        
        // Ajuste adicional baseado na proporção da tela
        const aspectRatio = screenWidth / screenHeight;
        
        // Se a tela for muito alta e estreita (proporção menor que 0.6)
        if (aspectRatio < 0.6) {
            // Reduzir ainda mais os tamanhos
            for (let level in this.mazeConfigs) {
                if (this.mazeConfigs[level].size > 6) {
                    this.mazeConfigs[level].size = 6;
                }
            }
        }
        
        // Verificar espaço vertical disponível
        const estimatedHeightNeeded = this.level <= 3 ? 500 : 600; // Altura estimada para o jogo completo
        if (screenHeight < estimatedHeightNeeded) {
            // Reduzir tamanhos para telas com pouca altura
            for (let level in this.mazeConfigs) {
                this.mazeConfigs[level].size = Math.max(4, this.mazeConfigs[level].size - 1);
            }
        }
    }
    
    initializeGame() {
        // Obter configuração do nível atual
        const config = this.mazeConfigs[this.level] || this.mazeConfigs[1];
        this.mazeSize = config.size;
        this.wallPercentage = config.wallPercentage;
        
        // Atualizar o nível na interface
        this.levelElement.textContent = this.level;
        
        // Resetar contagem de movimentos
        this.moves = 0;
        this.movesElement.textContent = this.moves;
        
        // Resetar o estado de conclusão do nível
        this.isLevelComplete = false;
        this.nextLevelButton.disabled = true;
        
        // Criar o labirinto
        this.createMaze();
        
        // Configurar controles
        this.setupKeyboardControls();
    }
    
    setupEventListeners() {
        // Botão de reiniciar
        this.restartButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        // Botão de próximo nível
        this.nextLevelButton.addEventListener('click', () => {
            this.level++;
            if (this.level > Object.keys(this.mazeConfigs).length) {
                alert('Parabéns! Você completou todos os níveis do jogo!');
                this.level = 1; // Voltar ao nível 1
            }
            this.initializeGame();
        });
        
        // Botões de direção - melhorados para toque
        this.setupDirectionButtons();
    }
    
    setupDirectionButtons() {
        // Remover listeners antigos (se houver)
        const buttons = [this.upButton, this.rightButton, this.downButton, this.leftButton];
        const directions = ['up', 'right', 'down', 'left'];
        
        buttons.forEach((button, index) => {
            // Limpar eventos antigos
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Atualizar referência
            this[`${directions[index]}Button`] = newButton;
            
            // Adicionar novos eventos otimizados para toque
            const direction = directions[index];
            
            // Eventos de mouse
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMove(direction);
            });
            
            // Eventos de toque com feedback visual
            newButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newButton.style.transform = 'scale(0.95)';
                newButton.style.backgroundColor = '#1a60b2';
            });
            
            newButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                newButton.style.transform = '';
                newButton.style.backgroundColor = '';
                this.handleMove(direction);
            });
            
            // Cancelar o movimento se o dedo sair do botão
            newButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                newButton.style.transform = '';
                newButton.style.backgroundColor = '';
            });
        });
    }
    
    setupKeyboardControls() {
        // Remover event listener existente, se houver
        if (this.keydownListener) {
            document.removeEventListener('keydown', this.keydownListener);
        }
        
        // Adicionar novo event listener
        this.keydownListener = (e) => {
            // Verificar se o nível já foi concluído
            if (this.isLevelComplete) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.handleMove('up');
                    e.preventDefault(); // Prevenir rolagem da página
                    break;
                case 'ArrowRight':
                    this.handleMove('right');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.handleMove('down');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.handleMove('left');
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keydownListener);
    }
    
    handleMove(direction) {
        // Verificar se o nível já foi concluído
        if (this.isLevelComplete) return;
        
        // Calcular nova posição
        const dir = this.directions[direction];
        const newX = this.playerPosition.x + dir.x;
        const newY = this.playerPosition.y + dir.y;
        
        // Verificar se a nova posição está dentro dos limites do labirinto
        if (newX >= 0 && newX < this.mazeSize && newY >= 0 && newY < this.mazeSize) {
            this.movePlayer(newX, newY);
        }
    }
    
    createMaze() {
        // Limpar o labirinto existente
        this.maze.innerHTML = '';
        
        // Configurar o grid conforme o tamanho do labirinto
        this.maze.style.gridTemplateColumns = `repeat(${this.mazeSize}, 1fr)`;
        this.maze.style.gridTemplateRows = `repeat(${this.mazeSize}, 1fr)`;
        
        // Garantir proporção quadrada
        this.maze.style.aspectRatio = '1 / 1';
        
        // Ajustar tamanho baseado na tela
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 280) {
            // Para dispositivos extremamente pequenos
            this.maze.style.width = '95vw';
            this.maze.style.maxWidth = '95vw';
            this.maze.style.maxHeight = '95vw';
        }
        else if (screenWidth < 320) {
            // Para dispositivos muito pequenos
            this.maze.style.width = '90vmin';
            this.maze.style.maxWidth = '90vmin';
            this.maze.style.maxHeight = '90vmin';
        }
        else if (screenWidth < 400) {
            // Para dispositivos pequenos
            this.maze.style.width = '85vmin';
            this.maze.style.maxWidth = '85vmin';
            this.maze.style.maxHeight = '85vmin';
        }
        else {
            // Para dispositivos maiores, usar vmin para manter quadrado
            this.maze.style.width = '90vmin';
            this.maze.style.maxWidth = '500px';
            this.maze.style.maxHeight = '500px';
        }
        
        // Criar um array para representar o labirinto
        this.mazeArray = Array(this.mazeSize).fill().map(() => Array(this.mazeSize).fill(0));
        
        // Criar células do labirinto
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                
                // Adicionar efeito para destacar melhor em mobile
                if (this.isMobile) {
                    cell.style.transition = 'all 0.15s ease';
                }
                
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
        
        // Adicionar paredes
        this.addWalls();
        
        // Garantir que exista um caminho válido do início até a saída
        this.ensureValidPath();
    }
    
    addWalls() {
        // Calcular quantas paredes adicionar com base no tamanho do labirinto e na porcentagem
        const totalCells = this.mazeSize * this.mazeSize;
        const numberOfWalls = Math.floor(totalCells * this.wallPercentage);
        
        // Não adicionar paredes na posição inicial e na saída
        const startCell = this.playerPosition.y * this.mazeSize + this.playerPosition.x;
        const exitCell = this.exitPosition.y * this.mazeSize + this.exitPosition.x;
        
        // Adicionar paredes aleatoriamente
        for (let i = 0; i < numberOfWalls; i++) {
            // Gerar posição aleatória
            let cellIndex;
            do {
                cellIndex = Math.floor(Math.random() * totalCells);
            } while (cellIndex === startCell || cellIndex === exitCell || this.maze.children[cellIndex].classList.contains('wall'));
            
            // Adicionar a parede
            this.maze.children[cellIndex].classList.add('wall');
            
            // Atualizar o array do labirinto
            const x = cellIndex % this.mazeSize;
            const y = Math.floor(cellIndex / this.mazeSize);
            this.mazeArray[y][x] = 1; // 1 representa uma parede
        }
    }
    
    ensureValidPath() {
        // Implementar um algoritmo de busca em largura (BFS) para verificar se existe um caminho
        const visited = Array(this.mazeSize).fill().map(() => Array(this.mazeSize).fill(false));
        const queue = [{ x: this.playerPosition.x, y: this.playerPosition.y }];
        visited[this.playerPosition.y][this.playerPosition.x] = true;
        
        let hasPath = false;
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Verificar se chegou à saída
            if (current.x === this.exitPosition.x && current.y === this.exitPosition.y) {
                hasPath = true;
                break;
            }
            
            // Verificar todas as direções possíveis
            for (const dir of Object.values(this.directions)) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                
                // Verificar se a nova posição está dentro dos limites
                if (newX >= 0 && newX < this.mazeSize && newY >= 0 && newY < this.mazeSize) {
                    // Verificar se não é uma parede e ainda não foi visitada
                    if (!this.getCell(newX, newY).classList.contains('wall') && !visited[newY][newX]) {
                        visited[newY][newX] = true;
                        queue.push({ x: newX, y: newY });
                    }
                }
            }
        }
        
        // Se não houver caminho, remover algumas paredes para criar um
        if (!hasPath) {
            this.createPathToExit();
        }
    }
    
    createPathToExit() {
        // Implementar algoritmo simples para garantir um caminho
        // Vamos criar um caminho direto da posição atual até a saída
        let currentX = this.playerPosition.x;
        let currentY = this.playerPosition.y;
        
        // Primeiro, mover horizontalmente até a coluna da saída
        while (currentX < this.exitPosition.x) {
            currentX++;
            // Remover parede, se houver
            const cell = this.getCell(currentX, currentY);
            if (cell.classList.contains('wall')) {
                cell.classList.remove('wall');
                // Atualizar o array
                this.mazeArray[currentY][currentX] = 0;
            }
        }
        
        // Depois, mover verticalmente até a linha da saída
        while (currentY < this.exitPosition.y) {
            currentY++;
            // Remover parede, se houver
            const cell = this.getCell(currentX, currentY);
            if (cell.classList.contains('wall')) {
                cell.classList.remove('wall');
                // Atualizar o array
                this.mazeArray[currentY][currentX] = 0;
            }
        }
    }
    
    getCell(x, y) {
        return this.maze.children[y * this.mazeSize + x];
    }
    
    movePlayer(newX, newY) {
        // Verificar se a nova posição é uma parede
        if (this.getCell(newX, newY).classList.contains('wall')) {
            // Fornecer feedback visual para jogadores em dispositivos móveis
            if (this.isMobile) {
                const playerCell = this.getCell(this.playerPosition.x, this.playerPosition.y);
                playerCell.style.transform = 'scale(0.7)';
                setTimeout(() => {
                    playerCell.style.transform = 'scale(0.8)';
                }, 150);
            }
            return;
        }
        
        // Atualizar a contagem de movimentos
        this.moves++;
        this.movesElement.textContent = this.moves;
        
        // Remover o jogador da posição atual
        this.getCell(this.playerPosition.x, this.playerPosition.y).classList.remove('player');
        
        // Adicionar o jogador na nova posição
        this.playerPosition = { x: newX, y: newY };
        this.getCell(newX, newY).classList.add('player');
        
        // Verificar se o jogador chegou à saída
        if (newX === this.exitPosition.x && newY === this.exitPosition.y) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.isLevelComplete = true;
        this.nextLevelButton.disabled = false;
        
        // Destacar a célula do jogador ao completar o nível
        const playerCell = this.getCell(this.playerPosition.x, this.playerPosition.y);
        playerCell.style.transform = 'scale(1)';
        playerCell.style.transition = 'all 0.3s ease';
        
        // Exibir mensagem após um breve atraso
        setTimeout(() => {
            alert(`Parabéns! Você completou o nível ${this.level} em ${this.moves} movimentos!`);
            this.nextLevelButton.focus();
        }, 300);
    }
    
    resetGame() {
        // Reiniciar o nível atual
        this.initializeGame();
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    // Criar instância do jogo e salvar na window para acesso global
    window.mazeGame = new MazeGame();
    
    // Desativar comportamento de rolagem ao tocar nos botões de direção
    document.querySelectorAll('.arrow-btn').forEach(btn => {
        btn.addEventListener('touchstart', e => e.preventDefault());
        btn.addEventListener('touchmove', e => e.preventDefault());
        btn.addEventListener('touchend', e => e.preventDefault());
    });
    
    // Ajustar tamanho do labirinto ao redimensionar a janela
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reajustar o jogo quando a janela é redimensionada
            if (window.mazeGame) {
                // Recalcular as configurações para o tamanho atual da tela
                window.mazeGame.adjustConfigsForMobile();
                window.mazeGame.resetGame();
            }
        }, 250); // Debounce para evitar muitas chamadas
    });
    
    // Aplicar fixes para iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.webkitTouchCallout = 'none';
        document.documentElement.style.webkitUserSelect = 'none';
        document.documentElement.style.webkitTapHighlightColor = 'transparent';
    }
    
    // Função para verificar se a tela está em orientação retrato ou paisagem
    function checkOrientation() {
        if (window.innerHeight > window.innerWidth) {
            // Modo retrato - verificar se tudo cabe na tela
            const gameContainer = document.querySelector('.game-container');
            const maze = document.getElementById('maze');
            
            // Ajustar tamanho do labirinto se o container estiver sendo cortado
            if (gameContainer.scrollHeight > window.innerHeight) {
                const currentSize = parseInt(getComputedStyle(maze).width);
                maze.style.width = `${currentSize * 0.9}px`;
                maze.style.height = `${currentSize * 0.9}px`;
            }
        }
        
        // Recalcular as configurações adaptadas
        if (window.mazeGame) {
            window.mazeGame.adjustConfigsForMobile();
        }
    }
    
    // Verificar orientação inicialmente e quando mudar
    checkOrientation();
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 300); // Pequeno atraso para garantir que as dimensões atualizaram
    });
    
    // Verificar também quando a tela for redimensionada
    window.addEventListener('resize', () => {
        setTimeout(checkOrientation, 300);
    });
}); 