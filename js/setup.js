/* ============================
   setup.js  –  Game Setup Screen
   ============================ */

const Setup = (() => {
    let currentSize = 9;
    // Temporary images stored here before game starts (not in state yet)
    // categoryImages[i] = [base64, base64, ...]
    let categoryImages = [];

    /** Initialise the setup screen */
    function init() {
        currentSize = 9;
        categoryImages = [];
        bindEvents();
        buildTable(currentSize);
    }

    function bindEvents() {
        // Grid size radio buttons
        document.querySelectorAll('input[name="gridSize"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentSize = parseInt(e.target.value, 10);
                buildTable(currentSize);
            });
        });

        // Start game
        document.getElementById('btn-start-game').addEventListener('click', onStartGame);

        // Back button
        document.getElementById('btn-back-home').addEventListener('click', () => {
            App.navigate('home');
        });
    }

    /** Build the player table for N players */
    function buildTable(n) {
        const tbody = document.getElementById('players-tbody');
        tbody.innerHTML = '';
        categoryImages = new Array(n).fill(null).map(() => []);

        for (let i = 0; i < n; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td><input type="text" class="player-name" placeholder="Player ${i + 1}" data-idx="${i}"></td>
                <td><input type="color" class="player-color" value="${Utils.DEFAULT_COLORS[i]}" data-idx="${i}"></td>
                <td><input type="text" class="player-category" placeholder="Category" data-idx="${i}"></td>
                <td>
                    <label class="btn-upload-images" data-idx="${i}">
                        📁 Upload
                        <input type="file" class="image-upload" accept="image/*" multiple data-idx="${i}">
                    </label>
                    <span class="image-count" id="img-count-${i}">0 images</span>
                </td>
                <td>
                    <div class="image-preview-wrap" id="img-preview-${i}"></div>
                </td>
            `;
            tbody.appendChild(tr);
        }

        // Bind image upload events
        document.querySelectorAll('.image-upload').forEach(input => {
            input.addEventListener('change', onImagesSelected);
        });
    }

    /** Handle image file selection */
    async function onImagesSelected(e) {
        const idx = parseInt(e.target.dataset.idx, 10);
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const countEl = document.getElementById(`img-count-${idx}`);
        const previewEl = document.getElementById(`img-preview-${idx}`);

        countEl.textContent = 'Loading...';

        try {
            const newImages = await Promise.all(files.map(f => Utils.readImageFile(f)));
            categoryImages[idx] = categoryImages[idx].concat(newImages);
            countEl.textContent = `${categoryImages[idx].length} image${categoryImages[idx].length !== 1 ? 's' : ''}`;

            // Update preview thumbnails (show max 5)
            previewEl.innerHTML = '';
            categoryImages[idx].slice(0, 5).forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.className = 'image-preview-thumb';
                previewEl.appendChild(img);
            });
            if (categoryImages[idx].length > 5) {
                const more = document.createElement('span');
                more.className = 'image-count';
                more.textContent = `+${categoryImages[idx].length - 5}`;
                previewEl.appendChild(more);
            }
        } catch (err) {
            console.error('Image load error', err);
            countEl.textContent = 'Error';
        }

        // Reset file input so same files can be re-selected
        e.target.value = '';
    }

    /** Validate and start the game */
    function onStartGame() {
        const validationEl = document.getElementById('setup-validation');
        validationEl.className = 'validation-msg';
        validationEl.textContent = '';

        const names = document.querySelectorAll('.player-name');
        const colors = document.querySelectorAll('.player-color');
        const cats = document.querySelectorAll('.player-category');

        const players = [];
        const categories = [];
        const errors = [];

        for (let i = 0; i < currentSize; i++) {
            const name = names[i].value.trim();
            const color = colors[i].value;
            const category = cats[i].value.trim();
            const images = categoryImages[i] || [];

            if (!name) errors.push(`Player ${i + 1}: Name is required.`);
            if (!category) errors.push(`Player ${i + 1}: Category is required.`);
            if (images.length < 3) errors.push(`Player ${i + 1} (${name || '?'}): At least 3 images required (has ${images.length}).`);

            players.push({ name: name || `Player ${i + 1}`, color, alive: true });
            categories.push({ name: category || `Category ${i + 1}`, images });
        }

        if (errors.length) {
            validationEl.className = 'validation-msg error';
            validationEl.innerHTML = errors.join('<br>');
            validationEl.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Check storage estimate
        const estimatedMB = JSON.stringify(categoryImages).length * 2 / (1024 * 1024);
        if (estimatedMB > 4) {
            if (!confirm(`Images total ~${estimatedMB.toFixed(1)} MB. This is close to the browser storage limit. Continue?`)) {
                return;
            }
        }

        // Build game state
        const { cols, rows } = Utils.gridDimensions(currentSize);
        const tiles = [];
        for (let i = 0; i < currentSize; i++) {
            tiles.push({
                id: i,
                ownerIndex: i,
                categoryIndex: i
            });
        }

        const state = Storage.defaultState();
        state.gridSize = currentSize;
        state.cols = cols;
        state.rows = rows;
        state.tiles = tiles;
        state.players = players;
        state.categories = categories;
        state.gameStarted = true;

        Storage.save(state);

        // Transition to board
        App.navigate('board');
    }

    /** Reset setup screen to defaults */
    function reset() {
        currentSize = 9;
        categoryImages = [];
        document.querySelector('input[name="gridSize"][value="9"]').checked = true;
        buildTable(9);
        const validationEl = document.getElementById('setup-validation');
        validationEl.className = 'validation-msg';
        validationEl.textContent = '';
    }

    return { init, reset };
})();
