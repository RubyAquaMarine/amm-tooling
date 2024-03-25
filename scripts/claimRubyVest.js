const ethers = require('ethers');
const vest = require('../ruby_modules/vesting.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const ADDR = '0x5021EC385a53c5245fCF8C2b48B0bfbc0CfD07BA';
const RUBY = config.assets.europa.RUBY;

async function testVest() {

   await vest.claimRubyFromVester(1,ADDR,RUBY,accountOrigin);

}

async function run() {

    await testVest();
}

run();