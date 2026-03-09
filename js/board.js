/* ============================
   board.js  –  Game Board (Grid + Tile Logic)
   ============================ */

const Board = (() => {
    let state = null;
    let selectedTileIndex = null;

    /** Render the board from current state */
    function render() {
        state = Storage.load();
        if (!state) return;

        selectedTileIndex = null;

        const grid = document.getElementById('game-grid');
        grid.innerHTML = '';

        // Set grid class
        grid.className = 'game-grid';
        if (state.cols === 3 && state.rows === 3) grid.classList.add('grid-3x3');
        else if (state.cols === 4 && state.rows === 3) grid.classList.add('grid-4x3');
        else grid.classList.add('grid-4x4');

        // Count tiles per player
        const tileCounts = {};
        state.tiles.forEach(t => {
            tileCounts[t.ownerIndex] = (tileCounts[t.ownerIndex] || 0) + 1;
        });

        // Render each tile
        state.tiles.forEach((tile, idx) => {
            const player = state.players[tile.ownerIndex];
            const category = state.categories[tile.categoryIndex];

            const div = document.createElement('div');
            div.className = 'grid-tile';
            div.dataset.index = idx;
            div.style.backgroundColor = player.color;

            div.innerHTML = `
                <span class="tile-player-name">${escapeHtml(player.name)}</span>
                <span class="tile-category">${escapeHtml(category.name)}</span>
                ${tileCounts[tile.ownerIndex] > 1 ? `<span class="tile-count">${tileCounts[tile.ownerIndex]} tiles</span>` : ''}
            `;

            div.addEventListener('click', () => onTileClick(idx));
            grid.appendChild(div);
        });

        // Update info bar
        const alivePlayers = state.players.filter(p => p.alive).length;
        document.getElementById('board-players-left').textContent = `Players: ${alivePlayers}`;
        document.getElementById('board-duels-count').textContent = `Duels: ${state.duelsPlayed}`;

        // Reset instruction
        updateInstruction('Click a tile to select a <strong>challenger</strong>, then click an adjacent tile to start a duel.');

        // Check for victory
        checkVictory();
    }

    /** Handle tile click */
    function onTileClick(idx) {
        state = Storage.load();
        if (!state) return;

        const tile = state.tiles[idx];

        if (selectedTileIndex === null) {
            // First click: select challenger
            selectTile(idx);
        } else if (selectedTileIndex === idx) {
            // Clicked same tile: deselect
            deselectAll();
        } else {
            // Second click: check if valid duel target
            const challengerTile = state.tiles[selectedTileIndex];
            const defenderTile = state.tiles[idx];

            // Must be different owners
            if (challengerTile.ownerIndex === defenderTile.ownerIndex) {
                // Clicked own tile — re-select this one as challenger instead
                deselectAll();
                selectTile(idx);
                return;
            }

            // Must be adjacent
            if (!Utils.areAdjacent(selectedTileIndex, idx, state.cols)) {
                updateInstruction('⚠ Those tiles are not adjacent. Pick an adjacent opponent tile.');
                return;
            }

            // Show duel confirmation modal
            showDuelModal(selectedTileIndex, idx);
        }
    }

    /** Select a tile (visually) and highlight adjacent opponents */
    function selectTile(idx) {
        selectedTileIndex = idx;
        const tiles = document.querySelectorAll('.grid-tile');

        tiles.forEach((div, i) => {
            div.classList.remove('selected', 'adjacent-hint');
            if (i === idx) {
                div.classList.add('selected');
            } else if (
                Utils.areAdjacent(i, idx, state.cols) &&
                state.tiles[i].ownerIndex !== state.tiles[idx].ownerIndex
            ) {
                div.classList.add('adjacent-hint');
            }
        });

        const player = state.players[state.tiles[idx].ownerIndex];
        updateInstruction(`<strong>${escapeHtml(player.name)}</strong> selected. Now click an adjacent tile (blinking) to challenge.`);
    }

    /** Deselect all tiles */
    function deselectAll() {
        selectedTileIndex = null;
        document.querySelectorAll('.grid-tile').forEach(div => {
            div.classList.remove('selected', 'adjacent-hint');
        });
        updateInstruction('Click a tile to select a <strong>challenger</strong>, then click an adjacent tile to start a duel.');
    }

    /** Show the duel confirmation modal */
    function showDuelModal(challengerIdx, defenderIdx) {
        const challenger = state.players[state.tiles[challengerIdx].ownerIndex];
        const defender = state.players[state.tiles[defenderIdx].ownerIndex];
        const category = state.categories[state.tiles[defenderIdx].categoryIndex];

        document.getElementById('modal-challenger-name').textContent = challenger.name;
        document.getElementById('modal-challenger-color').style.backgroundColor = challenger.color;
        document.getElementById('modal-defender-name').textContent = defender.name;
        document.getElementById('modal-defender-color').style.backgroundColor = defender.color;
        document.getElementById('modal-category-name').textContent = category.name;

        const modal = document.getElementById('duel-modal');
        modal.style.display = 'flex';

        // Cancel button
        document.getElementById('btn-cancel-duel').onclick = () => {
            modal.style.display = 'none';
            deselectAll();
        };

        // Confirm button
        document.getElementById('btn-confirm-duel').onclick = () => {
            modal.style.display = 'none';
            startDuel(challengerIdx, defenderIdx);
        };
    }

    /** Transition to duel */
    function startDuel(challengerIdx, defenderIdx) {
        const challengerOwner = state.tiles[challengerIdx].ownerIndex;
        const defenderOwner = state.tiles[defenderIdx].ownerIndex;
        const categoryIdx = state.tiles[defenderIdx].categoryIndex;

        Duel.setup(challengerOwner, defenderOwner, categoryIdx, challengerIdx, defenderIdx);
        App.navigate('duel');
    }

    /**
     * Called by Duel when a duel ends.
     * winnerPlayerIndex: index in state.players
     * loserPlayerIndex: index in state.players
     */
    function applyDuelResult(winnerPlayerIndex, loserPlayerIndex) {
        state = Storage.load();
        if (!state) return;

        // Transfer all of loser's tiles to the winner
        state.tiles.forEach(tile => {
            if (tile.ownerIndex === loserPlayerIndex) {
                tile.ownerIndex = winnerPlayerIndex;
            }
        });

        // Mark loser as eliminated
        state.players[loserPlayerIndex].alive = false;

        // Increment duel counter
        state.duelsPlayed++;

        Storage.save(state);
    }

    /** Check if only one player remains */
    function checkVictory() {
        state = Storage.load();
        if (!state) return;

        const alivePlayers = state.players.filter(p => p.alive);
        if (alivePlayers.length === 1 && state.gameStarted) {
            const winnerIdx = state.players.findIndex(p => p.alive);
            state.gameOver = true;
            state.winnerId = winnerIdx;
            Storage.save(state);

            // Small delay for the board to finalize rendering
            setTimeout(() => {
                App.navigate('victory');
            }, 600);
        }
    }

    /** Update the instruction text below the board */
    function updateInstruction(html) {
        document.getElementById('board-instruction-text').innerHTML = html;
    }

    /** Simple HTML escape */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { render, applyDuelResult };
})();
