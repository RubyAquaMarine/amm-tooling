const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const contract_abi = require('../abi/rubyMasterChef.json')
const rewarder_contract_abi = require('../abi/simpleRewarder.json')
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);
//masterchef
const rubyRewardAddress = config.amm.masterchef2;

/* Adjust the allocPoints : if Dual Rewards, use the contract address from that Rewards contract else, use the masterchef contract?
   Update the given pool's RUBY allocation point. Can only be called by the owner.
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
  const contract = new ethers.Contract(rubyRewardAddress, contract_abi, accountOrigin);
  const call = await contract.set(pool_number, allocation_points, rewarder_contract_address, overwrite_rewarder).then(result => {
    console.log("Setup Pool Rewards ", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Setup Pool Rewards:  ", err)
  })
  console.log(" result ", call)
}

async function checkPoolInformation(pool_number) {
  const contract = new ethers.Contract(rubyRewardAddress, contract_abi, accountOrigin);
  const call = await contract.poolInfo(pool_number).then(result => {
    console.log("Pool Info ", result)
    console.log("Pool Info ", result.allocPoint.toString())
  }).catch(err => {
    console.log("Pool Info:  ", err)
  })
}

/*
get the farm Pool length. save the value. clear
make a new pool. 
and check the pool length. 
if the value is different the pool was created successfully
*/
async function createFarmPool(allocation_points, lp_address, rewarder_address) {
  const contract = new ethers.Contract(rubyRewardAddress, contract_abi, accountOrigin);

  const prePoolLength = await contract.poolLength().then(result => {
    return result
  }).catch(err => {
    console.log("Pool Info:  ", err)
  })

  const call = await contract.add(allocation_points, lp_address, rewarder_address).then(result => {
    console.log("Setup New Farm Pool", result)
    return result.wait(1)
  }).catch(err => {
    console.log("Setup Pool ERROR:  ", err)
  })

  console.log(" result ", call)

  const postPoolLength = await contract.poolLength().then(result => {
    return result
  }).catch(err => {
    console.log("Pool Info:  ", err)
  })

  if (postPoolLength > prePoolLength) {
    console.log("New Farm Pool created successfully for LP Token Address: ", lp_address)
  } else {
    console.log("FAILED to make a New Farm Pool successfully for LP Token Address: ", lp_address)
  }
}

async function checkAllPools(){
  const contract = new ethers.Contract(rubyRewardAddress, contract_abi, accountOrigin);
  const postPoolLength = await contract.poolLength().then(result => {
    return result
  }).catch(err => {
    console.log("Pool Info:  ", err)
  })

  for (let i = 0; i < postPoolLength; i++) {
    console.log("Pool ID:  ", i)
    await checkPoolInformation(i)
  }

}

async function run() {

 await checkAllPools()


  /*
    await createFarmPool(
      100, // ALLOCATION POINTS 
      '0xC2802b9c8200A43D2309AEcA049c197A5CF2DAaF', // LP TOKEN ADDRESS 
      rubyRewardAddress, // REWARDER CONTRACT ADDRESS . or masterchef address if no dual rewards
    )

    await createFarmPool(
      100, // ALLOCATION POINTS 
      '0xC2802b9c8200A43D2309AEcA049c197A5CF2DAaF', // LP TOKEN ADDRESS 
      rubyRewardAddress, // REWARDER CONTRACT ADDRESS . or masterchef address if no dual rewards
    )
  */
}

run()
