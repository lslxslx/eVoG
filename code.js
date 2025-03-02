const DROPBOX_ACCESS_TOKEN = "sl.u.AFlHkYZKCOonNJU95bBBY2-vLWr0kIUfKV05hARt1RVkA4XtPdCA3aAfxA6KYDntJMlQwGkDweUvJhQSW9ocECuCtKTJcHC5KDrfO63mEs9nCypDe1gt2dTLhEB3BTB1-9A5HEImrTfbjD0HtB-K0W0yDAQVyFi7Q6lEBNEqujk_1DBKjnf6kDHhxP_9IP8IUlmN5sIHhXLGgevz55p1NUtJom7tdbQ1TGlgdAIjqpJMQUjQSbjIejxVf0iyHRgj4BcgnM2dE92zBVOg5TS7QEafPUVwwZq58krzucjTnmlZtJq2OEci34gK1jsVUwjiXjn5g_pkV5JJ4ePfSsQ5FqTgKSC-5xiLY1dvTZ_HbSths-pKvlVvMiEcK5rGkH9H-s8C7UxHgJSRcD6ChbtW3g-sgSoRnD8PWdEplIIxpzhFPsaCnts1JJUWoeY4NEDIKa7dCScXMbkHZ0MzNboZtbYkDoyKn2ZKJ9kr93m6jGFE57rKhOtPEpMqvOZJ8foyKhYAykCvSFsItO4uA_qlK3qzZeZWJk-4WgR_AJohpYzMQuDoI2dnHumKem-w-V9o9WuC5BCkFWmpR16X4wN5gVc9WAsxXO8_pQMxjbEnMbVJ8j6Dw09FIaCwVoBiXOYwWKiz1pi3_F6rzAlXjWOtkWnVLoXcGDK6txRcXuQGjDbl74qHO9wJGSHOLy0wzOqWLBvwYWjDH1DEa4Rxb_CIA1I1VAPvha76q1I1P_OpA7sfaxzSPOWStatp8plgnNacWWpxoWqmahsZux7u5VujqqcEnwYiilip8bBz6K4fd-3mRvLDT809LHRhia1d8LqUuhHsMBKlKuleGyjsYCEjlubcOayTusFAokc6qwffok_zwL6nLwxHSMFORPaLMXEqHtYCg9B3kU5zliHOcRn0Rw3EOHEESAI6vryBQMmeokm_Wmqd-OtBu5r9GqGhhzcwjNZ54ZSPhDBb4cSwarL9eQvShM2GND03IIY7__2D4CarQ7FUq3n87bh9SDzQnjePxmj7sHdyA8SVi1AhJnyguTTYy7doHyRUJozYfr604G6HCprRaa2-06VNuczwdJKt-mTNYajm97JsZp2LzW7fgZpjZZnbRqGd5zzBZNCsxjoI6hif5XkS5yoqK032o4nYnR7xWI4GpJVa74edqisD3p5VCwAP70kiEvuLE5MqZOn5cAUZ4uJVEAzfcnZpAsWeQx9GzC6fjrWso1c7MDhS6AG4SH5X4eDBfwkKoPEugikVb3I4Ibt0uddvvU4pE_n9rQw";
const VOTES_FILE_PATH = "/votes.json"; // Rruga e skedarit në Dropbox

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
    
    // Inicimi i numërimit të votave për secilin kandidat
    let voteCounts = {
        "GMK_GJI": { "Kandidat A": 0, "Kandidat B": 0 },
        "GMK_GJZ": { "Kandidat X": 0, "Kandidat Y": 0 }
    };

    // Përpunimi i votave
    for (const token in data.votes) {
        const vote = data.votes[token];
        if (vote.GMK_GJI) voteCounts.GMK_GJI[vote.GMK_GJI]++;
        if (vote.GMK_GJZ) voteCounts.GMK_GJZ[vote.GMK_GJZ]++;
    }

    // Shfaqja e rezultateve me alert
    alert(
        `📊 Rezultatet e Votimit:\n\n` +
        `🗳 GMK GJI:\n  - Kandidat A: ${voteCounts.GMK_GJI["Kandidat A"]} vota\n  - Kandidat B: ${voteCounts.GMK_GJI["Kandidat B"]} vota\n\n` +
        `🗳 GMK GJZ:\n  - Kandidat X: ${voteCounts.GMK_GJZ["Kandidat X"]} vota\n  - Kandidat Y: ${voteCounts.GMK_GJZ["Kandidat Y"]} vota`
    );
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
