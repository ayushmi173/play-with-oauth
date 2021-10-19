import { Router, Request, Response } from 'express';

import { OAuth as SalesForceOAuth, Salesforce } from '../lib/salesforce';
import { ISalesforceAuth } from '../schema/salesforceAuth.schema';

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

  const token: ISalesforceAuth = await salesForceOAuth.setToken(code);

  res.send({ status: 'ok', token: token });
});

salesforceRouter.post('/create-record', async (req: Request, res: Response) => {
  const { sandbox, id } = req.query as { sandbox: string; id: string };
  const data = req.body as { name: string };

  const response = await salesforceBase.createRecord(
    JSON.parse(sandbox),
    id,
    data
  );

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
