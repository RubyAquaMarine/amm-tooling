const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const token_abi = require('../abi/SkaleERC20.json');
const token_manager_abi = require('../abi/skale_l2_token_manager.json');
const token_linker_abi = require('../abi/skale_token_linker.json');
const schain_tokenManager = '0xD2aAA00500000000000000000000000000000000'
const schain_tokenLinker = '0xD2aAA00800000000000000000000000000000000'
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.whispering_turais);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const accountOrigin = wallet.connect(provider);
const ROLE_ADDRESS = accountOrigin.address;

// mainnet , rinkeby l1 rpc required. 
async function whiteListTokenFromL1(schainName, token, depositBoxAddress, accountSigner) {

    const depositBoxContract = new ethers.Contract(depositBoxAddress, depositBoxABI, accountSigner);
    const tokenExists = await depositBoxContract.getSchainToERC20(schainName, token);
    console.log("Token Exists", tokenExists);

    if (tokenExists == true) {
        console.log("whiteListTokenOnL1: Finished");
        return
    }// else add the token to the Deposit Box contract on L1 with the schain name and the l1 token address

    const res = await depositBoxContract.addERC20TokenByOwner(schainName, token);
    const rec = await res.wait(1);
    console.log("whiteListTokenOnL1: added new token: ", rec);
}

async function connectSchain(init_schain_target) {
    const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, accountOrigin);
    console.log("connect: ", init_schain_target);
    let isConnected = await tokenManagerLinkerContract.hasSchain(init_schain_target);
    console.log("is Skale Chain connected: ", isConnected);
    if (isConnected) return

    console.log("Connecting Schain: ");

    let tx = await tokenManagerLinkerContract.connectSchain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log("Connecting Schain: err", err);
    })

    const rec = await tx.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log("err", err);
    })

    console.log("receipt", rec);
}

async function setChainConnectorRole(roleAddr) {
    const contract = new ethers.Contract(schain_tokenLinker, token_linker_abi, accountOrigin);
    const CHAIN_CONNECTOR_ROLE = ethers.utils.id("CHAIN_CONNECTOR_ROLE");
    let res = await contract.hasRole(ethers.utils.arrayify(CHAIN_CONNECTOR_ROLE), roleAddr);
    if (res) {
        console.log("RoleAddress already has CHAIN_CONNECTOR_ROLE", res);
        return
    }
    res = await contract.grantRole(ethers.utils.arrayify(CHAIN_CONNECTOR_ROLE), roleAddr);
    const rec = await res.wait(1);
    console.log("receipt: ", rec);
}

async function setTokenRegisterRole(minterAddr) {
    const contract = new ethers.Contract(schain_tokenManager, token_manager_abi, accountOrigin);
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
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, accountOrigin);
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
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, accountOrigin);
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

async function whiteListTokenOnL2() {

    const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, accountOrigin);
    // i changed this to (schain, origin_token, target_token) because abi says (schain,mainnet, schain) 
    // scenario One. Dapp chains are whitelisting Europa assets
    // (europa, europa_asset_USDP, skale_chain_owner_target_token_address)
    // scenario Two. Europa chain is whitelisting Dapp tokens
    // (dappChain, dapp_chain_origin_token_address, europa_target_token_address)
    // scenario Three. Dapp chains is mapping their token to other chains (europa,etc)

    const name_mainnet = await tokenManager.MAINNET_NAME();

    console.log("NAME: ", name_mainnet)

    let chainB = ethers.utils.solidityKeccak256(["string",], [TARGET_CHAIN])
   
    let resD = await tokenManager.clonesErc20(chainB, tokenAddressFromOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    
    if (resD== '0x0000000000000000000000000000000000000000') {

        console.log("MAPPING TOKENS")

        let res = await tokenManager.addERC20TokenByOwner(TARGET_CHAIN, tokenAddressFromOrigin, tokenAddressOnTarget ).then(result => {
            return result;
        }).catch(err => {
            console.log("whiteListTokenOnL2: Error: ", err)
        })

        res = await res.wait(1).then(result => {
            console.log("whiteListTokenOnL2fromOrigin: result: ", result);
            return result
        }).catch(err => {
            console.log("whiteListTokenOnL2fromOrigin: ERROR  ", err);
        })
        console.log("whiteListTokenOnL2fromOrigin: Ending ", res);


    } else {
        console.log("TOKEN:" + tokenAddressFromOrigin + " | ALREADY MAPPED TO:", resD)
    }
}
/* READ INSTRUCTIONS
- add the origin token address from the origin chain
- add the new deployed token contract address from Europa to tokenAddressOnTarget
- change the config.skale.chainName to select the origin chain name  
*/
const tokenAddressFromOrigin = '0xD203d749C723049304d87971591879Aaa51462bD'; // reversing : use europa
const tokenAddressOnTarget = '0x231e33DF07BA589Cb094fE106b5ca366FBefdd52'; //use whispering
const ORIGIN_CHAIN = config.skale.whispering;
const TARGET_CHAIN = config.skale.fancy;



async function whisperingConfig() {
  //  await setTokenRegisterRole(ROLE_ADDRESS);
    await whiteListTokenOnL2()      // Select the Skale chain where the Token exists (Token Origin Skale Chain)
}

whisperingConfig();

