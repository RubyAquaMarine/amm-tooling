const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const USDP = config.assets.europa.USDP;
const USDC = config.assets.europa.USDC;
const DAI = config.assets.europa.DAI;
const USDT = config.assets.europa.USDT;
const SSwap = config.amm.fourPool;

const MINIMUM_ADD = 1;
const MAXIMUM_ADD = 10;
//--------------------------------------ADJUST-----------------------------------||


async function findBestEntry() {

  let reserves = await amm.stableSwapTokenBalance(SSwap, accountOrigin)
  let usdp = parseFloat(reserves[0]).toFixed(6)
  let dai = parseFloat(reserves[1]).toFixed(6)
  let usdc = reserves[2]
  let usdt = reserves[3]

  let values = usdp + " | " + dai + " | " + usdc + " | " + usdt;
  console.log(values)

  //convert string to numbers
  usdp = parseFloat(usdp)
  dai = parseFloat(dai)
  usdc = parseFloat(usdc)
  usdt = parseFloat(usdt)

  const newReserves = [usdp, dai, usdc, usdt]

  // let res = getLow(Math.min(...reserves), reserves)
  // console.log(res)

  let res1 = getHigh(Math.max(...reserves), reserves)
  // console.log(res1)


  // returns Zeros if the MIN or MAX are reached
  const inUSD = getPositionSize(res1, newReserves)
  console.log(inUSD)

  //abort
  if (inUSD[0] == 0 && inUSD[1] == 0) {
    console.log("ABORT LIQUIDITY ADD")
    return 'ABORT'
  }


  // check wallet balances before proceeding: returns string
  console.log("CHECKING WALLET BALANCES . . . .");

  const usdp_balance = await amm.checkTokenBalance(USDP, accountOrigin.address, accountOrigin)
  console.log("USDP BALANCE", usdp_balance)
  const dai_balance = await amm.checkTokenBalance(DAI, accountOrigin.address, accountOrigin)
  console.log("DAI BALANCE", dai_balance)
  const usdc_balance = await amm.checkTokenBalance(USDC, accountOrigin.address, accountOrigin)
  console.log("USDC BALANCE", usdc_balance)
  const usdt_balance = await amm.checkTokenBalance(USDT, accountOrigin.address, accountOrigin)
  console.log("USDT BALANCE", usdt_balance)


  if (parseFloat(usdp_balance) > inUSD[0] && parseFloat(dai_balance) > inUSD[1] && parseFloat(usdc_balance) > inUSD[2] && parseFloat(usdt_balance) > inUSD[3]) {
    // add Liquidity to stableswap
    console.log("STABLE SWAP LIQUIDITY ADD .. . . . ")
    let tryThis = await amm.stableSwapAddUSD(
      inUSD,
      0,// min LP tokens .... use this for slippage calculations
      SSwap,
      USDP,
      DAI,
      USDC,
      USDT,
      accountOrigin,
      providerOrigin
    );

  } else {
    console.log("USD BALANCES ARE TOO LOW TO ADD LIQUIDITY")
    // remove liquidity in equal shares
  }
}

function getLow(lowest, values) {
  for (let i = 0; i < 4; i++) {
    if (values[i] == lowest) {
      if (i == 0) {
        return 'USDP'
      }
      if (i == 1) {
        return 'DAI'
      }
      if (i == 2) {
        return 'USDC'
      }
      if (i == 3) {
        return 'USDT'
      }
    }
  }
}

function getHigh(lowest, values) {
  for (let i = 0; i < 4; i++) {
    if (values[i] == lowest) {
      if (i == 0) {
        return 'USDP'
      }
      if (i == 1) {
        return 'DAI'
      }
      if (i == 2) {
        return 'USDC'
      }
      if (i == 3) {
        return 'USDT'
      }
    }
  }
}

function getPositionSize(HighestReservesTokenSymbol, reserves) {
  let usdp
  let dai
  let usdc
  let usdt

  if (HighestReservesTokenSymbol == "USDP") {
    usdp = 0;
    dai = reserves[0] - reserves[1]
    usdc = reserves[0] - reserves[2]
    usdt = reserves[0] - reserves[3]
  }
  if (HighestReservesTokenSymbol == "DAI") {
    usdp = reserves[1] - reserves[0]
    dai = 0;
    usdc = reserves[1] - reserves[2]
    usdt = reserves[1] - reserves[3]
  }
  if (HighestReservesTokenSymbol == "USDC") {
    usdp = reserves[2] - reserves[0]
    dai = reserves[2] - reserves[1]
    usdc = 0
    usdt = reserves[2] - reserves[3]
  }
  if (HighestReservesTokenSymbol == "USDT") {
    usdp = reserves[3] - reserves[0]
    dai = reserves[3] - reserves[1]
    usdc = reserves[3] - reserves[2]
    usdt = 0;
  }


  // let values = "POSITIONS SIZES: " + usdp + " | " + dai + " | " + usdc + " | " + usdt;
  // console.log(values)
  let positionSize = [usdp, dai, usdc, usdt]

  // safety checks
  //find min 
  let check = false;
  let totalAdd = 0;
  for (let i = 0; i < 4; i++) {
    totalAdd = positionSize[i] + totalAdd;
    if (positionSize[i] == 0 || positionSize[i] >= MINIMUM_ADD && positionSize[i] <= MAXIMUM_ADD) {
      console.log("OK", positionSize[i])
    } else {
      console.log("Difference < MINIMUM_ADD or > MAXIMUM_ADD", positionSize[i])
      check = true;
    }

    console.log("LIQUIDITY ADDING: ", totalAdd)

  }

  console.log("TOTAL LIQUIDITY ADD: ", totalAdd)

  // if sum is more than the Min, lets add the small amounts anyways
  // ensure totalAdd is less than the MAX
  if (totalAdd > MINIMUM_ADD && totalAdd <= MAXIMUM_ADD) {
    check = false;
    console.log("ADD LIQUIDITY: ")
  } else {
    if (totalAdd > MAXIMUM_ADD) {
      console.log("TOTAL ADD IS MORE THAN MAX ADD")
      check = true;
    }
    if (totalAdd < MINIMUM_ADD) {
      console.log("TOTAL ADD IS LESS THAN MIN ADD")
      check = true;
    }
  }

  if (check) {
    console.log("MIN MAX VALUES REACHED: Waiting . . . . .")
    positionSize = [0, 0, 0, 0];
  }

  return positionSize

}



async function run() {
  setInterval(findBestEntry, 60000)// 10 sec
  // setInterval(checkPrices,10000)// 10 sec
  // setInterval(checkPrices,60000*10)// 10 mimute
}

run();

/*
 script is working as is.
 needs improvements ...
 - only add USD if the Min difference is X amount
 - measure the Ratio differences in percentage terms
 - calculate positive slippage (profits)
*/
