const ethers = require('ethers');
const rewarderABI = require('../abi/simpleRewarder.json');
const stakerABI = require('../abi/rubyStaker.json');
const chefABI = require('../abi/rubyMasterChef.json');
const makerABI = require('../abi/rubyMaker.json');
const factoryABI = require('../abi/factory.json');
const erc20ABI = require('../abi/erc20.json');
const pairABI = require('../abi/pair.json');
const utils = require('./utils.js')

// USER SC CALLS

async function viewRewardsAPR(stakerAddress, account) {
    const stakeContract = new ethers.Contract(stakerAddress, stakerABI, account);


    const lockedSupply = await stakeContract.lockedSupply().then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("viewRewardsAPR: lockedSupply: Error:", err);
    })

    const locked_supply = Number(ethers.utils.formatUnits(lockedSupply, 18));

    // console.log("locked_supply:", locked_supply);


    const totalSupply = await stakeContract.totalSupply().then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("error:", err);
    })

    const total_supply = Number(ethers.utils.formatUnits(totalSupply, 18));

    // console.log("total_supply:",  total_supply);


    const staked = total_supply - locked_supply;

    let obj = [];

    for (let i = 0; i < 2; i++) {
        const a = await stakeContract.rewardData(i).then(transaction => {
            return transaction;
        }).catch(err => {
            console.log("error:", err);
        })

        console.log("RubyStaker: ", i, a, a.toString());

        const rate = ethers.utils.formatUnits(a.rewardRate.toString(), 18);
        const reward = ethers.utils.formatUnits(a.rewardPerTokenStored.toString(), 18);
        const finish = new Date(a.periodFinish * 1000)

        console.log('time', finish, finish.toString())

        obj[i] = {
            rewardRate: rate,
            rewardStored: reward,
            end: finish
        }
    }

    // reformat
    // is index 0 locked and index 1 unlocked? 
    let out = {
        locked_total: locked_supply,
        locked_rate: obj[0].rewardRate,
        staked_total: staked,
        staked_rate: obj[1].rewardRate,
        locked_reward: obj[0].rewardStored,
        staked_reward: obj[1].rewardStored,
        locked_endDate: obj[0].end,
        staked_endDate: obj[1].end
    }



    let annLockedReward = parseFloat(out.locked_rate) * 86400 * 365;
    let annUnLockedReward = parseFloat(out.staked_rate) * 86400 * 365;

    const aprLocked = (annLockedReward / out.locked_total) * 100;
    const aprStaked = (annUnLockedReward / out.staked_total) * 100;

    console.log("RubyStaker: ", out)
    console.log("Locked: ", annLockedReward, aprLocked)
    console.log("Staked: ", annUnLockedReward, aprStaked)


    return [aprLocked, aprStaked];
}

async function viewRubyStakerRewards(stakerAddress, address, account) {

    let total_supply = 0;
    let locked_supply = 0;
    let user_fees_pen = 0;
    let user_fees_amm = 0;

    const stakeContract = new ethers.Contract(stakerAddress, stakerABI, account);
    const totalSupply = await stakeContract.totalSupply().then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("error:", err);
    })

    total_supply = Number(ethers.utils.formatUnits(totalSupply, 18));

    const lockedSupply = await stakeContract.lockedSupply().then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("error:", err);
    })

    locked_supply = Number(ethers.utils.formatUnits(lockedSupply, 18));

    //userRewardPerTokenPaid
    const paidOut = await stakeContract.userRewardPerTokenPaid(address, 0).then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("error:", err);
    })

    const paidOut1 = await stakeContract.userRewardPerTokenPaid(address, 1).then(transaction => {
        return transaction;
    }).catch(err => {
        console.log("error:", err);
    })

    user_fees_pen = Number(ethers.utils.formatUnits(paidOut, 18));
    user_fees_amm = Number(ethers.utils.formatUnits(paidOut1, 18));

    let obj = {
        total: total_supply,
        locked: locked_supply,
        penalties: user_fees_pen,
        amm: user_fees_amm
    }

    console.log(obj)

    return obj;


}

