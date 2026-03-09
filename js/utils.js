/* ============================
   utils.js  –  Shared helpers
   ============================ */

const Utils = (() => {

    /** Fisher-Yates shuffle (in-place, returns array) */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Distinct default colors for up to 16 players */
    const DEFAULT_COLORS = [
        '#e04050', '#3080e0', '#40c060', '#f0a030',
        '#9050d0', '#e07030', '#30b0b0', '#d040a0',
        '#7090e0', '#c0c040', '#50d0a0', '#e06080',
        '#6070d0', '#b07040', '#40a0e0', '#a0d040'
    ];

    /** Get grid dimensions for a player count */
    function gridDimensions(playerCount) {
        switch (playerCount) {
            case 9:  return { cols: 3, rows: 3 };
            case 12: return { cols: 4, rows: 3 };
            case 16: return { cols: 4, rows: 4 };
            default: return { cols: 3, rows: 3 };
        }
    }

    /**
     * Read a File as a base64 data URL.
     * Optionally resizes if max dimension exceeds `maxDim` px (default 600).
     * Returns a Promise<string>.
     */
    function readImageFile(file, maxDim = 600) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    // Resize if needed
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        const ratio = Math.min(maxDim / width, maxDim / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    // Use JPEG for smaller size
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /** Check if two tiles (by index) are adjacent on the grid */
    function areAdjacent(indexA, indexB, cols) {
        const rowA = Math.floor(indexA / cols);
        const colA = indexA % cols;
        const rowB = Math.floor(indexB / cols);
        const colB = indexB % cols;
        const dr = Math.abs(rowA - rowB);
        const dc = Math.abs(colA - colB);
        // Exactly one step horizontally or vertically (not diagonal)
        return (dr + dc) === 1;
    }

    /** Format seconds to MM:SS.s */
    function formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const s = Math.floor(seconds);
        const tenths = Math.floor((seconds - s) * 10);
        const mm = String(Math.floor(s / 60)).padStart(1, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${mm}:${ss}.${tenths}`;
    }

    /** Format seconds for result display */
    function formatTimeResult(seconds) {
        if (seconds < 0) seconds = 0;
        return seconds.toFixed(1) + 's remaining';
    }

    return {
        shuffle,
        DEFAULT_COLORS,
        gridDimensions,
        readImageFile,
        areAdjacent,
        formatTime,
        formatTimeResult
    };
})();
