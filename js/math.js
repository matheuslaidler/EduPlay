class MathGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentProblem = null;
        
        this.num1Element = document.getElementById('num1');
        this.operatorElement = document.getElementById('operator');
        this.num2Element = document.getElementById('num2');
        this.answerInput = document.getElementById('answer');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.checkButton = document.getElementById('checkButton');
        this.nextButton = document.getElementById('nextButton');
        this.notification = document.getElementById('gameNotification');

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.generateProblem();
    }

    setupEventListeners() {
        this.checkButton.addEventListener('click', () => {
            this.checkAnswer();
        });

        this.nextButton.addEventListener('click', () => {
            this.generateProblem();
        });

        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    generateProblem() {
        const maxNumber = 10 * this.level;
        const operators = ['+', '-'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let num1, num2;
        
        if (operator === '-') {
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
        } else {
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * maxNumber) + 1;
        }

        this.currentProblem = { num1, operator, num2 };
        
        this.num1Element.textContent = num1;
        this.operatorElement.textContent = operator;
        this.num2Element.textContent = num2;
        this.answerInput.value = '';
        this.answerInput.focus();
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `game-notification ${type}`;
        this.notification.style.display = 'block';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }

    checkAnswer() {
        const userAnswer = parseFloat(this.answerInput.value);
        if (isNaN(userAnswer)) {
            this.showNotification('Por favor, digite um número válido!', 'error');
            return;
        }

        const correctAnswer = this.calculateAnswer();

        if (userAnswer === correctAnswer) {
            this.score += 10 * this.level;
            this.scoreElement.textContent = this.score;
            
            if (this.score % 100 === 0) {
                this.level++;
                this.levelElement.textContent = this.level;
            }
            
            this.showNotification('Parabéns! Você acertou! 🎉', 'success');
            this.generateProblem();
        } else {
            this.showNotification('Ops! Tente novamente!', 'error');
        }
        this.answerInput.value = '';
    }

    calculateAnswer() {
        const { num1, operator, num2 } = this.currentProblem;
        switch (operator) {
            case '+':
                return num1 + num2;
            case '-':
                return num1 - num2;
            default:
                return 0;
        }
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new MathGame();
}); 