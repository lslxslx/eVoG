const DROPBOX_ACCESS_TOKEN = "";
const VOTES_FILE_PATH = "/votes.json"; // Rruga e skedarit në Dropbox

// Funksioni për të lexuar kandidatët dhe për t'i shfaqur në HTML
async function loadCandidates() {
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Dropbox-API-Arg": JSON.stringify({ path: VOTES_FILE_PATH })
        }
    });

    if (!response.ok) {
        console.error("Gabim në marrjen e kandidatëve:", await response.text());
        return;
    }

    const data = await response.json();
    const candidatesGMKGJI = data.candidates.GMK_GJI;
    const candidatesGMKGJZ = data.candidates.GMK_GJZ;

    // Mbush opsionet e votimit për GMK GJI
    let gmkGJIContainer = document.getElementById("gmk-gji-options");
    gmkGJIContainer.innerHTML = "";
    candidatesGMKGJI.forEach(candidate => {
        let label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="gmk-gji" value="${candidate}"> ${candidate}`;
        gmkGJIContainer.appendChild(label);
    });

    // Mbush opsionet e votimit për GMK GJZ
    let gmkGJZContainer = document.getElementById("gmk-gjz-options");
    gmkGJZContainer.innerHTML = "";
    candidatesGMKGJZ.forEach(candidate => {
        let label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="gmk-gjz" value="${candidate}"> ${candidate}`;
        gmkGJZContainer.appendChild(label);
    });
}

// Ngarko kandidatët kur faqja hapet
window.onload = loadCandidates;

// Funksioni për të lexuar votat nga Dropbox
async function fetchVotes() {
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Dropbox-API-Arg": JSON.stringify({ path: VOTES_FILE_PATH })
        }
    });

    if (!response.ok) {
        console.error("Gabim në marrjen e votave:", await response.text());
        alert("Nuk mund të lexohen votat.");
        return;
    }

    const data = await response.json();
    
    // Lexojmë kandidatët nga JSON
    const candidatesGMKGJI = data.candidates.GMK_GJI;
    const candidatesGMKGJZ = data.candidates.GMK_GJZ;

    // Krijojmë strukturën për numërimin e votave
    let voteCounts = {
        "GMK_GJI": {},
        "GMK_GJZ": {}
    };

    // Inicimi i numërimit për secilin kandidat
    candidatesGMKGJI.forEach(candidate => voteCounts.GMK_GJI[candidate] = 0);
    candidatesGMKGJZ.forEach(candidate => voteCounts.GMK_GJZ[candidate] = 0);

    // Përpunimi i votave dhe numërimi
    for (const token in data.votes) {
        const vote = data.votes[token];
        if (vote.GMK_GJI) voteCounts.GMK_GJI[vote.GMK_GJI]++;
        if (vote.GMK_GJZ) voteCounts.GMK_GJZ[vote.GMK_GJZ]++;
    }

    // Mbush modalin me rezultatet e votimit
    document.getElementById("votesGMKGJI").innerHTML = candidatesGMKGJI
        .map(candidate => `- ${candidate}: ${voteCounts.GMK_GJI[candidate]}<br>`)
        .join("");

    document.getElementById("votesGMKGJZ").innerHTML = candidatesGMKGJZ
        .map(candidate => `- ${candidate}: ${voteCounts.GMK_GJZ[candidate]}<br>`)
        .join("");

    // Hap modalin vetëm kur klikohet butoni
    document.getElementById("votesModal").style.display = "flex";
}


// Funksioni për të mbyllur modalin
function closeModal() {
    document.getElementById("votesModal").style.display = "none";
}


// Funksioni për të ruajtur votat në Dropbox
async function saveVotes(votesData) {
    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Dropbox-API-Arg": JSON.stringify({ path: VOTES_FILE_PATH, mode: "overwrite" }),
            "Content-Type": "application/octet-stream"
        },
        body: JSON.stringify(votesData)
    });

    if (response.ok) {
        console.log("Votat u ruajtën me sukses!");
    } else {
        console.error("Gabim në ruajtjen e votave:", await response.text());
    }
}

// Funksioni për të dërguar votën e përdoruesit
async function submitVote() {
    const token = document.getElementById("tokenInput").value;
    const voteGMKGJI = document.querySelector('input[name="gmk-gji"]:checked')?.value;
    const voteGMKGJZ = document.querySelector('input[name="gmk-gjz"]:checked')?.value;

    if (!token || !voteGMKGJI || !voteGMKGJZ) {
        alert("Ploteso të gjitha fushat!");
        return;
    }

    // Lexo votat aktuale nga Dropbox
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Dropbox-API-Arg": JSON.stringify({ path: VOTES_FILE_PATH })
        }
    });

    let votesData = response.ok ? await response.json() : { tokens: {}, votes: {} };

    if (votesData.tokens[token] === undefined) {
        alert("Token i pavlefshëm!");
        return;
    }
    if (votesData.tokens[token]) {
        alert("Ky token është përdorur tashmë!");
        return;
    }

    // Regjistro votën
    votesData.tokens[token] = true;
    votesData.votes[token] = { GMK_GJI: voteGMKGJI, GMK_GJZ: voteGMKGJZ };

    // Ruaj votat e reja në Dropbox
    await saveVotes(votesData);
    alert("Votimi u krye me sukses!");
}
