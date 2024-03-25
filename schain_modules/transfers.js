const ethers = require('ethers');
const token_abi = require('../abi/SkaleERC20.json');
const l1_depositBoxABI = require('../abi/depositBox.json');
const token_manager_abi = require('../abi/skale_l2_token_manager.json');
const token_linker_abi = require('../abi/skale_token_linker.json');


const schain_tokenManager = '0xD2aAA00500000000000000000000000000000000'
const schain_tokenLinker = '0xD2aAA00800000000000000000000000000000000'

let init_rpc,
  init_signer,
  init_signer_target,
  init_signer_mainnet,
  init_schain_origin,
  init_schain_target,
  init_token_l1_whitelisting,
  init_token_address_l1,
  init_token_address_origin,
  init_token_address_target,
  init_token_amount;

async function initTransfers(tokenAmount, isL1Listing, tokenL1, tokenIn, tokenOut, schainOrigin, schainTarget, accountSigner, accountSignerTarget, accountSignerMainnet, rpcProvider) {

  init_rpc = rpcProvider;
  // signers
  init_signer = accountSigner;
  init_signer_target = accountSignerTarget;
  init_signer_mainnet = accountSignerMainnet;
  // schains
  init_schain_origin = schainOrigin;
  init_schain_target = schainTarget;
  //l1
  init_token_l1_whitelisting = isL1Listing;
  init_token_address_l1 = tokenL1;
  //l2 tokens
  init_token_address_origin = tokenIn;
  init_token_address_target = tokenOut;
  //transfer,mint
  init_token_amount = tokenAmount;
}

async function connectSchain() {
  const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);
  let isConnected = await tokenManagerLinkerContract.hasSchain(init_schain_target);
  console.log("is Skale Chain connected: ", isConnected);
  if (isConnected) return

  let tx = await tokenManagerLinkerContract.connectSchain(init_schain_target).then(result => {
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
}

async function setTokenRegisterRole(minterAddr) {
  const contract = new ethers.Contract(init_token_address_origin, token_manager_abi, init_signer);
  const TOKEN_REGISTRAR_ROLE = ethers.utils.id("TOKEN_REGISTRAR_ROLE");

  let res = await contract.hasRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr);

  if (res) {
    console.log("RegisterAddress already has TOKEN_REGISTRAR_ROLE", res);
    return
  }

  res = await contract.grantRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr);
  const rec = await res.wait(1);
  console.log("receipt: ", rec);

}

async function setMinterRole(minterAddr) {
  const token = new ethers.Contract(init_token_address_origin, token_abi, init_signer);
  const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");

  let res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  console.log("Completed: MinterAddress has MINTER_ROLE", res);
  if (res) {
    return
  }
  // ROlE and ADDRESS
  res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
  const rec = await res.wait(1);
  console.log("receipt for MINTER_ROLE being granted: ", rec);
};

async function setBurnerRole(minterAddr) {
  const token = new ethers.Contract(init_token_address_origin, token_abi, init_signer);
  const BURNER_ROLE = ethers.utils.id("BURNER_ROLE");

  let res = await token.hasRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr);
  console.log("Completed: MinterAddress has BURNER_ROLE", res);
  if (res) {
    return
  }
  // ROlE and ADDRESS
  res = await token.grantRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr);
  const rec = await res.wait(1);
  console.log("receipt for BURNER_ROLE being granted: ", rec);
};

async function autoDeployIsOn() {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
  let isOn = await tokenManager.automaticDeploy();
  console.log("Result: ", isOn);
  return isOn
}

