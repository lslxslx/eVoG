const DROPBOX_ACCESS_TOKEN = "sl.u.AFmxMVtjO6y7pz7QBbdWWX5ZdNah0qDe3L0_hvo7R_0ZVEVkxhZDRhYBNH0HHgmNdhOukFqkFzI6YrC9S7AZw5lNLVl9MMokfcakFRmQSdqEkv9-XrQm9U150SPO0j5T_UPrJUj8uJwgSZlGAZ1dR1TqpM1lWG2cDa0IIt0G_ppHuoYpZni6Sp1dsELfJSyoFgDVOZQ_nM-lXkADYx4wwcQYUfZ798gJh2Ngm13NC_VEmRGK5_HnCBmkRP3JcmMyfk6G2TiP8LNMMEwn1UMIC5CR1n3Ig1OB491YRaGKwaIWxX1OD0kduN_OSVnNXbeu8WrKR3uYclLu0R2145QdH-Xg84oKqLjYzPEdjrXwPKoYgo6MLuusB5kvY10vQMDG1ov0tMLOuyhnCnAInkZqLz0LVjxizrexqw7Kgw_FBwpVk0iYwG1in8au8nrUY1GSA4zsA_-FXEoYOBbZQBKd7J_aMLFwDblYbERDs5Ui4suvpBxii9pe-5SoyCM3rwJQ93kbqwWSZ2gE6szptbmnul0dZ0MiwShYjE3VVwZved4JEmLqr0sXEy9M8kq-wemFFjpMIwtU9OEs471KZKYXfMu2Ko5EXnQWgOTlJ46ITRdAgk6KTRV2JCXuXlZIvOpWcUtAFKScyIiGpzmPypSmlNBCVNVcrSOffgrssOuDK8krfj4LQJXUfXaw7jUCTLoOuZuNv00oLNNJkhp3j7gWVjPPlNnoGZ4W_Kb2ziJC4--7tbOWETVDDJMuMV5SS7Oh7-eaVi2xTBGPVpOl019DSHK0SLbw4AZWig5wyMxaAZPZQhgG2Nrs0c1_ymSF-a6Z6tpHw-b3eidBVrhjcT4YO914x7NK1xl-IAIwx0u20eS0kKZv-w8UDtpgxt3unnQfmmlnw2meVHINAdy6Vi77sYJTAtOICoWlQlFAaVFQBBm37cXtrse9hcU_Hg_M5ZholT-DigpW61_KNh7SpG8vhupys60CeWoAGM6WxwlUjVkXYA4o-mO0nMcSeyD2VFACM91H1GQo0whWlujcHttUOvYM8tZ2F22fLNxckDe7UVN0auugDRpw35nEkvGGdWC5S2afflLDnxpmswQAZ__TUzpKUSrNCUpr5LEuuUlo-RuOBq8-8i9QGqesQtk466pbo0Q_wQclg-v0H91WCw6jp4Vs7akP3zYRaFKZwPxL0x5ewdKBVoPq8-ao-AE45IY1VX9EBz5cqs4tbW7FAsdX67eFZMu3h7LhmmPmhx6bSP-fGVYF7OuYA5oGRY_KX4VroZ0";
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
