import {
  assetsLink,
  contractAddress,
  escrowURL,
  rpcURL,
  url,
  __dirname,
} from "../app.js";
import express from "express";
import { Request, Response } from "express";
import db from "../db.js";
import { client } from "../app.js";
import ejs from "ejs";
import { validateEdit, validateNew } from "./validators.js";
import {
  createDeviceIdentifier,
  escrowStateConverter,
  filterQueryBuilder,
  fromDBPrice,
  toDBPrice,
} from "./utils.js";
import { getWeb3 } from "../web3/web3.js";
import { getContract } from "../web3/web3.js";
import { getDetailByIndex } from "../web3/web3.js";

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
      "SELECT * FROM userdetails WHERE owner_id = ?",
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
            email: "",
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
            email: row.emailAddress,
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
      email,
    } = req.body;

    db.get(
      "SELECT * FROM userdetails WHERE owner_id = ?",
      //@ts-ignore
      [req.user.id],
      function (err, row) {
        if (err) {
          return res.status(400).send("An Error Occured!");
        }

        if (row === undefined) {
          db.run(
            "INSERT INTO userdetails (owner_id, address_line_1, address_line_2, country, postCode, fullName, state, ethWalletAddress,emailAddress) VALUES (?,?,?,?,?,?,?,?,?)",
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
              email,
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
            "UPDATE userdetails SET address_line_1 = ?, address_line_2 = ?,country = ?,postCode = ?,fullName = ?,state = ?, ethWalletAddress = ?, emailAddress = ? WHERE owner_id = ?",
            [
              addressLine1,
              addressLine2,
              country,
              postcode,
              fullname,
              state,
              ethereumaddress,
              email,
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

    db.get(
      "SELECT * FROM userdetails WHERE owner_id = ?",
      [
        //@ts-ignore
        req.user.id,
      ],
      async function (err, row) {
        if (err) {
          return next(err);
        }
        const pageData = {
          videoPath,
          name: devicename,
          description: devicedescription,
          works: worksBool ? "Working" : "Doesn't work",
          shipsTo: country,
          shippingPrice: shippingPrice,
          stock: stock,
          deviceIdentifier: row.deviceIdentifier,
          metamaskLink: assetsLink + "metamask.svg",
          basecssLink: assetsLink + "css/base.css",
          indexcssLink: assetsLink + "css/index.css",
          appcssLink: assetsLink + "css/app.css",
          scriptLink: assetsLink + "js/device.js",
          contractABI: assetsLink + "abi/Escrow.json",
          serverAddress: assetsLink,
          sellerAddress: row.ethWalletAddress,
          sellerId: row.owner_id,
          contractAddress,
          escrowURL,
        };
        const deviceHashIdentifier = createDeviceIdentifier(pageData);
        const page = await ejs.renderFile("views/device.ejs", {
          ...pageData,
          deviceHashIdentifier,
        });

        const pagePath = await client.add(page);

        await client.pin.add(pagePath.cid);

        db.run(
          "UPDATE devices SET pagePath = ?, name = ?, description = ?,works = ?,shipsTo = ?,price = ?,stock = ?,deviceIdentifier = ? WHERE owner_id = ? AND id = ?",
          [
            pagePath.path,
            devicename,
            devicedescription,
            worksBool,
            country,
            toDBPrice(shippingPrice),
            stock,
            deviceHashIdentifier,
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
    db.get(
      "SELECT * FROM userdetails WHERE owner_id = ?",
      [
        //@ts-ignore
        req.user.id,
      ],
      async function (err, row) {
        if (err) {
          return next(err);
        }

        const pageData = {
          videoPath,
          name: devicename,
          description: devicedescription,
          works: worksBool ? "Working" : "Doesn't work",
          shipsTo: country,
          shippingPrice: shippingPrice,
          stock: stock,
          metamaskLink: assetsLink + "metamask.svg",
          basecssLink: assetsLink + "css/base.css",
          indexcssLink: assetsLink + "css/index.css",
          appcssLink: assetsLink + "css/app.css",
          scriptLink: assetsLink + "js/device.js",
          contractABI: assetsLink + "abi/Escrow.json",
          serverAddress: assetsLink,
          sellerAddress: row.ethWalletAddress,
          sellerId: row.owner_id,
          contractAddress,
          escrowURL,
        };

        const deviceHashIdentifier = createDeviceIdentifier(pageData);

        const page = await ejs.renderFile("views/device.ejs", {
          ...pageData,
          deviceHashIdentifier,
        });

        const pagePath = await client.add(page);
        // // Pin the CID to local IPFS Node
        await client.pin.add(videoPath.cid);

        await client.pin.add(pagePath.cid);

        db.run(
          "INSERT INTO devices (owner_id,videoPath,pagePath,name,description,works,shipsTo,price,stock,deviceIdentifier) VALUES (?,?,?,?,?,?,?,?,?,?)",
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
            deviceHashIdentifier,
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
  }
);

router.get(
  "/orders",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }

    db.all(
      "SELECT * FROM orders WHERE seller_id = ? OR buyer_id = ?",
      //@ts-ignore
      [req.user.id, req.user.id],
      function (err, row) {
        if (err) {
          next(err);
        }
        console.log(row);

        //TODO: row is missing order id

        res.render("orders", { user: req.user, myorders: row, escrowURL });
      }
    );
  }
);

router.post(
  "/createOrder",
  async function (req: Request, res: Response, next: CallableFunction) {
    //Anyone can call this endpoint,
    // however there are checks to make sure seller and buyer and the product exists!

    const {
      escrowNumber,
      sellerAddress,
      buyerAddress,
      deviceHashIdentifier,
      price,
    } = req.body;

    // Validate Escrow Number using web3.js!

    const web3 = getWeb3(rpcURL);

    const contract = await getContract(web3, contractAddress);

    const details = await getDetailByIndex(contract, escrowNumber);

    if (!details.initialized) {
      return res.status(400).send("Invalid Escrow");
    }

    if (details.buyer !== buyerAddress) {
      return res.status(400).send("Invalid Escrow");
    }
    if (details.seller !== sellerAddress) {
      return res.status(400).send("Invalid Escrow");
    }

    db.get(
      "SELECT * FROM devices WHERE deviceIdentifier = ?",
      [deviceHashIdentifier],
      async function (err, deviceRow) {
        if (err) {
          next();
        }
        if (toDBPrice(price) !== deviceRow.price) {
          // if price is incorrect, return error

          return res.status(400).send("Invalid price");
        }

        // check if there is enough in stock

        if (deviceRow.stock < 1) {
          return res.status(400).send("Out of Stock");
        }

        db.get(
          "SELECT * FROM userdetails WHERE owner_id = ?",
          [deviceRow.owner_id],
          async function (err, sellerRow) {
            if (err) {
              next();
            }

            if (sellerAddress !== sellerRow.ethWalletAddress) {
              //The ethereum wallet address is wrong
              return res.status(400).send("Invalid seller address");
            }

            db.get(
              "SELECT * FROM userdetails WHERE ethWalletAddress = ?",
              [buyerAddress],
              async function (err, buyerRow) {
                if (err) {
                  next(err);
                }

                if (buyerRow === undefined) {
                  // Couldn't find the ethereum address of the buyer...
                  return res
                    .status(400)
                    .send(
                      "Cannot find your address in the database! Your metamask address and your settings must match!"
                    );
                }

                db.run(
                  "INSERT INTO orders (name,seller_id,seller_address,buyer_id,buyer_address,device,escrow_number,price,status,shipped) VALUES (?,?,?,?,?,?,?,?,?,?)",
                  [
                    deviceRow.name,
                    sellerRow.id,
                    sellerAddress,
                    buyerRow.id,
                    buyerAddress,
                    deviceRow.id,
                    escrowNumber,
                    toDBPrice(price),
                    "Pending",
                    false,
                  ],
                  async function (err) {
                    if (err) {
                      return res
                        .status(400)
                        .send("Coudn't insert new order into database");
                    }

                    //DECREMENT THE STOCK

                    db.run(
                      "UPDATE devices SET stock = ? WHERE id = ?",
                      [deviceRow.stock - 1, deviceRow.id],
                      function (err) {
                        if (err) {
                          return res
                            .status(400)
                            .send("Unable to decrement stock");
                        }
                        return res.status(200).send();
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

router.get(
  "/deviceLink",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }

    const { deviceId } = req.query;

    db.get(
      "SELECT * FROM devices WHERE id = ?",
      [deviceId],
      function (error, row) {
        if (error) {
          next(error);
        }
        return res.redirect(url + row.pagePath);
      }
    );
  }
);

router.get(
  "/order",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }
    // TODO: enable and disable buttons based on the status of the order

    const { orderid } = req.query;
    db.get(
      "SELECT * FROM orders WHERE id = ?",
      [orderid],
      async function (error, orderRow) {
        if (error) {
          next(error);
        }
        if (orderRow === undefined) {
          return res.status(404).send("Not Found");
        }
        const details = await getDetails(orderRow.escrow_number);

        const orderDetails = {
          status: orderRow.status,
          seller_address: orderRow.seller_address,
          buyer_address: orderRow.buyer_address,
          price: fromDBPrice(orderRow.price),
          escrowState: escrowStateConverter(details.state),
          orderid: orderRow.id,
        };
        //@ts-ignore
        if (orderRow.seller_id === req.user.id) {
          // If the seller is calling this endpoint, I need to show them the buyer's address
          db.get(
            "SELECT * FROM userdetails WHERE id = ?",
            [orderRow.buyer_id],
            async function (error, buyerRow) {
              if (error) {
                next(error);
              }

              const buyerDetails = {
                address_line_1: buyerRow.address_line_1,
                address_line_2: buyerRow.address_line_2,
                country: buyerRow.country,
                postCode: buyerRow.postCode,
                fullName: buyerRow.fullName,
                state: buyerRow.state,
              };
              console.log(buyerDetails);
              return res.render("order", {
                user: req.user,
                ...buyerDetails,
                ...orderDetails,
                selling: true,
              });
            }
          );
          //@ts-ignore
        } else if (orderRow.buyer_id === req.user.id) {
          return res.render("order", {
            user: req.user,
            selling: false,
            ...orderDetails,
          });
        } else {
          return res.redirect("/home");
        }
      }
    );
  }
);

// Hit this endpoint to mark the Status Shipped
router.post(
  "/ordershipped",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }
    const { orderid } = req.body;
    console.log(orderid);
    if (orderid === undefined) {
      return res.status(400).send("Invalid orderid");
    }

    db.get(
      "SELECT * FROM orders WHERE id = ?",
      [orderid],
      function (error, order) {
        if (error) {
          console.log(error);
          return res.status(400).send("Invalid orderid");
        }
        //@ts-ignore
        if (order.seller_id !== req.user.id) {
          // If the sender of the request is not the seller,
          // then this endpoint returns error
          return res.status(400).send("Invalid user id");
        }

        if (order.status !== "Pending") {
          return res.status(400).send("Only pending orders can be shipped!");
        }
        db.run(
          "UPDATE orders SET status = ? WHERE id = ?",
          ["Shipped", orderid],
          function (err) {
            if (err) {
              return res.status(400).send("Unable to update order");
            }
            return res.redirect("/order?orderid=" + orderid);
          }
        );
      }
    );
  }
);

router.post(
  "/orderrejected",
  function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }

    const { orderid } = req.body;

    if (orderid === undefined) {
      return res.status(400).send("Invalid orderid");
    }

    db.get(
      "SELECT * FROM orders WHERE id = ?",
      [orderid],
      function (error, order) {
        if (error) {
          return res.status(400).send("Invalid orderid");
        }

        //@ts-ignore
        if (order.seller_id !== req.user.id) {
          return res.status(400).send("Invalid user id");
        }

        if (order.status !== "Pending") {
          return res.status(400).send("Only pending orders can be rejected!");
        }

        db.run(
          "UPDATE orders SET status = ? WHERE id = ?",
          ["Rejected", orderid],
          function (err) {
            if (err) {
              return res.status(400).send("Unable to update order");
            }
            return res.redirect("/order?orderid=" + orderid);
          }
        );
      }
    );
  }
);

// This endpoint is hit by the escrow front end and the app will update the DB on escrow status!
// This is to send email!
router.post(
  "/escrowState",
  async function (req: Request, res: Response, next: CallableFunction) {
    if (!req.user) {
      return res.redirect("/home");
    }

    const { escrowNr } = req.body;

    const details = await getDetails(escrowNr);

    //TODO: SEND AN EMAIL ABOUT THE CHANGED ESCROW STATE
    // CHECK STATUS TO AVOID SENDING SPAM!
  }
);

async function getDetails(escrowid: string) {
  // FETCH ESCROW DETAILS FROM WEB3 AND USE IT TO UPDATE THE DB!
  const web3 = getWeb3(rpcURL);

  const contract = await getContract(web3, contractAddress);

  const details = await getDetailByIndex(contract, escrowid);
  return details;
}

export default router;
