/**
 * Temporary Developer Testing Tools
 * Easily drop into any level page to simulate the progression flow.
 * Remove the script tag when production-ready.
 */

const GameProgression = {
    STORAGE_KEY: 'game_level_progression_v1',

    // Read progression from localStorage
    getProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Local storage read error in Dev Tools", e);
        }
        return this.getInitialState();
    },

    getInitialState() {
        return {
            levels: {
                1: { unlocked: true, completed: false, stars: 0, score: 0 }
            },
            achievements: [],
            stats: {
                totalScore: 0,
                levelsCompleted: 0
            }
        };
    },

    save(progress) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.error("Local storage save error in Dev Tools", e);
        }
    },

    // Unlock subsequent level proportionally
    completeLevel(levelId, data = {}) {
        const id = parseInt(levelId);
        const progress = this.getProgress();

        if (!progress.levels[id]) {
            progress.levels[id] = {};
        }
        progress.levels[id].completed = true;
        progress.levels[id].unlocked = true;

        if (data.stars !== undefined) progress.levels[id].stars = data.stars;
        if (data.score !== undefined) progress.levels[id].score = data.score;

        const nextId = id + 1;
        if (nextId <= 9) {
            if (!progress.levels[nextId]) {
                progress.levels[nextId] = {};
            }
            progress.levels[nextId].unlocked = true;
        }

        let totalScore = 0;
        let completedCount = 0;
        Object.keys(progress.levels).forEach(k => {
            const lvl = progress.levels[k];
            if (lvl.completed) completedCount++;
            if (lvl.score) totalScore += lvl.score;
        });
        progress.stats.totalScore = totalScore;
        progress.stats.levelsCompleted = completedCount;

        this.save(progress);
        return progress;
    },

    resetProgression() {
        const init = this.getInitialState();
        this.save(init);
        return init;
    }
};

// Automatically build and inject floating developer panel
window.addEventListener('DOMContentLoaded', () => {
    // Determine current level ID automatically from pathname (e.g. "level5.html" -> 5)
    const filename = window.location.pathname.split('/').pop() || '';
    const match = filename.match(/level(\d+)/i);
    const currentLevel = match ? parseInt(match[1]) : 1;

    // Create container
    const panel = document.createElement('div');
    panel.id = 'dev-test-panel';

    // Inject matching dark fantasy styles
    const style = document.createElement('style');
    style.textContent = `
        #dev-test-panel {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(11, 13, 16, 0.95);
            border: 2px solid #ffd700;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85), 0 0 15px rgba(255, 215, 0, 0.15);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            min-width: 280px;
            max-width: 90vw;
            box-sizing: border-box;
            user-select: none;
        }
        #dev-test-panel .dev-header {
            color: #ffd700;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
        }
        #dev-test-panel .dev-btn {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.04);
            color: #e0e4eb;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            outline: none;
        }
        #dev-test-panel .dev-btn:hover {
            background: rgba(255, 215, 0, 0.12);
            border-color: #ffd700;
            color: #ffffff;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
        }
        #dev-test-panel .dev-btn.btn-complete {
            background: linear-gradient(135deg, #b8860b, #ffd700);
            color: #0b0d10;
            border: none;
        }
        #dev-test-panel .dev-btn.btn-complete:hover {
            filter: brightness(1.1);
            box-shadow: 0 0 12px rgba(255, 215, 0, 0.45);
        }
    `;
    document.head.appendChild(style);

    // Populate panel elements
    panel.innerHTML = `
        <div class="dev-header">Test Panel: Level ${currentLevel}</div>
        <button class="dev-btn btn-complete" id="dev-btn-complete">Complete Level</button>
        <button class="dev-btn" id="dev-btn-return">Return to Map</button>
        <button class="dev-btn" id="dev-btn-reset">Reset Progress</button>
    `;
    document.body.appendChild(panel);

    // Bind event handlers
    document.getElementById('dev-btn-complete').addEventListener('click', () => {
        GameProgression.completeLevel(currentLevel);
        window.location.href = "index.html";
    });

    document.getElementById('dev-btn-return').addEventListener('click', () => {
        window.location.href = "index.html";
    });

    document.getElementById('dev-btn-reset').addEventListener('click', () => {
        GameProgression.resetProgression();
        window.location.href = "index.html";
    });
});