const ethers = require('ethers');
const lottery = require('../ruby_modules/lottery.js');
const utils = require('../ruby_modules/users.js');

const CRED = require('../keys.json');
const CONSTANTS = require('../Constants.json');

const FILE_DEST_CURRENT_LOTTERY = 'server/data/currentLottery.json';    // contains data for the current lottery and updates accordingly
const FILE_DEST_LOTTERY = 'server/data/lottery.json';                   // contains all the lotteries and all their data

const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const walletOrigin = new ethers.Wallet(CRED.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const LOTTERY_FACTORY = CONSTANTS.project.lottery;

//init
// Save all lottery data to filename: lottery.json
async function getAllLotteries() {
    let res = await lottery.saveLotteryData(LOTTERY_FACTORY, accountOrigin, providerOrigin)

    const curr_time = await getBlockStamp().then(res => {
        return res;
    }).catch(err => {
        console.log("err", err)
    })

    res.lastUpdated = curr_time;
    if (typeof res !== 'undefined') {
        await utils.writeJsonFile(FILE_DEST_LOTTERY, res).then(res => {
            return res;
        }).catch(err => {
            console.log("Error : writeJsonFile ", err);
        })
    }

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

// set Interal 
let PREVENT_LOOP = false;
let LAST_LOTTERY_ADDRESS = '';
let CURRENT_DATE;
async function pollCurrentLottery() {

    // make the new data object.  
    let fileUpdated;

    if (!PREVENT_LOOP) {
        PREVENT_LOOP = true;
        CURRENT_DATE = new Date()
        // console.log("Time start: ", CURRENT_DATE)

        const current_lottery_address = await lottery.saveCurrentLotteryAddress(LOTTERY_FACTORY, accountOrigin).then(result => {
            return result;
        }).catch(err => {
            console.log("saveCurrentLotteryAddress Error : ", CURRENT_DATE, err)
        })

        if (typeof current_lottery_address === 'string') {
            // only do once
            // creates current lottery database
            if (current_lottery_address !== LAST_LOTTERY_ADDRESS) {
                //write current lottery data to a new file 
                let current_lottery = await lottery.getLotteryData(LOTTERY_FACTORY, current_lottery_address, accountOrigin, providerOrigin).then(result => {
                    return result;
                }).catch(err => {
                    console.log("getLotteryData Error : ", CURRENT_DATE, err)
                })

                let obj = {
                    lottery: current_lottery
                }

                let writeToCurrentLottery = await utils.writeJsonFile(FILE_DEST_CURRENT_LOTTERY, obj).then(result => {
                    return result;
                }).catch(err => {
                    console.log("writeJsonFile Error : ", CURRENT_DATE, err)
                })

                console.log("Write current lottery data file on init: ", writeToCurrentLottery);

                // set last_lottery to current lottery
                LAST_LOTTERY_ADDRESS = current_lottery_address;
                console.log("write CurrentLotteryAddress + Database: ", CURRENT_DATE)
            }

            fileUpdated = await isLastestLotteryOpen(current_lottery_address).then(result => {
                return result;
            }).catch(err => {
                console.log("isLastestLotteryOpen Error : ", CURRENT_DATE, err)
            })

        }

        if (typeof fileUpdated === 'undefined') {
            console.log("Polling lottery data Error");
            PREVENT_LOOP = false;
        }

        // RESET 
        const currentDate2 = new Date();
        const diff = (currentDate2 - CURRENT_DATE) / 1000;//ms to seconds
        console.log("Polling lottery data took (seconds) to complete: ", diff, fileUpdated);
        PREVENT_LOOP = false;
    } else {
        const _date = new Date();
        console.log("Waiting on async isLastestLotteryOpen(): Froze @ ", CURRENT_DATE, PREVENT_LOOP, _date);
    }

}


async function isLastestLotteryOpen(CURRENT_LOTTERY) {

    let winningNum;

    const data = await utils.readJsonFile(FILE_DEST_CURRENT_LOTTERY).then(result => {
        return result;
    }).catch(err => {
        console.log("writeJsonFile Error : ", err)
    })


    if (typeof data === 'undefined') {
        console.log("Error isLastestLotteryOpen: readJsonFile")
        return;
    }

    const isExist = data.lottery?.winningNumbers;

    if (typeof isExist === 'undefined') {
        return;
    }
    const wnLength = isExist?.length;

    // if json empty, update winning numbersvalues
    if (typeof isExist === 'string' && wnLength === 0) {
        // get winning numbers and update the json file
        // cant call this function unless isDrawn 
        const drawn = await lottery.isLotteryDrawn(CURRENT_LOTTERY, accountOrigin).then(result => {
            return result;
        }).catch(err => {
            console.log("Error: isLotteryDrawn : ", err)
        })

        if (drawn) {
            winningNum = await lottery.getLotteryWinningNumbers(CURRENT_LOTTERY, accountOrigin).then(result => {
                return result;
            }).catch(err => {
                console.log("Error: getLotteryWinningNumbers : ", err)
            })
        }

        if (typeof winningNum !== 'undefined') {
            data.lottery.winningNumbers = winningNum.toString();
            let ok = await utils.writeJsonFile(FILE_DEST_CURRENT_LOTTERY, data).then(result => {
                return result;
            }).catch(err => {
                console.log("Error: getLotteryWinningNumbers writeJsonFile: ", err)
            })
            console.log("WinningNumbers Updated: ", ok);
        }
    }

    const updated = await updateLottery().then(result => {
        return result;
    }).catch(err => {
        console.log("Error: updateLottery ", err)
    })

    return updated;

}

// update the current_lottery data: blockTimestamp, [sold, remains, raisedAmount]
async function updateLottery() {

    const blockTime = await getBlockStamp().then(result => {
        return result;
    }).catch(err => {
        console.log("updateLottery Error: ", err)
    })

    const data = await utils.readJsonFile(FILE_DEST_CURRENT_LOTTERY).then(result => {
        return result;
    }).catch(err => {
        console.log("Error: readJsonFile ", err)
    })

    const updateNew = await lottery.getCurrentLotteryDataV2(
        data.lottery.tokenAddress,
        data.lottery.lotteryAddress,
        accountOrigin
    ).then(result => {
        return result;
    }).catch(err => {
        console.log("Error: updateLottery: getCurrentLotteryDataV2 ", err)
    })

    if (typeof updateNew !== 'undefined') {

        const arrLength = updateNew.length;

        if (arrLength === 5) {
            data.lottery.ticketsSold = updateNew[0];
            data.lottery.ticketsRemain = updateNew[1];
            data.lottery.lotteryRaisedUSD = updateNew[2];
            data.lottery.lotteryOpen = updateNew[3];
            data.lottery.lotteryDrawn = updateNew[4];
            data.lottery.blockTimestamp = blockTime;
            data.lottery.lastUpdated = blockTime;
            //write updated object to file
            const ok = await utils.writeJsonFile(FILE_DEST_CURRENT_LOTTERY, data).then(result => {
                return result;
            }).catch(err => {
                console.log("Error: writeJsonFile ", err)
            })

            console.log("Current Lottery Ticket Sale Updated:", ok)
            return true;
        } else {

            data.lottery.lastUpdated = blockTime;
            //write updated object to file
            let ok = await utils.writeJsonFile(FILE_DEST_CURRENT_LOTTERY, data)
            console.log("Current Lottery Updated:", ok)

        }
    }

    return false;
}

async function run() {
    await getAllLotteries();

    setInterval(pollCurrentLottery, 15000 * 1)// 15 sec

}

run();