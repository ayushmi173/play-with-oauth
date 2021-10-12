import { sheets_v4 } from "googleapis";
import * as fs from "fs";
import { Router, Request, Response } from "express";
import { CreateNewSheet, CreateRow } from "../types";
import { OAuthBase } from "../lib/OAuth.base";
import { tokenPath } from "../utils/helpers";
import { Spreadsheet } from "../lib/spreadSheet.base";

const authRouter = Router();

/**
 * Initializing the OAuthBase class
 */
const oAuth = new OAuthBase();

/**
 * Initializing the SpreadSheet class
 */
const spreadsheet = new Spreadsheet();

authRouter.get("/", async function (_req: Request, res: Response) {
  const url = await oAuth.authorize();

  res.send(
    url
      ? `<h1>Hey, Let's play with google sheet</h1>
        <a href=${url}>Login</a>`
      : "<h1>Already logged in</h1>"
  );
});

authRouter.get("/redirect", async function (req: Request, res: Response) {
  const code: string = req.query.code as string;
  const { tokens } = await oAuth.getAuthClient().getToken(code);

  fs.writeFileSync(tokenPath, JSON.stringify(tokens));

  oAuth.getAuthClient().setCredentials({
    refresh_token: tokens.refresh_token,
  });

  res.status(200).send({ status: "ok", isLoggedIn: true });
});

authRouter.post("/create-sheet", async (req: Request, res: Response) => {
  try {
    const { title } = req.body as CreateNewSheet;

    const createSheet = await spreadsheet.createSheet(title);
    res.send(createSheet);
  } catch (error) {
    throw new Error(`Unable to create sheet ${error.message}`);
  }
});

authRouter.post("/create-row", async function (req: Request, res: Response) {
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

export { authRouter as AuthRouter };
