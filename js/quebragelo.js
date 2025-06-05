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
        this.gamePaused = false;
        this.feedbackShown = false;
        
        // Configurações dos níveis
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
                clicksToBreak: 2,
                maxClicks: 200
            }
        };

        // Configuração do personagem (pinguim)
        this.character = document.createElement('div');
        this.character.className = 'character';
        this.character.innerHTML = '🐧';
        this.character.style.position = 'absolute';
        this.character.style.fontSize = '2em';
        this.character.style.zIndex = '1000';
        this.character.style.pointerEvents = 'none';
        this.imageContainer.appendChild(this.character);

        // Arrays de cores e emojis para o fundo
        this.backgroundColors = [
            'linear-gradient(45deg, #FF9800, #F44336)',  // Laranja para vermelho
            'linear-gradient(45deg, #4CAF50, #8BC34A)',  // Verde escuro para verde claro
            'linear-gradient(45deg, #2196F3, #03A9F4)',  // Azul escuro para azul claro
            'linear-gradient(45deg, #9C27B0, #E91E63)',  // Roxo para rosa
            'linear-gradient(45deg, #FFEB3B, #FFC107)',  // Amarelo para âmbar
            'linear-gradient(45deg, #3F51B5, #673AB7)'   // Índigo para roxo
        ];

        this.backgroundEmojis = [
            '🌞', '🌈', '🌺', '🦋', '🐬', '🦁', '🦊', '🐘', 
            '🦒', '🦩', '🦜', '🐢', '🐳', '🐠', '🌸', '🍀',
            '🎨', '🎭', '🎪', '🎡', '🎢', '🌴', '🏰', '⭐'
        ];

        this.setupBackground();
        
        this.setupGame();
        this.setupEventListeners();
        this.startCharacterAnimation();
    }

    setupBackground() {
        const randomColorIndex = Math.floor(Math.random() * this.backgroundColors.length);
        const randomEmojiIndex = Math.floor(Math.random() * this.backgroundEmojis.length);
        
        this.imageContainer.style.background = this.backgroundColors[randomColorIndex];
        
        const existingEmoji = this.imageContainer.querySelector('.background-emoji');
        if (existingEmoji) {
            existingEmoji.remove();
        }
        
        const backgroundEmoji = document.createElement('div');
        backgroundEmoji.className = 'background-emoji';
        backgroundEmoji.innerHTML = this.backgroundEmojis[randomEmojiIndex];
        backgroundEmoji.style.position = 'absolute';
        backgroundEmoji.style.fontSize = '15em';
        backgroundEmoji.style.opacity = '0.35';
        backgroundEmoji.style.top = '50%';
        backgroundEmoji.style.left = '50%';
        backgroundEmoji.style.transform = 'translate(-50%, -50%)';
        backgroundEmoji.style.zIndex = '0';
        backgroundEmoji.style.textShadow = `
            2px 2px 4px rgba(0, 0, 0, 0.2),
            -2px -2px 4px rgba(255, 255, 255, 0.2),
            2px -2px 4px rgba(0, 0, 0, 0.2),
            -2px 2px 4px rgba(255, 255, 255, 0.2)
        `;
        backgroundEmoji.style.filter = 'contrast(1.1)';
        
        this.imageContainer.appendChild(backgroundEmoji);
    }
    
    setupEventListeners() {
        this.nextLevelButton.addEventListener('click', () => {
            console.log('Próximo nível clicado');
            this.level++;
            if (this.level > 3) {
                this.level = 1;
            }
            this.resetGame();
        });

        this.resetButton.addEventListener('click', () => {
            console.log('Reset clicado');
            this.resetGame();
        });
    }
    
    startCharacterAnimation() {
        this.animationActive = true;
        this.moveCharacter();
    }

    moveCharacter() {
        if (!this.animationActive) return;

        const containerRect = this.imageContainer.getBoundingClientRect();
        const characterRect = this.character.getBoundingClientRect();
        
        let currentX = parseFloat(this.character.style.left) || 0;
        let currentY = parseFloat(this.character.style.top) || 0;
        
        let newX = Math.random() * (containerRect.width - characterRect.width);
        let newY = Math.random() * (containerRect.height - characterRect.height);
        
        this.character.style.transition = 'left 2s ease, top 2s ease';
        this.character.style.left = `${newX}px`;
        this.character.style.top = `${newY}px`;
        
        if (newX < currentX) {
            this.character.style.transform = 'scaleX(-1)';
        } else {
            this.character.style.transform = 'scaleX(1)';
        }
        
        this.animationTimeout = setTimeout(() => this.moveCharacter(), 2000);
    }

    stopCharacterAnimation() {
        this.animationActive = false;
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
    }
    
    setupGame() {
        const config = this.levelConfig[this.level];
        
        this.clicks = 0;
        this.brokenBlocks = 0;
        this.gamePaused = false;
        this.feedbackShown = false;
        
        this.levelDisplay.textContent = this.level;
        this.clicksDisplay.textContent = this.clicks;
        this.maxClicksDisplay.textContent = config.maxClicks;
        this.updateProgressBar();
        
        this.nextLevelButton.disabled = true;
        this.nextLevelButton.style.opacity = '0.5';
        this.nextLevelButton.style.animation = 'none';
        this.nextLevelButton.style.cursor = 'not-allowed';
        
        this.createIceLayer(config);
    }
    
    createIceLayer(config) {
        this.iceLayer.innerHTML = '';
        this.iceLayer.style.display = 'grid';
        this.iceLayer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        this.iceLayer.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
        
        for (let i = 0; i < config.rows * config.cols; i++) {
            const iceBlock = document.createElement('div');
            iceBlock.className = 'ice-block';
            iceBlock.dataset.clicks = '0';
            iceBlock.dataset.required = config.clicksToBreak;
            
            iceBlock.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            iceBlock.style.backdropFilter = 'blur(8px)';
            iceBlock.style.boxShadow = `
                inset 0 0 10px rgba(255, 255, 255, 0.5),
                0 0 15px rgba(0, 0, 0, 0.2),
                0 0 5px rgba(255, 255, 255, 0.3)
            `;
            iceBlock.style.border = '2px solid rgba(255, 255, 255, 0.5)';
            iceBlock.style.borderRadius = '4px';
            
            const shine = document.createElement('div');
            shine.style.position = 'absolute';
            shine.style.top = '0';
            shine.style.left = '0';
            shine.style.right = '0';
            shine.style.bottom = '0';
            shine.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)';
            shine.style.pointerEvents = 'none';
            iceBlock.appendChild(shine);
            
            iceBlock.addEventListener('click', () => {
                if (!this.gamePaused) {
                    this.handleBlockClick(iceBlock, config);
                }
            });
            
            this.iceLayer.appendChild(iceBlock);
        }
    }
    
    handleBlockClick(block, config) {
        if (block.classList.contains('broken')) return;
        
        this.clicks++;
        this.clicksDisplay.textContent = this.clicks;
        
        const currentClicks = parseInt(block.dataset.clicks) + 1;
        block.dataset.clicks = currentClicks;
        
        if (currentClicks >= config.clicksToBreak) {
            this.breakBlock(block);
        } else {
            if (config.clicksToBreak === 2) {
                if (currentClicks === 1) {
                    block.style.opacity = '0.6';
                    block.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    block.style.backgroundImage = `
                        linear-gradient(135deg, 
                            rgba(255,255,255,0.4) 0%, 
                            rgba(255,255,255,0.2) 100%)
                    `;
                }
            }
        }
        
        if (this.clicks >= config.maxClicks) {
            this.gamePaused = true;
            this.showGameOver();
        }
    }
    
    breakBlock(block) {
        block.classList.add('broken');
        block.style.transition = 'all 0.3s ease-out';
        block.style.opacity = '0';
        block.style.transform = 'scale(0.9)';
        
        this.brokenBlocks++;
        this.updateProgressBar();
        
        const totalBlocks = this.levelConfig[this.level].rows * this.levelConfig[this.level].cols;
        const percentComplete = (this.brokenBlocks / totalBlocks);
        
        if (percentComplete === 1 && !this.feedbackShown) {
            this.nextLevelButton.disabled = false;
            this.nextLevelButton.style.opacity = '1';
            this.nextLevelButton.style.cursor = 'pointer';
            this.feedbackShown = true;
            this.showCompletionEffect();
        }
    }
    
    updateProgressBar() {
        const totalBlocks = this.levelConfig[this.level].rows * this.levelConfig[this.level].cols;
        const percentComplete = (this.brokenBlocks / totalBlocks) * 100;
        this.progressBar.style.width = `${percentComplete}%`;
    }
    
    showGameOver() {
        alert('Game Over! Você usou todos os cliques disponíveis.');
        this.resetGame();
    }
    
    showCompletionEffect() {
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
        
        this.imageContainer.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 1500);
        
        this.nextLevelButton.style.animation = 'pulse 1s infinite';
    }
    
    resetGame() {
        if (this.animationActive) {
            this.stopCharacterAnimation();
        }
        
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        
        this.setupBackground();
        this.setupGame();
        this.startCharacterAnimation();
    }
}

// Inicializar o jogo
window.addEventListener('load', () => {
    new IceBreakerGame();
}); 