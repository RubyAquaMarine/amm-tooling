const ethers = require('ethers');
const lottery_abi = require('../abi/lotteryFactory.json');
const lotterysc_abi = require('../abi/lotteryContract.json');
const amm = require('../ruby_modules/amm.js');

const fileData = require('../ruby_modules/users.js');

async function getLotteryWinningNumbers(lotteryAddress, init_signer) {
    const contract = new ethers.Contract(lotteryAddress, lotterysc_abi, init_signer);
    const winningNumbers = await contract.getWinningNumbers().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryWinningNumbers error", err);
    })

    if (typeof winningNumbers === 'undefined') {
        return;
    }

    return winningNumbers;
}

//output object of all the addresses
// skip over the first index
async function saveLotteryAddresses(factoryAddress, init_signer) {
    const contract = new ethers.Contract(factoryAddress, lottery_abi, init_signer);
    const LOTTO_ID = await contract.getCurrentLottoryId().then(result => {
        return result;
    }).catch(err => {
        console.log("saveLotteryAddresses error", err);
    });

    if (typeof LOTTO_ID === 'undefined') {
        return;
    }


    // get past lottery addresses with the lottery_id .. loop extra. 
    let bob = [];
    for (let i = 1; i <= LOTTO_ID; i++) {
        bob[i - 1] = await contract.getLotto(i).then(result => {
            return result;
        }).catch(err => {
            console.log("saveLotteryAddresses error", err);

        });
    }
    return bob;
}


async function saveLotteryAddressesToFile(fileName, factoryAddress, init_signer) {
    const contract = new ethers.Contract(factoryAddress, lottery_abi, init_signer);
    const LOTTO_ID = await contract.getCurrentLottoryId().then(result => {
        return result;
    }).catch(err => {
        console.log("saveLotteryAddressesToFile error", err);
    });

    if (typeof LOTTO_ID === 'undefined') {
        return;
    }
    // get past lottery addresses with the lottery_id .. loop extra. 
    let bob = [];
    for (let i = 1; i <= LOTTO_ID; i++) {
        bob[i - 1] = await contract.getLotto(i).then(result => {
            return result;
        }).catch(err => {
            console.log("saveLotteryAddresses error", err);
        });
    }

    if (typeof bob === 'undefined') {
        return false;
    }

    let obj = {
        lottery: bob
    }

    let res = await fileData.writeJsonFile(fileName, obj).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeJsonFile ", err);
    })

    return res;
}

//2 rpc calls
async function saveCurrentLotteryAddress(factoryAddress, init_signer) {
    const contract = new ethers.Contract(factoryAddress, lottery_abi, init_signer);
    const LOTTO_ID = await contract.getCurrentLottoryId().then(result => {
        return result;
    }).catch(err => {
        console.log("saveCurrentLotteryAddress error", err);
    });

    if (typeof LOTTO_ID === 'undefined') {
        return;
    }

    let addr = await contract.getLotto(LOTTO_ID).then(result => {
        return result;
    }).catch(err => {
        console.log("saveCurrentLotteryAddress error", err);
    })

    return addr;
}

async function isLotteryOpen(lotteryAddress, init_signer) {
    const contract = new ethers.Contract(lotteryAddress, lotterysc_abi, init_signer);
    const isOpen = await contract.isOpened().then(result => {
        return result;
    }).catch(err => {
        console.log("isLotteryOpen error", err);
    });

    if (typeof isOpen === 'undefined') {
        return;
    }

    return isOpen;
}

async function isLotteryDrawn(lotteryAddress, init_signer) {
    const contract = new ethers.Contract(lotteryAddress, lotterysc_abi, init_signer);
    const isDrawn = await contract.isDrawn().then(result => {
        return result;
    }).catch(err => {
        console.log("isLotteryDrawn error", err);
    });

    if (typeof isDrawn === 'undefined') {
        return;
    }

    return isDrawn;
}

async function getLotteryEndTime(lotteryAddress, init_signer) {
    const contract = new ethers.Contract(lotteryAddress, lotterysc_abi, init_signer);
    const cts = await contract.getClosingTimestamp().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryEndTime error", err);
    });

    if (typeof cts === 'undefined') {
        return;
    }
    return Number(cts.toString());
}

