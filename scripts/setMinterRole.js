const ethers = require('ethers');
const config = require('./setConfig.json');
const token_abi = require('./abi/SkaleERC20.json');
const l1_depositBoxABI = require('./abi/depositBox.json');
const token_manager_abi = require('./abi/skale_l2_token_manager.json');
const token_linker_abi = require('./abi/skale_token_linker.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.schainHub;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKeyAdmin;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const schain_tokenManager = '0xD2aAA00500000000000000000000000000000000'
const schain_tokenLinker = '0xD2aAA00800000000000000000000000000000000'

const l1_depositBoxAddress = '0xb3bf0c62f0924e5c8fdae9815355ea98fba33c8e'

const minterAddress = account.address
const tokenMintAmount = '100000'

// Make up a fake l1 address 
const fakel1Address = '0xe70f71019D3a598BdBbf8f8aA6E85a34556966e3'

const fancy_token18 = '0x68768Ff234E991CA7D644efE1DF9C9Fc0693a2ac'
const whisp_token18 = '0xEf33E4e0f4104C5e6f1D5792f35Bccf9f0Ed1D9E'


const schainNameWhisper = 'whispering-turais'
const schainNameFancy = 'fancy-rasalhague'

async function tokenManagerExist(schain_name) {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);
  let isOn = await tokenManager.hasTokenManager(schain_name);
  console.log("tokenManagerExist: ", isOn);
}


async function setTokenRegisterRole(tokenAddr, minterAddr) {
  const contract = new ethers.Contract(tokenAddr, token_manager_abi, account);
  const TOKEN_REGISTRAR_ROLE = ethers.utils.id("TOKEN_REGISTRAR_ROLE");
  let res = await contract.grantRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr);
  const receipt = await res.wait(1);
  console.log("recipe", receipt);
  res = await contract.hasRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr);
  console.log("has TOKEN_REGISTRAR_ROLE role", res);
}


async function autoDeployIsOn() {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);
  let isOn = await tokenManager.automaticDeploy();
  console.log("Result: ", isOn);
  return isOn
}

async function enableAutoDeploy() {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);

  let nonce = await account.getTransactionCount("latest");
  objectBlock = {
    nonce: nonce,
    gasLimit: 6500000,
    gasPrice: 100000000,
  }


  let ok = await tokenManager.enableAutomaticDeploy().then(result => {
    console.log("Result: ", result);
    return result;
  }).catch(err => {
    console.log("Eroor with transfer", err)
  })

  console.log(ok)


}
async function disableAutoDeploy() {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);

  let nonce = await account.getTransactionCount("latest");
  objectBlock = {
    nonce: nonce,
    gasLimit: 6500000,
    gasPrice: 100000000,
  }


  let ok = await tokenManager.disableAutomaticDeploy().then(result => {
    console.log("Result: ", result);
    return result;
  }).catch(err => {
    console.log("Eroor with transfer", err)
  })

  console.log(ok)


}

async function connectSchain(schain_name_dest) {
  const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, account);
  let tx = await tokenManagerLinkerContract.connectSchain(schain_name_dest).then(result => {
    console.log("result", result);
    return result;
  }).catch(err => {
    console.log("err", err);
  })

  const rec = await tx.wait(1).then(result => {
    console.log("result", result);
    return result;
  }).catch(err => {
    console.log("err", err);
  })

  console.log("receipt", rec);

  let isConnected = await tokenManagerLinkerContract.hasSchain(schain_name_dest);
  console.log("is connected sChain", isConnected);
}

// Pkey minting
const setMinterRoleForTokenMinting = async (tokenAddr, minterAddr) => {
  const token = new ethers.Contract(tokenAddr, token_abi, account);
  const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
  // ROlE and ADDRESS
  let res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  const receipt = await res.wait(1);
  console.log("recipe", receipt);

  res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  console.log("has minter role", res);
};

// Token manager s2s transfers 
const setMinterRoleForTokenTransfer = async (tokenAddr, minterAddr) => {
  const token = new ethers.Contract(tokenAddr, token_abi, account);
  const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
  // ROlE and ADDRESS
  let res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  const receipt = await res.wait(1);
  console.log("recipe", receipt);

  res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  console.log("has minter role", res);
};

const mintToken = async (tokenAddr, minterAddr, totkenMintAmt) => {
  const token = new ethers.Contract(tokenAddr, token_abi, account);
  const decimal = await token.decimals();
  let res = await token.mint(minterAddr, ethers.utils.parseUnits(totkenMintAmt, decimal));
  await res.wait(1);
  const balance = await token.balanceOf(minterAddr);
  console.log("balance", balance.toString());
}

