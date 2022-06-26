import express from "express";
import { Request, Response } from "express";
import db from "../db.js";
import { client } from "../app.js";
import { CID } from "ipfs-http-client";
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
    db.all(
      "SELECT * FROM devices WHERE shippingRequested = false",
      [],
      async function (err, row) {
        if (err) {
          next(err);
        }
        let myDevices = [];

        for (let i = 0; i < row.length; i++) {
          let r = row[i];
          const data = await ipfsCAT(r.dataPath);
          const d = JSON.parse(data);
          myDevices.push({
            videoPath: "http://ipfs.localhost:8080/ipfs/" + r.videoPath,
            name: d.name,
            desc: d.description,
            shippingRequested: r.shippingRequested,
            shipped: r.shipped,
          });
        }
        res.render("index", { user: req.user, myDevices });
      }
    );
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
  function (req: Request, res: Response, next: CallableFunction) {
    db.all(
      "SELECT * FROM devices WHERE owner_id = ?",
      //@ts-ignore
      [req.user.id],
      async function (err, row) {
        if (err) {
          next(err);
        }
        let myDevices = [];

        for (let i = 0; i < row.length; i++) {
          let r = row[i];
          const data = await ipfsCAT(r.dataPath);
          const d = JSON.parse(data);
          myDevices.push({
            videoPath: "http://ipfs.localhost:8080/ipfs/" + r.videoPath,
            name: d.name,
            desc: d.description,
            shippingRequested: r.shippingRequested,
            shipped: r.shipped,
          });
        }

        res.render("mydevices", { user: req.user, myDevices });
      }
    );
  }
);

async function ipfsCAT(cid: string) {
  const chunks = [];
  for await (const chunk of client.cat(cid, { timeout: 1000 })) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

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
      return res.json({ error: true });
    }

    const { videoPath, dataPath } = req.body;

    // Pin the CID to local IPFS Node
    const videoCID = CID.parse(videoPath);
    await client.pin.add(videoCID);

    const detailsCID = CID.parse(dataPath);
    await client.pin.add(detailsCID);

    db.run(
      "INSERT INTO devices (owner_id,videoPath,dataPath,shippingRequested,shipped) VALUES (?,?,?,?,?)",
      [
        //@ts-ignore
        req.user.id,
        videoPath,
        dataPath,
        false,
        false,
      ],
      function (err) {
        if (err) {
          return next(err);
        }
        return res.json({ error: false });
      }
    );
  }
);

export default router;
