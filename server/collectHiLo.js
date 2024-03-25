// npm run hilo
// subgraph query doesn't seem to work .. moving on 

const client = require('graphql-request');
const ammu = require('../ruby_modules/utils.js')
const utils = require('../ruby_modules/users.js');

const CONSTANTS = require('../Constants.json');
const URL = CONSTANTS.project.subgraph;
const FILE_DEST_LASTDAY_TRADES = "server/data/lastDay_trades.json";
const FILE_DEST_LASTDAY_HILO = "server/data/daily.json";
const FILTER_RAVENDAO = '0x1a061ee395df1005a82ee0fa23dbb0be0368aa0c';

// master obj
let WRITE_TO_FILE = {
    index: 0,
    swaps: []
}

// set Interal 
let PREVENT_LOOP = false;
/*

Main function 

*/
async function collectDataForRequest() {

    let currentDate;
    if (!PREVENT_LOOP) {
        PREVENT_LOOP = true;
        currentDate = new Date()

        const res = await getTradesWithinLastDay().then(res => {
            return res;
        }).catch(err => {
            console.log("Error: getTradesWithinLastDay: ", err)
        })

        if (!res || typeof res !== 'boolean') {
            PREVENT_LOOP = false;
            console.log("Error: getTradesWithinLastDay: ")
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
                    hi_lo[i] = await utils.createTokenHiLo(sym, FILE_DEST_LASTDAY_TRADES, 1);
                } else if (CONSTANTS.data[i]?.token1symbol === 'USDP') {
                    sym = CONSTANTS.data[i]?.token0symbol + "_" + CONSTANTS.data[i]?.token1symbol;
                    hi_lo[i] = await utils.createTokenHiLo(sym, FILE_DEST_LASTDAY_TRADES, 1);
                }
            }
        }

        const objHiLo = {
            tickers: hi_lo
        }
        let writeToHiLo = await utils.writeJsonFile(FILE_DEST_LASTDAY_HILO, objHiLo).then(res => {
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
}

/*

Sub Main Function

  in order for this to work correctly, the data from the first call must be sorted (ascending:timestamp) to find the latest timestamp (index-1) for the next fetch call 
           
  returns : true or false
*/
async function getTradesWithinLastDay() {

    let lastID = 0;
    let saveLastSwapData;
    let output;

    const startTime = await getTimeStampBegin().then(result => {
        return result;
    }).catch(err => {
        console.log("getHistoricalTrades : getFirstSwapID Error: ", err)
    })

    if (typeof startTime === 'number') {
        console.log("getHistoricalTrades : getFirstSwapID Error: ")
        return;
    }

    console.log("Debug start time:", startTime);

    while (lastID <= 9999999) {
        lastID++;

        console.log("fetch ", lastID);

        if (lastID === 1) {  // First fetch
            saveLastSwapData = await collectDataFromRouter(0, startTime).then(res => {
                return res;
            }).catch(err => {
                console.log("Error: collectDataFromRouter | last id | first id | ", lastID, saveLastSwapData)
            })
        } else {
            if (typeof saveLastSwapData !== 'undefined') {
                output = await collectDataFromRouter(saveLastSwapData[0], saveLastSwapData[1]).then(res => {
                    return res;
                }).catch(err => {
                    console.log("Error: collectDataFromRouter | last id | first id | ", lastID, saveLastSwapData)
                })
            }else{
                console.log("Error: collectDataFromRouter | saveLastSwapData undefined");// working
                break;
            }
            console.log("collectDataFromRouter should not be undefined ", saveLastSwapData[0], saveLastSwapData[1]);
            // STOP POLLING
            if (typeof output[0] === 'number' || typeof output[0] === 'undefined') {
                console.log("Error: collectDataFromRouter | output is number | ", output);// working
                break;
            }
            // UPDATE
            if (saveLastSwapData[1] != output[1]) {
                saveLastSwapData[1] = output[1];
                console.log("Polling: collectDataFromRouter ");
            } else {
                console.log("Error: collectDataFromRouter : end of loop");
                break;
            }
        }
    }

    console.log("Writing Data to FILE_DEST_LASTDAY_TRADES", startTime);

    let ht_res = await utils.writeHistoricalTrades(FILE_DEST_LASTDAY_TRADES, WRITE_TO_FILE.swaps).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeHistoricalTrades", err);
    })
    console.log(" Historical Trades: ", ht_res);

    //reset values 
    WRITE_TO_FILE.index = 0;
    WRITE_TO_FILE.swaps = [];
    console.log(" clear WRITE_TO_FILE: ", WRITE_TO_FILE);
    return true;

}

