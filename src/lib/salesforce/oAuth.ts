import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import querystring from "querystring";
import * as fs from "fs";

import { TokenResponse } from "../../types";

import {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_PROD_HOST,
  SALESFORCE_REDIRECT_URI,
  SALESFORCE_SANDBOX_HOST,
} from "../../utils/config";
import { salesforceCredentialPath } from "../../utils/helpers";

export interface IOAuth {
  /**
   * returns Authorize url for salesforce authentication
   * @param isSandbox checking for authorize url is sandbox's url or not
   */
  authorize(isSandbox: boolean): string;

  /**
   *  Getting token credentials
   * @param code extracted code from callback url
   * @param isSandbox checking for authorize url is sandbox's url or not
   */
  getToken(code: string): Promise<TokenResponse>;
}

export class OAuth implements IOAuth {
  private isSandbox: boolean;
  private accessToken: string;

  constructor() {
    this.isSandbox = false;
  }

  authorize(isSandbox: boolean): string {
    const authUrl: string = `${
      isSandbox ? SALESFORCE_SANDBOX_HOST : SALESFORCE_PROD_HOST
    }/services/oauth2/authorize?client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      SALESFORCE_REDIRECT_URI
    )}&response_type=code`;

    this.isSandbox = isSandbox;

    return authUrl;
  }

  async getToken(code: string): Promise<TokenResponse> {
    try {
      const config: AxiosRequestConfig = {
        method: "POST",
        data: querystring.stringify({
          grant_type: "authorization_code",
          code: code,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          redirect_uri: SALESFORCE_REDIRECT_URI,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      const response: AxiosResponse = await axios(
        `${
          this.isSandbox ? SALESFORCE_SANDBOX_HOST : SALESFORCE_PROD_HOST
        }/services/oauth2/token`,
        config
      );
      const { data } = response as { data: TokenResponse };
      fs.writeFileSync(salesforceCredentialPath, JSON.stringify(data));
      this.accessToken = data.access_token;

      return data as TokenResponse;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