// if I can pass in the lp token total supply I can reduce 1 rpc call - ENHANCE
async function getLPTokenValue(tvl, lpTokenAddress, userAddress, account) {

    const contract = new ethers.Contract(lpTokenAddress, pairABI, account)

    const totalSupply = await contract.totalSupply().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const userBalanceOfLP = await contract.balanceOf(userAddress).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const userBalance = Number(ethers.utils.formatUnits(userBalanceOfLP, 18));// all LP TOKENS are the same
    // the proper fix would be to normalize the incoming data.. and if its not the right format
    // ss data is not in correct format therefore 
    //
    let objectFarm;
    if (tvl>0) {
        const ts = Number(ethers.utils.formatUnits(totalSupply, 18));// all LP TOKENS are the same
        const tryLPTokenPrice = tvl / ts;
        if(userBalance > 0 && tryLPTokenPrice > 0){
            const farmTVL = userBalance * tryLPTokenPrice;
            objectFarm = {
                lpTokenPrice: tryLPTokenPrice,
                userSupply: userBalance,
                userTVL: farmTVL
            }
        }else{
            objectFarm = {
                lpTokenPrice: 0,
                userSupply: userBalance,
                userTVL: 0
            }
        }
    } else {
        objectFarm = {
            userSupply: userBalance,
        }
    }


    if (objectFarm.userSupply) {
        return objectFarm
    } else {
        return 'error in rewarder/getLPTokenValue '
    }
}

// returns the reserves,  LP token Price, and Total LP Token Supply
// 2 rpc
async function getFarmTVL(tvl, lpTokenAddress, rubyMasterChef, account) {

    if (typeof tvl === 'number' && typeof lpTokenAddress === 'string' && typeof rubyMasterChef === 'string') {

        const contract = new ethers.Contract(lpTokenAddress, pairABI, account)

        const totalSupply = await contract.totalSupply().then(result => {
            return result;
        }).catch(err => {
            console.log("Error: getFarmTVL : totalSupply: ", err)
        });

        if (typeof totalSupply === 'undefined') {
            console.log("Error: getFarmTVL : totalSupply: ")
            return;
        }

        const masterChefBalanceOfLP = await contract.balanceOf(rubyMasterChef).then(result => {
            return result;
        }).catch(err => {
            console.log("Error: getFarmTVL : balanceOf: ", err)
        });

        if (typeof masterChefBalanceOfLP === 'undefined') {
            console.log("Error: getFarmTVL : balanceOf: ")
            return;
        }

        let msb = Number(ethers.utils.formatUnits(masterChefBalanceOfLP, 18));
        let ts = Number(ethers.utils.formatUnits(totalSupply, 18));

        const tryLPTokenPrice = tvl / ts;

        const reCalcTVL = tryLPTokenPrice * ts;

        const farmTVL = msb * tryLPTokenPrice;

        let objectFarm = {
            totalSupply: ts,
            lpTokenPrice: tryLPTokenPrice,
            ammTVL: reCalcTVL,
            farmTVL: farmTVL
        }

        return objectFarm
    } else {
        console.log("Error: getFarmTVL", tvl, lpTokenAddress, rubyMasterChef);
        return;
    }
}

