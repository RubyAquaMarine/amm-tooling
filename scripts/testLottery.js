const fs = require('fs');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('./keys.json');

const amm = require('../ruby_modules/amm.js');
const lottery = require('../ruby_modules/lottery.js');

const utils = require('../ruby_modules/utils.js');

//--------------------------------------ADJUST-----------------------------------||

const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);


// two states - current lottery ends and lottery index increase 
//- current lottery is open

const FILE_DEST = 'server/data/lottery.json';

const USDP = config.assets.europa.USDP;

// check the lottery count 
// save the last value (current Lottery)
async function getLatestLotteryAddress() {
    let lotteryObject = await lottery.saveLotteryAddresses(config.amm.lotteryFactory, account);
    let lengthOf = lotteryObject.length;
    return lotteryObject[lengthOf - 1];
}

async function isOpen(CURRENT_LOTTERY) {

    let test = await lottery.isLotteryOpen(CURRENT_LOTTERY, account);
    // is open
    if (test) {
        //update the json file with the latest lottery stats. 
        let time = await lottery.getLotteryEndTime(CURRENT_LOTTERY, account);
        time = time * 1000;//ms
        let now = Date.now();
        let ends = (time - now) / 1000;
        let mins = ends / 60;
        let hours = mins / 60;
        let days;

        if (hours > 24) {
            days = hours / 24;
        }
        console.log("Lottery state time Ends: ", time);
        console.log("Lottery state time Now: ", now);
        console.log("Lottery state time Seconds: ", ends);
        console.log("Lottery state time Mins: ", mins);
        console.log("Lottery state time Hours: ", hours);
        console.log("Lottery state time Days: ", days);
    } 
}

// updating the current lottery data within the json file
// this should be called when someone buys a ticket
    // wss with listening to EVENT of buyTicket and run this function .. tried this. no success. 
    // for now just loop along with the farming data
async function updateCurrentLottery() {

    let data = await utils.readJsonFile(FILE_DEST);
    let length = data?.lotteries.length;
    console.log(length);

    // return the values here, and edit here 
    //[sold, remains, raisedAmount]
    let updateNew = await lottery.getCurrentLotteryData(data.lotteries[length - 1].ticketsSoldIn,data.lotteries[length - 1].tokenAddress, 
        data.lotteries[length - 1].lotteryAddress,
        USDP, 
        account);
    
    data.lotteries[length - 1].ticketsSold = updateNew[0];
    data.lotteries[length - 1].ticketsRemain = updateNew[1];
    data.lotteries[length - 1].lotteryRaisedUSD = updateNew[2];

    let ok = await utils.writeJsonFile(FILE_DEST, data)

    console.log(data);
}

async function run() {

    //init - sets the CURRENT_LOTTERY address
    let current_lottery_address =   await getLatestLotteryAddress();
    console.log(current_lottery_address)
    // loop this. once is false, then run the getCurrentLotteryAddress within the isOpen function when false
    await isOpen(current_lottery_address);



    //  setInterval(isOpen, 10000)// 10 sec




   // await test();

}

run();