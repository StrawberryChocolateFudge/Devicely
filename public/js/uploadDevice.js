const ipfsParams = { host: "ipfs.infura.io", port: 5001, protocol: "https" };
const ipfsClient = IpfsHttpClient.create(ipfsParams);

const uploadBttn = document.getElementById("uploadButton");

uploadBttn.onclick = uploadDevice;

async function uploadDevice() {
  const vid = document.getElementById("deviceVid");
  const name = document.getElementById("devicename");
  const desc = document.getElementById("deviceDescription");
  const works = document.getElementById("deviceWorks");
  const shippingPrice = document.getElementById("shippingPrice");
  const shipsTo = document.getElementById("ships-to");

  if (vid.files.length === 0 || vid.files.length > 1) {
    renderError("You need to select 1 file!");
    return;
  }
  const file = vid.files[0];

  if (file.type !== "video/mp4") {
    renderError("You can only upload mp4 videos!");
    return;
  }

  if (name.value.length === 0) {
    renderError("You need to name the device");
    return;
  }

  if (desc.value.length < 100) {
    renderError("You need to add a description. Min 100 characters");
    return;
  }

  if (shipsTo.value === "select country") {
    renderError("You need to specify where you can ship the device");
    return;
  }

  renderError("");
  console.log(vid.files);
  console.log(name.value);
  console.log(desc.value);
  console.log(works.checked);
  console.log(shipsTo.value);

  //TODO: Upload the video to ipfs
  // upload the description to IPFS also

  const videoCID = await ipfsClient.add(file);
  const videoPath = videoCID.path;
  console.log(videoPath);

  const dataCID = await ipfsClient.add(
    JSON.stringify({
      name: name.value,
      description: desc.value,
      works: works.checked,
      shipsTo: shipsTo.value,
      shippingPrice: shippingPrice.value,
    })
  );
  const dataPath = dataCID.path;
  console.log(dataPath);

  // TODO: render loading indicator

  //TODO: PING THE BACKEND WITH THE CIDs and redirect
  const body = JSON.stringify({ videoPath, dataPath });

  console.log(body);
  const res = await fetch("/newdevice", {
    method: "POST",
    body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log(res);
  const result = await res.json();
  console.log(result);
  if (result.error) {
    renderError("An error occured");
  } else {
    window.location.href("/mydevices");
  }
}

function renderError(msg) {
  const errorSlot = document.getElementById("errorSlot");
  errorSlot.innerHTML = msg;
}
