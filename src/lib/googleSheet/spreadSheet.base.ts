import { google, sheets_v4 } from 'googleapis';

import { OAuth } from './oAuth';

export interface ISpreadSheet {
  /**
   * Creating new spreadsheet
   * @param title For creating spread sheet with same name
   * @param id Auth document _id in googlesheet model
   * @return Resource that represents a spreadsheet
   */
  createSheet(title: string, id: string): Promise<sheets_v4.Schema$Spreadsheet>;

  /**
   * Creating new row in the spreadsheet
   * @param params Parameters for creating new row
   * @param id Auth document _id in googlesheet model
   * @return The response when updating a range of values in a spreadsheet.
   */
  createRow(
    params: sheets_v4.Params$Resource$Spreadsheets$Values$Append,
    id: string
  ): Promise<sheets_v4.Schema$AppendValuesResponse>;
}

export class Spreadsheet implements ISpreadSheet {
  private oAuth: OAuth;

  constructor() {
    this.oAuth = new OAuth();
  }

  async createRow(
    params: sheets_v4.Params$Resource$Spreadsheets$Values$Append,
    id: string
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    await this.oAuth.setCredential(id);

    const response = await google
      .sheets({ version: 'v4', auth: this.oAuth.getAuthClient() })
      .spreadsheets.values.append(params);

    return response.data;
  }

  async createSheet(
    title: string,
    id: string
  ): Promise<sheets_v4.Schema$Spreadsheet> {
    await this.oAuth.setCredential(id);

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
