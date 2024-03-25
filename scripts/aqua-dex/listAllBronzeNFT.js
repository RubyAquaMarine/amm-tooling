const ethers = require("ethers");
const nftABI = require("../../abi/aquaNFT.json");
const factoryABI = require("../../abi/marketplace.json");
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const account = wallet.connect(provider);

//--------------------------------------ADJUST-----------------------------------||
const factoryAddress = config["aqua-dex"].marketplace;
const NFT = config["aqua-dex"].bronzeNFT;
const Price = "0.03"; // 1.5000 0000 0000 0000 00

const START = 100;
const LOOP = 100;

//--------------------------------------ADJUST-----------------------------------||

async function listNFT(_nftAddress, _price) {
  const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
  const nftContract = new ethers.Contract(_nftAddress, nftABI, account);

  const priceToList = ethers.utils.parseEther(_price);

  for (let index = START; index < LOOP + START; index++) {
    const element = array[index];

    console.log(`List this NFT  `, _nftAddress, index, _price);

    // const who = await nftContract.getApproved(_id);
    // console.log(`Approver of NFT:  ${who}`);

    const approve = await nftContract.approve(factoryAddress, index);
    await approve.wait(1);

    const tx = await factoryContract.listNFT(_nftAddress, index, priceToList);
    if (tx) {
      const ok = await tx.wait(1);
    } else {
      console.log(`listNFT ERRORS`);
    }
  }

  //  let items = await factoryContract.getListedItems();

  //  console.log(`Found  Nfts:  ${items}`);
}

async function run() {

  await listNFT(NFT,Price);
 
}

run();

// node scripts/aqua-dex/listallbronzenft