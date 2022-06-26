import express from "express";
import { Request, Response } from "express";
import db from "../db";

const router = express.Router();

/* GET home page. */
router.get(
  "/",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  function (req: any, res: any, next: any) {
    res.locals.filter = null;

    // select all devices where shippingRequested is false

    res.render("index", { user: req.user });
  }
);

router.get(
  "/mydevices",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  function (req: Request, res: Response) {
    res.render("mydevices", { user: req.user });
  }
);

router.get(
  "/newdevice",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  function (req: Request, res: Response) {
    res.render("newdevice", { user: req.user });
  }
);

router.post(
  "/newdevice",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.end({ error: true });
    }

    const { videoPath, dataPath } = req.body;
    console.log(videoPath);
    console.log(dataPath);
    db.run(
      "INSERT INTO devices (owner_Id,videoPath,dataPath,shippingRequested) VALUES (?,?,?)",
      //@ts-ignore
      [req.user.id, videoPath, dataPath, false],
      function (err) {
        if (err) {
          return next(err);
        }
        res.end({ error: false });
      }
    );

    // TODO: after saving in the database, pin the CIDS to the local IPFS node!!
    // MAYBE USE A CLI VERSION OF GOIPFS TO PIN THERE!
    // THEN I USE A LOCAL VERSION OF GOIPFS TO PIN STUFF!
  }
);

export default router;
