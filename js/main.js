const CONFIG = {
    hexSize: 50,
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
            [0,0,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,0,0]
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
    },
    resourceTypes: [
        { id: 'fields', name: 'Пшеница', symbol: '🌾', color: '#f5e6a1', default: 4 },
        { id: 'forest', name: 'Лес', symbol: '🌲', color: '#9ccc65', default: 4 },
        { id: 'pasture', name: 'Пастбище', symbol: '🐑', color: '#c8e6c9', default: 4 },
        { id: 'hills', name: 'Холмы', symbol: '🧱', color: '#ef9a9a', default: 3 },
        { id: 'mountains', name: 'Горы', symbol: '⛰️', color: '#b0bec5', default: 3 },
        { id: 'desert', name: 'Пустыня', symbol: '🏜️', color: '#ffe0b2', default: 1 }
    ]
};

// Основные функции
function createEmptyHexMap() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
    const layout = CONFIG.layouts[selectedSize];

    const hexWidth = CONFIG.hexSize * Math.sqrt(3);
    const rowHeight = CONFIG.hexSize * 1.5;

    layout.forEach((row, rowIndex) => {
        const y = rowIndex * rowHeight;

        row.forEach((cell, colIndex) => {
            if (cell === 1) {
                const xOffset = (rowIndex % 2) * hexWidth / 2;
                const x = colIndex * hexWidth + xOffset;

                const hex = document.createElement('div');
                hex.className = 'hexagon empty';
                hex.style.setProperty('--hex-size', `${CONFIG.hexSize}px`);
                hex.style.left = `${x}px`;
                hex.style.top = `${y}px`;
                hex.dataset.row = rowIndex;
                hex.dataset.col = colIndex;
                hex.title = `Гексагон (${colIndex}, ${rowIndex})`;

                board.appendChild(hex);
            }
        });
    });

    centerBoard(layout);
}

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

    container.scrollLeft = (board.scrollWidth - container.clientWidth) / 2;
    container.scrollTop = (board.scrollHeight - container.clientHeight) / 2;
}

function getNeighbors(row, col, layout) {
    const neighbors = [];
    const isOddRow = row % 2 !== 0;

    const neighborOffsets = [
        [-1, 0], [1, 0],
        [0, -1], [0, 1],
        [isOddRow ? 1 : -1, isOddRow ? -1 : 1],
        [isOddRow ? 1 : -1, isOddRow ? 1 : -1]
    ];

    neighborOffsets.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;

        if (newRow >= 0 && newRow < layout.length &&
            newCol >= 0 && newCol < layout[newRow].length &&
            layout[newRow][newCol] === 1) {
            neighbors.push({ row: newRow, col: newCol });
        }
    });

    return neighbors;
}

function getTotalCells() {
    const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
    const layout = CONFIG.layouts[selectedSize];
    return layout.flat().filter(cell => cell === 1).length;
}

function randomizeResourceCounts() {
    const totalCells = getTotalCells();
    const desertCount = Math.min(2, Math.max(1, Math.floor(totalCells / 12)));
    const remainingCells = totalCells - desertCount;

    CONFIG.resourceTypes.forEach(resource => {
        if (resource.id === 'desert') {
            document.getElementById(`${resource.id}-count`).value = desertCount;
        } else {
            const max = Math.floor(remainingCells * 0.3);
            const min = Math.max(2, Math.floor(remainingCells * 0.1));
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            document.getElementById(`${resource.id}-count`).value = count;
        }
    });

    adjustResourceCounts();
}

function adjustResourceCounts() {
    const totalCells = getTotalCells();
    let totalAssigned = 0;
    const resources = [];

    CONFIG.resourceTypes.forEach(resource => {
        const count = parseInt(document.getElementById(`${resource.id}-count`).value) || 0;
        totalAssigned += count;
        resources.push({ id: resource.id, count, element: document.getElementById(`${resource.id}-count`) });
    });

    while (totalAssigned > totalCells) {
        resources.sort((a, b) => b.count - a.count);
        for (let res of resources) {
            if (res.count > 1) {
                res.count--;
                res.element.value = res.count;
                totalAssigned--;
                break;
            }
        }
    }

    while (totalAssigned < totalCells) {
        resources.sort((a, b) => a.count - b.count);
        for (let res of resources) {
            if (res.id !== 'desert' || (res.id === 'desert' && res.count < 2)) {
                res.count++;
                res.element.value = res.count;
                totalAssigned++;
                break;
            }
        }
    }
}

