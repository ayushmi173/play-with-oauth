import { google, sheets_v4 } from 'googleapis';

import { OAuth } from './oAuth';

export interface ISpreadSheet {
  /**
   * Creating new spreadsheet
   * @param title For creating spread sheet with same name
   * @return Resource that represents a spreadsheet
   */
  createSheet(title: string): Promise<sheets_v4.Schema$Spreadsheet>;

  /**
   * Creating new row in the spreadsheet
   * @param params Parameters for creating new row
   * @return The response when updating a range of values in a spreadsheet.
   */
  createRow(
    params: sheets_v4.Params$Resource$Spreadsheets$Values$Append
  ): Promise<sheets_v4.Schema$AppendValuesResponse>;
}

export class Spreadsheet implements ISpreadSheet {
  private oAuth: OAuth;

  constructor() {
    this.oAuth = new OAuth();
  }

  async createRow(
    params: sheets_v4.Params$Resource$Spreadsheets$Values$Append
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    this.oAuth.setCredential();

    const response = await google
      .sheets({ version: 'v4', auth: this.oAuth.getAuthClient() })
      .spreadsheets.values.append(params);

    return response.data;
  }

  async createSheet(title: string): Promise<sheets_v4.Schema$Spreadsheet> {
    this.oAuth.setCredential();

    const request: sheets_v4.Params$Resource$Spreadsheets$Create = {
      requestBody: {
        properties: {
          title: title,
        },
      },
      auth: this.oAuth.getAuthClient(),
    };

    const response = await google
      .sheets({ version: 'v4', auth: this.oAuth.getAuthClient() })
      .spreadsheets.create(request);

    return response.data;
  }
}
