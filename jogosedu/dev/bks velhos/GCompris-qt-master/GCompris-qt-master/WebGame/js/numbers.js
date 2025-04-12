class NumbersGame {
    constructor() {
        this.numbersContainer = document.getElementById('numbersContainer');
        this.levelElement = document.getElementById('level');
        this.scoreElement = document.getElementById('score');
        this.checkButton = document.getElementById('checkButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.level = 1;
        this.score = 0;
        this.numbers = [];
        this.maxNumber = 10; // Número máximo para o nível 1
        this.quantityOfNumbers = 5; // Quantidade de números para o nível 1
        this.dragSource = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.updateLevelDifficulty();
        this.generateNumbers();
        this.renderNumbers();
    }
    
    updateLevelDifficulty() {
        // Ajustar dificuldade com base no nível
        this.maxNumber = 10 + (this.level - 1) * 10;
        this.quantityOfNumbers = Math.min(5 + Math.floor((this.level - 1) / 2), 10);
    }
    
    generateNumbers() {
        this.numbers = [];
        
        // Gerar números aleatórios únicos
        while (this.numbers.length < this.quantityOfNumbers) {
            const randomNumber = Math.floor(Math.random() * this.maxNumber) + 1;
            if (!this.numbers.includes(randomNumber)) {
                this.numbers.push(randomNumber);
            }
        }
        
        // Embaralhar os números
        this.shuffleNumbers();
    }
    
    shuffleNumbers() {
        for (let i = this.numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
        }
    }
    
    renderNumbers() {
        this.numbersContainer.innerHTML = '';
        
        this.numbers.forEach((number, index) => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number-item';
            numberElement.textContent = number;
            numberElement.dataset.number = number;
            numberElement.dataset.index = index;
            numberElement.draggable = true;
            
            // Usar abordagem simplificada para eventos de arrastar e soltar
            numberElement.addEventListener('dragstart', this.handleDragStart.bind(this));
            numberElement.addEventListener('dragover', this.handleDragOver.bind(this));
            numberElement.addEventListener('dragenter', this.handleDragEnter.bind(this));
            numberElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
            numberElement.addEventListener('drop', this.handleDrop.bind(this));
            numberElement.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            this.numbersContainer.appendChild(numberElement);
        });
    }
    
    setupEventListeners() {
        this.checkButton.addEventListener('click', () => {
            this.checkOrder();
        });
        
        this.restartButton.addEventListener('click', () => {
            this.shuffleNumbers();
            this.renderNumbers();
        });
    }
    
    // Novos métodos de arrastar e soltar
    handleDragStart(e) {
        this.dragSource = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.target.classList.add('dragging');
        
        // Para dispositivos móveis - esconder imagem fantasma
        if (e.dataTransfer.setDragImage) {
            const crt = e.target.cloneNode(true);
            crt.style.opacity = '0.3';
            document.body.appendChild(crt);
            e.dataTransfer.setDragImage(crt, 0, 0);
            setTimeout(() => document.body.removeChild(crt), 0);
        }
    }
    
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    handleDragEnter(e) {
        if (e.target.classList.contains('number-item')) {
            e.target.classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        if (e.target.classList.contains('number-item')) {
            e.target.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (this.dragSource !== e.target && e.target.classList.contains('number-item')) {
            // Obter os índices dos elementos de origem e destino
            const sourceIndex = parseInt(this.dragSource.dataset.index);
            const targetIndex = parseInt(e.target.dataset.index);
            
            // Trocar os números
            [this.numbers[sourceIndex], this.numbers[targetIndex]] = 
            [this.numbers[targetIndex], this.numbers[sourceIndex]];
            
            // Atualizar a visualização
            this.renderNumbers();
        }
        
        return false;
    }
    
    handleDragEnd(e) {
        document.querySelectorAll('.number-item').forEach(item => {
            item.classList.remove('drag-over');
            item.classList.remove('dragging');
        });
    }
    
    checkOrder() {
        const isSorted = this.numbers.every((number, index) => 
            index === 0 || number >= this.numbers[index - 1]
        );
        
        if (isSorted) {
            this.score += this.level * 10;
            this.scoreElement.textContent = this.score;
            
            setTimeout(() => {
                alert('Parabéns! Você ordenou os números corretamente!');
                this.level++;
                this.levelElement.textContent = this.level;
                this.initializeGame();
            }, 300);
        } else {
            alert('Ops! Os números não estão em ordem crescente. Tente novamente!');
        }
    }
    
    // Implementação alternativa para touch em dispositivos móveis
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartElement = null;
        
        const items = document.querySelectorAll('.number-item');
        
        items.forEach(item => {
            // Touch start
            item.addEventListener('touchstart', (e) => {
                touchStartElement = item;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                item.classList.add('dragging');
                e.preventDefault();
            }, { passive: false });
            
            // Touch end para receber o elemento "solto"
            item.addEventListener('touchend', (e) => {
                if (!touchStartElement) return;
                
                // Limpar classes
                items.forEach(i => {
                    i.classList.remove('dragging');
                    i.classList.remove('drag-over');
                });
                
                // Se tocar no mesmo elemento em que começou, não faz nada
                if (touchStartElement === item) return;
                
                // Trocar os números
                const sourceIndex = parseInt(touchStartElement.dataset.index);
                const targetIndex = parseInt(item.dataset.index);
                
                [this.numbers[sourceIndex], this.numbers[targetIndex]] = 
                [this.numbers[targetIndex], this.numbers[sourceIndex]];
                
                // Atualizar a visualização
                this.renderNumbers();
                
                touchStartElement = null;
            }, { passive: true });
            
            // Touch move para destacar o elemento alvo
            item.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                
                // Encontrar o elemento sob o toque
                const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
                
                // Se for um elemento de número, destacá-lo
                if (elementAtTouch && elementAtTouch.classList.contains('number-item') && 
                    elementAtTouch !== touchStartElement) {
                    
                    // Remover highlight de todos os elementos
                    items.forEach(i => i.classList.remove('drag-over'));
                    
                    // Adicionar highlight apenas ao elemento sob o toque
                    elementAtTouch.classList.add('drag-over');
                }
            }, { passive: false });
        });
    }
    
    renderNumbers() {
        this.numbersContainer.innerHTML = '';
        
        this.numbers.forEach((number, index) => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number-item';
            numberElement.textContent = number;
            numberElement.dataset.number = number;
            numberElement.dataset.index = index;
            numberElement.draggable = true;
            
            // Usar abordagem simplificada para eventos de arrastar e soltar
            numberElement.addEventListener('dragstart', this.handleDragStart.bind(this));
            numberElement.addEventListener('dragover', this.handleDragOver.bind(this));
            numberElement.addEventListener('dragenter', this.handleDragEnter.bind(this));
            numberElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
            numberElement.addEventListener('drop', this.handleDrop.bind(this));
            numberElement.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            this.numbersContainer.appendChild(numberElement);
        });
        
        // Configurar eventos de toque para dispositivos móveis
        this.setupTouchEvents();
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new NumbersGame();
}); 