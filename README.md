# Tiny Arcade — JavaScript Assignment 5

A small responsive project for Assignment #5 (JavaScript Basics: DOM Manipulation & Events). It uses plain HTML, CSS, and JavaScript with no libraries.

## Run it

Open `index.html` in a browser. There is no build step or package installation.

## Chosen options

1. **Task 1 — Higher or Lower:** random values from 1 through 99, three lives, a current streak, and a saved best streak. Equal values count as a correct guess. The game can restart without reloading.
2. **Task 2 — Kanban board:** ten task objects, three columns, title search, tag filter, priority sorting, a completion progress bar, and a three-card limit for In progress.
3. **Task 3 — Character creator:** live preview, class-specific skill requirement, exact skill point total, unique-name check, accessible field errors, a validation summary, and a DOM-built result.

Each task's behavior is kept in its own JavaScript file: `task1.js`, `task2.js`, and `task3.js`.

## Project files

- `index.html` — semantic page structure and empty board containers.
- `styles.css` — visual theme, interaction states, and responsive layouts.
- `task1.js` — Higher or Lower game.
- `task2.js` — Kanban data, rendering, filtering, sorting, and delegated card actions.
- `task3.js` — character form, validation, preview, and result.
- `REPORT.md` — report draft to personalize and complete with screenshots and the repository URL.

The card content is inserted with `createElement`, `textContent`, and `append`; no user-provided task data is inserted with `innerHTML`.