async function getLotteryData(factoryAddress, address, init_signer, init_provider) {

    if (address == "0x0000000000000000000000000000000000000000") {
        return {
            lotteryID: '0',
            lotteryOpen: 'false',
            lotteryAddress: address,
            //more
            lotteryFactory: factoryAddress
        }
    }
    //
    const contract = new ethers.Contract(address, lotterysc_abi, init_signer);

    // let res1 = await contract.costToBuyTickets(1);
    // console.log("DEBUG1 costToBuy 1 Tickets ", res1.toString())
    const res2 = await contract.getBonusId().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });



    const res3 = await contract.getBonusNFT().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res4 = await contract.getClosingTimestamp().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res5 = await contract.getDistibution().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res6 = await contract.getID().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    // let res7 = await contract.getLotterySize();// number

    let res8 = await contract.getNftDescription().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    if (typeof res8 !== "undefined") {
        res8 = JSON.parse(res8);
        res8 = JSON.stringify(res8);
    }




    const resSold = await contract.getNumTicketsSold().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    let sold = '0';
    if (typeof resSold !== "undefined") {
        sold = resSold.toString();
    }


    const res9 = await contract.getTicketERC20().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res10 = await contract.getStartingTimestamp().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    let duration = 0;
    if (typeof res10 !== "undefined" && typeof res4 !== "undefined") {
        duration = res4.sub(res10);
    }

    const res11 = await contract.getTicketERC20Symbol().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    let tokenSymbol = '';
    if (typeof res11 === "string") {
        tokenSymbol = res11;
    }


    const res12 = await contract.getTicketPrice().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    let pricePerTicket = '';
    if (typeof res12 !== "undefined") {
        pricePerTicket = ethers.utils.formatUnits(res12, 18);
    }


    // let res13 = await contract.getTickets(account.address);// number ( input address)

    const res14 = await contract.getTicketsRemaining().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    // let res15 = await contract.getTotalRuby();// number

    const res19 = await contract.isClosed().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res20 = await contract.isDrawn().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    const res21 = await contract.isOpened().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });


    // if the Lottery has ended AND the drawn == true, get the winning numbers
    let res17 = [];
    if (res19 === true && res20 === true) {
        res17 = await contract.getWinningNumbers().then(result => {
            return result;
        }).catch(err => {
            console.log("getLotteryData error", err);
        });
    }

    const res18 = await contract.hasNFTPrize().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });


    let res16 = await contract.getVisualAppearance().then(result => {
        return result;
    }).catch(err => {
        console.log("getLotteryData error", err);
    });

    if (typeof res16 !== "undefined") {
        res16 = JSON.parse(res16);
        res16 = JSON.stringify(res16);
    }

    // time 
    let durationInMinutes;
    if (typeof duration !== "undefined") {
        durationInMinutes = duration.div(60).toString();
    }

    const price = await amm.getTokenPriceFromSymbol(res9, init_signer).then(result => {
        return result;
    }).catch(err => {
        console.log("Error getTokenPriceFromSymbol", err);
    });

    if (typeof price !== 'number') {
        console.log('Error getTokenPriceFromSymbol: ')
        return;
    }

    const coinsCollected = Number(pricePerTicket) * Number(sold);

    const raisedAmount = coinsCollected * price;// USD Value

    const blockNumber = await init_provider.getBlockNumber().then(result => {
        return result;
    }).catch(err => {
        console.log("getBlockNumber error", err);
    });

    const blockData = await init_provider.getBlock(blockNumber).then(result => {
        return result;
    }).catch(err => {
        console.log("getBlock error", err);
    });

    const blockTime = blockData.timestamp;

    //check_aqua : bug.md 135
    const obj = {
        lotteryID: res6.toString(),
        lotteryOpen: res21,
        lotteryDrawn: res20,
        lotteryAddress: address,
        lotteryRaisedUSD: raisedAmount.toString(),
        lotteryDuration: durationInMinutes,
        ticketPriceInCoins: pricePerTicket,
        ticketsSold: sold,
        ticketsRemain: res14.toString(),
        ticketsSoldIn: tokenSymbol,
        tokenAddress: res9,
        lotteryClosingTimestamp: Number(res4.toString()),
        nft: {
            prizeExist: res18,
            id: res2.toString(),
            address: res3,
            description: res8,
            visualAppearance: res16
        },
        prizeDistribution: res5.toString(),
        winningNumbers: res17.toString(),
        blockTimestamp: blockTime
    }

    return obj;
}


