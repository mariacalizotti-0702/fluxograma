document.addEventListener('DOMContentLoaded', () => {
  const colorPicker = document.getElementById('colorPicker');
  const favColorInput = document.getElementById('favColor');
  const whyColorInput = document.getElementById('whyColor');
  const canvas = document.getElementById('flowCanvas');
  const ctx = canvas.getContext('2d');
  const bgSplash1 = document.getElementById('bgSplash1');
  const colorBadge = document.getElementById('colorBadge');

  // Ajustar resolução do Canvas
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawFlowchart();
  }

  // Obter Valores do Formulário
  function getFormData() {
    const color = colorPicker.value;
    const colorName = favColorInput.value.trim() || 'Minha Cor';
    const why = whyColorInput.value.trim() || 'Sem motivo informado';
    
    const sinceChildRadio = document.querySelector('input[name="sinceChild"]:checked');
    const sinceChild = sinceChildRadio ? sinceChildRadio.value : '';

    const expressesRadio = document.querySelector('input[name="expressesYou"]:checked');
    const expresses = expressesRadio ? expressesRadio.value : '';

    return { color, colorName, why, sinceChild, expresses };
  }

  // Atualizar Cores Primárias da Interface
  function updateThemeColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
    bgSplash1.style.backgroundColor = color;
    colorBadge.style.backgroundColor = color;
    colorBadge.textContent = favColorInput.value || 'Sua Cor';
  }

  // Quebra de Texto para Nós do Fluxograma
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  }

  // Desenhar Nó com Estilo Tinta/Gota
  function drawPaintNode(x, y, width, height, title, content, color, icon) {
    ctx.save();

    // Sombra
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Fundo do Nó
    ctx.fillStyle = '#1e202e';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Forma Orgânica (Efeito Tintura)
    ctx.beginPath();
    ctx.roundRect(x - width/2, y - height/2, width, height, [16, 6, 20, 8]);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Cabeçalho / Título do Nó
    ctx.fillStyle = color;
    ctx.font = 'bold 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${icon} ${title.toUpperCase()}`, x, y - height/2 + 22);

    // Divisória Estilo Pincel
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - width/2 + 15, y - height/2 + 32);
    ctx.lineTo(x + width/2 - 15, y - height/2 + 32);
    ctx.stroke();

    // Texto de Conteúdo
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Fredoka", sans-serif';
    wrapText(ctx, content, x, y - height/2 + 50, width - 24, 16);

    ctx.restore();
  }

  // Desenhar Conexão curvada estilo Pincelada
  function drawBrushConnection(x1, y1, x2, y2, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const midY = (y1 + y2) / 2;
    ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
    ctx.stroke();

    // Seta / Respingo na Ponta
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x2, y2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Renderizar Todo o Fluxograma
  function drawFlowchart() {
    const data = getFormData();
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configuração das Posições dos Nós
    const nodeW = Math.min(w * 0.8, 260);
    const nodeH = 85;
    const centerX = w / 2;

    const y1 = 60;
    const y2 = 180;
    const y3 = 300;
    const y4 = 420;

    // Conexões
    drawBrushConnection(centerX, y1 + nodeH/2, centerX, y2 - nodeH/2, data.color);
    drawBrushConnection(centerX, y2 + nodeH/2, centerX, y3 - nodeH/2, '#00bcd4');
    drawBrushConnection(centerX, y3 + nodeH/2, centerX, y4 - nodeH/2, '#ff9800');

    // Nós
    drawPaintNode(centerX, y1, nodeW, nodeH, 'Cor Escolhida', data.colorName, data.color, '🎨');
    drawPaintNode(centerX, y2, nodeW, nodeH, 'Por que gosta', data.why, '#00bcd4', '💡');
    drawPaintNode(centerX, y3, nodeW, nodeH, 'Desde a Infância?', data.sinceChild, '#ff9800', '👶');
    drawPaintNode(centerX, y4, nodeW, nodeH, 'Fala por você?', data.expresses, '#9c27b0', '🗣️');
  }

  // Event Listeners para Atualização Dinâmica em Tempo Real
  colorPicker.addEventListener('input', (e) => {
    updateThemeColor(e.target.value);
    drawFlowchart();
  });

  favColorInput.addEventListener('input', () => {
    colorBadge.textContent = favColorInput.value || 'Sua Cor';
    drawFlowchart();
  });

  whyColorInput.addEventListener('input', drawFlowchart);

  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', drawFlowchart);
  });

  window.addEventListener('resize', resizeCanvas);

  // Inicialização
  updateThemeColor(colorPicker.value);
  resizeCanvas();
});