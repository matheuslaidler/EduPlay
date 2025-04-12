class NumbersGame {
    constructor() {
        this.numbersContainer = document.getElementById('numbersContainer');
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.checkButton = document.getElementById('checkButton');
        this.restartLevelButton = document.getElementById('restartLevelButton');
        this.restartGameButton = document.getElementById('restartGameButton');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.notification = document.getElementById('gameNotification');
        
        this.level = 1;
        this.score = 0;
        this.isLevelComplete = false;
        this.isMobile = window.innerWidth <= 600;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createNumbers();
    }

    setupEventListeners() {
        this.checkButton.addEventListener('click', () => {
            if (this.isLevelComplete) return;
            
            if (this.checkOrder()) {
                this.completeLevel();
            } else {
                this.showNotification('Os números não estão em ordem!', 'error');
            }
        });

        this.restartLevelButton.addEventListener('click', () => {
            this.restartCurrentLevel();
        });

        this.restartGameButton.addEventListener('click', () => {
            this.restartGame();
        });

        this.nextLevelButton.addEventListener('click', () => {
            this.nextLevel();
        });

        // Suporte para arrastar em mobile
        if (this.isMobile) {
            let draggedNumber = null;
            let draggedIndex = -1;

            this.numbersContainer.addEventListener('touchstart', (e) => {
                if (this.isLevelComplete) return;
                
                if (e.target.classList.contains('number-item')) {
                    draggedNumber = e.target;
                    draggedIndex = Array.from(this.numbersContainer.children).indexOf(draggedNumber);
                    draggedNumber.style.opacity = '0.5';
                }
            });

            this.numbersContainer.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (draggedNumber) {
                    const touch = e.touches[0];
                    draggedNumber.style.position = 'absolute';
                    draggedNumber.style.left = touch.clientX - draggedNumber.offsetWidth / 2 + 'px';
                    draggedNumber.style.top = touch.clientY - draggedNumber.offsetHeight / 2 + 'px';
                }
            });

            this.numbersContainer.addEventListener('touchend', (e) => {
                if (draggedNumber) {
                    draggedNumber.style.opacity = '1';
                    draggedNumber.style.position = '';
                    draggedNumber.style.left = '';
                    draggedNumber.style.top = '';

                    const touch = e.changedTouches[0];
                    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    if (dropTarget && dropTarget.classList.contains('number-item')) {
                        const dropIndex = Array.from(this.numbersContainer.children).indexOf(dropTarget);
                        this.swapNumbers(draggedIndex, dropIndex);
                    }

                    draggedNumber = null;
                    draggedIndex = -1;
                }
            });
        }
    }

    createNumbers() {
        this.numbersContainer.innerHTML = '';
        const numbers = [];
        const count = 5 + Math.floor(this.level / 2); // Aumenta a quantidade de números a cada 2 níveis
        const maxNumber = 10 + (this.level * 5); // Aumenta o número máximo a cada nível
        
        // Gerar números aleatórios únicos
        while (numbers.length < count) {
            const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
            if (!numbers.includes(randomNumber)) {
                numbers.push(randomNumber);
            }
        }
        
        // Embaralhar os números
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        numbers.forEach((number, index) => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number-item';
            numberElement.textContent = number;
            numberElement.draggable = true;
            numberElement.dataset.value = number;
            
            numberElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                e.target.style.opacity = '0.5';
            });
            
            numberElement.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
            
            numberElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            numberElement.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = Array.from(this.numbersContainer.children).indexOf(e.target);
                this.swapNumbers(fromIndex, toIndex);
            });
            
            this.numbersContainer.appendChild(numberElement);
        });
    }

    swapNumbers(fromIndex, toIndex) {
        if (this.isLevelComplete) return;
        
        const numbers = Array.from(this.numbersContainer.children);
        const temp = numbers[fromIndex].textContent;
        numbers[fromIndex].textContent = numbers[toIndex].textContent;
        numbers[toIndex].textContent = temp;
    }

    checkOrder() {
        const numbers = Array.from(this.numbersContainer.children);
        for (let i = 0; i < numbers.length - 1; i++) {
            if (parseInt(numbers[i].textContent) > parseInt(numbers[i + 1].textContent)) {
                return false;
            }
        }
        return true;
    }

    completeLevel() {
        if (this.isLevelComplete) return;
        
        this.isLevelComplete = true;
        this.score += this.level * 10;
        this.scoreDisplay.textContent = this.score;
        this.showNotification('Parabéns! Nível concluído!', 'success');
        this.nextLevelButton.style.display = 'block';
    }

    nextLevel() {
        this.level++;
        this.levelDisplay.textContent = this.level;
        this.isLevelComplete = false;
        this.nextLevelButton.style.display = 'none';
        this.createNumbers();
    }

    restartCurrentLevel() {
        this.isLevelComplete = false;
        this.nextLevelButton.style.display = 'none';
        this.createNumbers();
    }

    restartGame() {
        this.level = 1;
        this.levelDisplay.textContent = this.level;
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.isLevelComplete = false;
        this.nextLevelButton.style.display = 'none';
        this.createNumbers();
    }

    showNotification(message, type) {
        this.notification.textContent = message;
        this.notification.className = `game-notification ${type}`;
        this.notification.style.display = 'block';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 1500);
    }
}

// Inicia o jogo quando a página carregar
window.addEventListener('load', () => {
    new NumbersGame();
}); 