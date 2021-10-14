import { Router, Request, Response } from "express";

import { TokenResponse } from "../types";
import { OAuth as SalesForceOAuth } from "../lib/salesforce";

const salesforceRouter = Router();

/**
 * Initializing the  SalesforceOAuth class
 */
const salesForceOAuth = new SalesForceOAuth();

salesforceRouter.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };

  const token: TokenResponse = await salesForceOAuth.setToken(code);

  res.send({ status: "ok", token: token });
});

salesforceRouter.post(
  "/create-document",
  async (req: Request, res: Response) => {
    res.send({ token: await salesForceOAuth.getAccessToken() });
  }
);

export { salesforceRouter as SalesforceRouter };