// ANY EOA can call this function after RubyMaker has Burn Permission
async function convertLPtoRuby(redeem, usdpAddress, xyzAddress, rubyMakerAddress, account, provider) {
    const makerContract = new ethers.Contract(rubyMakerAddress, makerABI, account);

    // check burn percent
    let testBurnPercent = await makerContract.burnPercent()
    console.log(" Burn Percentage: ", testBurnPercent.toString())

    let factoryAddress = await makerContract.factory()

    // do lp tokens exist? 
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    const XYZUSDP = await factoryContract.getPair(usdpAddress, xyzAddress)

    if (XYZUSDP) {
        console.log(" LP Address", XYZUSDP)
    }

    // token
    const tokenContract = new ethers.Contract(XYZUSDP, erc20ABI, account);
    let balance = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance.toString())

    // approve token transfer? of factory i think in order to burn the lp token
    // await doApproval(balance, XYZUSDP, factoryRegistered) 
    const nonce = await account.getTransactionCount("latest");
    const gas_try = await provider.getGasPrice();
    let try_string = gas_try.toString();

    const tx_block = {
        "gasPrice": try_string,
        "gasLimit": "9900000",
        "nonce": nonce
    }

    if (redeem) {

        let swap = await makerContract.convert(xyzAddress, usdpAddress, tx_block).then(result => {
            // console.log(result);
            return result
        }).catch(err => {
            //  console.log(err);
        })

        await swap.wait(1).then(result => {

        }).catch(err => {

        })


    }

    let balance2 = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance2.toString())
    let withdrawNext = false
    if (balance.eq(balance2)) {
        console.log("RubyMaker LP Conversion Failed")
        withdrawNext = true
    } else {
        console.log("RubyMaker LP Conversion Passed")
    }

    /* Back up plan, withdraw the LP tokens
    if (withdrawNext) {
        //withdrawLP
        let swap = await makerContract.withdrawLP(XYZUSDP).then(result => {
            // console.log(result);
            return result
        }).catch(err => {
            //  console.log(err);
        })

    }
    */

}


