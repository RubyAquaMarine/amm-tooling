const fs = require('fs');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('./keys.json');
const lottery_abi = require('../abi/lotteryFactory.json');

const lottery = require('../ruby_modules/lottery.js')

//--------------------------------------ADJUST-----------------------------------||

const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);


const FACTORY = config.amm.factory;
const SS_LP = config.amm.fourPoolLP;
const SS_ADDRESS = config.amm.fourPool;
const RUBY = config.assets.europa.RUBY;
const USDP = config.assets.europa.USDP;


const LOTTERY_ADDRESS = config.amm.lotteryFactory;
const FILENAME = 'server/data/lottery.json';

/*

  - lottery factory contains all the previous and currect lottery SC addresses.  
  - if lotto_id = last.updated.lottery_id , do nothing, otherwise update the database
  - 


*/


async function testLotteryFactory() {


  let contract = new ethers.Contract(LOTTERY_ADDRESS, lottery_abi, account);

  let testCostOfTicket = await contract.costToBuyTickets(1);

  let value = ethers.utils.formatUnits(testCostOfTicket, 18);

  console.log("TEST Ticket cost ", value);

  const BURN_ADDRESS = await contract.getBurn();

  console.log("TEST BURN_ADDRESS", BURN_ADDRESS);

  // every lottery has a new address ( new smart contact)
  // const LOTTO_ADDRESS = await contract.getCurrentLotto();
  // console.log("TEST LOTTO_ADDRESS", LOTTO_ADDRESS);

  // make new contract using this address and get the values from that. --assuming atm
  // when does the lottery end? ui doesn't doesn't days yet

  const LOTTO_ID = await contract.getCurrentLottoryId();

  console.log("TEST  LOTTO_ID", LOTTO_ID.toString());

  // get past lottery addresses with the lottery_id .. loop extra. 
  let bob = [];
  for (let i = 0; i <= LOTTO_ID; i++) {
    bob[i] = await contract.getLotto(i);
  }



  console.log("TEST  LOTTO_address_id ", bob.toString());


  /*
    const TRES = await contract.getTreasury()
    console.log("TEST TRES", TRES);
    const RNG = await contract.getRNG()
    console.log("TEST RNG", RNG);
  */


  /*
    // after lottery has ended
    //check if ended
    const WN = await contract.getWinningNumbers()
    console.log("TEST WINNING NUMBERS", WN);
  */


}

async function saveLotteryAddresses() {
  const contract = new ethers.Contract(LOTTERY_ADDRESS, lottery_abi, account);
  const LOTTO_ID = await contract.getCurrentLottoryId();
  // get past lottery addresses with the lottery_id .. loop extra. 
  let bob = [];
  for (let i = 0; i <= LOTTO_ID; i++) {
    bob[i] = await contract.getLotto(i);
  }
  return bob;
}


async function saveLotteryData() {
  const contract = new ethers.Contract(LOTTERY_ADDRESS, lottery_abi, account);
  const LOTTO_ID = await contract.getCurrentLottoryId();
  // get past lottery addresses with the lottery_id .. loop extra. 
  let bob = [];
  let data = [];

  for (let i = 0; i <= LOTTO_ID; i++) {
    console.log("INDEX: ", i);
    bob[i] = await contract.getLotto(i);// gets the address of the lottery contract
    data[i] = await lottery.getLotteryData(LOTTERY_ADDRESS,bob[i],account,provider);//(rubyAddress, usdpAddress, factoryAddress, address, init_signer) 
  }
  console.log("INDEX DONE: ", data);
  return data;
}

async function writeTo(res) {
  // then write this object to the api file 
  let testThis = JSON.stringify(res)
  fs.writeFileSync(FILENAME, testThis);
  return "OK";
}

async function run() {
  let lotto_address = await saveLotteryAddresses();
  let obj = {
    lotteries: lotto_address
  }
  let x = await writeTo(obj);
  console.log("WROTE TO FILE: ", x)
}

async function runA() {
  let lotto_data = await saveLotteryData();

  console.log("WROTE TO FILE: starting")

  let obj = {
    lotteries: lotto_data
  }
  let x = await writeTo(obj);
  console.log("WROTE TO FILE: done ", x)
}


//run();
runA();