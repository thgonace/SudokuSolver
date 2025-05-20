🧩 SudokuSolver
A lightweight, browser-based Sudoku solver built with HTML, CSS, and JavaScript. This application allows users to input Sudoku puzzles and receive instant solutions directly in their web browser—no installations or dependencies required.

🚀 Features
Interactive Grid: Click on cells to input your Sudoku puzzle.

Instant Solving: Utilizes a backtracking algorithm to solve puzzles efficiently.

Responsive Design: Optimized for both desktop and mobile browsers.

User-Friendly Interface: Clean and intuitive layout for seamless user experience.

🖥️ Demo
Experience the live application here: SudokuSolver Demo


📂 Project Structure
bash
Copy
Edit
SudokuSolver/
├── index.html          # Main HTML file
├── sudoku.css          # Stylesheet for the application
├── sudokuSolver.js     # JavaScript logic for solving Sudoku
└── README.md           # Project documentation
🛠️ Getting Started
To run the application locally:

Clone the repository:

bash
Copy
Edit
git clone https://github.com/thgonace/SudokuSolver.git
Navigate to the project directory:

bash
Copy
Edit
cd SudokuSolver
Open index.html in your preferred web browser.

You can simply double-click the index.html file or serve it using a local development server.

🧠 How It Works
The solver employs a classic backtracking algorithm:

Find Empty Cell: Scans the grid to find an empty cell.

Attempt Numbers: Tries numbers 1 through 9 in the empty cell.

Validation: Checks if the number doesn't violate Sudoku rules.

Recursion: Recursively attempts to fill the next empty cell.

Backtrack: If no valid number is found, backtracks to the previous cell.

This process continues until the puzzle is solved or determined unsolvable.

📌 Usage
Input Puzzle: Click on the cells and enter the known numbers of your Sudoku puzzle.

Solve: Click the "Solve" button to compute the solution.

Reset: Use the "Reset" button to clear the grid and input a new puzzle.

🤝 Contributing
Contributions are welcome! Here's how you can help:

Bug Reports: If you encounter any issues, please open an issue.

Feature Requests: Have an idea to improve the application? Let us know!

Pull Requests: Feel free to fork the repository and submit pull requests.

📄 License
This project is licensed under the MIT License.

Happy Solving! 🧠

