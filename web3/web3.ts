import Web3 from "web3";
import fs from "fs";

const escrow = JSON.parse(fs.readFileSync("./public/abi/Escrow.json", "utf-8"));
let web3: Web3;

export function getWeb3(rpc: string) {
  if (web3 === undefined) {
    web3 = new Web3(rpc);
  }
  return web3;
}

export async function getContract(web3: any, contractAddress: string) {
  return new web3.eth.Contract(escrow.abi, contractAddress);
}

export async function getDetailByIndex(contract: any, index: string) {
  return await contract.methods.getDetailByIndex(index).call({});
}
