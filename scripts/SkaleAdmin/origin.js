const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const token_abi = require('../abi/SkaleERC20.json');
const deposit_abi = require('../abi/depositBox.json');
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

    const depositBoxContract = new ethers.Contract(depositBoxAddress, deposit_abi, accountSigner);
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

async function whiteListTokenOnL2Target(target_chain) {

    const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, accountOrigin);

    let chain = ethers.utils.solidityKeccak256(["string",], [ORIGIN_CHAIN])
    let chainB = ethers.utils.solidityKeccak256(["string",], [target_chain])

    let resA = await tokenManager.clonesErc20(chain, tokenAddressFromOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    let resB = await tokenManager.clonesErc20(chain, tokenAddressOnTarget).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    let resD = await tokenManager.clonesErc20(chainB, tokenAddressFromOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    let resC = await tokenManager.clonesErc20(chainB, tokenAddressOnTarget).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })


    console.log("A: " + resA + "\nB:" + resB + "\nC:" + resC + "\nD:" + resD)

    if (resA == '0x0000000000000000000000000000000000000000') {

        console.log("MAPPING TOKENS")

        let res = await tokenManager.addERC20TokenByOwner(target_chain,  tokenAddressOnTarget, tokenAddressFromOrigin).then(result => {
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
        console.log("TOKEN ALREADY MAPPED TO:", res)
    }
}

async function whiteListTokenOnL2Mainet() {

    const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, accountOrigin);

    const name_mainnet = await tokenManager.MAINNET_NAME();

    console.log("NAME: ", name_mainnet)

    let chain = ethers.utils.solidityKeccak256(["string",], [name_mainnet])

    let resA = await tokenManager.clonesErc20(chain, tokenAddressFromOriginMainnet).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log("A: " + resA)

    if (resA == '0x0000000000000000000000000000000000000000') {

        console.log("MAPPING TOKENS")
        // Inputs: 
        // Mainnet , L1_Address, L1_Clones_L2_address
        let res = await tokenManager.addERC20TokenByOwner(name_mainnet, tokenAddressFromOriginMainnet, tokenAddressFromOrigin).then(result => {
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
        console.log("TOKEN ALREADY MAPPED:")
    }
}

/* READ INSTRUCTIONS
- (optional) add the originMainnet token address from L1 
- add the origin token address from the origin chain
- add the new deployed token contract address from Europa to tokenAddressOnTarget
- change the config.skale.chainName to select the origin chain name  
*/
const tokenAddressFromOriginMainnet = '0xF10B6447E455f7B1B29899e81E3A25F52A3Adb59'; // Address from l1
const tokenAddressFromOrigin = '0x6F879207FA01c89E76a415f81156372e9b37B1aF'; // Address from the origin chain 
const tokenAddressOnTarget = '0xED63eD948077131a4B1E911181E0d6B02D5edE8D'; // address on Target
const ORIGIN_CHAIN = config.skale.whispering;
const TARGET_CHAIN = config.skale.fancy

// change RPC
async function whisperingL1() {
    // L1 RPC 
    await whiteListTokenFromL1(ORIGIN_CHAIN, "0xF10B6447E455f7B1B29899e81E3A25F52A3Adb59", "0xb3bf0c62f0924e5c8fdae9815355ea98fba33c8e", accountOrigin)
}

//whisperingL1();


// change RPC
async function whisperingL2() {

    //allow L1 token to bridge to SKale Chain
    await whiteListTokenOnL2Mainet();

    //  await setTokenRegisterRole(ROLE_ADDRESS);
    await whiteListTokenOnL2Target(TARGET_CHAIN)      // Select the Skale chain where the Token exists (Token Origin Skale Chain)
}

whisperingL2();

