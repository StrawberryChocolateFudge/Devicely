export function validateEdit(body: any): boolean {
  const props = [
    "devicename",
    "devicedescription",
    "shippingPrice",
    "country",
    "deviceId",
    "stock",
    "videoPath",
  ];

  for (let i = 0; i < props.length; i++) {
    if (body[props[i]] === undefined) {
      return false;
    }
  }
  return true;
}

export function validateNew(body: any): boolean {
  const props = [
    "devicename",
    "devicedescription",
    "shippingPrice",
    "country",
    "stock",
  ];

  for (let i = 0; i < props.length; i++) {
    if (body[props[i]] === undefined) {
      return false;
    }
  }
  return true;
}

export function validateSettings(body: any): boolean {
  const props = [
    "ethereumaddress",
    "fullname",
    "addressLine1",
    "addressLine2",
    "postcode",
    "country",
    "state",
    "email",
  ];

  for (let i = 0; i < props.length; i++) {
    if (body[props[i]] === undefined) {
      return false;
    }
  }
  return true;
}

export function validateCreateOrder(body: any): boolean {
  // I'm not validating escrow number because of the 0 price orders
  const props = [
    "sellerAddress",
    "buyerAddress",
    "deviceHashIdentifier",
    "price",
  ];

  for (let i = 0; i < props.length; i++) {
    if (body[props[i]] === undefined) {
      return false;
    }
  }
  return true;
}
