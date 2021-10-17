import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;

/**
 * Google Config
 */
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URIS: string[] = [
  'http://localhost:7000/redirect',
];
export const GOOGLE_SCOPES: string[] = [
  'https://www.googleapis.com/auth/spreadsheets',
];

/**
 * Salesforce Config
 */
export const SALESFORCE_CLIENT_ID: string = process.env.SALESFORCE_CLIENT_ID;
export const SALESFORCE_CLIENT_SECRET: string =
  process.env.SALESFORCE_CLIENT_SECRET;
export const SALESFORCE_REDIRECT_URI: string =
  process.env.SALESFORCE_REDIRECT_URI;
export const SALESFORCE_PROD_HOST: string = process.env.SALESFORCE_PROD_HOST;
export const SALESFORCE_SANDBOX_HOST: string =
  process.env.SALESFORCE_SANDBOX_HOST;
