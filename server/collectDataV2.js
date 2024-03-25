const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const ammu = require('../ruby_modules/utils.js')
const rewards = require('../ruby_modules/rewarder.js');
const utils = require('../ruby_modules/users.js');

const CRED = require('../keys.json');
const CONSTANTS = require('../Constants.json');

const FILE_DEST_FARM = "server/data/farms.json";

const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const walletOrigin = new ethers.Wallet(CRED.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const CHEF_ADDRESS = CONSTANTS.project.masterchef;
const SS_ADDRESS = CONSTANTS.project.fourPool;
const POOLS = CONSTANTS.data.length;
const STAKER = CONSTANTS.project.stake;

const DEBUG = false;

// adjusts for mainnet and testnet RUBYUSDP USDPRUBY pairing
let RUBY_ADDRESS;
let USDP_ADDRESS;
function getCorrectSymbolMapping() {
    if (CONSTANTS.data[0].token0symbol == 'USDP') {// testnet
        USDP_ADDRESS = CONSTANTS.data[0].token0address;
        RUBY_ADDRESS = CONSTANTS.data[0].token1address;
    } else {                                        //mainnet
        USDP_ADDRESS = CONSTANTS.data[0].token1address;
        RUBY_ADDRESS = CONSTANTS.data[0].token0address;
    }
}

let RUBY_PRICE, BTC_PRICE, ETH_PRICE, SKL_PRICE;
let RUBY_LP;
async function init() {
    const eth_lp = await ammu.getLPTokenAddressWithSymbol('ETHC', 'USDP');
    const btc_lp = await ammu.getLPTokenAddressWithSymbol('WBTC', 'USDP');
    const skl_lp = await ammu.getLPTokenAddressWithSymbol('SKL', 'USDP');
    const ruby_lp = await ammu.getLPTokenAddressWithSymbol('RUBY', 'USDP');
    RUBY_LP = ruby_lp;

    RUBY_PRICE = await amm.getTokenPrice(ruby_lp, accountOrigin);
    ETH_PRICE = await amm.getTokenPrice(eth_lp, accountOrigin);
    BTC_PRICE = await amm.getTokenPrice(btc_lp, accountOrigin);
    SKL_PRICE = await amm.getTokenPrice(skl_lp, accountOrigin);

    console.log("RUBY " + RUBY_PRICE)
    console.log("ETH " + ETH_PRICE)
    console.log("SKL " + SKL_PRICE)
    console.log("BTC " + BTC_PRICE)
}

async function getBlockStamp() {
    const blockNumber = await providerOrigin.getBlockNumber().then(result => {
        return result;
    }).catch(err => {
        console.log("updateBlockstamp Error: ", err)
    })

    if (typeof blockNumber === "undefined") {
        return;
    }

    const blockData = await providerOrigin.getBlock(blockNumber).then(result => {
        return result;
    }).catch(err => {
        console.log("updateBlockstamp Error: ", err)
    })

    if (typeof blockData === "undefined") {
        return;
    }

    const blockTime = blockData.timestamp;

    return blockTime;
}


// an amm pool that is not being incentivized 
async function getAllFarmsV2() {
    // Reset 
    let dex_tvl = 0;
    let staking_locked = 0;
    let staking_unlocked = 0;
    let staking_tvl = 0;
    let staking_apr = 0;
    let locked_apr = 0;

    let staking_values = await rewards.reportRubyStaker(STAKER, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("reportRubyStaker Error: ", err)
    })

    if (typeof staking_values === 'undefined') {
        console.log("reportRubyStaker Error: ")
        return;
    }

    staking_locked = staking_values[0];
    staking_unlocked = staking_values[1];

    let staking = await rewards.viewRewardsAPR(STAKER, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("reportRubyStaker Error: ", err)
    })

    if (typeof staking === 'undefined') {
        console.log("viewRewardsAPR Error: ")
        return;
    }

    staking_apr = staking[1];
    locked_apr = staking[0];

    RUBY_PRICE = await amm.getTokenPrice(RUBY_LP, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("getTokenPrice Error: ", err)
    })

    if (typeof RUBY_PRICE === 'undefined' || RUBY_PRICE === 0) {
        return;
    }

    if (typeof staking_locked === 'number' && typeof staking_unlocked === 'number' && typeof RUBY_PRICE === 'number') {
        staking_tvl = (staking_locked + staking_unlocked) * RUBY_PRICE;
    } else {
        console.log("staking_tvl Error: ")
        return;
    }

    const burnt = await amm.checkTokenBurnedAmount(RUBY_ADDRESS, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenBurnedAmountError: ", err)
        return '0';
    });

    const ruby_burnt = Number(burnt);

    let printObject;
    let cg_pairs = []
    let cg_tickers = []
    let cg_depth = []
    let cg_trades = []
    let cmc = []
    let fe_farm = []
    let fe_amm = []
    let fe_stats_farms = [];
    let fe_stats_pools = [];

    if (typeof POOLS === 'undefined') {
        console.log("Error: AMM POOLS LENGTH IS MISSING ")
        return;
    }

    console.log("AMM Pool Length: ", POOLS)

    // Get all the AMM pool datas and get the Stableswap tvl last
    for (let i = 0; i <= POOLS; i++) {  // add stableswap by "<="
        let isSS = false;
        let pairAddress;

        //switch if stableswap or amm
        if (i < POOLS) {

            pairAddress = CONSTANTS.data[i].poolAddress;

            if (typeof pairAddress === 'undefined') {
                console.log("CONSTANTS.data[i].poolAddress Error: ", i)
                break;
            }

            printObject = await amm.getAMMPoolTVL(pairAddress, accountOrigin).then(result => {
                return result;
            }).catch(err => {
                console.log("getAMMPoolTVL Error: ", err)
            })

        } else {
            // stable swap address
            isSS = true;
            pairAddress = CONSTANTS.stableswap.address;

            if (typeof pairAddress === 'undefined') {
                console.log("CONSTANTS.stableswap.address Error: ", i)
                break;
            }

            printObject = await amm.stableSwapTokenBalance(pairAddress, SS_ADDRESS, accountOrigin).then(result => {
                return result;
            }).catch(err => {
                console.log("stableSwapTokenBalance Error: ", err)
            })
        }

        if (DEBUG) {
            console.log("DEBUG POOL DATA ", i, printObject)
        }

        if (typeof printObject === 'undefined') {
            console.log("---BUG--- printObject ")
            return;
        }

        const poolPrice = Number(printObject?.poolPrice);
        const tvl = Number(printObject?.tvl);

        dex_tvl += tvl;// needs to reset to zero

        console.log("POOL # | TVL | Total TVL  ", i, tvl, dex_tvl)

        // there will be cases where the FarmTVL will be zero
        // the amm data still needs to be indexed 
        // must skip over the farming stuff and enter default values

        const testLP = await rewards.getFarmTVL(tvl, pairAddress, CHEF_ADDRESS, accountOrigin).then(result => {
            return result;
        }).catch(err => {
            console.log("getFarmTVL Error: ", err)
        })

        let farmTVL = testLP?.farmTVL;

        if (typeof farmTVL === 'undefined' || typeof farmTVL === 0) {
            console.log("This AMM POOL does not have a farm : Address: ", pairAddress, farmTVL, testLP)
        }

        const farm = await rewards.findFarmPoolShare(pairAddress, CHEF_ADDRESS, accountOrigin).then(result => {
            return result;
        }).catch(err => {
            console.log("findFarmPoolShare Error: ", err)
        })

        if (typeof farm === 'undefined') {
            console.log(` Pool ${i} doesn't have Farming Rewards`);
        }

        let farmPoolID = -1;// farmPoolID 0 exists, therefore use a default that does not == a ppssible farmID
        let rewardsinUSD = 0;
        let apyFarm = 0;

        if (typeof farm?.poolID === 'number' && typeof farm?.poolRubyPerYear === 'number') {
            farmPoolID = farm.poolID;
            rewardsinUSD = farm.poolRubyPerYear * RUBY_PRICE;
            apyFarm = (rewardsinUSD / farmTVL) * 100;
        }

        let dualRewardTokenExist = "";// symbol
        let dualRewardTokenAmount = 0;
        let getTokenPrice;
        let dualRewardTokenAddress;

        if (typeof farm?.poolDualRewardTokenAddress === 'string') {
            dualRewardTokenAddress = farm.poolDualRewardTokenAddress;
        }

        if (typeof dualRewardTokenAddress === 'string') {

            dualRewardTokenExist = farm?.poolDualRewardToken;
            dualRewardTokenAmount = farm?.poolDualRewardPerDay;
            let testDR = farm?.poolDualRewardPerYear;

            if (testDR === 0) {
                testDR = 1;// prevent zero divide while rewards are off
            }

            getTokenPrice = await amm.getTokenPriceFromSymbol(dualRewardTokenAddress, accountOrigin).then(result => {
                return result;
            }).catch(err => {
                console.log("getTokenPriceFromSymbol Error: ", err)
            })

            if (typeof getTokenPrice === 'number') {
                let rewardsinUSDonDR = testDR * getTokenPrice;
                let apyFarmDR = (rewardsinUSDonDR / farmTVL) * 100;
                apyFarm = apyFarm + apyFarmDR;
            }

        }

        if (typeof getTokenPrice === 'undefined') {
            console.log(" No Dual Rewards for this pool");
        }

        let rubyPerDay = 0;// default to zero
        if (typeof farm?.poolRubyPerDay === 'number') {
            rubyPerDay = farm.poolRubyPerDay;
        }


        let tokenA;
        let tokenB;
        let tokenA_address;
        let tokenB_address;

        if (isSS === false) {
            let res1 = await ammu.getTokenData(pairAddress).then(result => {
                return result;
            }).catch(err => {
                console.log("getTokenData Error: ", err)
            })

            tokenA = res1.token0symbol;
            tokenB = res1.token1symbol;
            tokenA_address = res1.token0address;
            tokenB_address = res1.token1address;
        } else {
            tokenA = "4Pool";
            tokenB = "USDP_USDT_USDC_DAI";
        }

        let urlLink = await ammu.getAMMURL(tokenA_address, tokenB_address).then(result => {
            return result;
        }).catch(err => {
            console.log("getAMMURLError: ", err)
        })
        //  let tokenA_url = await ammu.getTokenLogos(tokenA);
        //  let tokenB_url = await ammu.getTokenLogos(tokenB);


        // match symbol = USDP => base 
        let base;
        let target;
        if (tokenA == 'USDP') {
            base = tokenA;
            target = tokenB;
        } else {
            base = tokenB;
            target = tokenA;
        }


        cg_pairs[i] = {
            ticker_id: target + "_" + base,
            base: base,
            target: target
        }

        const spread = poolPrice / 300;
        const bid = poolPrice - spread;
        const ask = poolPrice + spread;

        cg_tickers[i] = {
            ticker_id: target + "_" + base,
            base_currency: base,
            target_currency: target,
            last_price: poolPrice.toString(),
            base_volume: "",
            target_volume: "",
            bid: bid.toString(),// minus 0.3%
            ask: ask.toString(),//plus 0.3%
            high: poolPrice.toString(),
            low: poolPrice.toString()
        }

        const depth = tvl / 2;

        cg_depth[i] = {
            ticker_id: target + "_" + base,
            positive_depth: depth.toString(), // divide by 2
            negative_depth: depth.toString(), // divide by 2
        }


        cg_trades[i] = {
            ticker_id: target + "_" + base,

        }

        // output for front-end
        fe_amm[i] = printObject;

        fe_stats_pools[i] = {
            pair: target + "_" + base,
            tvl: tvl
        }

        // if farmPool exists
        // creates a null value within the json file if pool doesn't exist - desigend for testnet
        // loop length is amm pools + SS pool 
        // redesign requires (farm input parameter requires the amm data.....)
        if (typeof farmPoolID === 'number' && typeof apyFarm !== 'undefined' && typeof farmTVL !== 'undefined') {
            fe_stats_farms[i] = {
                pair: target + "_" + base,
                apr: apyFarm
            }

            fe_farm[i] = {
                ID: farmPoolID,
                data: farm,
                pair: tokenA + "_" + tokenB,
                poolPrice: poolPrice,
                poolRewards: [
                    {
                        symbol: "RUBY",
                        perDay: rubyPerDay

                    },
                    {
                        symbol: dualRewardTokenExist,
                        perDay: dualRewardTokenAmount

                    }],
                poolAPR: apyFarm.toFixed(2),
                usdTVL: farmTVL.toFixed(2),
            }
        }



        // output for cmc
        cmc[i] = {
            name: "Ruby.Exchange " + tokenA + "-" + tokenB, // Pool name if any, eg. Sushi Party, Uniswap Sushi-ETH LP
            pair: tokenA + "-" + tokenB,
            pairLink: urlLink, // The URL to this pool
            logo: 'https://ruby.exchange/images/tokens/ruby-square.png', // Pool logo if any, otherwise just use Project logo
            poolRewards: ["RUBY", dualRewardTokenExist], // The reward token ticker
            apr: apyFarm / 100, // APY, 1.1 means 110%
            totalStaked: farmTVL, // Total valued lock in USD 
        }
    }

    const cmc_header = {
        provider: 'Ruby.Exchange', // Project name - 
        provider_logo: 'URL', // Project logo, square, less than 100*100 px
        provider_URL: 'URL', // Project URL
        links:
            [ // social media info
                {

                    title: 'Twitter',
                    link: 'https://twitter.com/Ruby_Exchange',

                },
                {

                    title: 'Telegram',
                    link: 'https://t.me/RubyExchangeOfficial',

                },
                {

                    title: 'Github',
                    link: 'https://github.com/RubyExchange',

                }
            ],

    }

    //Frontend
    //volume and fees updated later
    let fe_stats = {
        tvl: dex_tvl,
        price: RUBY_PRICE,
        burned: ruby_burnt,
        volume: 0,
        fees: 0
    }

    let refactorObj = {
        coingecko: {
            pairs: cg_pairs,
            tickers: cg_tickers,
            historical_trades: cg_trades,
            depth: cg_depth
        },
        coinmarketcap: {
            project: cmc_header,
            pools: cmc,
        },
        frontend: {
            amm: fe_amm,
            farm: fe_farm,
            stats: {
                stats: fe_stats,
                topFarms: fe_stats_farms,
                topPools: fe_stats_pools
            },
            staking: {
                locked: staking_locked,
                unlocked: staking_unlocked,
                locked_apr: locked_apr,
                unlocked_apr: staking_apr,
                tvl: staking_tvl
            }
        },
    }

    // Output is written to json file
    return refactorObj;
}

