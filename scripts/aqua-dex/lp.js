// AQUA DEX aqua-dex : $node scripts/aqua-dex/lp
const axios = require("axios");
const ethers = require("ethers");
const erc20ABI = require("../../abi/erc20.json");
const routerABI = require("../../abi/amm_router.json");
const factoryABI = require("../../abi/factory.json");
const pairABI = require("../../abi/pair.json");
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const account = walletOrigin.connect(provider);
//--------------------------------------ADJUST-----------------------------------||

const chalk = require("chalk");
console.log(
  chalk.blue(
    "The purpose of this script is to , create amm pools, add, and remove liquidity"
  )
);


const routerAddress = config["aqua-dex"].router;
const factoryAddress = config["aqua-dex"].factory;

// SET THE ASSETS FOR THE AMM POOL CREATION
// ENTER THE DESIRED INPUT AMOUNTS TO DETERMINE THE PRICING

// usdp/xyz = price is checked before the pool is created. See below
const tokenA = config.assets.europa.BRAWL;
const amountUSDP = "152"; //$1
//--
const tokenB = config.assets.europa.AQUA;
const amountXYZ = "100000"; //

const aToken = new ethers.Contract(tokenA, erc20ABI, account);
const bToken = new ethers.Contract(tokenB, erc20ABI, account);

const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

let aDecimal;
let bDecimal;

async function getCodeHash() {
  const hash = await factoryContract.pairCodeHash();

  const pools = await factoryContract.allPairsLength();

  console.log("Uniswap Factory CodeHash: ", hash);

  console.log("Uniswap Factory Contains AMM Pools: ", pools.toString());
}

async function createPair() {
  const key = account.address;

  const blockNumber = await provider.getBlockNumber();
  const blockData = await provider.getBlock(blockNumber);
  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 899600);

  aDecimal = await aToken.decimals();
  bDecimal = await bToken.decimals();

  // CHECK THE PRICE FIRST. If CORRECT, createPair()
  await createAnyPriceForPool(aDecimal, bDecimal);

  const aSym = await aToken.symbol();
  const bSym = await bToken.symbol();

  console.log("DECIMALS " + aDecimal + "  " + bDecimal, " | ", aSym, bSym);

  const weiAmountA = ethers.utils.parseUnits(amountUSDP, aDecimal); // USDP
  const weiAmountB = ethers.utils.parseUnits(amountXYZ, bDecimal); // OTHER

  let amountAdesired = weiAmountA;
  let amountBdesired = weiAmountB;

  //approve the assets
  await doApproval(aToken, amountAdesired);
  await doApproval(bToken, amountBdesired);

  const routerContract = new ethers.Contract(routerAddress, routerABI, account);
  let ok = await routerContract
    .addLiquidity(
      tokenA,
      tokenB,
      amountAdesired,
      amountBdesired,
      ethers.constants.Zero,
      ethers.constants.Zero,
      key,
      expiryDate,

      { gasLimit: "50000000" }
    )
    .then((result) => {
      // result is another promise =. deal with it
      let out = result
        .wait()
        .then((ok) => {
          console.log("Result: ", ok);
        })
        .catch((err) => {
          console.log("Result Error: ", err);
        });
    })
    .catch((err) => {
      console.log("Processing Error: ", err);
    });
}

// Any input of tokenA and TokenB are allowed, uniswap will figure out the amounts automatically
// Allow any amount: ethers.constants.Zero
async function addLPtoPair() {
  const blockNumber = await provider.getBlockNumber();
  const blockData = await provider.getBlock(blockNumber);
  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

  aDecimal = await aToken.decimals();
  bDecimal = await bToken.decimals();

  console.log("DECIMALS " + aDecimal + "  " + bDecimal);

  const weiAmountA = ethers.utils.parseUnits(amountUSDP, aDecimal); // USDP
  const weiAmountB = ethers.utils.parseUnits(amountXYZ, bDecimal); // OTHER

  let amountAdesired = weiAmountA;
  let amountBdesired = weiAmountB;

  //approve the assets
  await doApproval(aToken, amountAdesired);
  await doApproval(bToken, amountBdesired);

  const routerContract = new ethers.Contract(routerAddress, routerABI, account);
  let ok = await routerContract
    .addLiquidity(tokenA, tokenB, amountAdesired, amountBdesired, ethers.constants.Zero, ethers.constants.Zero, account.address, expiryDate)
    .then((result) => {
      // result is another promise =. deal with it
      let out = result
        .wait()
        .then((ok) => {
          console.log("Result: ", ok);
        })
        .catch((err) => {
          console.log("Result Error: ", err);
        });
    })
    .catch((err) => {
      console.log("Processing Error: ", err);
    });
}

