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
const NFT = config["aqua-dex"].goldNFT;
const Price = "1.5";

//--------------------------------------ADJUST-----------------------------------||

async function listNFT(_nftAddress, _id, _price) {
  console.log(`List this NFT  `, _nftAddress, _id, _price);

  const addressOfNFT = _nftAddress;
  const idOfNFT = _id;
  const priceToList = ethers.utils.parseEther(_price);

  const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
  const nftContract = new ethers.Contract(_nftAddress, nftABI, account);

  const who = await nftContract.getApproved(_id);
  console.log(`Approver of NFT:  ${who}`);

  const approve = await nftContract.approve(factoryAddress, _id);
  await approve.wait(1);

  const tx = await factoryContract.listNFT(addressOfNFT, idOfNFT, priceToList);
  if (tx) {
    const ok = await tx.wait(1);
  } else {
    console.log(`listNFT ERRORS`);
  }

  let items = await factoryContract.getListedItems();

  console.log(`Found  Nfts:  ${items}`);
}

async function run() {
  /*
  await listNFT(NFT, 0, Price);
  await listNFT(NFT, 1, Price);
  await listNFT(NFT, 2, Price);
  await listNFT(NFT, 3, Price);
*/

  await listNFT(NFT, 4, Price);
  await listNFT(NFT, 5, Price);
  await listNFT(NFT, 6, Price);
  await listNFT(NFT, 7, Price);
  await listNFT(NFT, 8, Price);
  await listNFT(NFT, 9, Price);
  await listNFT(NFT, 10, Price);
  await listNFT(NFT, 11, Price);
  await listNFT(NFT, 12, Price);
  // await listNFT(NFT, 13, Price);
  await listNFT(NFT, 14, Price);
  await listNFT(NFT, 15, Price);
  await listNFT(NFT, 16, Price);
  await listNFT(NFT, 17, Price);
  await listNFT(NFT, 18, Price);
  await listNFT(NFT, 19, Price);
  await listNFT(NFT, 20, Price);
  await listNFT(NFT, 21, Price);
  await listNFT(NFT, 22, Price);
  //  await listNFT(NFT, 23, Price);
  await listNFT(NFT, 24, Price);
  await listNFT(NFT, 25, Price);
  await listNFT(NFT, 26, Price);
  await listNFT(NFT, 27, Price);
  await listNFT(NFT, 28, Price);
  await listNFT(NFT, 29, Price);
  await listNFT(NFT, 30, Price);
  await listNFT(NFT, 31, Price);
  await listNFT(NFT, 32, Price);
  //  await listNFT(NFT, 33, Price);
  await listNFT(NFT, 34, Price);
  await listNFT(NFT, 35, Price);
  await listNFT(NFT, 36, Price);
  await listNFT(NFT, 37, Price);
  await listNFT(NFT, 38, Price);
  await listNFT(NFT, 39, Price);
  await listNFT(NFT, 40, Price);
  await listNFT(NFT, 41, Price);
  await listNFT(NFT, 42, Price);
  await listNFT(NFT, 43, Price);
  await listNFT(NFT, 44, Price);
  await listNFT(NFT, 45, Price);
  await listNFT(NFT, 46, Price);
  await listNFT(NFT, 47, Price);
  await listNFT(NFT, 48, Price);
  await listNFT(NFT, 49, Price);
 
}

run();
