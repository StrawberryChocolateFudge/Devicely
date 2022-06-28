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
