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
     * @param {number} defenderCatIndex – category index (defender's category, used for duel)
     * @param {number} challengerCatIndex – category index (challenger's category, inherited by winner)
     * @param {number} challengerTile – tile index of challenger
     * @param {number} defenderTile – tile index of defender
     */
    function setup(p1Index, p2Index, defenderCatIndex, challengerCatIndex, challengerTile, defenderTile) {
        const state = Storage.load();

        const category = state.categories[defenderCatIndex];
        const images = Utils.shuffle([...category.images]); // copy & shuffle

        duelData = {
            p1: { index: p1Index, name: state.players[p1Index].name, color: state.players[p1Index].color, time: TURN_TIME, score: 0 },
            p2: { index: p2Index, name: state.players[p2Index].name, color: state.players[p2Index].color, time: TURN_TIME, score: 0 },
            categoryName: category.name,
            challengerCatIndex: challengerCatIndex,
            // Image tracking: index-based to avoid repetition bugs
            images: images,              // all images (shuffled)
            answeredSet: new Set(),      // indices of correctly answered images
            currentImageIdx: 0,          // pointer into images array
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

    /** Get the number of unanswered images remaining */
    function imagesRemaining() {
        return duelData.images.length - duelData.answeredSet.size;
    }

    /** Advance currentImageIdx to the next unanswered image. Returns false if all answered. */
    function advanceToNextUnanswered() {
        if (duelData.answeredSet.size >= duelData.images.length) return false;
        const total = duelData.images.length;
        let attempts = 0;
        do {
            duelData.currentImageIdx = (duelData.currentImageIdx + 1) % total;
            attempts++;
        } while (duelData.answeredSet.has(duelData.currentImageIdx) && attempts <= total);
        return attempts <= total;
    }

    /** Show current image */
    function showCurrentImage() {
        const imgEl = document.getElementById('duel-current-image');
        const placeholder = document.getElementById('duel-image-placeholder');

        if (imagesRemaining() === 0) {
            // All images answered — end duel, most time remaining wins
            duelData.running = false;
            endDuel('images_exhausted');
            return;
        }

        const src = duelData.images[duelData.currentImageIdx];
        imgEl.src = src;
        imgEl.classList.add('visible');
        placeholder.style.display = 'none';

        document.getElementById('duel-images-left').textContent = `Images left: ${imagesRemaining()}`;
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
        if (!duelData || !duelData.running) return;

        const current = currentPlayer();
        current.score++;

        // Mark current image as answered
        duelData.answeredSet.add(duelData.currentImageIdx);

        // Switch turns
        duelData.currentTurn = duelData.currentTurn === 1 ? 2 : 1;

        // Update timestamp to avoid counting pause
        lastTimestamp = performance.now();

        if (imagesRemaining() === 0) {
            duelData.running = false;
            endDuel('images_exhausted');
            return;
        }

        // Advance to next unanswered image
        advanceToNextUnanswered();
        showCurrentImage();
        updateHUD();
    }

    /** Host clicks "Skip" */
    function onSkip() {
        if (!duelData || !duelData.running) return;

        const current = currentPlayer();
        current.time -= SKIP_PENALTY;

        if (current.time <= 0) {
            current.time = 0;
            duelData.running = false;
            endDuel('timeout');
            return;
        }

        // Reset timestamp to avoid counting processing time
        lastTimestamp = performance.now();

        // Skip to next unanswered image (current stays unanswered, will cycle back)
        advanceToNextUnanswered();
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
            reasonText = winner === duelData.p1 && duelData.p1.time === duelData.p2.time
                ? `All images answered! Tie — ${winner.name} wins as challenger.`
                : `All images answered! ${winner.name} had more time remaining.`;
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

        // Conquer button — winner inherits the challenger's category
        document.getElementById('btn-conquer').onclick = () => {
            Board.applyDuelResult(winner.index, loser.index, duelData.challengerCatIndex);
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
