import { Router, Request, Response } from "express";
import path from "path";
import { TokenResponse } from "../types";

import { OAuth as SalesForceOAuth } from "../lib/salesforce";

const salesforceRouter = Router();

/**
 * Initializing the  SalesforceOAuth class
 */
const salesForceOAuth = new SalesForceOAuth();

salesforceRouter.get("/salesforce", async (req: Request, res: Response) => {
  res.render(path.join(__dirname, "../views/index.pug"), {
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

salesforceRouter.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };

  const token: TokenResponse = await salesForceOAuth.getToken(code);

  res.send({ status: "ok", token: token });
});

export { salesforceRouter as SalesforceRouter };
