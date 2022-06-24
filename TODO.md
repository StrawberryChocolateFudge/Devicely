[] I need to add a client side page where they upload files to IPFS
[] I need to send this file to the server
[] The server needs to return all the files uploaded and show the image
[] The uploaded device is clickable and users can make offers
[] offers are uploaded to IPFS maybe they are selected from myDevices category

type Device = {
name: string
videoLink: string,
works: boolean
description: string
creator: string
}

The offer is type Device, so when somebody wants to trade, they upload another device.

[] my devices page where things are uploaded
[] public devices page where ready to trade devices are

[] Users can tip each other "respect" points via a solidity smart contract, the smart contract calls the server via chainlink to check if the user exists
