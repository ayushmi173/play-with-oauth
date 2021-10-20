import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiError, CreateNewDocument, TokenResponse } from '../../types';
import querystring from 'querystring';
import {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_PROD_HOST,
  SALESFORCE_REDIRECT_URI,
  SALESFORCE_SANDBOX_HOST,
} from '../../utils/config';

import SalesforceAuthModel, {
  ISalesforceAuth,
} from '../../schema/salesforceAuth.schema';
export interface ISalesforce {
  /**
   * creating the record in account type
   * @param isSandbox is sandbox account
   * @param id auth credential id
   * @param data requested body for creating the record
   */
  createRecord(
    isSandbox: boolean,
    id: string,
    data: Record<string, string>
  ): Promise<CreateNewDocument | ApiError>;

  /**
   * get token credentials
   * @param isSandbox is sandbox account
   * @param id auth credential id
   */
  getTokenCredentials(isSandbox: boolean, id: string): Promise<ISalesforceAuth>;

  /**
   *  set the token after authorize
   * @param code code in callback query
   * @param isSandbox  is sandbox account
   */
  setAuthorizedToken(
    code: string,
    isSandbox: boolean
  ): Promise<ISalesforceAuth>;
}

export class Salesforce implements ISalesforce {
  async createRecord(
    isSandbox: boolean,
    id: string,
    data: Record<string, string> | { name: string }
  ): Promise<CreateNewDocument | ApiError> {
    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        data: { ...data },
        headers: {
          Authorization: `Bearer ${
            (await this.getTokenCredentials(isSandbox, id)).accessToken
          }`,
          'Content-Type': 'application/json',
        },
      };

      const instanceUrl = (await this.getTokenCredentials(isSandbox, id))
        .instanceUrl;

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

  async getTokenCredentials(
    isSandbox: boolean,
    id: string
  ): Promise<ISalesforceAuth> {
    try {
      const salesforceCredential = await SalesforceAuthModel.findOne({
        id,
      });

      const interospectConfig: AxiosRequestConfig = {
        method: 'POST',
        data: querystring.stringify({
          token: salesforceCredential.accessToken,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          token_type_hint: 'access_token',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const interospectResponse = await axios(
        `${salesforceCredential.instanceUrl}/services/oauth2/introspect`,
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
          refresh_token: encodeURIComponent(salesforceCredential.refreshToken),
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios(
        `${salesforceCredential.instanceUrl}/services/oauth2/token`,
        requestConfig
      );

      const {
        access_token: accessToken,
        instance_url: instanceUrl,
        refresh_token: refreshToken,
      } = response.data as TokenResponse;

      const credentials = await SalesforceAuthModel.findOneAndUpdate({
        _id: salesforceCredential._id,
        accessToken: accessToken,
        instanceUrl: instanceUrl,
        refreshToken: refreshToken,
        isSandbox: isSandbox,
      });

      return credentials as ISalesforceAuth;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setAuthorizedToken(
    code: string,
    isSandbox: boolean
  ): Promise<ISalesforceAuth> {
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

    const credentials = await SalesforceAuthModel.create({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      instanceUrl: data.instance_url,
      isSandbox: isSandbox,
    });

    if (!credentials)
      throw new Error(`Can't create salesforce auth credentials`);

    return credentials as ISalesforceAuth;
  }
}
