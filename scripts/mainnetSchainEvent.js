const ethers = require('ethers');

const config = require('../setConfig.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.l1;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

async function testPre_OneFourSizSix() {
    const myAddress = account.address;
    const tokenAddress = "0x0fca003f483313869ee54e86b281348980b4cbf6";
    // https://etherscan.io/address/0x0fca003f483313869ee54e86b281348980b4cbf6#events
    // https://etherscan.io/tx/0x5fffc8460f6467c454867e055480647effe346e7261fec5082b51f66e5ecf218
    // Since Skale V2 , Skale Manager contract no longer emits sChainCreated in the same format. Last chain name to register with this code is 
    // elegant-answer
    const abi = [
        "event SchainCreated(string name, address owner, uint256 partOfNode, uint256 lifetime, uint256 numberOfNodes, uint256 deposit, uint16 nonce, bytes32 schainId, uint256 time, uint256 gasSpend)"
    ];
    const contract = new ethers.Contract(tokenAddress, abi, provider);

    //contract.listenerCount("")
    //   let value = await contract.filters.Transfer(myAddress)
    let value = await contract.queryFilter([13677362, 14667231]);
    // console.log(value);

    value.forEach(block => {
        // console.log("block: ",  block.blockNumber);

        let obj = block.args
        if (obj instanceof Array) {
            console.log("Find Schain name: ", obj.name)
        }
        // console.log("Find Schain name: ", obj)
        //console.log("Find Schain name: ", obj instanceof Array);
    })
}
async function testPost_OneFourSizSix() {
    const myAddress = account.address;
    const tokenAddress = "0x0fca003f483313869ee54e86b281348980b4cbf6";
    // https://etherscan.io/address/0x0fca003f483313869ee54e86b281348980b4cbf6#events
    // https://etherscan.io/tx/0x5fffc8460f6467c454867e055480647effe346e7261fec5082b51f66e5ecf218
    // Since Skale V2 , Skale Manager contract no longer emits sChainCreated in the same format. Last chain name to register with this code is 
    // elegant-answer
    const abi = [
        "event SchainCreated(string name, address owner, uint256 partOfNode, uint256 lifetime, uint256 numberOfNodes, uint256 deposit, uint16 nonce, bytes32 schainId, uint256 time, uint256 gasSpend)"
    ];
    const contract = new ethers.Contract(tokenAddress, abi, provider);


    let value = await contract.queryFilter([14667231, 14770186]);
    // console.log(value);

    value.forEach(block => {
        // console.log("block: ",  block.blockNumber);

        let obj = block.args
        if (obj instanceof Array) {
            console.log("Find Schain name: ", obj.name)
        }
        // console.log("Find Schain name: ", obj)
        //console.log("Find Schain name: ", obj instanceof Array);
    })


}

async function run() {
    //  await testPre_OneFourSizSix()
    testPost_OneFourSizSix()
}
run();