async function findFarmPoolShare(lpTokenAddress, masterchefAddress, account) {

    const contract = new ethers.Contract(masterchefAddress, chefABI, account);

    const farmPoolLength = await contract.poolLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    if (typeof farmPoolLength === 'undefined') {
        console.log("bug in findFarmPoolShare ")
        return;
    }

    let rubyPerSecond = await contract.rubyPerSec().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const allo = await contract.totalAllocPoint().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    // 1 block per second ( just for calculations)
    const BLOCKS_PER_DAY = 86400;
    let normR = Number(ethers.utils.formatEther(rubyPerSecond));
    const REWARD_PER_BLOCK = normR
    const RUBY_PER_DAY = BLOCKS_PER_DAY * REWARD_PER_BLOCK;

    //loop, find, matching lpAddress , return values in object
    let sharePool;
    let rubyPerYear;
    let rubyPerDay;
    let rewardTokenSymbol;
    let rewardTokenAddress;
    let rewarder_address;
    let remainingDay = 0;
    let rewardPerDay = 0;
    let rewardPerYear;
    let rewardBalance;
    let rewardMintRate;
    let savePoolID;

    for (let i = 0; i < farmPoolLength; i++) {

        const value3 = await contract.poolInfo(i).then(result => {
            return result;
        }).catch(err => {
            console.log("poolInfo Error: ", err)
        })

        if (typeof value3 === 'undefined') {
            console.log("findFarmPoolShare poolInfo Error: ")
            break;
        }

        if (typeof value3?.lpToken === 'string') {

            const lpT = value3.lpToken;
            const aP = Number(value3.allocPoint.toString())

            if (typeof aP === 'number') {
                // only return values if LP token Address matches and has allocation Points
                if (lpT == lpTokenAddress && aP > 0) {
                    savePoolID = i;
                    rewarder_address = value3.rewarder;
                    sharePool = aP / allo;
                    // RUBY ALLOCATION PER POOL
                    rubyPerDay = RUBY_PER_DAY * sharePool;
                    rubyPerYear = rubyPerDay * 365;


                    if (rewarder_address === masterchefAddress) {
                        console.log('MASTERCHEF == IS REWARDER ADDRESS', value3)
                    }


                    // Dual Rewarder contract exists
                    if (rewarder_address != '0x0000000000000000000000000000000000000000' && rewarder_address != masterchefAddress) {

                        const rewardContract = new ethers.Contract(rewarder_address, rewarderABI, account);

                        rewardTokenAddress = await rewardContract.rewardToken().then(result => {
                            return result;
                        }).catch(err => {
                            console.log(err)
                        })

                        if (typeof rewardTokenAddress === 'undefined') {
                            console.log("Error: findFarmPoolShare rewardToken() Error: ")
                            break;
                        }

                        const mintRate = await rewardContract.tokenPerSec().then(result => {
                            return result;
                        }).catch(err => {
                            console.log(err)
                        }) //wei amount

                        let notWeiMintRate = ethers.utils.formatUnits(mintRate, 18)// normalize  to string
                        let normMintRate = Number(ethers.utils.formatUnits(mintRate, 18))// normalize to number

                        // get the Reward token(SKL or USDP)
                        // and check the balance of the Dual rewarder contract 
                        const tokenContract = new ethers.Contract(rewardTokenAddress, erc20ABI, account);

                        rewardTokenSymbol = await tokenContract.symbol().then(result => {
                            return result;
                        }).catch(err => {
                            console.log(err)
                        })
                        const balanceOf = await tokenContract.balanceOf(rewarder_address).then(result => {
                            return result;
                        }).catch(err => {
                            console.log(err)
                        })
                        const dec = await tokenContract.decimals().then(result => {
                            return result;
                        }).catch(err => {
                            console.log(err)
                        })

                        const notWeibalanceOf = Number(ethers.utils.formatUnits(balanceOf, dec));


                        rewardMintRate = normMintRate;
                        rewardBalance = notWeibalanceOf;

                        let mintedDaily = ethers.utils.parseUnits(notWeiMintRate, 18)// string to big
                        mintedDaily = mintedDaily.mul(86400)

                        let notWeimintedDaily = Number(ethers.utils.formatUnits(mintedDaily, 18))// big value to string
                        rewardPerDay = notWeimintedDaily;
                        let mintedPerYear = notWeimintedDaily * 365;
                        rewardPerYear = mintedPerYear;

                        // days left until rewards are empty
                        if (typeof balanceOf !== 'undefined' && typeof mintRate !== 'undefined') {
                            if (balanceOf.gte(1) && mintRate.gte(1)) {
                                const calc_remainingDay = balanceOf.div(mintRate.mul(86400));
                                remainingDay = Number(calc_remainingDay.toString());
                                console.log("Dual Rewards run out in # of Days ", calc_remainingDay.toString());
                            }// else
                            //dual rewards not activated yet 
                            // mintRate == 0

                        }

                    }
                    break;// break the loop, we found the needed pool data
                }
            }
        }
    }

    // only return farm object if exists
    if (typeof savePoolID === 'number') {
        const objectReward = {
            poolID: savePoolID,
            poolAddress: lpTokenAddress,
            poolRubyPerDay: rubyPerDay,
            poolRubyPerYear: rubyPerYear,
            poolShare: sharePool,
            // Dual Rewards
            poolDualRewardAdress: rewarder_address,
            poolDualRewardPerDay: rewardPerDay,
            poolDualRewardPerYear: rewardPerYear,
            poolDualRewardEnds: remainingDay,
            poolDualRewardToken: rewardTokenSymbol,
            poolDualRewardTokenAddress: rewardTokenAddress,
            poolDualRewardBalance: rewardBalance,
            poolDualRewardMintRate: rewardMintRate
        }

        return objectReward;

    }

}

async function getRubyPerSecond(masterchefAddress, account) {
    const contract = new ethers.Contract(masterchefAddress, chefABI, account);
    let ruby = await contract.rubyPerSec().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    let norm = ethers.utils.formatUnits(ruby, 18)
    return norm;
}

async function ClaimFarmRewards(pool_id, masterchefAddress, account) {
    const contract = new ethers.Contract(masterchefAddress, chefABI, account);
    let res = await contract.deposit(pool_id, 0).then(result => {
        let res2 = result.wait(1);
        console.log(res2)
    }).catch(err => {
        console.log(err)
    })
}

// setRewardMinter on the Ruby Staker contract = set to masterchef address

async function setStakerRewardMinter(stakerAddress, masterchefAddress, account) {

    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    let res = await stakerContract.setRewardMinter(masterchefAddress).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log("RubyStaker has a new minter Address: ", res)

}