function createResourcePool() {
    const pool = [];

    CONFIG.resourceTypes.forEach(resource => {
        const count = parseInt(document.getElementById(`${resource.id}-count`).value) || 0;
        for (let i = 0; i < count; i++) {
            pool.push({
                type: resource.id,
                name: resource.name,
                symbol: resource.symbol
            });
        }
    });

    return shuffleArray(pool);
}

// Функция для проверки запрещенных чисел у соседей
function getForbiddenNumbers(hex, hexGrid, layout) {
    const forbidden = new Set();
    const row = parseInt(hex.dataset.row);
    const col = parseInt(hex.dataset.col);
    const neighbors = getNeighbors(row, col, layout);

    neighbors.forEach(neighbor => {
        const neighborHex = hexGrid[neighbor.row]?.[neighbor.col];
        if (neighborHex && neighborHex.dataset.number) {
            forbidden.add(parseInt(neighborHex.dataset.number));
        }
    });

    return forbidden;
}

function distributeNumbers() {
    const board = document.getElementById('game-board');
    // Получаем все непустые гексы, кроме пустыни
    const hexagons = Array.from(board.querySelectorAll('.hexagon:not(.desert):not(.empty)'));
    const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
    const layout = CONFIG.layouts[selectedSize];

    if (hexagons.length === 0) return;

    // Создаем циклический пул чисел [2,3,4,5,6,8,9,10,11,12,2,3,...]
    const baseNumbers = [2,3,4,5,6,8,9,10,11,12];
    const numberPool = [];
    const neededNumbers = hexagons.length;

    for (let i = 0; i < neededNumbers; i++) {
        numberPool.push(baseNumbers[i % baseNumbers.length]);
    }

    // Перемешиваем, но сохраняя относительный порядок
    const shuffledPool = shuffleWithOrder(numberPool);

    // Создаем сетку для быстрого доступа
    const hexGrid = {};
    hexagons.forEach(hex => {
        const row = parseInt(hex.dataset.row);
        const col = parseInt(hex.dataset.col);
        if (!hexGrid[row]) hexGrid[row] = {};
        hexGrid[row][col] = hex;
    });

    // Распределяем числа с учетом ограничений
    const availableHexes = [...hexagons];
    const numbersToPlace = [...shuffledPool];

    while (numbersToPlace.length > 0 && availableHexes.length > 0) {
        const number = numbersToPlace.shift();
        let placed = false;
        let attempts = 0;
        const maxAttempts = availableHexes.length * 2;

        // Пытаемся разместить число
        while (!placed && attempts < maxAttempts && availableHexes.length > 0) {
            attempts++;
            const randomIndex = Math.floor(Math.random() * availableHexes.length);
            const hex = availableHexes[randomIndex];

            // Проверяем соседей
            const forbiddenNumbers = getForbiddenNumbers(hex, hexGrid, layout);
            if (!forbiddenNumbers.has(number)) {
                // Размещаем число
                const numberElement = document.createElement('div');
                numberElement.className = 'hex-number';
                numberElement.textContent = number;
                hex.appendChild(numberElement);
                hex.dataset.number = number;

                // Удаляем из доступных
                availableHexes.splice(randomIndex, 1);
                placed = true;
            }
        }

        // Если не удалось разместить с ограничениями
        if (!placed && availableHexes.length > 0) {
            const hex = availableHexes.shift();
            const numberElement = document.createElement('div');
            numberElement.className = 'hex-number';
            numberElement.textContent = number;
            hex.appendChild(numberElement);
            hex.dataset.number = number;
        }
    }
}

// Перемешивание с сохранением относительного порядка чисел
function shuffleWithOrder(array) {
    const chunks = [];
    const chunkSize = 10; // Размер нашего базового набора чисел

    // Разбиваем на части по 10 элементов
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }

    // Перемешиваем каждую часть
    chunks.forEach(chunk => shuffleArray(chunk));

    // Собираем обратно
    return chunks.flat();
}

