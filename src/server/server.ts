import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { AuthRouter } from "../routes/auth";

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT;

app.use(AuthRouter);

app.listen(port, (): void => {
  console.log(`Server is listening on ${port}`);
});
