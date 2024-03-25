const ethers = require('ethers');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
const contract_abi = require('../../abi/rubyMasterChef.json')
const ss_abi = require('../../abi/stableswap.json')
const rewarder_contract_abi = require('../../abi/simpleRewarder.json')
const rewarder = require('../../ruby_modules/rewarder.js')
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

const masterchefAddress = config.amm.masterchef;
const stableSwapAddress = config.amm.fourPool;
const rubyMakerAddress = config.amm.maker;


async function convertLPTokensInRubyMaker() {

  let tryt = await rewarder.convertLPtoRuby(true,
    config.assets.europa.USDP,
    config.assets.europa.ETH,
    config.amm.maker,
    accountOrigin,
    providerOrigin
  )
  return tryt;

}

async function getAdminFeeBalances() {
  const contract = new ethers.Contract(stableSwapAddress, ss_abi, accountOrigin);
  console.log("stableSwapAddress: ", stableSwapAddress)
  let getRewards = await contract.getAdminBalance(0)// pool
  let getRewards1 = await contract.getAdminBalance(1)// pool
  let getRewards2 = await contract.getAdminBalance(2)// pool
  let getRewards3 = await contract.getAdminBalance(3)// pool


  let a = ethers.utils.formatUnits(getRewards, 18);

  let aa = ethers.utils.formatUnits(getRewards1, 18);

  let aaa = ethers.utils.formatUnits(getRewards2, 6);

  let aaaa = ethers.utils.formatUnits(getRewards3, 6);

  // string to number
  const totalReward = parseFloat(a) + parseFloat(aa) + parseFloat(aaa) + parseFloat(aaaa);
  //number to string with decimal rounding
  console.log("Admin Fees Collected: " + totalReward.toFixed(2));

  console.log("Admin Fees Collected: " + a + " | " + aa + " | " + aaa + " | " + aaaa);

  return totalReward;
}


async function claimStableSwapAdminFee() {
  const contract = new ethers.Contract(stableSwapAddress, ss_abi, accountOrigin);
  let getRewards = await contract.withdrawAdminFees()// no inputs, fees go to owner
  console.log("Admin Fees Collected: ", getRewards)
  //withdrawAdminFees(Swap storage self, address to)
}

// Values are hardcoded based on RUBY.EXCHANGE
async function adjustStableSwapAdminFee() {
  const contract = new ethers.Contract(stableSwapAddress, ss_abi, accountOrigin);

  // Max swap fee is 1% or 100bps of each swap
  //uint256 public constant MAX_SWAP_FEE = 10**8;


  // 0.1% fee is 10 bps  = 10**7 
  // 0.01% fee is 1 bps = 10**6 
  // 0.04% fee is 4 bps = 4**6


  // Max adminFee is 100% of the swapFee
  // adminFee does not add additional fee on top of swapFee
  // Instead it takes a certain % of the swapFee. Therefore it has no impact on the
  // users but only on the earnings of LPs
  //uint256 public constant MAX_ADMIN_FEE = 10**10;

  // MAX Fees 
  let swapFee = 1e8
  let adminFee = 1e10

  // RUBY Fees 
  let swapFeeRuby = 4e6
  let adminFeeRuby = 5e9

  console.log("MAX SWAP FEE ", swapFee.toString())
  console.log("RUBY SWAP FEE ", swapFeeRuby.toString())

  console.log("MAX ADMIN FEE ", adminFee.toString())
  console.log("RUBY ADMIN FEE ", adminFeeRuby.toString())

  // Max values, lets try this first
  /*
  let setFee = await contract.setAdminFee(adminFee).then(result => {
    console.log("Admin Fee ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Admin Fee Error:  ", err)
  })

  let setSwapFee = await contract.setSwapFee(swapFee).then(result => {
    console.log("Swap Fee ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("SwapFee Error:  ", err)
  })
  */
  // Set RUBY Values

  let setFeeRuby = await contract.setAdminFee(adminFeeRuby).then(result => {
    console.log("Admin Fee ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Admin Fee Error:  ", err)
  })

  let setSwapRuby = await contract.setSwapFee(swapFeeRuby).then(result => {
    console.log("Swap Fee ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("SwapFee Error:  ", err)
  })

}


/* Adjust Token Rewards
 {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_rubyPerSec",
          "type": "uint256"
        }
      ],
      "name": "updateEmissionRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
*/
// DUAL REWARDS
async function adjustTokenPerSecondOnRewarder(rewarder_address, rewardAmount) {

  const contract = new ethers.Contract(rewarder_address, rewarder_contract_abi, accountOrigin);

  if (typeof contract === 'undefined') {
    console.log("Dual Reward Contract doesn't exist  ")
  }

  const call = await contract.setRewardRate(rewardAmount).then(result => {
    console.log("Adjusted Token Rewards to X per Second ", result)
    return result;
  }).catch(err => {
    console.log("Adjusted Token Rewards Error:  ", err)
  })

  call.wait();
  console.log(" result ", call.hash)

}

/* returns Total Allocation Points across all pools.  
- Before changing allocation points on any pool, 
- make sure to run this function and 
- determine the correct values for the added pool*/
async function checkTotalPoints() {
  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);
  const totalPoints = await contract.totalAllocPoint().then(result => {
    return result
  }).catch(err => {
    console.log("Error:  ", err)
  })
  console.log(totalPoints.toString());
  return totalPoints
}
/* Adjust Token Rewards
 {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_rubyPerSec",
          "type": "uint256"
        }
      ],
      "name": "updateEmissionRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
*/
//RUBY PER SEC ADJUSTMENTS
async function adjustTokenPerSecond(rewardAmount) {

  console.log("Rewards per Second ", rewardAmount, rewardAmount.toString())

  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);
  const call = await contract.updateEmissionRate(rewardAmount).then(result => {
    console.log("Adjusted Token Rewards");
    return result.wait(1)
  }).catch(err => {
    console.log("Adjusted Token Rewards Error:  ", err)
  })

  if (typeof call === 'undefined') {
    console.log("Adjusted Token Rewards Error:  ")
  }

  console.log("Succesful: ", call.transactionHash)
}
/* Adjust Treasury Fee Percent:: valid values: 1-999: A value of 100 equals 10% of the emmissions that will go to Treasury.
 "inputs": [
        {
          "internalType": "uint256",
          "name": "_newTreasuryPercent",
          "type": "uint256"
        }
*/
async function adjustTreasuryFee(feeAmount) {
  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);

  // change

  const call = await contract.setTreasuryPercent(feeAmount).then(result => {
    console.log("Adjusted Treasury Fee Percent ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Treasury Fee Percent Error:  ", err)
  })
  console.log(" result ", call)
}

