//Security measures for API calls
function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}

//API Calls
const clientId = "7d6fb2e677c440bfb223cb7b4a517ea9";
const clientSecret = "b98fc177925c401db849236af2fe776d";
const redirectURI = window.location.origin + "/";
const redirectFunction = "?handleAuthorizeClick=1";
const authorizeRedirectURI = redirectURI + redirectFunction;

const codeVerifier = generateRandomString(128);

function handleAuthorizeClick() {
  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    let state = generateRandomString(16);
    let scope = "user-library-read";

    localStorage.setItem("code_verifier", codeVerifier);

    let args = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      redirect_uri: authorizeRedirectURI,
      state: state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.location = "https://accounts.spotify.com/authorize?" + args;
  });
}

function handleIncomingAuthorizationResponse() {
  const searchParams = new URLSearchParams(window.location.search);
  if (Object.fromEntries(searchParams).hasOwnProperty("handleAuthorizeClick")) {
    const code = searchParams.get("code");
    const codeVerifier = localStorage.getItem("code_verifier");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: authorizeRedirectURI,
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    const response = fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "/main.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

window.addEventListener("load", handleIncomingAuthorizationResponse());
