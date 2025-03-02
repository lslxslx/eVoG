const _app_k = "075dc7nbw5mez7h"; 
const _app_scr = "7fo0mcludkqg4b0"; 
const _app_v_fp = "/votes.json"; 

// Funksioni për rifreskimin e Access Token me Refresh Token
async function refreshAccessToken(refreshToken) {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: _app_k,
            client_secret: _app_scr
        })
    });

    const data = await response.json();
    if (response.ok) {
        // Ruaj Access Token të ri në localStorage ose sessionStorage për përdorim të mëvonshëm
        const newAccessToken = data.access_token;
        localStorage.setItem("dropboxAccessToken", newAccessToken); // Ruaj për përdorim më vonë
        console.log("Access Token i rifreskuar me sukses!");
    } else {
        console.error("Gabim në rifreskimin e tokenit:", data);
    }
}

// Funksioni për marrë Access Token nga localStorage dhe për rifreskimin nëse është e nevojshme
async function getAccessToken() {
    let accessToken = localStorage.getItem("dropboxAccessToken");

    // Kontrollo nëse tokeni është i disponueshëm
    if (!accessToken) {
        console.log("Access Token nuk është i disponueshëm, rifreskoj...");
        const refreshToken = localStorage.getItem("dropboxRefreshToken");

        if (refreshToken) {
            // Rifresko Access Token me Refresh Token
            await refreshAccessToken(refreshToken);
            accessToken = localStorage.getItem("dropboxAccessToken");
        } else {
            alert("Nuk mund të rifreskojmë tokenin. Ju lutem regjistrohuni përsëri.");
        }
    }

    return accessToken;
}

// Funksioni për t’u lidhur me Dropbox dhe për të shkarkuar kandidatët
async function loadCandidates() {
    const accessToken = await getAccessToken(); // Merrni tokenin aktual

    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: _app_v_fp })
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
    const accessToken = await getAccessToken(); // Merrni tokenin aktual

    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: _app_v_fp })
        }
    });

    if (!response.ok) {
        console.error("Gabim në marrjen e votave:", await response.text());
        alert("Nuk mund të lexohen votat.");
        return;
    }

    const data = await response.json();
    
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
    const accessToken = await getAccessToken(); // Merrni tokenin aktual

    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: _app_v_fp, mode: "overwrite" }),
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
        alert("Plotëso të gjitha fushat!");
        return;
    }

    // Lexo votat aktuale nga Dropbox
    const accessToken = await getAccessToken(); // Merrni tokenin aktual

    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: _app_v_fp })
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