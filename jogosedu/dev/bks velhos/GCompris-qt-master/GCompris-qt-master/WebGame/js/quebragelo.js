class IceBreakerGame {
    constructor() {
        // Elementos do DOM
        this.imageContainer = document.getElementById('imageContainer');
        this.iceLayer = document.getElementById('iceLayer');
        this.progressBar = document.getElementById('progressBar');
        this.levelDisplay = document.getElementById('level');
        this.clicksDisplay = document.getElementById('clicks');
        this.maxClicksDisplay = document.getElementById('maxClicks');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.resetButton = document.getElementById('resetButton');
        
        // Estado do jogo
        this.level = 1;
        this.clicks = 0;
        this.brokenBlocks = 0;
        this.totalBlocks = 0;
        this.requiredClearPercentage = 0.75; // 75% da imagem deve ser revelada para avançar
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
        
        // Configurações dos níveis - corrigidas para maior facilidade
        this.levelConfig = {
            1: {
                rows: 5,
                cols: 6,
                clicksToBreak: 1,
                maxClicks: 50
            },
            2: {
                rows: 6,
                cols: 8,
                clicksToBreak: 1,
                maxClicks: 70
            },
            3: {
                rows: 8,
                cols: 10,
                clicksToBreak: 2, // Mantido em 2 cliques como solicitado
                maxClicks: 200    // Aumentado para 200 cliques
            }
        };
        
        // Inicializar animação do pinguim
        this.animationActive = false;
        this.characterPosition = { x: 0, y: 0 };
        this.characterDirection = 1; // 1 = direita, -1 = esquerda
        
        this.setupGame();
        this.setupEventListeners();
    }
    
    setupGame() {
        // Obter configuração do nível atual
        const config = this.levelConfig[this.level] || this.levelConfig[1];
        
        // Resetar o estado
        this.clicks = 0;
        this.brokenBlocks = 0;
        this.totalBlocks = config.rows * config.cols;
        this.gamePaused = false;
        this.feedbackShown = false;
        
        // Atualizar displays
        this.levelDisplay.textContent = this.level;
        this.clicksDisplay.textContent = this.clicks;
        this.maxClicksDisplay.textContent = config.maxClicks;
        this.updateProgressBar();
        
        // Desabilitar botão de próximo nível
        this.nextLevelButton.disabled = true;
        this.nextLevelButton.style.animation = 'none';
        
        // Selecionar imagem aleatória (agora um gradiente colorido)
        this.selectRandomBackground();
        
        // Criar camada de gelo
        this.createIceLayer(config);
        
        // Iniciar animação de pinguim
        this.startCharacterAnimation();
    }
    
    setupEventListeners() {
        // Botão de próximo nível
        this.nextLevelButton.addEventListener('click', () => {
            this.level++;
            if (this.level > Object.keys(this.levelConfig).length) {
                this.level = 1;
            }
            // Remover o efeito de animação do botão
            this.nextLevelButton.style.animation = 'none';
            this.setupGame();
        });
        
        // Botão de reset (Nova Imagem)
        this.resetButton.addEventListener('click', () => {
            // Manter o mesmo nível, mas selecionar uma nova imagem e resetar o jogo
            this.setupGame();
        });
    }
    
    selectRandomBackground() {
        // Escolher um gradiente aleatório como fundo
        const colorIndex = Math.floor(Math.random() * this.backgroundColors.length);
        this.imageContainer.style.backgroundImage = 'none';
        this.imageContainer.style.background = this.backgroundColors[colorIndex];
    }
    
    createIceLayer(config) {
        // Limpar a camada de gelo existente
        this.iceLayer.innerHTML = '';
        
        // Definir o layout da grade
        this.iceLayer.style.display = 'grid';
        this.iceLayer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        this.iceLayer.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
        
        // Criar blocos de gelo
        for (let i = 0; i < this.totalBlocks; i++) {
            const iceBlock = document.createElement('div');
            iceBlock.className = 'ice-block';
            iceBlock.dataset.clicks = 0; // Contador de cliques
            iceBlock.dataset.required = config.clicksToBreak; // Cliques necessários para quebrar
            
            // Adicionar estilo de gelo mais evidente
            iceBlock.style.backgroundColor = 'rgba(184, 229, 250, 0.9)';
            iceBlock.style.boxShadow = 'inset 0 0 5px rgba(255, 255, 255, 0.5)';
            iceBlock.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            
            // Adicionar efeito de gelo com rachaduras
            if (config.clicksToBreak > 1) {
                iceBlock.style.backgroundImage = 'radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(184, 229, 250, 0) 60%)';
            }
            
            // Adicionar evento de clique
            iceBlock.addEventListener('click', () => {
                if (!this.gamePaused) {
                    this.handleBlockClick(iceBlock, config);
                }
            });
            
            this.iceLayer.appendChild(iceBlock);
        }
        
        // Adicionar o pinguim (apenas um para todo o jogo)
        this.addPenguinCharacter();
    }
    
    startCharacterAnimation() {
        // Parar animação anterior, se existir
        if (this.animationActive) {
            this.stopCharacterAnimation();
        }
        
        this.animationActive = true;
        this.characterPosition = { x: 0, y: 0 };
        this.characterDirection = 1; // Começa movendo para a direita
        
        // Começar movimento fluido
        this.moveCharacterSmoothly();
    }
    
    addPenguinCharacter() {
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
        
        this.iceLayer.appendChild(this.character);
    }
    
    moveCharacterSmoothly() {
        if (!this.animationActive) return;
        
        // Obter configuração do nível atual
        const config = this.levelConfig[this.level] || this.levelConfig[1];
        const rows = config.rows;
        const cols = config.cols;
        
        // Lista para armazenar todas as células com gelo
        const iceCells = [];
        
        // Encontrar todas as células com gelo
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cellIndex = y * cols + x;
                if (cellIndex < this.iceLayer.children.length) {
                    const cell = this.iceLayer.children[cellIndex];
                    if (cell && !cell.classList.contains('broken')) {
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
        
        // Calcular próxima posição
        let nextX = this.characterPosition.x;
        let nextY = this.characterPosition.y;
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
                if (cellIndex < this.iceLayer.children.length) {
                    const cell = this.iceLayer.children[cellIndex];
                    if (cell && !cell.classList.contains('broken')) {
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
        if (cellIndex < this.iceLayer.children.length) {
            const cell = this.iceLayer.children[cellIndex];
            
            // Posicionar o pinguim
            this.character.style.gridColumn = (nextX + 1).toString();
            this.character.style.gridRow = (nextY + 1).toString();
            this.character.style.left = '50%';
            this.character.style.top = '50%';
            
            // Virar o pinguim de acordo com a direção
            if (this.characterDirection < 0) {
                this.character.style.transform = 'translate(-50%, -50%) scaleX(-1)';
            } else {
                this.character.style.transform = 'translate(-50%, -50%)';
            }
            
            // Apenas mostrar o pinguim se ainda houver gelo
            if (cell && !cell.classList.contains('broken')) {
                this.character.style.opacity = '1';
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
    
    handleBlockClick(block, config) {
        // Verificar se já atingiu o limite de cliques
        if (this.clicks >= config.maxClicks) {
            if (!this.feedbackShown) {
                this.feedbackShown = true;
                
                // Verificar se revelou o suficiente da imagem
                const percentComplete = this.brokenBlocks / this.totalBlocks;
                if (percentComplete >= this.requiredClearPercentage) {
                    // Mostrar efeito visual de sucesso
                    this.showCompletionEffect(true);
                    // Habilitar próximo nível
                    this.nextLevelButton.disabled = false;
                } else {
                    // Mostrar efeito visual de falha
                    this.showFailureEffect();
                }
            }
            return;
        }
        
        // Verificar se o bloco já está quebrado
        if (block.classList.contains('broken')) {
            return;
        }
        
        // Adicionar efeito visual de clique
        block.classList.add('clicked');
        setTimeout(() => {
            block.classList.remove('clicked');
        }, 200);
        
        // Incrementar contador de cliques
        this.clicks++;
        this.clicksDisplay.textContent = this.clicks;
        
        // Incrementar contador de cliques do bloco
        const currentClicks = parseInt(block.dataset.clicks) + 1;
        block.dataset.clicks = currentClicks;
        
        // Verificar se o bloco deve quebrar
        if (currentClicks >= config.clicksToBreak) {
            this.breakBlock(block);
        } else {
            // Atualizar aparência do bloco para mostrar progresso
            this.showCrackEffect(block, currentClicks, config.clicksToBreak);
        }
        
        // Verificar se o jogo acabou (sem mais cliques disponíveis)
        if (this.clicks >= config.maxClicks && !this.feedbackShown) {
            this.feedbackShown = true;
            
            // Verificar se revelou o suficiente da imagem
            const percentComplete = this.brokenBlocks / this.totalBlocks;
            if (percentComplete >= this.requiredClearPercentage) {
                // Mostrar efeito visual de sucesso
                this.showCompletionEffect(true);
                // Habilitar próximo nível
                this.nextLevelButton.disabled = false;
            } else {
                // Mostrar efeito visual de falha
                this.showFailureEffect();
            }
        }
    }
    
    showCrackEffect(block, currentClicks, totalClicks) {
        // Calcular a opacidade baseada nos cliques
        const opacity = 0.9 - (currentClicks / totalClicks) * 0.4;
        block.style.opacity = opacity;
        
        // Adicionar rachadura visual dependendo da quantidade de cliques
        block.classList.add('breaking');
        
        // Criar diferentes níveis de rachaduras
        if (totalClicks > 1) {
            let crackLevel = Math.ceil((currentClicks / totalClicks) * 3);
            
            switch (crackLevel) {
                case 1:
                    block.style.backgroundImage = 'radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(184, 229, 250, 0) 40%)';
                    break;
                case 2:
                    block.style.backgroundImage = 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(184, 229, 250, 0) 60%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, rgba(184, 229, 250, 0) 30%)';
                    break;
                case 3:
                    block.style.backgroundImage = 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(184, 229, 250, 0) 70%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(184, 229, 250, 0) 40%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, rgba(184, 229, 250, 0) 30%)';
                    break;
            }
            
            // Adicionar som de rachadura (opcional)
            this.playCrackSound();
        }
    }
    
    playCrackSound() {
        // Função para tocar som de rachadura (se implementado)
        // Poderia implementar com Web Audio API
    }
    
    breakBlock(block) {
        // Marcar o bloco como quebrado
        block.classList.add('broken');
        block.style.opacity = '0';
        block.style.backgroundColor = 'rgba(184, 229, 250, 0)';
        block.style.boxShadow = 'none';
        block.style.border = 'none';
        
        // Adicionar efeito de quebra
        const breakEffect = document.createElement('div');
        breakEffect.className = 'break-effect';
        breakEffect.style.position = 'absolute';
        breakEffect.style.width = '100%';
        breakEffect.style.height = '100%';
        breakEffect.style.backgroundImage = 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)';
        breakEffect.style.animation = 'break-anim 0.3s ease-out forwards';
        
        // Adicionar o efeito ao bloco
        block.appendChild(breakEffect);
        
        // Remover o efeito após a animação
        setTimeout(() => {
            if (breakEffect.parentNode) {
                breakEffect.parentNode.removeChild(breakEffect);
            }
        }, 300);
        
        // Incrementar contador de blocos quebrados
        this.brokenBlocks++;
        
        // Atualizar barra de progresso
        this.updateProgressBar();
        
        // Verificar se revelou o suficiente da imagem
        const percentComplete = this.brokenBlocks / this.totalBlocks;
        if (percentComplete >= this.requiredClearPercentage && !this.feedbackShown) {
            // Permitir avançar para o próximo nível
            this.nextLevelButton.disabled = false;
            
            // Mostrar efeito visual de conclusão de nível
            if (!this.feedbackShown && this.clicks < this.levelConfig[this.level].maxClicks) {
                this.feedbackShown = true;
                this.showCompletionEffect(false);
                
                // Parar a animação do pinguim
                this.stopCharacterAnimation();
            }
        }
    }
    
    showCompletionEffect(usedAllClicks) {
        // Parar a animação do pinguim quando completar o nível
        this.stopCharacterAnimation();
        
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
        
        // Adicionar estilos de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebrate {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
            
            @keyframes break-anim {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        this.imageContainer.appendChild(celebration);
        
        // Fazer o botão de próximo nível pulsar
        this.nextLevelButton.style.animation = 'pulse 1s infinite';
        
        // Remover os elementos após a animação
        setTimeout(() => {
            celebration.remove();
        }, 1500);
    }
    
    showFailureEffect() {
        // Criar um elemento para o efeito de falha
        const failureEffect = document.createElement('div');
        failureEffect.className = 'failure-effect';
        failureEffect.style.position = 'absolute';
        failureEffect.style.top = '50%';
        failureEffect.style.left = '50%';
        failureEffect.style.transform = 'translate(-50%, -50%)';
        failureEffect.style.fontSize = '5rem';
        failureEffect.style.zIndex = '1000';
        failureEffect.innerHTML = '❌';
        failureEffect.style.animation = 'failure 1.5s ease-out';
        
        // Adicionar estilo para a animação
        const style = document.createElement('style');
        if (!document.querySelector('style#game-animations')) {
            style.id = 'game-animations';
            style.textContent += `
                @keyframes failure {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.imageContainer.appendChild(failureEffect);
        
        // Fazer o botão de reset (nova imagem) pulsar
        this.resetButton.style.animation = 'pulse 1s infinite';
        
        // Remover o efeito após a animação
        setTimeout(() => {
            failureEffect.remove();
        }, 1500);
    }
    
    updateProgressBar() {
        const percentComplete = (this.brokenBlocks / this.totalBlocks) * 100;
        this.progressBar.style.width = `${percentComplete}%`;
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new IceBreakerGame();
}); 