import { Router, Response, Request } from "express";
import path from "path";

import { OAuth as GoogleSheetOAuth } from "../lib/googleSheet";
import { OAuth as SalesForceOAuth } from "../lib/salesforce";
import { GoogleSheetRouter } from "./googleSheet.route";
import { SalesforceRouter } from "../routes/salesforce.route";

const rootRouter = Router();

/**
 * Initializing the GoogleSheetOAuth class
 */
const googleSheetOAuth = new GoogleSheetOAuth();

/**
 * Initializing the  SalesforceOAuth class
 */
const salesForceOAuth = new SalesForceOAuth();

rootRouter.get("/", async (_req: Request, res: Response) => {
  const googleSheetAuthUrl = await googleSheetOAuth.authorize();

  res.render(path.join(__dirname, "../views/index.pug"), {
    googleSheet: {
      url: googleSheetAuthUrl || "/",
      message: googleSheetAuthUrl
        ? "Login with Google Sheet"
        : "Already logged in with google sheet",
    },
    salesforceSandbox: {
      url: salesForceOAuth.authorize(true),
      message: "Login with Salesforce Sandbox",
    },
    salesforceProd: {
      url: salesForceOAuth.authorize(false),
      message: "Login with Salesforce Professional Edition",
    },
  });
});

rootRouter.use(GoogleSheetRouter);
rootRouter.use(SalesforceRouter);

export { rootRouter as RootRouter };
