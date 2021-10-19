import { Schema, model, Document } from 'mongoose';

export interface IGoogleSheetAuth extends Document {
  _id: string;
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
}

const GoogleSheetAuthSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  instanceUrl: { type: String, required: true },
});

export default model<IGoogleSheetAuth>(
  'GoogleSheetAuth',
  GoogleSheetAuthSchema
);
