/*

- Filter out RavenDao activity from trading fees
- WRITE_TO_FILE variable contains all the data from the subgraph database (Version 1.0)
    Version 1.0.1 - add a new function that writes the last swapID to a file. 


    Version 1.1.0 
        Run 'npm run collectTrades' 
        assumes the historical_trades.json exists. 
        
        Read last entry from json file = lastSwapID 




*/
const ethers = require('ethers');
const client = require('graphql-request');
const amm = require('../ruby_modules/amm.js');
const ammu = require('../ruby_modules/utils.js')
const utils = require('../ruby_modules/users.js');

const CONSTANTS = require('../Constants.json');
const URL = CONSTANTS.project.subgraph;
const SS_ADDRESS = CONSTANTS.project.fourPool;

const CRED = require('../keys.json');

const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const walletOrigin = new ethers.Wallet(CRED.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const FILE_DEST_HIST_TRADES = "server/data/historical_trades.json";
const FILE_DEST_24HR = "server/data/daily.json";
const FILE_DEST_STATS = "server/data/stats.json";

//filter addresses [,,,]
const FILTER_RAVENDAO = '0x1a061ee395df1005a82ee0fa23dbb0be0368aa0c';

// master obj
let WRITE_TO_FILE = {
    index: 0,
    swaps: []
}


function isStableInUSDP(symbolIn) {
    if (symbolIn === 'USDP') {
        return 'buy';
    } else {
        return 'sell'
    }
}

let TOTAL_FEE_AMM = 0;
function addFEE_AMM(add) {
    let returnThis = 0;
    if (add > 0) {
        TOTAL_FEE_AMM += add;
        returnThis = TOTAL_FEE_AMM;
    } else if (add === -1) {
        //reset
        returnThis = TOTAL_FEE_AMM;
        TOTAL_FEE_AMM = 0;
        console.log("TOTAL AMM FEES : ", returnThis);
        return returnThis;
    }
}

let TOTAL_TVL_AMM = 0;
function addTVL_AMM(add) {
    let returnThis = 0;
    if (add > 0) {
        TOTAL_TVL_AMM += add;
        returnThis = TOTAL_TVL_AMM;
    } else if (add === -1) {
        //reset
        returnThis = TOTAL_TVL_AMM;
        TOTAL_TVL_AMM = 0;
        console.log("TOTAL AMM VOLUME: ", returnThis);
        return returnThis;
    }
}

let TOTAL_TRADES = 0;
function addTrade(add) {
    let returnThis = 0;
    if (add > 0) {
        TOTAL_TRADES += add;
        returnThis = TOTAL_TRADES;

    } else if (add === -1) {
        //reset
        returnThis = TOTAL_TRADES;
        TOTAL_TRADES = 0;
        console.log("TOTAL TRADES: ", returnThis);
        return returnThis;
    }
}
//output number if error, else return string 
async function getFirstSwapID() {

    let variables = {
        id: 'lastID'
    }

    const swapQuery = client.gql`
            query swapQuery($id: String!) {
            swaps ( first: 1 )
                {
                    id
                }
            }
        `

    const app = new client.GraphQLClient(URL);

    const data = await app.request(swapQuery, variables).then(result => {
        return result;
    }).catch(err => {
        console.log("Subgraph Error: ", err.response)
    })

    if (typeof data?.swaps === 'undefined') {
        console.error("Subgraph Error")
        return 0;
    }

    const length = data?.swaps.length;

    if (typeof length === 'undefined') {
        console.error("Subgraph Error")
        return 0;
    } else if (length === 0) {
        console.error("END OF RUBY ROUTER DATA")
        return length;
    }

    const lastSwapID = data.swaps[length - 1].id;

    console.log("First Swap ID: ", lastSwapID);
    console.log(`Function 1 memory usage: ${JSON.stringify(process.memoryUsage())}`);

    return lastSwapID;
}
//output number if error, else return string 
async function collectDataFromRouter(lastID) {

    let variables = {
        id: lastID
    }

    const swapQuery = client.gql`
        query swapQuery($id: String!) {
          swaps ( where: { id_gt: $id }){
            id
            to
            amount0In
            amount1In
            amount0Out
            amount1Out
            timestamp
            pair {
                id
            }
          }
        }
      `

    const app = new client.GraphQLClient(URL);

    const data = await app.request(swapQuery, variables).then(result => {
        return result;
    }).catch(err => {
        console.log("Subgraph Error: ", err.response)
    })

    if (typeof data?.swaps === 'undefined') {
        console.error("Subgraph Error")
        return 0;
    }

    const length = data?.swaps.length;//check_aqua bug.md #28

    if (typeof length === 'undefined') {
        console.error("Subgraph Error")
        return 0;
    } else if (length === 0) {
        console.error("END OF RUBY ROUTER DATA")
        return length;
    }

    const lastSwapID = data.swaps[length - 1].id;


    let tvl_snapshot_amm = 0;
    let lp_id;
    let t_swap_fee = 0;

    for (let i = 0; i < length; i++) {

        lp_id = data.swaps[i].pair.id;

        if (typeof lp_id === 'undefined') {
            console.log("No LP address found within Subgraph:Swaps:Pair:ID ", lp_id)
            break;
        }

        const sender_id = data.swaps[i].to;

        if (typeof sender_id === 'undefined') {
            console.log("No to address found within Subgraph:Swaps:To ", lp_id)
            break;
        }

        let usd = 0;
        let exchange_rate = 0;

        let tokenData = await ammu.getTokenData(lp_id).then(result => {
            return result;
        }).catch(err => {
            console.log("Constants.json missing LP Data: ", lp_id)
        })

        if (typeof tokenData?.token0symbol === 'undefined') {
            console.log("Constants.json missing LP Data: ", lp_id)
            break;
        }

        const tokenA = tokenData.token0symbol;
        const tokenB = tokenData.token1symbol;

        let create_pair = tokenA + "_" + tokenB;// Create a custom pair XYZ USD (always)

        let volume_t = 0; let volume_b = 0;

        let amount_in = parseFloat(data.swaps[i].amount0In) + parseFloat(data.swaps[i].amount1In);
        let amount_out = parseFloat(data.swaps[i].amount0Out) + parseFloat(data.swaps[i].amount1Out);

        if (typeof amount_in === 'number' && typeof amount_out === 'number') {

            // token input is USDP
            if (tokenA == "USDP" && parseFloat(data.swaps[i].amount0In) > 0) {
                exchange_rate = parseFloat(amount_in) / parseFloat(amount_out);
                usd = parseFloat(amount_in);
                volume_b = amount_in;
                volume_t = amount_out;
                create_pair = tokenB + "_" + tokenA;
            }

            // token input is not USDP
            if (tokenA == "USDP" && parseFloat(data.swaps[i].amount0In) == 0) {
                exchange_rate = parseFloat(amount_out) / parseFloat(amount_in);
                usd = parseFloat(amount_out);
                volume_b = amount_out;
                volume_t = amount_in;
                create_pair = tokenB + "_" + tokenA;
            }

            // token input is USDP
            if (tokenB == "USDP" && parseFloat(data.swaps[i].amount1In) > 0) {
                exchange_rate = parseFloat(amount_out) / parseFloat(amount_in);
                usd = parseFloat(amount_out);
                volume_b = amount_out;
                volume_t = amount_in;
            }

            // token input is not USDP
            if (tokenB == "USDP" && parseFloat(data.swaps[i].amount1In) == 0) {
                exchange_rate = parseFloat(amount_in) / parseFloat(amount_out);
                usd = parseFloat(amount_in);
                volume_b = amount_in;
                volume_t = amount_out;
            }

            // RUBY PAIRS

            //testnet
            if (tokenB == "RUBY" && tokenA == "USDP" && parseFloat(data.swaps[i].amount0In) > 0) {
                // USDP / RUBY 
                exchange_rate = parseFloat(amount_out) / parseFloat(amount_in);
                usd = parseFloat(amount_out);
                volume_b = amount_out;// base is USDP and tokenA (input) is USDP therefore amount_in is USDP
                volume_t = amount_in;
                create_pair = tokenB + "_" + tokenA;
            }
            if (tokenB == "RUBY" && tokenA == "USDP" && parseFloat(data.swaps[i].amount1In) > 0) {
                // USDP / RUBY 
                exchange_rate = parseFloat(amount_in) / parseFloat(amount_out);
                usd = parseFloat(amount_in);
                volume_b = amount_in;// base is USDP and tokenA (input) is USDP therefore amount_in is USDP
                volume_t = amount_out;
                create_pair = tokenB + "_" + tokenA;
            }

            //europa
            //input selling ruby
            if (tokenA == "RUBY" && tokenB == "USDP" && parseFloat(data.swaps[i].amount0In) > 0) {
                // USDP / RUBY 
                exchange_rate = parseFloat(amount_out) / parseFloat(amount_in);
                usd = parseFloat(amount_out);
                volume_b = amount_out;// base is USDP and tokenA (input) is USDP therefore amount_in is USDP
                volume_t = amount_in;
            }
            // input selling usdp
            if (tokenA == "RUBY" && tokenB == "USDP" && parseFloat(data.swaps[i].amount1In) > 0) {
                // USDP / RUBY 
                exchange_rate = parseFloat(amount_in) / parseFloat(amount_out);
                usd = parseFloat(amount_in);
                volume_b = amount_in;// base is USDP and tokenA (input) is USDP therefore amount_in is USDP
                volume_t = amount_out;
            }
        } else {
            console.log("Missing Swap Data in/out amounts: ", lp_id)
            break;
        }

        //filter out specifc addresses
        let swap_fee = 0;
        if (sender_id != FILTER_RAVENDAO) {
            swap_fee = usd * 0.003;
        } else {
            swap_fee = 0;// resets to zero on RavenDao trading volume
        }


        t_swap_fee += swap_fee;
        tvl_snapshot_amm += usd;


        // if stable in, the user is buying, otherwise asset is being sold
        let trade_type = isStableInUSDP(tokenA);

        //allows multiple requests while maintaining one array
        WRITE_TO_FILE.index++;

        WRITE_TO_FILE.swaps[WRITE_TO_FILE.index] = {
            id: data.swaps[i].id,
            trade_id: WRITE_TO_FILE.index,
            ticker_id: create_pair,
            swap: tokenA + "_" + tokenB,
            price: exchange_rate.toString(),
            timestamp: data.swaps[i].timestamp,
            sender: sender_id,
            target_volume: volume_t.toString(),
            base_volume: volume_b.toString(),
            usd_volume: usd.toString(),
            type: trade_type,
            fee: swap_fee.toString()
        };

    }

    addTVL_AMM(tvl_snapshot_amm);

    addFEE_AMM(t_swap_fee);

    addTrade(length);

    console.log(`Function 2 memory usage: ${JSON.stringify(process.memoryUsage())}`);

    return lastSwapID;

}

async function getHistoricalTrades() {

    const saveFirstSwap = await getFirstSwapID().then(result => {
        return result;
    }).catch(err => {
        console.log("getHistoricalTrades : getFirstSwapID Error: ", err)
    })
    // should be a string aka an address
    if (typeof saveFirstSwap === 'number') {
        console.log("getHistoricalTrades : getFirstSwapID Error: ")
        return;
    }


    let lastID = 0;
    let saveLastSwap = '';
    let output = '';

    // loop over complete database
    while (lastID <= 9999999) {
        lastID++;
        console.log("rpc request", lastID)
        if (saveLastSwap === '') {
            saveLastSwap = await collectDataFromRouter(saveFirstSwap).then(res => {
                return res;
            }).catch(err => {
                console.log("Error: collectDataFromRouter | last id | first id | ", lastID, saveLastSwap)
            })
        } else {
            output = await collectDataFromRouter(saveLastSwap).then(res => {
                return res;
            }).catch(err => {
                console.log("Error: collectDataFromRouter | last id | first id | ", lastID, saveLastSwap)
            })

            // should be a string aka an address
            if (typeof output === 'number') {
                // console.log("Error: collectDataFromRouter | output is number | ", output);// working
                break;
            }

            if (saveLastSwap != output) {//&& output != stop
                saveLastSwap = output;
            } else {
                // end the loop
                break;
            }

        }
    }

    // get the final value and reset
    const tvl_amm = addTVL_AMM(-1);
    const fees_amm = addFEE_AMM(-1);
    const t_trades = addTrade(-1);

    // reverse engineer the total SS_trade volume
    let fees_ss = await amm.getAdminFeeBalances(SS_ADDRESS, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("Stable Swap Fee Calculation Error: ", err)
    })

    if (typeof fees_ss === 'undefined') {
        console.log("Stable Swap Fee Calculation Error: ", err)
    }

    fees_ss = fees_ss * 2; // Admin share is 50% not 100% of SS fee

    const value = 0.0004; // ss fee 0.04% 
    const diff = 1 - value;
    const y = Number(Math.round(value * diff + "e4") + "e-4")
    const tvl_ss = fees_ss / y;
    //console.log("Stable Swap Data:  ", value, diff, y, tvl_ss)
    // reverse engineer the total SS_trade volume (end)

    const total_v = tvl_amm + tvl_ss;
    const total_f = fees_ss + fees_amm;

    const out = {
        total_trade_volume: total_v,
        amm_trade_volume: tvl_amm,
        ss_trade_volume: tvl_ss,
        amm_fees: fees_amm,
        ss_fees: fees_ss,
        total_fees: total_f,
        total_trades: t_trades
    }

    let stats_res = await utils.writeJsonFile(FILE_DEST_STATS, out).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeJsonFile ", err);
    })

    console.log(" Stats: ", stats_res);

    let ht_res = await utils.writeHistoricalTrades(FILE_DEST_HIST_TRADES, WRITE_TO_FILE.swaps).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeHistoricalTrades", err);
    })
    console.log(" Historical Trades: ", ht_res);

    //reset values 
    WRITE_TO_FILE.index = 0;
    WRITE_TO_FILE.swaps = [];

    console.log(`Function 3 memory usage: ${JSON.stringify(process.memoryUsage())}`);

    return true;

}

