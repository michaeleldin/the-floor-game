/* ============================
   duel.js  –  Duel Engine (Timer + Image Quiz)
   ============================ */

const Duel = (() => {
    const TURN_TIME = 45;       // seconds per player
    const SKIP_PENALTY = 3;     // seconds deducted on skip

    let duelData = null;        // current duel context
    let timerInterval = null;
    let lastTimestamp = null;

    /**
     * Setup a duel. Called by Board before navigating to duel view.
     * @param {number} p1Index  – challenger player index
     * @param {number} p2Index  – defender player index
     * @param {number} catIndex – category index (defender's category)
     * @param {number} challengerTile – tile index of challenger
     * @param {number} defenderTile – tile index of defender
     */
    function setup(p1Index, p2Index, catIndex, challengerTile, defenderTile) {
        const state = Storage.load();

        const category = state.categories[catIndex];
        const images = Utils.shuffle([...category.images]); // copy & shuffle

        duelData = {
            p1: { index: p1Index, name: state.players[p1Index].name, color: state.players[p1Index].color, time: TURN_TIME, score: 0 },
            p2: { index: p2Index, name: state.players[p2Index].name, color: state.players[p2Index].color, time: TURN_TIME, score: 0 },
            categoryName: category.name,
            images: images,
            imageQueue: [...images],
            currentImageIdx: 0,
            currentTurn: 1, // 1 or 2
            running: false,
            finished: false,
            challengerTile,
            defenderTile
        };

        renderPreDuel();
    }

    /** Render the pre-duel screen */
    function renderPreDuel() {
        if (!duelData) return;

        // Show pre-duel, hide others
        document.getElementById('duel-pre').style.display = 'flex';
        document.getElementById('duel-active').style.display = 'none';
        document.getElementById('duel-result').style.display = 'none';

        // Player 1 card
        const p1Card = document.getElementById('duel-pre-p1');
        p1Card.querySelector('.duel-player-color').style.backgroundColor = duelData.p1.color;
        p1Card.querySelector('.duel-player-name').textContent = duelData.p1.name;

        // Player 2 card
        const p2Card = document.getElementById('duel-pre-p2');
        p2Card.querySelector('.duel-player-color').style.backgroundColor = duelData.p2.color;
        p2Card.querySelector('.duel-player-name').textContent = duelData.p2.name;

        // Category
        document.getElementById('duel-pre-category').textContent = duelData.categoryName;

        // Start button
        document.getElementById('btn-start-duel').onclick = startDuel;
    }

    /** Start the active duel phase */
    function startDuel() {
        document.getElementById('duel-pre').style.display = 'none';
        document.getElementById('duel-active').style.display = 'flex';

        // Setup HUD
        const hud1 = document.getElementById('duel-hud-p1');
        hud1.querySelector('.duel-hud-color').style.backgroundColor = duelData.p1.color;
        hud1.querySelector('.duel-hud-name').textContent = duelData.p1.name;
        hud1.querySelector('.duel-hud-score').textContent = `Score: ${duelData.p1.score}`;

        const hud2 = document.getElementById('duel-hud-p2');
        hud2.querySelector('.duel-hud-color').style.backgroundColor = duelData.p2.color;
        hud2.querySelector('.duel-hud-name').textContent = duelData.p2.name;
        hud2.querySelector('.duel-hud-score').textContent = `Score: ${duelData.p2.score}`;

        // Controls
        document.getElementById('btn-duel-correct').onclick = onCorrect;
        document.getElementById('btn-duel-skip').onclick = onSkip;

        // Begin with player 1's turn
        duelData.currentTurn = 1;
        duelData.running = true;
        duelData.finished = false;

        showCurrentImage();
        updateHUD();
        startTimer();
    }

    /** Start the countdown timer using requestAnimationFrame-style interval */
    function startTimer() {
        stopTimer();
        lastTimestamp = performance.now();
        timerInterval = setInterval(() => {
            const now = performance.now();
            const delta = (now - lastTimestamp) / 1000;
            lastTimestamp = now;

            if (!duelData.running) return;

            const current = currentPlayer();
            current.time -= delta;

            if (current.time <= 0) {
                current.time = 0;
                duelData.running = false;
                endDuel('timeout');
            }

            updateHUD();
        }, 50); // ~20fps update
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /** Get the current player object */
    function currentPlayer() {
        return duelData.currentTurn === 1 ? duelData.p1 : duelData.p2;
    }

    /** Get the other player object */
    function otherPlayer() {
        return duelData.currentTurn === 1 ? duelData.p2 : duelData.p1;
    }

    /** Show current image from the queue */
    function showCurrentImage() {
        const imgEl = document.getElementById('duel-current-image');
        const placeholder = document.getElementById('duel-image-placeholder');

        if (duelData.imageQueue.length === 0) {
            // No more images — end duel, most time remaining wins
            duelData.running = false;
            endDuel('images_exhausted');
            return;
        }

        const src = duelData.imageQueue[0];
        imgEl.src = src;
        imgEl.classList.add('visible');
        placeholder.style.display = 'none';

        document.getElementById('duel-images-left').textContent = `Images left: ${duelData.imageQueue.length}`;
    }

    /** Update the heads-up display */
    function updateHUD() {
        const hud1 = document.getElementById('duel-hud-p1');
        const hud2 = document.getElementById('duel-hud-p2');

        // Timers
        const timer1 = hud1.querySelector('.duel-hud-timer');
        const timer2 = hud2.querySelector('.duel-hud-timer');

        timer1.textContent = Utils.formatTime(duelData.p1.time);
        timer2.textContent = Utils.formatTime(duelData.p2.time);

        // Timer color classes
        updateTimerClass(timer1, duelData.p1.time);
        updateTimerClass(timer2, duelData.p2.time);

        // Scores
        hud1.querySelector('.duel-hud-score').textContent = `Score: ${duelData.p1.score}`;
        hud2.querySelector('.duel-hud-score').textContent = `Score: ${duelData.p2.score}`;

        // Active turn indicator
        hud1.classList.toggle('active-turn', duelData.currentTurn === 1);
        hud2.classList.toggle('active-turn', duelData.currentTurn === 2);

        // Turn label
        const turnLabel = document.getElementById('duel-current-turn');
        turnLabel.textContent = `${currentPlayer().name}'s Turn`;
    }

    function updateTimerClass(el, time) {
        el.classList.remove('warning', 'danger');
        if (time <= 5) el.classList.add('danger');
        else if (time <= 15) el.classList.add('warning');
    }

    /** Host clicks "Correct" */
    function onCorrect() {
        if (!duelData.running) return;

        const current = currentPlayer();
        current.score++;

        // Remove the answered image from queue
        duelData.imageQueue.shift();

        // Switch turns
        duelData.currentTurn = duelData.currentTurn === 1 ? 2 : 1;

        // Update timestamp to avoid counting pause
        lastTimestamp = performance.now();

        if (duelData.imageQueue.length === 0) {
            duelData.running = false;
            endDuel('images_exhausted');
            return;
        }

        showCurrentImage();
        updateHUD();
    }

    /** Host clicks "Skip" */
    function onSkip() {
        if (!duelData.running) return;

        const current = currentPlayer();
        current.time -= SKIP_PENALTY;

        if (current.time <= 0) {
            current.time = 0;
            duelData.running = false;
            endDuel('timeout');
            return;
        }

        // Move current image to end of queue
        const skipped = duelData.imageQueue.shift();
        duelData.imageQueue.push(skipped);

        showCurrentImage();
        updateHUD();
    }

    /** End the duel and show results */
    function endDuel(reason) {
        stopTimer();
        duelData.finished = true;

        let winner, loser, reasonText;

        if (reason === 'timeout') {
            // The player whose time ran out loses
            if (duelData.p1.time <= 0) {
                loser = duelData.p1;
                winner = duelData.p2;
            } else {
                loser = duelData.p2;
                winner = duelData.p1;
            }
            reasonText = `${loser.name}'s time ran out!`;
        } else if (reason === 'images_exhausted') {
            // Whoever has more time remaining wins
            if (duelData.p1.time > duelData.p2.time) {
                winner = duelData.p1;
                loser = duelData.p2;
            } else if (duelData.p2.time > duelData.p1.time) {
                winner = duelData.p2;
                loser = duelData.p1;
            } else {
                // Perfect tie — challenger wins (advantage to aggressor)
                winner = duelData.p1;
                loser = duelData.p2;
            }
            reasonText = `All images answered! ${winner.name} had more time remaining.`;
        }

        renderResult(winner, loser, reasonText);
    }

    /** Render the duel result screen */
    function renderResult(winner, loser, reasonText) {
        document.getElementById('duel-active').style.display = 'none';
        document.getElementById('duel-result').style.display = 'flex';

        // Hide the image
        document.getElementById('duel-current-image').classList.remove('visible');
        document.getElementById('duel-image-placeholder').style.display = 'flex';

        // Winner info
        document.getElementById('duel-result-title').textContent = `${winner.name} Wins!`;

        const winnerEl = document.getElementById('duel-result-winner');
        winnerEl.querySelector('.duel-result-color').style.backgroundColor = winner.color;
        winnerEl.querySelector('.duel-result-name').textContent = winner.name;
        winnerEl.querySelector('.duel-result-time').textContent = Utils.formatTimeResult(winner.time);

        const loserEl = document.getElementById('duel-result-loser');
        loserEl.querySelector('.duel-result-color').style.backgroundColor = loser.color;
        loserEl.querySelector('.duel-result-name').textContent = loser.name;
        loserEl.querySelector('.duel-result-time').textContent = Utils.formatTimeResult(loser.time);

        document.getElementById('duel-result-reason').textContent = reasonText;

        // Conquer button
        document.getElementById('btn-conquer').onclick = () => {
            Board.applyDuelResult(winner.index, loser.index);
            App.navigate('board');
        };
    }

    /** Cleanup when leaving duel view */
    function cleanup() {
        stopTimer();
        duelData = null;
        document.getElementById('duel-current-image').classList.remove('visible');
        document.getElementById('duel-current-image').src = '';
    }

    return { setup, cleanup };
})();
