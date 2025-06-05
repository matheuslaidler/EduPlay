class DiscoverGame {
    constructor() {
        // Elementos do DOM
        this.imageContainer = document.getElementById('imageContainer');
        this.iceGrid = document.getElementById('iceGrid');
        this.progressBar = document.getElementById('progressBar');
        this.levelDisplay = document.getElementById('level');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.newImageButton = document.getElementById('newImageButton');
        
        // Estado do jogo
        this.level = 1;
        this.currentImageIndex = 0;
        this.totalIcePieces = 60; // 10x6 grid
        this.meltedPieces = 0;
        this.requiredMeltPercentage = 1.0; // 100% dos blocos devem ser derretidos
        this.gamePaused = false;
        this.feedbackShown = false;
        
        // Cores de fundo com gradientes para serem revelados
        this.backgroundColors = [
            'linear-gradient(45deg, #FF9800, #F44336)',  // Laranja para vermelho
            'linear-gradient(45deg, #4CAF50, #8BC34A)',  // Verde escuro para verde claro
            'linear-gradient(45deg, #2196F3, #03A9F4)',  // Azul escuro para azul claro
            'linear-gradient(45deg, #9C27B0, #E91E63)',  // Roxo para rosa
            'linear-gradient(45deg, #FFEB3B, #FFC107)',  // Amarelo para âmbar
            'linear-gradient(45deg, #3F51B5, #673AB7)'   // Índigo para roxo
        ];
        
        // Adicionar propriedades para controle do pinguim
        this.character = null;
        this.animationActive = false;
        this.characterPosition = { x: 0, y: 0 };
        this.characterDirection = 1;
        this.currentTarget = null;
        
        // Criar elemento de notificação
        this.notification = document.createElement('div');
        this.notification.className = 'game-notification';
        this.iceGrid.parentElement.appendChild(this.notification);
        
        // Adicionar lista de emojis possíveis
        this.backgroundEmojis = [
            '🌞', '🌈', '🌺', '🦋', '🐬', '🦁', '🦊', '🐘', 
            '🦒', '🦩', '🦜', '🐢', '🐳', '🐠', '🌸', '🍀',
            '🎨', '🎭', '🎪', '🎡', '🎢', '🌴', '🏰', '⭐'
        ];
        
        // Configurações dos níveis
        this.levelConfig = {
            1: { clicksToMelt: 1 },
            2: { clicksToMelt: 1 },
            3: { clicksToMelt: 3 } // Precisa passar 3 vezes para derreter completamente
        };
        
        this.setupGame();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botão de próximo nível
        this.nextLevelButton.addEventListener('click', () => {
            this.level++;
            if (this.level > 3) {
                this.level = 1;
            }
            this.resetGame();
        });

        // Botão de reiniciar
        this.newImageButton.textContent = 'Reiniciar Nível';
        this.newImageButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    // Novo método para garantir reset completo
    resetGame() {
        // Limpar timeouts pendentes
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
        
        // Remover pinguim existente
        if (this.character && this.character.parentNode) {
            this.character.remove();
        }
        
        // Resetar estados
        this.character = null;
        this.animationActive = false;
        this.currentTarget = null;
        
        // Configurar novo jogo
        this.setupGame();
    }
    
    setupGame() {
        this.selectRandomBackground();
        this.createBackgroundEmoji();
        this.createIceGrid();
        this.levelDisplay.textContent = this.level;
        this.meltedPieces = 0;
        this.updateProgressBar();
        this.nextLevelButton.disabled = true;
        this.nextLevelButton.style.animation = 'none';
        this.gamePaused = false;
        this.feedbackShown = false;
        
        // Iniciar nova animação do pinguim
        this.startCharacterAnimation();
    }
    
    selectRandomBackground() {
        const randomIndex = Math.floor(Math.random() * this.backgroundColors.length);
        this.imageContainer.style.background = this.backgroundColors[randomIndex];
    }
    
    createIceGrid() {
        // Limpar a grade existente
        this.iceGrid.innerHTML = '';
        
        // Determinar o número de linhas e colunas baseado no nível
        let rows = 6;
        let cols = 10;
        
        // Aumentar a dificuldade nos níveis mais altos
        if (this.level === 2) {
            rows = 8;
            cols = 10;
        } else if (this.level === 3) {
            rows = 10;
            cols = 12;
        }
        
        this.totalIcePieces = rows * cols;
        
        // Ajustar o layout da grade
        this.iceGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.iceGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Criar peças de gelo
        for (let i = 0; i < this.totalIcePieces; i++) {
            const icePiece = document.createElement('div');
            icePiece.className = 'ice-piece';
            icePiece.dataset.index = i;
            icePiece.dataset.meltCount = '0';
            
            // Calcular posição x, y baseada no índice
            const y = Math.floor(i / cols);
            const x = i % cols;
            icePiece.dataset.x = x;
            icePiece.dataset.y = y;
            
            // Adicionar efeito de gelo real para as peças
            icePiece.style.backgroundColor = 'rgba(184, 229, 250, 0.8)';
            icePiece.style.boxShadow = 'inset 0 0 10px rgba(255, 255, 255, 0.5)';
            icePiece.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            
            // Adicionar evento de mouseover com base no nível
            icePiece.addEventListener('mouseover', () => {
                this.handleIcePieceHover(icePiece);
            });
            
            // Adicionar eventos de toque para dispositivos móveis
            icePiece.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleIcePieceHover(icePiece);
            });
            
            this.iceGrid.appendChild(icePiece);
        }
    }
    
    handleIcePieceHover(icePiece) {
        if (this.gamePaused || icePiece.classList.contains('melted')) return;
        
        // Obter ou inicializar o contador de derretimento
        let meltCount = parseInt(icePiece.dataset.meltCount || '0');
        const requiredMelts = this.levelConfig[this.level].clicksToMelt;
        
        // Incrementar o contador
        meltCount++;
        icePiece.dataset.meltCount = meltCount;
        
        // Ajustar a aparência baseado no progresso de derretimento
        if (this.level === 3) {
            // No nível 3, derreter gradualmente
            const opacity = 1 - (meltCount / requiredMelts) * 0.8;
            icePiece.style.opacity = opacity.toString();
            
            if (meltCount >= requiredMelts) {
                icePiece.style.opacity = '0';
                setTimeout(() => {
                    icePiece.classList.add('melted');
                    this.handleMeltedPiece();
                }, 200);
            }
        } else {
            // Nos níveis 1 e 2, derreter imediatamente
            icePiece.style.opacity = '0';
            setTimeout(() => {
                icePiece.classList.add('melted');
                this.handleMeltedPiece();
            }, 200);
        }
    }
    
    startCharacterAnimation() {
        if (this.animationActive) {
            this.stopCharacterAnimation();
        }
        
        // Remover pinguim anterior se existir
        if (this.character && this.character.parentNode) {
            this.character.remove();
        }
        
        this.animationActive = true;
        
        // Criar o pinguim com estilo atualizado
        this.character = document.createElement('div');
        this.character.className = 'character';
        this.character.style.cssText = `
            position: absolute;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            z-index: 1000;
            transition: all 0.15s linear;
            pointer-events: none;
            transform-origin: center;
            font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
        `;
        
        // Usar código Unicode direto para o pinguim
        this.character.innerHTML = '&#x1F427;'; // Código Unicode para 🐧
        
        this.iceGrid.appendChild(this.character);
        
        // Posição inicial no centro
        const rows = parseInt(this.iceGrid.style.gridTemplateRows.split(' ').length);
        const cols = parseInt(this.iceGrid.style.gridTemplateColumns.split(' ').length);
        
        this.characterPosition = {
            x: Math.floor(cols / 2),
            y: Math.floor(rows / 2)
        };
        
        // Posicionar inicialmente o pinguim
        this.updateCharacterPosition();
        
        // Iniciar movimento imediatamente
        this.moveCharacterSmoothly();
    }
    
    updateCharacterPosition() {
        if (!this.character) return;
        
        const cellWidth = this.iceGrid.clientWidth / parseInt(this.iceGrid.style.gridTemplateColumns.split(' ').length);
        const cellHeight = this.iceGrid.clientHeight / parseInt(this.iceGrid.style.gridTemplateRows.split(' ').length);
        
        const x = this.characterPosition.x * cellWidth + (cellWidth / 2);
        const y = this.characterPosition.y * cellHeight + (cellHeight / 2);
        
        this.character.style.left = `${x}px`;
        this.character.style.top = `${y}px`;
        this.character.style.transform = `translate(-50%, -50%) ${this.characterDirection < 0 ? 'scaleX(-1)' : ''}`;
    }
    
    moveCharacterSmoothly() {
        if (!this.animationActive || !this.character) return;
        
        const rows = parseInt(this.iceGrid.style.gridTemplateRows.split(' ').length);
        const cols = parseInt(this.iceGrid.style.gridTemplateColumns.split(' ').length);
        
        // Encontrar células com gelo
        const iceCells = [];
        const children = Array.from(this.iceGrid.children).filter(child => !child.classList.contains('character'));
        
        children.forEach((cell, index) => {
            if (!cell.classList.contains('melted')) {
                const y = Math.floor(index / cols);
                const x = index % cols;
                iceCells.push({ x, y, cell });
            }
        });
        
        if (iceCells.length === 0) {
            this.stopCharacterAnimation();
            return;
        }
        
        // Escolher novo alvo se necessário
        if (!this.currentTarget || 
            (this.characterPosition.x === this.currentTarget.x && 
             this.characterPosition.y === this.currentTarget.y)) {
            this.currentTarget = iceCells[Math.floor(Math.random() * iceCells.length)];
        }
        
        // Calcular próximo movimento
        let nextX = this.characterPosition.x;
        let nextY = this.characterPosition.y;
        
        // Mover em direção ao alvo
        if (this.currentTarget) {
            if (Math.random() < 0.7) { // 70% chance de mover em direção ao alvo
                if (Math.abs(this.currentTarget.x - nextX) > Math.abs(this.currentTarget.y - nextY)) {
                    if (this.currentTarget.x > nextX) {
                        nextX++;
                        this.characterDirection = 1;
                    } else {
                        nextX--;
                        this.characterDirection = -1;
                    }
                } else {
                    if (this.currentTarget.y > nextY) {
                        nextY++;
                    } else {
                        nextY--;
                    }
                }
            } else { // 30% chance de movimento aleatório
                const randomDir = Math.floor(Math.random() * 4);
                switch (randomDir) {
                    case 0: nextX++; this.characterDirection = 1; break;
                    case 1: nextX--; this.characterDirection = -1; break;
                    case 2: nextY++; break;
                    case 3: nextY--; break;
                }
            }
        }
        
        // Manter dentro dos limites
        nextX = Math.max(0, Math.min(nextX, cols - 1));
        nextY = Math.max(0, Math.min(nextY, rows - 1));
        
        // Atualizar posição
        this.characterPosition.x = nextX;
        this.characterPosition.y = nextY;
        
        // Atualizar visual do pinguim
        const cellWidth = this.iceGrid.clientWidth / cols;
        const cellHeight = this.iceGrid.clientHeight / rows;
        
        if (this.character) {
            const x = nextX * cellWidth + (cellWidth / 2);
            const y = nextY * cellHeight + (cellHeight / 2);
            
            this.character.style.left = `${x}px`;
            this.character.style.top = `${y}px`;
            this.character.style.transform = `translate(-50%, -50%) ${this.characterDirection < 0 ? 'scaleX(-1)' : ''}`;
            this.character.style.opacity = '1';
        }
        
        // Derreter gelo
        const currentCellIndex = nextY * cols + nextX;
        const currentCell = children[currentCellIndex];
        if (currentCell && !currentCell.classList.contains('melted')) {
            this.handleIcePieceHover(currentCell);
        }
        
        // Continuar movimento
        this.animationTimeout = setTimeout(() => this.moveCharacterSmoothly(), 120);
    }
    
    stopCharacterAnimation() {
        this.animationActive = false;
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
        if (this.character) {
            this.character.style.opacity = '0';
            setTimeout(() => {
                if (this.character && this.character.parentNode) {
                    this.character.remove();
                }
            }, 300);
        }
    }
    
    handleMeltedPiece() {
        if (this.gamePaused) return;
        
        this.meltedPieces++;
        this.updateProgressBar();
        
        // Verificar se TODOS os blocos foram derretidos
        const allPieces = Array.from(this.iceGrid.children);
        const meltedPieces = allPieces.filter(piece => piece.classList.contains('melted')).length;
        
        if (meltedPieces === this.totalIcePieces && !this.feedbackShown) {
            // Permitir avançar para o próximo nível
            this.nextLevelButton.disabled = false;
            
            // Mostrar efeito visual de conclusão de nível
            this.feedbackShown = true;
            
            // Parar a animação do pinguim
            this.stopCharacterAnimation();
            
            // Mostrar celebração
            this.showCelebration();
        }
    }
    
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `game-notification ${type}`;
        this.notification.style.display = 'block';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
    
    updateProgressBar() {
        const percentComplete = (this.meltedPieces / this.totalIcePieces) * 100;
        this.progressBar.style.width = `${percentComplete}%`;
    }
    
    // Adicionar novo método para mostrar celebração
    showCelebration() {
        // Criar elemento de celebração
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.style.position = 'absolute';
        celebration.style.top = '50%';
        celebration.style.left = '50%';
        celebration.style.transform = 'translate(-50%, -50%)';
        celebration.style.fontSize = '5rem';
        celebration.style.zIndex = '1000';
        celebration.innerHTML = '🎉';
        celebration.style.animation = 'celebrate 1.5s ease-out';
        
        // Adicionar estilos de animação se ainda não existirem
        if (!document.querySelector('#celebration-style')) {
            const style = document.createElement('style');
            style.id = 'celebration-style';
            style.textContent = `
                @keyframes celebrate {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Adicionar ao container
        this.imageContainer.appendChild(celebration);
        
        // Fazer o botão de próximo nível pulsar
        this.nextLevelButton.style.animation = 'pulse 1s infinite';
        
        // Remover após a animação
        setTimeout(() => {
            celebration.remove();
        }, 1500);
    }
    
    createBackgroundEmoji() {
        const oldEmoji = this.imageContainer.querySelector('.background-emoji');
        if (oldEmoji) oldEmoji.remove();
        
        const emoji = document.createElement('div');
        emoji.className = 'background-emoji';
        emoji.textContent = this.backgroundEmojis[Math.floor(Math.random() * this.backgroundEmojis.length)];
        this.imageContainer.appendChild(emoji);
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new DiscoverGame();
}); 