import createError from "http-errors";
import dotenv from "dotenv";

dotenv.config();

import express from "express";

import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import passport from "passport";
import session from "express-session";

import connectSqlite3 from "connect-sqlite3";

const SQLiteStore = connectSqlite3(session);

import indexRouter from "./routes/index";
import authRouter from "./routes/auth";

const app = express();

app.locals.pluralize = require("pluralize");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
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

export default app;