async function withdrawExpiredLocks(stakerAddress, account) {
    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    let test = await stakerContract.withdrawExpiredLocks().then(result => {
        return result;
    }).catch(err => {
        console.log("withdrawExpiredLocks", err)
    })

    let res = await test.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log("withdrawExpiredLocks", err)
    })

    const hash = res?.logs[0].transactionHash
    console.log("RubyStaker withdrawExpiredLocks : ", hash);

    return hash;
}

async function getAMMRewards(stakerAddress, account) {
    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    const test = await stakerContract.getReward().then(result => {
        return result;
    }).catch(err => {
        console.log("getAMMRewards", err)
    })

    let res = await test.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log("getAMMRewards", err)
    })

    const hash = res?.logs[0].transactionHash
    console.log("RubyStaker released Rewards : ", hash);

    return hash;

}

async function claimWithPenaltyAndUnlocked(stakerAddress, account) {
    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    let test = await stakerContract.exit().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    let res = await test.then(result => {
        return result
    }).catch(err => {
        console.log(err)
    })
    let res2 = res.wait(1);
    console.log("RubyStaker released rewards and unlocked RUBY => Restake: ", res2)
}
// return amount
async function getPenaltyAndUnlocked(stakerAddress, account) {
    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);

    //returns promise
    let test = stakerContract.callStatic.exit().then(result => {
        console.log(result)
        return result;
    }).catch(err => {
        console.log(err)
    })
    //resolve
    let res = await test.then(result => {
        return result
    }).catch(err => {
        console.log(err)
    })
    console.log("static: RubyStaker released rewards and unlocked RUBY => Restake: ", res)
    //  let res2 = res.wait(1);
    // console.log("static: RubyStaker released rewards and unlocked RUBY => Restake: ", res2)
}

async function stakeUnlockedRuby(amount, stakerAddress, account) {
    let amountNew = ethers.utils.parseEther(amount)
    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    let test = stakerContract.stake(amountNew, false).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log("RubyStaker: Staking in UnlockedRUBY", test)
}

async function reportRubyStaker(stakerAddress, account) {

    const stakerContract = new ethers.Contract(stakerAddress, stakerABI, account);
    let totalSupply = await stakerContract.totalSupply()                        // Total Supply of RUBY locked within the contract
    let lockedTotalSupply = await stakerContract.lockedSupply()
    let value = ethers.utils.formatUnits(totalSupply, 18)
    let value1 = ethers.utils.formatUnits(lockedTotalSupply, 18)
    let locked = parseFloat(value1);
    let staked = parseFloat(value) - locked;

    // total , locked
    return [locked, staked]

}

function returnString(bigValue) {
    let value = ethers.utils.formatUnits(bigValue, 18)
    return value;
}

//recoverERC20(address tokenAddress, uint256 tokenAmount) 
async function recoverERC20fromStaker(address, amount, account) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);

    await stakeContract.recoverERC20(address, amount).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

//utils
module.exports.viewRewardsAPR = viewRewardsAPR;
module.exports.viewRubyStakerRewards = viewRubyStakerRewards;
module.exports.reportRubyStaker = reportRubyStaker;
module.exports.getRubyPerSecond = getRubyPerSecond;
//rewards
module.exports.convertLPtoRuby = convertLPtoRuby;
module.exports.ClaimFarmRewards = ClaimFarmRewards;
module.exports.claimWithPenaltyAndUnlocked = claimWithPenaltyAndUnlocked;
module.exports.stakeUnlockedRuby = stakeUnlockedRuby;
module.exports.getPenaltyAndUnlocked = getPenaltyAndUnlocked;
module.exports.withdrawExpiredLocks = withdrawExpiredLocks;
module.exports.getAMMRewards = getAMMRewards;
//apy tvl, farm 
module.exports.getFarmTVL = getFarmTVL;
module.exports.findFarmPoolShare = findFarmPoolShare;
module.exports.getLPTokenValue = getLPTokenValue;
//admin
module.exports.recoverERC20fromStaker = recoverERC20fromStaker;
module.exports.setStakerRewardMinter = setStakerRewardMinter;

