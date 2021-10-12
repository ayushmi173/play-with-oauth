import { google, sheets_v4 } from "googleapis";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { clientId, clientSecret, redirectUris, scopes } from "../utils/config";

const authRouter = Router();
const sheets = google.sheets("v4");

const oAuth2Client: OAuth2Client | undefined = new google.auth.OAuth2({
  clientId: clientId,
  clientSecret: clientSecret,
});

const authorize = (): string => {
  return JSON.stringify(
    handleOAuth2Flow().generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    })
  );
};

const handleOAuth2Flow = (): OAuth2Client => {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
};

authRouter.get("/", async function (req, res) {
  const url = authorize();
  res.send(url);
});

authRouter.get("/redirect", async function (req, res) {
  const code: string = req.query.code as string;
  const { tokens } = await handleOAuth2Flow().getToken(code);

  handleOAuth2Flow().setCredentials({
    refresh_token: tokens.refresh_token,
  });

  res.cookie("auth_tokens", tokens);
  res.send("<script>window.close()</script>");
  res.status(200).send({ status: "ok" });
});

authRouter.get("/create-sheet", (req, res) => {
  oAuth2Client.setCredentials({
    refresh_token:
      req.cookies["auth_tokens"]?.refresh_token ||
      "1//0g1OQluRZwCwJCgYIARAAGBASNwF-L9Ir6UQBSxS9J_EF9PxwpJyzDy64GhCuUw1RA2oDTXemoMcdTb03VgbXuH7dp9uNlbEyFW8",
  });

  const request: sheets_v4.Params$Resource$Spreadsheets$Create = {
    requestBody: {
      properties: {
        title: req.query.title as string,
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

authRouter.post("/add-data", async function (req, res) {
  console.log("Called", req.cookies["auth_tokens"]);
  oAuth2Client.setCredentials({
    refresh_token:
      req.cookies["auth_tokens"]?.refresh_token ||
      "1//0g1OQluRZwCwJCgYIARAAGBASNwF-L9Ir6UQBSxS9J_EF9PxwpJyzDy64GhCuUw1RA2oDTXemoMcdTb03VgbXuH7dp9uNlbEyFW8",
  });
  const { spreadsheetId, name, email, task } = req.body;
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
