const axios = require('axios');
const ethers = require('ethers');
const erc20ABI = require('../../abi/erc20.json');
const routerABI = require('../../abi/amm_router.json');
const factoryABI = require('../../abi/factory.json');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const account = walletOrigin.connect(provider);


//--------------------------------------ADJUST-----------------------------------||
const routerAddress = config.ammv3.router;
const factoryAddress = config.ammv3.factory;
// SET THE ASSETS FOR THE AMM POOL CREATION
// ENTER THE DESIRED INPUT AMOUNTS TO DETERMINE THE PRICING 

// usdp/xyz = price is checked before the pool is created. See below
const tokenBaseUSDP = config.assets.europa_staging.USDP;
const amountUSDP = "18000";
//--
const tokenB = config.assets.europa_staging.BTC;
const amountXYZ = "1";

const usdpToken = new ethers.Contract(tokenBaseUSDP, erc20ABI, account);
const bToken = new ethers.Contract(tokenB, erc20ABI, account);
const factory = new ethers.Contract(factoryAddress, factoryABI, account);

let aDecimal;
let bDecimal;


async function createPair() {
  const key = account.address;

  let isCreator = await factory.pairCreators(key);
  console.log("is Creator::", isCreator, key)
  let isAdmin = await factory.admin();
  console.log("is Admin::", isAdmin)


  // setPairCreator on the uniswap.factory 
  if (isCreator === false) {
    console.log("deployer::", key)
    let tx = await factory.setPairCreator(key, true);
    let output = await tx.wait(1);
    console.log("factory :", output)
  }

  // setPairCreator on the uniswap.factory 
  let tx = await factory.setPairCreator(routerAddress, true);
  let output = await tx.wait(1);
  console.log("router :", output)


  const blockNumber = await provider.getBlockNumber();
  const blockData = await provider.getBlock(blockNumber);
  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

  aDecimal = await usdpToken.decimals();
  bDecimal = await bToken.decimals();

  const aSym = await usdpToken.symbol();
  const bSym = await bToken.symbol();

  console.log("DECIMALS " + aDecimal + "  " + bDecimal," | ",  aSym, bSym)

  const weiAmountA = ethers.utils.parseUnits(amountUSDP, aDecimal);// USDP
  const weiAmountB = ethers.utils.parseUnits(amountXYZ, bDecimal);// OTHER

  let amountAdesired = weiAmountA;
  let amountBdesired = weiAmountB;

  //approve the assets
  await doApproval(usdpToken, amountAdesired);
  await doApproval(bToken, amountBdesired);

  const routerContract = new ethers.Contract(routerAddress, routerABI, account);
  let ok = await routerContract.addLiquidity(
    tokenBaseUSDP,
    tokenB,
    amountAdesired,
    amountBdesired,
    amountAdesired,
    amountBdesired,
    key,
    expiryDate

  ).then(result => {
    // result is another promise =. deal with it 
    let out = result.wait().then(ok => {
      console.log("Result: ", ok);
    }).catch(err => {
      console.log("Result Error: ", err);
    });
  }).catch(err => {
    console.log("Processing Error: ", err);
  });
}

// Any input of tokenBaseUSDP and TokenB are allowed, uniswap will figure out the amounts automatically
// Allow any amount: ethers.constants.Zero 
async function addLPtoPair() {
  const blockNumber = await provider.getBlockNumber();
  const blockData = await provider.getBlock(blockNumber);
  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

  aDecimal = await usdpToken.decimals();
  bDecimal = await bToken.decimals();

  console.log("DECIMALS " + aDecimal + "  " + bDecimal)

  const weiAmountA = ethers.utils.parseUnits(amountUSDP, aDecimal);// USDP
  const weiAmountB = ethers.utils.parseUnits(amountXYZ, bDecimal);// OTHER

  let amountAdesired = weiAmountA;
  let amountBdesired = weiAmountB;

  //approve the assets
  await doApproval(usdpToken, amountAdesired);
  await doApproval(bToken, amountBdesired);

  const routerContract = new ethers.Contract(routerAddress, routerABI, account);
  let ok = await routerContract.addLiquidity(
    tokenBaseUSDP,
    tokenB,
    amountAdesired,
    amountBdesired,
    ethers.constants.Zero,
    ethers.constants.Zero,
    account.address,
    expiryDate

  ).then(result => {
    // result is another promise =. deal with it 
    let out = result.wait().then(ok => {
      console.log("Result: ", ok);
    }).catch(err => {
      console.log("Result Error: ", err);
    });
  }).catch(err => {
    console.log("Processing Error: ", err);
  });
}

async function doApproval(tokenContract, amount) {
  const token = tokenContract;
  const weiAmount = amount;

  let allowanceAmount = await token.allowance(account.address, routerAddress);

  console.log("Router Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
    console.log("Router Contract Needs Increased Allowance: ");
    const parse = await token.approve(routerAddress, weiAmount);
    const receipt = await parse.wait();
    console.log("Router Contract Result: ", receipt);
  }

  console.log("Router Contract Allowance Complete");
}


function createAnyPriceForPool() {
  const a = ethers.utils.parseUnits(amountUSDP, 18);// USDP
  const b = ethers.utils.parseUnits(amountXYZ, 18);// XYZ
  // 100 usdp and / 100 ruby = 1 ruby = usdp 
  let price = a / b;
  console.log("PRICE FOR POOL WILL BE ", price.toString())
  return price
}

async function testThis() {
  // CHECK THE PRICE FIRST. If CORRECT, createPair()
  createAnyPriceForPool()
  await createPair();


  // ADD MORE LIQUIDITY
  await addLPtoPair()

}

testThis();

//: if needed for btcusd , createPoolRuby.js in /scripts/ for binance pricing to setup the pool pricing correctly


