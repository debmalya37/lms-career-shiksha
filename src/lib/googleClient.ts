import { OAuth2Client } from "google-auth-library";
import { NextRequest } from "next/server";

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.NEXT_PUBLIC_APP_URL + "/api/oauth/callback";

export function createOAuthClient(req?: NextRequest) {
  const oAuth2 = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // If we have a cookie like `req.cookies.get("g_token")`,
  // parse it and set the credentials on the OAuth2Client:
  if (req) {
    const tokens = req.cookies.get("youtubeTokens")?.value;
    if (tokens) {
      try {
        oAuth2.setCredentials(JSON.parse(tokens));
      } catch {}
    }
  }

  return oAuth2;
}
