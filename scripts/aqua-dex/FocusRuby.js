const ethers = require("ethers");
const chalk = require("chalk");
const axios = require("axios");
const erc20ABI = require("../../abi/erc20.json");
const pairABI = require("../../abi/pair.json");
const factoryABI = require("../../abi/factory.json");
const routerABI = require("../../abi/router.json");
const nftABI = require("../../abi/nftAdmin.json");
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");
const BigNumber = require("bignumber.js");

console.log(
  chalk.blue(
    "The purpose of this script is to check the current pool prices on a dex\nCompare the price with a cex price\nSwap to normalize the prices on the dex"
  )
);

//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const account = wallet.connect(provider);

const factoryAddress = config.amm.factory;
const routerAddress = config.amm.router;
const AQUA_PRICE = 0.01; // todo : remove this functionality because it would be best to use the actual amm pools to get the AQUA USD price , another script can be used to monitor the AQUA stable pairs
const DEBUG = false;

// change this later
const FEE = 997;
const APE_AMOUNT = "0.0001"; // 1 usd

async function getPriceWith18(tokenA, tokenB) {
  const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

  const pairAddress = await factoryContract.getPair(tokenA, tokenB);
  const pairContract = new ethers.Contract(pairAddress, pairABI, account);
  const pairReserves = await pairContract.getReserves();

  const fromContract = new ethers.Contract(tokenA, erc20ABI, account);
  const toContract = new ethers.Contract(tokenB, erc20ABI, account);

  const decimalDigitTokenA = 18;
  const decimalDigitTokenB = 18;

  const symTokenA = await fromContract.symbol();
  const symTokenB = await toContract.symbol();

  console.log(chalk.green("STATUS  ", symTokenA, symTokenB));

  if (symTokenA && symTokenB) {
    const pairA = new BigNumber(pairReserves[0].toString());
    const pairB = new BigNumber(pairReserves[1].toString());
    const priceBetter = pairA.div(pairB);

    let stringThing =
      "-----------------------------------------------\n" +
      "Pair Address: " +
      pairAddress +
      "\n" +
      "symbol " +
      symTokenA +
      "-" +
      symTokenB +
      " Reserves[1]: " +
      pairA +
      " d: " +
      decimalDigitTokenA +
      " Reserves[0]: " +
      pairB +
      " d:" +
      decimalDigitTokenB +
      "\n" +
      "Price: " +
      priceBetter.toString();

    if (DEBUG) {
      console.log(stringThing);
    }

    return priceBetter.toString();
  }
  return "0.0";
}

async function getPriceBinance(symbolPair) {
  // make sure the symbol is in all capps
  symbolPair = symbolPair.toUpperCase();
  let data;
  let ok = await axios
    .get("https://api.binance.com/api/v3/ticker/price", {
      params: {
        symbol: symbolPair,
      },
    })
    .then((res) => {
      data = res.data["price"];
    })
    .catch((err) => {
      console.log(err);
    });
  console.log("Binance: ", data);

  const priceNumber = Number(data);
  return priceNumber;
}

// returns : buy, sell, flat (operates for DEX trading )
async function comparePrices(_exchange, _dex) {
  if (Number(_exchange) > Number(_dex)) {
    return "buy";
  }
  if (Number(_exchange) < Number(_dex)) {
    return "sell";
  }
  return "flat";
}

