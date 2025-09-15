This is an **interactive Cluedo Clue Sheet** built with HTML, CSS, and JavaScript. It allows players to track cards during a game, mark what they know, and see helpful visual cues to solve the mystery.

## Features

- Dynamic table for suspects, weapons, and rooms.
- Clickable cells with a custom **context menu**:
  - ❌, ✅, ❓ for tracking possibilities
  - 1️⃣–6️⃣ to mark player ownership
  - 🗑️ to clear a cell
- Automatically updates **known cards counter** per player.
- Highlights suspects or items based on logic:
  - 3 ❌ marks → bold green text
  - ✅ mark → crosses out the item
- Click on a card name to cycle through:
  - Crossed out → highlighted with arrow → normal
- Undo/Redo functionality.
- Adjustable number of players (3–6).

## How to Use

1. Click on a cell under a player to mark a card.
2. Use the context menu to choose the symbol.
3. Known cards for each player are automatically counted.
4. Click on a card name to mark its status (cross, highlight with arrow, normal).

## Live Demo

[View the live Cluedo Clue Sheet on GitHub Pages](https://MasterBatess.github.io/cluedo-clue-sheet/)

## License

This project is open-source and free to use.
