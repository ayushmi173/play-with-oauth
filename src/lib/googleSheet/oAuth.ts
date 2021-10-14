import * as fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { googleSheetCredentialPath } from "../../utils/helpers";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URIS,
  GOOGLE_SCOPES,
} from "../../utils/config";

export interface IOAuth {
  /**
   * Authorizing the user
   */
  authorize(): Promise<string | undefined>;

  /**
   * Returns new token
   * @param oAuth2Client Handles OAuth2 flow for Google APIs.
   */
  getNewToken(oAuth2Client: OAuth2Client): string;

  /**
   * Read token.json via fs and setting those credential in OAuthClient
   */
  setCredential(): void;

  /**
   * return auth client variable
   */
  getAuthClient(): OAuth2Client;
}

export class OAuth implements IOAuth {
  private oAuthClient: OAuth2Client;

  constructor() {
    const oAuthClient = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URIS[0],
    });
    this.oAuthClient = oAuthClient;
  }

  async authorize(): Promise<string | undefined> {
    const tokenUrl: string | undefined = await new Promise((resolve) =>
      fs.readFile(
        googleSheetCredentialPath,
        { encoding: "utf8" },
        (err: Error, credentials: string) => {
          if (err) {
            return resolve(this.getNewToken(this.oAuthClient));
          }
          this.oAuthClient.setCredentials(JSON.parse(credentials));
          return resolve(undefined);
        }
      )
    );
    return tokenUrl;
  }

  getNewToken(oAuth2Client: OAuth2Client): string {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent",
    });
    return authUrl;
  }

  setCredential(): void {
    const credentials: string = fs.readFileSync(
      googleSheetCredentialPath,
      "utf-8"
    );
    this.oAuthClient.setCredentials({
      refresh_token: JSON.parse(credentials).refresh_token,
    });
  }

  getAuthClient(): OAuth2Client {
    return this.oAuthClient;
  }
}
