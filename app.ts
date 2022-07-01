import createError from "http-errors";
import dotenv from "dotenv";

dotenv.config();

import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";

import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import session from "express-session";

import connectSqlite3 from "connect-sqlite3";

const SQLiteStore = connectSqlite3(session);

import pluralize from "pluralize";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";

import * as ipfs from "ipfs-http-client";
const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

//@ts-ignore
const client = ipfs.create("/ip4/127.0.0.1/tcp/5001");
const app = express();

app.locals.pluralize = pluralize;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(logger("dev"));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);
app.use(passport.authenticate("session"));
app.use("/", indexRouter);
app.use("/", authRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const allowlist = ["http://ipfs.localhost:8080"];
const corsOptionsDelegate = function (
  req: Request,
  callback: CallableFunction
) {
  let corsOptions;
  //@ts-ignore
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
export const url = process.env.URL;
export const assetsLink = process.env.ASSETSLINK;
export const escrowURL = process.env.ESCROWURL;
export const contractAddress = process.env.CONTRACTADDRESS;
export const rpcURL = process.env.RPCURL;

export default app;
export { client, corsOptionsDelegate };
