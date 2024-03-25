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
const account = wallet.connect(provider);
const init_signer = account;
const ROLE_ADDRESS = init_signer.address;

const tokenAddressFromOrigin = '0x68eEAd7dc01Bfc822fa2005D4C8bF98C45cc7bB4';
const tokenAddressOnTarget = '0x9EfdcA145A70Fde511CF087d4Fece07Ae2e16155';
const TARGET_CHAIN = "fancy-rasalhague";

async function wtf() {
    const nonce = await account.getTransactionCount("latest").then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })

    console.log(" nonce: ", nonce, nonce.toString())

    return nonce;
}

async function connectSchain(init_schain_target) {
    const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);
    let isConnected = await tokenManagerLinkerContract.hasSchain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    console.log("is Skale Chain connected: ", isConnected);
    if (isConnected) return

   // const test = await wtf() + 3;
    let tx = await tokenManagerLinkerContract.connectSchain(init_schain_target,{
       // nonce: test
    }).then(result => {
        console.log("result", result);
        return result;
    }).catch(err => {
        console.log("err", err);
    })

    if (typeof tx === 'undefined') {
        return;
    }

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
    let res = await contract.hasRole(ethers.utils.arrayify(CHAIN_CONNECTOR_ROLE), roleAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    if (res) {
        console.log("RoleAddress already has CHAIN_CONNECTOR_ROLE", res);
        return
    }
    let tx = await contract.grantRole(ethers.utils.arrayify(CHAIN_CONNECTOR_ROLE), roleAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })

    if (typeof tx === 'undefined') {
        return;
    }

    const rec = await tx.wait(1);
    console.log("receipt: ", rec);
}

async function setTokenRegisterRole(minterAddr) {
    const contract = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);
    const TOKEN_REGISTRAR_ROLE = ethers.utils.id("TOKEN_REGISTRAR_ROLE");
    let res = await contract.hasRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    if (res) {
        console.log("RegisterAddress already has TOKEN_REGISTRAR_ROLE", res);
        return
    }
    const tx = await contract.grantRole(ethers.utils.arrayify(TOKEN_REGISTRAR_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })

    if (typeof tx === 'undefined') {
        return;
    }
    const rec = await tx.wait(1);
    console.log("receipt: ", rec);
}

async function setMinterRole(minterAddr) {
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
    const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
    let res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    console.log("Completed: MinterAddress has MINTER_ROLE", res);
    if (res) {
        return
    }
    // ROlE and ADDRESS
    const tx = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    if (typeof tx === 'undefined') {
        return;
    }
    const rec = await tx.wait(1);
    console.log("receipt for MINTER_ROLE being granted: ", rec);
};

async function setBurnerRole(minterAddr) {
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
    const BURNER_ROLE = ethers.utils.id("BURNER_ROLE");

    let res = await token.hasRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    console.log("Completed: MinterAddress has BURNER_ROLE", res);
    if (res) {
        return
    }
    // ROlE and ADDRESS
    const tx = await token.grantRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr).then(result => {
        return result;
    }).catch(err => {
        console.log('debug ', err)
    })
    if (typeof tx === 'undefined') {
        return;
    }
    const rec = await tx.wait(1);
    console.log("receipt for BURNER_ROLE being granted: ", rec);
};

async function whiteListTokenOnL2() {

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

        let tx = await tokenManager.addERC20TokenByOwner(TARGET_CHAIN, tokenAddressFromOrigin, tokenAddressOnTarget).then(result => {
            return result
        }).catch(err => {
            console.log("whiteListTokenOnL2: Error: ", err)
        })

        if (typeof tx === 'undefined') {
            return;
        }

        res = await tx.wait(1).then(result => {
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
    //  await setTokenRegisterRole(ROLE_ADDRESS)
    await setMinterRole(schain_tokenManager)              // Grants roles to token manager
    await setBurnerRole(schain_tokenManager)              // Grants roles
    await whiteListTokenOnL2(TARGET_CHAIN)      // Select the Skale chain where the Token exists (Token Origin Skale Chain)

}

targetChainConfig();

