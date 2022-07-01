const buyButton = document.getElementById("buyButton");
const termsLinkAnchor = document.getElementById("termsLink");
const alertEl = document.getElementById("alert");

const contractAddress = buyButton.dataset.contractaddress;
const abiAddress = buyButton.dataset.abi;
const sellerAddress = buyButton.dataset.selleraddress;
const serverAddress = buyButton.dataset.serveraddress;
const deviceHashIdentifier = buyButton.dataset.devicehashidentifier;
const shippingPrice = buyButton.dataset.price;

buyButton.onclick = async function () {
  const web3 = getWeb3();
  await switch_to_Chain(3);
  await requestAccounts();
  const contract = await getContract(web3, contractAddress);
  const address = await getAddress(web3);
  const acceptedTerms = await getAcceptedTerms(contract, address);
  if (!acceptedTerms) {
    const termsUrl = await getTerms(contract, address);
    // termsLinkAnchor.href = termsUrl;
    alertMe("info", termsUrl);
  } else {
    const onError = (err, receipt) => {
      // Render error occured
      alertMe("red", err.message);
    };
    const onReceipt = async (receipt) => {
      const events = receipt.events;
      const escrowCreated = events.EscrowCreated;
      const returnValues = escrowCreated.returnValues;
      const escrowNumber = returnValues[0];
      // send a request to the server to add a new order

      const body = JSON.stringify({
        escrowNumber,
        sellerAddress,
        buyerAddress: address,
        deviceHashIdentifier,
        price: shippingPrice,
      });

      await fetchCreateOrder(body);
    };
    alertMe("wait", "");

    // need to call the smart contract, create the escrow
    await createEscrow(
      contract,
      address,
      sellerAddress,
      address,
      onError,
      onReceipt
    );
  }
};

async function fetchCreateOrder(body) {
  try {
    const res = await fetch(serverAddress + "createOrder", {
      method: "POST",
      body,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      // redirect to the escrow page
      // with the escrow number and price!
      window.location = `${serverAddress}orders`;
    } else {
      //Render an error
      alertMe("red", await res.text());
    }
  } catch (err) {
    alertMe("red", err.message);
  }
}

async function createEscrow(contract, buyer, seller, from, onError, onReceipt) {
  await contract.methods
    .createEscrow(buyer, seller)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

async function getTerms(contract, myaddress) {
  return await contract.methods.getTerms().call({ from: myaddress });
}
async function getAcceptedTerms(contract, address) {
  return await contract.methods.acceptedTerms(address).call({ from: address });
}
async function getContract(web3, contractAddress) {
  const request = await fetch(abiAddress, { method: "GET" });
  const abiText = await request.text();
  const abi = JSON.parse(abiText).abi;
  return new web3.eth.Contract(abi, contractAddress);
}

async function requestAccounts() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
}

async function getAddress(web3) {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

function getWeb3() {
  if (window.ethereum === undefined) {
    window.open("https://metamask.io/", "_blank");
    return;
  }
  return new Web3(window.ethereum);
}

async function switch_to_Chain(chainId) {
  const hexchainId = "0x" + Number(chainId).toString(16);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexchainId }],
    });
    return true;
  } catch (err) {
    return false;
  }
}

function alertMe(type, msg) {
  alertEl.innerHTML = "";
  const span = ` <span
          class="closebtn"
          onclick="this.parentElement.style.display='none';"
          >&times;</span
        >`;
  let content = ``;

  if (type === "info") {
    alertEl.style.backgroundColor = "dodgerblue";
    content = `You need to accept our terms and conditions before you can use the escrow!`;
    alertEl.innerHTML = content;
    const anchor = document.createElement("a");
    anchor.href = msg;
    anchor.id = "termsLink";
    anchor.textContent = "HERE";
    alertEl.appendChild(anchor);
  } else if (type === "red") {
    alertEl.style.backgroundColor = "red";
    content = `An Error Occured! Message: ${msg}`;
    alertEl.innerHTML = span + content;
  } else if (type === "wait") {
    alertEl.style.backgroundColor = "dodgerblue";
    content = `Please wait for the transaction to be processed and don't close this window!`;
    alertEl.innerHTML = content;
  }
  alertEl.style.display = "block";
}