async function disableAutoDeploy() {
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
  let nonce = await init_signer.getTransactionCount("latest");
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

async function whiteListTokenOnL1() {
  // get the deposit box address from the tokenManager 
  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
  let depositBoxAddress = await tokenManager.depositBox();
  console.log("depositBoxAddress from L1: ", depositBoxAddress);

  const depositBoxContract = new ethers.Contract(depositBoxAddress, l1_depositBoxABI, init_signer_mainnet);
  const tokenExists = await depositBoxContract.getSchainToERC20(init_schain_origin, init_token_address_l1);
  console.log("Token Exists", tokenExists);

  if (tokenExists == true) {
    console.log("whiteListTokenOnL1: Finished");
    return
  }// else add the token to the Deposit Box contract on L1 with the schain name and the l1 token address

  const res = await depositBoxContract.addERC20TokenByOwner(init_schain_origin, init_token_address_l1);
  const rec = await res.wait(1);
  console.log("whiteListTokenOnL1: added new token: ", rec);
}

async function whiteListTokenOnL2(onOrigin) {

  const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
  const token = new ethers.Contract(init_token_address_origin, token_abi, init_signer);
  const balance = await token.balanceOf(init_signer.address);
  console.log("balance:", balance.toString());

  let res;
  if (onOrigin) {

    console.log("whiteListTokenOnL2 Starting with ORIGIN ROLE to chain: ", init_schain_target);
    console.log("Mapping Origin Token : " + init_token_address_origin + " to " + init_token_address_target);
    res = await tokenManager.addERC20TokenByOwner(init_schain_target, init_token_address_origin, init_token_address_target).then(result => {
      console.log("whiteListTokenOnL2: ", result)
      return result
    }).catch(err => {
      console.log("whiteListTokenOnL2: Error: ", err)
    })
  } else {
    console.log("whiteListTokenOnL2 Starting with TARGET ROLE to chain: ", init_schain_target);
    console.log("Token In: ", init_token_address_origin,);
    console.log("Token Out: ", init_token_address_target);
    res = await tokenManager.addERC20TokenByOwner(init_schain_target, init_token_address_target, init_token_address_origin).then(result => {  // Working... 
      return result
    }).catch(err => {
      console.log("whiteListTokenOnL2: Error: ", err)
    })
  }

  res = await res.wait(1).then(result => {
    console.log("whiteListTokenOnL2fromOrigin: result: ", result);
    return result
  }).catch(err => {
    console.log("whiteListTokenOnL2fromOrigin: ERROR  ", err);
  })
  console.log("whiteListTokenOnL2fromOrigin: Ending ", res);
}

async function prepareERC20(isOrigin) {
  const ifTrue = await autoDeployIsOn();
  if (ifTrue) {
    console.log(" AutoDeployment is on. Whitelisting would be disabled")
    await disableAutoDeploy()
  }
  // Safety checks

  // prepare for whitelisting and s2s transfers
  await connectSchain()

  //l1 whitelisting
  if (init_token_l1_whitelisting) {
    await whiteListTokenOnL1()
  }

  //l2 whitelisting to another schain
  await setTokenRegisterRole(schain_tokenManager)// FIXED 722PM 
  
  // Only set minter,burner role on the targetChain aka Not Origin
  if (isOrigin == false) {
    await setMinterRole(schain_tokenManager)
    await setBurnerRole(schain_tokenManager)
  }

  await whiteListTokenOnL2(isOrigin)
}

async function bridgeERC20() {
  const tokenManagerContract = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);// L2

  const usdpContract = new ethers.Contract(init_token_address_origin, token_abi, init_signer);// L2

  const decimal = await usdpContract.decimals();

  let weiAmount = await usdpContract.balanceOf(init_signer.address);

  let humanAmount = ethers.utils.formatUnits(weiAmount, decimal)

  let allowanceAmount = await usdpContract.allowance(init_signer.address, schain_tokenManager);

  console.log("Allowance Amount: ", allowanceAmount.toString());
  console.log("Balance Amount: ", weiAmount.toString());
  console.log("Balance Norm: ", humanAmount);

  //Provider 
  const gas_try = await init_rpc.getGasPrice();
  const try_string = gas_try.toString();

  let nonce;
  let objectBlock;

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {

    nonce = await init_signer.getTransactionCount("latest");

    objectBlock = {
      "gasPrice": try_string,
      "gasLimit": "280000",
      "nonce": nonce
    }
    console.log("Increased Allowance: ", objectBlock);

    let parse = await usdpContract.approve(schain_tokenManager, weiAmount, objectBlock).then(result => {
      console.log(result);
      return result;
    }).catch(err => {
      console.log("error on approval: ", err);
    })

    await parse.wait(1).then(result => {
      console.log("Receipt:", result);
    }).catch(err => {
      console.log("Receipt Error:", err);
    })


  }

  // now its time to bridge the assets
  const sendAmount = ethers.utils.parseUnits(init_token_amount, decimal);
  humanAmount = ethers.utils.formatUnits(sendAmount, decimal)
  console.log("Send Balance: ", humanAmount);

  /*
 
  transferToSchainERC20(
          string calldata targetSchainName,
          address contractOnMainnet,
          uint256 amount
  */
  nonce = await init_signer.getTransactionCount("latest");
  objectBlock = {
    from: init_signer.address,
    nonce: nonce,
    gasLimit: 6500000,
    gasPrice: 100000000,
  }

  console.log("destChainName: ", "|" + init_schain_target + "|");
  console.log("mainnetTokenAddress: |", init_token_address_origin + "|");
  console.log("sendAmount: ", sendAmount.toString());

  let ok = await tokenManagerContract.transferToSchainERC20(init_schain_target, init_token_address_origin, sendAmount, objectBlock).then(result => {
    console.log("Result: ", result);
    return result;
  }).catch(err => {
    console.log("Eroor with transfer", err)
  })


  await ok.wait(1).then(result => {
    console.log("Receipt:", result);
    return result;
  }).catch(err => {
    console.log("Receipt Error:", err);
  })

}

