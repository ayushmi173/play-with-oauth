import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';

import {
  salesforceProdCredentialPath,
  salesforceSandboxCredentialPath,
} from '../../utils/helpers';
import { ApiError, CreateNewDocument, TokenResponse } from '../../types';
import querystring from 'querystring';
import {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_PROD_HOST,
  SALESFORCE_REDIRECT_URI,
  SALESFORCE_SANDBOX_HOST,
} from '../../utils/config';

export interface ISalesforce {
  /**
   * creating the record in account type
   * @param isSandbox is sandbox account
   * @param data requested body for creating the record
   */
  createRecord(
    isSandbox: boolean,
    data: Record<string, string>
  ): Promise<CreateNewDocument | ApiError>;

  /**
   * get token credentials
   * @param isSandbox is sandbox account
   */
  getTokenCredentials(isSandbox?: boolean): Promise<TokenResponse>;

  /**
   *  set the token after authorize
   * @param code code in callback query
   * @param isSandbox  is sandbox account
   */
  setTokenInFile(code: string, isSandbox: boolean): Promise<TokenResponse>;
}

export class Salesforce implements ISalesforce {
  async createRecord(
    isSandbox: boolean,
    data: Record<string, string>
  ): Promise<CreateNewDocument | ApiError> {
    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        data: { ...data },
        headers: {
          Authorization: `Bearer ${
            (await this.getTokenCredentials(isSandbox)).access_token
          }`,
          'Content-Type': 'application/json',
        },
      };

      const instanceUrl = (await this.getTokenCredentials(isSandbox))
        .instance_url;

      const response: AxiosResponse = await axios(
        `${instanceUrl}/services/data/v20.0/sobjects/Account`,
        config
      );
      return response.data as CreateNewDocument;
    } catch (error) {
      return {
        message: error.response?.statusText || error.message,
        status: error.response?.status,
      } as ApiError;
    }
  }

  async getTokenCredentials(isSandbox?: boolean): Promise<TokenResponse> {
    try {
      const salesforceCredential: TokenResponse = JSON.parse(
        fs.readFileSync(
          isSandbox
            ? salesforceSandboxCredentialPath
            : salesforceProdCredentialPath,
          'utf-8'
        )
      );

      const interospectConfig: AxiosRequestConfig = {
        method: 'POST',
        data: querystring.stringify({
          token: salesforceCredential.access_token,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          token_type_hint: 'access_token',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const interospectResponse = await axios(
        `${salesforceCredential.instance_url}/services/oauth2/introspect`,
        interospectConfig
      );

      const isActiveToken = (interospectResponse.data as { active: boolean })
        .active;
      if (isActiveToken) {
        return salesforceCredential;
      }

      const requestConfig: AxiosRequestConfig = {
        method: 'POST',
        data: querystring.stringify({
          grant_type: 'refresh_token',
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          refresh_token: encodeURIComponent(salesforceCredential.refresh_token),
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios(
        `${salesforceCredential.instance_url}/services/oauth2/token`,
        requestConfig
      );
      fs.writeFileSync(
        isSandbox
          ? salesforceSandboxCredentialPath
          : salesforceProdCredentialPath,
        JSON.stringify(response.data)
      );
      return response.data as TokenResponse;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setTokenInFile(
    code: string,
    isSandbox: boolean
  ): Promise<TokenResponse> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: SALESFORCE_CLIENT_ID,
        client_secret: SALESFORCE_CLIENT_SECRET,
        redirect_uri: SALESFORCE_REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response: AxiosResponse = await axios(
      `${
        isSandbox ? SALESFORCE_SANDBOX_HOST : SALESFORCE_PROD_HOST
      }/services/oauth2/token`,
      config
    );
    const { data } = response as { data: TokenResponse };
    fs.writeFileSync(
      isSandbox
        ? salesforceSandboxCredentialPath
        : salesforceProdCredentialPath,
      JSON.stringify(data)
    );

    return data;
  }
}
