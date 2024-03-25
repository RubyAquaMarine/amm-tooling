const ethers = require('ethers');
const stakeABI = require('../abi/rubyStaker.json');
const config = require('../setConfig.json');
const rpcUrl = config.rpc.schainEuropa;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const stakeContractAddress = config.amm.stake;

// USER SC CALLS

async function viewRewards(address) {

    let total_supply = 0;
    let locked_supply = 0;
    let user_fees_pen = 0;
    let user_fees_amm = 0;

    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
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

    //rewards
    //https://github.com/RubyExchange/backend/blob/master/contracts/RubyStaker.sol#L93
    // learn how to use.. what address to pass in? masterchef
    // let rew = await stakeContract.rewards(config.ammv2.masterchef, 0).then(transaction => {
    //     console.log("Rewards:  ", ethers.utils.formatUnits(transaction, 18))
    // }).catch(err => {
    //     console.log("error:", err)
    //  })

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


    // Object returned
    // Address and claimable amount of all reward tokens for the given account
    let res = await stakeContract.claimableRewards(address).then(transaction => {
        console.log("ClaimableRewards: ", transaction.toString())
    }).catch(err => {
        console.log("error:", err)
    })

    // Single Value returned
    // Total balance of an account, including unlocked, locked and earned tokens
    let userTotalSupply = await stakeContract.totalBalance(address).then(transaction => {
        console.log("User Total Balance  ", ethers.utils.formatUnits(transaction, 18))
        return transaction
    }).catch(err => {
        console.log("error:", err)
    })


    console.log("User Total Percentage Share  ", ethers.utils.formatUnits(userTotalSupply, 18) / ethers.utils.formatUnits(totalSupply, 18))


    // Single Value returned
    // Total withdrawable balance for an account to which no penalty is applied
    let res3 = await stakeContract.unlockedBalance(address).then(transaction => {
        console.log("Available RUBY in Unlocked Staking: ", ethers.utils.formatUnits(transaction, 18))
    }).catch(err => {
        console.log("error:", err)
    })


    //Object returned
    // Information on the "earned" balances of a user
    // Earned balances may be withdrawn immediately for a 50% penalty
    let res4 = await stakeContract.earnedBalances(address).then(transaction => {
        console.log("Earned Rewards Available:  ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })

    //Object returned
    // Information on a user's locked balances
    let user_balance = await stakeContract.lockedBalances(address).then(transaction => {
        return transaction
    }).catch(err => {
        console.log("error:", err)
    })
    console.log("Total Balance:  ", ethers.utils.formatUnits(user_balance?.total, 18))
    console.log("Unlockable Balance:  ", ethers.utils.formatUnits(user_balance?.unlockable, 18))
    console.log("Locked Balance:  ", ethers.utils.formatUnits(user_balance?.locked, 18))
    console.log("Locked Balance Data:  ", user_balance?.lockData)

    //Object returned
    // returns amount and penalty amount
    // Final balance received and penalty balance paid by user upon calling exit
    let res6 = await stakeContract.withdrawableBalance(address).then(transaction => {
        return transaction
    }).catch(err => {
        console.log("error:", err)
    })

    console.log("Withdrawal Balance Amount: ", ethers.utils.formatUnits(res6?.amount, 18))
    console.log("Withdrawal Balance Penalty Amount: ", ethers.utils.formatUnits(res6?.penaltyAmount, 18))



}

//Claim all of the above UI : Claim All() 
// Claim all pending staking rewards , this takes the 50% Penalty, and it removes the UNLOCKED RUBY (staked) from contract
async function exitAll() {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    let res = await stakeContract.exit().then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
    console.log(" REMOVED ALL UNLOCKED RUBY AND CLAIMED FARMING REWARDS (50% penalty)")
}

// All Claimable Fees UI: ClaimALL
// collects the rewards from LOCKED RUBY aka penalty  fees 
// collects the rewards from AMM FEES
async function getRewardsFromRubyStaker() {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    console.log("<-----------CLAIM REWARDS----------->")
    await stakeContract.getReward().then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}


async function withdrawlExpiredRubyLocked() {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    await stakeContract.withdrawExpiredLocks().then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })

}


// UI still needs to add functionality 
//https://github.com/RubyExchange/frontend/issues/232
// This function does not claim any rewards. 
async function withdrawUnlockedRUBY(amount) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    const send_amount = ethers.utils.parseUnits(amount, 18);
    await stakeContract.withdraw(send_amount).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}


// LOCKED RUBY ADD staking 
async function addLockedRUBY(amount) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    const send_amount = ethers.utils.parseUnits(amount, 18);
    await stakeContract.stake(send_amount, true).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

// UNLOCKED RUBY ADD staking
async function addUnlockedRUBY(amount) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    const send_amount = ethers.utils.parseUnits(amount, 18);
    await stakeContract.stake(send_amount, false).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

// ADMIN CALLS

// RUBY TOKEN ADDRESS AND MASTERCHEF CONTRACT
// KEEP in mind that there is a MAXIMUM AMOUNT of reward tokens that can be added 
// numRewards++ and MAX == 9
// in what scenario do we have more than one rewardToken?
async function addTokenForReward(rewardToken, distAddress) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    await stakeContract.addReward(rewardToken, distAddress).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

/*
 "inputs": [
        {
          "internalType": "uint256",
          "name": "_rewardId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_distributor",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_approved",
          "type": "bool"
        }
      ],
*/
// Modify approval for an address to call notifyRewardAmount
// Reward ID must be > 0 
async function approveRewardDistributor(id, distAddress) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);
    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    let nonceTx = await account.getTransactionCount("latest");
    console.log("Nonce: ", nonceTx);

    await stakeContract.approveRewardDistributor(id, distAddress, true).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

//recoverERC20(address tokenAddress, uint256 tokenAmount) 
async function recoverERC20(address, amount) {
    const stakeContract = new ethers.Contract(stakeContractAddress, stakeABI, account);

    await stakeContract.recoverERC20(address, amount).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}



async function run() {
    await viewRewards(account.address)
    //  await exitAll();
    await getRewardsFromRubyStaker();
    //  await withdrawlExpiredRubyLocked();
    //  await withdrawUnlockedRUBY('1');

    //  await addLockedRUBY('1') 
    //  await addUnlockedRUBY('1') 


    // ADMIN SETTING 
    // await adminControls();
}

async function adminControls() {
    //  await addTokenForReward(config.assets['fancy-rasalhague'].RUBY, config.amm.masterchef)
    //  await approveRewardDistributor(1, config.amm.masterchef)
    //  const send_amount = ethers.utils.parseUnits("2", 18);
    // await recoverERC20(config.assets['fancy-rasalhague'].USDP, send_amount)
}

run();

/*
 // Withdraw full unlocked balance and claim pending rewards
    function exit() external updateReward(msg.sender) {
        (uint256 amount, uint256 penaltyAmount) = withdrawableBalance(msg.sender);
        delete userEarnings[msg.sender];
        Balances storage bal = balances[msg.sender];
        bal.total = bal.total.sub(bal.unlocked).sub(bal.earned);
        bal.unlocked = 0;
        bal.earned = 0;

        totalSupply = totalSupply.sub(amount.add(penaltyAmount));
        rubyToken.safeTransfer(msg.sender, amount);
        if (penaltyAmount > 0) {
            _notifyReward(0, penaltyAmount);
        }
        getReward();
    }
*/
