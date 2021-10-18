export type CreateNewSheet = {
  title: string;
};

export type CreateRow = {
  spreadsheetId: string;
  name: string;
  email: string;
  task: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  instance_url: string;
  token_type: string;
  issued_at: string;
};

export type CreateNewDocument = {
  id: string;
  error: [];
  success: boolean;
};

export type ApiError = {
  status: string;
  message: string;
};
