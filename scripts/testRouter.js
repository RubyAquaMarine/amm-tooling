
const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const routerABI = require('../abi/amm_router.json');
const config = require('../setConfig.json');
const rpcUrl = config.rpc.schainEuropa;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);


const routerAddress = config.amm.router;
const routerContract = new ethers.Contract(routerAddress, routerABI, account);

async function testThis() {

    //USDP
    const address = config.assets.europa.USDP;
    const contract = new ethers.Contract(address, erc20ABI, account);
    const value = await contract.name();
    console.log("Print out:", value);

    const factoryAddress = await routerContract.factory();
    console.log("factoryAddress: ", factoryAddress);


    let tokenInAmount = ethers.utils.parseUnits("1", 'ether');// works
    let feeAmount = ethers.utils.parseUnits("0", 'ether');// works

    console.log("Swap amount", tokenInAmount.toString())
    // trading fee limits =997 -1000
    const tokenOut = await routerContract.getAmountsOut(tokenInAmount, [config.assets.europa.USDP, config.assets.europa.RUBY],997).then(result => {
      console.log("getAmountsOut Result: ", result[0].toString());
      console.log("getAmountsOut Result: ", result[1].toString());
      return result;
  }).catch(err => {
      console.log("getAmountsOut Error: ", err);
  })

   
}


 function run() {
   testThis()
}

run();