// set Interal 
let PREVENT_LOOP = false;
async function collectDataForRequest() {

    let currentDate;
    if (!PREVENT_LOOP) {
        PREVENT_LOOP = true;
        currentDate = new Date()

        const res = await getHistoricalTrades().then(res => {
            return res;
        }).catch(err => {
            console.log("Error: getHistoricalTrades: ", err)
        })

        if (typeof res === 'undefined') {
            PREVENT_LOOP = false;
            console.log("Error: getHistoricalTrades: ", err)
            return;
        }

        // recode in universal way to allow ungoing amm pool creations
        const length = CONSTANTS.data.length;
        let hi_lo = [];
        if (typeof length === 'number' && length > 0) {
            for (let i = 0; i < length; i++) {
                let sym;
                if (CONSTANTS.data[i]?.token0symbol === 'USDP') {
                    sym = CONSTANTS.data[i]?.token1symbol + "_" + CONSTANTS.data[i]?.token0symbol;
                    hi_lo[i] = await utils.createTokenHiLo(sym, FILE_DEST_HIST_TRADES, 1);
                } else if(CONSTANTS.data[i]?.token1symbol === 'USDP') {
                    sym = CONSTANTS.data[i]?.token0symbol + "_" + CONSTANTS.data[i]?.token1symbol;
                    hi_lo[i] = await utils.createTokenHiLo(sym, FILE_DEST_HIST_TRADES, 1);
                }
            }
        }

        const objHiLo = {
            tickers: hi_lo
        }
        let writeToHiLo = await utils.writeJsonFile(FILE_DEST_24HR, objHiLo).then(res => {
            return res;
        }).catch(err => {
            console.log("Error : writeJsonFile ", err);
        })

        console.log("Write 24 hour token data to file: ", writeToHiLo);

        // RESET 
        const currentDate2 = new Date();
        const diff = (currentDate2 - currentDate) / 1000;//ms to seconds
        //  console.log("Time End: ", currentDate2);
        console.log("Polling Data took (seconds) to complete: ", diff);
        PREVENT_LOOP = false;
    } else {
        console.log("Waiting on async Historical Trades | ", PREVENT_LOOP);
    }

    console.log(`Function 4 memory usage: ${JSON.stringify(process.memoryUsage())}`);
}

async function run() {
    setInterval(collectDataForRequest, 6000 * 1)// 60 sec
}

run();