const ethers = require('ethers');
const abi = require('../abi/ima1.30.json');

const abi_m = require('../abi/marionette.json');

const abi_d = require('../abi/depositBox.json');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
//--------------------------------------ADJUST-----------------------------------||
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);


// does the MSW has any roles, does the marionette or etherbase has any roles 

//msw skale predeployed - chain owner
//const MSW_ADDRESS = '0xD244519000000000000000000000000000000000';

//marionette
//const MSW_ADDRESS = '0xD2c0DeFACe000000000000000000000000000000';

//etherbase
//const MSW_ADDRESS = '0xd2bA3e0000000000000000000000000000000000';

//Config controoler(zero) TokenManagerLinker(zero)
const MSW_ADDRESS = `0xCDeb7F7974D89Fd71089487D65AA9731d7E846F5`;

const roles = [
    'DEPLOYER_ADMIN_ROLE',
    'DEFAULT_ADMIN_ROLE',//communityPool, DepositBox, ima
    'CHAIN_CONNECTOR_ROLE',// ima
    'CONSTANT_SETTER_ROLE',//communityPool
    'LINKER_ROLE',//communityPool, depositBox
    'DEPOSIT_BOX_MANAGER_ROLE',// depositBox
    'EXTRA_CONTRACT_REGISTRAR_ROLE',
    'TOKEN_REGISTRAR_ROLE',// ima
    'AUTOMATIC_DEPLOY_ROLE',// ima
    'PUPPETEER_ROLE', // idk, maybe this allows the MSW to use Marrionette 
    'IMA_ROLE '
]


async function test() {

    console.log(MSW_ADDRESS)

    let res;

    const contract = new ethers.Contract(config.skale.message_proxy_chain_address, abi.message_proxy_chain_abi, accountOrigin);
    const etherbase = await contract.ETHERBASE();// Address
   
    // Print out the role hashes

    /*
    res = await contract.DEFAULT_ADMIN_ROLE()
    console.log("MessageProxy: DEFAULT_ADMIN_ROLE", res);

    res = await contract.CHAIN_CONNECTOR_ROLE()
    console.log("MessageProxy: CHAIN_CONNECTOR_ROLE(", res);

    res = await contract.CONSTANT_SETTER_ROLE()
    console.log("MessageProxy: CONSTANT_SETTER_ROLE", res);

    res = await contract.EXTRA_CONTRACT_REGISTRAR_ROLE()
    console.log("MessageProxy: EXTRA_CONTRACT_REGISTRAR_ROLE", res);

    res = await contract.MAINNET_HASH()
    console.log("MessageProxy: MAINNET_HASH ", res);

    */

    const ROLE = ethers.utils.id("DEFAULT_ADMIN_ROLE");

    const contract_EB = new ethers.Contract(etherbase, abi.message_proxy_chain_abi, accountOrigin);


    res = await contract_EB.hasRole(ethers.utils.arrayify(ROLE), MSW_ADDRESS);
    console.log("MSW : EB has role", res);


    //filestorage 
    const contract_FS = new ethers.Contract('0xD3002000000000000000000000000000000000d3', abi_m, accountOrigin);
    const ROLE_AR = ethers.utils.id("ALLOCATOR_ROLE");
    res = await contract_FS.hasRole(ethers.utils.arrayify(ROLE_AR), MSW_ADDRESS);
    console.log("MSW : Filestorage has role", res);


    //--Marionette
    const contract_M = new ethers.Contract('0xD2c0DeFACe000000000000000000000000000000', abi_m, accountOrigin);
    res = await contract_M.hasRole(ethers.utils.arrayify(ROLE), MSW_ADDRESS);
    console.log("MSW : Marionette has role", res);

    const ROLE_IMA = ethers.utils.id("IMA_ROLE");
    res = await contract_M.hasRole(ethers.utils.arrayify(ROLE_IMA), MSW_ADDRESS);
    console.log("MSW : Marionette has role(IMA_ROLE)", res);

    const ROLE_P = ethers.utils.id("PUPPETEER_ROLE");
    res = await contract_M.hasRole(ethers.utils.arrayify(ROLE_P), MSW_ADDRESS);
    console.log("MSW : Marionette has role(PUPPETEER_ROLE)", res);


    //--config cotroller
    const contract_CC = new ethers.Contract('0xD2002000000000000000000000000000000000D2', abi_m, accountOrigin);
    const ROLE_DA = ethers.utils.id("DEPLOYER_ADMIN_ROLE");
    res = await contract_CC.hasRole(ethers.utils.arrayify(ROLE_DA), MSW_ADDRESS);
    console.log("MSW : Config Controller has role(DEPLOYER_ADMIN_ROLE)", res);

    const ROLE_D = ethers.utils.id("DEPLOYER_ROLE");
    res = await contract_CC.hasRole(ethers.utils.arrayify(ROLE_D), MSW_ADDRESS);
    console.log("MSW : Config Controller has role(DEPLOYER_ROLE)", res);


    // token linker 
    const contract_TL = new ethers.Contract('0xD2aAA00800000000000000000000000000000000', abi.token_manager_linker_abi, accountOrigin);
    const ROLE_CC = ethers.utils.id("CHAIN_CONNECTOR_ROLE");
    res = await contract_TL.hasRole(ethers.utils.arrayify(ROLE_CC), MSW_ADDRESS);
    console.log("MSW : Token Linker has role(CHAIN_CONNECTOR_ROLE)", res);

    //TokenManagerLinker.connectSchain
    const ROLE_R = ethers.utils.id("REGISTRAR_ROLE");
    res = await contract_TL.hasRole(ethers.utils.arrayify(ROLE_R), MSW_ADDRESS);
    console.log("MSW : Token Linker has role(REGISTRAR_ROLE)", res);

     // token manager
     const contract_TM = new ethers.Contract('0xD2aAA00500000000000000000000000000000000', abi.token_manager_erc20_abi, accountOrigin);
     const ROLE_TR = ethers.utils.id("TOKEN_REGISTRAR_ROLE");
     res = await contract_TM.hasRole(ethers.utils.arrayify(ROLE_TR), MSW_ADDRESS);
     console.log("MSW : Token Manager has role(TOKEN_REGISTRAR_ROLE)", res);
 

}

async function testGoerli(){

    const contract = new ethers.Contract('0x2f4b31e661955d41bd6ab5530b117758c26c8159',abi_d , accountOrigin);

    const ROLE_AR = ethers.utils.id("DEFAULT_ADMIN_ROLE");
    let res = await contract.hasRole(ethers.utils.arrayify(ROLE_AR), MSW_ADDRESS);
    console.log("MSW : DepositBox has role", res);

}

async function run() {

    await test();

 //   await testGoerli();


}

run();