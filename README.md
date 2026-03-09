# The Floor – Web Game Platform

A single-screen web game inspired by the TV show **"The Floor"**. One host controls everything — set up the board, run duels, and watch players conquer tiles until one champion remains.

![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow) ![No Build](https://img.shields.io/badge/No_Build-Required-green) ![GitHub Pages](https://img.shields.io/badge/GitHub-Pages_Ready-blue)

## How It Works

### Setup
1. Open `index.html` in a browser (or visit your GitHub Pages URL)
2. Click **New Game**
3. Choose grid size: **9** (3×3), **12** (4×3), or **16** (4×4) players
4. For each tile, enter:
   - **Player name**
   - **Color** (for their territory)
   - **Category name**
   - **Upload 3+ images** for that category (used in duels)
5. Click **Start Game**

### Game Board
- The board shows a grid of colored tiles, each belonging to a player
- Click a tile to select a **challenger**
- Then click an **adjacent tile** (highlighted) owned by a different player to initiate a **duel**
- The duel is always played on the **defender's category** (like the show)

### Duels
Duels are turn-based with a **45-second clock per player**:

1. **Player A's turn** starts — an image from the category appears
2. The host clicks **✓ Correct** if the player identifies it → image is removed, turn switches to Player B
3. The host clicks **⏭ Skip** if the player can't answer → **3-second penalty**, next image shown (same player's turn)
4. When it's **Player B's turn**, their 45-second clock counts down instead
5. **A player loses when their clock hits 0:00**
6. If all images are exhausted, the player with **more time remaining wins**

### Conquering
- The **winner takes ALL tiles** of the loser (not just the challenged tile)
- The loser is **eliminated** from the game
- Play continues until **one player owns every tile** — they are the champion!

### Persistence
- Game state is auto-saved to `localStorage` after every action
- Refresh the browser? Just click **Resume Game** on the home screen

## Deployment

### GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` / `root`
4. Your game will be live at `https://<username>.github.io/<repo-name>/`

### Local
Just open `index.html` in any modern browser. No server needed.

## Tech Stack
- **HTML5 / CSS3 / Vanilla JavaScript** — zero dependencies, no build step
- **localStorage** for persistence
- **CSS Grid** for the game board
- Images stored as compressed base64 data URLs (~600px max dimension, JPEG quality 70%)

## Storage Limits
Since images are stored in `localStorage` (browser limit ~5MB), keep images reasonable:
- **Recommended:** 5–10 images per category, under 200KB each
- Images are auto-compressed on upload (max 600px, JPEG 70%)
- The app warns if approaching the storage limit

## File Structure
```
the-floor-game/
├── index.html          # Single-page app shell
├── css/
│   └── styles.css      # Dark theme, responsive layout
├── js/
│   ├── app.js          # View router & state machine
│   ├── setup.js        # Setup screen (players, categories, images)
│   ├── board.js        # Game board grid & duel initiation
│   ├── duel.js         # Duel engine (timer, images, scoring)
│   ├── storage.js      # localStorage helpers
│   └── utils.js        # Shared utilities
└── README.md
```

## License
MIT
