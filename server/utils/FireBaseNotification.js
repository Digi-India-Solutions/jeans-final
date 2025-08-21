const { GoogleAuth } = require("google-auth-library");

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: "firebase-service-account.json", // path to your service account
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

module.exports = { getAccessToken };