const whiteListTokenOnL1 = async (schain_name_origin, l1_address_origin) => {

  const depositBoxContract = new ethers.Contract(l1_depositBoxAddress, l1_depositBoxABI, account);
  const tokenExists = await depositBoxContract.getSchainToERC20(schain_name_origin, l1_address_origin);
  console.log("Token Exists", tokenExists);

  if (tokenExists == true) {
    return
  }// else add the token to the Deposit Box contract on L1 with the schain name and the l1 token address

  const res = await depositBoxContract.addERC20TokenByOwner(schain_name_origin, l1_address_origin);
  const recipe = await res.wait(1);
  console.log("whiteListTokenOnL1: ", recipe);
}

/*
admin key, admin chain, l1 address, l2_address on this schain
addERC20TokenByOwner(string targetChainName, address erc20OnMainChain, address erc20OnSchain) external
fancy rpc, add whispering schain
*/
const whiteListTokenOnL2fromOrigin = async (schain_name_target, l1_address, l2_address) => {

  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);
  // const depositBoxAddress = await tokenManager.depositBox();
  console.log("schain_tokenManager", schain_tokenManager);

  // const depositBoxContract = new ethers.Contract(depositBoxAddress, token_manager_abi, account);
  //  console.log("schain_name_target", schain_name_target);
  // console.log("l1_address", l1_address);
  let res = await tokenManager.addERC20TokenByOwner(schain_name_target, l1_address, l2_address).then(result => {
    console.log(result)
    return result
  }).catch(err => {
    console.log(err)
  })

  const recipe = await res.wait(1).then(result => {
    console.log("whiteListTokenOnL2fromOrigin: result: ", result);
  }).catch(err => {
    console.log("whiteListTokenOnL2fromOrigin: ERROR  ", err);
  })
  console.log("whiteListTokenOnL2fromOrigin: ", recipe);
}

const whiteListTokenOnL2fromTarget = async (schain_name_origin, l1_address, l2_address) => {

  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, account);

  console.log("Schain Name ", schain_name_origin)
  console.log("L2 Address on this chain ", l2_address)
  console.log("L1 Address ", l1_address)


  let res = await tokenManager.addERC20TokenByOwner(schain_name_origin, l1_address, l2_address).then(result => {
    console.log(result)
    return result
  }).catch(err => {
    console.log(err)
  })

  const recipe = await res.wait(1);
  console.log("whiteListTokenOnL2fromOrigin: ", recipe);



}


async function whiteListOnWhisperFromFancy() {

  //auto deploy
  //await enableAutoDeploy();
  //else
  const ifTrue = await autoDeployIsOn();
  if (ifTrue) {
    console.log(" AutoDeployment is on. Whitelisting would be disabled")
    await disableAutoDeploy()
  }
  // Depoly erc20 tokens on both chains

  // tokenManagerExist(schainNameFancy);



  //Connect schain origin to the dest
  // await connectSchain(schainNameFancy)

  // set MINTER_ROLE
  // await setMinterRoleForToken(whisp_token18, minterAddress)
  // await setMinterRoleForToken(fancy_token6, minterAddress)

  // Mint tokens to test minter_role permissions
  // await mintToken(whisp_token18, minterAddress, tokenMintAmount)
  // await mintToken(fancy_token6, minterAddress, tokenMintAmount)



  // run this after minting tokens. 
  // this will change the Minting Role to the token manager contract 
  // New chadwick
  await setMinterRoleForTokenTransfer(fancy_token18, schain_tokenManager);

  // NEW 
  // Before whitelisting? 
  setTokenRegisterRole(schain_tokenManager, minterAddress)

  /* tested and working
    REQUIRES MAINNET RPC
    map the originChain address to the new token address that you deployed (ERC20.sol) on target chain
  */
  //await whiteListTokenOnL1(schainNameOrigin, fakel1Address)



  /* tested and working
  Use cases for running this function include
  1. TOKEN CREATED ON THIS SCHAIN AND NEEDS TO BE REGISTERD BEFORE s2s TRANSFERS    - ORIGIN SCHAIN
  2. BRIDGED FROM L1                                                                - ORIGIN MAINNET
  Input Parameters:
  - schain name of admin key
  - token address on originChain
  - token Address on the other schain
  */

   whiteListTokenOnL2fromOrigin(schainNameWhisper, fancy_token18, whisp_token18)// using fancy rpc

 // whiteListTokenOnL2fromOrigin(schainNameWhisper, whisp_token18, fancy_token18)// using fancy rpc

}

function run() {
  whiteListOnWhisperFromFancy();
}

run();

// en able automatic deploy 
// connect schain