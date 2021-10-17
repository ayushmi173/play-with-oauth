import { Router, Request, Response } from 'express';

import { TokenResponse } from '../types';
import { OAuth as SalesForceOAuth, Salesforce } from '../lib/salesforce';

const salesforceRouter = Router();

/**
 * Initializing the SalesforceOAuth class
 */
const salesForceOAuth = new SalesForceOAuth();

/**
 * Initializing the SalesforceBase class
 */
const salesforceBase = new Salesforce();

salesforceRouter.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };

  const token: TokenResponse = await salesForceOAuth.setToken(code);

  res.send({ status: 'ok', token: token });
});

salesforceRouter.post(
  '/create-document',
  async (_req: Request, res: Response) => {
    const response = await salesforceBase.createDocument();
    res.send({ createdDocument: response });
  }
);

export { salesforceRouter as SalesforceRouter };
