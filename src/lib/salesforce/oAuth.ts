import { ISalesforceAuth } from '../../schema/salesforceAuth.schema';

import {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_PROD_HOST,
  SALESFORCE_REDIRECT_URI,
  SALESFORCE_SANDBOX_HOST,
} from '../../utils/config';

import { Salesforce } from './salesforce.base';

export interface IOAuth {
  /**
   * returns Authorize url for salesforce authentication
   * @param isSandbox checking for authorize url is sandbox's url or not
   */
  authorize(isSandbox: boolean): string;

  /**
   *  Setting token credentials on file
   * @param code extracted code from callback url
   * @param isSandbox checking for authorize url is sandbox's url or not
   */
  setToken(code: string): Promise<ISalesforceAuth>;

  /**
   * return accesstoken cred
   * @param isSandbox checking for authorize url is sandbox's url or not
   * @param id salesforce auth document id
   */
  getAccessToken(isSandbox: boolean, id: string): Promise<ISalesforceAuth>;
}

export class OAuth implements IOAuth {
  private isSandbox: boolean;

  private salesforceBase: Salesforce;

  constructor() {
    this.isSandbox = false;
    this.salesforceBase = new Salesforce();
  }

  authorize(isSandbox: boolean): string {
    const authUrl = `${
      isSandbox ? SALESFORCE_SANDBOX_HOST : SALESFORCE_PROD_HOST
    }/services/oauth2/authorize?client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      SALESFORCE_REDIRECT_URI
    )}&response_type=code`;

    this.isSandbox = isSandbox;

    return authUrl;
  }

  async setToken(code: string): Promise<ISalesforceAuth> {
    try {
      const data = await this.salesforceBase.setAuthorizedToken(
        code,
        this.isSandbox
      );
      return data as ISalesforceAuth;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAccessToken(
    isSandbox: boolean,
    id: string
  ): Promise<ISalesforceAuth> {
    try {
      return this.salesforceBase.getTokenCredentials(isSandbox, id);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
