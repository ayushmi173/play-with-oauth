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
} from '../../utils/config';

export class Salesforce {
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
}
