class MathGame {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.correctAnswer = null;
        this.timer = 30; // Tempo inicial em segundos
        this.timerInterval = null;
        this.questionsPerLevel = 10;
        this.currentQuestion = 1;
        this.isGameActive = true; // Flag para controlar o estado do jogo
        
        // Elementos do DOM
        this.mathProblem = document.getElementById('mathProblem');
        this.mathOptions = document.getElementById('mathOptions');
        this.levelElement = document.getElementById('level');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.progressBar = document.getElementById('progressBar');
        this.feedbackElement = document.getElementById('feedback');
        this.newGameButton = document.getElementById('newGameButton');
        this.helpButton = document.getElementById('helpButton');
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    initializeGame() {
        // Parar timer anterior, se existir
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.isGameActive = true;
        this.score = 0;
        this.currentQuestion = 1;
        this.timer = 30;
        this.updateScore();
        this.updateLevel();
        this.feedbackElement.textContent = '';
        
        // Remover classe 'disabled' das opções
        if (this.mathOptions.classList.contains('disabled')) {
            this.mathOptions.classList.remove('disabled');
        }
        
        this.generateProblem();
        this.startTimer();
    }
    
    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => {
            this.level = 1;
            this.initializeGame();
        });
        
        this.helpButton.addEventListener('click', () => {
            this.showHelp();
        });
    }
    
    // Gerar um problema matemático com base no nível
    generateProblem() {
        // Limpar opções anteriores
        this.mathOptions.innerHTML = '';
        
        // Resetar feedback
        this.feedbackElement.textContent = '';
        
        let num1, num2, operation, problem, answer;
        
        switch(this.level) {
            case 1: // Somas simples
                num1 = this.getRandomNumber(1, 10);
                num2 = this.getRandomNumber(1, 10);
                problem = `${num1} + ${num2} = ?`;
                answer = num1 + num2;
                break;
                
            case 2: // Subtrações simples
                num1 = this.getRandomNumber(5, 20);
                num2 = this.getRandomNumber(1, num1); // Garantir que o resultado seja positivo
                problem = `${num1} - ${num2} = ?`;
                answer = num1 - num2;
                break;
                
            case 3: // Multiplicações simples
                num1 = this.getRandomNumber(1, 10);
                num2 = this.getRandomNumber(1, 10);
                problem = `${num1} × ${num2} = ?`;
                answer = num1 * num2;
                break;
                
            case 4: // Operações mistas (soma, subtração)
                num1 = this.getRandomNumber(1, 20);
                num2 = this.getRandomNumber(1, 20);
                operation = Math.random() < 0.5 ? '+' : '-';
                
                if (operation === '-' && num2 > num1) {
                    // Trocar os números para garantir resultado positivo
                    [num1, num2] = [num2, num1];
                }
                
                problem = `${num1} ${operation} ${num2} = ?`;
                answer = operation === '+' ? num1 + num2 : num1 - num2;
                break;
                
            case 5: // Operações mistas (soma, subtração, multiplicação)
                num1 = this.getRandomNumber(1, 12);
                num2 = this.getRandomNumber(1, 12);
                const opIndex = Math.floor(Math.random() * 3);
                
                if (opIndex === 0) {
                    operation = '+';
                    problem = `${num1} + ${num2} = ?`;
                    answer = num1 + num2;
                } else if (opIndex === 1) {
                    operation = '-';
                    if (num2 > num1) {
                        [num1, num2] = [num2, num1];
                    }
                    problem = `${num1} - ${num2} = ?`;
                    answer = num1 - num2;
                } else {
                    operation = '×';
                    problem = `${num1} × ${num2} = ?`;
                    answer = num1 * num2;
                }
                break;
                
            default:
                // Nível máximo - operações mais complexas
                num1 = this.getRandomNumber(10, 30);
                num2 = this.getRandomNumber(1, 15);
                const num3 = this.getRandomNumber(1, 10);
                
                const operations = ['+', '-', '×'];
                const op1 = operations[Math.floor(Math.random() * 2)]; // Soma ou subtração para primeira operação
                const op2 = operations[Math.floor(Math.random() * 3)]; // Qualquer operação para segunda
                
                if (op1 === '-' && num2 > num1) {
                    [num1, num2] = [num2, num1];
                }
                
                let tempResult;
                if (op1 === '+') tempResult = num1 + num2;
                else tempResult = num1 - num2;
                
                if (op2 === '-' && num3 > tempResult) {
                    problem = `${num1} ${op1} ${num2} ${op2} ${num3} = ?`;
                    if (op1 === '+') answer = num1 + num2 - num3;
                    else answer = num1 - num2 - num3;
                } else {
                    problem = `${num1} ${op1} ${num2} ${op2} ${num3} = ?`;
                    if (op1 === '+') {
                        if (op2 === '+') answer = num1 + num2 + num3;
                        else if (op2 === '-') answer = num1 + num2 - num3;
                        else answer = num1 + num2 * num3;
                    } else {
                        if (op2 === '+') answer = num1 - num2 + num3;
                        else if (op2 === '-') answer = num1 - num2 - num3;
                        else answer = num1 - num2 * num3;
                    }
                }
                break;
        }
        
        this.mathProblem.textContent = problem;
        this.correctAnswer = answer;
        
        // Gerar opções
        this.generateOptions(answer);
    }
    
    // Gerar opções para o problema
    generateOptions(correctAnswer) {
        // Criar array de opções com a resposta correta
        const options = [correctAnswer];
        
        // Adicionar opções incorretas
        while (options.length < 4) {
            let incorrectAnswer;
            
            // Gerar opções baseadas no nível
            if (this.level <= 2) {
                // Para níveis mais fáceis, opções próximas do correto
                incorrectAnswer = correctAnswer + this.getRandomNumber(-5, 5);
            } else if (this.level <= 4) {
                // Para níveis intermediários, mais variação
                incorrectAnswer = correctAnswer + this.getRandomNumber(-10, 10);
            } else {
                // Para níveis difíceis, mais variação ainda
                incorrectAnswer = correctAnswer + this.getRandomNumber(-20, 20);
            }
            
            // Evitar duplicatas e números negativos
            if (!options.includes(incorrectAnswer) && incorrectAnswer >= 0) {
                options.push(incorrectAnswer);
            }
        }
        
        // Embaralhar as opções
        this.shuffleArray(options);
        
        // Criar elementos de opção
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'math-option';
            optionElement.textContent = option;
            
            // Adicionar evento de clique
            optionElement.addEventListener('click', () => {
                this.checkAnswer(option, optionElement);
            });
            
            this.mathOptions.appendChild(optionElement);
        });
    }
    
    // Verificar a resposta selecionada
    checkAnswer(selectedAnswer, element) {
        // Verificar se o jogo está ativo
        if (!this.isGameActive) return;
        
        // Evitar múltiplas seleções
        if (this.mathOptions.classList.contains('disabled')) return;
        
        // Desabilitar opções temporariamente
        this.mathOptions.classList.add('disabled');
        
        // Parar o temporizador
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (selectedAnswer === this.correctAnswer) {
            // Resposta correta
            element.classList.add('correct');
            this.feedbackElement.textContent = 'Correto! Muito bem!';
            this.score += this.level * 10;
            this.updateScore();
            
            // Próxima pergunta ou nível
            setTimeout(() => {
                this.currentQuestion++;
                if (this.currentQuestion > this.questionsPerLevel) {
                    // Avançar para o próximo nível
                    this.level++;
                    this.currentQuestion = 1;
                    this.updateLevel();
                    
                    if (this.level > 6) {
                        this.showGameComplete();
                        return;
                    }
                }
                
                // Resetar para próxima pergunta
                this.timer = 30;
                this.timerElement.textContent = this.timer;
                this.progressBar.style.width = '100%';
                this.generateProblem();
                this.startTimer();
                this.mathOptions.classList.remove('disabled');
            }, 1500);
        } else {
            // Resposta incorreta
            element.classList.add('incorrect');
            
            // Mostrar a resposta correta
            const options = document.querySelectorAll('.math-option');
            options.forEach(opt => {
                if (parseInt(opt.textContent) === this.correctAnswer) {
                    opt.classList.add('correct');
                }
            });
            
            this.feedbackElement.textContent = `Incorreto. A resposta é ${this.correctAnswer}.`;
            
            // Próxima pergunta
            setTimeout(() => {
                // Resetar para próxima pergunta
                this.timer = 30;
                this.timerElement.textContent = this.timer;
                this.progressBar.style.width = '100%';
                this.generateProblem();
                this.startTimer();
                this.mathOptions.classList.remove('disabled');
            }, 2000);
        }
    }
    
    // Iniciar o temporizador
    startTimer() {
        // Garantir que não haja timer anterior rodando
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timer = 30;
        this.timerElement.textContent = this.timer;
        this.progressBar.style.width = '100%';
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.timerElement.textContent = this.timer;
            
            // Atualizar barra de progresso
            const percentage = (this.timer / 30) * 100;
            this.progressBar.style.width = `${percentage}%`;
            
            if (this.timer <= 0) {
                // Tempo esgotado
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.feedbackElement.textContent = `Tempo esgotado! A resposta era ${this.correctAnswer}.`;
                this.mathOptions.classList.add('disabled');
                
                // Próxima pergunta
                setTimeout(() => {
                    // Resetar para próxima pergunta
                    this.timer = 30;
                    this.timerElement.textContent = this.timer;
                    this.progressBar.style.width = '100%';
                    this.generateProblem();
                    this.startTimer();
                    this.mathOptions.classList.remove('disabled');
                }, 2000);
            }
        }, 1000);
    }
    
    // Mostrar ajuda
    showHelp() {
        let helpText = "Matemática Divertida - Como Jogar:\n\n";
        helpText += "Nível 1: Soma de números até 10\n";
        helpText += "Nível 2: Subtração de números até 20\n";
        helpText += "Nível 3: Multiplicação de números até 10\n";
        helpText += "Nível 4: Soma e subtração de números até 20\n";
        helpText += "Nível 5: Soma, subtração e multiplicação\n";
        helpText += "Nível 6: Expressões com mais de uma operação\n\n";
        helpText += "Você tem 30 segundos para responder cada pergunta. Acertos valem mais pontos em níveis mais altos.";
        
        alert(helpText);
    }
    
    // Mostrar tela de fim de jogo
    showGameComplete() {
        this.isGameActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.mathProblem.textContent = "Parabéns! Você completou todos os níveis!";
        this.mathOptions.innerHTML = '';
        this.feedbackElement.textContent = `Pontuação final: ${this.score}`;
        
        // Adicionar botão para reiniciar o jogo
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Jogar Novamente';
        restartButton.classList.add('button');
        restartButton.addEventListener('click', () => {
            this.level = 1;
            this.initializeGame();
        });
        
        this.mathOptions.appendChild(restartButton);
    }
    
    // Atualizar a pontuação exibida
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    // Atualizar o nível exibido
    updateLevel() {
        this.levelElement.textContent = this.level;
    }
    
    // Obter um número aleatório entre min e max (inclusive)
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Embaralhar um array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new MathGame();
}); 