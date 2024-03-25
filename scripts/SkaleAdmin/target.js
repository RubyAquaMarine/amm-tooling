const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const token_abi = require('../abi/SkaleERC20.json');
const token_manager_abi = require('../abi/skale_l2_token_manager.json');
const token_linker_abi = require('../abi/skale_token_linker.json');
const schain_tokenManager = '0xD2aAA00500000000000000000000000000000000'
const schain_tokenLinker = '0xD2aAA00800000000000000000000000000000000'
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);
const init_signer = account;
const ROLE_ADDRESS = init_signer.address;

const tokenAddressFromOrigin = '';
const tokenAddressOnTarget = '';
const TARGET_CHAIN = "honorable-steel-rasalhague";

async function connectSchain(init_schain_target) {
    console.log(" connect to chain: ", init_schain_target);
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

async function setChainConnectorRole(roleAddr) {
    const contract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);
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
    const contract = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
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
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
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
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
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

async function whiteListTokenOnL2(init_schain_target) {

    const tokenManager = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);

    let chainHash = ethers.utils.solidityKeccak256(["string",], [TARGET_CHAIN])

    console.log("chain:", chainHash)

    let address = tokenAddressFromOrigin;

    let res = await tokenManager.clonesErc20(chainHash, address).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    if (res == tokenAddressOnTarget) {
        console.log("MAPPING TOKEN ALREADY COMPLETED")
        return;
    }


    if (res == '0x0000000000000000000000000000000000000000') {

        console.log("MAPPING TOKENS")

        let res = await tokenManager.addERC20TokenByOwner(init_schain_target, tokenAddressFromOrigin, tokenAddressOnTarget).then(result => {
            return result
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
    }
}

async function targetChainConfig() {
    //  await setChainConnectorRole(ROLE_ADDRESS)                 // skaleChain Owner must grantROLE
      await connectSchain(TARGET_CHAIN)          // Select the Skale chain where the Token exists (Token Origin Skale Chain)
    //  await setMinterRole(schain_tokenManager)              // Grants roles to token manager
    //  await setBurnerRole(schain_tokenManager)              // Grants roles
    //  await whiteListTokenOnL2(TARGET_CHAIN)      // Select the Skale chain where the Token exists (Token Origin Skale Chain)

}

targetChainConfig();

