import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';

import { salesforceCredentialPath } from '../../utils/helpers';
import { CreateNewDocument, TokenResponse } from '../../types';
import querystring from 'querystring';
import {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
} from '../../utils/config';

export class Salesforce {
  async createDocument(): Promise<CreateNewDocument> {
    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        data: querystring.stringify({
          Description: 'Marketing by Ayush Mishra',
          Keywords: 'marketing,sales,update',
          FolderId: '005D0000001GiU7',
          Name: 'Marketing By Ayush Mishra',
          Type: 'pdf',
        }),
        headers: {
          Authorization: `Bearer ${
            (await this.getTokenCredentials()).access_token
          }`,
          'Content-Type': 'application/json',
        },
      };

      const response: AxiosResponse = await axios(
        `${
          (
            await this.getTokenCredentials()
          ).instance_url
        }/services/data/v53.0/sobjects/Document`,
        config
      );

      return response.data as CreateNewDocument;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokenCredentials(): Promise<TokenResponse> {
    try {
      const salesforceCredential: TokenResponse = JSON.parse(
        fs.readFileSync(salesforceCredentialPath, 'utf-8')
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
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: salesforceCredential.refresh_token,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios(
        `${salesforceCredential.instance_url}/services/oauth2/token`,
        requestConfig
      );
      fs.writeFileSync(salesforceCredentialPath, JSON.stringify(response.data));
      return response.data as TokenResponse;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
