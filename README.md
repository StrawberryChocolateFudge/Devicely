# Devicely

This application is a marketplace to buy-sell used electronic devices.

Check out the website: [devicely.xyz](https://devicely.xyz)

It was built for the Sustainable Blockchain Hackathon. It is an attempt to fix the E-Waste crisis by providing a platform for recycleable or still useful electronic devices.

Anyone can sell on this market, who has unused smartphones, laptops or other devices laying around (like an old broken microwave) and earn crypto.

Tech Stack:

- Nodejs Express Server with SQLite
- Ips daemon
- Solidity Smart Contracts and Smart Contract Front end.
- A Ricardian Contract

You can find step by step instructions on how to use the application on the help page [here](https://devicely.xyz/help.html).

Smart contracts are deployed on Ropsten Testnet

### Node js and Express

Hosting my own express server allows me to choose the best provider to achieve my sustainablility goals. The server is hosted at Hetzner in Helsinki and it runs on Hydropower and Wind.

The server does the following:

- Authentication
- Server-Side Rendering (using EJS)
- Hosts Files
- Connects to the IPFS daemon to add and pin videos and websites.
- Connects to SQLITE3

##### Uploading

You can upload devices on the website to sell. For this you need:

- A MP4 video. This is uploaded to IPFS and pinned on the node.
- Name, Description Price, Stock, Shipping etc. The Stock decrements each time an escrow is used to sell the item.

Filling out the form will upload the MP4 to IPFS and render a website with the device.

This website is also hosted on IPFS and it's a DApp basicaly, running web3.js on the client side to invoke a smart contract.

##### Pages

So each device has it's own dedicated page hosted on IPFS with a buy button that uses Metamask.

When the buy button is clicked, first the user is prompted to sign written contract, this contract is a Ricardian contract and it's connected to the escrow smart contracts directly. It requires metamask to sign.

After this the user will be able to call a "Create Escrow" function when buying something. How the escrow works is explaned later.

##### Search and Manage

You can find other sellers devices by using the search or you can your edit own devices you are selling.

##### Orders

The server also handles the orders and users can request dispute resolution if their orders are not arriving. Orders can be marked shipped or rejected by the seller.

Email sending is implemented but uses Mailtrap.io.

### IPFS Daemon

The IPFs daemon is running parallel to the NodeJs app.

I used go-ipfs and nodejs connects to the RPC on port 5001.

Only the readable gateway is exposed to the internet.

After the device pages and the videos are uploaded they are served from here directly.

### Smart contracts and Front-End

This is hosted in another github repo
You can find it [here](https://github.com/StrawberryChocolateFudge/Devicely_Escrow).

It uses Hardhat and Parcel and this repo is a fork of an escrow I developed before.
Here is how it works:

- When clicking the buy button on a device page, you are prompted to call the smart contract function **create Escrow**, after tnks the escrow is created and an order will be created too.

The buyer is then redirected and prompted to deposit the payment into the escrow.

The escrow has multiple states:

1. Awaiting Payment: No payment has been made,yet. The buyer can deposit it.

2. Awaiting Delivery: Payment made, waiting for the package to be delivered. The buyer can mark the state delivered if the package arrives or the seller can refund it.
3. Delivered : The package has been delivered, the seller can pull payments
4. Refunded : The order has been refunded, the buyer can pull payments

The third party is the escrow agent who provides the dispute resolution, he can refund or mark delivered any escrow that is awaiting delivery with this resolving disputes.

### Ricardian contract

The job of the escrow agent is described in a ricardian contract that is directly connected to the escrow contract.

The ricardian contract was created with a project that I have been working on before, you can find more information about it [here](https://ricardianfabric.com).

in a nutshell, a website is rendered from a legal written contract and it's uploaded to IPFS. It has a way to connect to a smart contract, similar to how an NFT is connected to an image.

This ricardian contract explains how the escrow agent resolves disputes and only participants who sign it can use the escrow.

## Dev

This is deployed on a Hetzner server running Ubuntu with nginx and using node + pm2.

### First time setup

Ssh on the remote server:

    sudo apt update

    sudo apt upgrade

    adduser devicely

    usermod -aG sudo devicely

    sudo apt install nginx

    # Snap is needed due to certbot install
    sudo apt install snapd

    sudo snap install --classic certbot

    sudo ln -s /snap/bin/certbot /usr/bin/certbot

    sudo certbot --nginx

    # nodejs install

    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs

You can find the nginx config file in the repositiory!

Install ipfs:

    npm install -g go-ipfs

    ipfs init

    ipfs daemon

Configure systemd for ipfs

    [Unit]
    Description=IPFS Daemon
    After=syslog.target network.target remote-fs.target nss-lookup.target
    [Service]
    Type=simple
    ExecStart=/usr/bin/ipfs daemon
    User=devicely
    [Install]
    WantedBy=multi-user.target

Install PM2

    npm install -g pm2

    pm2 startup systemd

Clone the express server from github

Install the dependencies and run the server with pm2 from the devicely user.

    npm install

    pm2 start dist/index.js

### Landing Page

Landing page was created with grapesjs. Check it out [here](https://grapesjs.com/demo.html). Use the home.html and the style.css files to import the grapesjs project and there you can edit it. Or create a new one.

I choose grapesjs because of the time limit in the hackathon. It was faster to create a website with a builder, than by hand
