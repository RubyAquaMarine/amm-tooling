const telegram = require('node-telegram-bot-api');
const axios = require('axios');
const ethers = require('ethers');

const rewards = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);
//--------------------------------------ADJUST-----------------------------------||
const token = config.telegram.token;

// aqua : missing .tvl for the /mylp functino to work. using api data and no longer on chain in Telegram chatbot v2.0
let amm_ruby_rubyusd;
let amm_ruby_btcusd;
let amm_ruby_ethusd;
let amm_ruby_ss;
let amm_ruby_sklusd;


const POOLS_PROD_URL = 'https://api.ruby.exchange/api/v1/fe/pools';

const bot = new telegram(token, { polling: true });

async function getDataFromHost(url) {
    const res = await axios.get(url, {

    }).then(res => {
        return res;
    }).catch(err => {
        console.log("getTokenHolders error: ", err);
    })


    if (typeof res !== 'undefined') {
        return res.data;
    }

    return;
}


// updates the external variable and returns the price for other functions to call this value
async function updateTokenPrices() {

    const data = await getDataFromHost(POOLS_PROD_URL)

    const length = data.result.length;



    data.result.forEach(element => {
        //RUBY
        if (element.token0.symbol === "RUBY") {
            amm_ruby_rubyusd = element.poolPrice;
        }
        if (element.token1.symbol === "RUBY") {
            amm_ruby_rubyusd = element.poolPrice;
        }
        //ETH
        if (element.token0.symbol === "ETHC") {
            amm_ruby_ethusd = element.poolPrice;
        }
        if (element.token1.symbol === "ETHC") {
            amm_ruby_ethusd = element.poolPrice;
        }
        //BTC
        if (element.token0.symbol === "WBTC") {
            amm_ruby_btcusd = element.poolPrice;
        }
        if (element.token1.symbol === "WBTC") {
            amm_ruby_btcusd = element.poolPrice;
        }
        //SKL
        if (element.token0.symbol === "SKL") {
            amm_ruby_sklusd = element.poolPrice;
        }
        if (element.token1.symbol === "SKL") {
            amm_ruby_sklusd = element.poolPrice;
        }
    });

    console.log("amm pools:", length, amm_ruby_rubyusd, amm_ruby_ethusd, amm_ruby_btcusd, amm_ruby_sklusd)
}

function searchForTokenPrice(inputSymbol) {

    if (inputSymbol === 'RUBY') {
        return amm_ruby_rubyusd;
    }
    if (inputSymbol === 'ETH') {
        return amm_ruby_ethusd;
    }
    if (inputSymbol === 'BTC') {
        return amm_ruby_btcusd;
    }
    if (inputSymbol === 'SKL') {
        return amm_ruby_sklusd;
    }

}


// true/false boolean to allow converting of lp tokens ( if we want to disable)
async function convertLPTokens(pair) {

    pair = pair.toUpperCase();

    if (pair == "ETH") {
        let eth = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.ETH, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + eth;
    }
    if (pair == "RUBY") {
        let ruby = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.RUBY, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + ruby;
    }
    if (pair == "SKL") {
        let skl = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.SKL, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + skl;
    }
    if (pair == "BTC") {
        let btc = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.BTC, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + btc;
    }
}

// telegram commands
bot.on('message', (msg) => {

    const chatId = msg.chat.id;
    console.log("New telegram message on chatId: ", chatId);


    let priceSearch = msg.text;
    let pairPrice = priceSearch.slice(6);//save 
    priceSearch = priceSearch.substr(0, 6);
    if (priceSearch == "/price" && pairPrice.length >= 3) {
        updateTokenPrices();
        const price = searchForTokenPrice(pairPrice)
        bot.sendMessage(chatId, "" + pairPrice + ":" + price.toFixed(4));
    }


    if (msg.text == "/price") {
        updateTokenPrices()// updates rubyusdpPrice
        bot.sendMessage(chatId, "Please use /priceRUBY");
    }

    if (msg.text == "/compare" || msg.text == "/COMPARE") {

        let mess =
            "Create New Message"

        bot.sendMessage(chatId, mess);
    }

    if (msg.text == "/apr") {
        const messageTo = "Please try again later. Data is being calculated...."
        bot.sendMessage(chatId, messageTo);

    }

    let stringTest = msg.text;
    let pair = stringTest.slice(8);//save 
    stringTest = stringTest.substr(0, 8);
    if (stringTest == "/convert" && pair.length >= 3) {
        convertLPTokens(pair);
        bot.sendMessage(chatId, "Converting LP tokens on Pool:" + pair + "-USDP");
    }
    if (msg.text == "/convertLP") {

        bot.sendMessage(chatId, "run the command with the Asset Name after /convert such as /convertRUBY");
    }

    // get the users LP token value
    let stringlp = msg.text;
    stringlp = stringlp.substr(0, 5);
    if (stringlp == "/mylp") {
        // /mylp userAddress
        var coolVar = msg.text;
        var partsArray = coolVar.split(' ');
        let checkLength = partsArray?.length;
        console.log(" check length", checkLength, typeof checkLength);
        console.log("amm_ruby_rubyusd.tvl: get LP values", amm_ruby_rubyusd.tvl, typeof amm_ruby_rubyusd.tvl)
        if (checkLength === 2) {

         

            let messageObject = "Your LP Tokens are worth\n";
            let test_ruby_LP = rewards.getLPTokenValue(amm_ruby_rubyusd.tvl, RUBY_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "RUBYUSDP: " + result.userTVL + "\n";
              //  bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            bot.sendMessage(chatId,  test_ruby_LP );
           


            let test_btc_LP = rewards.getLPTokenValue(amm_ruby_btcusd.tvl, BTC_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "BTCUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_eth_LP = rewards.getLPTokenValue(amm_ruby_ethusd.tvl, ETH_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "ETHUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_skl_LP = rewards.getLPTokenValue(amm_ruby_sklusd.tvl, SKL_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "SKLUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_ss_LP = rewards.getLPTokenValue(amm_ruby_ss, STABLE_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "4POOL: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
        } else {
            console.log("-- check length", checkLength, typeof checkLength);
        }

    }

    console.log("End Telegram message");
});




