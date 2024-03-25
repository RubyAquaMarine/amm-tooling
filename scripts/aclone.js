const ethers = require('ethers');
const token_manage_ABI = require('../abi/skale_l2_token_manager.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const TOKEN_MANAGER_ADDRESS = config.skale.token_manager;
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.actual_secret);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = wallet.connect(provider);



// make a list of all the tokens on fancy, - europa, and loop over those assets to get the matching address on the target chain 
// only show the tokens lists that exist on target chain that also exist on origin chain ^^ - allows the user to brdige from Brawl to Europa 

let tokenList = [

  { RUBY: config.assets.fancy.RUBY },
  { USDP: config.assets.fancy.USDP }


]
/*
 DAI: "0x4C45A6F9bB79977eF655b4147C14F9f40424ef00",
  USDC: "0x2Fc800Cf8c219DD07866f883F8f25a346F92d07b",
  USDT: "0x6faFE9419e37d20A402a6Bb942808a20a5a19972",
  GOO: "0x7c62Ef7Bbc1Aba3C7bC8973eBC853E26BBb4dD90",
  ETH: "0xd2aaa00700000000000000000000000000000000",
  MA18: "0x1DeA9e13A36033033820F437A3C139cE49A66Dbf",
  ME18: "0x74a5cb6b214a8311BA3a682b3d129D0d4cD1fdC8",
  SKL: "0xb840600e735b1113050fa89a9333069eb53ae52b",
  BTC: "0x1343F90aDa7A340b2014fEDEbA7D15772D284B72"
*/

// return this list to the user
async function loopTokenList() {

  let length = tokenList.length;

  for (let i = 0; i < length; i++) {
    console.log("loop", i)
    //Object.values(object1)
    let addr = Object.values(tokenList[i]).toString()

    console.log("tokenlist: Input: ", i, length, addr)

    const res = await checkClonedERC20(addr).then(res => {
      return res;
    }).catch(err => {

      console.log("checkClonedERC20 error: ", err)

    })

    console.log("result: ", res)

  }
}

async function checkClonedERC20(addressOrigin) {



  const contract = new ethers.Contract(TOKEN_MANAGER_ADDRESS, token_manage_ABI, accountOrigin);


  let sha = ethers.utils.solidityKeccak256(['string'], [config.skale.fancy]);


  console.log('hash: ', sha)


  let res = await contract.clonesErc20(sha, addressOrigin).then(res => {
    return res;
  }).catch(err => {
    console.log("error: ", err)
  })

  console.log("result: checkClonedERC20:", addressOrigin, res)
  return true;
}

async function run() {
  await loopTokenList();
}

run();