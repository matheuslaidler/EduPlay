class MiniPaint {
    constructor() {
        // Elementos do DOM
        this.canvas = document.getElementById('paintCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Elementos da interface
        this.colorOptions = document.querySelectorAll('.color-option');
        this.toolOptions = document.querySelectorAll('.tool-option');
        this.stampOptions = document.querySelectorAll('.stamp-option');
        this.stampContainer = document.querySelector('.stamp-container');
        this.decreaseBrushBtn = document.getElementById('decreaseBrush');
        this.increaseBrushBtn = document.getElementById('increaseBrush');
        this.brushPreview = document.getElementById('brushPreview');
        this.clearButton = document.getElementById('clearButton');
        this.saveButton = document.getElementById('saveButton');
        
        // Estado do pincel e ferramentas
        this.currentColor = 'black';
        this.currentTool = 'pencil';
        this.currentStamp = null;
        this.brushSize = 5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Remover o carregamento de imagens dos carimbos já que usaremos emojis
        this.stamps = {
            'star': '⭐',
            'heart': '❤️',
            'smile': '😊',
            'flower': '🌸'
        };
        
        // Inicializar o canvas
        this.initCanvas();
        
        // Configurar os event listeners
        this.setupEventListeners();
    }
    
    initCanvas() {
        // Configurações iniciais do canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Atualizar o preview do pincel
        this.updateBrushPreview();
    }
    
    setupEventListeners() {
        // Eventos do mouse para desenhar
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Eventos de toque para dispositivos móveis
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Eventos para seleção de cores
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover a seleção anterior
                this.colorOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Adicionar a seleção à cor atual
                option.classList.add('selected');
                
                // Atualizar a cor atual
                this.currentColor = option.dataset.color;
                
                // Atualizar o preview do pincel
                this.updateBrushPreview();
            });
        });
        
        // Eventos para seleção de ferramentas
        this.toolOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover a seleção anterior
                this.toolOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Adicionar a seleção à ferramenta atual
                option.classList.add('selected');
                
                // Atualizar a ferramenta atual
                this.currentTool = option.dataset.tool;
                
                // Mostrar ou ocultar o contêiner de carimbos
                if (this.currentTool === 'stamp') {
                    this.stampContainer.style.display = 'flex';
                } else {
                    this.stampContainer.style.display = 'none';
                }
                
                // Atualizar o preview do pincel
                this.updateBrushPreview();
            });
        });
        
        // Eventos para seleção de carimbos
        this.stampOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover a seleção anterior
                this.stampOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Adicionar a seleção ao carimbo atual
                option.classList.add('selected');
                
                // Atualizar o carimbo atual
                this.currentStamp = option.dataset.stamp;
                console.log(`Carimbo selecionado: ${this.currentStamp}`);
            });
        });
        
        // Eventos para tamanho do pincel
        this.decreaseBrushBtn.addEventListener('click', () => {
            if (this.brushSize > 1) {
                this.brushSize -= 2;
                this.updateBrushPreview();
            }
        });
        
        this.increaseBrushBtn.addEventListener('click', () => {
            if (this.brushSize < 50) {
                this.brushSize += 2;
                this.updateBrushPreview();
            }
        });
        
        // Evento para limpar o canvas
        this.clearButton.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todo o desenho?')) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
        
        // Evento para salvar o desenho
        this.saveButton.addEventListener('click', () => {
            // Criar um link para download
            const dataURL = this.canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'meu-desenho.png';
            link.href = dataURL;
            link.click();
        });
    }
    
    updateBrushPreview() {
        const preview = this.brushPreview;
        const size = Math.min(this.brushSize, 30); // Limitar o tamanho do preview
        
        // Atualizar o tamanho e a cor do preview
        preview.style.width = `${size}px`;
        preview.style.height = `${size}px`;
        
        // Atualizar a cor do preview (exceto para a borracha)
        if (this.currentTool === 'eraser') {
            preview.style.backgroundColor = 'white';
            preview.style.border = '1px solid #ccc';
        } else {
            preview.style.backgroundColor = this.currentColor;
            preview.style.border = 'none';
        }
    }
    
    // Manipuladores de eventos para desenho
    startDrawing(e) {
        this.isDrawing = true;
        
        // Obter as coordenadas corretas
        const coords = this.getCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        // Para o carimbo, aplicamos imediatamente
        if (this.currentTool === 'stamp' && this.currentStamp) {
            this.applyStamp(coords.x, coords.y);
        }
    }
    
    draw(e) {
        // Não fazer nada se não estiver desenhando ou se for um carimbo
        if (!this.isDrawing || this.currentTool === 'stamp') return;
        
        // Obter as coordenadas corretas
        const coords = this.getCoordinates(e);
        
        // Configurar o contexto de desenho
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;
        
        // Definir a cor com base na ferramenta
        if (this.currentTool === 'eraser') {
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = 'white';
        } else {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.fillStyle = this.currentColor;
        }
        
        // Diferenciar entre as ferramentas
        if (this.currentTool === 'pencil') {
            // O lápis desenha linhas finas
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(coords.x, coords.y);
            this.ctx.stroke();
        } else if (this.currentTool === 'brush') {
            // O pincel desenha pontos mais suaves
            const distance = Math.sqrt(
                Math.pow(coords.x - this.lastX, 2) + Math.pow(coords.y - this.lastY, 2)
            );
            const numSteps = Math.max(Math.floor(distance / 5), 1);
            
            for (let i = 0; i < numSteps; i++) {
                const t = i / numSteps;
                const x = this.lastX + (coords.x - this.lastX) * t;
                const y = this.lastY + (coords.y - this.lastY) * t;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (this.currentTool === 'eraser') {
            // A borracha funciona como um pincel branco
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(coords.x, coords.y);
            this.ctx.stroke();
        }
        
        // Atualizar as últimas coordenadas
        this.lastX = coords.x;
        this.lastY = coords.y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    applyStamp(x, y) {
        if (!this.currentStamp || !this.stamps[this.currentStamp]) {
            console.log('Nenhum carimbo selecionado');
            return;
        }

        const stampEmoji = this.stamps[this.currentStamp];
        const size = this.brushSize * 3;
        
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(stampEmoji, x, y);
    }
    
    // Manipuladores de eventos de toque
    handleTouchStart(e) {
        e.preventDefault(); // Prevenir scroll
        this.isDrawing = true;
        const coords = this.getCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        if (this.currentTool === 'stamp') {
            this.applyStamp(coords.x, coords.y);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault(); // Prevenir scroll
        if (!this.isDrawing) return;
        
        const coords = this.getCoordinates(e);
        this.draw(e);
    }
    
    // Utilitário para obter coordenadas corretas do mouse ou toque
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let x, y;
        
        if (e.type.includes('touch')) {
            // Para eventos de toque
            const touch = e.touches[0];
            x = (touch.clientX - rect.left) * scaleX;
            y = (touch.clientY - rect.top) * scaleY;
        } else {
            // Para eventos do mouse
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }
        
        // Garantir que as coordenadas estejam dentro dos limites do canvas
        x = Math.min(Math.max(x, 0), this.canvas.width);
        y = Math.min(Math.max(y, 0), this.canvas.height);
        
        return { x, y };
    }
}

// Inicializar o mini paint quando a página carregar
window.addEventListener('load', () => {
    new MiniPaint();
}); 