const fs = require('fs');
const csvWriter = require('csv-write-stream');
const ethers = require('ethers');
const nft_abi = require('../abi/nft_rubyprofile.json');
const erc20_abi = require('../abi/erc20.json');
const stakeABI = require('../abi/rubyStaker.json');

// input: sortByPair are XYZ_USDP only
async function createTokenHiLo(insertXYZUSDP, FILENAME, daysLookBack) {

    let data = JSON.parse(fs.readFileSync(FILENAME));
    data = data.swaps;

    // 24 hour window
    const endTime = new Date().getTime() / 1000;
    const subTime = ((60 * 60) * 24) * daysLookBack; // in seconds
    const startTime = endTime - subTime;
    const time_end = endTime.toFixed(0);
    const time_start = startTime.toFixed(0);

    //check for null values within the json file 
    data = data.filter(o =>
        o !== null
    );

    // filter by time and ticker
    data = data.filter(o =>
        Number(o?.timestamp) >= Number(time_start) && Number(o?.timestamp) <= Number(time_end) && o?.ticker_id == insertXYZUSDP
    )

    const reformat = {
        swaps: data
    }

    // let testThis = JSON.stringify(reformat)
    //  fs.writeFileSync('daily_trades_' + insertXYZUSDP + ".json" , testThis);


    const loop = data.length;

    // now add up all the base and target volume
    let base = 0;
    let target = 0;
    let total_volume = 0;
    let highest = 0; let max;
    let lowest = 0; let min;

    if (loop <= 0 || loop === undefined || loop === null) {
        console.log("No trades within the last 24 hours for ticker_id:", insertXYZUSDP)
        return;// no trades
    }

    console.log("trades within the last 24 hours for ticker_id:", insertXYZUSDP + " count: " + loop)
    const openPrice = data[1]?.price;
    for (let i = 0; i < loop; i++) {
        base += Number(data[i].base_volume);
        target += Number(data[i].target_volume);
        total_volume += Number(data[i].usd_volume);
        if (max == null || parseFloat(data[i].price) > parseFloat(max))
            max = parseFloat(data[i].price);

        if (min == null || parseFloat(data[i].price) < parseFloat(min))
            min = parseFloat(data[i].price);
    }

    highest = max;
    lowest = min;

    let obj = {};
    if (max != undefined && min != undefined) {
        obj = {
            ticker_id: insertXYZUSDP,
            volume: total_volume.toFixed(2),
            high: highest.toString(),
            low: lowest.toString(),
            base_volume: base.toString(),
            target_volume: target.toString(),
            open_price : openPrice
        }

    }

    console.log(obj)
    return obj;
}


async function writeHistoricalTrades(filename, array_object) {

    //remove any null if exists
    array_object = array_object.filter(o =>
        o !== null
    );

    let sorted_trades = array_object.sort(function (a, b) {
        return a.timestamp - b.timestamp;
    });

    const reformat = {
        swaps: sorted_trades
    }

    let testThis = JSON.stringify(reformat)
    fs.writeFileSync(filename, testThis);

    return true;
}


async function checkFileExists(filename) {
    const test = fs.promises.access(filename, fs.constants.F_OK).then(res => {
        console.log(res)
        return true;
    }).catch(er => {
        return false;
    })
    return test;
}

async function readJsonFile(filename) {
    const dataObject = JSON.parse(fs.readFileSync(filename));
    return dataObject;
}

async function writeJsonFile(filename, object) {
  
    if (typeof object === 'undefined' ||  typeof filename === 'undefined') {
        console.log("Error: writeJsonFile: ", filename, object);
        return false;
    }

    const testThis = JSON.stringify(object);
    fs.writeFileSync(filename, testThis);
    return true;
}

// reads database file
async function usersStakingRuby(minStaked, fileNameOfUsers, fileName, rubyStakerAddress, signer) {

    dataObject = JSON.parse(fs.readFileSync(fileNameOfUsers));

    let length = dataObject.users.length;
    console.log(length)

    let obj = {
        address: [],
        balance: []
    }

    let index = 0;
    let isBalance;
    for (let i = 0; i < length; i++) {

        console.log(i);
        isBalance = await isUserStaking(dataObject.users[i], rubyStakerAddress, signer);

        if (Number(isBalance) > minStaked) {
            obj.address[index] = dataObject.users[i];
            obj.balance[index] = isBalance;
            console.log(obj.address[index] + "  User Total Balance  " + obj.balance[index])
            index++;
        }

    }

    let res = await writeToJson(fileName, obj);
    return res;

}

