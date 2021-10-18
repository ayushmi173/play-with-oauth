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

salesforceRouter.post('/create-record', async (req: Request, res: Response) => {
  const { sandbox } = req.query as { sandbox: string };
  const data = req.body;

  const response = await salesforceBase.createRecord(JSON.parse(sandbox), data);

  let result = undefined;

  if ('status' in response) {
    result = {
      status: response.status,
      message: response.message,
    };
  }
  result = { createRecord: response };

  return res.send(result);
});

export { salesforceRouter as SalesforceRouter };
