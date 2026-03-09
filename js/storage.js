/* ============================
   storage.js  –  localStorage CRUD for The Floor
   ============================ */

const Storage = (() => {
    const STORAGE_KEY = 'theFloorGame';

    /** Default empty game state */
    function defaultState() {
        return {
            gridSize: 9,         // 9 | 12 | 16
            cols: 3,
            rows: 3,
            tiles: [],           // [{ id, ownerIndex, categoryIndex }]
            players: [],         // [{ name, color, alive }]
            categories: [],      // [{ name, images: [base64...] }]
            duelsPlayed: 0,
            gameStarted: false,
            gameOver: false,
            winnerId: null
        };
    }

    /** Load full state from localStorage (or null if empty) */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('Storage: failed to load state', e);
            return null;
        }
    }

    /** Save full state */
    function save(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Storage: failed to save (probably quota exceeded)', e);
            alert('Warning: Could not save game data. You may have too many images. Try using smaller images.');
        }
    }

    /** Clear saved state */
    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /** Check if a saved game exists */
    function hasSavedGame() {
        const state = load();
        return state !== null && state.gameStarted === true && state.gameOver === false;
    }

    /** Estimate storage usage in MB */
    function usageMB() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || '';
            return (raw.length * 2) / (1024 * 1024); // JS strings are UTF-16
        } catch {
            return 0;
        }
    }

    return { defaultState, load, save, clear, hasSavedGame, usageMB };
})();