//treasuryPercent on MasterChefContract
async function getTreasuryFee() {
  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);
  const call = await contract.treasuryPercent().then(result => {
    console.log("Treasury Fee Percent ", result.toString())
    return result
  }).catch(err => {
    console.log("Treasury Fee Percent Error:  ", err)
  })
  console.log(" result ", call)
}

/* Setup the pool and the allocPoints : if Dual Rewards, use the contract address from that Rewards contract else, use the masterchef contract?
// Update the given pool's RUBY allocation point. Can only be called by the owner.
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
          "type": "bool"
        }

*/
async function adjustAllocationPoints(pool_number, allocation_points, rewarder_contract_address, overwrite_rewarder) {
  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);
  const call = await contract.set(pool_number, allocation_points, rewarder_contract_address, overwrite_rewarder).then(result => {
    console.log("Setup Pool Rewards ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Setup Pool Rewards:  ", err)
  })
  console.log(" result ", call)
}

async function checkPoolInformation(pool_number) {
  const contract = new ethers.Contract(masterchefAddress, contract_abi, accountOrigin);
  const call = await contract.poolInfo(pool_number).then(result => {
    console.log("Pool Info ", result)
    console.log("Pool Info ", result.allocPoint.toString())
  }).catch(err => {
    console.log("Pool Info:  ", err)
  })
}


async function run() {

  // Important : total allocation points across all pools. 
  // Rewards are based on the total points / poolPoints; The larger poolPoints the larger of the total share of Ruby or Reward Tokens
   await checkTotalPoints()

  //  Controls emissions

  //let toWei = ethers.utils.parseEther("0.01666667")// 1 Emitted Ruby Per Minute = 1440 daily 
  // let toWei = ethers.utils.parseEther("0.0001")// shows up within ui within 1-2 block
  // let toWei = ethers.utils.parseEther("0.00001")// shows up within ui within 10 block
  // let toWei = ethers.utils.parseEther("0.000001")// shows up within ui within 100 block
  let toWei = ethers.utils.parseEther("30")
  //  await adjustTokenPerSecond(toWei)

  //  min 1, Max 999
  // await adjustTreasuryFee(100)// Sets the Treasury Fee to 10% of all emited RUBY

  //  Enter Pool #
  // await  checkPoolInformation(0)
  // await  checkPoolInformation(1)
  // await  checkPoolInformation(2)



  //MasterChef: Adding a Dual Rewarder Contract and updating the AllocationPoints
  //  await adjustAllocationPoints(0, 100, '0x1AB95f0E2405B049a757eC3D6F8d374d84EcBC6d', false)// true if the rewarder contract address is being changed.  I made the mistake of overwritting pool 0 rewarder address to the masterchef
  //  await adjustAllocationPoints(1, 150, '0x96dFC9f7e1e4561ae9AF54621b41327bCDCefF63', true)// true if the rewarder contract address is being changed.  I made the mistake of overwritting pool 0 rewarder address to the masterchef

  // Dual Reward contract addresses 
  //await  adjustTokenPerSecondOnRewarder('0x1AB95f0E2405B049a757eC3D6F8d374d84EcBC6d', 0);
  //await  adjustTokenPerSecondOnRewarder('0xB6Fa30Fb3e14f61537eDA56d8d77207a4215b402', 100000000000000);
  // let toWei = ethers.utils.parseEther("0.2")
  //  await adjustTokenPerSecondOnRewarder('0x06fC111984bdbBEe6805025816cD02839CB048C4', toWei);// SKL on testnet 


  //
  //await  getTreasuryFee()


  // await claimStableSwapAdminFee()
  // await adjustStableSwapAdminFee()


  // IF tokens need to be recovered from the RubyStaker contract 

  //await rewarder.recoverERC20fromStaker(config.assets.europa.USDP, '1', accountOrigin)
  // await rewarder.setStakerRewardMinter(config.amm.stake,config.ammv2.masterchef,accountOrigin)



  //await convertLPTokensInRubyMaker();

  //await adjustStableSwapAdminFee();


  await getAdminFeeBalances()


}

run()

/*
- RUBYUSDP : [0] pool : ```0xC1d7e1043DdCA3D46C67D84238560dD98BaE89ca``` : rewarder : ```0x1AB95f0E2405B049a757eC3D6F8d374d84EcBC6d```
- ETHUSDP : [1] pool : ```0x29A4F9d3503B7bA5fb8b073E7ADF1e9E62A7555C``` : rewarder : ```0x96dFC9f7e1e4561ae9AF54621b41327bCDCefF63```
*/