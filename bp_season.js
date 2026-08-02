// ============================================================
// bp_season.js — ЛОГІКА BRAWL PASS ТА АКЦІЙ (БЕЗ БОЇВ)
// ============================================================

// --- 1. НАЛАШТУВАННЯ ДАТ ---

// Розрахунок дати закінчення Brawl Pass: +14 днів, рівно о 12:00
function getSeasonEndDate() {
    const now = new Date();
    let target = new Date(now);
    target.setDate(target.getDate() + 14);
    target.setHours(12, 0, 0, 0);
    
    if (now.getHours() >= 12) {
        target.setDate(target.getDate() + 1);
    }
    return target;
}

// Розрахунок дати закінчення акції на Гейла: +5 днів, рівно о 23:59
function getGaleOfferEndDate() {
    const now = new Date();
    let target = new Date(now);
    target.setDate(target.getDate() + 5);
    target.setHours(23, 59, 59, 999);
    return target;
}

// --- 2. ТАЙМЕР BRAWL PASS (ТІЛЬКИ ВІДОБРАЖЕННЯ) ---
let _seasonEndDate = getSeasonEndDate();

function startRealTimer() {
    let targetDate = _seasonEndDate;

    function updateTimer() {
        const now = new Date();
        let diff = targetDate - now;

        if (diff <= 0) {
            // Якщо сезон закінчився, створюємо новий
            const newTarget = new Date(now);
            newTarget.setDate(newTarget.getDate() + 14);
            newTarget.setHours(12, 0, 0, 0);
            if (now.getHours() >= 12) {
                newTarget.setDate(newTarget.getDate() + 1);
            }
            _seasonEndDate = newTarget;
            targetDate = newTarget;
            diff = targetDate - now;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const timerEl = document.getElementById('season-timer-display');
        if (timerEl) {
            timerEl.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// --- 3. ЛОГІКА АВТО-ВИДАЛЕННЯ АКЦІЇ ГЕЙЛА ЧЕРЕЗ 5 ДНІВ ---
function checkAndRemoveExpiredOffers() {
    const now = new Date();
    const galeEnd = getGaleOfferEndDate();
    const galeOfferElement = document.getElementById('gale-offer-container');

    if (now > galeEnd && galeOfferElement) {
        galeOfferElement.remove(); // Видаляємо картку Гейла
        console.log('Акція "Галактичний Гейл" завершилася.');
    }
}

// Запускаємо перевірку при завантаженні та кожні 10 хвилин
function initAutoRemove() {
    checkAndRemoveExpiredOffers();
    setInterval(checkAndRemoveExpiredOffers, 600000);
}

// --- 4. ФУНКЦІЯ ДЛЯ ВСТАВКИ ТАЙМЕРА В МЕНЮ PASS ---
function injectSeasonTimerInPass() {
    const passScene = document.getElementById('brawl-pass-scene') || document.querySelector('.brawl-pass-scene');
    if (!passScene) {
        setTimeout(injectSeasonTimerInPass, 500);
        return;
    }

    let buyBtn = passScene.querySelector('button') || passScene.querySelector('[class*="buy"]');
    if (!buyBtn) {
        const allElements = passScene.querySelectorAll('*');
        for (let el of allElements) {
            if (el.textContent && el.textContent.includes('★') && el.textContent.includes('Купити')) {
                buyBtn = el;
                break;
            }
        }
    }

    if (!buyBtn) {
        setTimeout(injectSeasonTimerInPass, 500);
        return;
    }

    if (document.getElementById('custom-pass-timer')) return;

    const timerEl = document.createElement('div');
    timerEl.id = 'custom-pass-timer';
    timerEl.style.cssText = `
        display: flex; align-items: center; justify-content: center; gap: 6px;
        margin-bottom: 6px; padding: 4px 12px; background: rgba(0, 0, 0, 0.4);
        border-radius: 8px; border: 1px solid rgba(255, 215, 0, 0.25);
        font-size: 13px; font-weight: 700; color: #ffd700; font-family: monospace;
        letter-spacing: 0.5px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
        width: fit-content; margin-left: auto; margin-right: auto;
    `;

    timerEl.innerHTML = `
        <span style="color: #888; font-size: 10px; font-weight: 400;">⏳</span>
        <span id="season-timer-display" style="color: #fff;">14d 23h 17min</span>
    `;

    buyBtn.parentNode.insertBefore(timerEl, buyBtn);
}
