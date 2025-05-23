// Конфигурация игры
const CONFIG = {
    hexSize: 80,
    layout: [
        [0,1,1,1,0],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [0,1,1,1,0]
    ],
    resources: [
        {type: 'fields', name: 'Пшеница', symbol: '🌾'},
        {type: 'forest', name: 'Дерево', symbol: '🌲'},
        {type: 'pasture', name: 'Овца', symbol: '🐑'},
        {type: 'hills', name: 'Кирпич', symbol: '🧱'},
        {type: 'mountains', name: 'Камень', symbol: '⛰️'},
        {type: 'desert', name: 'Пустырь', symbol: '🏜️'}
    ],
    numbers: [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
    harborTypes: ['3:1', '3:1', '3:1', '3:1', 'кирпич', 'зерно', 'камень', 'дерево', 'шерсть']
};

// Генерация шестиугольника SVG
function createHexagon(board, x, y, isEmpty = false, resource = null, number = null) {
    const hex = document.createElement('div');
    hex.className = `hexagon ${isEmpty ? 'empty' : resource.type}`;
    hex.style.setProperty('--hex-size', `${CONFIG.hexSize}px`);

    // Позиционирование с учетом кирпичной кладки
    const offsetX = (CONFIG.hexSize / 2) * (rowIndex % 2);
    hex.style.left = `${x * CONFIG.hexSize + offsetX}px`;
    hex.style.top = `${y * CONFIG.hexSize * 0.86}px`;

    if (!isEmpty) {
        hex.title = resource.name;
        hex.innerHTML = `
            <span class="resource-icon">${resource.symbol}</span>
            ${number ? `<div class="hex-number">${number}</div>` : ''}
        `;
    }

    board.appendChild(hex);
}

// Генерация координат в стиле кирпичной кладки
function generateBrickLayout(hexSize) {
    const positions = [];
    const rows = [3, 4, 5, 4, 3]; // Схема рядов для Catan
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 1.5 * hexSize;

    for (let row = 0; row < rows.length; row++) {
        const cols = rows[row];
        const y = row * hexHeight;

        // Сдвигаем каждый второй ряд
        const xOffset = (row % 2) * hexWidth / 2;

        for (let col = 0; col < cols; col++) {
            const x = col * hexWidth + xOffset;
            positions.push({x, y});
        }
    }

    return {
        positions,
        width: Math.max(...positions.map(p => p.x)) + hexWidth,
        height: Math.max(...positions.map(p => p.y)) + hexHeight
    };
}

// Генерация поля
function generateBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    const shuffledResources = shuffleArray([...CONFIG.resources]);
    const shuffledNumbers = document.getElementById('random-numbers').checked
        ? shuffleArray([...CONFIG.numbers])
        : [...CONFIG.numbers];
    const shuffledHarbors = document.getElementById('random-harbors').checked
        ? shuffleArray([...CONFIG.harborTypes])
        : [...CONFIG.harborTypes];

    let resourceIndex = 0;

    CONFIG.layout.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 0) {
                // Создаем пустую ячейку
                createHexagon(board, colIndex, rowIndex, true);
            } else {
                // Создаем ячейку с ресурсом
                const resource = shuffledResources[resourceIndex % shuffledResources.length];
                const number = resource.type !== 'desert' && shuffledNumbers.length > 0
                    ? shuffledNumbers.pop()
                    : null;

                createHexagon(
                    board,
                    colIndex,
                    rowIndex,
                    false,
                    resource,
                    number
                );

                resourceIndex++;
            }
        });
    });

    centerBoard();
    updateHarborsInfo(shuffledHarbors);
}

function centerBoard() {
    const board = document.getElementById('game-board');
    const container = document.querySelector('.game-board-container');

    const cols = Math.max(...CONFIG.layout.map(row => row.length));
    const rows = CONFIG.layout.length;

    const boardWidth = cols * CONFIG.hexSize * 1.1;
    const boardHeight = rows * CONFIG.hexSize * 0.9;

    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;

    // Центрирование
    container.scrollLeft = (board.scrollWidth - container.clientWidth) / 2;
    container.scrollTop = (board.scrollHeight - container.clientHeight) / 2;
}

// Функция для перемешивания массива
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Инициализация и обработка ресайза
document.getElementById('generate-btn').addEventListener('click', generateBoard);
window.addEventListener('resize', generateBoard);
generateBoard();