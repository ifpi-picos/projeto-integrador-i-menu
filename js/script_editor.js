document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o canvas com Fabric.js
    const canvas = new fabric.Canvas('imageCanvas', {
        backgroundColor: '#f8f9fa',
        preserveObjectStacking: true
    });
    
    let currentImage = null;
    let isDrawingMode = false;
    let isCropping = false;
    let cropRect = null;
    
    // Elementos da UI
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Configuração das abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    // Carregar imagem
    uploadBtn.addEventListener('click', () => imageUpload.click());
    
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    // Limpar canvas
                    canvas.clear();
                    canvas.backgroundColor = '#f8f9fa';
                    
                    // Dimensionar a imagem para caber no canvas
                    const scale = Math.min(
                        (canvas.getWidth() - 40) / img.width,
                        (canvas.getHeight() - 40) / img.height
                    );
                    
                    img.set({
                        left: canvas.getWidth() / 2,
                        top: canvas.getHeight() / 2,
                        originX: 'center',
                        originY: 'center',
                        scaleX: scale,
                        scaleY: scale
                    });
                    
                    canvas.add(img);
                    canvas.setActiveObject(img);
                    currentImage = img;
                    
                    // Ajustar o zoom para mostrar toda a imagem
                    canvas.renderAll();
                });
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Ferramentas de transformação
    document.getElementById('rotateLeft').addEventListener('click', () => {
        if (currentImage) {
            currentImage.rotate(currentImage.angle - 90);
            canvas.renderAll();
        }
    });
    
    document.getElementById('rotateRight').addEventListener('click', () => {
        if (currentImage) {
            currentImage.rotate(currentImage.angle + 90);
            canvas.renderAll();
        }
    });
    
    document.getElementById('flipHorizontal').addEventListener('click', () => {
        if (currentImage) {
            currentImage.set('flipX', !currentImage.flipX);
            canvas.renderAll();
        }
    });
    
    document.getElementById('flipVertical').addEventListener('click', () => {
        if (currentImage) {
            currentImage.set('flipY', !currentImage.flipY);
            canvas.renderAll();
        }
    });
    
    // Controles deslizantes para ajustes
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    
    function applyImageFilters() {
        if (!currentImage) return;
        
        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);
        const saturation = parseInt(saturationSlider.value);
        
        currentImage.filters = [
            new fabric.Image.filters.Brightness({ brightness: brightness / 100 }),
            new fabric.Image.filters.Contrast({ contrast: 1 + (contrast / 100) }),
            new fabric.Image.filters.Saturation({ saturation: 1 + (saturation / 100) })
        ];
        
        currentImage.applyFilters();
        canvas.renderAll();
    }
    
    brightnessSlider.addEventListener('input', applyImageFilters);
    contrastSlider.addEventListener('input', applyImageFilters);
    saturationSlider.addEventListener('input', applyImageFilters);
    
    // Filtros pré-definidos
    const filterPresets = {
        normal: [],
        clarendon: [
            new fabric.Image.filters.Brightness({ brightness: 0.05 }),
            new fabric.Image.filters.Contrast({ contrast: 1.2 }),
            new fabric.Image.filters.Saturation({ saturation: 1.1 })
        ],
        gingham: [
            new fabric.Image.filters.Sepia({ sepia: 0.3 }),
            new fabric.Image.filters.Brightness({ brightness: 0.1 })
        ],
        moon: [
            new fabric.Image.filters.Grayscale(),
            new fabric.Image.filters.Brightness({ brightness: 0.1 }),
            new fabric.Image.filters.Contrast({ contrast: 1.1 })
        ],
        lark: [
            new fabric.Image.filters.Brightness({ brightness: 0.08 }),
            new fabric.Image.filters.Saturation({ saturation: 1.2 })
        ],
        reyes: [
            new fabric.Image.filters.Sepia({ sepia: 0.4 }),
            new fabric.Image.filters.Brightness({ brightness: 0.15 }),
            new fabric.Image.filters.Contrast({ contrast: 0.9 })
        ],
        juno: [
            new fabric.Image.filters.Saturation({ saturation: 1.4 }),
            new fabric.Image.filters.Contrast({ contrast: 1.1 }),
            new fabric.Image.filters.Brightness({ brightness: 0.1 })
        ],
        slumber: [
            new fabric.Image.filters.Brightness({ brightness: -0.1 }),
            new fabric.Image.filters.Saturation({ saturation: 0.8 })
        ],
        crema: [
            new fabric.Image.filters.Sepia({ sepia: 0.2 }),
            new fabric.Image.filters.Brightness({ brightness: 0.05 }),
            new fabric.Image.filters.Contrast({ contrast: 0.95 })
        ],
        ludwig: [
            new fabric.Image.filters.Brightness({ brightness: 0.05 }),
            new fabric.Image.filters.Saturation({ saturation: 0.8 }),
            new fabric.Image.filters.Contrast({ contrast: 1.05 })
        ],
        aden: [
            new fabric.Image.filters.Saturation({ saturation: 0.9 }),
            new fabric.Image.filters.Brightness({ brightness: 0.1 })
        ],
        perpetua: [
            new fabric.Image.filters.Sepia({ sepia: 0.25 }),
            new fabric.Image.filters.Contrast({ contrast: 0.95 })
        ]
    };
    
    document.querySelectorAll('.filter-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            if (!currentImage) return;
            
            document.querySelectorAll('.filter-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            const filterName = this.dataset.filter;
            currentImage.filters = filterPresets[filterName] || [];
            currentImage.applyFilters();
            canvas.renderAll();
        });
    });
    
    // Efeitos especiais
    document.getElementById('effectGrayscale').addEventListener('click', () => {
        if (!currentImage) return;
        currentImage.filters.push(new fabric.Image.filters.Grayscale());
        currentImage.applyFilters();
        canvas.renderAll();
    });
    
    document.getElementById('effectSepia').addEventListener('click', () => {
        if (!currentImage) return;
        currentImage.filters.push(new fabric.Image.filters.Sepia());
        currentImage.applyFilters();
        canvas.renderAll();
    });
    
    document.getElementById('effectInvert').addEventListener('click', () => {
        if (!currentImage) return;
        currentImage.filters.push(new fabric.Image.filters.Invert());
        currentImage.applyFilters();
        canvas.renderAll();
    });
    
    document.getElementById('effectBlur').addEventListener('click', () => {
        if (!currentImage) return;
        currentImage.filters.push(new fabric.Image.filters.Blur({
            blur: 0.5
        }));
        currentImage.applyFilters();
        canvas.renderAll();
    });
    
    document.getElementById('effectSharpen').addEventListener('click', () => {
        if (!currentImage) return;
        currentImage.filters.push(new fabric.Image.filters.Convolute({
            matrix: [ 0, -1,  0,
                     -1,  5, -1,
                      0, -1,  0 ]
        }));
        currentImage.applyFilters();
        canvas.renderAll();
    });
    
    // Ferramentas de corte
    document.getElementById('cropTool').addEventListener('click', function() {
        if (!currentImage) return;
        
        isCropping = true;
        canvas.discardActiveObject();
        
        // Criar retângulo de corte
        cropRect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            fill: 'rgba(0,0,0,0.3)',
            stroke: '#ffffff',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerSize: 12,
            hasRotatingPoint: false,
            lockRotation: true,
            borderColor: '#4361ee',
            borderScaleFactor: 2,
            borderOpacityWhenMoving: 1
        });
        
        canvas.add(cropRect);
        canvas.setActiveObject(cropRect);
    });
    
    // Aplicar corte
    function applyCrop() {
        if (!isCropping || !cropRect || !currentImage) return;
        
        const scaleX = currentImage.scaleX;
        const scaleY = currentImage.scaleY;
        
        // Coordenadas relativas à imagem
        const left = (cropRect.left - currentImage.left) / scaleX;
        const top = (cropRect.top - currentImage.top) / scaleY;
        const width = cropRect.width / scaleX;
        const height = cropRect.height / scaleY;
        
        // Criar novo objeto de imagem cortada
        fabric.util.loadImage(currentImage.getSrc(), function(img) {
            const canvasEl = document.createElement('canvas');
            const ctx = canvasEl.getContext('2d');
            
            canvasEl.width = width;
            canvasEl.height = height;
            
            ctx.drawImage(img, 
                left + currentImage.width / 2, 
                top + currentImage.height / 2, 
                width, height, 
                0, 0, 
                width, height
            );
            
            const dataURL = canvasEl.toDataURL('image/png');
            
            fabric.Image.fromURL(dataURL, function(newImg) {
                newImg.set({
                    left: currentImage.left,
                    top: currentImage.top,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scaleX,
                    scaleY: scaleY,
                    angle: currentImage.angle
                });
                
                canvas.remove(currentImage);
                canvas.remove(cropRect);
                canvas.add(newImg);
                canvas.setActiveObject(newImg);
                
                currentImage = newImg;
                isCropping = false;
                cropRect = null;
            });
        });
    }
    
    // Ferramentas de desenho
    document.getElementById('drawTool').addEventListener('click', function() {
        isDrawingMode = !isDrawingMode;
        
        if (isDrawingMode) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = parseInt(document.getElementById('brushSize').value);
            canvas.freeDrawingBrush.color = document.getElementById('brushColor').value;
            this.classList.add('active');
            document.getElementById('eraseTool').classList.remove('active');
        } else {
            canvas.isDrawingMode = false;
            this.classList.remove('active');
        }
    });
    
    document.getElementById('eraseTool').addEventListener('click', function() {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = parseInt(document.getElementById('brushSize').value);
        canvas.freeDrawingBrush.color = 'rgba(0,0,0,0)'; // Transparente para "apagar"
        this.classList.add('active');
        document.getElementById('drawTool').classList.remove('active');
        isDrawingMode = true;
    });
    
    document.getElementById('brushSize').addEventListener('input', function() {
        if (isDrawingMode) {
            canvas.freeDrawingBrush.width = parseInt(this.value);
        }
    });
    
    document.getElementById('brushColor').addEventListener('input', function() {
        if (isDrawingMode && !document.getElementById('eraseTool').classList.contains('active')) {
            canvas.freeDrawingBrush.color = this.value;
        }
    });
    
    // Ferramenta de texto
    document.getElementById('addText').addEventListener('click', function() {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return;
        
        const textObj = new fabric.Text(text, {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            fontFamily: 'Arial',
            fontSize: parseInt(document.getElementById('textSize').value),
            fill: document.getElementById('textColor').value,
            originX: 'center',
            originY: 'center'
        });
        
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
    });
    
    // Botões de ação
    resetBtn.addEventListener('click', function() {
        if (currentImage) {
            currentImage.filters = [];
            currentImage.applyFilters();
            brightnessSlider.value = 0;
            contrastSlider.value = 0;
            saturationSlider.value = 0;
            canvas.renderAll();
        }
    });
    
    downloadBtn.addEventListener('click', function() {
        if (!currentImage) return;
        
        const link = document.createElement('a');
        link.download = 'imagem-editada.png';
        link.href = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        link.click();
    });
    
    // Salvar estado para undo/redo (simplificado)
    let history = [];
    let historyIndex = -1;
    
    function saveState() {
        // Limpar estados futuros se fizermos uma nova ação após undo
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        history.push(JSON.stringify(canvas));
        historyIndex++;
        
        // Limitar o histórico para não consumir muita memória
        if (history.length > 20) {
            history.shift();
            historyIndex--;
        }
    }
    
    // Adicionar ouvintes para salvar estado quando ocorrem mudanças
    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);
    
    // Implementação básica de undo/redo (pode ser adicionada à UI)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            // Undo
            if (historyIndex > 0) {
                historyIndex--;
                canvas.loadFromJSON(history[historyIndex], function() {
                    canvas.renderAll();
                });
            }
        } else if (e.ctrlKey && e.key === 'y') {
            // Redo
            if (historyIndex < history.length - 1) {
                historyIndex++;
                canvas.loadFromJSON(history[historyIndex], function() {
                    canvas.renderAll();
                });
            }
        }
    });
});