async function makeSwap(_aquaUsdValue, _signal, _quote, _base, _swapAmount, _cexPrice) {
  const weiAmount = ethers.utils.parseEther(_swapAmount);

  if (_signal === "flat") {
    return { signal: "wait" };
  }
  const routerContract = new ethers.Contract(routerAddress, routerABI, account);

  // multi hop
  /*
  const tokenInOutValues = await routerContract
    .getAmountsOut(weiAmount, [fromToken, baseToken, toToken], swapFee)
    .then((ok) => {
      return ok;
    })
    .catch((err) => {});

  if (typeof tokenInOutValues === "undefined") {
    console.log("Error: getAmountsOut ");
    return;
  }
  */

  // 1 hop
  let trade = 'flat';
  let fromToken = _base;
  let toToken = _quote;
  if (_signal === "buy") {
    // convert base into quote

    const tokenInOutValues = await routerContract
      .getAmountsOut(weiAmount, [fromToken, toToken], FEE)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log("Error: getAmountsOut ", err);
      });

    if (typeof tokenInOutValues === "undefined") {
      console.log("Error: getAmountsOut ");
      return;
    }

    // console.log(chalk.red(" amount out is ", tokenInOutValues.toString()));

    // conversions
    const price = ethers.utils.parseEther(_cexPrice);
    const p = ethers.utils.formatUnits(tokenInOutValues[0], 18); // Amount In
    const p0 = ethers.utils.formatUnits(tokenInOutValues[1], 18); // Amount Ount
    const p1 = ethers.utils.formatUnits(price, 18); // Price of QUOTE asset

    // math: calculate the USD value of the Output
    const pairA = new BigNumber(p0);
    const pairB = new BigNumber(p1);
    const usdAA = pairA.times(pairB);

    const pair = new BigNumber(p);
    const inputUSD = pair.times(_aquaUsdValue);
    if (DEBUG) {
      console.log(chalk.red("Quote: You should get a USD value of  ", usdAA.toString()));
      console.log(chalk.red(" A ", pairA.toString()));

      console.log(chalk.red(" B ", _aquaUsdValue.toString()));

      console.log(chalk.red(" C ", inputUSD.toString()));
    }

    //logic to trade
    if (inputUSD < usdAA) {
      trade = 'buy';
    }

  } else {
    fromToken = _quote;
    toToken = _base;

    // convert base into quote

    const tokenInOutValues = await routerContract
      .getAmountsOut(weiAmount, [fromToken, toToken], FEE)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log("Error: getAmountsOut ", err);
      });

    if (typeof tokenInOutValues === "undefined") {
      console.log("Error: getAmountsOut ");
      return;
    }

    // console.log(chalk.red(" amount out is ", tokenInOutValues.toString()));

    // conversions
    const price = ethers.utils.parseEther(_cexPrice);
    const p = ethers.utils.formatUnits(tokenInOutValues[0], 18); // Amount In
    const p0 = ethers.utils.formatUnits(tokenInOutValues[1], 18); // Amount Ount
    const p1 = ethers.utils.formatUnits(price, 18); // Price of QUOTE asset

    // math: calculate the USD value of the Output
    const pairA = new BigNumber(p0);
   // const pairB = new BigNumber(p1);
    const usdAA = pairA.times(p0);// USD value already exists. 

    const pair = new BigNumber(p);
    const inputUSD = pair.times(_aquaUsdValue);
   
      console.log(chalk.red("Quote: You should get a USD value of  ", usdAA.toString()));
      
      console.log(chalk.red(" Quote Asset Amount In  ", pairA.toString()));

      console.log(chalk.red(" B ", _aquaUsdValue.toString()));

      console.log(chalk.red(" C ", inputUSD.toString()));
    

    //logic to trade
    if (inputUSD < usdAA) {
      trade = 'sell';
    }
  }

  if (trade==='buy') {
    await doApproval(weiAmount, fromToken, routerAddress);
    await doStuff(weiAmount, fromToken, toToken);
    return "swapped";
  } else if(trade==='sell'){
    await doApproval(weiAmount, fromToken, routerAddress);
    await doStuff(weiAmount, fromToken, toToken);
    return "swapped";
  }
  return 'failed';
}