async function getCurrentLotteryDataV2(tokenAddress, lotteryAddress, init_signer) {

    if (typeof tokenAddress !== 'string') {
        console.log('getCurrentLotteryData: Address empty')
        return;
    }

    const contract = new ethers.Contract(lotteryAddress, lotterysc_abi, init_signer);

    const allPromise = Promise.all([

        contract.getNumTicketsSold().then(result => {
            return result;
        }).catch(err => {
            console.log("getNumTicketsSold error", err);
        }),

        contract.getTicketPrice().then(result => {
            return result;
        }).catch(err => {
            console.log("getTicketPrice error", err);
        }),

        contract.getTicketsRemaining().then(result => {
            return result;
        }).catch(err => {
            console.log("getTicketsRemainingerror", err);
        }),

        amm.getTokenPriceFromSymbol(tokenAddress, init_signer).then(result => {
            return result;
        }).catch(err => {
            console.log("getTokenPriceFromSymbol error", err);
        }),

        contract.isOpened().then(result => {
            return result;
        }).catch(err => {
            console.log("isOpened error", err);
        }),
        
        contract.isDrawn().then(result => {
            return result;
        }).catch(err => {
            console.log("isDrawn error", err);
        })

    ]);

    const res = await allPromise.then(values => {
        values; // [valueOfPromise1, valueOfPromise2, ...]
        return values;
    }).catch(error => {
        console.log("getCurrentLotteryDataV2 promise.all.error", error)
        return;  // rejectReason of any first rejected promise
    });

    if (typeof res === 'undefined') {
        return [0];
    }

    const sold = Number(res[0].toString());
    const ticket_price = Number(ethers.utils.formatUnits(res[1], 18));
    const ticket_remains = Number(res[2].toString());
    const token_price = Number(res[3]);
    const isOpen = res[4];
    const isDrawn = res[5];
    const coinsCollected = ticket_price * sold;
    const raisedAmount = coinsCollected * token_price;// USD Value
    return [sold, ticket_remains, raisedAmount, isOpen, isDrawn]
}

async function saveLotteryData(lotteryAddress, init_signer, init_provider) {
    const contract = new ethers.Contract(lotteryAddress, lottery_abi, init_signer);
    const LOTTO_ID = await contract.getCurrentLottoryId().then(result => {
        return result;
    }).catch(err => {
        console.log("saveLotteryData error", err)
        return;
    });

    if (typeof LOTTO_ID === 'undefined') {
        return;
    }

    const loop = Number(LOTTO_ID.toString());

    console.log("Lottery Total: ", loop);

    let addr = [];
    let data = [];
    // get past lottery addresses with the lottery_id .. loop extra. 
    for (let i = 0; i <= loop; i++) {
        console.log("LOTTERY_ID:", i);
        addr[i] = await contract.getLotto(i).then(result => {
            return result;
        }).catch(err => {
            console.log("saveLotteryData error", err)
            return;
        });

        if (typeof addr[i] === 'undefined') {
            return;
        }

        console.log("LOTTERY_ADDR:", addr[i]);
        data[i] = await getLotteryData(lotteryAddress, addr[i], init_signer, init_provider).then(result => {
            return result;
        }).catch(err => {
            console.log("saveLotteryData:getLotteryData error", err)
            return;
        });
    }

    // correct format for writing to file
    const obj = {
        lottery: data
    }
    return obj;
}


module.exports.isLotteryOpen = isLotteryOpen;
module.exports.isLotteryDrawn = isLotteryDrawn;

module.exports.getLotteryEndTime = getLotteryEndTime;
module.exports.getLotteryData = getLotteryData;
module.exports.getCurrentLotteryDataV2 = getCurrentLotteryDataV2;
module.exports.getLotteryWinningNumbers = getLotteryWinningNumbers;

module.exports.saveLotteryAddresses = saveLotteryAddresses;
module.exports.saveLotteryAddressesToFile = saveLotteryAddressesToFile;
module.exports.saveCurrentLotteryAddress = saveCurrentLotteryAddress;
module.exports.saveLotteryData = saveLotteryData;

