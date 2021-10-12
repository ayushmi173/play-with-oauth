import { google, sheets_v4 } from "googleapis";
import * as fs from "fs";
import path from "path";
import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URILS,
  SCOPES,
} from "../utils/config";
import { CreateNewSheet, CreateRow } from "../types";

const authRouter = Router();
const sheets = google.sheets("v4");

const TOKEN_PATH = path.join(__dirname, "../utils/token.json");

const oAuth2Client: OAuth2Client | undefined = new google.auth.OAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URILS[0],
});

const authorize = async () => {
  const tokenUrl: string | undefined = await new Promise((resolve) =>
    fs.readFile(
      TOKEN_PATH,
      { encoding: "utf8" },
      (err: Error, token: string) => {
        if (err) {
          return resolve(getNewToken(oAuth2Client));
        }
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        return resolve(undefined);
      }
    )
  );
  return tokenUrl;
};

const getNewToken = (oAuth2Client: OAuth2Client): string => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  return authUrl;
};

authRouter.get("/", async function (_req: Request, res: Response) {
  const url = await authorize();
  if (url)
    res.send(`
  <h1>Hey, Let's play with google sheet</h1>
  <a href=${url}>Login</a>
  `);

  res.send(`
  <h1>Logged in user</h1>`);
});

authRouter.get("/redirect", async function (req: Request, res: Response) {
  const code: string = req.query.code as string;
  const { tokens } = await oAuth2Client.getToken(code);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  oAuth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });
  res.status(200).send({ status: "ok", isLoggedIn: true });
});

authRouter.post("/create-sheet", (req: Request, res: Response) => {
  const { title } = req.body as CreateNewSheet;

  const token = fs.readFileSync(TOKEN_PATH, "utf-8");
  oAuth2Client.setCredentials(JSON.parse(token));

  const request: sheets_v4.Params$Resource$Spreadsheets$Create = {
    requestBody: {
      properties: {
        title: title,
      },
    },
    auth: oAuth2Client,
  };
  sheets.spreadsheets.create(request, (err: Error, spreadsheet) => {
    if (err) {
      throw new Error("Can not create new sheet");
    } else {
      res.send(JSON.stringify(spreadsheet.data));
    }
  });
});

authRouter.post("/create-row", async function (req: Request, res: Response) {
  const { spreadsheetId, name, email, task } = req.body as CreateRow;

  const token = fs.readFileSync(TOKEN_PATH, "utf-8");
  oAuth2Client.setCredentials(JSON.parse(token));

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

  const response = await google
    .sheets({ version: "v4", auth: oAuth2Client })
    .spreadsheets.values.append(params);

  res.send(response.data);
});

export { authRouter as AuthRouter };