// insert 0 for the lastID to use the TIMESTAMP_QUERY
// else, uses the NEXTBATCH_QUERY
// return [lastSwapID, lastSwapTS];
async function collectDataFromRouter(lastID, lastTimeStamp) {

    console.log("collectDataFromRouter| lastID ", lastID, " |lastTimestamp ", lastTimeStamp)

    const app = new client.GraphQLClient(URL);

    let data;
    if (lastID === 0) {

        let variables = {
            //  id: lastID,
            timestamp: lastTimeStamp
        }

        try {
            data = await app.request(TIMESTAMP_QUERY, variables);
        } catch (err) {
            throw new Error("Subgraph Error: " + err.response)
        }


    } else if (typeof lastID === 'string' && typeof lastID !== 'undefined') {

        let variables = {
            id: lastID,
            // timestamp: lastTimeStamp
        }

        try {
            data = await app.request(NEXTBATCH_QUERY, variables);
        } catch (err) {
            throw new Error("Subgraph Error: " + err.response)
        }


    }


    if (!data?.swaps) {
        console.error("  Subgraph Error: no swap data")
        return [0, 0];
    }

    const length = data?.swaps.length;

    if (!length) {
        console.error("  Subgraph Error: no swap data")
        return [0, 0];
    } else if (length === 0) {
        console.error("END OF RUBY ROUTER DATA")
        return [0, 0];
    }

    const lastSwapTS = data.swaps[length - 1].timestamp;
    const lastSwapID = data.swaps[length - 1].id;

    for (let i = 0; i < length; i++) {

        const lp_id = data.swaps[i].pair.id;

        if (!lp_id) {
            console.error("No LP address found within Subgraph:Swaps:Pair:ID ", lp_id)
            break;
        }

        const sender_id = data.swaps[i].to;

        if (!sender_id) {
            console.error("No to address found within Subgraph:Swaps:To ", lp_id)
            break;
        }

        let usd = 0;
        let exchange_rate = 0;

        let tokenData = await ammu.getTokenData(lp_id).then(result => {
            return result;
        }).catch(err => {
            console.error("Constants.json missing LP Data: ", lp_id)
        })

        if (!tokenData?.token0symbol) {
            console.error("Constants.json missing LP Data: ", lp_id)
            break;
        }

        const tokenA = tokenData.token0symbol;
        const tokenB = tokenData.token1symbol;

        let create_pair = `${tokenA}_${tokenB}`;

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
                create_pair = `${tokenB}_${tokenA}`;
            }

            // token input is not USDP
            if (tokenA == "USDP" && parseFloat(data.swaps[i].amount0In) == 0) {
                exchange_rate = parseFloat(amount_out) / parseFloat(amount_in);
                usd = parseFloat(amount_out);
                volume_b = amount_out;
                volume_t = amount_in;
                create_pair = `${tokenB}_${tokenA}`;
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
                create_pair = `${tokenB}_${tokenA}`;
            }
            if (tokenB == "RUBY" && tokenA == "USDP" && parseFloat(data.swaps[i].amount1In) > 0) {
                // USDP / RUBY 
                exchange_rate = parseFloat(amount_in) / parseFloat(amount_out);
                usd = parseFloat(amount_in);
                volume_b = amount_in;// base is USDP and tokenA (input) is USDP therefore amount_in is USDP
                volume_t = amount_out;
                create_pair = `${tokenB}_${tokenA}`;
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
            console.error("Missing Swap Data in/out amounts: ", lp_id)
            break;
        }

        //filter out specifc addresses
        let swap_fee = 0;
        if (sender_id != FILTER_RAVENDAO) {
            swap_fee = usd * 0.003;
        } else {
            swap_fee = 0;// resets to zero on RavenDao trading volume
        }

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

    console.log(" What is the number of swaps since yesterday's timestamp?", length)
    // less than 1000 tx, end of data
    if (length <= 999) {
        return 0;
    }

    return [lastSwapID, lastSwapTS];

}



function isStableInUSDP(symbolIn) {
    if (symbolIn === 'USDP') {
        return 'buy';
    } else {
        return 'sell'
    }
}

// Returns STRING TYPE
async function getTimeStampBegin() {
    // 24 hour window
    const endTime = new Date().getTime() / 1000;
    const subTime = ((60 * 60) * 24) * 1; // in seconds
    const startTime = endTime - subTime;
    const time_start = startTime.toFixed(0);
    return time_start
}


const TIMESTAMP_QUERY = client.gql`
query swapQuery($timestamp: String!) {
  swaps (  where: { timestamp_gt: $timestamp }){
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
`;

const NEXTBATCH_QUERY = client.gql`
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
`;

async function run() {
    setInterval(collectDataForRequest, 6000 * 1)// 6 sec
}

run();