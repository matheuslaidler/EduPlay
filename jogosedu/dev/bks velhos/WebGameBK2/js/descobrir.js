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
        
        // Inicializar a animação
        this.animationActive = false;
        this.characterPosition = { x: 0, y: 0 };
        this.characterDirection = 1; // 1 = direita, -1 = esquerda
        this.movingVertically = false; // Controla se move vertical ou horizontalmente
        this.visitedCells = new Set(); // Rastrear células já visitadas
        
        // Criar elemento de notificação
        this.notification = document.createElement('div');
        this.notification.className = 'game-notification';
        this.iceGrid.parentElement.appendChild(this.notification);
        
        this.setupGame();
        this.setupEventListeners();
    }
    
    setupGame() {
        // Selecionar um fundo colorido aleatório
        this.selectRandomBackground();
        
        // Criar a grade de gelo
        this.createIceGrid();
        
        // Atualizar exibição do nível
        this.levelDisplay.textContent = this.level;
        
        // Resetar o progresso
        this.meltedPieces = 0;
        this.updateProgressBar();
        
        // Desabilitar o botão de próximo nível
        this.nextLevelButton.disabled = true;
        this.nextLevelButton.style.animation = 'none';
        
        // Resetar estados
        this.gamePaused = false;
        this.feedbackShown = false;
        this.visitedCells = new Set();
        
        // Iniciar animação de personagem para todos os níveis
        this.startCharacterAnimation();
    }
    
    setupEventListeners() {
        // Botão de próximo nível
        this.nextLevelButton.addEventListener('click', () => {
            this.level++;
            if (this.level > 3) { // Limitar a 3 níveis
                this.level = 1; // Voltar ao nível 1
            }
            this.setupGame();
            
            // Remover o efeito de animação do botão após clique
            this.nextLevelButton.style.animation = 'none';
        });
        
        // Botão de nova imagem
        this.newImageButton.addEventListener('click', () => {
            this.selectRandomBackground();
            this.createIceGrid();
            this.meltedPieces = 0;
            this.updateProgressBar();
            this.nextLevelButton.disabled = true;
            this.feedbackShown = false;
            this.gamePaused = false;
            this.visitedCells = new Set();
            
            // Reiniciar animação para níveis iniciantes
            this.startCharacterAnimation();
        });
    }
    
    selectRandomBackground() {
        // Escolher um gradiente aleatório
        const colorIndex = Math.floor(Math.random() * this.backgroundColors.length);
        this.imageContainer.style.backgroundImage = 'none';
        this.imageContainer.style.background = this.backgroundColors[colorIndex];
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
            icePiece.dataset.index = i; // Adicionar índice para identificação
            
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
        
        // Todos os níveis derretem rápido agora
        if (this.level <= 3) {
            // Derrete rápido em todos os níveis
            icePiece.style.opacity = '0';
            icePiece.style.backgroundColor = 'rgba(184, 229, 250, 0)';
            setTimeout(() => {
                icePiece.classList.add('melted');
                this.handleMeltedPiece();
            }, 200);
        } else {
            // Para níveis mais altos (se houver), manter uma dificuldade um pouco maior
            let opacity = 0.8;
            const fadeInterval = setInterval(() => {
                if (this.gamePaused) {
                    clearInterval(fadeInterval);
                    return;
                }
                
                opacity -= 0.2;
                icePiece.style.opacity = opacity;
                
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    icePiece.classList.add('melted');
                    this.handleMeltedPiece();
                }
            }, 150);
            
            // Se mover o mouse para fora, o gelo volta
            icePiece.addEventListener('mouseout', () => {
                if (!icePiece.classList.contains('melted')) {
                    clearInterval(fadeInterval);
                    icePiece.style.opacity = '1';
                    icePiece.style.backgroundColor = 'rgba(184, 229, 250, 0.8)';
                }
            }, { once: true });
        }
    }
    
    startCharacterAnimation() {
        // Parar animação anterior, se existir
        if (this.animationActive) {
            this.stopCharacterAnimation();
        }
        
        this.animationActive = true;
        this.characterPosition = { x: 0, y: 0 };
        this.characterDirection = 1; // Começa movendo para a direita
        this.movingVertically = false;
        this.visitedCells = new Set();
        
        // Criar o personagem animado
        this.character = document.createElement('div');
        this.character.className = 'character';
        this.character.style.position = 'absolute';
        this.character.style.width = '30px';
        this.character.style.height = '30px';
        this.character.style.backgroundColor = 'transparent';
        this.character.style.borderRadius = '50%';
        this.character.style.zIndex = '200';
        this.character.style.transition = 'all 0.3s linear'; // Movimento mais suave
        this.character.innerHTML = '🐧'; // Pinguim
        this.character.style.display = 'flex';
        this.character.style.alignItems = 'center';
        this.character.style.justifyContent = 'center';
        this.character.style.fontSize = '24px';
        this.character.style.pointerEvents = 'none'; // Não bloqueia eventos
        
        this.iceGrid.appendChild(this.character);
        
        // Iniciar movimento fluido
        this.moveCharacterSmoothly();
    }
    
    moveCharacterSmoothly() {
        if (!this.animationActive) return;
        
        // Obter dimensões da grade
        const rows = parseInt(this.iceGrid.style.gridTemplateRows.split(' ').length);
        const cols = parseInt(this.iceGrid.style.gridTemplateColumns.split(' ').length);
        
        // Calcular próxima posição (movimento fluido lado a lado)
        let nextX = this.characterPosition.x;
        let nextY = this.characterPosition.y;
        
        // Lista para armazenar todas as células com gelo
        const iceCells = [];
        
        // Encontrar todas as células com gelo
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cellIndex = y * cols + x;
                if (cellIndex < this.iceGrid.children.length) {
                    const cell = this.iceGrid.children[cellIndex];
                    if (cell && !cell.classList.contains('melted')) {
                        iceCells.push({ x, y, cell });
                    }
                }
            }
        }
        
        // Se não há mais células com gelo, ocultar o pinguim e sair
        if (iceCells.length === 0) {
            if (this.character) {
                this.character.style.opacity = '0';
            }
            this.animationTimeout = setTimeout(() => this.moveCharacterSmoothly(), 400);
            return;
        }
        
        // Tentar mover para célula adjacente com gelo
        let foundNextCell = false;
        
        // Direções possíveis (priorizando movimento horizontal)
        const directions = [
            { dx: this.characterDirection, dy: 0 }, // atual direção horizontal 
            { dx: 0, dy: 1 },                      // baixo
            { dx: -this.characterDirection, dy: 0 }, // inverter direção horizontal
            { dx: 0, dy: -1 }                      // cima
        ];
        
        // Tentar cada direção até encontrar uma célula com gelo
        for (const dir of directions) {
            const testX = this.characterPosition.x + dir.dx;
            const testY = this.characterPosition.y + dir.dy;
            
            // Verificar se está dentro dos limites
            if (testX >= 0 && testX < cols && testY >= 0 && testY < rows) {
                const cellIndex = testY * cols + testX;
                if (cellIndex < this.iceGrid.children.length) {
                    const cell = this.iceGrid.children[cellIndex];
                    if (cell && !cell.classList.contains('melted')) {
                        nextX = testX;
                        nextY = testY;
                        foundNextCell = true;
                        
                        // Se mudou a direção horizontal, atualizar
                        if (dir.dx !== 0) {
                            this.characterDirection = dir.dx;
                        }
                        
                        break;
                    }
                }
            }
        }
        
        // Se não encontrou células adjacentes, teleportar para uma célula com gelo
        if (!foundNextCell && iceCells.length > 0) {
            const randomCell = iceCells[Math.floor(Math.random() * iceCells.length)];
            nextX = randomCell.x;
            nextY = randomCell.y;
        }
        
        // Atualizar posição
        this.characterPosition = { x: nextX, y: nextY };
        
        // Obter a célula atual
        const cellIndex = nextY * cols + nextX;
        if (cellIndex < this.iceGrid.children.length) {
            const cell = this.iceGrid.children[cellIndex];
            
            // Posicionar o pinguim
            this.character.style.gridColumn = (nextX + 1).toString();
            this.character.style.gridRow = (nextY + 1).toString();
            this.character.style.left = '50%';
            this.character.style.top = '50%';
            this.character.style.transform = 'translate(-50%, -50%)';
            
            // Virar o pinguim de acordo com a direção
            if (this.characterDirection < 0) {
                this.character.style.transform = 'translate(-50%, -50%) scaleX(-1)';
            } else {
                this.character.style.transform = 'translate(-50%, -50%)';
            }
            
            // Apenas mostrar o pinguim se ainda houver gelo
            if (cell && !cell.classList.contains('melted')) {
                this.character.style.opacity = '1';
                
                // Simular evento de mouseover na célula
                setTimeout(() => {
                    if (cell && !cell.classList.contains('melted')) {
                        this.handleIcePieceHover(cell);
                    }
                }, 100);
            } else {
                // Ocultar o pinguim onde não há gelo
                this.character.style.opacity = '0';
            }
        }
        
        // Agendar próximo movimento
        this.animationTimeout = setTimeout(() => this.moveCharacterSmoothly(), 400);
    }
    
    stopCharacterAnimation() {
        this.animationActive = false;
        clearTimeout(this.animationTimeout);
        if (this.character && this.character.parentNode) {
            this.character.parentNode.removeChild(this.character);
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
            this.showNotification('Parabéns! Você completou o jogo! 🎉', 'success');
            
            // Parar a animação do pinguim
            this.stopCharacterAnimation();
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
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new DiscoverGame();
}); 