async function doApproval(swapAmount, fromToken, routerAddress) {
  // wei amount already adjusted for the token decimals?
  const weiAmount = swapAmount;
  if (typeof fromToken === "string") {
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

    const bal = await fromContract
      .balanceOf(account.address)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    const dec = await fromContract
      .decimals()
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    if (typeof dec == "undefined" || typeof bal === "undefined") {
      //failed
      return;
    } else {
      const returnBalance = ethers.utils.formatUnits(bal, dec);
      console.log(" Token Balance: ", returnBalance);
    }

    const allowanceAmount = await fromContract
      .allowance(account.address, routerAddress)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    if (DEBUG) {
      console.log(" Amount: ", weiAmount.toString());
      console.log(" Balance: ", bal.toString());
      console.log(" Router Contract Allowance: ", allowanceAmount.toString());
    }

    // make sure wallet has enough
    if (bal.gte(weiAmount)) {
      if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Router Contract Needs Increased Allowance: ");
        const increase = weiAmount.mul(10); // approve for 10 swaps
        const parse = await fromContract.approve(routerAddress, increase);
        const receipt = await parse.wait(1);
        console.log("Transfer to Router Contract Approval Receipt: ", receipt?.transactionHash);
        return "Approved";
      } else {
        return "Already approved";
      }
    } else {
      console.log("Swap Amount is more than userBalance: ");
      return "Not Enough Balance to Make Swap";
    }
  }
  return; // failed
}

let PREVENT_LOOP = false;
async function doStuff(_weiAmount, _fromToken, _toToken) {
  console.log("...");

  if (!PREVENT_LOOP) {
    PREVENT_LOOP = true; //
    console.log("Make swap: ", PREVENT_LOOP);
    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    const nftAdminAddress = await routerContract.nftAdmin();

    const nftContract = new ethers.Contract(nftAdminAddress, nftABI, account);

    const swapFee = await nftContract.calculateAmmSwapFeeDeduction(account.address);

    if (DEBUG) {
      console.log(" SwapFee ", swapFee.toString()); // 997
    }

    //Provider
    const blockNumber = await provider.getBlockNumber();
    const gas_try = await provider.getGasPrice();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);
    console.log(
      " BlockNumber: " + blockNumber + " GasPrice: " + gas_try.toString() + "\n Expires: " + expiryDate + " | Time: " + blockData.timestamp
    );

    //Signer
    const nonce = await account
      .getTransactionCount("latest")
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log("Error: getAmountsOut ", err);
      });

    console.log(" TransactionCount: " + nonce);

    let swap_tx = await routerContract
      .swapExactTokensForTokens(
        _weiAmount, // amountIn
        1, // amountOuMin
        // [fromToken, baseToken, toToken], // multi hop amm
        [_fromToken, _toToken],
        account.address,
        expiryDate,

        {
          //  gasPrice: try_string,
          gasLimit: "280000",
          nonce: nonce,
        }
      )
      .then((result) => {
        // result is another promise =. deal with it
        let out = result
          .wait(1)
          .then((ok) => {
            console.log("Result: ", ok.transactionHash);
            return ok.transactionHash;
          })
          .catch((err) => {
            console.log("Result Error: ", err);
          });

        return out;
      })
      .catch((err) => {
        console.error("Processing Error: ", err.error);
        /*
            experienced these errors 
            - transaction nounce incorrect (code: -32004)
    
    
            */
      });

    // reset
    if (typeof swap_tx === "string") {
      PREVENT_LOOP = false;
    }
  }
}

async function focus() {
  const poolETH = await getPriceWith18(config.assets.europa.ETH, config.assets.europa.USDP);
  console.log(chalk.green("ETH ", poolETH));

  const cexETH = await getPriceBinance("ETHUSDT");
  const signalOnDex = await comparePrices(cexETH, poolETH);
  console.log(chalk.green("ETH SIGNAL ON DEX ", signalOnDex));

  const usdValue = ethers.utils.parseEther(APE_AMOUNT);

  const finalOut = await makeSwap(
    usdValue,
    signalOnDex,
    config.assets.europa.ETH,
    config.assets.europa.USDP,
    APE_AMOUNT,
    cexETH.toString()
  );

  console.log(chalk.green("STATUS  ", finalOut));
}

async function run() {
  setInterval(focus, 20000);
}

run();

/* Uniswap v2 getAmountsOut explained 


lets say the pool price is 1000 on the dex and the price should be 2000 = cex price, 

and lets say 


AquaAmount + B = EthAmount 
a + b = c 
1650 / 1000 = 16



amount out * price of the cex = USD value  and this value > my InputAmount ( in usd value )





*/
