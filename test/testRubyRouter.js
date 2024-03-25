
const ethers = require('ethers');
const client = require('graphql-request');

const {writeHistoricalTrades} = require('../ruby_modules/users')

const { getTokenPriceFromSymbol } = require('../ruby_modules/amm');
const { writeJsonFile, usersHoldingRuby } = require('../ruby_modules/users')
const { getSwapPrice } = require('../ruby_modules/utils')

const CONSTANTS = require('../Constants.json')
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const URL = 'https://ruby-prod-thegraph.ruby.exchange/subgraphs/name/ruby/rubyrouter';

const rubyAddress = CONSTANTS.data[0].token0address;
const ethAddress = CONSTANTS.data[1].token1address;
const btcAddress = CONSTANTS.data[2].token1address;
const sklAddress = CONSTANTS.data[3].token1address;

let ruby, btc, eth, skl;
async function init() {
  ruby = await getTokenPriceFromSymbol(rubyAddress, accountOrigin);
  eth = await getTokenPriceFromSymbol(ethAddress, accountOrigin);
  btc = await getTokenPriceFromSymbol(btcAddress, accountOrigin);
  skl = await getTokenPriceFromSymbol(sklAddress, accountOrigin);
  console.log("RUBY " + ruby)
  console.log("ETH " + eth)
  console.log("SKL " + skl)
  console.log("BTC " + btc)
}

// master obj
let WRITE_TO_FILE ={
  index : 0,
  swaps: []
}

async function collectDataFromRouter(lastID) {

  let variables = {
    id: lastID
  }

  console.log("INPUT:", variables.id)

  // sorting (orderBy: timestamp, block: { number: 688945 }) 

  const swapQuery = client.gql`
      query swapQuery($id: String!) {
        swaps ( where: { id_gt: $id }){
          id
          sender
          amount0In
          amount1Out
          timestamp
          token0 {
            id
            symbol
          }
          token1 {
              id
              symbol
          }
        }
      }
    `

  const app = new client.GraphQLClient(URL);

  const data = await app.request(swapQuery, variables).then(result => {
    return result;
  }).catch(err => {
    console.log(err)
  })

  // This data should be written to a file 
  // filename ? snapshot index
  // console.log(data.toString())


  const length = data.swaps.length;

  if (length == 0) {
    console.error("END OF DATA")
    return length;
  }

  
  const lastSwapID = data.swaps[length-1].id;


  //loop bitch
  let tvl_snapshot = 0;

  let tvl_snapshot_amm = 0;
  let tvl_snapshot_ss = 0;

  // make a new obj for coingecko historical trades

  let hist_trades_obj = {
    swaps: []
  }


  for (let i = 0; i < length; i++) {
    let tokenA = data.swaps[i].token0.symbol;
    let tokenB = data.swaps[i].token1.symbol;
    let amount1 = data.swaps[i].amount0In;
    let amount2 = data.swaps[i].amount1Out;

    if(!data.swaps[i].id){
      break;
    }

    let usd=0;
    // this getSwapPrice doesn't work for ETH/RUBY pairs 
    // only USD base pairs 
    let exchange_rate = await getSwapPrice( amount1, amount2, tokenA, tokenB);

    //SS swap
    if(exchange_rate == 1 ){
      usd = amount2;// technically all the stableswap trades
      tvl_snapshot_ss += Number(usd);
    }else{

      let isStable = isStableBase(tokenA, tokenB);
      let isTokenA = isStable[0];
      let isTokenB = isStable[1];

      if(isTokenA ){
        usd =  exchange_rate * parseFloat(amount2);
      }
      
      if(isTokenB){
        usd =  exchange_rate * parseFloat(amount1);
      }
      
      // ETH to RUBY 
      if(!isTokenA && !isTokenB){
        // only use this logic if neither token is a stable coin
        // uses the current pool price
        // this is the last hacky thing that should be resolved

        //these swaps are also 2 trades 
        // XYZ to USDP then 
        // USDP to XYZ 
        // double the value

      usd = isSymbol(tokenA, tokenB, amount1, amount2) * 2;
      }

      tvl_snapshot_amm += Number(usd);
    }



    
    
    tvl_snapshot += Number(usd);

    let trade_type = isStable(tokenA);

    let create_pair = tokenA + "_" + tokenB;

    if (tokenA == "DAI" ||  tokenA == "USDT"  || tokenA == "USDC" || tokenA == "USDP"){
      create_pair = tokenB + "_" + tokenA;
    }


    WRITE_TO_FILE.index++;

    WRITE_TO_FILE.swaps[WRITE_TO_FILE.index] = {
      id: data.swaps[i].id,
      trade_id : WRITE_TO_FILE.index,
      ticker_id: create_pair,
      swap: tokenA + "_" + tokenB,
      price:  exchange_rate.toString(),
      timestamp: data.swaps[i].timestamp,
      trade_timestamp: data.swaps[i].timestamp,
      target_volume:amount1,
      base_volume: amount2,
      usd_volume: usd.toString(),
      type: trade_type
    };


    hist_trades_obj.swaps[i] = {
      id: data.swaps[i].id,
      trade_id : WRITE_TO_FILE.index,
      ticker_id: create_pair,
      swap: tokenA + "_" + tokenB,
      price:  exchange_rate.toString(),
      timestamp: data.swaps[i].timestamp,
      trade_timestamp: data.swaps[i].timestamp,
      target_volume:amount1,
      base_volume: amount2,
      usd_volume: usd.toString(),
      type: trade_type
    };


    //  console.log(tokenA + " " + tokenB + " usd value: " + usd)
    //  console.error(tvl_snapshot)
  }

  console.error("Add to total tvl:", tvl_snapshot)

  addTVL_AMM(tvl_snapshot_amm);
  addTVL_SS(tvl_snapshot_ss);
  addTrade(length)
  
  // make a new object here 
  let obj = {
    last_swap_id: lastSwapID,
    total_trades: length
  }

  return lastSwapID;

}