// on fancy rpc using the configOriginChain variables, 
// target token address would be the token address on fancy ( since we're using the configOriginChain)
async function bridgeBackERC20() {
  const tokenManagerContract = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer_target);// L2

  const usdpContract = new ethers.Contract(init_token_address_target, token_abi, init_signer_target);// L2

  const decimal = await usdpContract.decimals();

  let weiAmount = await usdpContract.balanceOf(init_signer_target.address);

  let humanAmount = ethers.utils.formatUnits(weiAmount, decimal)

  let allowanceAmount = await usdpContract.allowance(init_signer_target.address, schain_tokenManager);

  console.log("Allowance Amount: ", allowanceAmount.toString());
  console.log("Balance Amount: ", weiAmount.toString());
  console.log("Balance Norm: ", humanAmount);

  if (weiAmount.lte(0)) {
    console.log("Balance is Zero; Can not Bridge funds ");
    return
  }

  //Provider 
  const gas_try = await init_rpc.getGasPrice();
  const try_string = gas_try.toString();

  let nonce;
  let objectBlock;

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {

    nonce = await init_signer_target.getTransactionCount("latest");

    objectBlock = {
      "gasPrice": try_string,
      "gasLimit": "280000",
      "nonce": nonce
    }
    console.log("Increased Allowance: ", objectBlock);

    let parse = await usdpContract.approve(schain_tokenManager, weiAmount, objectBlock).then(result => {
      console.log(result);
      return result;
    }).catch(err => {
      console.log("error on approval: ", err);
    })

    await parse.wait(1).then(result => {
      console.log("Receipt:", result);
    }).catch(err => {
      console.log("Receipt Error:", err);
    })
  }

  // now its time to bridge the assets
  const sendAmount = ethers.utils.parseUnits(init_token_amount, decimal);
  humanAmount = ethers.utils.formatUnits(sendAmount, decimal)
  console.log("Send Balance: ", humanAmount);

  /*
 
  transferToSchainERC20(
          string calldata targetSchainName,
          address contractOnMainnet,
          uint256 amount
  */
  nonce = await init_signer_target.getTransactionCount("latest");
  objectBlock = {
    from: init_signer_target.address,
    nonce: nonce,
    gasLimit: 6500000,
    gasPrice: 100000000,
  }

  console.log("destChainName: ", "|" + init_schain_origin + "|");
  console.log("schainTokenAddress: |", init_token_address_target + "|");
  console.log("sendAmount: ", sendAmount.toString());

  // Change this to origin token? yep that worked. 
  let ok = await tokenManagerContract.transferToSchainERC20(init_schain_origin, init_token_address_origin, sendAmount, objectBlock).then(result => {
    console.log("Result: ", result);
    return result;
  }).catch(err => {
    console.log("Eroor with transfer", err)
  })


  await ok.wait(1).then(result => {
    console.log("Receipt:", result);
    return result;
  }).catch(err => {
    console.log("Receipt Error:", err);
  })

}

async function mintERC20() {
  const addr = init_signer.address;
  const token = new ethers.Contract(init_token_address_origin, token_abi, init_signer);
  const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
  let res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), addr);
  if (res) {

  } else {
    res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), addr);
    const rec = await res.wait(1);
    console.log("receipt for MINTER_ROLE being granted: ", rec);
  }
  //mint
  const decimal = await token.decimals();
  res = await token.mint(addr, ethers.utils.parseUnits(init_token_amount, decimal));
  await res.wait(1);
  const balance = await token.balanceOf(addr);
  console.log("balance", balance.toString());
}

// Export it to make it available outside
module.exports.initTransfers = initTransfers;
module.exports.prepareERC20 = prepareERC20;
module.exports.bridgeERC20 = bridgeERC20;
module.exports.bridgeBackERC20 = bridgeBackERC20;
module.exports.mintERC20 = mintERC20;