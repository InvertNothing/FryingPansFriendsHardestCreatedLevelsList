let levels = [];
let selectedLevel = 0;

async function loadLevels() {
    const response = await fetch("./data/levels.json");

    if (!response.ok) {
        throw new Error("Could not load levels.json");
    }

    levels = await response.json();

    displayLevelList();
    displayLevel(0);
}

function displayLevelList() {
    const levelList = document.getElementById("levelList");

    levelList.innerHTML = "";

    levels.forEach((level, index) => {
        const button = document.createElement("button");

        button.className = "level-button";

        if (index === selectedLevel) {
            button.classList.add("active");
        }

        button.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="level-name">${level.name}</div>
        `;

        button.addEventListener("click", () => {
            selectedLevel = index;

            displayLevelList();
            displayLevel(index);
        });

        levelList.appendChild(button);
    });
}

function displayLevel(index) {
    const level = levels[index];
    const levelInfo = document.getElementById("levelInfo");

    if (!level) {
        levelInfo.innerHTML = "<h2>Level not found.</h2>";
        return;
    }

    let recordsHTML = "";

    if (level.records.length === 0) {
        recordsHTML = "<p>No records submitted yet.</p>";
    } else {
        recordsHTML = level.records.map(record => `
            <div class="record">
                <strong>${record.user}</strong>
                <div>${record.percent}% — ${record.hz}Hz</div>
            </div>
        `).join("");
    }

    let videoHTML = "";

    if (level.verification) {
        const videoID = getYouTubeID(level.verification);

        if (videoID) {
            videoHTML = `
                <iframe
                    class="video"
                    src="https://www.youtube.com/embed/${videoID}"
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    levelInfo.innerHTML = `
        <h2>${level.name}</h2>

        <div class="info-box">
            <div class="info-item">
                <strong>Level ID</strong>
                ${level.id || "Not added"}
            </div>

            <div class="info-item">
                <strong>Author</strong>
                ${level.author || "Not added"}
            </div>

            <div class="info-item">
                <strong>Creators</strong>
                ${level.creators.length > 0
                    ? level.creators.join(", ")
                    : "Not added"}
            </div>

            <div class="info-item">
                <strong>Verifier</strong>
                ${level.verifier || "Not added"}
            </div>

            <div class="info-item">
                <strong>Percent to Qualify</strong>
                ${level.percentToQualify || "Not added"}%
            </div>

            <div class="info-item">
                <strong>Password</strong>
                ${level.password || "Free To Copy"}
            </div>
        </div>

        ${videoHTML}

        <div class="records">
            <h3>Records</h3>
            ${recordsHTML}
        </div>
    `;
}

function getYouTubeID(url) {
    if (!url) {
        return null;
    }

    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.substring(1);
        }
    } catch {
        return null;
    }

    return null;
}

loadLevels().catch(error => {
    console.error(error);

    document.getElementById("levelInfo").innerHTML = `
        <h2>Failed to load the level list.</h2>
        <p>Check that data/levels.json exists.</p>
    `;
});
