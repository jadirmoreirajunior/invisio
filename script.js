// 1. Obter referências dos elementos HTML
const imageUpload = document.getElementById('imageUpload');
const originalImage = document.getElementById('originalImage');
const removeButton = document.getElementById('removeButton');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d'); // Contexto 2D para desenhar e manipular pixels

let imgElement = new Image(); // Objeto Image para carregar a imagem

// 2. Ouvir o evento de upload de ficheiro
imageUpload.addEventListener('change', (event) => {
    // Verifica se um ficheiro foi carregado
    const file = event.target.files[0];
    if (file) {
        // Cria um URL temporário para o ficheiro carregado
        const reader = new FileReader();
        reader.onload = (e) => {
            // Carrega a imagem no objeto Image
            imgElement.onload = () => {
                // Configura as dimensões da prévia e do canvas
                originalImage.src = e.target.result;
                originalImage.style.display = 'block';

                // Define as dimensões do canvas para a imagem
                resultCanvas.width = imgElement.naturalWidth;
                resultCanvas.height = imgElement.naturalHeight;
                
                // Desenha a imagem no canvas original (para fins de manipulação)
                ctx.drawImage(imgElement, 0, 0);

                // Habilita o botão de remoção
                removeButton.disabled = false;
            };
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file); // Lê o ficheiro como Data URL
    }
});

// 3. Função para calcular a distância entre duas cores (em RGB)
// Ajuda a decidir se uma cor é "próxima o suficiente" do fundo
function colorDistance(r1, g1, b1, r2, g2, b2) {
    // Fórmula de distância euclidiana
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

// 4. Ouvir o evento do botão de remover
removeButton.addEventListener('click', () => {
    if (imgElement.src) {
        removeBackgroundSimple();
    }
});

// 5. Função principal de remoção de fundo (Simples)
function removeBackgroundSimple() {
    // 1. Desenha a imagem original no canvas para obter os dados de pixel
    ctx.drawImage(imgElement, 0, 0, resultCanvas.width, resultCanvas.height);
    
    // 2. Obtém todos os dados de pixel da imagem
    // imageData.data é um array 1D com [R1, G1, B1, A1, R2, G2, B2, A2, ...]
    const imageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
    const data = imageData.data;
    const pixelCount = data.length / 4;

    // 3. Escolhe a cor de fundo (vamos usar o pixel do canto superior esquerdo como amostra)
    // O array é [R, G, B, A] para o primeiro pixel
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    
    // 4. Define uma tolerância (quanto maior, mais cores "próximas" ao fundo serão removidas)
    const TOLERANCE = 80; // Você pode ajustar este valor!

    // 
    
    // 5. Itera sobre todos os pixels
    for (let i = 0; i < pixelCount; i++) {
        const index = i * 4; // Cada pixel tem 4 componentes (R, G, B, A)
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        // O valor de data[index + 3] é o canal Alpha (transparência)

        // Calcula a distância da cor atual para a cor de fundo amostrada
        const distance = colorDistance(r, g, b, bgR, bgG, bgB);

        // Se a distância for menor que a tolerância, tornamos o pixel transparente
        if (distance < TOLERANCE) {
            // Define o canal Alpha (transparência) para 0 (totalmente transparente)
            data[index + 3] = 0; 
        } else {
            // Mantém a transparência original ou define como 255 (totalmente opaco)
            data[index + 3] = 255; 
        }
    }

    // 6. Coloca os novos dados de pixel de volta no canvas
    ctx.putImageData(imageData, 0, 0);

    alert('Remoção de fundo básica concluída! (A cor de fundo foi determinada pelo pixel superior esquerdo.)');
}
