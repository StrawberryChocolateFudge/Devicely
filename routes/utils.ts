import crypto from "crypto";

export function fromDBPrice(price: number) {
  return (price / 100).toFixed(2);
}
export function toDBPrice(price: string): number {
  return parseFloat(price) * 100;
}

export function filterQueryBuilder(
  search: string | undefined,
  country: string | undefined,
  sortby: string | undefined
): [string, any[]] {
  if (!search && !country && !sortby) {
    // if all three are undefined, I just select all
    return ["SELECT * FROM devices WHERE stock > 0", []];
  }

  let args = [];

  let searchQueryStr = "";
  if (search !== undefined && search !== "") {
    searchQueryStr = `AND name like ?`;
    args.push(search + "%");
  }
  let countryQueryStr = "";
  if (country !== undefined && country !== "") {
    countryQueryStr = ` AND shipsTo = ?`;
    args.push(country);
  }
  let sortByPriceQuery = "";
  if (sortby !== undefined && sortby !== "") {
    if (sortby === "lowToHigh") {
      sortByPriceQuery = ` ORDER BY price ASC`;
    } else {
      sortByPriceQuery = ` ORDER BY price DESC`;
    }
  }
  return [
    `SELECT * FROM devices WHERE stock > 0 ${searchQueryStr}${countryQueryStr}${sortByPriceQuery}`,
    args,
  ];
}

export function createDeviceIdentifier(data: any) {
  const randomSEED = Math.random();
  const token = JSON.stringify(data) + randomSEED;
  const hash = crypto.createHash("sha512").update(token).digest("hex");
  return hash;
}

export function escrowStateConverter(state: string) {
  const states = [
    "Awaiting Payment",
    "Awaiting Delivery",
    "Delivered",
    "Refunded",
  ];
  return states[parseInt(state)];
}