async function doApproval(tokenContract, amount) {
  const token = tokenContract;
  const weiAmount = amount;

  let allowanceAmount = await token.allowance(account.address, routerAddress);

  console.log("Router Contract Allowance: " + allowanceAmount.toString());

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
    console.log("Router Contract Needs Increased Allowance: ");
    const parse = await token.approve(routerAddress, weiAmount);
    const receipt = await parse.wait();
    console.log("Router Contract Result: ", receipt);
    return 'ok';
  }
  console.log("Router Contract Allowance Complete");
  return 'ok';
}

// This only works for 18 decimal assets
async function createAnyPriceForPool(a_decimal, b_decimal) {
  const a = ethers.utils.parseUnits(amountUSDP, a_decimal); // USDP
  const b = ethers.utils.parseUnits(amountXYZ, b_decimal); // XYZ
  // 100 usdp and / 100 ruby = 1 ruby = usdp
  let price = a / b;

  // let price = b.div(a).div(100);// for ETH - AQUA

  console.log("PRICE FOR POOL WILL BE ", price.toString());
  return price;
}
async function removeAMMLPToken(tokenA, tokenB, routerAddress, accountSigner, provider) {
  console.log("remove ALL AMMLPToken started ");
  const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);
  //get the pair address 
  const factoryAddress = await routerContract.factory().then(result => {
      return result;
  }).catch(err => {
      console.log("removeAMMLPToken Error: ", err)
  })

  if (typeof factoryAddress === "undefined") {
      return;
  }

  const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountSigner);

  const pairAddress = await factoryContract.getPair(tokenA, tokenB).then(result => {
      return result;
  }).catch(err => {
      console.log("removeAMMLPToken Error: ", err)
  })

  if (typeof pairAddress === "undefined") {
      return;
  }

  // CREATE PAIR CONTACT
  const pairContract = new ethers.Contract(pairAddress, pairABI, accountSigner);

  const pairBalance = await pairContract.balanceOf(accountSigner.address).then(result => {
      return result;
  }).catch(err => {
      console.log("removeAMMLPToken Error: ", err)
  })

  if (typeof pairBalance === "undefined") {
      return;
  }

  console.log("Pair Address: ", pairAddress);
  console.log("Pair Balance: ", pairBalance.toString());

  // check the balance 
  const balance = parseFloat(pairBalance.toString());

  let checkApproval;
  if (typeof balance === 'number' && balance > 0) {
      checkApproval = await doApproval( pairContract,pairBalance);
  }

  if (typeof checkApproval === "undefined") {
      console.log("Error : removeAMMLPToken : Balance zero: ");
      return;
  }

  const blockNumber = await provider.getBlockNumber().then(result => {
      return result;
  }).catch(err => {
      console.log("removeAMMLPToken Error: ", err)
  })

  if (typeof blockNumber === "undefined") {
      return;
  }

  const blockData = await provider.getBlock(blockNumber).then(result => {
      return result;
  }).catch(err => {
      console.log("removeAMMLPToken Error: ", err)
  })

  if (typeof blockData === "undefined") {
      return;
  }

  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);


  //wtf aqua
  let value = ethers.BigNumber.from(1);
  let amountAmin = value;
  let amountBmin = value;

  console.log("Remove LP Expires: " + expiryDate + " | TimeStamp: " + blockData.timestamp + " | Amount Out min: " + value.toString() + " | Amount In: " + pairBalance.toString());

  let ok = await routerContract.removeLiquidity(
      tokenA,
      tokenB,
      pairBalance,
      amountAmin,
      amountBmin,
      accountSigner.address,
      expiryDate
  ).then(result => {
      console.log("Processing Result: ", result);
      // result is another promise =. deal with it 
      let out = result.wait(1).then(ok => {
          console.log("Result 1: ", ok?.transactionHash);
      }).catch(err => {
          console.log("Result 1 Error: ", err);
          // transaction wait is another promise =. deal with it 
          err.transaction.wait(1).then(more_erro => {
              console.log("Result 2: ", more_erro);
          }).catch(more_err => {
              console.log("Result 2 Error: ", more_err)
          })
      });
      
  }).catch(err => {
      console.log("Processing Error: ", err);
  });
}

async function testThis() {


 // await getCodeHash();

 // await createPair();

  // await addLPtoPair()


 await removeAMMLPToken(config.assets.europa.AQUA, config.assets.europa.BRAWL, routerAddress, account,provider );
}

testThis();

//tod: migrate here:: if needed for btcusd , createPoolRuby.js in /scripts/ for binance pricing to setup the pool pricing correctly


