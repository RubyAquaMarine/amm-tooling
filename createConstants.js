const ethers = require('ethers');
const init_amm = require('./ruby_modules/init.js');
const getWallet = require('./ruby_modules/networks.js');
const config = require('./setConfig.json');
const user_utils = require('./ruby_modules/users.js');

// Create File here : refactor should allow Constants_${network}_${project}
const FILE_NAME = 'Constants.json';

async function checkRequest(chainID) {
    if (chainID == 2046399126) {
        console.log("Setup Europa Constants")
        await networkIsMainnet();
    }

    if (chainID == 2255010950618556) {
        console.log("Setup Testnet Constants")
        await networkIsTestnet();
    }

    console.error("COMPLETE: ready for collectData.js")
}

async function networkIsMainnet() {
    let res = await getWallet.selectNetworkChain(2046399126).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : selectNetworkChain ", err);
    })

    let test = await init_amm.initAMM(config.amm.subgraph_amm,
        config.amm.router,
        config.amm.rubyRouter,
        config.amm.stake, 
        config.amm.lotteryFactory, 
        config.amm.masterchef, 
        config.amm.factory, 
        config.amm.fourPool, 
        config.amm.fourPoolLP, 
        res?.init_signer).then(res => {
            return res;
        }).catch(err => {
            console.log("Error : initAMM ", err);
        })

    await user_utils.writeJsonFile(FILE_NAME, test).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeJsonFile ", err);
    })
}

async function networkIsTestnet() {
    let res = await getWallet.selectNetworkChain(2255010950618556).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : selectNetworkChain ", err);
    })

    let test = await init_amm.initAMM(config.ammv2.subgraph_amm,
        config.ammv2.router,
        config.ammv2.rubyRouter,
        config.ammv2.stake,
        config.ammv2.lotteryFactory,
        config.ammv2.masterchef,
        config.ammv2.factory,
        config.ammv2.fourPool,
        config.ammv2.fourPoolLP,
        res?.init_signer).then(res => {
            return res;
        }).catch(err => {
            console.log("Error : initAMM ", err);
        })

    await user_utils.writeJsonFile(FILE_NAME, test).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeJsonFile ", err);
    })
}


async function run() {
    const length = process.argv.length;
    console.error('Length =>', length);

    for (let i = 0; i < length; i++) {
        console.error('data[] ', process.argv[i]);
    }


    let customChain;
    if (process.argv.length === 2) {
        console.error('Default Network');
        customChain = 2046399126;// Europa
        // process.exit(1);
    } else if (process.argv.length == 4) {
        console.error('Custom Network');
        // check the value
        customChain = process.argv[3]; // any ChainID
    }

    console.log("ChainID Input: ", customChain)

    await checkRequest(customChain);
}

run();