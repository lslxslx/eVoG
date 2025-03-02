const DROPBOX_ACCESS_TOKEN = "sl.u.AFkL64GJky_wLuu0Q_byNS_MRdk14-WnBhtP7L1KDwMYaiTTJPZHF35QNSD2PyuzzAkPeV-vWLuocY0GxyxH9DmTs1PxDeFMQ9u35c7Lb5HF09sFjymJudYyCosT_SIx4u8UN--ZiIduzaeO5xcAwU4OKGpzHZPpC07WZsXlGvdtEFCJaRKkAHJb30bXMVwc-_rVKE50HL08JCSHnzOnEvUmvErZ_kRe3a8n7MQIAxN3cUbFldX7Y7R0ZU34dq0jnIdLYFspYXRY49XSQl71uMcBDRIkxaRdcPhpq1_doJIz1E79cNjEE5uHxVbtB-J1fGh5_V6xQajYxAyf_NnbrkSnWx91eRnnLqgJjiUvr2qjP2ysKNRwSjYX50PTMPlvD82hQJMr7EORppii-V3mxnwixTS2jIQeNrMxdtXSaj-gNIhmIpsKQWTAzeCbjLmBvhi2KCS0X-fubs-B27oCmCLXGK_6Gp-OyV2yZ4kmzsjfGpSpX79WNqIuUEdhCncYzyQrvBf6Cf4HN4HooV2jVl434TfeG6WKYM9BOaCT84gsqDjUdWL_4CS0d23Dym98mK7dPEpA-Z7KGNpuL1iMVXuRTIPMI9XveGHZxr6Y_8GfAY83llc0_J6B3CH-ngx0WVGYmvSMEjZyfk67e29FNViLozWRmY5Fu_GCISwFRGUF3ZqR7J1_TAevoVQ6EjzNTo8JpaB_Le-ZR7qDs0M6S1PPTVXITwlWrAbbOvsKyuzyTq9kWaQE69_4zjaqpWl_EBWSG7RWL4R6vz-ji_WFT0_qFHRhj6Rgw_A4ItJeDftHJS2smPFYANGMIyFXLTIpguM90Etg-TtRQeSJxeiVLVrOwlINJdIJ5Na5ooQbPl5kCvrxBj6b97KXr3sE1ja0-htYhPt8d9NpbjoVHcDnN2aqXnzQ-F97jRuDDIf3rQYtq3X1V1rv1p16oWlBMNoaRu-IT0c6btSdirW9c6dNhxUN1eK74bXP-LMxMREfp7b2hIqtU5Gt0xxo_Z0RW7zgSWnVE99wWT7GZUfEExNrskrTFBZueDpvq0ApxRR81MccIIGjnaIF8zQRrzvJtumxGD_SKzk4hWmrqiC69qI6jv3hbHYnjbd3A7ndJN8-GHOb2jpcaadeCc3-UIxLI9BB8Qj6IX805bpWcbATJjwTM8jvjB1l1dZu-g8Fg6dbHKsHas6bq8H6tlVMlesSjqwU6sLb45k58x2ApWfR_a1xKB6Ket9nWsGFSpVCUfUEu3z97N06It6lz2KPigzuMUfd1IQ";
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

    if (response.ok) {
        const data = await response.json();
        console.log("Votat:", data);
    } else {
        console.error("Gabim në marrjen e votave:", await response.text());
    }
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
