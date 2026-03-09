/* ============================
   app.js  –  Main Application Controller / View Router
   ============================ */

const App = (() => {
    const views = ['home', 'setup', 'board', 'duel', 'victory'];
    let currentView = 'home';

    /** Initialize app on page load */
    function init() {
        bindGlobalEvents();
        Setup.init();

        // Check for saved game
        if (Storage.hasSavedGame()) {
            document.getElementById('btn-resume-game').style.display = 'inline-flex';
        }

        navigate('home');
    }

    /** Bind global event listeners */
    function bindGlobalEvents() {
        // New Game button (home)
        document.getElementById('btn-new-game').addEventListener('click', () => {
            Storage.clear();
            Setup.reset();
            navigate('setup');
        });

        // Resume Game button (home)
        document.getElementById('btn-resume-game').addEventListener('click', () => {
            navigate('board');
        });

        // New Game from victory screen
        document.getElementById('btn-new-game-victory').addEventListener('click', () => {
            Storage.clear();
            Setup.reset();
            navigate('setup');
        });

        // Reset Game button (nav bar)
        document.getElementById('btn-reset-game').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset? All progress will be lost.')) {
                Storage.clear();
                Duel.cleanup();
                Setup.reset();
                navigate('home');
            }
        });
    }

    /**
     * Navigate to a view.
     * @param {'home'|'setup'|'board'|'duel'|'victory'} viewName
     */
    function navigate(viewName) {
        if (!views.includes(viewName)) {
            console.error('Unknown view:', viewName);
            return;
        }

        // Cleanup previous view
        if (currentView === 'duel' && viewName !== 'duel') {
            Duel.cleanup();
        }

        currentView = viewName;

        // Toggle active view
        views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.classList.toggle('active', v === viewName);
        });

        // Show/hide reset button
        const resetBtn = document.getElementById('btn-reset-game');
        resetBtn.style.display = (viewName === 'board' || viewName === 'duel') ? 'inline-flex' : 'none';

        // View-specific setup
        switch (viewName) {
            case 'home':
                if (Storage.hasSavedGame()) {
                    document.getElementById('btn-resume-game').style.display = 'inline-flex';
                } else {
                    document.getElementById('btn-resume-game').style.display = 'none';
                }
                break;

            case 'setup':
                // Setup.init() is already called, table is built
                break;

            case 'board':
                Board.render();
                break;

            case 'duel':
                // Duel.setup() was already called by Board before navigating
                break;

            case 'victory':
                renderVictory();
                break;
        }
    }

    /** Render the victory screen */
    function renderVictory() {
        const state = Storage.load();
        if (!state || !state.gameOver) return;

        const winner = state.players[state.winnerId];

        // Winner display
        const winnerEl = document.getElementById('victory-winner');
        winnerEl.querySelector('.victory-winner-color').style.backgroundColor = winner.color;
        winnerEl.querySelector('.victory-winner-name').textContent = winner.name;

        // Stats
        document.getElementById('victory-duels').textContent = state.duelsPlayed;
        document.getElementById('victory-tiles').textContent = state.gridSize;

        // Trigger confetti
        launchConfetti();
    }

    /** Simple CSS confetti animation */
    function launchConfetti() {
        const container = document.getElementById('victory-confetti');
        container.innerHTML = '';

        const colors = ['#f0c040', '#e04050', '#40c060', '#3080e0', '#9050d0', '#e07030', '#d040a0', '#30b0b0'];

        for (let i = 0; i < 80; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = (Math.random() * 8 + 6) + 'px';
            piece.style.height = (Math.random() * 8 + 6) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            piece.style.animationDelay = (Math.random() * 3) + 's';
            container.appendChild(piece);
        }
    }

    return { init, navigate };
})();

// ========== Boot ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
