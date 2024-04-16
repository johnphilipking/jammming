/*
!!!!!! NOTE !!!!!
You must already have set your Spotify Client ID as an environment variable
in order for the clientId value, below, to work.
If you haven't done it yet, simple create a new file in your app root directory
named '.env' and add an entry for your client ID, like this:

REACT_APP_MY_VARIABLE_NAME=myClientId

NOTE 1: that the name of the variable must begin with "REACT_APP_" in order for it
to be loaded when app starts. After the .env file is ready you must restart the 
Node app to load the new variable.

NOTE 2: 
Remember to add .env to your .gitignore file to keep it out of the repo.
*/

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = "http://localhost:3000/";
const getTokenUrl = "https://accounts.spotify.com/api/token";

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  console.log(
    "random string = ",
    values.reduce((acc, x) => acc + possible[x % possible.length], "")
  );
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const requestUserAuthorization = async () => {
  const scope =
    "user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public";
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const codeVerifier = generateRandomString(64);
  window.localStorage.setItem("code_verifier", codeVerifier);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
  window.localStorage.setItem("codeChallenge", codeChallenge);
  const params = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};

export async function getToken(code, callback) {
  // stored in the previous step
  const codeVerifier = localStorage.getItem("code_verifier");
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };
  const response = await fetch(getTokenUrl, payload);
  const json = await response.json();
  if (json.access_token && json.access_token !== "undefined") {
    window.localStorage.setItem("access_token", json.access_token);
    console.log(json.access_token);
    window.location = "./";
  }
}
