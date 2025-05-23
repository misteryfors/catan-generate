const CONFIG = {
    hexSize: 50, // Размер гексагона (радиус вписанной окружности)
    layouts: {
        small: [
            [0,1,1,1,0],
            [1,1,1,1,0],
            [1,1,1,1,1],
            [1,1,1,1,0],
            [0,1,1,1,0]
        ],
        medium: [
            [0,1,1,1,0,1,1,1,0],
            [1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,0],
            [0,1,1,1,0,1,1,1,0]
        ],
        large: [
            [0,1,1,1,0,1,1,1,0],
            [1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,0,0],
            [0,0,0,1,1,1,0,0,0]
        ],
        huge: [
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,0,0]
        ]
    }
};

// Функция для создания пустой гексагональной карты
function createEmptyHexMap() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // Получаем выбранный размер карты
    const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
    const layout = CONFIG.layouts[selectedSize];

    // Рассчитываем размеры гексагона
    const hexWidth = CONFIG.hexSize * Math.sqrt(3);
    const hexHeight = CONFIG.hexSize * 2;
    const rowHeight = CONFIG.hexSize * 1.5;

    // Создаем гексагоны согласно layout
    layout.forEach((row, rowIndex) => {
        const y = rowIndex * rowHeight;

        row.forEach((cell, colIndex) => {
            if (cell === 1) {
                // Смещение для нечетных рядов
                const xOffset = (rowIndex % 2) * hexWidth / 2;
                const x = colIndex * hexWidth + xOffset;

                // Создаем гексагон
                const hex = document.createElement('div');
                hex.className = 'hexagon empty';
                hex.style.setProperty('--hex-size', `${CONFIG.hexSize}px`);
                hex.style.left = `${x}px`;
                hex.style.top = `${y}px`;
                hex.title = `Гексагон (${colIndex}, ${rowIndex})`;

                board.appendChild(hex);
            }
        });
    });

    // Центрируем карту
    centerBoard(layout);
}

// Функция для центрирования карты
function centerBoard(layout) {
    const board = document.getElementById('game-board');
    const container = document.querySelector('.game-board-container');

    if (!layout) {
        const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
        layout = CONFIG.layouts[selectedSize];
    }

    const cols = layout[0].length;
    const rows = layout.length;
    const hexWidth = CONFIG.hexSize * Math.sqrt(3);
    const rowHeight = CONFIG.hexSize * 1.5;

    const boardWidth = cols * hexWidth + CONFIG.hexSize;
    const boardHeight = rows * rowHeight;

    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;

    // Центрирование
    container.scrollLeft = (board.scrollWidth - container.clientWidth) / 2;
    container.scrollTop = (board.scrollHeight - container.clientHeight) / 2;
}

// Инициализация
document.getElementById('generate-empty-btn').addEventListener('click', createEmptyHexMap);

// Создаем карту при загрузке
window.addEventListener('load', createEmptyHexMap);