function distributeResources(randomize = false) {
    if (randomize) {
        randomizeResourceCounts();
    }

    createEmptyHexMap();

    const board = document.getElementById('game-board');
    const hexagons = Array.from(board.querySelectorAll('.hexagon'));
    const selectedSize = document.querySelector('input[name="board-size"]:checked').value;
    const layout = CONFIG.layouts[selectedSize];
    const noAdjacentSame = document.getElementById('no-adjacent-same').checked;

    let resourcePool = createResourcePool();
    const totalCells = getTotalCells();

    if (resourcePool.length > totalCells) {
        resourcePool = resourcePool.slice(0, totalCells);
    } else if (resourcePool.length < totalCells) {
        const diff = totalCells - resourcePool.length;
        for (let i = 0; i < diff; i++) {
            resourcePool.push({ type: 'empty', name: 'Пусто', symbol: '' });
        }
    }

    if (noAdjacentSame) {
        // Улучшенный алгоритм распределения с ограничениями
        const hexGrid = {};
        const availableHexes = [...hexagons];

        // Создаем карту гексов для быстрого доступа
        hexagons.forEach(hex => {
            const row = parseInt(hex.dataset.row);
            const col = parseInt(hex.dataset.col);
            if (!hexGrid[row]) hexGrid[row] = {};
            hexGrid[row][col] = hex;
        });

        // Сначала размещаем ресурсы, которые сложнее всего разместить (пустыни, горы)
        resourcePool.sort((a, b) => {
            // Пустыни размещаем первыми, так как у них нет ограничений
            if (a.type === 'desert') return -1;
            if (b.type === 'desert') return 1;
            return 0;
        });

        // Функция для получения списка запрещенных типов для клетки
        const getForbiddenTypes = (hex) => {
            const forbidden = new Set();
            const row = parseInt(hex.dataset.row);
            const col = parseInt(hex.dataset.col);
            const neighbors = getNeighbors(row, col, layout);

            neighbors.forEach(neighbor => {
                const neighborHex = hexGrid[neighbor.row]?.[neighbor.col];
                if (neighborHex && !neighborHex.classList.contains('empty')) {
                    forbidden.add(neighborHex.classList[1]); // Второй класс - тип ресурса
                }
            });

            return forbidden;
        };

        // Распределяем ресурсы с учетом ограничений
        for (const resource of resourcePool) {
            if (resource.type === 'empty') continue;

            let placed = false;
            let attempts = 0;
            const maxAttempts = availableHexes.length * 3; // Увеличили количество попыток

            // Пытаемся найти подходящую клетку
            while (!placed && attempts < maxAttempts && availableHexes.length > 0) {
                attempts++;

                // Выбираем случайную клетку из доступных
                const randomIndex = Math.floor(Math.random() * availableHexes.length);
                const hex = availableHexes[randomIndex];

                // Получаем запрещенные типы для этой клетки
                const forbiddenTypes = getForbiddenTypes(hex);

                // Если тип ресурса не запрещен, размещаем
                if (!forbiddenTypes.has(resource.type)) {
                    hex.className = `hexagon ${resource.type}`;
                    hex.innerHTML = `<span class="resource-icon">${resource.symbol}</span>`;
                    hex.title = resource.name;

                    // Удаляем из доступных
                    availableHexes.splice(randomIndex, 1);
                    placed = true;
                }
            }

            // Если не удалось разместить с ограничениями, размещаем в первую доступную
            if (!placed && availableHexes.length > 0) {
                const hex = availableHexes.shift();
                hex.className = `hexagon ${resource.type}`;
                hex.innerHTML = `<span class="resource-icon">${resource.symbol}</span>`;
                hex.title = resource.name;
            }
        }

        // Оставшиеся клетки делаем пустыми
        availableHexes.forEach(hex => {
            hex.className = 'hexagon empty';
            hex.innerHTML = '';
            hex.title = 'Пустой слот';
        });
    } else {
        // Простое случайное распределение без ограничений
        resourcePool = shuffleArray(resourcePool);
        hexagons.forEach((hex, index) => {
            const resource = resourcePool[index] || { type: 'empty', name: 'Пусто', symbol: '' };

            if (resource.type === 'empty') {
                hex.className = 'hexagon empty';
                hex.innerHTML = '';
                hex.title = 'Пустой слот';
            } else {
                hex.className = `hexagon ${resource.type}`;
                hex.innerHTML = `<span class="resource-icon">${resource.symbol}</span>`;
                hex.title = resource.name;
            }
        });
    }
    distributeNumbers();
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.resourceTypes.forEach(resource => {
        document.getElementById(`${resource.id}-count`).value = resource.default;
    });

    createEmptyHexMap();

    // Обработчики событий
    document.getElementById('generate-btn').addEventListener('click', () => {
        distributeResources();
    });

    document.getElementById('randomize-counts-btn').addEventListener('click', () => {
        randomizeResourceCounts();
    });

    document.getElementById('randomize-distribution-btn').addEventListener('click', () => {
        distributeResources(true);
    });

    document.querySelectorAll('input[name="board-size"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (document.getElementById('random-counts').checked) {
                randomizeResourceCounts();
            }
        });
    });
});