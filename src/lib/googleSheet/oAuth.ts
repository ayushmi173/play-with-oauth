import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import GoogleSheetAuthModel from '../../schema/googleSheetAuth.schema';

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URIS,
  GOOGLE_SCOPES,
} from '../../utils/config';

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
   * @param id auth document _id in googlesheet model
   */
  setCredential(id: string): Promise<void>;

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
      resolve(this.getNewToken(this.oAuthClient))
    );

    return tokenUrl;
  }

  getNewToken(oAuth2Client: OAuth2Client): string {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      prompt: 'consent',
    });
    return authUrl;
  }

  async setCredential(id: string): Promise<void> {
    const credentials = await GoogleSheetAuthModel.findOne({
      id,
    });

    if (!credentials) throw new Error(`Can't set credential of google sheet`);

    this.oAuthClient.setCredentials({
      refresh_token: credentials.refreshToken,
    });
  }

  getAuthClient(): OAuth2Client {
    return this.oAuthClient;
  }
}
