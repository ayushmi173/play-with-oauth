import { Schema, model, Document } from 'mongoose';

export interface ISalesforceAuth extends Document {
  _id: string;
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  isSandbox: boolean;
}

const SalesforceAuthSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  instanceUrl: { type: String, required: true },
  isSandbox: { type: Boolean, required: true },
});

export default model<ISalesforceAuth>('SalesforceAuth', SalesforceAuthSchema);
