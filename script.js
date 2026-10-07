let levels = [];
let selectedLevel = 0;

const pages = {
    list: document.getElementById("list-page"),
    leaderboard: document.getElementById("leaderboard-page"),
    roulette: document.getElementById("roulette-page")
};

async function loadLevels() {
    const response = await fetch("./data/levels.json");

    if (!response.ok) {
        throw new Error("Failed to load levels.json");
    }

    levels = await response.json();

    renderList();
    renderLevel(0);
    renderLeaderboard();
}

function renderList() {
    const list = document.getElementById("level-list");

    list.innerHTML = levels.map((level, index) => `
        <button
            class="level-button ${index === selectedLevel ? "active" : ""}"
            onclick="selectLevel(${index})"
        >
            <div class="rank">#${index + 1}</div>
            <div class="level-name">${level.name}</div>
        </button>
    `).join("");
}

function selectLevel(index) {
    selectedLevel = index;

    renderList();
    renderLevel(index);

    showPage("list");
}

function renderLevel(index) {
    const level = levels[index];
    const details = document.getElementById("level-details");

    if (!level) {
        details.innerHTML = "<h2>Level not found.</h2>";
        return;
    }

    let recordsHTML = "";

    if (!level.records || level.records.length === 0) {
        recordsHTML = `
            <p class="empty-message">
                No records submitted yet.
            </p>
        `;
    } else {
        recordsHTML = level.records.map(record => `
            <div class="record">
                <div>
                    <strong>${record.user}</strong>
                    <span>${record.percent}%</span>
                </div>

                <div class="record-subtext">
                    ${record.hz ? `${record.hz}Hz` : ""}
                </div>
            </div>
        `).join("");
    }

    details.innerHTML = `
        <div class="level-header">
            <div>
                <div class="level-rank">#${index + 1}</div>
                <h2>${level.name}</h2>
            </div>

            <div class="demon-badge">DEMON</div>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <strong>Level ID</strong>
                ${level.id || "Not added"}
            </div>

            <div class="info-box">
                <strong>Author</strong>
                ${level.author || "Not added"}
            </div>

            <div class="info-box">
                <strong>Creators</strong>
                ${
                    level.creators && level.creators.length
                        ? level.creators.join(", ")
                        : "Not added"
                }
            </div>

            <div class="info-box">
                <strong>Verifier</strong>
                ${level.verifier || "Not added"}
            </div>

            <div class="info-box">
                <strong>Percent to Qualify</strong>
                ${level.percentToQualify || 100}%
            </div>

            <div class="info-box">
                <strong>Password</strong>
                ${level.password || "Free To Copy"}
            </div>
        </div>

        ${
            level.verification
                ? `
                    <a
                        class="verification-button"
                        href="${level.verification}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Watch Verification
                    </a>
                `
                : ""
        }

        <div class="records">
            <h3>Records</h3>
            ${recordsHTML}
        </div>
    `;
}

function renderLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");

    const players = {};

    levels.forEach(level => {
        if (!level.records) {
            return;
        }

        level.records.forEach(record => {
            if (!players[record.user]) {
                players[record.user] = {
                    user: record.user,
                    completions: 0,
                    bestPercent: 0
                };
            }

            if (record.percent === 100) {
                players[record.user].completions++;
            }

            players[record.user].bestPercent = Math.max(
                players[record.user].bestPercent,
                record.percent
            );
        });
    });

    const sortedPlayers = Object.values(players).sort((a, b) => {
        if (b.completions !== a.completions) {
            return b.completions - a.completions;
        }

        return b.bestPercent - a.bestPercent;
    });

    if (sortedPlayers.length === 0) {
        leaderboard.innerHTML = `
            <div class="empty-state">
                <h3>No players yet</h3>
                <p>
                    The leaderboard will appear here once records are added.
                </p>
            </div>
        `;

        return;
    }

    leaderboard.innerHTML = sortedPlayers.map((player, index) => `
        <div class="leaderboard-row">
            <div class="leaderboard-rank">
                #${index + 1}
            </div>

            <div class="leaderboard-user">
                <strong>${player.user}</strong>
            </div>

            <div class="leaderboard-stat">
                <strong>${player.completions}</strong>
                <span>Completions</span>
            </div>

            <div class="leaderboard-stat">
                <strong>${player.bestPercent}%</strong>
                <span>Best Progress</span>
            </div>
        </div>
    `).join("");
}

function pickRandomLevel() {
    if (levels.length === 0) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * levels.length);
    const level = levels[randomIndex];

    document.getElementById("roulette-result").innerHTML = `
        <div class="roulette-card">
            <div class="roulette-rank">
                #${randomIndex + 1}
            </div>

            <h3>${level.name}</h3>

            <p>
                ${level.author
                    ? `Created by ${level.author}`
                    : "Author not added yet"}
            </p>

            <button
                class="view-level-button"
                onclick="selectLevel(${randomIndex})"
            >
                View Level
            </button>
        </div>
    `;
}

function showPage(pageName) {
    Object.values(pages).forEach(page => {
        page.classList.add("hidden");
    });

    pages[pageName].classList.remove("hidden");

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

document
    .getElementById("roulette-button")
    .addEventListener("click", pickRandomLevel);

loadLevels().catch(error => {
    console.error(error);

    document.getElementById("level-details").innerHTML = `
        <h2>Failed to load level list</h2>
        <p>Make sure data/levels.json exists.</p>
    `;
});
