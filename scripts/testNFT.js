const ethers = require('ethers');
const routerABI = require('../abi/amm_router.json');// Uniswap AMM router
const nftABI = require('../abi/rubyNFTAdmin.json');// NFT 
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);
//--------------------------------------ADJUST-----------------------------------||
const routerAddress = "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487";
const fromToken = config.assets.fancy.USDP;
const toToken = config.assets.fancy.RUBY;
const swapAmount = '1';

async function testNFT() {

    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    let factoryAddr = await routerContract.factory();
    let nftAdmin = await routerContract.nftAdmin();

    console.log("DEBUG factory ", factoryAddr)  //0xc2f4C9B69448D94da2623787bD552F12B6a91278
    console.log("DEBUG NFT ", nftAdmin) // 0x3E2D0A366B8D8D317124304A0c63897484002614

    const nftContract = new ethers.Contract(nftAdmin, nftABI, account);

    let profileNFT = await nftContract.profileNFT()
    console.log("DEBUG profileNFT ", profileNFT) // 0xC232fD6cdB82Bd2aB4dCD590b262B765bAB4C021

    let freeSwapNFT = await nftContract.freeSwapNFT()
    console.log("DEBUG freeSwapNFT ", freeSwapNFT) // 0x1fAd768886a491f5BCa02C17fB4C177a427cecDd

    let fee= await nftContract.calculateAmmSwapFeeDeduction(account.address)
    console.log("DEBUG swapFee ", fee.toString()) // 0xC232fD6cdB82Bd2aB4dCD590b262B765bAB4C021

    /* ADMIN
      function mintProfileNFT(address user) external;

    function setProfileNFT(address newProfileNFT) external;

    function setFreeSwapNFT(address newFreeSwapNFT) external;

    function setMinter(address minter, bool allowance) external;

    */

}

async function run(){
   await testNFT();
}

run();