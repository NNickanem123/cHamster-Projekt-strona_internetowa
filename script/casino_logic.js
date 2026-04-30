function initMiniGames() {
    const gameMenuButtons = document.querySelectorAll('.casino-game-btn');
    const gamePanels = document.querySelectorAll('.casino-game-panel');

    const slotsClassicBtn = document.getElementById('playSlotsClassic');
    const slotsClassicBetInput = document.getElementById('slotsClassicBet');
    const slotsClassicReels = document.getElementById('slotsClassicReels');
    const slotsClassicResult = document.getElementById('slotsClassicResult');

    const slotsTurboBtn = document.getElementById('playSlotsTurbo');
    const slotsTurboBetInput = document.getElementById('slotsTurboBet');
    const slotsTurboReels = document.getElementById('slotsTurboReels');
    const slotsTurboResult = document.getElementById('slotsTurboResult');

    const slotsMegaBtn = document.getElementById('playSlotsMega');
    const slotsMegaBetInput = document.getElementById('slotsMegaBet');
    const slotsMegaReels = document.getElementById('slotsMegaReels');
    const slotsMegaResult = document.getElementById('slotsMegaResult');

    const cupButtons = document.querySelectorAll('.cup-choice');
    const cupsBetInput = document.getElementById('cupsBet');
    const cupsResult = document.getElementById('cupsResult');

    const showGamePanel = (gameName) => {
        gameMenuButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.game === gameName);
        });
        gamePanels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.gamePanel === gameName);
        });
    };

    if (gameMenuButtons.length > 0 && gamePanels.length > 0) {
        gameMenuButtons.forEach((btn) => {
            btn.addEventListener('click', () => showGamePanel(btn.dataset.game));
        });
        showGamePanel('slotClassic');
    }

    const countBestMatch = (rolls) => {
        const counts = {};
        rolls.forEach((symbol) => {
            counts[symbol] = (counts[symbol] || 0) + 1;
        });
        return Math.max(...Object.values(counts));
    };

    if (slotsClassicBtn && slotsClassicBetInput && slotsClassicReels && slotsClassicResult) {
        const classicSymbols = ['🐹', '🐭', '🐰', '🧀', '⭐'];
        slotsClassicBtn.addEventListener('click', () => {
            const bet = parseFloat(slotsClassicBetInput.value);
            if (!bet || bet <= 0) {
                slotsClassicResult.textContent = 'Podaj poprawną stawkę.';
                return;
            }
            if (bet > balance) {
                slotsClassicResult.textContent = 'Brak środków na taki zakład.';
                return;
            }

            balance -= bet;
            const rolls = [
                classicSymbols[Math.floor(Math.random() * classicSymbols.length)],
                classicSymbols[Math.floor(Math.random() * classicSymbols.length)],
                classicSymbols[Math.floor(Math.random() * classicSymbols.length)]
            ];
            slotsClassicReels.textContent = `${rolls[0]} | ${rolls[1]} | ${rolls[2]}`;

            let multiplier = 0;
            if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) multiplier = 5;
            else if (rolls[0] === rolls[1] || rolls[1] === rolls[2] || rolls[0] === rolls[2]) multiplier = 2;

            const win = bet * multiplier;
            if (win > 0) {
                balance += win;
                slotsClassicResult.textContent = `Wygrana ${win.toFixed(2)} zł (x${multiplier})!`;
            } else {
                slotsClassicResult.textContent = 'Niestety, tym razem bez wygranej.';
            }
            updateBalance();
        });
    }

    if (slotsTurboBtn && slotsTurboBetInput && slotsTurboReels && slotsTurboResult) {
        const turboSymbols = ['🐹', '🐭', '🐰', '🧀', '⭐', '🍀'];
        slotsTurboBtn.addEventListener('click', () => {
            const bet = parseFloat(slotsTurboBetInput.value);
            if (!bet || bet <= 0) {
                slotsTurboResult.textContent = 'Podaj poprawną stawkę.';
                return;
            }
            if (bet > balance) {
                slotsTurboResult.textContent = 'Brak środków na taki zakład.';
                return;
            }

            balance -= bet;
            const rolls = Array.from({ length: 4 }, () => turboSymbols[Math.floor(Math.random() * turboSymbols.length)]);
            slotsTurboReels.textContent = rolls.join(' | ');

            const bestMatch = countBestMatch(rolls);
            let multiplier = 0;
            if (bestMatch === 4) multiplier = 12;
            else if (bestMatch === 3) multiplier = 5;
            else if (bestMatch === 2) multiplier = 2;

            if (rolls.includes('🍀') && multiplier > 0) {
                multiplier += 1;
            }

            const win = bet * multiplier;
            if (win > 0) {
                balance += win;
                slotsTurboResult.textContent = `Turbo trafione! Wygrana ${win.toFixed(2)} zł (x${multiplier}).`;
            } else {
                slotsTurboResult.textContent = 'Turbo nie weszło, spróbuj jeszcze raz.';
            }
            updateBalance();
        });
    }

    if (slotsMegaBtn && slotsMegaBetInput && slotsMegaReels && slotsMegaResult) {
        const megaSymbols = ['🐹', '🐭', '🐰', '🧀', '⭐', '💎'];
        slotsMegaBtn.addEventListener('click', () => {
            const bet = parseFloat(slotsMegaBetInput.value);
            if (!bet || bet <= 0) {
                slotsMegaResult.textContent = 'Podaj poprawną stawkę.';
                return;
            }
            if (bet > balance) {
                slotsMegaResult.textContent = 'Brak środków na taki zakład.';
                return;
            }

            balance -= bet;
            const rolls = Array.from({ length: 5 }, () => megaSymbols[Math.floor(Math.random() * megaSymbols.length)]);
            slotsMegaReels.textContent = rolls.join(' | ');

            let multiplier = 0;
            const bestMatch = countBestMatch(rolls);
            if (bestMatch === 5) multiplier = 30;
            else if (bestMatch === 4) multiplier = 12;
            else if (bestMatch === 3) multiplier = 5;

            if (rolls.every((symbol) => symbol === '⭐')) {
                multiplier = 50;
            }
            if (rolls.includes('💎') && multiplier >= 5) {
                multiplier += 2;
            }

            const win = bet * multiplier;
            if (win > 0) {
                balance += win;
                slotsMegaResult.textContent = `MEGA BIG WIN ${win.toFixed(2)} zł (x${multiplier})!`;
            } else {
                slotsMegaResult.textContent = 'Mega slot tym razem pusty.';
            }
            updateBalance();
        });
    }

    if (cupButtons.length > 0 && cupsBetInput && cupsResult) {
        cupButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const bet = parseFloat(cupsBetInput.value);
                if (!bet || bet <= 0) {
                    cupsResult.textContent = 'Podaj poprawną stawkę.';
                    return;
                }
                if (bet > balance) {
                    cupsResult.textContent = 'Brak środków na taki zakład.';
                    return;
                }

                const selectedCup = parseInt(btn.dataset.cup, 10);
                const winningCup = Math.floor(Math.random() * 3);
                balance -= bet;

                if (selectedCup === winningCup) {
                    const win = bet * 3;
                    balance += win;
                    cupsResult.textContent = `Trafiony kubeczek! Wygrywasz ${win.toFixed(2)} zł.`;
                } else {
                    cupsResult.textContent = `Pudło! Chomik był pod kubkiem ${winningCup + 1}.`;
                }
                updateBalance();
            });
        });
    }
}