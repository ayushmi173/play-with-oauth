import { sheets_v4 } from 'googleapis';
import { Router, Request, Response } from 'express';

import { CreateNewSheet, CreateRow } from '../types';
import { OAuth as GoogleSheetOAuth, Spreadsheet } from '../lib/googleSheet';
import GoogleSheetAuthModel from '../schema/googleSheetAuth.schema';

const googleSheetRouter = Router();

/**
 * Initializing the GoogleSheetOAuth class
 */
const googleSheetOAuth = new GoogleSheetOAuth();

/**
 * Initializing the SpreadSheet class
 */
const spreadsheet = new Spreadsheet();

googleSheetRouter.get('/redirect', async (req: Request, res: Response) => {
  const code: string = req.query.code as string;
  const { tokens } = await googleSheetOAuth.getAuthClient().getToken(code);

  const credentials = await GoogleSheetAuthModel.create({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: new Date(tokens.expiry_date),
  });

  if (!credentials)
    throw new Error(`Can't create googlesheet auth credentials`);

  googleSheetOAuth.getAuthClient().setCredentials({
    refresh_token: credentials.refreshToken,
  });

  res.status(200).send({ status: 'ok', isLoggedIn: true });
});

googleSheetRouter.post(
  '/create-sheet/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const { title } = req.body as CreateNewSheet;

      const createSheet = await spreadsheet.createSheet(title, id);
      res.send(createSheet);
    } catch (error) {
      throw new Error(`Unable to create sheet ${error.message}`);
    }
  }
);

googleSheetRouter.post(
  '/create-row/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const { spreadsheetId, name, email, task } = req.body as CreateRow;

      const params: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
        spreadsheetId: spreadsheetId as string,
        range: 'Sheet1!A:Z',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[name, email, task]],
          majorDimension: 'ROWS',
        },
      };
      const createdRow = await spreadsheet.createRow(params, id);
      res.send(createdRow);
    } catch (error) {
      throw new Error(`Unable to create row in a sheet ${error.message}`);
    }
  }
);

export { googleSheetRouter as GoogleSheetRouter };
