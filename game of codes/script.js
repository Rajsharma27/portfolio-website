let history = [];
let redoStack = [];
const initialBoard = [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9]
];

window.onload = function() {
    createGrid();
};

function createGrid() {
    const boardContainer = document.getElementById('sudoku-board');
    boardContainer.innerHTML = '';
    initialBoard.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.className = 'cell';
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.oninput = () => handleInput(rowIndex, colIndex);
            if (cellValue) {
                cell.value = cellValue;
                cell.disabled = true; // Make initial numbers uneditable
            }
            boardContainer.appendChild(cell);
        });
    });
}

function handleInput(row, col) {
    const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    const value = cell.value;
    if (value && (value < '1' || value > '9' || isNaN(value))) {
        cell.value = '';
        alert("Please enter a number between 1 and 9.");
        return;
    }

    history.push({ cellId: `cell-${row}-${col}`, previousValue: cell.dataset.previous || '', newValue: value });
    cell.dataset.previous = value;

    checkForDuplicates();
}

function checkForDuplicates() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.backgroundColor = ''; // Reset background color
    });

    const board = [];
    for (let i = 0; i < 9; i++) {
        board.push(Array(9).fill(''));
    }

    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const value = cell.value;
        if (value) board[row][col] = value;
    });

    // Check rows and columns for duplicates
    for (let i = 0; i < 9; i++) {
        highlightDuplicates(board[i], 'row', i); // Check rows
        highlightDuplicates(board.map(row => row[i]), 'column', i); // Check columns
    }

    // Check 3x3 subgrids for duplicates
    checkSubgrids(board);
}

function highlightDuplicates(values, type, index) {
    const seen = {};
    values.forEach((value, idx) => {
        if (value) {
            if (seen[value] !== undefined) {
                // Highlight the duplicate cell (row/column/subgrid)
                const firstDuplicateCell = document.querySelector(`.cell[data-row='${type === 'row' ? index : seen[value].row}'][data-col='${type === 'column' ? index : seen[value].col}']`);
                const secondDuplicateCell = document.querySelector(`.cell[data-row='${type === 'row' ? index : idx}'][data-col='${type === 'column' ? index : idx}']`);

                firstDuplicateCell.style.backgroundColor = 'lightcoral';
                secondDuplicateCell.style.backgroundColor = 'lightcoral';
            } else {
                seen[value] = { row: type === 'row' ? index : idx, col: type === 'column' ? index : idx };
            }
        }
    });
}

function checkSubgrids(board) {
    for (let r = 0; r < 9; r += 3) {
        for (let c = 0; c < 9; c += 3) {
            const subgrid = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const value = board[r + i][c + j];
                    if (value) subgrid.push({ value, row: r + i, col: c + j });
                }
            }
            highlightSubgridDuplicates(subgrid); // Check subgrid for duplicates
        }
    }
}

function highlightSubgridDuplicates(subgrid) {
    const seen = {};
    subgrid.forEach((cell, idx) => {
        const value = cell.value;
        if (seen[value] !== undefined) {
            // Highlight the duplicate cells within the subgrid
            const firstDuplicateCell = document.querySelector(`.cell[data-row='${seen[value].row}'][data-col='${seen[value].col}']`);
            const secondDuplicateCell = document.querySelector(`.cell[data-row='${cell.row}'][data-col='${cell.col}']`);

            firstDuplicateCell.style.backgroundColor = 'lightcoral';
            secondDuplicateCell.style.backgroundColor = 'lightcoral';
        } else {
            seen[value] = { row: cell.row, col: cell.col };
        }
    });
}

function checkCompletion() {
    const cells = document.querySelectorAll('.cell');
    const allFilled = Array.from(cells).every(cell => cell.value !== '');
    const noDuplicates = Array.from(cells).every(cell => cell.style.backgroundColor !== 'lightcoral');

    if (allFilled && noDuplicates) {
        showPopup();
    } else {
        alert("The puzzle is not yet correct. Keep trying!");
    }
}

function hint() {
    const cells = document.querySelectorAll('.cell');
    const board = [];

    // Convert cells to a 2D board array
    for (let i = 0; i < 9; i++) {
        board.push([]);
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
            board[i][j] = cell.value ? parseInt(cell.value) : 0;
        }
    }

    let hintGiven = false;

    // Loop through all cells (both filled and unfilled) and provide hints
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
            const currentValue = board[i][j];

            // Check only if the cell is either empty or has an incorrect value
            if (currentValue === 0 || !isValidValue(board, i, j, currentValue)) {
                // Get the valid numbers for this cell
                const validNumbers = getValidNumbers(board, i, j);
                if (validNumbers.length > 0) {
                    const hintNumber = validNumbers[0];

                    // If the cell was empty, fill it with the hint number
                    if (currentValue === 0) {
                        cell.value = hintNumber; // Provide the hint
                        history.push({ cellId: `cell-${i}-${j}`, previousValue: '', newValue: hintNumber });
                    } else {
                        // If the value was incorrect, suggest the correct number
                        cell.value = hintNumber;
                        history.push({ cellId: `cell-${i}-${j}`, previousValue: currentValue, newValue: hintNumber });
                    }

                    checkForDuplicates(); // Highlight duplicates after providing the hint
                    hintGiven = true;
                    break; // Exit loop after giving the hint
                }
            }
        }

        if (hintGiven) break; // Exit outer loop once a hint is given
    }

    if (!hintGiven) {
        alert("No hints available. The board might be complete or have no valid moves left.");
    }
}

// Helper function to get valid numbers for a specific cell
function getValidNumbers(board, row, col) {
    const usedNumbers = new Set();

    // Check the row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] !== 0) {
            usedNumbers.add(board[row][i]);
        }
    }

    // Check the column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] !== 0) {
            usedNumbers.add(board[i][col]);
        }
    }

    // Check the 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] !== 0) {
                usedNumbers.add(board[i][j]);
            }
        }
    }

    // The valid numbers are the ones not yet used
    const validNumbers = [];
    for (let num = 1; num <= 9; num++) {
        if (!usedNumbers.has(num)) {
            validNumbers.push(num);
        }
    }

    return validNumbers;
}

function isValidValue(board, row, col, value) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === value && c !== col) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === value && r !== row) return false;
    }

    // Check subgrid (3x3)
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r][c] === value && (r !== row || c !== col)) return false;
        }
    }

    return true;
}

function showPopup() {
    alert("Congratulations! You've completed the puzzle!");
}

