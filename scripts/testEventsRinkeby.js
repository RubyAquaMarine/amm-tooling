const ethers = require('ethers');
const config = require('./setConfig.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.mainnet;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

async function test() {
    const myAddress = account.address;
    // EVENTS FOR SKALE SCHAIN CONNECTIONS
    const tokenAddress = "0x5f578b8d60e8979ab17d356cd940f993672b9f28";// https://rinkeby.etherscan.io/address/0x5f578b8d60e8979ab17d356cd940f993672b9f28
   

    /*
        const abi = [
            "event Transfer(address indexed src, address indexed dst, uint val)"
        ];
    */

    const abi = [
        "event SchainCreated(string name, address owner, uint256 partOfNode, uint256 lifetime, uint256 numberOfNodes, uint256 deposit, uint16 nonce, bytes32 schainId, uint256 time, uint256 gasSpend)"
    ];


    const contract = new ethers.Contract(tokenAddress, abi, provider);

    //contract.listenerCount("")
    //   let value = await contract.filters.Transfer(myAddress)
    // 10439773 - 10463506
   // let value = await contract.queryFilter([13677362 ,13847999]);
    let value = await contract.queryFilter([10439773 ,10463506]);
   // console.log(value);

    value.forEach(block => {
       // console.log("block: ",  block.blockNumber);

        
        let obj = block.args
        if(obj instanceof Array){
            console.log("Find Schain name: ", obj.name)
        }
       // console.log("Find Schain name: ", obj)
        //console.log("Find Schain name: ", obj instanceof Array);
    })
}

function run() {
    test();
}
run();

//https://docs.ethers.io/v5/api/providers/provider/#Provider--event-methods
//https://github.com/ethers-io/ethers.js/blob/master/packages/contracts/src.ts/index.ts#L1082
//https://docs.ethers.io/v5/api/contract/contract/#Contract--events
//https://github.com/ethers-io/ethers.js/issues/492
// some sample code to learn
/*

const filter = {
        address: contractAddress,
        fromBlock: 0,
        toBlock: 10000,
        topics: [contract.interface.events.MyEvent.topic]
      };
      const logs = await provider.getLogs(filter);

*/


/*

let provider = new ethers.providers.JsonRpcProvider();
let iface = new ethers.utils.Interface(My.abi);

provider.getLogs({
    fromBlock: 7613948,
    toBlock: 7614777,
    address: exchangeAddress
}).then((result) => {
    let events = result.map((log) => iface.parseLog(log));
    events.forEach((e) => console.log(e));
}).catch((err) => {
    console.log(err)
});

*/

  /*
  {
    blockNumber: 13506527,
    blockHash: '0xe16bd0bbad26ed62480468eb3cb6c326c504f8602c6b5cd472ba60e4fe677712',
    transactionIndex: 225,
    removed: false,
    address: '0x0fCa003F483313869ee54e86B281348980B4cbf6',
    data: '0x00000000000000000000000000000000000000000000000000000000000001400000000000000000000000009f0d833c1c7cb9ac24c761eb7b2e1f763e59bb260000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000a8c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c37e1384093e39f12043f5a427c5400592b45824e3f812e500f6bbfbefbf08400000000000000000000000000000000000000000000000000000000617ac124000000000000000000000000000000000000000000000000000000000014608b000000000000000000000000000000000000000000000000000000000000000d706c61696e2d726f74616e657600000000000000000000000000000000000000',
    topics: [
      '0x5ef003bdff54f0d8daa1dbe28c2ed6d7272ff6a5242e0c20a6e33b6359d26669'
    ],
    transactionHash: '0xefc3e0f3b5663b011006ecfede4cf2fe8aeef6afeb7b02aed5fac1d681eaf1af',
    logIndex: 205,
    removeListener: [Function (anonymous)],
    getBlock: [Function (anonymous)],
    getTransaction: [Function (anonymous)],
    getTransactionReceipt: [Function (anonymous)],
    event: 'SchainCreated',
    eventSignature: 'SchainCreated(string,address,uint256,uint256,uint256,uint256,uint16,bytes32,uint256,uint256)',
    decode: [Function (anonymous)],
    args: [
      'plain-rotanev',
      '0x9F0d833C1c7cb9AC24C761eB7b2E1F763E59Bb26',
      [BigNumber],
      [BigNumber],
      [BigNumber],
      [BigNumber],
      0,
      '0x5c37e1384093e39f12043f5a427c5400592b45824e3f812e500f6bbfbefbf084',
      [BigNumber],
      [BigNumber],
      name: 'plain-rotanev',
      owner: '0x9F0d833C1c7cb9AC24C761eB7b2E1F763E59Bb26',
      partOfNode: [BigNumber],
      lifetime: [BigNumber],
      numberOfNodes: [BigNumber],
      deposit: [BigNumber],
      nonce: 0,
      schainId: '0x5c37e1384093e39f12043f5a427c5400592b45824e3f812e500f6bbfbefbf084',
      time: [BigNumber],
      gasSpend: [BigNumber]
    ]
  },
  */