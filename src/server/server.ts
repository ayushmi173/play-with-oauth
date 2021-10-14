import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { RootRouter } from "../routes/root.route";
import { PORT } from "../utils/config";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.set("views", "../views");
app.set("view engine", "pug");

app.use(RootRouter);

app.listen(PORT, (): void => {
  console.log(`Server is listening on ${PORT}`);
});
