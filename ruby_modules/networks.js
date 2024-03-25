const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

async function selectNetworkChain(chainID) {
    let networkObject;
    //Europa
    if (chainID == 2046399126) {
        const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
        const wallet = new ethers.Wallet(credentials.account.privateKey);
        const account = wallet.connect(provider);
        networkObject = {
            init_signer: account,
            init_provider: provider,
            init_wallet: wallet
        }

    }
    //testnet fancy v2 deployment
    if (chainID == 2255010950618556) {
        const provider = new ethers.providers.JsonRpcProvider(config.rpc.staging_fancy);
        const wallet = new ethers.Wallet(credentials.account.privateKey);
        const account = wallet.connect(provider);
        networkObject = {
            init_signer: account,
            init_provider: provider,
            init_wallet: wallet
        }

    }
    //console.log(" Returning Network details", networkObject)
    return networkObject;
}

module.exports.selectNetworkChain = selectNetworkChain;