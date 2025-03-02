const DROPBOX_ACCESS_TOKEN = "sl.u.AFl8-Uj_pYoTiZTzdVuYspm6atsOqWK2WEBS_yRUJwPLZ2mpcYlpsQt43JBW4roke1Cp323u_rkXfU9Rxv41gzWxdn6N483odjB4NGK_9XexJDGq8WGYq_rI7mocIeFbYGzT6zwvEc9gLAO3HilxiNjD9uh8EczxTcpI3UWFf_7hRm4I5MXtdzoRxYQqdmPdz8UAW4lqLVWpf4ZVnZAbNQZyAYhejWAajVHdQybRqY3yo3TTAgLI6_q5JEotI76Aouw2GpWlnlDYEgoowHVt1JXZD2ES-26loEEB4kwc8oEPl04l52UXYA6ckdED9X0D_wGFjre2ZQxRgRIz1MGKV7PNOMOENBBmib3aARfdJB4-4XdPJ020fuCEDempKrmUlYu1WLW02uZIQZ_teZyXF1DL0UzJ-m9-8aLV2IBvGbGDH_-IDyIQDRnQYdLtnlud79l65D-WfQQ2bizXZ9BKATlaMTB1Gp9v_1UhBTa1na01Y0K7w4UDLopbHyssfTKZ7eVPbn6oSYPOFUsoxZtCffk_8nRuZuFX-to_4r6QaqDF21CxeqqOtBPPmJFu6DbI1JudhEGyt3xZq7ieCPKUon2GloVKVaqlh46Vk-YxDQX4ULvhJQaxv1eCKN0qFGSrp44fw_-wo9tHukoMwyuLvtcSIPjZ-TCnCSm5rfx4L29eF-scNLOE4Cusa8uEt5zu3GY0Ho7sDDLbso46HTpKznkv7BO1_gPO0jiPXSQ590cWE1fNGQS1BfVhKM6Rmi0ScfyscmSdaRbsmdEDSR3ltTmII1NTlN4t5Rp0xSUpsKKeLW_9iUg1HKaQCoTmyYlzwcFyJvwwyfpcS3C2btsO1eZaSFlBrT8tIgfdFhcvM2nSJhfm9gFz9RSmj4j_9tATwYIXGImYjs6sQxZffIVQwcVTnatx6y1YmKxu3GJlyLGXNMfyUYWQ4wt6VpcSpTDpTwP7dd4zeQINJrPmQeSenraS_W_IMqQMRBwa2iBonWXF6DvfNDA8B-EgsJSdfF2uyF3rEEba0eiQtZh_qnkQUMLEgnjT3Q00-PKtTBxrCJyPQj1XYThanpyYtxBHNn4LrQ_YqBJpvWfQflXvjrVGlefkaMLsmbmSph-O6PdudAHZHruZMe4wYJO6IUKq0Zaom_2J5C4yq9lS6oC__GCm9sqrT0l59QRQr-o5J2vXjqTDB8tjbAzOfu5NfLUOTxj8hQ860NpLJ2Q8z2xeiHzFvZlYtGzg0RvQg8tnYjJufKPZT-aeCcYDJduXPk4ecw26mW4";
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
