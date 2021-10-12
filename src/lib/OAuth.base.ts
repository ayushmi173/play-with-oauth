import * as fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { tokenPath } from "../utils/helpers";

import {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URILS,
  SCOPES,
} from "../utils/config";

export interface IOAuthBase {
  /**
   * Authorizing the user
   */
  authorize(): void;

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
  getAuthClient(): void;
}

export class OAuthBase implements IOAuthBase {
  private oAuthClient: OAuth2Client;

  constructor() {
    const oAuthClient = new google.auth.OAuth2({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URILS[0],
    });
    this.oAuthClient = oAuthClient;
  }

  async authorize(): Promise<string | undefined> {
    const tokenUrl: string | undefined = await new Promise((resolve) =>
      fs.readFile(
        tokenPath,
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
      scope: SCOPES,
      prompt: "consent",
    });
    return authUrl;
  }

  setCredential(): void {
    const credentials: string = fs.readFileSync(tokenPath, "utf-8");
    this.oAuthClient.setCredentials({
      refresh_token: JSON.parse(credentials).refresh_token,
    });
  }

  getAuthClient(): OAuth2Client {
    return this.oAuthClient;
  }
}
