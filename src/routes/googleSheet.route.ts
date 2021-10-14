import { sheets_v4 } from "googleapis";
import * as fs from "fs";
import { Router, Request, Response } from "express";
import { CreateNewSheet, CreateRow, TokenResponse } from "../types";
import { OAuth as GoogleSheetOAuth, Spreadsheet } from "../lib/googleSheet";
import { OAuth as SalesForceOAuth } from "../lib/salesforce";
import { googleSheetCredentialPath } from "../utils/helpers";
import path from "path";

const googleSheetRouter = Router();

/**
 * Initializing the GoogleSheetOAuth class
 */
const googleSheetOAuth = new GoogleSheetOAuth();

/**
 * Initializing the SpreadSheet class
 */
const spreadsheet = new Spreadsheet();

googleSheetRouter.get("/redirect", async (req: Request, res: Response) => {
  const code: string = req.query.code as string;
  const { tokens } = await googleSheetOAuth.getAuthClient().getToken(code);

  fs.writeFileSync(googleSheetCredentialPath, JSON.stringify(tokens));

  googleSheetOAuth.getAuthClient().setCredentials({
    refresh_token: tokens.refresh_token,
  });

  res.status(200).send({ status: "ok", isLoggedIn: true });
});

googleSheetRouter.post("/create-sheet", async (req: Request, res: Response) => {
  try {
    const { title } = req.body as CreateNewSheet;

    const createSheet = await spreadsheet.createSheet(title);
    res.send(createSheet);
  } catch (error) {
    throw new Error(`Unable to create sheet ${error.message}`);
  }
});

googleSheetRouter.post("/create-row", async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, name, email, task } = req.body as CreateRow;

    const params: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
      spreadsheetId: spreadsheetId as string,
      range: "Sheet1!A:Z",
      insertDataOption: "INSERT_ROWS",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email, task]],
        majorDimension: "ROWS",
      },
    };
    const createdRow = await spreadsheet.createRow(params);
    res.send(createdRow);
  } catch (error) {
    throw new Error(`Unable to create row in a sheet ${error.message}`);
  }
});

export { googleSheetRouter as GoogleSheetRouter };
