const DROPBOX_ACCESS_TOKEN = "sl.u.AFnj8W6c9D_PDDWOv3gWZjgJy0Q9SKleP_TWyzKrNWpIBjM3vm025pRKxFaM5j-7y3EhUHEgIZQob21YAVxyj8cc7PAXbcaYPSDh4SQsA8VR0TEDGiFG9zFJ5HYJ8ZcuJZXu36QmJ_LUhFg_nTuepceLTghI6VWcGPyxacygXofn44uVzXuPtU-J1helHLXcVRdyxZ1-4Z7QD9J14jXtMHio0tV64zrGnITNdvqH9dh_7zBxemQyfFlRldW2f942R72Vfgy1mWZbEnPseLASKdPLDDEcDwui7HPHuWxbG5wGCRpubTxO1mIQmOGXipuq0gJ1fiDPeJASScmO7D2hmoNiZgiuim1Iz9I_yCAkfWF85JHC7qJtdobgkkdkrg0m6o0bKvVI_f9CgseSU3haWK9DnLgQWgLk1KyAXLU997kfD4wPTKOXCu1CN-SAQI4jVfFgmnEhkbpxq-6-E55cGdItIoCMegXDJ9rOvs0ZpHwnLuZsz2L5etCdpdMVW1Tk9GlY3KPGmUEFGZQ_LyAicMxee-HkD4MMp0H7_c0PGWkpso8qGGHxapOyT0QKAUGQTPCjw9JHM6h4O5RJXxH5FhOZASPjpdJw_JRlt_Oe3sFa6AXfOoBxe6LFMfnYn5SMHZW-4gZXsHf2hM6-8NNqqFjz6Cv-P8MyNXGfnltUgsUgBm3I1M1mYQXzj2KZ-aN4tiXiKlFxJQUb5A9kc_e1jP0fSKCUsRGVyKvEk6pBa3MDYSoqXKf9cJd22BJ1ngUmbf2F8I5LVtJ042BV1Q09q7b6r5-OxRR7mfMfYK0L_ku3DR6_faykdN08YkmfQVngU0FgdoaEdJ_onikGggbGp48LcqP-dE2XML5XBYpFWwbt_uPEFB8yVV5tOwmuVTeaBt9VwMQjiSTvKXqf6fCZBMJFmubnutHzawpagpBAf8iO5RCVooO1FPrzqsbQiAyHSxKcgAl7aRFgOpXV9lj7qIv9V4TRDnYUPRnUmDLPh03m94VG4pSdZxz345oItBVNcOg4NanjSGntHOgfnWnkaMYUQdEleXKbW2cHPlp2z9DrUQxavagaDlrXigSx8hyaCCYOBluypbC0J0lkzYMkAQT2PEtbU0hR5tQBFf2Ivnh5RHoBSxdo37SPdnHMbR2eCcea9BtLgeMDDEWqbmSQZUxNCk34Uq3o1FZSatJDIKwHtPcF6LnF3YokAi0gZwOlJw4jaVYIDIGB73bkSGD-G7FMuOKCCkJROI7Z0j3ozdh-huU4hERkFy0ty6DwDf4VQzo";
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