function isStable(symbolIn){
  if (symbolIn == 'DAI' || symbolIn == 'USDP' || symbolIn == 'USDT' || symbolIn == 'USDP') {
    return 'buy';
  }else{
    return 'sell'
  }
}

function isStableBase(symbol1, symbol2){
  let ok = []
  if (symbol1 == 'DAI' || symbol1 == 'USDP' || symbol1 == 'USDT' || symbol1 == 'USDP') {
    ok[0] = true;
  }else{
    ok[0] = false;
  }
  if (symbol2 == 'DAI' || symbol2 == 'USDP' || symbol2 == 'USDT' || symbol2 == 'USDP') {
    ok[1] = true;
  }else{
    ok[1] = false;
  }

  return ok;
}

function isSymbol(tokenA, tokenB, amount1, amount2) {

  let usdvalue = 0;

  if (tokenA == 'RUBY') {
    usdvalue = ruby * parseFloat(amount1);
  }
  if (tokenA == 'ETHC') {
    usdvalue = eth * parseFloat(amount1);
  }
  if (tokenA == 'WBTC') {
    usdvalue = btc * parseFloat(amount1);
  }
  if (tokenA == 'SKL') {
    usdvalue = skl * parseFloat(amount1);
  }

  if (tokenA == 'DAI') {
    usdvalue = parseFloat(amount1);
  }
  if (tokenA == 'USDT') {
    usdvalue = parseFloat(amount1);
  }
  if (tokenA == 'USDC') {
    usdvalue = parseFloat(amount1);
  }
  if (tokenA == 'USDP') {
    usdvalue = parseFloat(amount1);
  }

  /*
  if (tokenB == 'RUBY') {

  }
  if (tokenB == 'ETHC') {

  }
  if (tokenB == 'WBTC') {

  }
  if (tokenB == 'SKL') {

  }
  */

  if (tokenB == 'DAI') {
    usdvalue = parseFloat(amount2);
  }
  if (tokenB == 'USDT') {
    usdvalue = parseFloat(amount2);
  }
  if (tokenB == 'USDC') {
    usdvalue = parseFloat(amount2);
  }
  if (tokenB == 'USDP') {

    usdvalue = parseFloat(amount2);

  }

  return usdvalue;
}

let TOTAL_TVL_AMM = 0;
function addTVL_AMM(addtvl) {
  if (addtvl > 0) {
    TOTAL_TVL_AMM += addtvl;
  }
  console.log("TRADE VOLUME AMM: ", TOTAL_TVL_AMM);
  return TOTAL_TVL_AMM;
}

let TOTAL_TVL_SS = 0;
function addTVL_SS(addtvl) {
  if (addtvl > 0) {
    TOTAL_TVL_SS += addtvl;
  }
  console.log("TRADE VOLUME SS: ", TOTAL_TVL_SS);
  return TOTAL_TVL_SS;
}

let TOTAL_TRADES = 0;
function addTrade(add) {
  console.log("ADD TRADES: ", add);
  if (add > 0) {
    TOTAL_TRADES += add;
  }
  console.log("TOTAL TRADES: ", TOTAL_TRADES);
  return TOTAL_TRADES;
}


async function run() {

  await init();

  // get the first swap id 
  let saveFirstSwap = '0x001c0df9a703058564255617dc071e4f01c46f3f2278468e56d21379a83f902c-0';
  let saveLastSwap = '';
  let lastID = 0;
  let output = ''

  while (lastID <= 9999999) {
    lastID++;
    console.log("INDEX: ", lastID)
    if (saveLastSwap == '') {
      
      saveLastSwap = await collectDataFromRouter(saveFirstSwap)
    } else {

      output = await collectDataFromRouter(saveLastSwap)

      if (saveLastSwap != output && output != 0) {//&& output != stop
        saveLastSwap = output;
      } else {
        console.log("output end:", output)
        // end the loop
        break;
      }
    }

  }

  const tvl_amm = addTVL_AMM(0);// get the final value
  const fees_amm = tvl_amm * 0.003;// amm feees

  const tvl_ss = addTVL_SS(0);// get the final value
  const fees_ss = tvl_ss * 0.0004;// amm feees

  const total_v = tvl_amm + tvl_ss;
  const total_f = fees_ss + fees_amm;

  console.log("TOTAL VOLUME", total_v)
  console.log("TOTAL FEES", total_f)
  

  const out = {
    total_trade_volume : total_v,
    amm_trade_volume: tvl_amm,
    ss_trade_volume: tvl_ss,
    amm_fees: fees_amm,
    ss_fees: fees_ss,
    total_fees: total_f,
    total_trades: TOTAL_TRADES
  }

  await writeJsonFile('../tests/snapshot/snapshot.json', out)

  await writeHistoricalTrades('./snapshot/historical_trades.json', WRITE_TO_FILE.swaps)

}

run();
