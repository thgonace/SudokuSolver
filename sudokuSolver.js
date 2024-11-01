
const { useState } = React;

function SudokuBoard() {
    const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
    const [cellStyles, setCellStyles] = useState(
        Array(9).fill().map(() => Array(9).fill({ backgroundColor: 'white' }))
    );
    const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
    const [availableOptions, setAvailableOptions] = useState([]);
    const [possibilities, setPossibilities] = useState(
        Array(9).fill().map(() => Array(9).fill().map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])))
    );
    const [hidePossibilities, setHidePossibilities] = useState(Array(9).fill().map(() => Array(9).fill(false)));
    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        setHidePossibilities(prev => {
            const newHide = prev.map(row => row.slice());
            newHide[row][col] = true; // Hide possibilities for this cell
            return newHide;
        });
    };
    
    const initializePossibilities = (initialBoard) => {
        const newPossibilities = Array(9).fill().map(() =>
            Array(9).fill().map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
        );
    
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (initialBoard[row][col] !== 0) {
                    // If the cell has a fixed number, clear its possibilities
                    newPossibilities[row][col] = new Set();
    
                    // Remove this number from the possibilities in the same row, column, and block
                    const value = initialBoard[row][col];
                    for (let i = 0; i < 9; i++) {
                        newPossibilities[row][i].delete(value); // Row
                        newPossibilities[i][col].delete(value); // Column
                    }
                    const startRow = Math.floor(row / 3) * 3;
                    const startCol = Math.floor(col / 3) * 3;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            newPossibilities[startRow + i][startCol + j].delete(value); // Block
                        }
                    }
                }
            }
        }
    
        setPossibilities(newPossibilities);
    };
    const updatePossibilitiesAfterInput = (row, col, value) => {
        const newPossibilities = possibilities.map((rowArr) => rowArr.map((cell) => new Set(cell)));
    
        // Clear possibilities for the filled cell
        newPossibilities[row][col] = new Set();
    
        // Remove the new value from possibilities in the same row, column, and block
        for (let i = 0; i < 9; i++) {
            newPossibilities[row][i].delete(value);
            newPossibilities[i][col].delete(value);
        }
    
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                newPossibilities[startRow + i][startCol + j].delete(value);
            }
        }
    
        setPossibilities(newPossibilities);
    };
    

    const updateAvailableOptions = (row, col) => {
        const options = getPossibleValues(row, col);
        setAvailableOptions(options);
    };
    const findHiddenSingles = () => {
        const newBoard = board.map(row => row.slice());
        const newStyles = Array(9).fill().map(() => Array(9).fill({ backgroundColor: 'white' }));
        
        for (let num = 1; num <= 9; num++) {
            // Check each row for hidden singles
            for (let row = 0; row < 9; row++) {
                const possibleCols = [];
                for (let col = 0; col < 9; col++) {
                    if (newBoard[row][col] === 0 && isValid(newBoard, row, col, num)) {
                        possibleCols.push(col);
                    }
                }
                if (possibleCols.length === 1) {
                    const col = possibleCols[0];
                    newStyles[row][col] = { backgroundColor: 'lightgreen' }; // Highlight hidden single in the row
                    newBoard[row][col] = num; // Fill in the hidden single
                }
            }
    
            // Check each column for hidden singles
            for (let col = 0; col < 9; col++) {
                const possibleRows = [];
                for (let row = 0; row < 9; row++) {
                    if (newBoard[row][col] === 0 && isValid(newBoard, row, col, num)) {
                        possibleRows.push(row);
                    }
                }
                if (possibleRows.length === 1) {
                    const row = possibleRows[0];
                    newStyles[row][col] = { backgroundColor: 'lightgreen' }; // Highlight hidden single in the column
                    newBoard[row][col] = num; // Fill in the hidden single
                }
            }
    
            // Check each 3x3 block for hidden singles
            for (let boxRow = 0; boxRow < 3; boxRow++) {
                for (let boxCol = 0; boxCol < 3; boxCol++) {
                    const possibleCells = [];
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const row = boxRow * 3 + i;
                            const col = boxCol * 3 + j;
                            if (newBoard[row][col] === 0 && isValid(newBoard, row, col, num)) {
                                possibleCells.push({ row, col });
                            }
                        }
                    }
                    if (possibleCells.length === 1) {
                        const { row, col } = possibleCells[0];
                        newStyles[row][col] = { backgroundColor: 'lightgreen' }; // Highlight hidden single in the block
                        newBoard[row][col] = num; // Fill in the hidden single
                    }
                }
            }
        }
        
        setBoard(newBoard);         // Update the board with hidden singles filled in
        setCellStyles(newStyles);    // Update cell styles to highlight hidden singles
    };
    // Inside the SudokuBoard component
    React.useEffect(() => {
        // Define the function to handle global clicks
        const handleGlobalClick = () => {
            clearHighlights();
        };

        // Attach the event listener in capture phase
        document.addEventListener("click", handleGlobalClick, true);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("click", handleGlobalClick, true);
        };
    }, []);
    const handleInputChange = (row, col, value) => {
        if (/^[1-9]$/.test(value) || value === '') {
            const tempValue = value === '' ? 0 : parseInt(value);

            // Temporarily clear the target cell in newBoard before validation
            const newBoard = board.map((rowArr, i) =>
                rowArr.map((cell, j) => (i === row && j === col ? 0 : cell))
            );

            if (value === '' || isValid(newBoard, row, col, tempValue)) {
                clearHighlights();
                const finalBoard = board.map((rowArr, i) =>
                    rowArr.map((cell, j) => (i === row && j === col ? tempValue : cell))
                );
                setBoard(finalBoard);
                updatePossibilitiesAfterInput(row, col, tempValue);
            }
        }
    };

    const clearHighlights = () => {
        setCellStyles(Array(9).fill().map(() => Array(9).fill({ backgroundColor: 'white' })));
        setAvailableOptions([]); // Clear the options display
    };

    const resetBoard = () => {
        const newBoard = Array(9).fill().map(() => Array(9).fill(0));
        setBoard(newBoard);
        initializePossibilities(newBoard); // Initialize possibilities after resetting the board
        setCellStyles(Array(9).fill().map(() => Array(9).fill({})));
    };

    const generateSudoku = (difficulty = 'medium') => {
        resetBoard();
        const newBoard = generateFullBoard();
    
        let cellsToClear;
        if (difficulty === 'easy') cellsToClear = 30;
        else if (difficulty === 'medium') cellsToClear = 40;
        else cellsToClear = 50;
    
        for (let i = 0; i < cellsToClear; i++) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            newBoard[row][col] = 0;
        }
        setBoard(newBoard);
        initializePossibilities(newBoard); // Initialize possibilities based on the generated board
    };

    const solveSudoku = () => {
        const newBoard = board.map(row => row.slice());
        if (solve(newBoard)) {
            setBoard(newBoard);
        } else {
            alert("No solution found");
        }
    };

    const showHints = () => {
        const newStyles = cellStyles.map((rowArr, rowIndex) =>
            rowArr.map((style, colIndex) => {
                const possibleValues = getPossibleValues(rowIndex, colIndex);
                return possibleValues.length === 1 && board[rowIndex][colIndex] === 0
                    ? { backgroundColor: 'lightblue' }
                    : style;  // Preserve any existing styles
            })
        );
        setCellStyles(newStyles);
    };

    const getPossibleValues = (row, col) => {
        if (board[row][col] !== 0) return [];

        const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let i = 0; i < 9; i++) {
            possible.delete(board[row][i]);
            possible.delete(board[i][col]);
            possible.delete(
                board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)]
            );
        }
        return Array.from(possible);
    };

    const generateFullBoard = () => {
        const fullBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
        fillBoard(fullBoard);
        return fullBoard;
    };

    const fillBoard = (board) => {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const solve = (board) => {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const isValid = (board, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
            const startRow = 3 * Math.floor(row / 3) + Math.floor(x / 3);
            const startCol = 3 * Math.floor(col / 3) + x % 3;
            if (board[startRow][startCol] === num) return false;
        }
        return true;
    };

    const showUniques = () => {
        setCellStyles(prevStyles => {
            const newStyles = prevStyles.map(row =>
                row.map(cellStyle => cellStyle || { backgroundColor: 'white' }) // Ensure each cell has a defined style
            );
    
            for (let num = 1; num <= 9; num++) {
                // Check rows for unique positions
                for (let row = 0; row < 9; row++) {
                    const cells = [];
                    for (let col = 0; col < 9; col++) {
                        if (board[row][col] === 0 && isValid(board, row, col, num)) {
                            cells.push([row, col]);
                        }
                    }
                    if (cells.length === 1) {
                        const [uniqueRow, uniqueCol] = cells[0];
                        newStyles[uniqueRow][uniqueCol] = { ...newStyles[uniqueRow][uniqueCol], backgroundColor: 'yellow', dataContent: num };
                    }
                }
    
                // Check columns for unique positions
                for (let col = 0; col < 9; col++) {
                    const cells = [];
                    for (let row = 0; row < 9; row++) {
                        if (board[row][col] === 0 && isValid(board, row, col, num)) {
                            cells.push([row, col]);
                        }
                    }
                    if (cells.length === 1) {
                        const [uniqueRow, uniqueCol] = cells[0];
                        newStyles[uniqueRow][uniqueCol] = { ...newStyles[uniqueRow][uniqueCol], backgroundColor: 'yellow', dataContent: num };
                    }
                }
    
                // Check 3x3 blocks for unique positions
                for (let boxRow = 0; boxRow < 3; boxRow++) {
                    for (let boxCol = 0; boxCol < 3; boxCol++) {
                        const cells = [];
                        for (let row = 0; row < 3; row++) {
                            for (let col = 0; col < 3; col++) {
                                const actualRow = boxRow * 3 + row;
                                const actualCol = boxCol * 3 + col;
                                if (board[actualRow][actualCol] === 0 && isValid(board, actualRow, actualCol, num)) {
                                    cells.push([actualRow, actualCol]);
                                }
                            }
                        }
                        if (cells.length === 1) {
                            const [uniqueRow, uniqueCol] = cells[0];
                            newStyles[uniqueRow][uniqueCol] = { ...newStyles[uniqueRow][uniqueCol], backgroundColor: 'yellow', dataContent: num };
                        }
                    }
                }
            }
    
            return newStyles; // Return the fully updated cell styles
        });
    };
    const formatPossibilities = (possibilitiesSet) => {
        const possibilitiesArray = Array.from(possibilitiesSet);
        let formattedPossibilities = [];
    
        for (let i = 0; i < possibilitiesArray.length; i += 3) {
            const rowPossibilities = possibilitiesArray.slice(i, i + 3).join(" ");
            formattedPossibilities.push(rowPossibilities);
        }
    
        return formattedPossibilities.map((line, index) =>
            React.createElement(
                React.Fragment,
                { key: index },
                line,
                React.createElement("br")
            )
        );
    };
    
    const boardElements = board.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => {
            const borderClasses = [
                "sudoku-cell",
                rowIndex % 3 === 0 ? "border-top" : "",
                colIndex % 3 === 0 ? "border-left" : "",
                (colIndex + 1) % 3 === 0 ? "border-right" : "",
                (rowIndex + 1) % 3 === 0 ? "border-bottom" : ""
            ].join(" ");
    
            const cellStyle = (cellStyles[rowIndex] && cellStyles[rowIndex][colIndex])
                ? cellStyles[rowIndex][colIndex]
                : { backgroundColor: 'white' };
    
            return React.createElement("div", {
                id: `cell-${rowIndex}-${colIndex}`,
                key: `cell-${rowIndex}-${colIndex}`,
                className: borderClasses,
                style: { backgroundColor: cellStyle.backgroundColor },
                onClick: () => handleCellClick(rowIndex, colIndex)
            }, cell !== 0 || hidePossibilities[rowIndex][colIndex] ? (cell === 0 ? "" : cell) : React.createElement("div", {
                className: "possibilities"
            }, formatPossibilities(possibilities[rowIndex][colIndex])));
        })
    );
    

    
    
    return React.createElement(
        "div",
        { className: "sudoku-container" },
        React.createElement("h1", null, "Sudoku Solver"),
        React.createElement("div", { className: "board-container" },
            React.createElement("div", { className: "options-display" },
                React.createElement("h2", null, "Available Options"),
                React.createElement("div", null,
                    availableOptions.length ? availableOptions.join(", ") : "Select a cell"
                )
            ),
            React.createElement("div", { className: "sudoku-board" }, boardElements)
        ),
        React.createElement(
            "div",
            { className: "button-container" },
            React.createElement("button", { onClick: resetBoard, className: "sudoku-button" }, "Reset Board"),
            React.createElement("button", { onClick: () => generateSudoku('medium'), className: "sudoku-button" }, "Generate Board"),
            React.createElement("button", { onClick: solveSudoku, className: "sudoku-button" }, "Solve Board"),
            React.createElement("button", { onClick: showHints, className: "sudoku-button" }, "Show Hints"),
            React.createElement("button", { onClick: showUniques, className: "sudoku-button" }, "Show Unique Candidates"),
            React.createElement("button", { onClick: findHiddenSingles, className: "sudoku-button" }, "Show Hidden Singles")
        )
   
   
   
    );
}

// Render the SudokuBoard component to the root element
ReactDOM.render(React.createElement(SudokuBoard), document.getElementById('root'));