// set Interal 
let PREVENT_LOOP = false;
async function collectDataForRequest() {

    // make the new data object.  
    let farmData;
    let currentDate;
    if (!PREVENT_LOOP) {
        PREVENT_LOOP = true;
        currentDate = new Date()
        //  console.log("Time start: ", currentDate)

        farmData = await getAllFarmsV2().then(res => {
            return res;
        }).catch(err => {
            console.log("Error : getAllFarmsV2 ", err);
        })


        if (typeof farmData === 'undefined') {
            console.log("Error : getAllFarmsV2(): Pass on data Write(): reset loop: ");
            PREVENT_LOOP = false;
            return;
        }

        farmData.lastUpdated = await getBlockStamp().then(res=>{
            return res;
        }).catch(err=>{
            console.log("err", err)
        })

       
        // then write this object to the farms.json
        let writeToFarms = await utils.writeJsonFile(FILE_DEST_FARM, farmData).then(res => {
            return res;
        }).catch(err => {
            console.log("Error : writeJsonFile ", err);
        })
        console.log("Write farms data file: ", writeToFarms);

        // RESET 
        const currentDate2 = new Date();
        const diff = (currentDate2 - currentDate) / 1000;//ms to seconds
        //  console.log("Time End: ", currentDate2);
        console.log("Polling Data took (seconds) to complete: ", diff);
        PREVENT_LOOP = false;
    } else {
        console.log("Waiting on async getAllFarms(): ", PREVENT_LOOP);
    }
}

async function run() {
    getCorrectSymbolMapping();
    await init();// get the poolPrice

    setInterval(collectDataForRequest, 60000 * 2)// 60 sec
}

run();