async function isUserStaking(userAddress, rubyStakerAddress, signer) {
    const stakeContract = new ethers.Contract(rubyStakerAddress, stakeABI, signer);
    // Single Value returned
    // Total balance of an account, including unlocked, locked and earned tokens
    let userTotalSupply = await stakeContract.totalBalance(userAddress).then(transaction => {
        let value = ethers.utils.formatUnits(transaction, 18)
        return value;
    }).catch(err => {
        console.log("isUserStaking error:", err)
    })

    return userTotalSupply;
}

// refactor this to read the database file instead of looping over NFT profile token ID 
// Inputs: two different filenames 
// database file    
// output file
async function usersHoldingRuby(minAmountOfRuby, rubyAddress, databaseFilename, outputFileName, signer) {

    const RUBY = new ethers.Contract(rubyAddress, erc20_abi, signer);

    dataObject = JSON.parse(fs.readFileSync(databaseFilename));

    let length = dataObject.users.length;
    console.log(length)

    let obj = {
        address: [],
        balance: []
    }

    let index = 0;
    let bal;
    let addr;
    for (let i = 0; i < length; i++) {
        addr = dataObject.users[i];
        bal = await RUBY.balanceOf(addr).then(result => {
            return ethers.utils.formatUnits(result, 18);
        }).catch(err => {
            console.log(err.toString());
            return '0';
        })
        // ruby holders only
        if (Number(bal) > minAmountOfRuby) {
            obj.address[index] = addr;
            obj.balance[index] = bal;
            console.log("UserID:" + i + " User Wallet: " + obj.address[index] + " Ruby Balance: " + obj.balance[index]);
            index++;
        }
    }

    // get all the addresses,  
    let res = await writeToJson(outputFileName, obj);

    return res;

}

async function usersHoldingXYZ(minAmountOfToken, tokenAddress, databaseFilename, outputFileName, signer) {

    const RUBY = new ethers.Contract(tokenAddress, erc20_abi, signer);

    dataObject = JSON.parse(fs.readFileSync(databaseFilename));

    let length = dataObject.users.length;
    console.log(length)

    let obj = {
        address: [],
        balance: []
    }

    let index = 0;
    let bal;
    let addr;
    for (let i = 0; i < length; i++) {
        addr = dataObject.users[i];
        bal = await RUBY.balanceOf(addr).then(result => {
            return ethers.utils.formatUnits(result, 18);
        }).catch(err => {
            console.log(err.toString());
            return '0';
        })
        // ruby holders only
        if (Number(bal) > minAmountOfToken) {
            obj.address[index] = addr;
            obj.balance[index] = bal;
            console.log("UserID:" + i + " User Wallet: " + obj.address[index] + " Token Balance: " + obj.balance[index]);
            index++;
        }
    }

    // get all the addresses,  
    let res = await writeToJson(outputFileName, obj);

    return res;

}

async function createUserDatabase(startIndex, fileName, signer) {

    const contract = new ethers.Contract(nft_abi.address, nft_abi.abi, signer);
    const res5 = await contract.nftIds()
    // length of the TokenId's
    const length = Number(res5.toString())
    let objOutAddresses = {
        users: []
    }

    let index = 0;
    let addr;
    for (let i = startIndex; i < length; i++) {

        addr = await contract.ownerOf(i);
        objOutAddresses.users[index] = addr;
        index++;
        console.log(addr, index);

    }

    let res = await writeToJson(fileName, objOutAddresses)

    return res;
}

/*
async function writeTo(FILENAME, res) {
    let testThis = JSON.stringify(res)
    // Data input types
    // string, buffer, Typed Array, DataView, Object
    fs.writeFileSync(FILENAME, testThis);
    return "OK";
}
*/


async function writeTo(FILENAME, res) {
    console.log(res)
    const writer = csvWriter({
        separator: ',',
        newline: '\n',
        sendHeaders: true
    });
    writer.pipe(fs.createWriteStream(FILENAME))
    writer.write(res)
    writer.end()
}

async function writeToJson(FILENAME, res) {
    let testThis = JSON.stringify(res)
    fs.writeFileSync(FILENAME, testThis);
    return "OK";
}


module.exports.usersStakingRuby = usersStakingRuby;
module.exports.usersHoldingRuby = usersHoldingRuby;
module.exports.createUserDatabase = createUserDatabase;
module.exports.usersHoldingXYZ = usersHoldingXYZ;

module.exports.createTokenHiLo = createTokenHiLo;

module.exports.writeHistoricalTrades = writeHistoricalTrades;
module.exports.writeJsonFile = writeJsonFile;
module.exports.readJsonFile = readJsonFile;
module.exports.checkFileExists = checkFileExists;