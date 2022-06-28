import express from "express";
import { Request, Response } from "express";
import db from "../db.js";
import { client } from "../app.js";
import ejs from "ejs";
import { validateEdit, validateNew } from "./validators.js";
import { filterQueryBuilder, fromDBPrice, toDBPrice } from "./utils.js";
import { count } from "console";

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
    const { search, country, sortby } = req.query;

    const query = filterQueryBuilder(search, country, sortby);
    db.all(query[0], query[1], async function (err, row) {
      if (err) {
        next(err);
      }
      let myDevices = [];

      for (let i = 0; i < row.length; i++) {
        let r = row[i];
        myDevices.push({
          videoPath: url + r.videoPath,
          pagePath: url + r.pagePath,
          name: r.name,
          desc: r.description,
          price: fromDBPrice(r.price),
          shipped: r.shipped,
          country: r.country,
        });
      }
      res.render("index", {
        user: req.user,
        myDevices,
        search,
        country,
        sortby,
      });
    });
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

          myDevices.push({
            id: r.id,
            videoPath: url + r.videoPath,
            pagePath: url + r.pagePath,
            name: r.name,
            desc: r.description,
            works: r.works,
            shippingPrice: fromDBPrice(r.price),
            stock: r.stock,
            shipsTo: r.shipsTo,
          });
        }

        res.render("mydevices", { user: req.user, myDevices });
      }
    );
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

        if (row == undefined) {
          res.status(400).send("Unable to find device!");
        } else {
          res.render("editdevice", {
            user: req.user,
            deviceId: req.query.deviceId,
            videoPath: url + row.videoPath,
            name: row.name,
            description: row.description,
            works: row.works,
            shippingPrice: fromDBPrice(row.price),
            stock: row.stock,
            shipsTo: row.shipsTo,
          });
        }
      }
    );
  }
);

router.post(
  "/editdevice",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.status(400).send("You need to be logged in to edit a device.");
    }
    const {
      devicename,
      devicedescription,
      works,
      shippingPrice,
      country,
      deviceId,
      stock,
      videoPath,
    } = req.body;

    const valid = validateEdit(req.body);

    if (!valid) {
      return res.status(400).send("Invalid request body");
    }

    let worksBool = false;
    if (works === "on") {
      worksBool = true;
    }
    const page = await ejs.renderFile("views/device.ejs", {
      videoPath,
      name: devicename,
      description: devicedescription,
      works: worksBool,
      shipsTo: country,
      shippingPrice: shippingPrice,
      stock: stock,
    });

    const pagePath = await client.add(page);

    await client.pin.add(pagePath.cid);

    db.run(
      "UPDATE devices SET pagePath = ?, name = ?, description = ?,works = ?,shipsTo = ?,price = ?,stock = ? WHERE owner_id = ? AND id = ?",
      [
        pagePath.path,
        devicename,
        devicedescription,
        worksBool,
        country,
        toDBPrice(shippingPrice),
        stock,
        //@ts-ignore
        req.user.id,
        deviceId,
      ],
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

    const {
      devicename,
      devicedescription,
      works,
      shippingPrice,
      country,
      stock,
    } = req.body;

    const valid = validateNew(req.body);
    if (!valid) {
      return res.status(400).send("Invalid request body");
    }

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

    const page = await ejs.renderFile("views/device.ejs", {
      videoPath,
      name: devicename,
      description: devicedescription,
      works: worksBool,
      shipsTo: country,
      shippingPrice: shippingPrice,
      stock: stock,
    });

    const pagePath = await client.add(page);
    // // Pin the CID to local IPFS Node
    await client.pin.add(videoPath.cid);

    await client.pin.add(pagePath.cid);

    db.run(
      "INSERT INTO devices (owner_id,videoPath,pagePath,name,description,works,shipsTo,price,stock) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        //@ts-ignore
        req.user.id,
        videoPath.path,
        pagePath.path,
        devicename,
        devicedescription,
        worksBool,
        country,
        toDBPrice(shippingPrice),
        stock,
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
