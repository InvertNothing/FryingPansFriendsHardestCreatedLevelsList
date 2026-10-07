let levels = [];
let selectedLevel = 0;

async function loadLevels() {
    const response = await fetch("./data/levels.json");

    if (!response.ok) {
        throw new Error("Failed to load levels.json");
    }

    levels = await response.json();

    renderList();
    renderLevel(0);
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
}

function renderLevel(index) {
    const level = levels[index];
    const details = document.getElementById("level-details");

    if (!level) {
        details.innerHTML = "<h2>Level not found</h2>";
        return;
    }

    let records = "";

    if (level.records.length === 0) {
        records = "<p>No records submitted yet.</p>";
    } else {
        records = level.records.map(record => `
            <div class="record">
                <strong>${record.user}</strong>
                <div>${record.percent}% — ${record.hz}Hz</div>
            </div>
        `).join("");
    }

    details.innerHTML = `
        <h2>${level.name}</h2>

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
                ${level.creators.length
                    ? level.creators.join(", ")
                    : "Not added"}
            </div>

            <div class="info-box">
                <strong>Verifier</strong>
                ${level.verifier || "Not added"}
            </div>

            <div class="info-box">
                <strong>Percent to Qualify</strong>
                ${level.percentToQualify}%
            </div>

            <div class="info-box">
                <strong>Password</strong>
                ${level.password || "Free To Copy"}
            </div>
        </div>

        <div class="records">
            <h3>Records</h3>
            ${records}
        </div>
    `;
}

loadLevels().catch(error => {
    console.error(error);

    document.getElementById("level-details").innerHTML = `
        <h2>Failed to load level list</h2>
        <p>Make sure data/levels.json exists.</p>
    `;
});
