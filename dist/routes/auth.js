"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const config_1 = require("../utils/config");
const authRouter = (0, express_1.Router)();
exports.AuthRouter = authRouter;
const sheets = googleapis_1.google.sheets("v4");
const TOKEN_PATH = path_1.default.join(__dirname, "../utils/token.json");
const oAuth2Client = new googleapis_1.google.auth.OAuth2({
    clientId: config_1.CLIENT_ID,
    clientSecret: config_1.CLIENT_SECRET,
    redirectUri: config_1.REDIRECT_URILS[0],
});
const authorize = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenUrl = yield new Promise((resolve) => fs.readFile(TOKEN_PATH, { encoding: "utf8" }, (err, token) => {
        if (err) {
            return resolve(getNewToken(oAuth2Client));
        }
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        return resolve(undefined);
    }));
    return tokenUrl;
});
const getNewToken = (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: config_1.SCOPES,
        prompt: "consent",
    });
    return authUrl;
};
authRouter.get("/", function (_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = yield authorize();
        if (url)
            res.send(`
  <h1>Hey, Let's play with google sheet</h1>
  <a href=${url}>Login</a>
  `);
        res.send(`
  <h1>Logged in user</h1>`);
    });
});
authRouter.get("/redirect", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query.code;
        const { tokens } = yield oAuth2Client.getToken(code);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        oAuth2Client.setCredentials({
            refresh_token: tokens.refresh_token,
        });
        res.status(200).send({ status: "ok", isLoggedIn: true });
    });
});
authRouter.post("/create-sheet", (req, res) => {
    const { title } = req.body;
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
    const request = {
        requestBody: {
            properties: {
                title: title,
            },
        },
        auth: oAuth2Client,
    };
    sheets.spreadsheets.create(request, (err, spreadsheet) => {
        if (err) {
            throw new Error("Can not create new sheet");
        }
        else {
            res.send(JSON.stringify(spreadsheet.data));
        }
    });
});
authRouter.post("/create-row", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { spreadsheetId, name, email, task } = req.body;
        const token = fs.readFileSync(TOKEN_PATH, "utf-8");
        oAuth2Client.setCredentials(JSON.parse(token));
        const params = {
            spreadsheetId: spreadsheetId,
            range: "Sheet1!A:Z",
            insertDataOption: "INSERT_ROWS",
            valueInputOption: "RAW",
            requestBody: {
                values: [[name, email, task]],
                majorDimension: "ROWS",
            },
        };
        const response = yield googleapis_1.google
            .sheets({ version: "v4", auth: oAuth2Client })
            .spreadsheets.values.append(params);
        res.send(response.data);
    });
});
//# sourceMappingURL=auth.js.map