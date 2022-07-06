# Devicely

A service to p2p trade used devices for other devices.

WORK IN PROGRESS

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

Install the dependencies and run the server with pm2

    npm install

    pm2 start dist/index.js

### Mail config

Nodemailer uses mailtrap.io.

### Landing Page

Landing page was created with grapesjs. Use the index.html and the style.css files to import the grapesjs project.
