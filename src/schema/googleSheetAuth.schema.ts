import { Schema, model, Document } from 'mongoose';

export interface IGoogleSheetAuth extends Document {
  _id: string;
  accessToken: string;
  refreshToken: string;
  expiryDate?: Date;
}

const GoogleSheetAuthSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiryDate: { type: Date, required: false },
});

export default model<IGoogleSheetAuth>(
  'GoogleSheetAuth',
  GoogleSheetAuthSchema
);
