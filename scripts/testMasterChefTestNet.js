
const chefABI = require('../abi/rubyMasterChef.json');
const lp_pairABI = require('../abi/pair.json');
const lp_erc20ABI = require('../abi/erc20.json');
const rewarderABI = require('../abi/simpleRewarder.json');

const ethers = require('ethers');
const approv = require('./doApproval.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);// change to privateKeyAdmin when using function makePool()
const account = walletOrigin.connect(providerOrigin);

const address = account.address;
const chefAddress = config.ammv2.masterchef;
const chefContract = new ethers.Contract(chefAddress, chefABI, account);

// approve the transfer
async function approveTransfer(swapAmount, fromToken, destAddress) {
  let test = await approv.Approval(swapAmount, fromToken, destAddress, account).then(res => {
    return res;
  }).catch(err => {

  })
  console.log(test)
}

async function withdrawALL() {
  console.log("BEGIN TO WITHDRAWAL ALL ")
  let count = await chefContract.poolLength();
  let loop = Number(count.toString());
  for (let i = 0; i < loop; i++) {
    console.log("BEGIN TO WITHDRAWAL ALL ON POOL ID: " + i)
    let value6 = await chefContract.emergencyWithdraw(i).then(result => {
      return result.wait(1)
    }).catch(err => {
      console.log("error:", err)
    })
  }
}

async function withdrawTest() {
  console.log("BEGIN TO WITHDRAWAL TEST ")
  const send_amount = ethers.utils.parseUnits("1", 'ether');
  let count = await chefContract.poolLength();
  let loop = Number(count.toString());

  for (let i = 0; i < loop; i++) {
    let value6 = await chefContract.withdraw(i, send_amount).then(result => {
      return result.wait(1)
    }).catch(err => {
      console.log("error:", err)
    })
  }
}

async function depositToPool(amount, pool_id) {
  console.log("BEGIN TO DEPOSIT ")
  const send_amount = ethers.utils.parseUnits(amount, 'ether');
  let value3 = await chefContract.poolInfo(pool_id);
  let LPtoken = value3.lpToken;
  await approveTransfer(send_amount, LPtoken, chefAddress)
  let value6 = await chefContract.deposit(pool_id, send_amount).then(result => {    //  updatePool(_pid); is triggered within the deposit Function
    return result.wait(1)
  }).catch(err => {
    console.log("depositToPool:", err)
  })
}

async function depositNow(amount) {
  console.log("BEGIN TO DEPOSIT ")
  // For Deposit wil pool ID 
  let count = await chefContract.poolLength();
  let loop = Number(count.toString());

  for (let i = 0; i < loop; i++) {
    const send_amount = ethers.utils.parseUnits(amount, 'ether');
    // Get Pool Info for the Rewarder Contract Details
    let value3 = await chefContract.poolInfo(i);
    let LPtoken = value3.lpToken
    console.log("LP Token Address:", LPtoken)
    await approveTransfer(send_amount, LPtoken, chefAddress)
    let value6 = await chefContract.deposit(i, send_amount).then(result => {
      return result.wait(1)
    }).catch(err => {
      console.log("error:", err)
    })
  }

}

async function depositAllintpPool(id) {
  console.log("BEGIN TO DEPOSIT ")
  // For Deposit wil pool ID 
  // Get Pool Info for the Rewarder Contract Details
  let value3 = await chefContract.poolInfo(id);
  let LPtoken = value3.lpToken
  console.log("LP Token Address:", LPtoken)
  const tokenContract = new ethers.Contract(LPtoken, lp_erc20ABI, account);
  let maxBalance = await tokenContract.balanceOf(account.address)
  await approveTransfer(maxBalance, LPtoken, chefAddress)
  let value6 = await chefContract.deposit(id, maxBalance).then(result => {
    return result.wait(1)
  }).catch(err => {
    console.log("error:", err)
  })
}

// update a rewarder contract for example or to change the allocation points
async function adjustPool() {
  /*
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_allocPoint",
        "type": "uint256"
      },
      {
        "internalType": "contract IRubyMasterChefRewarder",
        "name": "_rewarder",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "overwrite",
        "ty
  */
  let res = await chefContract.set(2, 150, "0xB6Fa30Fb3e14f61537eDA56d8d77207a4215b402", true).then(result => {
    return result;
  }).catch(err => {
    console.log(err);
  })
}

async function makePool() {
  /*
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_allocPoint",
      "type": "uint256"
    },
    {
      "internalType": "contract IERC20",
      "name": "_lpToken",
      "type": "address"
    },
    {
      "internalType": "contract IRubyMasterChefRewarder",
      "name": "_rewarder",
      "type": "address"
    }
    */
  // 4pool address, with USDP Dual Rewarder contract 
  let res = await chefContract.add(100, "0x4bA04b8026E680cAcDA8925d05FE7ea4973B4d0B", "0xE920008629bb39c56983862D84Be7fE18365fAe0").then(result => {
    return result;
  }).catch(err => {
    console.log(err);
  })


}

// Add 0.1 LP to each Pool
async function runTest() {
  let count = await chefContract.poolLength();

  let whoisowner = await chefContract.owner();
  let loop = Number(count.toString());
  let perSecond = await chefContract.rubyPerSec().then(result => {
    return result;
  }).catch(err => {
    console.log(err);
  })
  let rubyskaker_address = await chefContract.rubyStaker().then(result => {
    return result;
  }).catch(err => {
    console.log(err);
  })
  console.log(" Pool length: ", count.toString() + " | RubySkaker Address: " + rubyskaker_address);

  console.log(" Ruby Per Second: ", perSecond.toString());

  let trySec = ethers.utils.formatUnits(perSecond, 18)// to string

  console.log(" Ruby Per Second Real: ", trySec);

  console.log(" Contract Owner: ", whoisowner);

  console.log("----------------");

  // Print out all the Pool Addresses
  for (let i = 0; i < loop; i++) {
    console.log("--------POOL_ID--------", i);
    let value1 = await chefContract.userInfo(i, address);
    //  let bonus = await chefContract.rewarderBonusTokenInfo(i);
    //  let value2 = await chefContract.updatePool(i).then(result => {
    //    return result.wait(1)
    //  }).catch(err => {
    //    console.log("error:", err)
    //  })

    let value3 = await chefContract.poolInfo(i);
    let aP = value3.allocPoint;
     console.log("Pool AllocationPoints: ", aP.toString())
    console.log("LP Token Address:", value3.lpToken)
    const rewarder_address = value3.rewarder
    console.log("Rewarder Contract Address:", value3.rewarder)

    if (rewarder_address != '0x0000000000000000000000000000000000000000') {
      const rewardContract = new ethers.Contract(rewarder_address, rewarderABI, account);
      let value7 = await rewardContract.updatePool()
      let value4 = await rewardContract.pendingTokens(account.address)
      let value5 = await rewardContract.rewardToken()
      let LPtoken = await rewardContract.lpToken()
      const lpTokenContract = new ethers.Contract(LPtoken, lp_erc20ABI, account);
      let balance = await lpTokenContract.balanceOf(account.address)
      console.log("User Token Balance of LP token:", balance.toString())
      let mc_address = await rewardContract.rubyMasterChef()
      let mintRate = await rewardContract.tokenPerSec()
      console.log("User Token Info:", value1.toString())
      console.log("Pending Token Info:", value4.toString())
      console.log("Reward Token Address:", value5)
      console.log("LP Token Address:", LPtoken)
      console.log("Mapped to MasterChef Address:", mc_address)
      console.log("Tokens Per Second:", mintRate.toString())

      /* Working
      let swapAmount = ethers.utils.parseUnits("0.1", 'ether');// works
      await approveTransfer(swapAmount, LPtoken, mc_address)
  
      if (balance.gt(swapAmount)) {
  
        let value999 = await chefContract.deposit(i, swapAmount).then(result => {
          return result.wait(1)
        }).catch(err => {
          console.log("error:", err)
        })
      }
      */
    }
  }
}

async function run() {

   await runTest();

  // await withdrawTest();
  // await withdrawALL();
  // await depositNow("0.1");// Deposit LP tokens to every pool 

  // CLAIM REWARDS , trigger the deposit call, and rewards will be distributed. 
 // await depositToPool("0", 0)

  //await   depositAllintpPool(3) 


  // ADMIN CONTROL 
  // await adjustPool();
  // makePool();

}


run();
