import express from "express";
import { Request, Response } from "express";
import db from "../db.js";
import { client } from "../app.js";
import { CID } from "ipfs-http-client";
const router = express.Router();
const url = "http://ipfs.localhost:8080/ipfs/";

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
    //TODO: ADD FILTERING FOR DEVICES BY LOCATION AND PRICE
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

          //TODO: filter by country and price here!

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
            id: r.id,
            videoPath: url + r.videoPath,
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

router.get(
  "/settings",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }

    db.get(
      "SELECT * FROM shipping WHERE owner_id = ?",
      //@ts-ignore
      [req.user.id],
      function (err, row) {
        if (err) {
          return res.render("home");
        }

        if (row === undefined) {
          return res.render("settings", {
            user: req.user,
            ethaddr: "",
            fullname: "",
            addressLine1: "",
            addressLine2: "",
            postcode: "",
            country: "",
            state: "",
          });
        } else {
          return res.render("settings", {
            user: req.user,
            ethaddr: row.ethWalletAddress,
            fullname: row.fullName,
            addressLine1: row.address_line_1,
            addressLine2: row.address_line_2,
            postcode: row.postCode,
            country: row.country,
            state: row.state,
          });
        }
      }
    );
  }
);

router.post(
  "/settings",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    const {
      ethereumaddress,
      fullname,
      addressLine1,
      addressLine2,
      postcode,
      country,
      state,
    } = req.body;

    // Check if the req.user.id has already a street address added

    db.get(
      "SELECT * FROM shipping WHERE owner_id = ?",
      //@ts-ignore
      [req.user.id],
      function (err, row) {
        if (err) {
          return res.status(400).send("An Error Occured!");
        }

        if (row === undefined) {
          db.run(
            "INSERT INTO shipping (owner_id, address_line_1, address_line_2, country, postCode, fullName, state, ethWalletAddress) VALUES (?,?,?,?,?,?,?,?)",
            [
              //@ts-ignore
              req.user.id,
              addressLine1,
              addressLine2,
              country,
              postcode,
              fullname,
              state,
              ethereumaddress,
            ],
            function (err) {
              if (err) {
                console.log(err);
                return res.status(400).send("An Error Occured!");
              }
              return res.redirect("settings");
            }
          );
        } else {
          db.run(
            "UPDATE shipping SET address_line_1 = ?, address_line_2 = ?,country = ?,postCode = ?,fullName = ?,state = ?, ethWalletAddress = ? WHERE owner_id = ?",
            [
              addressLine1,
              addressLine2,
              country,
              postcode,
              fullname,
              state,
              ethereumaddress,
              //@ts-ignore
              req.user.id,
            ],
            function (err) {
              if (err) {
                return res.status(400).send("An Error Occured!");
              }
              return res.redirect("settings");
            }
          );
        }
      }
    );
  }
);

//TODO: ADD THE DETAILS PAGE
router.get(
  "/details",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  function (req: Request, res: Response) {
    res.render("details", { user: req.user });
  }
);
router.get(
  "/editdevice",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }

    db.get(
      "SELECT * FROM devices WHERE id = ? AND owner_id = ?",
      [
        req.query.deviceId,
        //@ts-ignore
        req.user.id,
      ],
      async function (err, row) {
        if (err) {
          next(err);
        }
        const data = await ipfsCAT(row.dataPath);
        const d = JSON.parse(data);
        res.render("editdevice", {
          user: req.user,
          deviceId: req.query.deviceId,
          data: d,
          videoPath: url + row.videoPath,
        });
      }
    );
  }
);

router.post(
  "/editdevice",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.json({ error: true });
    }
    const {
      devicename,
      devicedescription,
      works,
      shippingPrice,
      country,
      deviceId,
    } = req.body;

    let worksBool = false;
    if (works === "on") {
      worksBool = true;
    }

    const dataPath = await client.add(
      JSON.stringify({
        name: devicename,
        description: devicedescription,
        works: worksBool,
        shipsTo: country,
        shippingPrice: shippingPrice,
      })
    );

    await client.pin.add(dataPath.cid);

    db.run(
      "UPDATE devices SET dataPath = ? WHERE owner_id = ? AND id = ?",
      //@ts-ignore
      [dataPath.path, req.user.id, deviceId],
      async function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/mydevices");
      }
    );
  }
);

router.post(
  "/deletedevice",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.render("home");
    }
    const deviceId = req.body.deviceId;

    db.run(
      "DELETE FROM devices WHERE owner_id = ? AND id = ?",
      //@ts-ignore
      [req.user.id, deviceId],
      function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/mydevices");
      }
    );
  }
);

router.post(
  "/newdevice",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }

    const { devicename, devicedescription, works, shippingPrice, country } =
      req.body;
    // Works comes back as a string so I convert to boolean quick.
    let worksBool = false;
    if (works === "on") {
      worksBool = true;
    }

    //@ts-ignore
    if (!req.files) {
      return res.status(400).send("No files were uploaded!");
    }

    //@ts-ignore
    const videoPath = await client.add(req.files.devicevid.data);

    const dataPath = await client.add(
      JSON.stringify({
        name: devicename,
        description: devicedescription,
        works: worksBool,
        shipsTo: country,
        shippingPrice: shippingPrice,
      })
    );

    // // Pin the CID to local IPFS Node
    await client.pin.add(videoPath.cid);

    await client.pin.add(dataPath.cid);

    db.run(
      "INSERT INTO devices (owner_id,videoPath,dataPath,shippingRequested,shipped) VALUES (?,?,?,?,?)",
      [
        //@ts-ignore
        req.user.id,
        videoPath.path,
        dataPath.path,
        false,
        false,
      ],
      function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/mydevices");
      }
    );
  }
);

export default router;
